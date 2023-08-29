import { KeyringPair } from "@polkadot/keyring/types"
import { prophet_feed_value_verifier_metadata } from "../contract_metadata"
import { TContractInstance, connectContract } from "../polkadot"
import { AnyJson } from "@polkadot/types/types"
import { hexToU8a } from "@polkadot/util"

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
    transmitProcess: (caller: KeyringPair, pair_id: number, public_keys: string[], answers: TAnswerData[], signatures: string[]) => Promise<AnyJson>
    readTransmitProcess: (caller: string, pair_id: number, public_keys: string[], answers: TAnswerData[], signatures: string[]) => Promise<any>
    getStorageAddress: (caller: string) => Promise<any>
}

class CProphetVerifier implements TProphetVerifier {
    private _contract: TContractInstance
    constructor(address: string) {
        this._contract = connectContract(prophet_feed_value_verifier_metadata, address)
    }
    readTransmitProcess: (caller: string, pair_id: number, public_keys: string[], answers: TAnswerData[], signatures: string[]) => Promise<AnyJson> = async (caller: string, pair_id: number, public_keys: string[], answers: TAnswerData[], signatures: string[]) => {
        console.log({
            pair_id,
            public_keys,
            answers,
            signatures,
        })
        const read_result = await this._contract.read("transmitProcess", caller, [pair_id, public_keys, answers.map(Object.values), signatures])
        if (read_result && read_result["Ok"]) {
            return read_result["Ok"]
        }
        return null
    }
    getStorageAddress: (caller: string) => Promise<any> = async (caller) => {
        const read_result = await this._contract.read("getStorageAddress", caller)
        if (read_result && read_result["Ok"]) {
            return read_result["Ok"]
        }
        return null
    }
    transmitProcess: (caller: KeyringPair, pair_id: number, public_keys: string[], answers: TAnswerData[], signatures: string[]) => Promise<AnyJson> = async (caller, pair_id, public_keys, answers, signatures) => {
        console.log({
            pair_id,
            public_keys,
            answers,
            signatures
        })
        const block = await this._contract.call("transmitProcess", caller, [pair_id, public_keys, answers.map(Object.values), signatures])
        return block
    }
}

export {
    CProphetVerifier,
    TAnswerData
}
