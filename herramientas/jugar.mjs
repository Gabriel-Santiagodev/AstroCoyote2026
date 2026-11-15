// One-command launcher: backend (FastAPI + Socket.IO, :8000) + frontend (Vite, :5173).
// Usage (repo root):  npm run play
// Owner: Rubén. No external dependencies (plain Node child_process).
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { networkInterfaces } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const isWin = process.platform === "win32";

/** Prefer the project's virtualenv (venv or .venv), fall back to the system Python. */
function findPython() {
  const rel = isWin ? ["Scripts", "python.exe"] : ["bin", "python"];
  for (const dir of ["venv", ".venv"]) {
    const candidate = join(ROOT, dir, ...rel);
    if (existsSync(candidate)) return candidate;
  }
  return isWin ? "python" : "python3";
}

function lanIp() {
  for (const addrs of Object.values(networkInterfaces())) {
    for (const a of addrs ?? []) {
      if (a.family === "IPv4" && !a.internal) return a.address;
    }
  }
  return "localhost";
}

const children = [];
function run(label, color, cmd, args, cwd) {
  const child = spawn(cmd, args, { cwd, shell: isWin && cmd === "npm", env: process.env });
  const tag = `\x1b[${color}m[${label}]\x1b[0m `;
  const pipe = (stream) =>
    stream.on("data", (buf) =>
      buf
        .toString()
        .split(/\r?\n/)
        .filter(Boolean)
        .forEach((line) => console.log(tag + line))
    );
  pipe(child.stdout);
  pipe(child.stderr);
  child.on("exit", (code) => {
    console.log(`${tag}exited with code ${code}`);
    shutdown(code ?? 1);
  });
  children.push(child);
}

let closing = false;
function shutdown(code = 0) {
  if (closing) return;
  closing = true;
  for (const c of children) {
    try {
      c.kill();
    } catch {
      /* already stopped */
    }
  }
  setTimeout(() => process.exit(code), 300);
}
process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

if (!existsSync(join(ROOT, "frontend", "node_modules"))) {
  console.error("frontend/node_modules is missing. Run: npm run setup:frontend");
  process.exit(1);
}

const ip = lanIp();
console.log("\n  SPACE MISSION DESIGN GAME");
console.log(`  Play on this PC : http://localhost:5173`);
console.log(`  Phones (same Wi-Fi): http://${ip}:5173`);
console.log(`  Backend health  : http://localhost:8000/health`);
console.log("  Press Ctrl+C to stop everything.\n");

run(
  "backend ",
  "36",
  findPython(),
  ["-m", "uvicorn", "backend.main:socket_app", "--host", "0.0.0.0", "--port", "8000"],
  ROOT
);
run("frontend", "35", "npm", ["--prefix", "frontend", "run", "dev"], ROOT);
