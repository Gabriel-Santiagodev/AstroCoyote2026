# 08 · Interacción Web y Contrato de Eventos Socket.IO

**Qué contiene:** cómo interactúa el jugador en cada pantalla/estación (ratón, táctil y teclado) y el **contrato oficial de eventos Socket.IO** entre Frontend y Backend para garantizar concurrencia en vivo sin conflictos entre compañeros.  
**Dueños:** Rubén, Leonardo  
**Última actualización:** 2026-11-14 (15:00 h)

---

## 1. Controles e interacción del jugador (Web / Móvil)

- **Navegación general (`HomeMenu`, `LobbyView`, `MissionReportDashboard`):** Clic de ratón o toque táctil directo sobre botones estilo recorte de papel; teclas `Enter` / `Espacio` habilitadas en escritorio para confirmación rápida.
- **Movimiento entre estaciones (`LinearStationTrack`):** **Totalmente automático.** El jugador no usa WASD ni flechas para caminar; al concluir el conteo de preparación o la sincronización de 5 s, su avatar *Paper Mario × Among Us* camina automáticamente por la línea hacia la Estación 1 o Estación 2 y abre su minijuego.
- **Minijuegos de Ismael (`Rol1A`, `Rol1B`, `Rol2A`, `Rol2B`) y Abraham (`Rol4A`, `Rol4B`, `Rol3A`):**
  - Interacción basada en **clic, sliders táctiles y *drag-and-drop* compatible con pointer events** (`onPointerDown` / `onPointerMove` / `onPointerUp`, para que funcione idéntico con dedo en celular y mouse en PC) + botones de clic accesibles como respaldo del arrastre.
- **Minijuego 3D (`Rol3B_AstroLogistics3D`):**
  - En PC: `W A S D` o Flechas para mover el rover; en móvil/táctil: joystick virtual en pantalla abajo a la izquierda (`onPointerMove`).
- **Dinámica de Vuelo de 60 Segundos (`Flight60sView`):**
  - Cuando llega tu turno (`active_turn_role === myRole`), aparecen de **2 a 4 tarjetas táctiles grandes de decisión** (también seleccionables con teclas `1`, `2`, `3`, `4` en escritorio) con barra de cuenta regresiva de `15 s`.

---

## 2. Contrato Oficial de Eventos Socket.IO (Concurrencia y Turnos)

**Regla estricta:** Ningún archivo de Frontend o Backend puede inventar ni renombrar un evento fuera de esta tabla sin actualizar primero este documento y correr `node herramientas/combinar.mjs`.

### A. Eventos Cliente $\rightarrow$ Servidor (`emit`)

| Evento | Quién lo emite | Payload (JSON) | Qué provoca en el servidor |
|---|---|---|---|
| `crear_sala` | Host / Singleplayer | `{ "mode": "single" \| "multi", "host_name": str }` | Crea sala en `game_manager.py`, genera PIN de 6 caracteres (ej. `MARS26`) y devuelve `sala_creada`. |
| `unirse_sala` | PlayerPad | `{ "pin": str, "player_name": str }` | Registra al jugador en la sala (máx. 4 humanos) y emite `estado_sala_actualizado`. |
| `seleccionar_rol_mision` | Host / PlayerPad | `{ "pin": str, "player_id": str, "role_id"?: RoleType, "mission_id"?: MissionIdType, "difficulty"?: DifficultyType }` | Asigna rol sin colisiones y actualiza misión/dificultad seleccionada en `estado_sala_actualizado`. |
| `iniciar_partida` | Host / Singleplayer | `{ "pin": str }` | Completa los roles vacíos con `randomizer.py` (Oleada 1), arranca reloj de 30 s y emite `iniciar_oleada_1`. |
| `accion_parcial_minijuego` | PlayerPad (en vivo durante 30 s) | `{ "pin": str, "role_id": RoleType, "wave": 1 \| 2, "partial_delta": dict }` | **Concurrencia en vivo:** recalcula masa estimada, presupuesto UFE, potencia o FSPL al vuelo y difunde `mutacion_en_vivo` a toda la sala para que las barras y restricciones de los compañeros cambien en tiempo real. |
| `bloquear_toma_minijuego` | PlayerPad (botón Confirm o `t = 0`) | `{ "pin": str, "role_id": RoleType, "wave": 1 \| 2, "payload": dict }` | Bloquea la única toma del jugador; cuando todos los humanos terminan Oleada 1, espera 5 s de sync y emite `iniciar_oleada_2`. Al terminar Oleada 2, evalúa nodos y emite `iniciar_vuelo_60s`. |
| `respuesta_turno_vuelo` | PlayerPad (jugador en turno) | `{ "pin": str, "question_id": str, "option_id": str }` | Aplica el ajuste de la decisión del turno sobre el estado de vuelo, resuelve esa ronda y emite `resultado_turno_vuelo` antes de la siguiente ronda (o `reporte_final_mision` tras la ronda 4). |
| `reiniciar_partida` | Host / Singleplayer | `{ "pin": str }` | Limpia el estado de la partida manteniendo a los jugadores en el Lobby para rediseñar y reintentar. |

