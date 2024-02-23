const { WebSocketServer } = require("ws");
const dotenv = require("dotenv");

dotenv.config();

const wss = new WebSocketServer({ port: process.env.PORT || 8080 });
const onlineUsers = {};
let clientID = 0;

wss.on("connection", (ws) => {
    ws.isAlive = true;

    ws.on("pong", () => {
        ws.isAlive = true;
    });

    ws.on("error", console.error);

    ws.on("message", handleMessage);

    // Configurar intervalo de ping-pong
    const pingInterval = setInterval(() => {
        if (ws.isAlive === false) {
            terminateConnection(ws, "Terminating inactive connection");
            return;
        }

        ws.isAlive = false;
        ws.ping(null, undefined);
    }, 120000); // 120 segundos

    // Limpar intervalo quando a conexão é fechada
    ws.on('close', () => {
        terminateConnection(ws, "Terminating connection");
    });
});

function handleMessage(message) {
    let content = message.toString();
    const msgJSON = JSON.parse(content);
    clientID = msgJSON.userID || 0;

    if (msgJSON.messageType === 0) { // Login
        onlineUsers[msgJSON.userID] = this;
        broadcastUsers();
    } else if (msgJSON.messageType === 3) { // Logout
        terminateConnection(this, "Terminating connection due to logout");
    } else {
        wss.clients.forEach((client) => client.send(content));
    }
}

function terminateConnection(ws, logMessage) {
    console.log(`${logMessage} for clientID ${clientID}`);
    clearInterval(ws.pingInterval);
    delete onlineUsers[clientID];
    broadcastUsers();
    ws.terminate();
}

function broadcastUsers() {
    const users = {
        'messageType': 1, // Usuarios
        'users': Object.keys(onlineUsers),
    };
    wss.clients.forEach((client) => {
        client.send(JSON.stringify(users));
    });
}
