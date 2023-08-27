// Import
import { LIST_SUBSTRATE_LOCAL_ADDRESS, connectContract, connectPolkadot } from './blockchain/polkadot';
import {
    prophet_feed_value_storage_metadata,
    prophet_feed_value_verifier_metadata
} from "./contract_metadata"

const start = async () => {

    await connectPolkadot()


    const prophet_storage_address = "5DM3qSDPMBBSAguHvko2Ba9VTJcwEyQMggQY3i5ijC9CLqio"
    const prophet_verifier_address = "5EQMMyhDAZvcNHVdTodMeguiVahYLw1cq9tz1HNELomSNdNT"

    const storage_contract_test = await connectContract(prophet_feed_value_storage_metadata, prophet_storage_address)
    const verifier_contract_test = await connectContract(prophet_feed_value_verifier_metadata, prophet_verifier_address)

    console.log(await storage_contract_test.call("getVerifierContract", LIST_SUBSTRATE_LOCAL_ADDRESS.Alice.address))
    console.log(await storage_contract_test.call("getAnswer", LIST_SUBSTRATE_LOCAL_ADDRESS.Alice.address, [0, 1]))
    console.log(await verifier_contract_test.call("getStorageAddress", LIST_SUBSTRATE_LOCAL_ADDRESS.Alice.address))
}

start()