### B. Eventos Servidor $\rightarrow$ Cliente (`on`)

| Evento | Payload (JSON) | Qué hace el Frontend |
|---|---|---|
| `sala_creada` | `{ "pin": str, "player_id": str }` | Guarda el PIN y transiciona a `LobbyView`. |
| `estado_sala_actualizado` | `{ "pin": str, "players": [...], "mission_id": str, "difficulty": str, "taken_roles": [...] }` | Actualiza avatares *Paper Mario × Among Us* y roles en el Lobby. |
| `iniciar_oleada_1` | `{ "duration_sec": 30, "mission_config": dict, "ai_wave1_state": dict, "initial_constraints": dict }` | Anima el personaje caminando a Estación 1 y abre el minijuego `1A/2A/3A/4A`. |
| `mutacion_en_vivo` | `{ "source_role": str, "live_metrics": { "estimated_wet_mass_kg": float, "remaining_budget_usd": float, "ufe_reserve_pct": float, "funding_factor_F": float, "fspl_loss_db": float, "cg_balanced": bool, "available_power_w": float }, "toast_alert"?: str }` | Actualiza al instante las barras del HUD superior y las restricciones dentro de las estaciones paralelas (ej. bloquea *Electron* si sube la masa o ajusta la deriva en DSN). |
| `jugador_bloqueo_toma` | `{ "role_id": str, "wave": 1 \| 2 }` | Marca al compañero con check verde ("LOCKED") en la pista lineal. |
| `iniciar_oleada_2` | `{ "sync_delay_sec": 5, "duration_sec": 30, "consolidated_wave1": dict, "spectral_challenge"?: dict }` | Anima la caminata automática de Estación 1 $\rightarrow$ Estación 2 (5 s) y abre `1B/2B/3B/4B` con las salidas exactas de Oleada 1. |
| `iniciar_vuelo_60s` | `{ "total_duration_sec": 60, "consolidated_state": dict, "preliminary_gates": dict }` | Cambia de la Pista Lineal a `Flight60sView` (despegue animado del cohete). |
| `pregunta_vuelo_60s` | `{ "round": 1 \| 2 \| 3 \| 4, "duration_sec": 15, "gate": str, "active_role": RoleType, "active_player_name": str, "question": FlightQuestionNode }` | Muestra la crisis espacial, activa los botones de respuesta solo para el jugador en turno (o único jugador) y corre el cronómetro de 15 s. |
| `resultado_turno_vuelo` | `{ "round": int, "chosen_option": str, "immediate_feedback": str, "rocket_health_pct": float, "gate_status": "PASS" \| "DEGRADED" \| "CRITICAL" }` | Dispara feedback visual en el cohete (ej. escudo brillando, corrección de trayectoria o modo seguro) durante 2 s antes de la siguiente pregunta. |
| `reporte_final_mision` | `MissionResolutionOutcome` + `{ "role_contributions": [...], "decision_history": [...] }` | Transiciona a `MissionReportDashboard` mostrando siempre resultado, puntaje (0–1,000), explicación causal y dato real NASA. |
