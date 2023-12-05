import { TContractInstance } from "./contract_polkadot"
const toNumber = (str: string) => Number(str.split(",").join(""))

type TAnswerData = {
    value: number,
    decimal: number,
    roundId: number,
    timestamp: number
}

const getLatestAnswer: (contract_instance: TContractInstance, caller: string, pair_id: number) => Promise<TAnswerData | null> = async (contract_instance, caller, pair_id) => {
    const read_result: any = await contract_instance.read("getLatestAnswer", caller, [pair_id])
    if (read_result && "Ok" in read_result && "Ok" in read_result["Ok"]) {
        const [raw_value, raw_decimal, raw_round_id, raw_timestamp] = read_result["Ok"]["Ok"]
        return {
            value: toNumber(raw_value),
            decimal: toNumber(raw_decimal),
            roundId: toNumber(raw_round_id),
            timestamp: toNumber(raw_timestamp),
        }
    }
    return null
}

export {
    getLatestAnswer,
    TAnswerData
}