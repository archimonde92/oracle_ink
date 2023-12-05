import { config as dotenv_config } from "dotenv";
import { getEnvString, getFileName, logWithPrefix } from "./helper";

type TEnv = {
    mongodb_uri: string,
    mongodb_db_name: string,
}

const ENV_PATH = ".env"

let node_env: TEnv

const log = (msg: string) => logWithPrefix(getFileName(__filename), msg)

const loadEnv = async () => {
    log(`Loading env from "${ENV_PATH}" ...`)
    dotenv_config({ path: ENV_PATH });
    node_env = {
        mongodb_uri: getEnvString("MONGO_URI"),
        mongodb_db_name: getEnvString("MONGO_DB_NAME"),
    }
    log(`Success`)
}
export {
    loadEnv,
    node_env
}