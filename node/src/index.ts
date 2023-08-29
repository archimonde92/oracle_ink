// Import
import Keyring from '@polkadot/keyring';
import { AggregatorCurrentAnswer, PackingAnswer } from './aggregator';
import { verifier_contract } from './blockchain/contract';
import { LIST_SUBSTRATE_LOCAL_ADDRESS } from './blockchain/polkadot';
import { sleep } from './helper';
import { connectInfra } from './infra';
import { SYMBOL_LIST } from './price_source/symbol_list';
import { u8aToHex } from '@polkadot/util';

const start = async () => {
    await connectInfra()
    const mnemonic = "summer olive run luggage various cancel foam guard aim stem amused genius";
    const keyring = new Keyring({ type: 'sr25519' });
    const pair = keyring.addFromUri(mnemonic, { name: 'first pair' }, "ethereum");
    const public_key = u8aToHex(pair.publicKey)
    while (true) {
        for (let pair_id = 0; pair_id < SYMBOL_LIST.length; pair_id++) {
            const answer = await AggregatorCurrentAnswer(pair_id)
            try {
                let message = PackingAnswer(answer)
                let signature = u8aToHex(pair.sign(message))
                await verifier_contract.transmitProcess(LIST_SUBSTRATE_LOCAL_ADDRESS.Alice, pair_id, [public_key], [answer], [signature])
            } catch (e) {
                console.log(e)
            }
            console.log(`New answer of #${pair_id} updated!`)
            console.log(answer)
        }
        await sleep(30000)
    }

}

start()