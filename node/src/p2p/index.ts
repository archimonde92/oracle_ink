import EventEmitter from 'events'
import net from "net"

type TSocket = net.Socket
type TUuid = string
type TNodeOption = {
    is_leader: boolean
}
type TNodeIp = string
type TNodePort = number
type ETransferDataType = "handshake" | "message" | "ping"
type TTransferData = {
    type: ETransferDataType
    data: any
}
type EDataPacketType = "broadcast" | "direct" | "node_sync" | "node_down" | "leader_change" | "leader_sync" | "leader_down" | "ping" | "pong"
type TDataPacket = {
    id: TUuid,
    ttl: number,
    type: EDataPacketType,
    message: any,
    origin: TUuid,
    destination?: TUuid
}

const handleRawData = (data: string) => {
    let split_data = data.split("}{")

    split_data = split_data.length > 1
        ? split_data.map((el, index) => index === 0
            ? el + "}"
            : index !== split_data.length - 1
                ? "{" + el + "}"
                : "{" + el)
        : split_data
    let final_data = split_data.map(el => {
        try {
            const parse_data = JSON.parse(el)
            return parse_data
        } catch (e) {
            console.log(`Fail to parse ${el}`)
            console.log({ data_raw: data })
            return null
        }
    })
    return final_data as any[]
}

