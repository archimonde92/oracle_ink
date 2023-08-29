import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import { AccountId, WeightV2 } from '@polkadot/types/interfaces';
import { BN, BN_ONE } from "@polkadot/util";
import { KeyringPair } from '@polkadot/keyring/types';
import { waitReady } from "@polkadot/wasm-crypto"
import { AnyJson, ISubmittableResult } from '@polkadot/types/types';

const DEFAULT_MAINNET_PROVIDER = "wss://rpc.polkadot.io"
const DEFAULT_LOCAL_PROVIDER = "ws://127.0.0.1:9944"
const MAX_CALL_WEIGHT = new BN(5_000_000_000_00).isub(BN_ONE);
const PROOF_SIZE = new BN(1_000_000);
const storageDepositLimit = null
let polkadot_api: ApiPromise
let LIST_SUBSTRATE_LOCAL_ADDRESS: {
    Alice: KeyringPair
    Bob: KeyringPair
    Charlie: KeyringPair
    Dave: KeyringPair
    Eve: KeyringPair
    Ferdie: KeyringPair
}

const checkPolkadotApiReady = () => {
    if (!polkadot_api) throw new Error("Polkadot api not ready")
}

const connectPolkadot = async (provider: string = DEFAULT_LOCAL_PROVIDER) => {
    try {
        // Wait until we are ready and connected
        await waitReady()
        const wsProvider = new WsProvider(provider);
        const keyring = new Keyring({ type: 'sr25519' })
        LIST_SUBSTRATE_LOCAL_ADDRESS = {
            Alice: keyring.createFromUri('//Alice'),
            Bob: keyring.createFromUri('//Bob'),
            Charlie: keyring.createFromUri('//Charlie'),
            Dave: keyring.createFromUri('//Dave'),
            Eve: keyring.createFromUri('//Eve'),
            Ferdie: keyring.createFromUri('//Ferdie'),
        }

        polkadot_api = await ApiPromise.create({ provider: wsProvider });
        console.log(`Connect polkadot chain through provider ${provider} success! Last block hash is: ${polkadot_api.genesisHash.toHex()}`)
    } catch (e) {
        console.log(`ERROR: Connect polkadot chain through provider ${provider} failed by reason:`);
        console.log(e)
        throw e
    }
}
interface TContractInstance {
    instance: ContractPromise,
    read: (method: string, address: string, params?: any[]) => Promise<AnyJson>,
    call: (method: string, key_pair: KeyringPair, params?: any[]) => Promise<AnyJson>
}
const connectContract: (metadata: any, address: string | AccountId) => TContractInstance = (metadata, address) => {
    checkPolkadotApiReady()
    const instance = new ContractPromise(polkadot_api, metadata, address)
    return {
        instance,
        read: (method: string, address: string, params: any[] = []) => readContract(instance, method, address, params),
        call: (method: string, key_pair: KeyringPair, params: any[] = []) => callContract(instance, method, key_pair, params)
    } as TContractInstance;
}

const readContract = async (contract: ContractPromise, method: string, address: string, params: any[]) => {
    try {
       
        const gasLimit = polkadot_api?.registry.createType('WeightV2', {
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
        throw new Error(`Error when read method ${method} ${e["message"] || e["stack"] || JSON.stringify(e)}`)
    }
}

const callContract = async (contract: ContractPromise, method: string, key_pair: KeyringPair, params: any[]) => {
    try {
        console.log(...params)
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
    connectPolkadot,
    connectContract,
    polkadot_api,
    readContract as callContract,
    LIST_SUBSTRATE_LOCAL_ADDRESS,
    TContractInstance
}