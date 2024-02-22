const { WebSocketServer } = require("ws");
const dotenv = require("dotenv");
dotenv.config();

const wss = new WebSocketServer({ port: process.env.PORT || 8080 });
const onlineUsers = []
wss.on("connection", (ws) => {
    ws.isAlive = true;

    ws.on("pong", () => {
        ws.isAlive = true;
    });

    ws.on("error", console.error);

    ws.on("message", (message) => {
        const msgSTRING = message.toString();
        const msgJSON = JSON.parse(msgSTRING)
        wss.clients.forEach((client) => client.send(msgSTRING));
        console.log(msgJSON);

        if(msgJSON.messageType == -1) // Login
            onlineUsers.push(msgJSON)
    });

    console.log(onlineUsers)

    // Configurar intervalo de ping-pong
    const pingInterval = setInterval(() => {
        if (ws.isAlive === false) {
            console.log('Terminating inactive connection');

            const index = onlineUsers.findIndex(user => user.userId === ws.userId);
            console.log(index)
            if (index !== -1) {
                onlineUsers.splice(index, 1);
            }
            return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping(null, undefined);
    }, 120000); // 120 segundos

    // Limpar intervalo quando a conexão é fechada
    ws.on('close', () => {
        console.log('Terminating inactive connection');
        clearInterval(pingInterval);
    });
});
