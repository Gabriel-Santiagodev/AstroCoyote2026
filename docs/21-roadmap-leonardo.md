# 21 · Roadmap Paso a Paso: Leonardo (UI Core, Arte *Paper Mario × Among Us*, Pista Lineal, Vuelo 60s y Dashboard)

**Tu misión en estas 24 horas:** Darle al juego su alma, estética y flujo completo sin que nada se sienta como un simulador genérico (*AI slop*). Construyes el sistema visual **Paper Mario × Among Us**, los menús, el Lobby PIN, la **Pista Lineal Automática** con barras de recursos en vivo, el contenedor `MinigameShell` + `/dev-sandbox` (para enchufar sin dolor el trabajo de Ismael y Abraham), la escena del **Vuelo de 60 Segundos** y el **Dashboard Final de Retroalimentación NASA**.

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
        ├── App.tsx                      # Router de vistas y ruta /dev-sandbox (LEO-01)
        ├── index.css                    # Clases compartidas .paper-card / .paper-btn (LEO-02)
        ├── socket.ts                    # Cliente Socket.IO hacia backend
        ├── types/game.ts                # CONTRATO SAGRADO: RoleType, LiveMetrics, MinigameProps
        └── components/
            ├── MinigameShell.tsx        # Reloj 30s, 1-toma, toast mutacion_en_vivo, fallback (LEO-03)
            └── paper/                   # Sistema visual Paper Mario x Among Us (LEO-02)
                ├── CrewmateAvatar.tsx
                ├── PaperCard.tsx
                ├── Starfield.tsx
                └── ResourceHUD.tsx      # Barras en vivo compartidas (LEO-05)
        └── views/
            ├── HomeMenu.tsx             # Singleplayer / Multiplayer (LEO-04)
            ├── LobbyView.tsx            # PIN estilo Among Us + Rol + 3 Misiones/Dificultad (LEO-04)
            ├── LinearStationTrack.tsx   # Pista lineal automática Estación 1 -> Sync -> Estación 2 (LEO-05)
            ├── Flight60sView.tsx        # Cohete viajando 60s + 4 rondas por turnos de 15s (LEO-06)
            ├── MissionReportDashboard.tsx # Retroalimentación causal NASA siempre presente (LEO-07)
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

## Paso 2 · Sistema Visual *Paper Mario × Among Us* (`LEO-02` | Meta: H3)

1. Configura Google Fonts en `frontend/index.html`: `Space Grotesk` + `IBM Plex Mono` + `IBM Plex Sans`.
2. Define en `frontend/src/index.css` las utilidades compartidas que usarán Ismael y Abraham:
   - `.paper-card`: fondo `#162347` (o `#F8FAFC` claro), `border: 3px solid #0F172A`, `box-shadow: 5px 5px 0px #0F172A`, `rounded-2xl`.
   - `.paper-btn`: botón táctil de cartulina con hundimiento al presionar (`active:translate-x-[3px] active:translate-y-[3px] active:shadow-none`).
3. Crea **`Starfield.tsx`** con `tsParticles` (estrellas sutiles + planetas de cartulina en capas parallax).
4. Crea **`CrewmateAvatar.tsx`**: componente SVG original (cero logos NASA ni assets con copyright) con estética de tripulante espacial estilo *Among Us* envuelto en doble borde tipo sticker de *Paper Mario* (borde blanco interno + borde negro `#0F172A` + sombra dura), visor brillante y props `role`, `state: "idle" | "walk" | "work" | "panic" | "cheer"`. Al caminar hace rebote e inclinación de recorte de papel con Framer Motion.

---

## Paso 3 · `/dev-sandbox` y `MinigameShell.tsx` (`LEO-03` | Meta: H3)

1. **`DevSandboxView.tsx` (en ruta `/dev-sandbox` de `App.tsx`):** Permite elegir de un dropdown cualquiera de los 8 minijuegos (`Rol1A`..`Rol4B`), editar con sliders un objeto `mockLiveMetrics` (ej. probar qué pasa si `estimated_wet_mass_kg` sube a `5,000 kg` o `cg_balanced` es `false`), ver el reloj de `30s` correr y ver en un panel lateral el JSON exacto que emite `onLiveMutation` y `onSubmitTake`. Esto desbloquea por completo a Ismael y Abraham desde la hora 3.
2. **`MinigameShell.tsx`:**
   - Envuelve al minijuego activo durante la Estación 1 y la Estación 2.
   - Muestra el cronómetro gigante de `30s` en `IBM Plex Mono`, insignia del Rol, estado `LOCKED` cuando ya confirmó su toma y toasts flotantes cuando otro jugador dispara `mutacion_en_vivo` (ej. *"Science added HiRISE (+65 kg)!"*).
   - Si algún minijuego aún no estuviera listo en una prueba temprana, muestra un fallback limpio para nunca romper el flujo.

