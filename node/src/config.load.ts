import { TOMLParse, getFileName, logWithPrefix } from "./helper"

const CONFIG_PATH = "config.toml"

type TConfig = {
    blockchain: {
        provider: string,
        storage_address:string,
        verifier_address:string,
    },
    middle_node: {
        url: string
    }
}

let node_config: TConfig

const log = (msg: string) => logWithPrefix(getFileName(__filename), msg)

const loadConfig = async () => {
    log(`Loading config from "${CONFIG_PATH}" ...`)
    node_config = TOMLParse(CONFIG_PATH) as TConfig
    log(`Success`)
}

export {
    loadConfig,
    node_config
}