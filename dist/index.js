"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const port = process.env.PORT || "3000";
const wss = new ws_1.WebSocketServer({ port: parseInt(port) });
const clients = new Map();
wss.on("connection", (ws) => {
    let clientId = null;
    ws.on("message", (raw) => {
        const msg = JSON.parse(raw.toString());
        // First message must be register
        if (msg.type === "register") {
            clientId = msg.id;
            if (!clientId)
                return console.error("No client id in server.js on(message) message type register");
            clients.set(clientId, { id: clientId, ws });
            console.log("Registered:", clientId);
            return;
        }
        if (msg.to && clients.has(msg.to)) {
            clients.get(msg.to).ws.send(JSON.stringify(msg));
        }
    });
    ws.on("close", () => {
        if (clientId) {
            clients.delete(clientId);
            console.log("Disconnected:", clientId);
        }
    });
});
console.log("Signaling server running on ws://localhost:3000");