---

## Paso 4 · Menú Principal y Lobby estilo *Among Us / Kahoot* (`LEO-04` | Meta: H4)

1. **`HomeMenu.tsx`:**
   - Título del juego, 4 avatares *Paper Mario × Among Us* flotando suavemente, y dos botones gigantes: **`SINGLEPLAYER`** y **`MULTIPLAYER`**.
   - Un botón secundario **`Join with PIN`** para entrar directo desde el celular.
2. **`LobbyView.tsx`:**
   - Muestra el código PIN en grande (ej. `MARS26`), lista en vivo de los 1 a 4 tripulantes conectados con sus avatares *Paper Mario*, selector de **Rol** (los ocupados aparecen con el nombre del compañero; los vacíos muestran etiqueta `AI Autopilot Ready`).
   - Selector visual de las **3 Misiones NASA** (*Artemis Moon · Easy*, *Asteroid Hunter · Medium*, *Mars Sample Return · Hard*) + Dificultad (`Easy` / `Medium` / `Hard`).
   - Botón `LAUNCH MISSION SEQUENCE`.

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

## Paso 6 · `Flight60sView.tsx` (Vuelo 60s por Turnos) y `MissionReportDashboard.tsx` (`LEO-06`, `LEO-07` | Meta: H9 – H10)

### `Flight60sView.tsx`
1. Muestra el espacio profundo desplazándose rápido mientras un **cohete/nave estilo recorte de papel** avanza por una ruta hacia la Luna / Asteroide / Marte con barra superior de **4 Nodos (`Launch` $\rightarrow$ `Orbit` $\rightarrow$ `Event` $\rightarrow$ `DSN Downlink`)** y reloj global de `60s`.
2. Al recibir `pregunta_vuelo_60s`:
   - Resalta con un foco quién tiene el turno (`YOUR TURN!` en grande si `active_role === myRole`, o `WAITING FOR [NOMBRE]...` si es turno de otro compañero).
   - Despliega de 2 a 4 botones `.paper-btn` de decisión con barra de `15s` y el hint de ingeniería (`engineering_tradeoff_hint`).
3. Al recibir `resultado_turno_vuelo`: anima la nave reaccionando (chispas/escudo/propulsor/rayo DSN) y muestra el feedback de 2 segundos antes de la siguiente ronda.

### `MissionReportDashboard.tsx`
1. Se muestra **SIEMPRE** tras el vuelo (gane o pierda).
2. Banner gigante estilo sello de cartulina: **`MISSION ACCOMPLISHED`** (verde `#3DDC84` + `canvas-confetti`), **`PARTIAL SUCCESS`** (amarillo `#F2C94C`) o **`MISSION FAILED`** (rojo `#FF5A4E`).
3. Contador animado de **Score (0 – 1,000 pts)** con desglose `Objective 50%` + `Science F1 30%` + `Efficiency 20%`.
4. Tarjeta destacada **`Causal Engineering Breakdown`** (`causal_chain_explanation`) + tarjeta **`Real NASA Mission Connection`** (`nasa_real_world_fact`).
5. Aporte por cada uno de los 4 roles y botón grande **`REDESIGN & RETRY`** (emite `reiniciar_partida`).

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
1. Estética híbrida Paper Mario x Among Us + HUD aeroespacial NASA: bordes gruesos #0F172A, doble contorno tipo sticker, sombras sólidas 4px 4px 0 #0F172A, avatares SVG originales (<CrewmateAvatar />) y cero logos de NASA.
2. Todo en inglés en la UI visible.
3. Usa exactamente frontend/src/types/game.ts (MinigameProps y LiveMetrics) y construye DevSandboxView.tsx (/dev-sandbox) primero para que Ismael y Abraham desarrollen sus minijuegos en paralelo.
4. En LinearStationTrack.tsx el personaje avanza automáticamente por una línea (Station 1 -> Sync 5s -> Station 2) sin caminar libre, mostrando ResourceHUD en vivo conectado al evento mutacion_en_vivo.
5. En Flight60sView.tsx anima el cohete viajando durante 60 segundos con 4 rondas de 15s por turnos (pregunta_vuelo_60s -> respuesta_turno_vuelo) y en MissionReportDashboard.tsx muestra siempre retroalimentación causal y dato real NASA.
```
