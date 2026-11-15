# AGENTS.md — Space Apps 2026 · Space Mission Design Game

**This file is the technical authority for this repository.** If a task, a chat message or a code comment contradicts it, this file wins: stop and report the conflict.

## What this repository is

Our team's entry for the **NASA Space Apps Challenge 2026** (Querétaro, Nov 14 15:00 – Nov 15 15:00, **24-hour sprint**), challenge **"Space Mission Design Game"**: a **100% web-based**, real-time singleplayer/multiplayer (1–4 players) **5-minute educational space mission game** built with real NASA data and a **Paper Mario × Among Us + NASA HUD** visual aesthetic.

**Official Pivot (Nov 14, 15:00 h):** There is **NO physical hardware** and **NO Unity**. Everything is 100% software web. See `docs/03-decisiones.md`.

### Tech Stack (100% Web)
- **Frontend (`frontend/`):** React 18+, TypeScript, Vite, Tailwind CSS, Framer Motion, Three.js (`r128+`), `socket.io-client`, `@tsparticles/react`, `lucide-react`, `canvas-confetti`.
- **Backend (`backend/`):** Python 3.11+, FastAPI, `python-socketio` (ASGI), Pydantic v2, `numpy`, `scipy`, `uvicorn`.
- **Single Source of Truth:** `docs/` + `proyecto-completo.md` + `arquitectura_integral_y_motor_espectral_nasa_space_apps_2026.md` + `arquitectura_y_dependencias_nasa_space_challenge.md`.

### Core 5-Minute Gameplay Flow
1. **`HomeMenu`**: Choose **Singleplayer** or **Multiplayer**.
2. **`Lobby` (Among Us / Kahoot style)**: Connect via room PIN (1–4 players; empty roles out of the 4 total roles are dynamically handled by `backend/randomizer.py`), choose **Role**, and select **1 of 3 NASA Missions** (*Artemis Moon* Easy, *Asteroid Hunter* Medium, *Mars Sample Return / MRO* Hard) and difficulty.
3. **Linear Station Track (2 Waves × 4 Roles = 8 Minigames, 30s each, 1-Shot)**: Unlike free-roam maps, each player's *Paper Mario × Among Us* character **moves automatically along a linear station track** from Station 1 (Wave 1) to Station 2 (Wave 2). In multiplayer, stations execute **in parallel and synchronized**: every decision triggers live causal mutations via Socket.IO (`mutacion_en_vivo`) that constrain teammates' parallel and subsequent stations (e.g., choosing low fuel/engine alters mass limits, UFE reserve alters R&D energy spawn rates, instrument mass impacts launcher capacity and CG).
4. **60-Second Turn-Based Space Flight (`Flight60sView`)**: After completing the stations, a 60-second animated rocket/spacecraft flight begins. The server evaluates the deterministic 4-Node Decision Tree (`NODE_1_LAUNCH`, `NODE_2_PROPULSION`, `NODE_3_EVENT`, `NODE_4_DOWNLINK`) and triggers **4 rounds of 15s turn-based engineering/crisis questions** (`story_tree.json`). In multiplayer, players take turns answering; in singleplayer, the player answers all turns.
5. **NASA Educational Feedback Dashboard (`MissionReportDashboard`)**: Whether the mission achieves `FULL_SUCCESS`, `PARTIAL_SUCCESS`, or `FAILED`, the game **always delivers detailed causal feedback** explaining *why* the mission succeeded or failed using verified NASA numbers and sources, plus a Retry/Redesign loop.

## Read first

| File | For |
|---|---|
| `docs/00-indice.md` | Map of every document, status labels and AI System Prompt |
| `docs/03-decisiones.md` | What is decided (`[DECIDIDO]`) vs proposed (`[PROPUESTA]`). Never contradict `[DECIDIDO]` |
| `docs/04-juego.md` | Complete 5-minute game loop, linear stations, chain effects & 60s mode |
| `docs/05-mvp.md` | Scope for 24h: MVP, extras, out |
| `docs/06-datos-nasa.md` | Every physical constant, formula, mission table and NASA source |
| `docs/08-controles.md` | Web controls and Socket.IO event contract |
| `docs/09-arte-y-sonido.md` | Paper Mario × Among Us + NASA HUD visual system |
| `docs/10-tecnico.md` | Monorepo architecture, `MinigameProps` interface & Pydantic schemas |
| `docs/12-roles.md` & `docs/14-tareas.md` | Team roles (Rubén, Ismael, Abraham, Schoenstadt, Leonardo) and 24h task list |
| `docs/17-roadmap-*.md` to `docs/21-roadmap-*.md` | Step-by-step individual roadmaps and AI prompts per teammate |

