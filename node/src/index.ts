// Import
import Keyring from '@polkadot/keyring';
import { AggregatorCurrentAnswer, PackingAnswer } from './aggregator';
import { verifier_contract } from './blockchain/contract';
import { LIST_SUBSTRATE_LOCAL_ADDRESS } from './blockchain/polkadot';
import { TOMLParse, sleep } from './helper';
import { connectInfra, middle_server } from './infra';
import { SYMBOL_LIST } from './price_source/symbol_list';
import { u8aToHex } from '@polkadot/util';
import { connectNode, node, node_answers } from './p2p/node';
import { node_config } from './config.load';
import { node_env } from './env.load';
import { TAnswerData } from './blockchain/contract/prophet_verifier';
import { KeyringPair } from '@polkadot/keyring/types';
var ip = require("ip");

export type TAnswerMessage = {
    answer: TAnswerData,
    public_key: string,
    signature: string,
    pair_id: number,
    type: "new_answer"
}

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
    broadcastAnswer(pair, public_key)
    submitAnswer(pair, public_key)
}

const broadcastAnswer = async (pair: KeyringPair, public_key: `0x${string}`) => {
    while (true) {
        for (let pair_id = 0; pair_id < SYMBOL_LIST.length; pair_id++) {
            const answer = await AggregatorCurrentAnswer(pair_id)
            let message = PackingAnswer(answer)
            let signature = u8aToHex(pair.sign(message))
            node.broadcast<TAnswerMessage>({ answer, public_key, signature, pair_id, type: "new_answer" })
        }
        await sleep(10000)
    }
}

const submitAnswer = async (pair: KeyringPair, public_key: `0x${string}`) => {
    while (true) {
        if (node.leader() === node.id) {
            node_answers
            for (let pair_id = 0; pair_id < node_answers.length; pair_id++) {
                if (node_answers[pair_id].length) { 
                    console.log(node_answers[pair_id][1])
                    // await verifier_contract.transmitProcess(LIST_SUBSTRATE_LOCAL_ADDRESS.Alice, pair_id, [public_key], [answer], [signature])
                }
            }
        }
        await sleep(2000)
    }
}

start()