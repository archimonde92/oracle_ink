import { verifier_contract } from "./blockchain/contract"
import { LIST_SUBSTRATE_LOCAL_ADDRESS } from "./blockchain/polkadot"
import { connectInfra } from "./infra"

const test = async () => {
    await connectInfra()
    let public_keys = [
        '0x03c17453dcc603fb6db06a0856d3bc6d74696b7cf1d94192be9fd2e03c929f291f'
    ]
    let answers = [
        {
            value: 1719264999,
            decimal: 6,
            roundId: 1,
            timestamp: 1693325915
          }
    ]
    let signatures = [
        '0x6454a19a0deb1f49441c30eec8a46a59622abdb44c72ea70a02fe23ff1cecdb84adc8e6999875c7565777add13b8706035dcb06a83d23dc62297c518037c846601'
    ]
    console.log(await verifier_contract.readTransmitProcess(LIST_SUBSTRATE_LOCAL_ADDRESS.Alice.address, 1, public_keys, answers, signatures))

}


test()