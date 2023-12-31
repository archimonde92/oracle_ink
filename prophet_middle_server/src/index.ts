import { Keyring } from "@polkadot/api"
import { connectContract } from "./contract_polkadot"
import { loadEnv } from "./env.load"
import { pairs, startFastifyServer, updatePairs } from "./fastify"
import { collections, connectMongo } from "./mongo"
import { connectPolkadot } from "./polkadot"
import { TAnswerData, getLatestAnswer } from "./prophet_storage_contract"

const metadata = require("../metadata.json")
const address = "5DPoMFa3vGZaibTjF7awFSEDZ6TA84hMswxW2iotu2uw8NgX"
const main = async () => {
   await loadEnv()
   await connectMongo()
   await startFastifyServer()
   const polkadot_api = await connectPolkadot("wss://rococo-contracts-rpc.polkadot.io")
   //Create contract instance
   const storage_contract_instance = connectContract(polkadot_api, metadata, address)
   //Create caller
   const keyring = new Keyring({ type: 'sr25519' });
   const caller = keyring.createFromUri('//Alice').address
   //Get a answer from The Prophet Contract. To get the latest answer of pair_id=0
   setInterval(async () => {
      const new_pairs = [...pairs]
      for (let pair of pairs) {
         let { id } = pair
         const answer: TAnswerData | null = await getLatestAnswer(storage_contract_instance, caller, id)
         if (answer) {
            const { upsertedCount, modifiedCount } = await collections.pair_prices.updateOne({ id, created_at: new Date(answer.timestamp * 1000) }, {
               $set: {
                  price: answer?.value,
                  decimal: answer?.decimal,
               }
            }, { upsert: true })
            const index = new_pairs.findIndex(el => el.id === id)
            if (index > -1) {
               new_pairs[index].last_price =Math.round(answer?.value * 100 / (10**answer?.decimal)) / 100
               new_pairs[index].last_update_at = new Date(answer.timestamp * 1000)
            }
            updatePairs(new_pairs)
            if (upsertedCount) {
               console.log(`Update new answer of pair ${id}:`, JSON.stringify(answer))
            } else {
               console.log(`Update ${modifiedCount} old answer!`)
            }
         } else {
            console.log(answer)
         }
      }
   }, 5000)
}

main()