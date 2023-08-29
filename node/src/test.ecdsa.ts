import Keyring from "@polkadot/keyring";
import { hexToU8a, u8aToHex } from "@polkadot/util";
import { signatureVerify } from "@polkadot/util-crypto";
import { keccak256, waitReady } from "@polkadot/wasm-crypto";
import { BigNumber } from "bignumber.js";
import { TAnswerData } from "./blockchain/contract/prophet_verifier";

const test = async () => {
    await waitReady()
    const mnemonic = "summer olive run luggage various cancel foam guard aim stem amused genius";
    const keyring = new Keyring({ type: 'sr25519' });
    const pair = keyring.addFromUri(mnemonic, { name: 'first pair' }, "ethereum");
    const data: TAnswerData = {
        value: 1652325000,
        decimal: 6,
        roundId: 92,
        timestamp: 1693278690
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