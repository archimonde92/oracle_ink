import { support } from "@polkadot/types/interfaces/definitions"
import { verifier_contract } from "./blockchain/contract"
import { LIST_SUBSTRATE_LOCAL_ADDRESS } from "./blockchain/polkadot"
import { connectInfra } from "./infra"

const test = async () => {
    let example_data = '{ "type": "handshake", "data": { "nodeId": "745b-ad97-d048-c7ff-d60a-8bc8-0df4-441e" } }{ "type":"message", "data": { "id":"sync_node", "ttl":255, "type":"node_sync", "message": ["745b-ad97-d048-c7ff-d60a-8bc8-0df4-441e", "5818-b0be-eba0-7450-1f41-1434-9ac5-9aaa", "1877-9229-99b2-7234-93b7-d9b0-5e0f-4034"], "origin":"745b-ad97-d048-c7ff-d60a-8bc8-0df4-441e"} }'
    let split_data = example_data.split("}{")
    split_data = split_data.map((el, index) => index === 0 ? el + "}" : "{" + el)
    let final_data = split_data.map(el => JSON.parse(el))
    console.log({ split_data })
    console.log({ final_data })
}




test()