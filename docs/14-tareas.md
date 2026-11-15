# 14 · Tareas (Sprint de 24 Horas)

**Qué contiene:** lista maestra de tareas por responsable (`RUB`, `ISM`, `ABR`, `SCH`, `LEO`, `ENT`, `QA`), dependencias, hora meta (`H0` = Sáb 15:00 h) y criterio exacto de "Terminado cuando".  
**Dueño:** Rubén (cada integrante marca las suyas con `[x]` y corre `node herramientas/combinar.mjs`)  
**Última actualización:** 2026-11-14 (18:00 h)

## Cómo leer esta tabla

- **Prefijos por área / dueño:**
  - `RUB`: Rubén (Backend Socket.IO, salas PIN, concurrencia en vivo, deploy e integración)
  - `ISM`: Ismael (Minijuegos 2D de Nave, Masa/CG, Lanzador y Presupuesto)
  - `ABR`: Abraham (Datos NASA, Motor Espectral FTIR y Minijuegos Ciencia/DSN/Órbita/3D)
  - `SCH`: Schoenstadt (Motor físico, `randomizer.py`, Árbol de 4 Nodos y Árbol de Vuelo 60s)
  - `LEO`: Leonardo (Arte *Paper Mario × Among Us*, Menús, Lobby, Pista Lineal, Vuelo 60s y Dashboard)
  - `ENT`: Entrega (Video 30 s, página en inglés, referencias, IA)
  - `QA`: Pruebas integrales de extremo a extremo

---

### Rubén (`RUB`) — Backend Realtime, Concurrencia y Deploy

| ✓ | ID | Tarea | Depende de | Para | Terminado cuando | Prioridad |
|---|---|---|---|---|---|---|
| [ ] | RUB-01 | Completar `backend/requirements.txt`, `backend/main.py` (FastAPI + Socket.IO ASGI + CORS) y verificar arranque en `0.0.0.0:8000` | — | H1 | `/health` responde `200 OK` y cliente Socket.IO conecta en red local | MVP |
| [ ] | RUB-02 | Implementar salas en memoria en `backend/game_manager.py`: `crear_sala` (PIN 6 chars), `unirse_sala` (máx. 4), `seleccionar_rol_mision` | RUB-01 | H3 | Hasta 4 clientes ven actualizado el Lobby sin colisión de roles | MVP |
| [ ] | RUB-03 | Implementar relojes autoritativos (30 s Oleada 1, 5 s sync lineal, 30 s Oleada 2) y cierre automático al llegar a `0 s` o al bloquear todos los humanos | RUB-02, SCH-03 | H6 | Al terminar el timer, avanza solo sin quedarse trabado aunque alguien no haga clic | MVP |
| [ ] | RUB-04 | Implementar pipeline de concurrencia en vivo: recibir `accion_parcial_minijuego`, llamar `physics_engine.py` y emitir `mutacion_en_vivo` a toda la sala | RUB-03, SCH-02 | H8 | Mover un parámetro en un cliente actualiza las barras y límites en otra pestaña al instante | MVP |
| [ ] | RUB-05 | Orquestar la fase de Vuelo 60s en `game_manager.py`: 4 rondas × 15 s rotando turno entre jugadores conectados (`pregunta_vuelo_60s` $\rightarrow$ `resultado_turno_vuelo` $\rightarrow$ `reporte_final_mision`) | RUB-03, SCH-04, SCH-05 | H10 | Partida completa de 1 y 2 jugadores cierra ciclo hasta el reporte final | MVP |
| [ ] | RUB-06 | Deploy público de Frontend + Backend WebSocket accesible desde fuera de la red del hackathon (`[ABIERTO A10]`) | LEO-09, RUB-05 | H18 | Juez o teléfono en datos móviles juega la partida completa sin cortes de WebSocket | MVP |

---

### Leonardo (`LEO`) — UI Core, Arte *Paper Mario × Among Us*, Pista Lineal y Dashboards

