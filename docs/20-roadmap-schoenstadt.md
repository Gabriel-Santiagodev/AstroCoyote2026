# 20 · Roadmap Paso a Paso: Schoenstadt (Física, Concurrencia Causal, Árbol 4 Nodos y Modo Vuelo 60s)

**Tu misión en estas 24 horas:** Construir el **cerebro lógico, matemático y narrativo determinista** del videojuego. Eres dueña de que la concurrencia en vivo entre estaciones funcione con exactitud científica, de que los jugadores solitarios tengan compañeros IA inteligentes (`randomizer.py`), de que el Árbol de 4 Nodos evalúe con justicia (`decision_tree.py`) y de fabricar el **Árbol de Preguntas y Casos del Vuelo de 60 Segundos (`story_tree.json`)** para que el juego siempre entregue retroalimentación educativa NASA profunda.

---

## Árbol exacto de carpetas y archivos donde trabajas

Todos estos archivos ya existen en el repositorio listos para que tu agente trabaje directamente sobre ellos:

```text
space-apps-juego/
└── backend/
    ├── models/
    │   └── session.py           # TUYO: Esquemas Pydantic v2 (SCH-01)
    ├── physics_engine.py        # TUYO: WGS84, Tsiolkovsky, FSPL, CG y compute_live_metrics (SCH-02)
    ├── randomizer.py            # TUYO: IA adaptativa Constraint-Aware Clamping para 1-3 humanos (SCH-03)
    ├── decision_tree.py         # TUYO: Árbol de 4 Nodos, score 0-1000 y explicación NASA (SCH-04)
    ├── story_tree.json          # TUYO: Casos condicionales por turnos del Vuelo de 60s (SCH-05)
    └── tests/
        └── test_engine.py       # TUYO: Pruebas unitarias pytest para todo tu motor
```

---

## Paso 1 · Contratos Pydantic en `backend/models/session.py` (`SCH-01` | Meta: H2)

Implementa exactamente los esquemas Pydantic v2 definidos en `arquitectura_integral_y_motor_espectral_nasa_space_apps_2026.md` §10 y `docs/10-tecnico.md` §3:
- `RoleType`, `DifficultyType`, `MissionIdType`, `SpectralGameType`
- `MissionSessionConfig`
- `LiveMetrics` (modelo espejo del contrato TypeScript para `mutacion_en_vivo`)
- `ConsolidatedMissionState`
- `FlightQuestionOption`, `FlightQuestionNode`
- `MissionResolutionOutcome`

---

## Paso 2 · Física y Concurrencia en Vivo en `backend/physics_engine.py` (`SCH-02` | Meta: H4)

1. Implementa las fórmulas verificadas de `docs/06-datos-nasa.md` (constantes WGS84 $\mu, R_E, J_2, g_0$):
   - `orbital_velocity_and_period(altitude_km)`
   - `eclipse_duration_min(altitude_km)`
   - `sso_inclination_deg(altitude_km)`
   - `slant_range_km(altitude_km, min_elev_deg=10.0)`
   - `compute_fspl_db(distance_km, freq_ghz)`
   - `compute_propellant_fraction(required_dv_ms, isp_s, fuel_burn_multiplier=1.0)`
   - `compute_cg_distance(placements)`
2. **Función crítica de concurrencia en vivo `compute_live_metrics(room_partial_state: dict) -> LiveMetrics`:**
   - Recibe cualquier combinación parcial de lo que han tocado los 4 jugadores en tiempo real durante la Oleada 1 o 2.
   - Calcula al instante:
     - `estimated_wet_mass_kg` usando Tsiolkovsky sobre `(dry_mass + instruments_mass) / (1 - f_prop)`.
     - `remaining_budget_usd = mission_budget - subsystems_cost - launch_cost`.
     - `fspl_loss_db` actualizado si el Rol 3A cambió órbita/destino.
     - `funding_factor_F` actualizado si el Rol 1A movió fichas.
     - `cg_balanced` y `fuel_burn_multiplier` (`1.0` vs `1.5`) si el Rol 2B movió piezas.
     - `available_power_w` actualizado si el Rol 3B recolectó megajulios o Rol 2A puso paneles/RTG.
   - Esta función es pura y ultrarrápida ($< 1\text{ ms}$) para que **Rubén** la llame en `game_manager.py` ante cada `accion_parcial_minijuego`.

---

## Paso 3 · IA Adaptativa en `backend/randomizer.py` (`SCH-03` | Meta: H6)

