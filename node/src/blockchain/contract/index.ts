import { CProphetStorage } from "./prophet_storage"
import { CProphetVerifier } from "./prophet_verifier"

const prophet_storage_address = "5FDjQCXxQa1MkEiaG3Y9v5hUWgTKWxa3J46pFD9hJzaVL48i"
const prophet_verifier_address = "5CdJZznidr24paC4fAVCz9ouHhDrTPAHs6QE443uCNGerXSV"
let storage_contract: CProphetStorage
let verifier_contract: CProphetVerifier

const connectListContract = () => {
    storage_contract = new CProphetStorage(prophet_storage_address)
    verifier_contract = new CProphetVerifier(prophet_verifier_address)
    console.log(`Connect contract success!`)
}

export {
    connectListContract,
    storage_contract,
    verifier_contract
}