| ✓ | ID | Tarea | Depende de | Para | Terminado cuando | Prioridad |
|---|---|---|---|---|---|---|
| [ ] | LEO-01 | Configurar `frontend/` (Vite, React, TS, Tailwind, Framer Motion, Lucide, Three.js, Socket.IO client), `types/game.ts` (`MinigameProps`) y `socket.ts` | — | H1 | `npm run dev -- --host` levanta sin errores TS | MVP |
| [ ] | LEO-02 | Sistema visual *Paper Mario × Among Us* (`index.css`, `.paper-card`, `.paper-btn`, `Starfield.tsx`, `<CrewmateAvatar />` en 4 colores + estados) | LEO-01 | H3 | Los 4 avatares SVG con borde blanco/negro y sombra dura animan su caminata en pantalla | MVP |
| [ ] | LEO-03 | Crear ruta `/dev-sandbox` (`DevSandboxView.tsx`) y `MinigameShell.tsx` (reloj 30 s, bloqueo de toma, indicador `mutacion_en_vivo`, fallback de emergencia) | LEO-01, LEO-02 | H3 | Ismael y Abraham prueban sus componentes aislados con `mockLiveMetrics` | MVP |
| [ ] | LEO-04 | Construir `HomeMenu.tsx` (Singleplayer / Multiplayer) y `LobbyView.tsx` (PIN estilo *Among Us*, selección de rol, selección de 3 misiones y dificultad) | LEO-02, RUB-02 | H4 | Flujo Menú $\rightarrow$ Lobby sincroniza en vivo con Backend | MVP |
| [ ] | LEO-05 | Construir `LinearStationTrack.tsx`: pista lineal con caminata automática hacia Estación 1 y Estación 2, `ResourceHUD.tsx` en vivo y toasts de mutación | LEO-03, LEO-04 | H6 | El personaje avanza solo entre estaciones y abre `MinigameShell` al llegar | MVP |
| [ ] | LEO-06 | Construir `Flight60sView.tsx`: animación de cohete viajando en el espacio durante 60 s, barra de 4 Nodos, indicador de turno y tarjetas de respuesta de 15 s | LEO-02, RUB-05 | H9 | Al recibir `pregunta_vuelo_60s`, solo el jugador en turno responde y ve reacción del cohete | MVP |
| [ ] | LEO-07 | Construir `MissionReportDashboard.tsx`: veredicto (`FULL_SUCCESS`/`PARTIAL_SUCCESS`/`FAILED`), score 0–1,000, cadena causal, dato NASA y botón `Redesign & Retry` | LEO-02, SCH-04 | H10 | Siempre muestra explicación educativa clara sin importar si ganó o falló | MVP |
| [ ] | LEO-08 | Conectar los 4 minijuegos de Oleada 1 (`Rol1A`–`Rol4A`) en `LinearStationTrack` para el Corte Vertical H10 | LEO-05, ISM-01, ISM-02, ABR-03, ABR-04 | H10 | Partida completa jugable con los 4 roles de Estación 1 reales | MVP |
| [ ] | LEO-09 | Conectar los 4 minijuegos de Oleada 2 (`Rol1B`–`Rol4B`) y pulir animaciones *Paper Mario* en todas las vistas | LEO-08, ISM-03, ISM-04, ABR-05, ABR-06 | H15 | Los 8 minijuegos corren integrados en pista lineal de extremo a extremo | MVP |

---

### Ismael (`ISM`) — Minijuegos 2D de Nave, Masa, Vehículo de Lanzamiento y Presupuesto

| ✓ | ID | Tarea | Depende de | Para | Terminado cuando | Prioridad |
|---|---|---|---|---|---|---|
| [ ] | ISM-01 | `Rol2A_TopologicalAssembly.tsx` (*Spacecraft Design*): armar la nave en orden (Cuerpo $\rightarrow$ Paneles $\rightarrow$ Escudo $\rightarrow$ Tornillos $\rightarrow$ Cables) | LEO-03 | H6 | Probado en `/dev-sandbox`; avisa qué piezas puso y entrega masa + escudo térmico | MVP |
| [ ] | ISM-02 | `Rol1A_BudgetTable.tsx` (*Budgets*): repartir 10 monedas en 3 cajas + 2 cartas de gastos urgentes | LEO-03 | H8 | Emite en vivo el presupuesto de ciencia/energía y reserva; funciona en PC y celular | MVP |
| [ ] | ISM-03 | `Rol1B_LauncherAuction.tsx` (*Launch Vehicles*): elegir cohete (*Electron*, *Falcon 9*, *Vulcan*, *Falcon Heavy*, *Rideshare*) viendo si cabe el peso | LEO-03, ABR-01 | H12 | Indica en verde/rojo en tiempo real si la masa del equipo cabe en el cohete elegido | MVP |
| [ ] | ISM-04 | `Rol2B_MassBalanceTask.tsx` (*Mass & CG*): colocar las piezas de los compañeros en los cuadritos hasta centrar el punto en el círculo verde | LEO-03 | H14 | Actualiza el equilibrio en vivo y tiene el botón rojo para tirar peso extra | MVP |

