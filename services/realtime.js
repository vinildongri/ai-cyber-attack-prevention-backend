import { WebSocketServer } from "ws";
import { userIdFromRequest } from "../middleware/auth.js";

const clients = new Map(); // userId -> Set<WebSocket>

export function attachRealtime(server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws, req) => {
    const userId = userIdFromRequest(req);
    if (!userId) return ws.close(1008, "Unauthorized");

    if (!clients.has(userId)) clients.set(userId, new Set());
    clients.get(userId).add(ws);
    ws.on("close", () => clients.get(userId).delete(ws));
  });
}

export function push(userId, message) {
  for (const ws of clients.get(userId) ?? []) ws.send(JSON.stringify(message));
}
