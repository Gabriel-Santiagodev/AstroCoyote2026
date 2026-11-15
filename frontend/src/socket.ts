// Owner: Leonardo / Rubén (Task LEO-01) — Centralized Socket.IO client
import { io, Socket } from "socket.io-client";

const defaultHost =
  typeof window !== "undefined" ? window.location.hostname : "localhost";

export const BACKEND_URL =
  (import.meta as { env?: Record<string, string> }).env?.VITE_BACKEND_URL ||
  `http://${defaultHost}:8000`;

export const socket: Socket = io(BACKEND_URL, {
  autoConnect: false,
  transports: ["websocket", "polling"],
});

export default socket;
