import { createNode } from ".";
import { TAnswerMessage, TSentAnswerMessage } from "..";
import { TAnswerData } from "../blockchain/contract/prophet_verifier";
import { middle_server } from "../infra";
let node: ReturnType<typeof createNode> & { addNewAnswer: typeof _addNewAnswer, clearAnswer: typeof _clearAnswer, addSentAnswer: typeof _addSentAnswer, isSentAnswer: typeof _isSentAnswer }
let node_answers: { public_key: string, answer: TAnswerData, signature: string }[][][] = [[[]]]
const _addNewAnswer = (answer_msg: TAnswerMessage) => {
    const { pair_id, public_key, signature, answer } = answer_msg
    if (!node_answers[pair_id]) node_answers[pair_id] = []
    if (!node_answers[pair_id][answer.roundId]) node_answers[pair_id][answer.roundId] = []
    const found_answer = node_answers[pair_id][answer.roundId].find(el => el.signature === signature)
    if (!found_answer) {
        node_answers[pair_id][answer.roundId].push({
            public_key,
            signature,
            answer
        })
    }
}

const _clearAnswer = (pair_id: number, roundId: number) => {
    node_answers[pair_id][roundId] = []
    _addSentAnswer(pair_id, roundId)
}

const already_sent_answers: boolean[][] = [[]]
const _addSentAnswer = (pair_id: number, round_id: number) => {
    console.log(`set sent message of pair_id = ${pair_id}, round_id=${round_id}`)
    if (!already_sent_answers[pair_id]) already_sent_answers[pair_id] = []
    already_sent_answers[pair_id][round_id] = true
}

const _isSentAnswer = (pair_id: number, round_id: number) => {
    return already_sent_answers[pair_id][round_id] ? true : false
}


// After that we create the node, run it and let user
// know how to connect to other nodes and send messages

const connectNode = (port: number, is_leader: boolean) => {
    node = {
        ...createNode({ is_leader }),
        addNewAnswer: _addNewAnswer,
        clearAnswer: _clearAnswer,
        addSentAnswer: _addSentAnswer,
        isSentAnswer: _isSentAnswer
    };

    // Start local node and print help
    node.listen(port, () => {
        console.log(`Prophet node is up at port ${port}.`);
        console.log(``);

        node.on('connect', ({ nodeId }) => {
            console.log(`New node connected: ${nodeId}`);
        });

        node.on('disconnect', ({ nodeId }) => {
            console.log(`Node disconnected: ${nodeId}`);
        });

        node.on('error', (error) => {
            console.log(`Node disconnected: ${error}`);
        });

        node.on('broadcast', ({ message }) => {
            if (message.type === "new_answer") {
                const answer_msg = message as TAnswerMessage
                node.addNewAnswer(answer_msg)
            }
            if (message.type === "sent_answer") {
                const answer_msg = message as TSentAnswerMessage
                node.addSentAnswer(answer_msg.pair_id, answer_msg.round_id)
            }
        });
    });

    // Handle CTRL C to gracefully shut everything down
    process.on('SIGINT', async () => {
        console.log("\nGracefully shutting chat node down...");
        await middle_server.deleteNode(node.id)
        node.close(() => {
            process.exit();
        });
    });
}



export { connectNode, node, node_answers }