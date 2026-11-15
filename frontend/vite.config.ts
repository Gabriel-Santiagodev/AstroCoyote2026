// Owner: Leonardo (Task LEO-01) — Vite + React configuration
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Same-origin backend (2026-11-15): Vite proxies the FastAPI + Socket.IO backend (:8000) on the
 * frontend port, so phones on the LAN only need to reach port 5173. This also works when the OS
 * firewall blocks the Python process from the network (the proxy talks to it over localhost).
 */
const BACKEND_TARGET = process.env.VITE_BACKEND_PROXY_TARGET || 'http://localhost:8000';
const backendProxy = {
  '/socket.io': { target: BACKEND_TARGET, ws: true, changeOrigin: true },
  '/health': { target: BACKEND_TARGET, changeOrigin: true },
  '/api': { target: BACKEND_TARGET, changeOrigin: true },
};

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: backendProxy,
  },
  preview: {
    host: true,
    proxy: backendProxy,
  },
});
