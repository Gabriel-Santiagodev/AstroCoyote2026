# 10 · Técnico: Arquitectura del Monorepo y Contratos de Código

**Qué contiene:** estructura exacta del repositorio (`backend/` + `frontend/`), dependencias oficiales, el **contrato estricto `MinigameProps`** para ensamblar los minijuegos de Ismael y Abraham sin conflictos, esquemas Pydantic y reglas de Git en paralelo.  
**Dueños:** Leonardo, Rubén, Schoenstadt  
**Última actualización:** 2026-11-14 (18:00 h)

---

## 1. Estructura del Monorepo (`backend/` + `frontend/`)

Toda la planeación vive en `docs/` y la raíz conserva la arquitectura maestra. El código del juego ya cuenta con su árbol completo de carpetas y archivos base en `backend/` y `frontend/`:

```text
space-apps-juego/
├── docs/                              # Documentación viva + Roadmaps 17 a 21 + Guía 22
├── herramientas/combinar.mjs          # Regenera proyecto-completo.md
├── AGENTS.md                          # Reglas para humanos y agentes de IA (auto-setup)
├── COMO_TRABAJAR.md                   # Guía rápida de flujo en paralelo y merge
├── package.json                       # Scripts raíz (setup, dev, build, test, combine-docs)
├── requirements.txt                   # Redirige a backend/requirements.txt (-r backend/requirements.txt)
├── proyecto-completo.md               # Contexto único generado
├── referencias.md                     # Fuentes NASA, librerías e IA
├── backend/
│   ├── requirements.txt               # fastapi, uvicorn, python-socketio, pydantic, numpy, scipy, pytest
│   ├── main.py                        # App FastAPI + ASGI Socket.IO (Dueño: Rubén)
│   ├── game_manager.py                # Salas por PIN, timers 30s/60s, concurrencia en vivo (Dueño: Rubén)
│   ├── physics_engine.py              # WGS84, Tsiolkovsky, FSPL, CG, UFE y mutaciones vivas (Dueña: Schoenstadt)
│   ├── randomizer.py                  # IA Constraint-Aware Clamping para roles vacíos (Dueña: Schoenstadt)
│   ├── decision_tree.py               # Evaluador determinista de los 4 Nodos y puntaje (Dueña: Schoenstadt)
│   ├── story_tree.json                # Árbol de preguntas/crisis para el Vuelo 60s (Dueña: Schoenstadt)
│   ├── models/
│   │   ├── session.py                 # Esquemas Pydantic de sesión/vuelo (Dueña: Schoenstadt)
│   │   └── subsystems.py              # Catálogo tipado sincronizado con nasa_catalog.json (Dueño: Abraham)
│   ├── logica/                        # Núcleo analítico heredado (Vector, AnalizadorFTIR, LineaBase, modelos - Abraham)
│   ├── juegos_espectrales/            # Generador espectral, biblioteca NIST/DTMF, puntaje.py, adaptadores_web.py (Abraham)
│   └── tests/
│       └── test_engine.py             # Tests unitarios pytest (Dueña: Schoenstadt)
└── frontend/
    ├── package.json                   # React 18, TS, Vite, Tailwind, Framer Motion, Three.js, Socket.IO, Lucide
    ├── index.html                     # Tipografía y montaje root
    ├── tsconfig.json                  # TypeScript strict
    ├── vite.config.ts                 # Servidor Vite --host en puerto 5173
    ├── tailwind.config.js             # Paleta Paper Mario x Among Us + fuentes
    ├── postcss.config.js              # Pipeline PostCSS/Tailwind
    └── src/
        ├── main.tsx                   # Entrada React
        ├── App.tsx                    # Máquina de vistas + ruta /dev-sandbox
        ├── index.css                  # Utilidades .paper-card / .paper-btn
        ├── socket.ts                  # Cliente Socket.IO centralizado
        ├── types/game.ts              # CONTRATO SAGRADO: RoleType, LiveMetrics, MinigameProps
        ├── data/nasa_catalog.json     # Single Source of Truth de datos NASA (Dueño: Abraham)
        ├── components/
        │   ├── paper/                 # CrewmateAvatar.tsx, PaperCard.tsx, Starfield.tsx, ResourceHUD.tsx (Leonardo)
        │   ├── MinigameShell.tsx      # Envoltorio común: timer 30s, 1-toma, mutacion_en_vivo, fallback (Leonardo)
        │   └── minigames/             # 8 componentes autocontenidos (4 de Ismael, 4 de Abraham)
        │       ├── Rol1A_BudgetTable.tsx          # Ismael
        │       ├── Rol1B_LauncherAuction.tsx      # Ismael
        │       ├── Rol2A_TopologicalAssembly.tsx  # Ismael
        │       ├── Rol2B_MassBalanceTask.tsx      # Ismael
        │       ├── Rol3A_OrbitalSniper.tsx        # Abraham
        │       ├── Rol3B_AstroLogistics3D.tsx     # Abraham
        │       ├── Rol4A_SpectralLabTask.tsx      # Abraham
        │       └── Rol4B_CommsSpectralHacker.tsx  # Abraham
        └── views/
            ├── HomeMenu.tsx               # Singleplayer / Multiplayer (Leonardo)
            ├── LobbyView.tsx              # PIN estilo Among Us + Rol + 3 Misiones/Dificultad (Leonardo)
            ├── LinearStationTrack.tsx     # Pista lineal automática Estación 1 -> Sync -> Estación 2 (Leonardo)
            ├── Flight60sView.tsx          # Cohete en el espacio + 4 rondas por turnos (Leonardo)
            ├── MissionReportDashboard.tsx # Retroalimentación causal NASA siempre presente (Leonardo)
            └── DevSandboxView.tsx         # Ruta aislada /dev-sandbox para Ismael y Abraham (Leonardo)
```