---

### Schoenstadt (`SCH`) — Concurrencia Causal, Física, Randomizer y Vuelo de 60 Segundos

| ✓ | ID | Tarea | Depende de | Para | Terminado cuando | Prioridad |
|---|---|---|---|---|---|---|
| [x] | SCH-01 | Definir esquemas Pydantic en `backend/models/session.py` (`MissionSessionConfig`, `ConsolidatedMissionState`, `FlightQuestionNode`, `MissionResolutionOutcome`) | — | H2 | Importa limpio y valida payloads de las 3 misiones | MVP |
| [x] | SCH-02 | Implementar `backend/physics_engine.py`: WGS84, Tsiolkovsky, FSPL, CG y función `compute_live_metrics(partial_state)` para concurrencia en vivo entre estaciones | SCH-01 | H4 | Pasa tests `pytest` en `backend/tests/test_engine.py` contra `06-datos-nasa.md` | MVP |
| [x] | SCH-03 | Implementar `backend/randomizer.py` (Oleada 1 por arquetipos y Oleada 2 con *Constraint-Aware Clamping* acoplado al estado humano) | SCH-01, SCH-02 | H6 | Partidas simuladas de 1, 2 y 3 jugadores generan configuraciones consistentes sin fallos absurdos | MVP |
| [x] | SCH-04 | Implementar `backend/decision_tree.py`: compuertas deterministas de 4 Nodos (`NODE_1_LAUNCH` a `NODE_4_DOWNLINK`), puntaje 0–1,000 y explicaciones causales NASA | SCH-02, ABR-01 | H6 | Tests unitarios validan casos `FAILED`, `PARTIAL_SUCCESS` y `FULL_SUCCESS` con explicación exacta | MVP |
| [x] | SCH-05 | Diseñar e implementar `backend/story_tree.json` + evaluador de turnos del **Vuelo 60s**: 4 rondas por partida con ramificación por estado real (masa al límite, CG 1.5x, sin escudo, baja batería, poca UFE, conjunción solar) | SCH-04, ABR-01 | H9 | Cada misión (M1/M2/M3) tiene múltiples casos condicionales que reaccionan a las decisiones de las estaciones | MVP |

---

### Abraham (`ABR`) — Datos NASA, Motor Espectral y Minijuegos Científicos/3D

