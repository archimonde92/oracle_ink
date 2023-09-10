// Import
import Keyring from '@polkadot/keyring';
import { KeyringPair } from '@polkadot/keyring/types';
import { u8aToHex } from '@polkadot/util';
import { AggregatorCurrentAnswer, PackingAnswer } from './aggregator';
import { TAnswerData } from './blockchain/contract/prophet_verifier';
import { node_env } from './env.load';
import { sleep } from './helper';
import { connectInfra, middle_server } from './infra';
import { node, node_answers } from './p2p/node';
import { SYMBOL_LIST } from './price_source/symbol_list';
import { DEFAULT_HEARTBEAT } from './default';
import { verifier_contract } from './blockchain/contract';
import { LIST_SUBSTRATE_LOCAL_ADDRESS } from './blockchain/polkadot';

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
    const address_pair = keyring.addFromUri(mnemonic, { name: 'first pair' }, "ethereum");
    const public_key = u8aToHex(address_pair.publicKey)
    broadcastAnswer(address_pair, public_key)
    submitAnswer(address_pair)
}

const broadcastAnswer = async (address_pair: KeyringPair, public_key: `0x${string}`) => {
    while (true) {
        for (let pair_id = 0; pair_id < SYMBOL_LIST.length; pair_id++) {
            const answer = await AggregatorCurrentAnswer(pair_id)
            let message = PackingAnswer(answer)
            let signature = u8aToHex(address_pair.sign(message))
            const answer_msg: TAnswerMessage = { answer, public_key, signature, pair_id, type: "new_answer" }
            node.broadcast<TAnswerMessage>(answer_msg)
            node.addNewAnswer(answer_msg)
        }
        await sleep(DEFAULT_HEARTBEAT)
    }
}

const submitAnswer = async (address_pair: KeyringPair) => {
    while (true) {
        if (node.leader() === node.id) {
            for (let pair_id = 0; pair_id < node_answers.length; pair_id++) {
                if (node_answers[pair_id].length) {
                    const round_id = node_answers[pair_id].length - 1
                    const answer_count = node_answers[pair_id][round_id].length
                    if (answer_count > (node.nodes().length / 2)) {
                        const public_keys = node_answers[pair_id][round_id].map(el => el.public_key)
                        const answers = node_answers[pair_id][round_id].map(el => el.answer)
                        const signatures = node_answers[pair_id][round_id].map(el => el.signature)
                        const data = await verifier_contract.readTransmitProcess(LIST_SUBSTRATE_LOCAL_ADDRESS.Alice.address, pair_id, public_keys, answers, signatures)
                        if (data === "Ok") {
                            console.log(`transmiting pair ${pair_id} at round ${round_id} ...`)
                            await verifier_contract.transmitProcess(LIST_SUBSTRATE_LOCAL_ADDRESS.Alice, pair_id, public_keys, answers, signatures)
                            node.clearAnswer(pair_id, round_id)
                        }
                    }

                }
            }
        }
        await sleep(2000)
    }
}

start()