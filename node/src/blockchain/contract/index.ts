import { CProphetStorage } from "./prophet_storage"
import { CProphetVerifier } from "./prophet_verifier"

const prophet_storage_address = "5H2i9i2cP4A55BMfNZdGaHfkuamRTJRR51LWWBdKpzcGp1iE"
const prophet_verifier_address = "5ChjVoBdsypAKdkV45zXycEk8cTRoEfagJXgqjoYhif9ufW9"
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