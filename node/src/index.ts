// Import
import { CProphetVerifier } from './blockchain/contract/prophet_verifier';
import { prophet_feed_value_storage_metadata, prophet_feed_value_verifier_metadata } from './blockchain/contract_metadata';
import { LIST_SUBSTRATE_LOCAL_ADDRESS, connectContract, connectPolkadot } from './blockchain/polkadot';

const start = async () => {

    await connectPolkadot()
    const prophet_storage_address = "5E1EMpKzkoqVqTMW4TaPhA5YWSxhtr9D6rB2LTbDeEmo8jHU"
    const prophet_verifier_address = "5FmnGyuMdZKscSgouASBCTvccME2njFfrkEp6iKNNu8AWazH"

    const storage_contract_test = await connectContract(prophet_feed_value_storage_metadata, prophet_storage_address)
    const verifier_contract = new CProphetVerifier(prophet_verifier_address)

    console.log(await verifier_contract.getStorageAddress(LIST_SUBSTRATE_LOCAL_ADDRESS.Alice.address))
    console.log(await verifier_contract.transmitProcess(
        LIST_SUBSTRATE_LOCAL_ADDRESS.Alice,
        0,
        [
            {
                value: 10020,
                decimal: 2,
                roundId: 4,
                timestamp: new Date().getTime()
            },
            {
                value: 10030,
                decimal: 2,
                roundId: 4,
                timestamp: new Date().getTime()
            }
        ],
        [
            "0x0000000000000000000000000000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000000000000000000000000000"
        ]
    ))
}

start()