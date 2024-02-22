const { WebSocketServer } = require("ws");
const dotenv = require("dotenv");

dotenv.config();

const wss = new WebSocketServer({ port: process.env.PORT || 8080 });
const onlineUsers = {};
let clientID = 0
wss.on("connection", (ws) => {

    ws.on("pong", () => {
        ws.isAlive = true;
    });

    ws.on("error", console.error);

    ws.on("message", (message) => {
        const msgSTRING = message.toString();
        const msgJSON = JSON.parse(msgSTRING);
        clientID = msgJSON.userID || 0
        let content = null;
        
        if (msgJSON.messageType == 0){ // Login
            onlineUsers[msgJSON.userID] = ws;
            const users = {
                'messageType': 1, // Usuarios
                'users': Object.keys(onlineUsers),
            }
            content = JSON.stringify(users)
        }

        wss.clients.forEach((client) => client.send(content));
    });

    // Configurar intervalo de ping-pong
    const pingInterval = setInterval(() => {
        console.log(Object.keys(onlineUsers));
        if (ws.isAlive === false) {
            console.log(`Terminating inactive connection for clientId ${clientID}`);
            clearInterval(pingInterval);
            delete onlineUsers[clientID];
            return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping(null, undefined);
    }, 5000); // 5 segundos

    // Limpar intervalo quando a conexão é fechada
    ws.on('close', () => {
        console.log(`Terminating connection for clientID ${clientID}`);
        delete onlineUsers[clientID];
        const users = {
            'messageType': 1, // Usuarios
            'users': Object.keys(onlineUsers),
        }
        wss.clients.forEach((client) => client.send(JSON.stringify(users)));
        clearInterval(pingInterval);
    });
});
