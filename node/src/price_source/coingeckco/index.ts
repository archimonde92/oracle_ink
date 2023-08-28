import { randomItem } from "../../helper"
import { TFetchFunction, TGetPrice } from "../price_source.type"
import { SYMBOL_LIST, checkInSymbolList } from "../symbol_list"

const COINGECKO_API_URL = [
    "https://api.coingecko.com/",
]

const fetchCoingeckoPrice: TFetchFunction = async (pair_id: number, try_times: number, price: number) => {
    const url = randomItem(COINGECKO_API_URL) + `api/v3/simple/price?ids=${SYMBOL_LIST[pair_id].coingecko}&vs_currencies=usd`
    try {
        let raw_data = await fetch(url)
        let data = await raw_data.json() as any
        price = Number(data[SYMBOL_LIST[pair_id].coingecko]["usd"])
    } catch (e) {
        try_times++
        console.log(`Fail to fetch price from ${url}. Try again!`)
    }
    return {
        price,
        try_times,
    }
}

export {
    fetchCoingeckoPrice
}