import http from "http";
import { WebSocketServer, WebSocket } from "ws";

const port = parseInt(process.env.PORT || "3000");

const server = http.createServer((req, res) => {
  console.log("OK")
  res.writeHead(200);
  res.end("OK");
});

const wss = new WebSocketServer({ server });

type Client = {
  id: string;
  ws: WebSocket;
};

const clients = new Map<string, Client>();

wss.on("connection", (ws) => {
  let clientId: string | null = null;

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

server.listen(port, "0.0.0.0", () => {
  console.log("Signaling server running on port", port);
});