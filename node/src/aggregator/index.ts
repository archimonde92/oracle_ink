import BigNumber from "bignumber.js"
import { storage_contract } from "../blockchain/contract"
import { TAnswerData } from "../blockchain/contract/prophet_verifier"
import { LIST_SUBSTRATE_LOCAL_ADDRESS } from "../blockchain/polkadot"
import { avg, randomNumber } from "../helper"
import { SOURCE_LIST, priceSource } from "../price_source"
import { SYMBOL_LIST, getDeviationPercent } from "../price_source/symbol_list"

const AggregatorCurrentAnswer: (pair_id: number) => Promise<TAnswerData> = async (pair_id: number) => {
    if (!storage_contract) throw new Error("Must connect storage contract first")
    const price_list: number[] = []
    for (let source of SOURCE_LIST) {
        const price = await priceSource(pair_id)[source]()
        if (price) {
            price_list.push(price)
        }
    }
    const latest_answer = await storage_contract.getLatestAnswer(LIST_SUBSTRATE_LOCAL_ADDRESS.Alice.address, pair_id)
    const randomValue = getDeviationPercent(randomNumber(-SYMBOL_LIST[0].deviation / 2000, SYMBOL_LIST[0].deviation / 2000, 1))
    const answer: TAnswerData = {
        value: Math.floor(avg(price_list) * (10 ** SYMBOL_LIST[pair_id].decimal) * (1 + randomValue)),
        decimal: SYMBOL_LIST[pair_id].decimal,
        roundId: (latest_answer?.roundId || 0) + 1,
        timestamp: Math.floor(+new Date() / 1000)
    }
    return answer
}

const PackingAnswer = (data: TAnswerData) => {
    const hex = new BigNumber(data.timestamp)
        .plus(new BigNumber(data.decimal).multipliedBy(new BigNumber(10).pow(11)))
        .plus(new BigNumber(data.roundId).multipliedBy(new BigNumber(10).pow(13)))
        .plus(new BigNumber(data.value).multipliedBy(new BigNumber(10).pow(23)))
        .toString(16)

    const message = "0x" + hex.padStart(32, "0")
    return message
}

export {
    AggregatorCurrentAnswer,
    PackingAnswer
}