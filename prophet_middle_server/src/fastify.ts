import Fastify from "fastify";
import { collections } from "./mongo";
const IP = require('ip');

const fastify = Fastify({ logger: true });
type TNode = { id: string, ip: string, port: number }
type TPair = { id: number, name: string, category: "crypto", deviation: number, heartbeat: number, last_price?: number, last_update_at?: Date }
let nodes: TNode[] = []

export let pairs: TPair[] = [
    {
        id: 0,
        name: "Bitcoin",
        category: "crypto",
        deviation: 5000,
        heartbeat: 60,
    },
    {
        id: 1,
        name: "Ethereum",
        category: "crypto",
        deviation: 5000,
        heartbeat: 60,
    },
]

export const updatePairs = (new_pairs: TPair[]) => {
    pairs = new_pairs
}

fastify.addHook("preHandler", (req, res, done) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    const isPreflight = /options/i.test(req.method);
    if (isPreflight) {
        return res.send();
    }
    done();
});

fastify.get("/nodes", async (req, rep) => {
    try {

        rep.code(200).send(nodes)
    } catch (error: any) {
        return rep.code(404).send({
            error: true,
            message: error?.message,
        })
    }
})

fastify.post("/nodes", async (req, rep) => {
    try {
        const { id, ip, port } = req.body as TNode
        console.log(req.body)
        const index = nodes.findIndex(el => el.id === id)
        if (index == -1) {
            nodes.push({ id, ip, port })
            rep.code(201).send({ node: { id, ip, port } })
        } else {
            rep.code(404).send()
        }
    } catch (error: any) {
        return rep.code(404).send({
            error: true,
            message: error?.message,
        })
    }
})

fastify.put("/nodes", async (req, rep) => {
    try {
        const { id, ip, port } = req.body as TNode
        const index = nodes.findIndex(el => el.id === id)
        if (index != -1) {
            nodes[index] = { id, ip, port }
            rep.code(200).send({ node: { id, ip, port } })
        } else {
            rep.code(204).send()
        }

    } catch (error: any) {
        return rep.code(404).send({
            error: true,
            message: error?.message,
        })
    }
})

fastify.delete("/nodes", async (req, rep) => {
    try {
        const { id } = req.query as { id: string }
        const index = nodes.findIndex(el => el.id === id)
        if (index != -1) {
            nodes.splice(index, 1)
        }
        rep.code(200).send("Ok")
    } catch (error: any) {
        return rep.code(404).send({
            error: true,
            message: error?.message,
        })
    }
})

fastify.get("/pairs", async (req, rep) => {
    try {
        rep.code(200).send(pairs)
    } catch (error: any) {
        return rep.code(404).send({
            error: true,
            message: error?.message,
        })
    }
})

fastify.get("/pairs/prices", async (req, rep) => {
    try {
        const { id, from = new Date(0), to = new Date() } = req.query as { id: string, from: string, to: string }
        const _from = new Date(Number(from))
        const _to = new Date(Number(to))
        const queryAggregateChart = [
            {
                $match: {
                    id: Number(id),
                    created_at: {
                        $gte: _from,
                        $lte: _to,
                    },
                },
            },
            {
                $group: {
                    _id: {
                        $dateTrunc: {
                            date: "$created_at",
                            unit: "hour",
                        },
                    },
                    value: {
                        $avg: "$price",
                    },
                    decimal: {
                        $last: "$decimal",
                    },
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
            {
                $project: {
                    _id: 0,
                    value: 1,
                    decimal: 1,
                    timestamp: "$_id",
                },
            },
        ];
        const data = await collections.pair_prices.aggregate(queryAggregateChart).toArray()
        rep.code(200).send(data)
    } catch (error: any) {
        return rep.code(404).send({
            error: true,
            message: error?.message,
        })
    }
})

export const startFastifyServer = async () => {
    try {
        const server = await fastify.listen({
            port: 5005,
            host: "0.0.0.0",
        });
        console.log(`🚀 Prophet server fastify ready at ${server}`);
    } catch (err) {
        fastify.log.error(err);
    }
};

