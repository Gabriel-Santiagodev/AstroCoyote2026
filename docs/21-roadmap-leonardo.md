# 21 · Roadmap Paso a Paso: Leonardo (UI Core, Arte 2D Flash `ASTRO SPRITES`, Cabina estilo *60 Seconds!*, Host/Móvil y Dashboard)

**Tu misión en estas 24 horas:** Darle al juego su alma, estética de **videojuego Flash 2D profesional** y flujo completo sin que nada se sienta como un simulador genérico (*AI slop*). Construyes el sistema visual **`ASTRO SPRITES` (cero Among Us por derechos de autor)**, las pantallas de carga divididas (`LoadingScreen.tsx`), los menús, el Lobby PIN (**Host Main Stage vs. Phone Crew Pad**), la **Pista Lineal Automática** con barras de recursos en vivo, el contenedor `MinigameShell` + `/dev-sandbox`, la **Cabina de Supervivencia y Bitácora estilo *60 Seconds! / 60 Parsecs!*** (`Flight60sView.tsx`) con **saltos entre escenas y pantallas de carga**, y el **Dashboard Final de Retroalimentación NASA**.

---

## Árbol exacto de carpetas y archivos donde trabajas

Todos estos archivos ya existen en el repositorio listos para que tu agente trabaje directamente sobre ellos:

```text
space-apps-juego/
└── frontend/
    ├── package.json                     # React 18, TS, Vite, Tailwind, Framer Motion, Three.js, Socket.IO
    ├── index.html                       # Google Fonts (Space Grotesk, IBM Plex Mono, IBM Plex Sans)
    ├── tsconfig.json
    ├── vite.config.ts
    └── src/
        ├── main.tsx                     # Montaje React
        ├── App.tsx                      # Router de vistas (Host Stage / Phone Console) y /dev-sandbox (LEO-01)
        ├── index.css                    # .paper-card, .flash-panel, .handheld-console-frame, .hazard-stripe-bar (LEO-02)
        ├── socket.ts                    # Cliente Socket.IO hacia backend
        ├── types/game.ts                # CONTRATO SAGRADO: RoleType, LiveMetrics, MinigameProps
        └── components/
            ├── MinigameShell.tsx        # Reloj 30s, 1-toma, toast mutacion_en_vivo, fallback (LEO-03)
            └── paper/                   # Sistema visual 2D Flash ASTRO SPRITES (LEO-02)
                ├── CrewmateAvatar.tsx   # 4 Astro Sprites + ROLE_CHARACTER_PROFILE
                ├── LoadingScreen.tsx    # Pantallas de carga por transición (boot, wave1→2, launch, report)
                ├── PaperCard.tsx
                ├── Starfield.tsx
                └── ResourceHUD.tsx      # Barras en vivo (Host completo / móvil compacto) (LEO-05)
        └── views/
            ├── HomeMenu.tsx             # Singleplayer / Host Multi / Join PIN móvil + Showcase Astro Squad (LEO-04)
            ├── LobbyView.tsx            # PIN Host Main Stage vs Phone Crew Pad + 3 Misiones NASA (LEO-04)
            ├── LinearStationTrack.tsx   # Pista lineal automática Estación 1 -> Sync -> Estación 2 (LEO-05)
            ├── Flight60sView.tsx        # Cabina 2D + Bitácora estilo 60 Seconds! + saltos de escena (LEO-06)
            ├── MissionReportDashboard.tsx # Retroalimentación causal NASA + historial EXT-03 (LEO-07)
            └── DevSandboxView.tsx       # Probador aislado /dev-sandbox para Ismael y Abraham (LEO-03)
```

---

## Paso 1 · Setup del Frontend y Contratos Sagrados (`LEO-01` | Meta: H1)

1. Entra a `frontend/` e instala las librerías ya declaradas en `package.json`:
   ```bash
   cd frontend
   npm install
   npm run dev -- --host
   ```
2. Revisa **`frontend/src/types/game.ts`** (ya creado con `RoleType`, `LiveMetrics` y `MinigameProps`). **Aviso urgente:** confirma con Ismael y Abraham en H1 que sus agentes importen ese archivo sin cambiar ni una coma.
3. Completa `frontend/src/socket.ts` conectando al backend (`VITE_BACKEND_URL || http://<hostname>:8000` para que funcione igual en `localhost` y desde celulares en la red local).

---

## Paso 2 · Sistema Visual *2D Flash Arcade (`ASTRO SPRITES`)* (`LEO-02` | Meta: H3)

1. Configura Google Fonts en `frontend/index.html`: `Space Grotesk` + `IBM Plex Mono` + `IBM Plex Sans`.
2. Define en `frontend/src/index.css` las utilidades compartidas que usarán Ismael y Abraham (`.paper-card`, `.paper-btn`) más las utilidades 2D Flash (`.flash-panel`, `.handheld-console-frame`, `.hazard-stripe-bar`).
3. Crea **`Starfield.tsx`** con `tsParticles` (estrellas sutiles + planetas de cartulina en capas parallax).
4. Crea **`CrewmateAvatar.tsx`** (cero Among Us ni copyright externo): 4 astronautas SVG 2D de cuerpo completo (`ASTRO_ENGINEER`, `ASTRO_MEDIC`, `ASTRO_SOLDIER`, `ASTRO_DEFENDER`) + `ROLE_CHARACTER_PROFILE` y props `role`, `state: "idle" | "walk" | "work" | "panic" | "cheer"`, más **`LoadingScreen.tsx`** para pantallas de carga por fase.

