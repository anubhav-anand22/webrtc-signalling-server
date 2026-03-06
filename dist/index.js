"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const port = parseInt(process.env.PORT || "3000");
const server = http_1.default.createServer();
const wss = new ws_1.WebSocketServer({ server });
const clients = new Map();
wss.on("connection", (ws) => {
    let clientId = null;
    ws.on("message", (raw) => {
        const msg = JSON.parse(raw.toString());
        if (msg.type === "register") {
            clientId = msg.id;
            if (!clientId) {
                console.error("No client id provided");
                return;
            }
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
server.listen(port, "0.0.0.0", () => {
    console.log("Signaling server running on port", port);
});
