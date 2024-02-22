const { WebSocketServer } = require("ws");
const dotenv = require("dotenv");
dotenv.config();

const wss = new WebSocketServer({ port: process.env.PORT || 8080 });

wss.on("connection", (ws, req) => {
    const origin = req.headers.origin;
	console.log(origin)

    // Verificar se a origem é permitida
    if (origin !== "http://localhost:3000") {
        console.log('Conexão rejeitada. Origem não permitida:', origin);
        ws.terminate(); // Terminar a conexão não autorizada
        return;
    }

    ws.on("pong", () => {
        ws.isAlive = true;
    });

    ws.on("error", console.error);

    ws.on("message", (message) => {
        const msg = message.toString();
        wss.clients.forEach((client) => client.send(msg));
        console.log(msg);
    });

    console.log('Conexão permitida de:', origin);

    // Configurar intervalo de ping-pong
    const pingInterval = setInterval(() => {
        if (ws.isAlive === false) {
            console.log('Terminando conexão inativa de:', origin);
            return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping(null, undefined);
    }, 30000); // 30 segundos

    // Limpar intervalo quando a conexão é fechada
    ws.on('close', () => {
        clearInterval(pingInterval);
    });
});