## Status labels

Documents tag statements **[DECIDIDO]** (decided), **[PROPUESTA]** (proposal) or **[ABIERTO]** (open). Treat a proposal as the default plan, never as a decision; never implement around an open question — stop and ask.

## Rules

- **Language split.** Planning docs (`docs/`): Spanish. Game UI, submission page, video: English. Code, comments, commit messages: English (established domain identifiers like `juegos_espectrales/` or `AnalizadorFTIR` are preserved).
- **Spanish must be correct UTF-8** with accents and `ñ`. Team names are exact: **Rubén, Ismael, Abraham, Schoenstadt, Leonardo**.
- **No magic numbers in code.** Game constants, launchers, orbits, instruments, and mission parameters live in `frontend/src/data/nasa_catalog.json`, `backend/models/subsystems.py`, and `docs/06-datos-nasa.md` with their verified `fuente` (source). If a number is missing, stop and report; never invent one.
- **Server Authority & Pure Simulation.** `backend/physics_engine.py`, `backend/decision_tree.py`, and `backend/randomizer.py` are deterministic and have unit tests (`pytest`). The frontend never decides final mission outcomes on its own; it emits Socket.IO actions and renders server state.
- **Strict `MinigameProps` Contract.** Every minigame component (`Rol1A`–`Rol4B`) MUST be self-contained inside `frontend/src/components/minigames/` and implement the standard `MinigameProps` TypeScript interface (`docs/10-tecnico.md`) so any teammate's work plugs cleanly into `MinigameShell` and `LinearStationTrack`.
- **Never use the NASA logo.** AI-made images or video need a visible watermark. Every external asset or AI tool used goes in `referencias.md` and the AI declaration section.

## Mandatory AI Agent Protocol (Read Before Coding)

Whenever **any AI agent** (Antigravity, Claude, Gemini, Cursor, Codex, etc.) runs in this repo:
0. **Auto-Install Dependencies First:** Before writing or running code, automatically check whether `frontend/node_modules` exists and whether Python packages in `requirements.txt` (`backend/requirements.txt`) are installed. If missing for your stack (or run `npm run setup` from root), install them automatically (`npm --prefix frontend install` and/or `python -m pip install -r requirements.txt`) so your teammate never hits missing-module errors.
1. **Sync context first:** Read `AGENTS.md`, `docs/03-decisiones.md`, `docs/10-tecnico.md`, `docs/22-como-trabajar-y-hacer-merge.md`, and the active teammate's roadmap (`docs/17`–`docs/21`).
2. **Never break shared contracts:** Do not alter `MinigameProps`, Socket.IO event names (`docs/08-controles.md`), `frontend/src/data/nasa_catalog.json` keys, or Pydantic schemas (`ConsolidatedMissionState`) unilaterally without updating the docs.
3. **Update official docs on every structural change:** Whenever code changes affect parameters, contracts, endpoints, minigame payloads, or task status (`[x]`), **you MUST update the corresponding file(s) in `docs/`** and immediately run:
   ```bash
   node herramientas/combinar.mjs
   ```
   to regenerate `proyecto-completo.md` so the entire team and all agents always share the exact same up-to-date context.

## Hard rules

Never, without explicit human approval:

- `git push`, force-push, creating or deleting remote repositories
- `git reset --hard`, `git checkout -- .`, `git clean -fd`, or anything that discards uncommitted work
- Adding packages or dependencies beyond what the task / `docs/10-tecnico.md` names
- Touching credentials, `.env` files or API keys
- Changing anything marked **[DECIDIDO]** — propose it instead

## Commits

Conventional Commits (`feat`, `fix`, `docs`, `test`, `refactor`, `chore`), small and focused. Include the task ID from `docs/14-tareas.md` in the body (`Task: RUB-02`, `Task: ISM-01`, etc.).
