// Import
import Keyring from '@polkadot/keyring';
import { AggregatorCurrentAnswer, PackingAnswer } from './aggregator';
import { verifier_contract } from './blockchain/contract';
import { LIST_SUBSTRATE_LOCAL_ADDRESS } from './blockchain/polkadot';
import { TOMLParse, sleep } from './helper';
import { connectInfra, middle_server } from './infra';
import { SYMBOL_LIST } from './price_source/symbol_list';
import { u8aToHex } from '@polkadot/util';
import { connectNode, node } from './p2p/node';
import { node_config } from './config.load';
import { node_env } from './env.load';
var ip = require("ip");

const start = async () => {
    const my_port = Number(process.argv[2] || 5000);
    await connectInfra({ node_port: my_port })
    const my_ip = ip.address()
    await middle_server.newNode(node.id, my_ip, my_port)
    const all_current_node = (await middle_server.getNodes()).filter(el => el.id !== node.id)
    for (let other_node of all_current_node) {
        const { ip, port } = other_node
        if (ip === my_ip && port === my_port) {
            await middle_server.deleteNode(other_node.id)
        } else {
            try {
                const connect_result = await node.connect(ip, port, () => {
                    console.log(`Connection to ${ip}:${port} established.`);
                })
                if (connect_result.is_success) break;
                throw connect_result.error
            } catch (e) {
                console.log(`Failed to connect to node at ${ip}:${port}`)
            }
        }
    }



    const mnemonic = node_env.wallet_mnemonic
    const keyring = new Keyring({ type: 'sr25519' });
    const pair = keyring.addFromUri(mnemonic, { name: 'first pair' }, "ethereum");
    const public_key = u8aToHex(pair.publicKey)

    while (true) {
        for (let pair_id = 0; pair_id < SYMBOL_LIST.length; pair_id++) {
            // const answer = await AggregatorCurrentAnswer(pair_id)
            // let message = PackingAnswer(answer)
            // let signature = u8aToHex(pair.sign(message))
            // node.broadcast({ answer, public_key, signature })

            // try {
            //     await verifier_contract.transmitProcess(LIST_SUBSTRATE_LOCAL_ADDRESS.Alice, pair_id, [public_key], [answer], [signature])
            // } catch (e) {
            //     console.log(e)
            // }
            // console.log(`New answer of #${pair_id} updated!`)
            console.log(node.leader())
            node.changeLeader()
        }
        await sleep(10000)
    }

}

start()