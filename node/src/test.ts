import { support } from "@polkadot/types/interfaces/definitions"
import { connectListContract, verifier_contract } from "./blockchain/contract"
import { LIST_SUBSTRATE_LOCAL_ADDRESS, connectPolkadot } from "./blockchain/polkadot"
import { connectInfra } from "./infra"
import { AggregatorCurrentAnswer } from "./aggregator"
import { loadConfig, node_config } from "./config.load"
import { loadEnv } from "./env.load"
import { SYMBOL_LIST, getDeviationPercent } from "./price_source/symbol_list"
import { randomNumber } from "./helper"

const test = async () => {
    const origin = 10000 * (10 ** SYMBOL_LIST[0].decimal)
    for (let i = 0; i < 10; i++) {
        const random_value = getDeviationPercent(randomNumber(-SYMBOL_LIST[0].deviation / 2000, SYMBOL_LIST[0].deviation / 2000, 1))
        console.log({ origin, random_value_origin: random_value * origin + origin, random_value })
    }
    // await loadConfig()
    // await loadEnv()
    // await connectPolkadot(node_config.blockchain.provider)
    // await connectListContract()
    // console.log(await AggregatorCurrentAnswer(0))
}




test()