Implementa el escalamiento de 1 a 4 jugadores humanos usando el código base de `arquitectura_integral_y_motor_espectral_nasa_space_apps_2026.md` §7:
- `synthesize_ai_role_wave1(role_id, difficulty, mission_budget)` usando pesos por arquetipo (`CONSERVATIVE`, `AMBITIOUS`, `CHALLENGING`), garantizando no sabotear con muerte automática (`has_thermal_protection = True` en IA).
- `synthesize_ai_role_wave2(role_id, difficulty, consolidated_wave1)` usando **Constraint-Aware Clamping**: lee la masa húmeda, presupuesto y factor $F$ reales que dejaron los humanos en Oleada 1 y escoge opciones coherentes pero retadoras.

---

## Paso 4 · Árbol Determinista de 4 Nodos en `backend/decision_tree.py` (`SCH-04` | Meta: H6)

Implementa `evaluate_mission_deployment(mission_id, state) -> MissionResolutionOutcome`:
1. **Nodo 1 (`NODE_1_LAUNCH`):** `wet_mass_kg <= launcher_max_mass_kg` AND `total_cost_usd <= budget_limit_usd` AND `fairing_ok`. Si falla $\rightarrow$ `FAILED` con explicación numérica exacta de exceso de kg o Breach *Nunn-McCurdy*.
2. **Nodo 2 (`NODE_2_PROPULSION`):** calcula `available_dv` con Tsiolkovsky dividido entre `fuel_burn_multiplier` (`1.0` o `1.5`). Si `effective_dv < required_dv_ms` $\rightarrow$ `FAILED` (`DERIVA ORBITAL`), explicando si el culpable fue Hidracina ($225\text{ s}$) o el desbalance de CG del Rol 2B.
3. **Nodo 3 (`NODE_3_EVENT`):** chequea `has_thermal_protection` (reentrada en M1 y M3) y evalúa el evento de la misión (`battery_reserve_pct >= 15%` en M1; `has_visual_autonomy` y `ufe_reserve_pct >= 15%` en M2; `ufe_reserve_pct >= 20%` y `rtg_nuclear` o batería $\ge 25\%$ en M3).
4. **Nodo 4 (`NODE_4_DOWNLINK`):** combina `event_survival_factor`, `comms_factor` (margen $\ge +3.0\text{ dB}$ y `downlink_efficiency`) y `science_calibration_f1` para determinar `FULL_SUCCESS` ($\ge 0.85$) o `PARTIAL_SUCCESS` ($< 0.85$), puntaje de `0` a `1,000` pts (`50%` Objetivo + `30%` Ciencia $F_1$ + `20%` Eficiencia), **siempre adjuntando `causal_chain_explanation` + `nasa_real_world_fact`**.

---

## Paso 5 · Árbol de Preguntas y Casos del Vuelo de 60 Segundos (`SCH-05` | Meta: H9)

Crea `backend/story_tree.json` y una función `select_flight_round_question(round_num, mission_id, state)` en `decision_tree.py` que elija dinámicamente la pregunta según el estado real con el que salió la nave de las estaciones:

### Matriz de Casos Condicionales para las 4 Rondas de 15 s (Textos de UI en inglés)

