

type TPriceSource = (pair_id: number) => {
    binance: () => Promise<number | null>,
    coingecko: () => Promise<number | null>
}
type TGetPrice = (pair_id: number, fetch_price_func: TFetchFunction) => Promise<number | null>
type TFetchFunction = (pair_id: number, try_times: number, price: number) => Promise<{ try_times: number, price: number }>
export {
    TGetPrice,
    TFetchFunction,
    TPriceSource
}