const random4DigitHex = () => Math.random().toString(16).split('.')[1].substr(0, 4);
const randomUuid = () => new Array(8).fill(0).map(() => random4DigitHex()).join('-');
const createNode = (options: TNodeOption = { is_leader: false }) => {
    // Layer 1 - handle all the established connections, store
    // them in a map and emit corresponding events
    const connections = new Map<TUuid, TSocket>();
    const emitter = new EventEmitter();

    // Handle all TCP connections same way, no matter
    // if it's incoming or out coming, we're p2p
    const handleNewSocket = (socket: TSocket) => {
        const connectionId = randomUuid();
        connections.set(connectionId, socket);
        emitter.emit('_connect', connectionId);

        //Reproduce new message to local node
        socket.on('data', (data) => {
            const final_data = handleRawData(data.toString())
            if (final_data) {
                for (const message of final_data) {
                    emitter.emit("_message", { connectionId, message })
                }
            }
        })

        socket.on('close', () => {
            connections.delete(connectionId);
            emitter.emit('_disconnect', connectionId);
        });

    };

    // Create a server itself and make it able to handle
    // all new connections and put the to the connections map
    const server = net.createServer((socket) => handleNewSocket(socket));

    // A method to "raw" send data by the connection ID
    // intended to internal use only
    const _send = (connectionId: TUuid, data: TTransferData) => {
        const socket = connections.get(connectionId);
        if (!socket) {
            throw new Error(`Attempt to send data to connection that does not exist ${connectionId}`);
        }
        // Data will receive at socket.on("data")
        socket.write(JSON.stringify(data))
    };

    // A method for the libabry consumer to
    // establish connection to other nodes
    const connect = async (ip: TNodeIp, port: TNodePort, cb: any) => {
        return new Promise<{ is_success: boolean, message: string, destroy: ((cb: any) => net.Socket) | null, error: any }>((res, rej) => {
            try {
                const socket = new net.Socket();
                socket.connect(port, ip, () => {
                    handleNewSocket(socket);
                    cb && cb();
                });

                socket.on("connect", () => {
                    res(
                        {
                            destroy: (cb: any) => socket.destroy(cb),
                            message: "Success",
                            is_success: true,
                            error: null
                        }
                    )
                })

                socket.on("error", (e) => {
                    res(
                        {
                            destroy: (cb: any) => socket.destroy(cb),
                            message: "Failed to connect",
                            error: e,
                            is_success: false
                        }
                    )
                })
            } catch (e) {
                rej(e)
            }
        })

    };

    // A method to actually start the server
    const listen = (port: TNodePort, cb) => {
        server.listen(port, '0.0.0.0', cb);

        return (cb: any) => server.close(cb);
    };

    // One method to close all open connections
    // and server itself
    const close = (cb: any) => {
        for (let [connectionId, socket] of connections) {
            socket.destroy();
        }

        server.close(cb);
    };

    //
    // Layer 2 - create Nodes, assign IDs, handshake
    // and keep neighbors in a collection
    //
    const NODE_ID = randomUuid();
    console.log({ NODE_ID })
    const neighbors = new Map();
    const neighbor_active_tracking = new Map()
    const all_nodes = new Map<TUuid, null>()
    let leader: TUuid | null = null
    let is_ready = false


    const addNewNodes = (node_ids: TUuid[]) => {
        for (let node_id of node_ids) {
            if (!all_nodes.has(node_id)) {
                all_nodes.set(node_id, null)
            }
        }
        if (leader === NODE_ID && all_nodes.size >= 3) {
            // setTimeout(() => { emitter.emit("_message", "test") }, 3000)
        }
    }

    const removeNodes = (node_ids: TUuid[]) => {
        for (let node_id of node_ids) {
            if (all_nodes.has(node_id)) {
                all_nodes.delete(node_id)
            }
        }
    }

    const _randomSelectNewLeader = () => {
        const node_id_array = Array.from(all_nodes.keys()).filter(el => el !== leader)
        if (node_id_array.length > 0) {
            const random_index = Math.floor(Math.random() * node_id_array.length)
            const new_leader = node_id_array[random_index]
            setLeader(new_leader)
            return new_leader
        }
        setLeader(NODE_ID)
        return NODE_ID
    }

    const changeLeader = () => {
        if (leader === NODE_ID) {
            leaderChange(_randomSelectNewLeader())
        }
    }

    const setLeader = (new_lead_node_id: TUuid) => {
        console.log(`New leader = ${new_lead_node_id}`)
        leader = new_lead_node_id
    }




    // A helper to find node id by connection id
    const findNodeId = (connectionId: TUuid) => {
        for (let [nodeId, $connectionId] of neighbors) {
            if (connectionId === $connectionId) {
                return nodeId;
            }
        }
    };

    // Once connection is established, send the handshake message
    emitter.on('_connect', (connectionId: TUuid) => {
        _send(connectionId, { type: 'handshake', data: { nodeId: NODE_ID } });
    });

    // On message we check whether it's a handshake and add
    // the node to the neighbors list
    emitter.on('_message', ({ connectionId, message }) => {
        const { type, data } = message as TTransferData;

        if (type === 'handshake') {
            const { nodeId } = data;
            neighbors.set(nodeId, connectionId);
            addNewNodes([nodeId])
            syncNode()
            syncLeader()
            emitter.emit('connect', { nodeId });
        }

        if (type === 'message') {
            const nodeId = findNodeId(connectionId);
            if (nodeId) {
                emitter.emit('message', { nodeId, data });
            } else {
                console.log(`${nodeId} not found!`)
            }
        }

        if (type === "ping") {

        }
    });

    emitter.on('_disconnect', (connectionId: TUuid) => {
        const nodeId = findNodeId(connectionId);
        if (nodeId === leader) {
            LeaderDie()
        }
        neighbors.delete(nodeId);
        neighbor_active_tracking.delete(nodeId);
        removeNodes([nodeId])
        nodeDown(nodeId)
        emitter.emit('disconnect', { nodeId });
    });

    // Finally we send data to the node
    // by finding it's connection and using _send
    const send = (nodeId: TUuid, data: any) => {
        const connectionId = neighbors.get(nodeId);

        // TODO handle no connection id error
        _send(connectionId, { type: 'message', data });
    };

    //
    // Layer 3 - here we can actually send data OVER
    // other nodes by doing recursive broadcast
    //
    const alreadySeenMessages = new Set();

    // A method to send packet to other nodes (all neightbors)
    const sendPacket = (packet: TDataPacket) => {
        if (!alreadySeenMessages.has(packet.id) || packet.ttl < 1) {
            alreadySeenMessages.add(packet.id);
        }
        for (const $nodeId of neighbors.keys()) {
            if (packet.origin != $nodeId) {
                send($nodeId, packet);
            }
        }
    };
    const sendPrivatePacket = (packet: TDataPacket) => {
        if (!alreadySeenMessages.has(packet.id) || packet.ttl < 1) {
            alreadySeenMessages.add(packet.id);
        }
        for (const $nodeId of neighbors.keys()) {
            if (packet.destination && packet.destination == $nodeId && packet.origin != $nodeId) {
                send($nodeId, packet);
            }
        }
    };
    // 2 methods to send data either to all nodes in the network
    // or to a specific node (direct message)
    const broadcast = <TMessage>(message: TMessage, id = randomUuid(), origin = NODE_ID, ttl = 255) => {
        sendPacket({ id, ttl, type: 'broadcast', message, origin });
    };

    const syncNode = (id = randomUuid(), origin = NODE_ID, ttl = 255) => {
        const nodes = Array.from(all_nodes.keys())
        if (nodes.length > 2) {
            sendPacket({ id, ttl, type: 'node_sync', message: nodes, origin });
        }
    };

    const syncLeader = (id = randomUuid(), origin = NODE_ID, ttl = 255) => {
        if (leader) {
            sendPacket({ id, ttl, type: 'leader_sync', message: leader, origin });
        }
    };

    const LeaderDie = () => {
        const nodes = Array.from(all_nodes.keys()).filter(node => node !== leader)
        nodes.sort()
        if (neighbors.has(leader)) neighbors.delete(leader)
        if (nodes[0] === NODE_ID && leader != NODE_ID) {
            setLeader(NODE_ID)
            syncLeader()
        }
    }

    const ping = (id = randomUuid(), origin = NODE_ID, ttl = 255) => {
        const send_time = +new Date()
        for (let node_id of neighbors.keys()) {
            if (!neighbor_active_tracking.has(node_id)) {
                neighbor_active_tracking.set(node_id, send_time)
            }
        }
        sendPacket({ id, ttl, type: 'ping', message: { from: NODE_ID, create_at: send_time }, origin });
    }

    const pong = (message: { from: string, create_at: number }, id = randomUuid(), origin = NODE_ID, ttl = 255) => {
        sendPrivatePacket({ id, ttl, type: 'pong', message: { from: NODE_ID, create_at: message.create_at, response_at: +new Date() }, origin, destination: message.from });
    }

    const notiLeaderDown = (origin = NODE_ID, ttl = 255) => {
        console.log(`LeaderDown`)
        sendPacket({ id: leader + "down", ttl, type: 'leader_down', message: leader, origin });
    }


    const nodeDown = (node_id: TUuid, id = randomUuid(), origin = NODE_ID, ttl = 255) => {
        sendPacket({ id, ttl, type: 'node_down', message: node_id, origin });
    };

    const leaderChange = (new_leader: TUuid, id = randomUuid(), origin = NODE_ID, ttl = 255) => {
        sendPacket({ id, ttl, type: 'leader_change', message: new_leader, origin });
    };

    const direct = (destination: TUuid, message: any, id = randomUuid(), origin = NODE_ID, ttl = 255) => {
        sendPacket({ id, ttl, type: 'direct', message, destination, origin });
    };

    // Listen to all packets arriving from other nodes and
    // decide whether to send them next and emit message
    emitter.on('message', ({ nodeId, data }) => {
        if (!data) return
        let packet: TDataPacket = data
        // First of all we decide, whether this message at
        // any point has been send by us. We do it in one
        // place to replace with a strategy later TODO
        if (alreadySeenMessages.has(packet.id) || packet.ttl < 1) {
            return;
        } else {
            alreadySeenMessages.add(packet.id);
        }

        // Let's pop up the broadcast message and send it
        // forward on the chain
        if (packet.type === 'broadcast') {
            emitter.emit('broadcast', { message: packet.message, origin: packet.origin });
            broadcast(packet.message, packet.id, packet.origin, packet.ttl - 1);
        }
        if (packet.type === 'node_sync') {
            console.log(`Sync new nodes ...`)
            addNewNodes(packet.message)
            is_ready = true
            syncNode(packet.id, packet.origin, packet.ttl - 1);
        }
        if (packet.type === 'node_down') {
            removeNodes([packet.message])
            nodeDown(packet.message, packet.id, packet.origin, packet.ttl - 1);
        }
        if (packet.type === 'leader_change') {
            setLeader(packet.message)
            leaderChange(packet.message, packet.id, packet.origin, packet.ttl - 1);
        }
        if (packet.type === 'leader_sync') {
            console.log(packet)
            if (leader !== packet.message) {
                setLeader(packet.message)
            }
        }
        if (packet.type === 'leader_down') {
            console.log(`${packet.message} leader_down!`)
            LeaderDie()
            notiLeaderDown()
        }
        if (packet.type === 'ping') {
            pong(packet.message)
        }
        if (packet.type === 'pong') {
            const message = packet.message as {
                from: string,
                create_at: number,
                response_at: number
            }
            // console.log(`ping to ${packet.origin} response time=${message.response_at - message.create_at} ms`)
            neighbor_active_tracking.set(packet.origin, message.response_at)
        }

        // If the peer message is received, figure out if it's
        // for us and send it forward if not
        if (packet.type === 'direct') {
            if (packet.destination === NODE_ID) {
                emitter.emit('direct', { origin: packet.origin, message: packet.message });
            } else {
                if (packet.destination) {
                    direct(packet.destination, packet.message, packet.id, packet.origin, packet.ttl - 1);
                }
            }
        }
    });

    addNewNodes([NODE_ID])
    if (options.is_leader) {
        setLeader(NODE_ID)
        is_ready = true
    }
    const TIME_OUT_LIMIT = 10000
    const scanPing = () => {
        const scan_time = +new Date()
        for (let [node_id, last_active_at] of neighbor_active_tracking.entries()) {
            if (scan_time - last_active_at > TIME_OUT_LIMIT) {
                console.log(`${node_id} die!`)
                if (node_id === leader) {
                    notiLeaderDown()
                }
            }
        }
    }
    setInterval(() => {
        ping()
        scanPing()
    }, 1000)

    return {
        listen, connect, close,
        broadcast, direct, ping,
        on: emitter.on.bind(emitter),
        off: emitter.off.bind(emitter),
        id: NODE_ID,
        neighbors: () => neighbors.keys(),
        nodes: () => Array.from(all_nodes.keys()),
        leader: () => leader,
        changeLeader,
        is_ready: () => is_ready,
    };
};

export { createNode }
