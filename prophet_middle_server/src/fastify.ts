import Fastify from "fastify";
const IP = require('ip');

const fastify = Fastify({ logger: true });
type TNode = { id: string, ip: string, port: number }
let nodes: TNode[] = []

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

