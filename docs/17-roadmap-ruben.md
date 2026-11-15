# 17 · Roadmap Paso a Paso: Rubén (Líder, Backend Socket.IO, Integración y Deploy)

**Tu misión en estas 24 horas:** Ser el director técnico de orquestación. Mientras **Schoenstadt** calcula la física/decisiones y **Leonardo** construye la UI principal, tú levantas el servidor en tiempo real (`FastAPI + Socket.IO`), mantienes vivas las salas por PIN con **concurrencia en paralelo entre estaciones**, coordinas las integraciones y despliegas el juego en red local e internet antes del cierre.

---

## Árbol exacto de carpetas y archivos donde trabajas

Todos estos archivos ya existen en el repositorio listos para que tu agente trabaje directamente sobre ellos (no modifiques los archivos de otros compañeros):

```text
space-apps-juego/
├── referencias.md                   # Fuentes NASA, librerías externas y declaración IA (ENT-01)
├── backend/
│   ├── requirements.txt             # Dependencias Python (FastAPI, python-socketio, Pydantic, NumPy, SciPy)
│   ├── main.py                      # TUYO: Servidor FastAPI + ASGI Socket.IO + /health + CORS (RUB-01)
│   └── game_manager.py              # TUYO: Salas por PIN, relojes 30s/5s/60s y concurrencia en vivo (RUB-02..05)
└── frontend/
    └── src/
        └── socket.ts                # COMPARTIDO CON LEONARDO: Conexión Socket.IO hacia backend
```

---

## Paso 0 · Arranque del Proyecto (H0 – H1 | Sáb 15:00 – 16:00 h)

1. Confirma con todo el equipo el repaso rápido de `docs/03-decisiones.md` y `docs/12-roles.md` (máximo 15 minutos, no más debate).
2. Revisa que `referencias.md` ya está en la raíz (`ENT-01`) y pide a todos ir anotando ahí sus librerías y enlaces NASA desde la hora 1.
3. Verifica que Python 3.11+ y Node 20+ estén instalados en las laptops de desarrollo.

---

## Paso 1 · Levantar `backend/main.py` con FastAPI + Socket.IO (`RUB-01` | Meta: H1)

1. Revisa `backend/requirements.txt` e instala en un entorno virtual:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r backend/requirements.txt
   ```
2. En `backend/main.py`, monta `socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")` dentro de `FastAPI` mediante `socketio.ASGIApp(sio, other_asgi_app=app)`.
3. Agrega el endpoint `GET /health` devolviendo `{"status": "ok"}` y `GET /api/catalog` sirviendo el catálogo de Abraham si hace falta.
4. Ejecuta y verifica en consola:
   ```bash
   uvicorn backend.main:socket_app --host 0.0.0.0 --port 8000 --reload
   ```

---

## Paso 2 · Salas tipo *Among Us / Kahoot* en `backend/game_manager.py` (`RUB-02` | Meta: H3)

Implementa los eventos de sala respetando **exactamente** los nombres de `docs/08-controles.md`:
- `crear_sala`: Genera PIN único de 6 caracteres (ej. `MARS26`), guarda modo (`"single"` o `"multi"`), agrega al creador y responde `sala_creada`.
- `unirse_sala`: Valida que el PIN exista y haya $< 4$ jugadores humanos; agrega al jugador y hace `emit("estado_sala_actualizado", ..., room=pin)`.
- `seleccionar_rol_mision`: Asigna el rol (`finance_launch`, `spacecraft_mass`, `orbit_power`, `science_comms`) evitando que dos jugadores tomen el mismo rol, y actualiza `mission_id` y `difficulty`.
- `iniciar_partida`:
  1. Detecta los roles humanos vs. los roles vacíos.
  2. Llama a `randomizer.synthesize_ai_role_wave1(...)` de **Schoenstadt** para llenar los roles vacíos.
  3. Llama a `adaptadores_web.generar_reto_oleada1(...)` de **Abraham** para preparar el espectro del Rol 4A.
  4. Emite `iniciar_oleada_1` e inicia la tarea asíncrona del cronómetro de **30 segundos**.

---

## Paso 3 · Concurrencia en Vivo y Sincronización de Estaciones (`RUB-03`, `RUB-04` | Meta: H6 – H8)

Esta es la pieza clave que pidió el reto ("decisiones paralelas que se afectan en cadena"):

1. **Concurrencia en tiempo real (`accion_parcial_minijuego`):**
   - Cada vez que un jugador mueva una ficha, seleccione un cohete o cambie su órbita en su estación, su cliente emite `accion_parcial_minijuego` con `partial_delta`.
   - `backend/game_manager.py` actualiza el diccionario parcial de esa sala, invoca `physics_engine.compute_live_metrics(room.live_state)` de **Schoenstadt** y emite **`mutacion_en_vivo`** a toda la sala (`room=pin`) con un `toast_alert` corto en inglés cuando cruce un umbral (ej. `"Orbit set to GEO: FSPL jumped to 191.5 dB!"`).
