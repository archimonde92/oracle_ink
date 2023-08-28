import { randomItem } from "../../helper"
import { TFetchFunction, TGetPrice } from "../price_source.type"
import { SYMBOL_LIST, checkInSymbolList } from "../symbol_list"

const BINANCE_API_URL = [
    "https://api.binance.com/",
    "https://api-gcp.binance.com/",
    "https://api1.binance.com/",
    "https://api2.binance.com/",
    "https://api3.binance.com/",
    "https://api4.binance.com/"
]

const fetchBinancePrice: TFetchFunction = async (pair_id: number, try_times: number, price: number) => {
    const url = randomItem(BINANCE_API_URL) + "api/v3/ticker/price?symbol=" + SYMBOL_LIST[pair_id].binance
    try {
        let raw_data = await fetch(url)
        let data = await raw_data.json() as { symbol: string, price: string }
        price = Number(data.price)
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
    fetchBinancePrice
}