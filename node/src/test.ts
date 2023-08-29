import { hexToBigInt, hexToU8a, numberToHex, numberToU8a, stringToU8a, u8aToHex, u8aToString } from "@polkadot/util"
import { AggregatorCurrentAnswer } from "./aggregator"
import { priceSource } from "./price_source"
import { TAnswerData } from "./blockchain/contract/prophet_verifier";
import { Bytes } from "@polkadot/types";
import { BigNumber } from "bignumber.js"
import { LIST_SUBSTRATE_LOCAL_ADDRESS } from "./blockchain/polkadot";
import { connectInfra } from "./infra";
import { signatureVerify } from "@polkadot/util-crypto";
import Keyring from "@polkadot/keyring";
import { keccak256, waitReady } from "@polkadot/wasm-crypto";

function dec2bin(dec) {
    return (dec >>> 0).toString(2);
}
// const test = async () => {
//     await connectInfra()
//     // for (let pair_id = 0; pair_id < 2; pair_id++) {
//     //     AggregatorCurrentAnswer(pair_id)
//     // }
// const data: TAnswerData = {
//     value: 165232500000,
//     decimal: 8,
//     roundId: 91,
//     timestamp: 1693278690864
// }

// // console.log(data.value.toString(16))
// // console.log(BigInt(data.decimal).toString(2))
// // console.log((BigInt(data.decimal) << BigInt(128)).toString(2))
// BigNumber.config({ DECIMAL_PLACES: 256, EXPONENTIAL_AT: [-20, 100] })
// const hex = new BigNumber(data.value)
//     .plus(new BigNumber(data.decimal).multipliedBy(new BigNumber(2).pow(128)))
//     .plus(new BigNumber(data.roundId).multipliedBy(new BigNumber(2).pow(144)))
//     .plus(new BigNumber(data.timestamp).multipliedBy(new BigNumber(2).pow(176)))
//     .toString(16)
// const message = stringToU8a('hello')
// console.log(message)


//     let signature = LIST_SUBSTRATE_LOCAL_ADDRESS.Alice.sign(message)
//     console.log({ message, signature, publicKey: LIST_SUBSTRATE_LOCAL_ADDRESS.Alice.publicKey })
//     console.log({ message: Buffer.from(message).toString("hex"), signature: Buffer.from(signature).toString("hex"), publicKey: Buffer.from(LIST_SUBSTRATE_LOCAL_ADDRESS.Alice.publicKey).toString("hex") })
//     let is_valid = signatureVerify(message, signature, LIST_SUBSTRATE_LOCAL_ADDRESS.Alice.address)
//     console.log(u8aToHex(is_valid.publicKey))
//     const signature_example = new Uint8Array([
//         195, 218, 227, 165, 226, 17, 25, 160, 37, 92, 142, 238, 4, 41, 244, 211, 18, 94,
//         131, 116, 231, 116, 255, 164, 252, 248, 85, 233, 173, 225, 26, 185, 119, 235,
//         137, 35, 204, 251, 134, 131, 186, 215, 76, 112, 17, 192, 114, 243, 102, 166, 176,
//         140, 180, 124, 213, 102, 117, 212, 89, 89, 92, 209, 116, 17, 28,
//     ])
//     const buffer_signature_example = Buffer.from(signature_example).toString("hex")
//     console.log(buffer_signature_example)
//     const message_example = new Uint8Array([
//         167, 124, 116, 195, 220, 156, 244, 20, 243, 69, 1, 98, 189, 205, 79, 108, 213,
//         78, 65, 65, 230, 30, 17, 37, 184, 220, 237, 135, 1, 209, 101, 229,
//     ])
//     const buffer_message_example = Buffer.from(message_example).toString("hex")
//     console.log(buffer_message_example)
//     const public_key_example = new Uint8Array([
//         3, 110, 192, 35, 209, 24, 189, 55, 218, 250, 100, 89, 40, 76, 222, 208, 202, 127,
//         31, 13, 58, 51, 242, 179, 13, 63, 19, 22, 252, 164, 226, 248, 98,
//     ])
//     const buffer_public_key_example = Buffer.from(public_key_example).toString("hex")
//     console.log(buffer_public_key_example)

//     let is_valid_2 = LIST_SUBSTRATE_LOCAL_ADDRESS.Alice.verify(message_example, signature_example, public_key_example)
//     console.log(is_valid_2)
//     // const buffer3 = Buffer.from([
//     //     3, 110, 192, 35, 209, 24, 189, 55, 218, 250, 100, 89, 40, 76, 222, 208, 202, 127,
//     //     31, 13, 58, 51, 242, 179, 13, 63, 19, 22, 252, 164, 226, 248, 98,
//     // ]).toString("hex")
//     // console.log(buffer3)
//     // console.log(Number(195).toString(16))
// }

const test = async () => {
    await waitReady()
    const mnemonic = "summer olive run luggage various cancel foam guard aim stem amused genius";
    const keyring = new Keyring({ type: 'sr25519' });
    const pair = keyring.addFromUri(mnemonic, { name: 'first pair' }, "ethereum");
    const data: TAnswerData = {
        value: 165232500000,
        decimal: 8,
        roundId: 91,
        timestamp: 1693278690864
    }


    BigNumber.config({ DECIMAL_PLACES: 256, EXPONENTIAL_AT: [-20, 100] })
    const hex = new BigNumber(data.timestamp)
        .plus(new BigNumber(data.decimal).multipliedBy(new BigNumber(10).pow(11)))
        .plus(new BigNumber(data.roundId).multipliedBy(new BigNumber(10).pow(13)))
        .plus(new BigNumber(data.value).multipliedBy(new BigNumber(10).pow(23)))
        .toString(16)

    const message = "0x" + hex.padStart(32, "0")
    console.log(message)
    const publicKey = pair.publicKey;
    const sig = pair.sign(message)
    console.log({
        address: pair.address,
        message: message,
        messageHash: u8aToHex(keccak256(hexToU8a(message))),
        sig: u8aToHex(sig),
        publicKey: u8aToHex(publicKey),
        verify: signatureVerify(message, sig, publicKey)
    })

}


test()