2. **Bloqueo de toma y avance automático de Oleada (`bloquear_toma_minijuego`):**
   - Guarda el resultado final del rol en `room.wave1_takes[role_id]` y emite `jugador_bloqueo_toma`.
   - Cuando todos los humanos bloquearon su toma **o cuando el reloj de 30 s llega a 0**, cancela el timer restante, consolida Oleada 1, llama a `randomizer.synthesize_ai_role_wave2(...)` (Schoenstadt) + `adaptadores_web.generar_reto_hacker(...)` (Abraham), espera **5 segundos** (para que el avatar camine en `LinearStationTrack` hacia Estación 2) y emite **`iniciar_oleada_2`**.
   - Al concluir los 30 s de Oleada 2, congela `ConsolidatedMissionState` y lanza el Paso 4.

---

## Paso 4 · Orquestador del Vuelo de 60 Segundos (`RUB-05` | Meta: H10)

1. Emite `iniciar_vuelo_60s` con `total_duration_sec: 60` y el estado consolidado.
2. Ejecuta un bucle de **4 rondas** (`round = 1, 2, 3, 4`):
   - Pide al módulo de **Schoenstadt** (`story_tree.json` / `decision_tree.py`) la pregunta/crisis correspondiente a esa compuerta (`NODE_1_LAUNCH` $\rightarrow$ `NODE_2_PROPULSION` $\rightarrow$ `NODE_3_EVENT` $\rightarrow$ `NODE_4_DOWNLINK`) según el estado real con el que llegó la nave.
   - Asigna el turno de forma rotativa entre los jugadores humanos conectados (`active_role`, `active_player_name`; si un rol es IA, reasigna el turno al humano siguiente para que los jugadores siempre participen).
   - Emite `pregunta_vuelo_60s` y espera máximo **15 segundos** a recibir `respuesta_turno_vuelo` (si expira el tiempo, aplica la opción por defecto de espera/seguridad).
   - Emite `resultado_turno_vuelo` (2 segundos de reacción en pantalla) y avanza a la siguiente ronda.
3. Tras la Ronda 4, invoca `decision_tree.evaluate_mission_deployment(mission_id, consolidated_state)` de **Schoenstadt** y emite **`reporte_final_mision`**.

---

## Paso 5 · Integración Continua y Deploy en Red / Nube (`RUB-06` | Meta: H18)

1. **Integración H10 (Corte Vertical):** Revisa en tu laptop que el frontend de Leonardo + los primeros 4 minijuegos (`Rol1A`, `Rol2A` de Ismael; `Rol3A`, `Rol4A` de Abraham) se conecten a tu backend en red local (`http://<TU_IP_LOCAL>:5173`).
2. **Deploy Público (`[ABIERTO A10]`):**
   - Despliega `frontend/` compilado (`npm run build`) en **Vercel / Netlify**.
   - Despliega `backend/` en **Render / Railway / Fly.io** (asegurando soporte WebSocket `wss://` y CORS apuntando a la URL del frontend).
   - Prueba desde un **teléfono con datos móviles (fuera del Wi-Fi)** antes de H20.

---

## Paso 6 · Entrega Final Space Apps (`ENT-02` a `ENT-04` | H20 – H23)

1. Coordina la grabación del video de **$\le 30\text{ s}$** (`11-entrega.md`) a las H21.
2. Publica la página del proyecto en inglés con URL jugable, fuentes NASA, `referencias.md` y declaración de uso de IA.
3. Haz **Submit** oficial a las **14:00 h del domingo (H23)** — 1 hora antes del límite.

---

## Prompt listo para usar con tu Agente de IA

```text
Paso 0 (Automático): Antes de programar, verifica e instala las dependencias de Python corriendo `python -m pip install -r requirements.txt` (o en tu `.venv` activo).
Lee AGENTS.md, docs/08-controles.md, docs/10-tecnico.md, docs/22-como-trabajar-y-hacer-merge.md y docs/17-roadmap-ruben.md.
Ayúdame a implementar únicamente backend/main.py y backend/game_manager.py en Python 3.11 con FastAPI, python-socketio (AsyncServer ASGI) y asyncio.
Requisitos estrictos:
1. Usa EXACTAMENTE los nombres de eventos Socket.IO de docs/08-controles.md (crear_sala, unirse_sala, seleccionar_rol_mision, iniciar_partida, accion_parcial_minijuego, bloquear_toma_minijuego, respuesta_turno_vuelo, reiniciar_partida y sus respuestas del servidor).
2. Maneja diccionarios en memoria por PIN con asyncio.Lock por sala para evitar condiciones de carrera cuando 4 jugadores emitan accion_parcial_minijuego al mismo tiempo.
3. Cuando llegue accion_parcial_minijuego, llama a physics_engine.compute_live_metrics(...) (módulo de Schoenstadt) y emite mutacion_en_vivo a toda la sala.
4. Para Oleada 1 y 2 llama a randomizer (Schoenstadt) y adaptadores_web (Abraham), y para el Vuelo 60s orquesta las 4 rondas de 15s consultando story_tree y decision_tree (Schoenstadt).
5. Implementa temporizadores asíncronos cancelables (30s Oleada 1, 5s transición, 30s Oleada 2, y 4 rondas de 15s para el Vuelo 60s) que nunca dejen la partida colgada si un jugador desconecta.
6. No edites archivos fuera de backend/main.py, backend/game_manager.py y frontend/src/socket.ts.
```