| ✓ | ID | Tarea | Depende de | Para | Terminado cuando | Prioridad |
|---|---|---|---|---|---|---|
| [ ] | ABR-01 | Completar `frontend/src/data/nasa_catalog.json` y `backend/models/subsystems.py` con todos los datos verificados de MRO, Artemis, OSIRIS-REx, cohetes, órbitas e instrumentos con `"fuente"` | — | H3 | Ningún número en el catálogo carece de `"fuente"` verificada o marcada como balance | MVP |
| [ ] | ABR-02 | Integrar `backend/logica/` y `backend/juegos_espectrales/` (`Vector`, `AnalizadorFTIR` protegido en `_p0_inicial`, `Plantilla.puede`, `puntaje.emparejar`, `adaptadores_web.py`) | ABR-01 | H5 | `adaptadores_web.py` genera y califica retos para M1, M2, M3 y *Espectro Hacker* por HTTP/WS | MVP |
| [ ] | ABR-03 | `Rol3A_OrbitalSniper.tsx` (*Orbital Constraints*): selector órbita/ruta (LEO/SSO/MEO/GEO o dilemas M1–M3) + motor (Hidracina/Biprop/Hall) con cálculo FSPL y $\Delta v$ en vivo | LEO-03, ABR-01 | H7 | Probado en `/dev-sandbox`; actualiza `fspl_loss_db` y `propellant_mass_kg` en `onLiveMutation` | MVP |
| [ ] | ABR-04 | `Rol4A_SpectralLabTask.tsx` (*Science + Spectral*): selector de instrumentos NASA + calibración gráfica con marcas sobre espectro real enviado por `adaptadores_web.py` | LEO-03, ABR-02 | H8 | Devuelve `selected_instruments` y `spectral_marks` para cálculo real de $F_1$ en servidor | MVP |
| [ ] | ABR-05 | `Rol4B_CommsSpectralHacker.tsx` (*Comms + Data*): osciloscopio DSN con deriva (agravada si `!cg_balanced`) + limpieza/clave DTMF (*Espectro Hacker*) + slider bitrate | LEO-03, ABR-02 | H13 | Compensa FSPL para alcanzar $\ge +3.0\text{ dB}$ y verifica watts vs. `liveMetrics.available_power_w` | MVP |
| [ ] | ABR-06 | `Rol3B_AstroLogistics3D.tsx` (*Power 3D*): escena Three.js con rover recolectando Química/Baterías/Celdas $\text{H}_2$ (capacidad máx. 3, spawn rate según `funding_factor_F`) | LEO-03 | H14 | Corre fluido en navegador con teclado WASD + joystick táctil y emite `total_energy_mj` / `battery_reserve_pct` | MVP |

---

### Entrega (`ENT`) y Pruebas (`QA`)

| ✓ | ID | Tarea | Depende de | Para | Terminado cuando | Prioridad |
|---|---|---|---|---|---|---|
| [ ] | ENT-01 | Mantener `referencias.md` con todas las fuentes NASA y librerías externas desde la hora 1 | — | H2 | Archivo completo en la raíz del repositorio | MVP |
| [ ] | QA-01 | Prueba de Corte Vertical (1 y 2 jugadores) en red local | LEO-08, RUB-05 | H10 | Flujo completo sin crasheos | MVP |
| [ ] | QA-02 | Prueba Multiplayer real (4 dispositivos simultáneos por PIN) + Singleplayer en las 3 misiones | LEO-09, SCH-05 | H16 | Concurrencia en vivo y turnos de 60 s validados sin desincronización | MVP |
| [ ] | QA-03 | Prueba con jugador externo al equipo (juez/amigo) jugando una partida de 5 min sin instrucciones habladas | RUB-06, QA-02 | H20 | Completa la partida y explica una razón real por la que ganó o falló | MVP |
| [ ] | ENT-02 | Grabar video demo de **$\le 30\text{ s}$** en inglés siguiendo el guion de `11-entrega.md` | QA-02 | H21 | Video cronometrado $\le 30.0\text{ s}$ con subtítulos legibles | MVP |
| [ ] | ENT-03 | Redactar página del proyecto en inglés (resumen, cómo funciona, datos NASA, link jugable, referencias y declaración de IA) | ENT-01, RUB-06 | H22 | Revisada por dos integrantes distintos | MVP |
| [ ] | ENT-04 | Enviar entrega oficial en Space Apps 2026 | ENT-02, ENT-03 | H23 (14:00 h) | Confirmación recibida 1 hora antes del cierre | MVP |

---

## Extras (Solo después de H18 si todo lo anterior está en `[x]` y sin bugs graves)

| ✓ | ID | Extra | Dueño | Terminado cuando |
|---|---|---|---|---|
| [ ] | EXT-01 | Sonidos CC0 / Web Audio API + botón Mute | Leonardo | Feedback sonoro en estaciones, alertas 60 s y podio |
| [ ] | EXT-02 | Cortinillas de papel doblado y `canvas-confetti` en `FULL_SUCCESS` | Leonardo | Transiciones extra sin bajar FPS |
| [ ] | EXT-03 | Historial comparativo de intentos en `MissionReportDashboard` al pulsar *Redesign* | Schoenstadt, Leonardo | Muestra intento anterior vs. actual |