---

## 2. Contrato Sagrado de Minijuegos (`frontend/src/types/game.ts`)

**Regla de ensamblaje LEGO:** Ismael (`Rol1A`, `Rol1B`, `Rol2A`, `Rol2B`) y Abraham (`Rol3A`, `Rol3B`, `Rol4A`, `Rol4B`) desarrollan cada minijuego como un componente **100 % autocontenido** que recibe exactamente `MinigameProps`. Así Leonardo puede conectarlos dentro de `MinigameShell` en minutos sin tocar la lógica interna de cada minijuego.

```typescript
export type RoleType = "finance_launch" | "spacecraft_mass" | "orbit_power" | "science_comms";
export type DifficultyType = "easy" | "medium" | "hard";
export type MissionIdType = "artemis_moon" | "asteroid_hunter" | "mars_sample_return";

export interface LiveMetrics {
  estimated_wet_mass_kg: number;
  remaining_budget_usd: number;
  ufe_reserve_pct: number;
  funding_factor_F: number;       // 0.0 a 1.0 (afecta Rol 3B)
  fspl_loss_db: number;           // Pérdida señal por órbita (afecta Rol 4B)
  cg_balanced: boolean;
  fuel_burn_multiplier: number;   // 1.0 nominal | 1.5 desbalanceado
  available_power_w: number;
  instruments_mass_kg: number;
  selected_instruments: Array<{ id: string; name: string; mass_kg: number }>;
  required_dv_ms: number;
  has_thermal_protection: boolean;
}

export interface MinigameProps {
  missionId: MissionIdType;
  difficulty: DifficultyType;
  roleId: RoleType;
  wave: 1 | 2;
  timeLeftSec: number;            // Controlado por MinigameShell / servidor (30 -> 0)
  liveMetrics: LiveMetrics;       // Estado EN VIVO afectado por tus compañeros
  spectralChallenge?: any;        // Solo para Rol 4A y 4B (enviado por adaptadores_web.py)
  /** Llamar cada vez que el jugador mueva un parámetro para mutar barras de compañeros en vivo */
  onLiveMutation: (partialDelta: Record<string, unknown>) => void;
  /** Llamar al confirmar su única toma (o se dispara auto-submit cuando timeLeftSec === 0) */
  onSubmitTake: (finalPayload: Record<string, unknown>) => void;
  isLocked: boolean;
}
```

### Payloads exactos que cada minijuego debe entregar en `onSubmitTake(finalPayload)`

| Minijuego | Campos exactos en `finalPayload` |
|---|---|
| `Rol1A_BudgetTable` | `{ budget_engineering_usd, budget_science_usd, ufe_reserve_pct, funding_factor_F, subsystems_cost_usd }` |
| `Rol1B_LauncherAuction` | `{ selected_launcher, launcher_max_mass_kg, fairing_ok, launch_cost_usd }` |
| `Rol2A_TopologicalAssembly` | `{ bus_dry_mass_kg, has_thermal_protection, assembly_integrity_pct, has_deorbit_device }` |
| `Rol2B_MassBalanceTask` | `{ cg_balanced, fuel_burn_multiplier, mass_growth_margin_pct, ballast_jettisoned_kg }` |
| `Rol3A_OrbitalSniper` | `{ trajectory_choice, required_dv_ms, isp_seconds, propellant_mass_kg, max_eclipse_min, fspl_loss_db }` |
| `Rol3B_AstroLogistics3D` | `{ power_source, total_energy_mj, power_generation_w, battery_reserve_pct }` |
| `Rol4A_SpectralLabTask` | `{ instruments_mass_kg, instruments_power_w, data_generated_gbit, science_value, has_visual_autonomy, selected_instruments, spectral_marks }` |
| `Rol4B_CommsSpectralHacker` | `{ link_margin_db, downlink_rate_mbps, downlink_efficiency, dtmf_code_ok, solar_conjunction_warning }` |

---

## 3. Contratos Pydantic en Backend (`backend/models/session.py`)

