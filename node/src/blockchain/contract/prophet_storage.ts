import { KeyringPair } from "@polkadot/keyring/types"
import { prophet_feed_value_storage_metadata, prophet_feed_value_verifier_metadata } from "../contract_metadata"
import { TContractInstance, connectContract } from "../polkadot"
import { TAnswerData } from "./prophet_verifier"
import { toNumber } from "../../helper"


interface TProphetStorage {
    getLatestAnswer: (caller: string, pair_id: number) => Promise<TAnswerData | null>
}

class CProphetStorage implements TProphetStorage {
    private _contract: TContractInstance
    constructor(address: string) {
        this._contract = connectContract(prophet_feed_value_storage_metadata, address)
    }
    getLatestAnswer: (caller: string, pair_id: number) => Promise<TAnswerData | null> = async (caller, pair_id) => {
        const read_result = await this._contract.read("getLatestAnswer", caller, [pair_id])
        if (read_result && read_result["Ok"] && read_result["Ok"]["Ok"]) {
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
}

export {
    CProphetStorage
}
