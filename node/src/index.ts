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
import { verifier_contract } from './blockchain/contract';
import { getAccountBalance } from './blockchain/polkadot';
import { node_config } from './config.load';
import { CronJob } from 'cron'

var ip = require("ip");

export type TAnswerMessage = {
    answer: TAnswerData,
    public_key: string,
    signature: string,
    pair_id: number,
    type: "new_answer"
}

export type TSentAnswerMessage = {
    pair_id: number,
    round_id: number
    type: "sent_answer"
}

const start = async () => {
    // const my_port = 5000;
    await connectInfra({ node_port: 5000 })
    const my_port = node_config.node.port;
    const my_ip = node_config.node.external_ip
    await middle_server.newNode(node.id, my_ip, my_port)
    const all_current_node = (await middle_server.getNodes()).filter(el => el.id !== node.id)
    const all_current_node_not_have_same_ip_and_port = all_current_node.filter(el => !(el.id === node.id || (el.ip === my_ip && el.port === my_port)))
    let is_connect_to_one_node = false
    for (let other_node of all_current_node) {
        const { ip, port } = other_node
        if (ip === my_ip && port === my_port) {
            await middle_server.deleteNode(other_node.id)
        } else {
            try {
                const connect_result = await node.connect(ip, port, () => {
                    console.log(`Connection to ${ip}:${port} established.`);
                })
                if (connect_result.is_success) is_connect_to_one_node = true;
                throw connect_result.error
            } catch (e) {
                console.log(`Failed to connect to node at ${ip}:${port}`)
            }
        }
    }
    if ((all_current_node_not_have_same_ip_and_port.length > 0 && is_connect_to_one_node) || all_current_node_not_have_same_ip_and_port.length == 0) {
        const mnemonic = node_env.wallet_mnemonic
        const keyring = new Keyring({ type: 'sr25519' });
        const send_address_pair = keyring.addFromUri(mnemonic, { name: 'first pair' }, "sr25519");
        const sign_address_pair = keyring.addFromUri(mnemonic, { name: 'first pair' }, "ethereum");
        const public_key = u8aToHex(sign_address_pair.publicKey)

        broadcastAnswer(sign_address_pair, public_key)
        submitAnswer(send_address_pair)
    } else {
        console.log(`Cannot connect to the prophet oracle`)
    }
}

const broadcastAnswer = async (sign_address_pair: KeyringPair, public_key: `0x${string}`) => {
    let job = new CronJob("*/2 * * * *", async () => {
        for (let pair_id = 0; pair_id < SYMBOL_LIST.length; pair_id++) {
            const answer = await AggregatorCurrentAnswer(pair_id)
            let message = PackingAnswer(answer)
            let signature = u8aToHex(sign_address_pair.sign(message))
            const answer_msg: TAnswerMessage = { answer, public_key, signature, pair_id, type: "new_answer" }
            node.broadcast<TAnswerMessage>(answer_msg)
            node.addNewAnswer(answer_msg)
        }
    })
    job.start()
}

const submitAnswer = async (send_address_pair: KeyringPair) => {
    try {
        while (true) {
            if (node.leader() === node.id) {
                const account_balance = await getAccountBalance(send_address_pair.address)
                if (BigInt(account_balance) < BigInt(10000000000)) {
                    console.log(`Balance too small cannot be leader`)
                    node.changeLeader()
                } else {
                    for (let pair_id = 0; pair_id < node_answers.length; pair_id++) {
                        if (node_answers[pair_id].length) {
                            const round_id = node_answers[pair_id].length - 1
                            const answer_count = node_answers[pair_id][round_id].length
                            if (answer_count > (node.nodes().length / 2) && !node.isSentAnswer(pair_id, round_id)) {
                                const public_keys = node_answers[pair_id][round_id].map(el => el.public_key)
                                const answers = node_answers[pair_id][round_id].map(el => el.answer)
                                const signatures = node_answers[pair_id][round_id].map(el => el.signature)
                                const data = await verifier_contract.readTransmitProcess(send_address_pair.address, pair_id, public_keys, answers, signatures)
                                // const data = "Ok"
                                if (data === "Ok") {
                                    console.log(`transmitting pair ${pair_id} at round ${round_id} ...`)
                                    await verifier_contract.transmitProcess(send_address_pair, pair_id, public_keys, answers, signatures)
                                    node.clearAnswer(pair_id, round_id)
                                    node.broadcast<TSentAnswerMessage>({ type: "sent_answer", pair_id, round_id })
                                    await sleep(2000)
                                    node.changeLeader()
                                } else {
                                    console.log(`Cannot transmit ...`)
                                    console.log(data)
                                }
                            }

                        }
                    }
                }
            }
            await sleep(2000)
        }
    } catch (e) {
        console.log(`error when submit answer`)
        node.changeLeader()
    } finally {
        submitAnswer(send_address_pair)
    }
}

start()