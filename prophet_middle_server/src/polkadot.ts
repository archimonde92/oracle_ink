import { ApiPromise, WsProvider } from '@polkadot/api';
import { waitReady } from "@polkadot/wasm-crypto"

const DEFAULT_LOCAL_PROVIDER="ws://127.0.0.1:9944"
const connectPolkadot = async (provider: string = DEFAULT_LOCAL_PROVIDER) => {
    await waitReady()
    const wsProvider = new WsProvider(provider);
    const polkadot_api = await ApiPromise.create({ provider: wsProvider });
    console.log(`Connect polkadot chain through provider ${provider} success! Last block hash is: ${polkadot_api.genesisHash.toHex()}`)
    return polkadot_api
}

export {
    connectPolkadot
}