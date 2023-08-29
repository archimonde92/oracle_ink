import Keyring from "@polkadot/keyring";
import { u8aToHex } from "@polkadot/util";
import { signatureVerify } from "@polkadot/util-crypto";


const test = () => {

    //https://paritytech.github.io/ink/ink_env/fn.ecdsa_recover.html
    const signature_example = new Uint8Array([
        195, 218, 227, 165, 226, 17, 25, 160, 37, 92, 142, 238, 4, 41, 244, 211, 18, 94,
        131, 116, 231, 116, 255, 164, 252, 248, 85, 233, 173, 225, 26, 185, 119, 235,
        137, 35, 204, 251, 134, 131, 186, 215, 76, 112, 17, 192, 114, 243, 102, 166, 176,
        140, 180, 124, 213, 102, 117, 212, 89, 89, 92, 209, 116, 17, 28,
    ])
    const message_example = new Uint8Array([
        167, 124, 116, 195, 220, 156, 244, 20, 243, 69, 1, 98, 189, 205, 79, 108, 213,
        78, 65, 65, 230, 30, 17, 37, 184, 220, 237, 135, 1, 209, 101, 229,
    ])
    const public_key_example = new Uint8Array([
        3, 110, 192, 35, 209, 24, 189, 55, 218, 250, 100, 89, 40, 76, 222, 208, 202, 127,
        31, 13, 58, 51, 242, 179, 13, 63, 19, 22, 252, 164, 226, 248, 98,
    ])

    console.log({
        signature_example: u8aToHex(signature_example),
        message_example: u8aToHex(message_example),
        public_key_example: u8aToHex(public_key_example),
        verify_example: signatureVerify(message_example, signature_example, public_key_example)
    })


    const mnemonic = "potato act energy ahead stone taxi receive fame gossip equip chest round";
    const keyring = new Keyring({ type: 'ecdsa' });
    const pair = keyring.addFromUri(mnemonic, { name: 'first pair' });
    const publicKey = pair.publicKey;
    const sig = pair.sign(message_example)
    console.log({
        message: u8aToHex(message_example),
        sig: u8aToHex(sig),
        publicKey: u8aToHex(publicKey),
        verify: signatureVerify(message_example, sig, publicKey)
    })



}

test()