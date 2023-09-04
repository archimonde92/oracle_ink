import { node_config } from "../../config.load"
import { CProphetStorage } from "./prophet_storage"
import { CProphetVerifier } from "./prophet_verifier"

let storage_contract: CProphetStorage
let verifier_contract: CProphetVerifier

const connectListContract = () => {
    storage_contract = new CProphetStorage(node_config.blockchain.storage_address)
    verifier_contract = new CProphetVerifier(node_config.blockchain.verifier_address)
    console.log(`Connect contract success!`)
}

export {
    connectListContract,
    storage_contract,
    verifier_contract
}