| Ronda (15 s) | Compuerta evaluada | Caso Condicional A (Nave en Estado Crítico / Al Límite) | Caso Condicional B (Nave en Estado Nominal / Óptimo) |
|---|---|---|---|
| **Ronda 1** (`0–15 s`) | `NODE_1_LAUNCH` *(Max-Q & Staging)* | **Si masa $> 95\%$ capacidad o costo $> 95\%$ presupuesto:** *"Max-Q Structural Alert: Payload margin is razor thin! Choose emergency launch protocol."* (Opciones: usar reserva UFE para refuerzo, eyectar lastre secundario reduciendo ciencia $-10\%$, o mantener perfil nominal arriesgado). | **Si masa y costo tienen buen margen:** *"Nominal Liftoff! Rocket clears tower. How should second-stage burn optimize remaining propellant?"* (Opciones con trade-off entre ahorro de $\Delta v$ o inserción rápida). |
| **Ronda 2** (`15–30 s`) | `NODE_2_PROPULSION` *(Orbit Insertion)* | **Si `!cg_balanced` (`1.5x`) o `available_dv < required_dv * 1.05`:** *"Attitude Thruster Vibration! Off-center CG is burning 1.5x fuel during orbital capture!"* (Opciones: aerofrenado agresivo que estresa escudo térmico, re-trimeo con batería $-10\%$, o quema directa). | **Si CG balanceado y buen $\Delta v$:** *"Approaching target gravity well. Select trajectory insertion strategy."* (Opciones: captura elíptica conservadora vs. órbita baja de alta resolución). |
| **Ronda 3** (`30–45 s`) | `NODE_3_EVENT` *(Contingencia Real)* | **Según misión si falta protección/batería/autonomía/UFE:** M1: *"Cislunar Solar Storm hits under-charged batteries!"* · M2: *"Asteroid dust cloud blinds star tracker!"* · M3: *"Mars dust storm + sample arm jam!"* (Opciones para salvar la misión gastando UFE o entrando a Safe Mode protegiendo la nave). | **Si cumple requisitos de evento:** *"Space environment anomaly detected, but your reserves are strong! How do you exploit the window?"* (Opciones para ganar bono de ciencia o proteger margen). |
| **Ronda 4** (`45–60 s`) | `NODE_4_DOWNLINK` *(DSN & Conjunction)* | **Si `link_margin_db < 3.0` o `downlink_efficiency < 1.0`:** *"Weak DSN Carrier Lock & 160 Gbit Buffer Full! Solar conjunction approaching."* (Opciones: comprimir datos priorizando espectros de alto $F_1$, apagar instrumento secundario para dar Watts a antena, o reintentar envío lento). | **Si enlace DSN nominal ($\ge +3.0\text{ dB}$):** *"High-gain 3 m antenna locked onto Madrid/Goldstone DSN! Choose science downlink priority."* (Opciones para maximizar puntaje científico). |

*Regla pedagógica crítica:* Las decisiones del Vuelo de 60 s pueden rescatar una nave que iba al límite (`PARTIAL_SUCCESS` en vez de `FAILED`, o mejorar puntos) aplicando sus `delta_effects` sobre el estado antes de evaluar `decision_tree.evaluate_mission_deployment(...)`, **pero si un parámetro físico violó una ley dura (ej. exceso enorme de masa en el cohete o cero escudo térmico en reentrada), el Nodo falla honestamente y el reporte explica exactamente por qué**, evitando que el juego parezca trivia arbitraria.

---

## Paso 6 · Tests Unitarios (`pytest`) antes de Integrar

Completa `backend/tests/test_engine.py` validando:
1. Tabla de órbitas de `06-datos-nasa.md` (LEO 350 km $\rightarrow$ FSPL S-band `161.6 dB`, GEO 35,786 km $\rightarrow$ `191.5 dB`).
2. `Rol 2B` desbalanceado reduce el $\Delta v$ efectivo por `1.5x` y dispara `NODE_2_PROPULSION` cuando corresponde.
3. `select_flight_round_question` devuelve nodos válidos para las 3 misiones en estado nominal y en estado crítico.

---

## Prompt listo para usar con tu Agente de IA

```text
Paso 0 (Automático): Antes de empezar, verifica e instala las dependencias de Python ejecutando `python -m pip install -r requirements.txt` si faltan paquetes como pydantic, numpy, scipy o pytest.
Lee AGENTS.md, arquitectura_integral_y_motor_espectral_nasa_space_apps_2026.md, docs/06-datos-nasa.md, docs/10-tecnico.md, docs/22-como-trabajar-y-hacer-merge.md y docs/20-roadmap-schoenstadt.md.
Trabaja únicamente en tus archivos asignados: backend/models/session.py, backend/physics_engine.py, backend/randomizer.py, backend/decision_tree.py, backend/story_tree.json y backend/tests/test_engine.py.
Requisitos estrictos:
1. Usa exclusivamente las constantes WGS84, fórmulas y datos de docs/06-datos-nasa.md y backend/models/subsystems.py (sin inventar números).
2. En physics_engine.py implementa compute_live_metrics(...) pura y rápida para recalcular masa húmeda, FSPL, presupuesto, factor F y CG en vivo ante deltas parciales.
3. En decision_tree.py asegura que tanto FAILED como PARTIAL_SUCCESS y FULL_SUCCESS devuelvan causal_chain_explanation y nasa_real_world_fact claros y educativos en inglés.
4. En story_tree.json crea al menos 24 nodos condicionales (4 rondas x 3 misiones x 2 estados [nominal/crítico]) en inglés para que el modo de 60 segundos refleje fielmente el estado real con el que salió la nave de las estaciones, junto con select_flight_round_question y apply_flight_option.
5. Escribe y corre pytest en backend/tests/test_engine.py para verificar todos los módulos antes de integrar con game_manager.py.
```
