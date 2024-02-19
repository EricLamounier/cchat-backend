const { WebSocketServer } = require("ws");
const dotenv = require("dotenv");

dotenv.config();

const wss = new WebSocketServer({ port: process.env.PORT || 8080 });
let connectionEstablished = false;

wss.on("connection", (ws) => {
    ws.on("error", console.error);

    // Enviar uma mensagem de confirmação ao cliente quando a conexão estiver estabelecida
    ws.send("Conexão estabelecida com sucesso.");

    ws.on("message", (message) => {
        // Processar mensagens somente se a conexão estiver completa
        if (connectionEstablished) {
            wss.clients.forEach(client => client.send(message.toString()));
        } else {
            // Caso contrário, envie uma mensagem informando que a conexão ainda não está completa
            ws.send("A conexão ainda não está completa. Aguarde.");
        }
    });

    // Definir a conexão como completa quando o evento 'open' ocorrer
    ws.on('open', () => {
        connectionEstablished = true;
        console.log('Conexão estabelecida.');
    });

    console.log('Conectando...');
});

// Retorne true para indicar que o servidor está ouvindo
wss.on('listening', () => {
    console.log('Servidor WebSocket está ouvindo na porta', wss.options.port);
});
