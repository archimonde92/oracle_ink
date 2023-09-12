import { connectListContract } from "./blockchain/contract"
import { connectPolkadot } from "./blockchain/polkadot"
import { loadConfig, node_config } from "./config.load"
import { loadEnv } from "./env.load"
import { createMiddleServer } from "./middle_server"
import { connectNode } from "./p2p/node"
let middle_server: Awaited<ReturnType<typeof createMiddleServer>>
type TInfraOption = {
    node_port: number
}


const connectInfra = async (options: TInfraOption) => {
    await loadConfig()
    await loadEnv()
    await connectPolkadot(node_config.blockchain.provider)
    await connectListContract()
    middle_server = await createMiddleServer()
    const all_current_node = await middle_server.getNodes()
    await connectNode(options.node_port, !all_current_node.length ? true : false)
}

export {
    connectInfra,
    middle_server
}