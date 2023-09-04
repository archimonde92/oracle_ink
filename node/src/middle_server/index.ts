import { node_config } from "../config.load"

export const createMiddleServer = async () => {

    return {
        getNodes: async () => {
            const url = node_config.middle_node.url
            const raw = await fetch(url + "/nodes")
            const data = await raw.json()
            return data as { id: string, ip: string, port: number }[]
        },
        newNode: async (id: string, ip: string, port: number) => {
            const url = node_config.middle_node.url
            const raw = await fetch(url + "/nodes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id,
                    ip,
                    port
                }),

            })
            const data = await raw.json()
            return data
        },
        deleteNode: async (id: string) => {
            console.log("try to delete node", id)
            const url = node_config.middle_node.url
            const raw = await fetch(url + `/nodes?id=${id}`, { method: "DELETE" })
            return raw
        },
    }
}