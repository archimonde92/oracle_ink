import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import { AccountId } from '@polkadot/types/interfaces';
import { BN, BN_ONE } from "@polkadot/util";
import type { WeightV2 } from '@polkadot/types/interfaces'
import { KeyringPair } from '@polkadot/keyring/types';
const DEFAULT_MAINNET_PROVIDER = "wss://rpc.polkadot.io"
const DEFAULT_LOCAL_PROVIDER = "ws://127.0.0.1:9944"
const MAX_CALL_WEIGHT = new BN(5_000_000_000_000).isub(BN_ONE);
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
        // Wait until we are ready and connected
        await polkadot_api.isReady;
        console.log(`Connect polkadot chain through provider ${provider} success! Last block hash is: ${polkadot_api.genesisHash.toHex()}`)
    } catch (e) {
        console.log(`ERROR: Connect polkadot chain through provider ${provider} failed by reason:`);
        console.log(e)
        throw e
    }
}

const connectContract = async (metadata: any, address: string | AccountId) => {
    checkPolkadotApiReady()
    const instance = new ContractPromise(polkadot_api, metadata, address)
    return {
        instance,
        call: (method: string, address: string, params: any[] = []) => callContract(instance, method, address, params)
    };
}

const callContract = async (contract: ContractPromise, method: string, address: string, params: any[]) => {
    checkPolkadotApiReady()
    const gasLimit = polkadot_api?.registry.createType('WeightV2', {
        refTime: MAX_CALL_WEIGHT,
        proofSize: PROOF_SIZE,
    }) as WeightV2
    const call_result = await contract.query[method](
        address,
        {
            gasLimit,
            storageDepositLimit,
        },
        ...params
    );
    if (call_result.result.isOk) {
        return call_result.output?.toHuman()
    } else {
        throw new Error(`Error when call method ${method} ${call_result.result.asErr}`);
    }
}

export {
    connectPolkadot,
    connectContract,
    polkadot_api,
    callContract,
    LIST_SUBSTRATE_LOCAL_ADDRESS
}