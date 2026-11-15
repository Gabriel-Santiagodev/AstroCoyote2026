# Guía Rápida de Trabajo en Equipo y Merge (`COMO_TRABAJAR.md`)

> Versión directa en la raíz del documento oficial [`docs/22-como-trabajar-y-hacer-merge.md`](docs/22-como-trabajar-y-hacer-merge.md). Si actualizas esta guía, edita `docs/22-como-trabajar-y-hacer-merge.md` y vuelve a correr `node herramientas/combinar.mjs`.

## Cómo funciona este repositorio (Rompecabezas de 5 Piezas)

Cada persona trabaja con su agente de IA en **sus propios archivos**, prueba su parte aislada y luego hacemos `merge` hacia `main` sin pisarnos el código:

1. **Instalación automática al abrir:**
   - **Frontend (Ismael, Leonardo, Abraham):** `npm run setup:frontend`
   - **Backend (Rubén, Schoenstadt, Abraham):** `npm run setup:backend`
   - **Todo junto:** `npm run setup`
   *(Si le pegas el prompt de tu roadmap en `docs/17`–`21`, tu agente de IA corre el Paso 0 automáticamente).*

2. **Qué archivos edita cada quién (Cero conflictos):**
   - **Rubén:** `backend/main.py`, `backend/game_manager.py`, `referencias.md` $\rightarrow$ [`docs/17-roadmap-ruben.md`](docs/17-roadmap-ruben.md)
   - **Ismael:** `Rol2A_TopologicalAssembly.tsx`, `Rol1A_BudgetTable.tsx`, `Rol1B_LauncherAuction.tsx`, `Rol2B_MassBalanceTask.tsx` $\rightarrow$ [`docs/18-roadmap-ismael.md`](docs/18-roadmap-ismael.md)
   - **Abraham:** `nasa_catalog.json`, `subsystems.py`, `logica/`, `juegos_espectrales/`, `Rol3A`, `Rol4A`, `Rol4B`, `Rol3B` $\rightarrow$ [`docs/19-roadmap-abraham.md`](docs/19-roadmap-abraham.md)
   - **Schoenstadt:** `session.py`, `physics_engine.py`, `randomizer.py`, `decision_tree.py`, `story_tree.json`, `test_engine.py` $\rightarrow$ [`docs/20-roadmap-schoenstadt.md`](docs/20-roadmap-schoenstadt.md)
   - **Leonardo:** `frontend/src/views/*`, `frontend/src/components/paper/*`, `MinigameShell.tsx`, `App.tsx`, `index.css` $\rightarrow$ [`docs/21-roadmap-leonardo.md`](docs/21-roadmap-leonardo.md)

3. **Cómo probar tu pieza antes del merge:**
   - **Minijuegos (Ismael y Abraham):** `npm run dev:frontend` $\rightarrow$ abrir `http://localhost:5173/dev-sandbox` y correr `npm run build:frontend`.
   - **Motor / Física / Espectros (Schoenstadt y Abraham):** `npm run test:backend`.
   - **Backend Socket.IO (Rubén):** `npm run dev:backend` y revisar `http://localhost:8000/health`.

4. **Regla de Oro de Merge:**
   - Trabaja siempre en tu rama (`git checkout -b feat/tu-nombre-tarea`).
   - **No renombres** `MinigameProps`, eventos Socket.IO de `docs/08-controles.md`, llaves de `nasa_catalog.json` ni firmas exportadas de `physics_engine.py`, `randomizer.py`, `decision_tree.py` o `adaptadores_web.py`.
   - Haz `git add` solo de tus archivos, valida con `build:frontend` o `test:backend`, haz `push` de tu rama y avisamos en equipo al integrar en los hitos **H10**, **H15** y **H18**.
