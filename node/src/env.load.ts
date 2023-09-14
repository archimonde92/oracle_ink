import { config as dotenv_config } from "dotenv";
import { getEnvString, getFileName, logWithPrefix } from "./helper";

type TEnv = {
    wallet_mnemonic: string,
}

const ENV_PATH = ".env"

let node_env: TEnv

const log = (msg: string) => logWithPrefix(getFileName(__filename), msg)

const loadEnv = async () => {
    log(`Loading env from "${ENV_PATH}" ...`)
    dotenv_config({ path: ENV_PATH });
    node_env = {
        wallet_mnemonic: getEnvString("WALLET_MNEMONIC")
    }
    log(`Success`)
}
export {
    loadEnv,
    node_env
}