const SYMBOL_LIST = [
    {
        binance: "BTCUSDT",
        coingecko: "bitcoin",
        decimal: 8
    },
    {
        binance: "ETHUSDT",
        coingecko: "ethereum",
        decimal: 8
    }

]

const checkInSymbolList = (pair_id: number) => {
    if (!SYMBOL_LIST[pair_id]) throw new Error(`Pair Id not exists`)
}

export {
    SYMBOL_LIST,
    checkInSymbolList
}