---

## Paso 3 · `/dev-sandbox` y `MinigameShell.tsx` (`LEO-03` | Meta: H3)

1. **`DevSandboxView.tsx` (en ruta `/dev-sandbox` de `App.tsx`):** Permite elegir de un dropdown cualquiera de los 8 minijuegos (`Rol1A`..`Rol4B`), editar con sliders un objeto `mockLiveMetrics` (ej. probar qué pasa si `estimated_wet_mass_kg` sube a `5,000 kg` o `cg_balanced` es `false`), ver el reloj de `30s` correr y ver en un panel lateral el JSON exacto que emite `onLiveMutation` y `onSubmitTake`. Esto desbloquea por completo a Ismael y Abraham desde la hora 3.
2. **`MinigameShell.tsx`:**
   - Envuelve al minijuego activo durante la Estación 1 y la Estación 2.
   - Muestra el cronómetro gigante de `30s` en `IBM Plex Mono`, insignia del Rol, estado `LOCKED` cuando ya confirmó su toma y toasts flotantes cuando otro jugador dispara `mutacion_en_vivo` (ej. *"Science added HiRISE (+65 kg)!"*).
   - Si algún minijuego aún no estuviera listo en una prueba temprana, muestra un fallback limpio para nunca romper el flujo.

---

## Paso 4 · Menú Principal y Lobby Host vs. Celular por PIN (`LEO-04` | Meta: H4)

1. **`HomeMenu.tsx`:**
   - Showcase interactivo de los 4 `ASTRO SPRITES`, inspector de rol en frontend (`ROLE_CHARACTER_PROFILE`), entrada Host (`SINGLEPLAYER` / `HOST MULTIPLAYER`) y consola portátil **`PHONE CREW CONSOLE` (Join with PIN)** + pantalla de carga `boot`.
2. **`LobbyView.tsx`:**
   - Código PIN grande + vista diferenciada **Host Main Stage** (hangar 4 bahías) vs. **Phone Handheld Terminal** (selector táctil para cada jugador por PIN), 3 Misiones NASA + Dificultad, y pantalla de carga `lobby_to_wave1`.

---

## Paso 5 · `LinearStationTrack.tsx` (Pista Lineal Automática + HUD en Vivo) (`LEO-05` | Meta: H6)

**Diferenciador clave definido por Rubén:** Aquí no hay mapa para caminar perdido; es una línea visual horizontal clara:

```text
[BASE] ──────► [STATION 1: DESIGN] ──────► [SYNC 5s] ──────► [STATION 2: INTEGRATION] ──────► [LAUNCHPAD]
```

1. **Barra superior `ResourceHUD.tsx`:** Muestra en tiempo real los medidores compartidos (`Mass / Rocket Cap`, `Budget & UFE %`, `Power W`, `FSPL dB`, `CG Status`) actualizándose al instante cuando llega `mutacion_en_vivo` por Socket.IO.
2. **Animación automática del avatar:** Al iniciar Oleada 1 (`iniciar_oleada_1`), el `<CrewmateAvatar />` camina automáticamente de `BASE` a `STATION 1` (1.5 s de animación) y despliega `MinigameShell` con el minijuego `1A/2A/3A/4A` de ese jugador. En Multiplayer se ven en miniatura los iconos de los compañeros en su respectiva estación con check verde al bloquear su toma.
3. **Transición sincronizada (5 s):** Al llegar `iniciar_oleada_2`, el avatar camina automáticamente de `STATION 1` a `STATION 2` mientras un cartel de cartulina dice *"Synchronizing Subsystem Constraints..."* y abre el minijuego `1B/2B/3B/4B`.

---

## Paso 6 · `Flight60sView.tsx` (Cabina estilo *60 Seconds!* + Saltos de Escena) y `MissionReportDashboard.tsx` (`LEO-06`, `LEO-07` | Meta: H9 – H10)

### `Flight60sView.tsx` (Inspirado en la jugabilidad del videojuego *60 Seconds! / 60 Parsecs!*)
1. **Diorama de Cabina 2D + Inventario Físico de Subsistemas:**
   - Reemplaza un simple cohete genérico por el **interior 2D estilo *60 Seconds!* de la cabina espacial** (con ventana al espacio/destino, consola central de salud `rocket_health_pct`, estantes con los subsistemas que el equipo equipó en las estaciones y los **4 `ASTRO SPRITES`** dentro de la cabina reaccionando en tiempo real según su estado: `idle`, `work`, `panic` si hay alerta/daño o `cheer` al pasar una compuerta).
