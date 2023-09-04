import { createNode } from ".";
import { middle_server } from "../infra";
let node: ReturnType<typeof createNode>


// After that we create the node, run it and let user
// know how to connect to other nodes and send messages

const connectNode = (port: number, is_leader: boolean) => {
    node = createNode({ is_leader });

    // Start local node and print help
    node.listen(port, () => {
        console.log(`Prophet node is up at port ${port}.`);
        console.log(``);

        node.on('connect', ({ nodeId }) => {
            console.log(`New node connected: ${nodeId}`);
        });

        node.on('disconnect', ({ nodeId }) => {
            console.log(`Node disconnected: ${nodeId}`);
        });

        node.on('error', (error) => {
            console.log(`Node disconnected: ${error}`);
        });

        node.on('broadcast', ({ message }) => {
            console.log(message)
        });
    });

    // Handle CTRL C to gracefully shut everything down
    process.on('SIGINT', async () => {
        console.log("\nGracefully shutting chat node down...");
        await middle_server.deleteNode(node.id)
        node.close(() => {
            process.exit();
        });
    });
}

export { connectNode, node }