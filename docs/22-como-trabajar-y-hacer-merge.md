# 22 · Cómo Trabajar en Equipo, Probar Solo y Hacer Merge sin Romper Nada

**Para:** Todo el equipo (**Rubén, Ismael, Abraham, Schoenstadt y Leonardo**)  
**Idea central:** Piensen en este repositorio como un **rompecabezas de 5 piezas LEGO**.  
Cada persona desarrolla su pieza en su propia rama con su agente de IA **sin tocar los archivos de los demás**, prueba su pieza sola, y en los cortes de integración (**H10**, **H15** y **H18**) hacemos `git merge` a `main` sabiendo de antemano que **todo encaja exacto**.

---

## 1. Mapa del Rompecabezas (Quién toca qué)

### Regla #1: Cada quien solo edita SUS carpetas y archivos
| Persona | Rama sugerida | Archivos donde SÍ trabaja | Cómo prueba su pieza sola antes del merge |
|---|---|---|---|
| **Rubén** | `feat/ruben-backend` | `backend/main.py`, `backend/game_manager.py`, `referencias.md` | `npm run dev:backend` y probar `/health` + eventos Socket.IO |
| **Ismael** | `feat/ismael-minigames` | `Rol2A_TopologicalAssembly.tsx`, `Rol1A_BudgetTable.tsx`, `Rol1B_LauncherAuction.tsx`, `Rol2B_MassBalanceTask.tsx` | `npm run dev:frontend` $\rightarrow$ abrir `http://localhost:5173/dev-sandbox` y probar los 4 minijuegos |
| **Abraham** | `feat/abraham-science` | `frontend/src/data/nasa_catalog.json`, `backend/models/subsystems.py`, `backend/logica/`, `backend/juegos_espectrales/`, `Rol3A`, `Rol4A`, `Rol4B`, `Rol3B` | `/dev-sandbox` para los 4 minijuegos + `npm run test:backend` para `adaptadores_web.py` |
| **Schoenstadt** | `feat/schoenstadt-engine` | `backend/models/session.py`, `backend/physics_engine.py`, `backend/randomizer.py`, `backend/decision_tree.py`, `backend/story_tree.json`, `backend/tests/test_engine.py` | `npm run test:backend` (`python -m pytest backend/tests`) |
| **Leonardo** | `feat/leonardo-ui` | `frontend/src/App.tsx`, `frontend/src/index.css`, `frontend/src/components/paper/*`, `MinigameShell.tsx`, `frontend/src/views/*` | `npm run dev:frontend` y `npm run build:frontend` (verifica 0 errores TypeScript) |

### Regla #2: Las 5 Piezas Sagradas de Unión ("Los Enchufes" del Rompecabezas)
Nadie cambia estos archivos por su cuenta en su rama personal; si hace falta ajustarlos, se acuerda en equipo, se actualiza `docs/` y se corre `node herramientas/combinar.mjs`:
1. **`frontend/src/types/game.ts`** (`MinigameProps` y `LiveMetrics`) — El enchufe entre **Leonardo** y los 8 minijuegos de **Ismael y Abraham**.
2. **`frontend/src/data/nasa_catalog.json`** — Los datos NASA compartidos por **Abraham, Ismael y Schoenstadt**.
3. **`docs/08-controles.md`** — Nombres exactos de los eventos Socket.IO entre **Rubén** y **Leonardo**.
4. **`backend/models/session.py`** — Modelos Pydantic compartidos entre **Schoenstadt** y **Rubén**.
5. **`requirements.txt`, `package.json` y `frontend/tailwind.config.js`** — Dependencias compartidas para evitar conflictos al mezclar ramas.

---

## 2. Cómo Arrancar en 3 Minutos (Instalación Automática)

El repositorio ya incluye `package.json` y `requirements.txt` en la **raíz**, además de `AGENTS.md` con instrucciones para que tu agente de IA instale todo automáticamente.

### Opción A · Si usas Agente de IA (Antigravity / Cursor / Claude / Codex)
1. Clona el repo o haz `git pull origin main`.
2. Crea tu rama personal (ver sección 3).
3. Copia y pega el **Prompt listo** que viene al final de tu roadmap (`docs/17` a `docs/21`).  
   El agente trae el **Paso 0 automático**: revisará e instalará las librerías de Node (`frontend/node_modules`) o Python (`requirements.txt`) antes de programar.

### Opción B · Comandos rápidos en terminal (desde la raíz `space-apps-juego/`)
- **Instalar Frontend (Ismael, Leonardo, Abraham):** `npm run setup:frontend`
- **Instalar Backend (Rubén, Schoenstadt, Abraham):** `npm run setup:backend`
- **Instalar TODO de una vez:** `npm run setup`
- **Prender `/dev-sandbox` y UI:** `npm run dev:frontend` $\rightarrow$ abrir `http://localhost:5173/dev-sandbox`
- **Prender servidor backend:** `npm run dev:backend`
- **Correr pruebas de física y árbol:** `npm run test:backend`
- **Validar compilación frontend antes de merge:** `npm run build:frontend`

---

## 3. Flujo Git Paso a Paso (Cero Conflictos de Merge)

1. **Antes de empezar cada bloque, asegúrate de partir de `main` actualizado:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feat/tu-nombre-tarea
   ```
   *(Ejemplo: `feat/ismael-rol2a`, `feat/schoenstadt-engine`, `feat/abraham-spectral`).*

2. **Trabaja únicamente en tus archivos** siguiendo tu roadmap (`docs/17` a `docs/21`).
   - Cada archivo del rompecabezas ya tiene **stubs compatibles** creados (exports nombrados + `export default` en React; firmas exactas en Python). **Conserva esos nombres de función y exportación** al rellenarlos.

3. **Verifica tu pieza antes de subirla:**
   - Si tocaste frontend (`Ismael`, `Leonardo`, `Abraham`): corre `npm run build:frontend`. Debe terminar sin errores.
   - Si tocaste backend (`Rubén`, `Schoenstadt`, `Abraham`): corre `npm run test:backend`. Todos los tests deben pasar.

4. **Guarda y sube tu rama:**
   ```bash
   git status
   git add <solo tus archivos modificados>
   git commit -m "feat(rol2a): implement topological spacecraft assembly"
   git push -u origin feat/tu-nombre-tarea
   ```
   **Ojo:** Si `git status` muestra que se modificó por accidente un archivo de otro compañero, deshaz solo ese archivo antes del commit (`git restore <archivo>`) o revisa con el equipo.

---

## 4. Cortes de Integración (Cómo Armamos el Rompecabezas en H10 y H15)

1. **Rubén** (o quien esté en `main`) hace merge de las ramas en este orden limpio para detectar cualquier detalle al instante:
   1. `docs` / contratos (`nasa_catalog.json`, `session.py`)
   2. Motor de **Schoenstadt** (`physics_engine.py`, `randomizer.py`, `decision_tree.py`, `story_tree.json`) + Motor espectral de **Abraham** (`logica/`, `juegos_espectrales/`)
   3. Servidor Socket.IO de **Rubén** (`main.py`, `game_manager.py`)
   4. UI base de **Leonardo** (`App.tsx`, `views/`, `paper/`, `MinigameShell.tsx`)
   5. Los 8 minijuegos de **Ismael** (`Rol1A`–`Rol2B`) y **Abraham** (`Rol3A`–`Rol4B`)
2. Después de cada merge en `main`, se corren dos comandos en la raíz:
   ```bash
   npm run test:backend
   npm run build:frontend
   ```
3. Luego todos hacen `git checkout main && git pull origin main` y abren su siguiente rama limpia para la Oleada 2 / pulido final.