2. **Bitácora del Capitán / Cuaderno de Crisis por Turnos (`pregunta_vuelo_60s`):**
   - Muestra el evento como una página de **Bitácora de Supervivencia** (*"DAY / LOG 01–04"*) con la insignia del concepto NASA, quién tiene el turno (`YOUR TURN!` gigante con botones `.paper-btn` de 15 s y teclas `1–4` en el celular activo, o visor de cabina/espera con el Astro Sprite del compañero en turno en Host y otros celulares).
3. **Saltos entre Escenas y Pantallas de Carga Intermedias:**
   - Al recibir `resultado_turno_vuelo` muestra la consecuencia visual en cabina durante ~2 s (`PASS` / `DEGRADED` / `CRITICAL`), y ejecuta un **Salto de Escena con pantalla de carga temática** (capítulo siguiente: `NODE_1_LAUNCH` $\rightarrow$ `NODE_2_PROPULSION` $\rightarrow$ `NODE_3_EVENT` $\rightarrow$ `NODE_4_DOWNLINK` $\rightarrow$ Reporte) para dar sensación real de campaña por episodios estilo *60 Seconds!*.

### `MissionReportDashboard.tsx`
1. Muestra pantalla de carga de decodificación (`flight_to_report`) y se presenta **SIEMPRE** tras la travesía (gane o pierda).
2. Banner gigante estilo sello arcade: **`MISSION ACCOMPLISHED`** (verde `#3DDC84` + `canvas-confetti`), **`PARTIAL SUCCESS`** (amarillo `#F2C94C`) o **`MISSION FAILED`** (rojo `#FF5A4E`).
3. Contador animado de **Score (0 – 1,000 pts)** con desglose `Objective 50%` + `Science F1 30%` + `Efficiency 20%`.
4. Tarjeta destacada **`Causal Engineering Breakdown`** (`causal_chain_explanation`) + tarjeta **`Real NASA Mission Connection`** (`nasa_real_world_fact`) + historial comparativo de intentos en sesión (`EXT-03`).
5. Aporte por cada uno de los 4 `ASTRO SPRITES` y botón grande **`REDESIGN & RETRY`** (emite `reiniciar_partida`).

---

## Paso 7 · Conexión Final de los 8 Minijuegos (`LEO-08`, `LEO-09` | H10 y H15)

- **Para H10:** Mapea en un registro limpio los primeros 4 (`Rol1A`, `Rol2A` de Ismael; `Rol3A`, `Rol4A` de Abraham) dentro de `LinearStationTrack` y verifica el flujo completo con Rubén y Schoenstadt.
- **Para H15:** Mapea los 4 restantes (`Rol1B`, `Rol2B` de Ismael; `Rol3B`, `Rol4B` de Abraham) y pule transiciones de cartulina y responsividad móvil.

---

## Prompt listo para usar con tu Agente de IA

```text
Paso 0 (Automático): Antes de empezar, verifica e instala las dependencias de frontend corriendo `npm --prefix frontend install` si no existe `frontend/node_modules`.
Lee AGENTS.md, docs/04-juego.md, docs/08-controles.md, docs/09-arte-y-sonido.md, docs/10-tecnico.md, docs/22-como-trabajar-y-hacer-merge.md y docs/21-roadmap-leonardo.md.
Trabaja únicamente en tus archivos asignados de frontend/src/ (no edites backend/ ni frontend/src/components/minigames/).
Vamos a construir el frontend en React 18 + TypeScript + Vite + Tailwind + Framer Motion + Lucide + socket.io-client + @tsparticles/react:
1. Estética 2D Flash Arcade (`ASTRO SPRITES`: `ASTRO_ENGINEER`, `ASTRO_MEDIC`, `ASTRO_SOLDIER`, `ASTRO_DEFENDER` — cero Among Us) + Cabina y Bitácora estilo *60 Seconds! / 60 Parsecs!* + HUD aeroespacial NASA: bordes gruesos #0F172A, `.flash-panel`, `.handheld-console-frame`, sombras sólidas 5px 5px 0 #0F172A, y cero logos de NASA.
2. Todo en inglés en la UI visible.
3. Usa exactamente frontend/src/types/game.ts (MinigameProps y LiveMetrics) y construye DevSandboxView.tsx (/dev-sandbox) primero para que Ismael y Abraham desarrollen sus minijuegos en paralelo.
4. En LinearStationTrack.tsx el personaje avanza automáticamente por una línea (Station 1 -> Sync 5s -> Station 2) sin caminar libre, mostrando ResourceHUD en vivo conectado al evento mutacion_en_vivo y pantallas de carga entre fases.
5. En Flight60sView.tsx implementa la jugabilidad estilo el videojuego 60 Seconds! (cabina 2D con los 4 Astro Sprites + objetos/subsistemas visibles, Bitácora del Capitán de 4 rondas por turnos y saltos entre escenas con pantallas de carga entre nodos) y en MissionReportDashboard.tsx muestra siempre retroalimentación causal y dato real NASA.
```
