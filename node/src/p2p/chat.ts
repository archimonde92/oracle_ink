import { createNode } from ".";
const randomItem = (c) => c[Math.floor(Math.random() * c.length)];

// First, we see what port we should run the node at
const port = Number(process.argv[2]);

if (isNaN(port)) {
    console.log('Port not defined. Call like "node examples/chat.js PORT"');
}

// After that we create the node, run it and let user
// know how to connect to other nodes and send messages
const node = createNode();
let my_name = randomItem(['Gorgeous', 'Elegant', 'Phantastic', 'Smart']) + ' ' + randomItem(['pine', 'oak', 'spruce']) + ' from ' + randomItem(['Paris', 'Berlin', 'Belgrade', 'Ljubljana']);

// Start local node and print help
node.listen(port, () => {
    console.log(`Chat node is up at port ${port}.`);
    console.log(``);
    console.log(`Write "connect IP:PORT" to connect to other nodes.`);
    console.log(`Write "name NAME" to change your name.`);
    console.log(`Type anything else to send it to everyone on the network`);
    console.log(``);
    console.log(`Your name is "${my_name}"`);

    node.on('connect', ({ nodeId }) => {
        console.log(`New node connected: ${nodeId}`);
    });

    node.on('disconnect', ({ nodeId }) => {
        console.log(`Node disconnected: ${nodeId}`);
    });

    node.on('error', (error) => {
        console.log(`Node disconnected: ${error}`);
    });

    node.on('broadcast', ({ message: { name, text } }) => {
        console.log(`${name}: ${text}`);
    });


    process.stdin.on('data', async (data) => {
        const text = data.toString().trim();
        if (text.startsWith('connect')) {
            const [, ipport] = text.split(' ');
            const [ip, port] = ipport.split(':');

            console.log(`Connecting to ${ip} at ${Number(port)}...`);
            node.connect(ip, Number(port), () => {
                console.log(`Connection to ${ip} established.`);
            });
        } else if (text.startsWith('name')) {
            [, my_name] = text.split(' ');
            console.log(`Name changed to "${my_name}"`);
        } else if (text.startsWith('set')) {
            let [_, node_ip, message] = text.split(' ');
        } else if (text.startsWith('check')) {
            console.log(node.neighbors())
        } else if (text.startsWith('nodes')) {
            console.log(node.nodes())
        }
        else {
            node.broadcast({ name: my_name, text });
            console.log(`You: ${text}`);
        }
    });
});

// Handle CTRL C to gracefully shut everything down
process.on('SIGINT', async () => {
    console.log("\nGracefully shutting chat node down...");

    node.close(() => {
        process.exit();
    });
});