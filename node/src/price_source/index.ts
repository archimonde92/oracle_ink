import { fetchBinancePrice } from "./binance"
import { fetchCoingeckoPrice } from "./coingeckco"
import { TFetchFunction, TGetPrice, TPriceSource } from "./price_source.type"
import { checkInSymbolList } from "./symbol_list"
const SOURCE_LIST = ["binance", "coingecko"]
const MAX_TRY_TIMES = 5

const getPrice: TGetPrice = async (pair_id: number, fetch_price_func: TFetchFunction) => {
    checkInSymbolList(pair_id)
    let try_times = 0
    let price: number = 0
    while (!price && try_times < MAX_TRY_TIMES) {
        const fetch_data = await fetch_price_func(pair_id, try_times, price)
        try_times = fetch_data.try_times
        price = fetch_data.price
    }
    if (!price) return null
    return price
}


const priceSource: TPriceSource = (pair_id: number) => {
    return {
        binance: () => getPrice(pair_id, fetchBinancePrice),
        coingecko: () => getPrice(pair_id, fetchCoingeckoPrice)
    }
}
export {
    getPrice,
    priceSource,
    SOURCE_LIST
}