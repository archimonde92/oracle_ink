import { AggregatorCurrentAnswer } from "./aggregator"
import { priceSource } from "./price_source"

const test = async () => {
    for (let pair_id = 0; pair_id < 2; pair_id++) {
        AggregatorCurrentAnswer(pair_id)
    }
}

test()