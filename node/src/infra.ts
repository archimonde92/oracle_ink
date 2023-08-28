import { connectListContract } from "./blockchain/contract"
import { connectPolkadot } from "./blockchain/polkadot"

const connectInfra = async () => {
    await connectPolkadot()
    await connectListContract()
}

export {
    connectInfra
}