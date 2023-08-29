import { KeyringPair } from "@polkadot/keyring/types"
import { prophet_feed_value_verifier_metadata } from "../contract_metadata"
import { TContractInstance, connectContract } from "../polkadot"

type TAnswerData = {
    value: number,
    decimal: number,
    roundId: number,
    timestamp: number
}

const packedAnswer = (answer: TAnswerData) => {
    answer.value << 3
}

interface TProphetVerifier {
    transmitProcess: (caller: KeyringPair, pair_id: number, answers: TAnswerData[], signatures: string[]) => Promise<string>
    getStorageAddress: (caller: string) => Promise<any>
}

class CProphetVerifier implements TProphetVerifier {
    private _contract: TContractInstance
    constructor(address: string) {
        this._contract = connectContract(prophet_feed_value_verifier_metadata, address)
    }
    getStorageAddress: (caller: string) => Promise<any> = async (caller) => {
        const read_result = await this._contract.read("getStorageAddress", caller)
        if (read_result && read_result["Ok"]) {
            return read_result["Ok"]
        }
        return null
    }
    transmitProcess: (caller: KeyringPair, pair_id: number, answers: TAnswerData[], signatures: string[]) => Promise<string> = async (caller, pair_id, answers, signatures) => {
        await this._contract.call("transmitProcess", caller, [pair_id, answers.map(Object.values), signatures])
        return "Success"
    }
}

export {
    CProphetVerifier,
    TAnswerData
}
