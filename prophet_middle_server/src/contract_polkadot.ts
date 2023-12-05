import { ApiPromise } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import { AccountId, WeightV2 } from '@polkadot/types/interfaces';
import { BN, BN_ONE } from "@polkadot/util";
import { KeyringPair } from '@polkadot/keyring/types';
import { AnyJson, ISubmittableResult } from '@polkadot/types/types';

const MAX_CALL_WEIGHT = new BN(5_000_000_000_0).isub(BN_ONE);
const PROOF_SIZE = new BN(1_000_000);
const storageDepositLimit = null

interface TContractInstance {
    instance: ContractPromise,
    read: (method: string, address: string, params?: any[]) => Promise<AnyJson>,
    call: (method: string, key_pair: KeyringPair, params?: any[]) => Promise<AnyJson>
}

const connectContract: (polkadot_api: ApiPromise, metadata: any, address: string | AccountId) => TContractInstance = (polkadot_api, metadata, address) => {
    const instance = new ContractPromise(polkadot_api, metadata, address)
    return {
        instance,
        read: (method: string, address: string, params: any[] = []) => readContract(polkadot_api, instance, method, address, params),
        call: (method: string, key_pair: KeyringPair, params: any[] = []) => callContract(polkadot_api, instance, method, key_pair, params)
    } as TContractInstance;
}

const readContract = async (polkadot_api: ApiPromise, contract: ContractPromise, method: string, address: string, params: any[]) => {
    try {
        const gasLimit = polkadot_api.registry.createType('WeightV2', {
            refTime: MAX_CALL_WEIGHT,
            proofSize: PROOF_SIZE,
        }) as WeightV2
        const read_result = await contract.query[method](
            address,
            {
                gasLimit,
                storageDepositLimit,
            },
            ...params
        );
        if (read_result.result.isOk) {
            return read_result.output?.toHuman()
        } else {
            throw new Error(`Error when read method ${method} ${read_result.result.asErr}`);
        }
    } catch (e: any) {
        throw e
    }
}

const callContract = async (polkadot_api: ApiPromise, contract: ContractPromise, method: string, key_pair: KeyringPair, params: any[]) => {
    try {
        const gasLimit = polkadot_api?.registry.createType('WeightV2', {
            refTime: MAX_CALL_WEIGHT,
            proofSize: PROOF_SIZE,
        }) as WeightV2
        const result = await new Promise<ISubmittableResult>((res, rej) => {
            contract.tx[method](
                {
                    gasLimit,
                    storageDepositLimit,
                },
                ...params
            ).signAndSend(
                key_pair,
                cb => {
                    if (cb.status.isInBlock) {
                        res(cb)
                    } else if (cb.status.isInvalid) {
                        res(cb)
                    }
                }
            );
        })
        return result.status.asInBlock.toHuman()
    } catch (e: any) {
        throw new Error(`Error when call method ${method} ${e["message"] || e["stack"] || JSON.stringify(e)}`)
    }
}

export {
    connectContract,
    TContractInstance
}