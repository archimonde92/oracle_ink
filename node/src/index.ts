// Import
import { AggregatorCurrentAnswer } from './aggregator';
import { verifier_contract } from './blockchain/contract';
import { LIST_SUBSTRATE_LOCAL_ADDRESS } from './blockchain/polkadot';
import { sleep } from './helper';
import { connectInfra } from './infra';
import { SYMBOL_LIST } from './price_source/symbol_list';

const start = async () => {
    await connectInfra()
    while (true) {
        for (let pair_id = 0; pair_id < SYMBOL_LIST.length; pair_id++) {
            const answer = await AggregatorCurrentAnswer(pair_id)
            try {
                await verifier_contract.transmitProcess(LIST_SUBSTRATE_LOCAL_ADDRESS.Alice, pair_id, [answer], ["0x0000000000000000000000000000000000000000000000000000000000000000"])
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