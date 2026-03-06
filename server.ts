import WebSocket, { WebSocketServer } from "ws";
import { v4 as uuid } from "uuid";

const wss = new WebSocketServer({ port: 3000 });

type Client = {
  id: string;
  ws: WebSocket;
};

const clients = new Map<string, Client>();

wss.on("connection", (ws) => {
  let clientId: string | null = null;

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
      clients.get(msg.to)!.ws.send(JSON.stringify(msg));
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