El backend valida cada entrada/salida con Pydantic v2 (ver definición completa de `MissionSessionConfig`, `ConsolidatedMissionState` y `MissionResolutionOutcome` en `arquitectura_integral_y_motor_espectral_nasa_space_apps_2026.md` §10), añadiendo el modelo para las rondas del vuelo de 60 segundos:

```python
class FlightQuestionOption(BaseModel):
    option_id: str
    label: str
    engineering_tradeoff_hint: str
    delta_effects: dict  # ej. {"battery_reserve_pct": -5, "downlink_efficiency": 1.0}

class FlightQuestionNode(BaseModel):
    question_id: str
    gate: Literal["NODE_1_LAUNCH", "NODE_2_PROPULSION", "NODE_3_EVENT", "NODE_4_DOWNLINK"]
    assigned_role: RoleType
    title: str
    scenario_context: str
    nasa_concept_badge: str
    options: list[FlightQuestionOption]
```

---

## 4. Integración del Motor Espectral (`logica/` + `juegos_espectrales/`)

Para garantizar 0 bloqueos en la web durante los 30 s del Rol 4:
1. `Vector` acepta `variable` (`Absorbancia`, `Transmitancia`, `Intensidad`, `Reflectancia`) y `unidadX` (`cm-1`, `nm`, `Hz`).
2. `AnalizadorFTIR.Deconvolucion` protege `_p0_inicial` con bordes sintéticos cuando no haya depresiones intermedias.
3. `Plantilla.puede(paso)` devuelve `(False, motivo_educativo)` y aplica penalización leve ($-3\text{ pts}$) sin lanzar excepción fatal.
4. `adaptadores_web.py` envía máximo $500$ puntos `(x, y)` preservando picos y fallos por WebSocket/JSON, incluye `educational_guide` por juego y califica las marcas en servidor con `puntaje.emparejar(..., tolerancia)`. Además expone `generar_reto_juego(...)` (los 8 arquetipos), `ejecutar_accion_espectral(...)` (interacción paso a paso con `Vector`/`AnalizadorFTIR`/`Plantilla`) y `cargar_espectro_csv(...)` / `datos_reales/<mission_id>.csv` para enchufar espectros experimentales reales sin cambiar el contrato frontend.

---

## 5. Reglas de Git y Trabajo en Paralelo (24 Horas)

- **Propiedad estricta de carpetas (Cero conflictos de merge):**
  - `backend/main.py`, `backend/game_manager.py` $\rightarrow$ **Rubén**
  - `backend/models/session.py`, `backend/physics_engine.py`, `backend/randomizer.py`, `backend/decision_tree.py`, `backend/story_tree.json`, `backend/tests/test_engine.py` $\rightarrow$ **Schoenstadt**
  - `backend/models/subsystems.py`, `backend/logica/`, `backend/juegos_espectrales/`, `frontend/src/data/nasa_catalog.json`, `Rol3A`, `Rol3B`, `Rol4A`, `Rol4B` $\rightarrow$ **Abraham**
  - `Rol1A`, `Rol1B`, `Rol2A`, `Rol2B` $\rightarrow$ **Ismael**
  - `frontend/src/views/*`, `frontend/src/components/paper/*`, `MinigameShell.tsx` $\rightarrow$ **Leonardo**
- **Sandbox de prueba aislada:** Leonardo creará la ruta local `/dev-sandbox` (`DevSandboxView.tsx`) donde Ismael y Abraham pueden renderizar y probar cada uno de sus 8 minijuegos en solitario con `mockLiveMetrics` antes de conectar el Socket.IO real.
- **`main` siempre compila y arranca:** Nunca hacer `git push` directo con código roto; usar ramas cortas por tarea (`feat/ism-rol2a`, `feat/sch-60s-tree`) y revisar que pase `npm run build` / `pytest` antes de integrar.

### Extensión opcional de `LiveMetrics` (2026-11-15)

Campos **opcionales** añadidos (no se renombró ninguno) para los recursos del reto *Data* y *Time*, calculados en `backend/physics_engine.compute_live_metrics`:

| Campo | Significado | Origen |
|---|---|---|
| `data_generated_gbit_day?` | Datos científicos por día | Suma de `data_gbit_day` de los instrumentos (Rol 4A, catálogo) |
| `downlink_rate_mbps?` | Velocidad del enlace | Rol 4B |
| `downlink_hours_needed?` | Horas de contacto por día necesarias = datos ÷ (Mbps × 3.6) | Conversión de unidades |
| `mission_duration_days?` | Días de viaje de la ruta elegida | `mission_routes[].transit_days` del catálogo |
| `dry_mass_kg?` | Masa seca del cuerpo de la nave tras Rol 2A/2B (2026-11-15) | `physics_engine.compute_live_metrics`; Rol 3A dimensiona el combustible con ella + instrumentos |

Si las horas necesarias superan 24 h/día, la compuerta `NODE_4_DOWNLINK` se degrada y el reporte explica el cuello de botella (`decision_tree.data_return_ratio`).
