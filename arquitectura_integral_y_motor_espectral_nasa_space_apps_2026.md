# DOCUMENTO MAESTRO DEFINITIVO: Arquitectura Integral, Roles, Motor Físico-Orbital, Núcleo Espectral, Randomizador IA y Árbol de Decisiones

**Proyecto:** Space Mission Design Game — NASA Space Apps Challenge 2026  
**Stack Técnico:**
* **Frontend (`HostScreen` + `PlayerPad`):** React 18+, TypeScript, Vite, Tailwind CSS, Framer Motion, Three.js (r128+), Lucide React.
* **Backend Autoritativo:** Python 3.11+, FastAPI, `python-socketio`, Pydantic v2, `numpy`, `scipy`.
* **Propósito del Documento:** Servir como **Ventana de Contexto Maestra (Single Source of Truth)** para desarrolladores humanos y agentes de IA trabajando en paralelo. Contiene todas las constantes físicas, ecuaciones, reglas de negocio, mecánicas de los 8 minijuegos, adaptación del motor FTIR (`Vector` / `AnalizadorFTIR`), escalamiento de 1 a 4 jugadores, randomizador funcional acoplado y árbol de resolución de misiones.

---

## 1. Arquitectura del Repositorio Unificado (Monorepo)

Para integrar los módulos web en tiempo real con el motor científico de análisis espectral (`logica/` y `juegos/`) sin colisiones entre ramas de trabajo, el proyecto adopta la siguiente estructura de carpetas:

```text
nasa-space-mission-game/
├── backend/
│   ├── main.py                        # Servidor FastAPI + ASGI Socket.IO
│   ├── game_manager.py                # Controlador de salas por PIN, timers de 30s y turnos
│   ├── physics_engine.py              # Cálculos orbitales WGS84, CG, Tsiolkovsky, FSPL y Rover 3D
│   ├── randomizer.py                  # Motor IA de randomización funcional acoplada (1 a 3 jugadores)
│   ├── decision_tree.py               # Evaluador determinista de los 4 Nodos y generador de bitácora NASA
│   ├── models/
│   │   ├── session.py                 # Esquemas Pydantic (MissionSessionConfig, ConsolidatedMissionState)
│   │   └── subsystems.py              # Catálogos tipados de cohetes, órbitas, instrumentos y eventos
│   ├── logica/                        # NÚCLEO ANALÍTICO HEREDADO (Analizador FTIR)
│   │   ├── vector.py                  # Clase Vector ampliada (Absorbancia, %T, Intensidad, Reflectancia)
│   │   ├── Analizador.py              # AnalizadorFTIR (Línea base, Tracker/Región, Deconvolución)
│   │   ├── proyecto.py                # Persistencia Proyecto > Muestra > Plantilla y Plantilla.puede()
│   │   ├── lineaBase/                 # Detectores (escalar, liga) y correcciones (lineal, Splines)
│   │   └── modelos/                   # 19 funciones de banda (gauss_amp, lorentz, voigt) + MotorSimulacion
│   └── juegos_espectrales/            # FÁBRICA DE RETOS CIENTÍFICOS Y COMMS (Rol 4)
│       ├── nucleo/
│       │   ├── generador.py           # Síntesis de espectros estelares, FTIR, cubos NDVI y tonos DTMF
│       │   ├── puntaje.py             # Función emparejar(marcas, verdad, tol) -> Precisión, Recall, F1
│       │   └── biblioteca.py          # Tablas NIST/IR, líneas de Balmer, fluoróforos y matrices DTMF
│       └── adaptadores_web.py         # Serializador JSON de Vector/Plantilla hacia React PlayerPad
└── frontend/
    ├── src/
    │   ├── data/
    │   │   └── nasa_catalog.json      # Datos verificados 2026 (cohetes, órbitas, instrumentos, URLs NASA)
    │   ├── views/
    │   │   ├── HostScreen.tsx         # Pantalla compartida (tablero central, telemetría, simulación, podio)
    │   │   └── PlayerPad.tsx          # Control móvil individual (renderiza 2 minijuegos de 30s por jugador)
    │   └── components/minigames/
    │       ├── Rol1A_BudgetTable.tsx          # Mesa de Aprobación (10 fichas) y Bóveda de Contingencia UFE
    │       ├── Rol1B_LauncherAuction.tsx      # Subasta de Cofia, Vehículo de Lanzamiento y Placa Rideshare
    │       ├── Rol2A_TopologicalAssembly.tsx  # Montaje Estructural 2D (Chasis, RTG/Paneles, Escudo, Torque/Cables)
    │       ├── Rol2B_MassBalanceTask.tsx      # Balanceo 2D de Centro de Gravedad (CG) y Margen JPL CML 4
    │       ├── Rol3A_OrbitalSniper.tsx        # Selector Orbital (LEO/SSO/MEO/GEO/Ruta) y Ecuación de Tsiolkovsky
    │       ├── Rol3B_AstroLogistics3D.tsx     # Simulador Three.js de Cosecha Energética (Química/Batería/H2)
    │       ├── Rol4A_SpectralLabTask.tsx      # Calibración Espectral de Carga Útil (Estrellas/FTIR/NDVI/Bio)
    │       └── Rol4B_CommsSpectralHacker.tsx  # Osciloscopio DSN (+3 dB) + Espectro Hacker (DTMF y Anomalías)
```

---

## 2. Rama Maestra del Flujo de Partida (Ciclo Cronometrado de 5 Minutos)

Cada partida dura como máximo **5 minutos** y atraviesa **5 fases secuenciales**. En cada misión se ejecutan exactamente **8 decisiones de subsistema** repartidas en **2 Oleadas de 4 minijuegos individuales** (30 segundos por minijuego, modalidad **1 sola toma sin deshacer**):

```text
[FASE 0: LOBBY, SELECCIÓN DE MISIÓN Y ASIGNACIÓN DE ROLES (0:00 - 0:30)]
  ├── Selección de Misión: M1 (Fácil: Luna) | M2 (Media: Asteroide) | M3 (Difícil: Marte MSR)
  ├── Registro de Jugadores Humanos en Sala (N = 1, 2, 3 o 4 celulares conectados por PIN)
  ├── Selección de Roles Humanos (1 rol por persona; en Single Player elige 1 o 2 roles)
  └── Roles Vacíos (4 - N) asignados automáticamente al Motor Randomizador Funcional (IA)
                 │
                 ▼
[FASE 1: OLEADA 1 — ARQUITECTURA Y DISEÑO BASE (0:30 - 1:30 · 30s activos · 1 Toma)]
  ├── Rol 1A (Finanzas): La Mesa de Aprobación / Bóveda UFE ──► Bloquea Presupuesto, UFE % y Factor I+D (F)
  ├── Rol 2A (Diseño Nave): Montaje Estructural Topológico ───► Bloquea Integridad de Bus y Escudo Térmico
  ├── Rol 3A (Órbita/Ruta): Francotirador Orbital y Delta-v ──► Bloquea Altitud/Ruta, Eclipse, FSPL y Propelente
  └── Rol 4A (Ciencia): Laboratorio Espectral e Instrumentos ─► Bloquea Masa Científica, Watts, Gbit y F1_Calib
                 │
                 ▼  (FastAPI procesa el Grafo Causal y muta los límites de la Oleada 2)
[FASE 2: OLEADA 2 — INTEGRACIÓN Y OPERACIÓN CRÍTICA (1:30 - 2:30 · 30s activos · 1 Toma)]
  ├── Rol 1B (Lanzadores): Subasta de Cofia y Rideshare ──────► Valida Masa Húmeda (R2+R3+R4) vs. Cohete y Costo
  ├── Rol 2B (Masa y CG): Balanceo de Centro de Gravedad ─────► Ubica piezas de R4/R3; fija fuel_burn_multiplier
  ├── Rol 3B (Energía 3D): AstroLogistics 3D (Rover Stack) ───► Cosecha MJ con probabilidades fijadas por R1A (F)
  └── Rol 4B (Comms/Data): Osciloscopio DSN + Espectro Hacker ► Compensa FSPL (R3A) y deriva CG (R2B); vacía 160 Gbit
                 │
                 ▼  (Cierre de las 8 Tomas -> Estado Consolidado Inmutable)
[FASE 3: SIMULACIÓN DE VUELO Y EVENTO ALEATORIO EN HOSTSCREEN (2:30 - 4:00)]
  ├── Paso por Compuertas del Árbol de Decisiones (Nodo 1: Despegue -> Nodo 2: Delta-v)
  ├── Disparo de Contingencia Real (Tormenta Solar Kp / Polvo y Micro-rocas / Fallo de Brazo y Tormenta Marciana)
  └── Evaluación de Supervivencia y Telemetría (Nodo 3: Evento/UFE/Batería -> Nodo 4: Descarga DSN * F1_Espectral)
                 │
                 ▼
[FASE 4: REPORTE POST-MISIÓN Y PODIO EDUCATIVO (4:00 - 5:00)]
  ├── Clasificación Final: ÉXITO TOTAL (FULL_SUCCESS) | SEMI-COMPLETADA (PARTIAL_SUCCESS) | FRACASO TOTAL (FAILED)
  ├── Cálculo de Score (0 a 1,000 pts): 50% Objetivo + 30% Ciencia Ponderada + 20% Eficiencia Recursos
  └── Tarjetas de Trazabilidad Científica NASA (Explicación numérica de la cadena causal + botón Reintentar)
```

---

## 3. Especificación Profunda de los 4 Roles y sus 8 Minijuegos (1 Toma)

Los **9 subsistemas del reto** (`Spacecraft design`, `Scientific instruments`, `Launch vehicles`, `Budgets`, `Power`, `Mass`, `Communications`, `Orbital constraints`, `Data`) se distribuyen sin solapamientos en los siguientes **4 Roles**:

---

### ROL 1: Director de Finanzas y Lanzamiento (`Budgets` + `Launch vehicles`)

#### Minijuego 1A (Oleada 1): *La Mesa de Aprobación y Bóveda de Contingencia (UFE)*
* **Fundamento NASA:** Según el *NASA Cost Estimating Handbook* y la directiva **NPR 7120.5**, el vehículo de lanzamiento y el bus consumen entre el $50\%$ y el $60\%$ del presupuesto, los instrumentos científicos entre el $15\%$ y el $25\%$, y se exige mantener una reserva para gastos futuros no asignados (**UFE - Unallocated Future Expenses**) de entre el $25\%$ y el $30\%$ en fase PDR para evitar una cancelación del Congreso (*Nunn-McCurdy Breach*).
* **Mecánica Interactiva en `PlayerPad` (30 s · 1 Toma):**
  1. **Fase de Fichas (0–15 s):** El jugador reparte **10 fichas doradas** (cada una equivale al $10\%$ del presupuesto base de la misión) en tres columnas:
     * *Columna A — Ingeniería e I+D Energético ($n_{\text{ing}}$ fichas):* Define el techo para comprar el cohete y calcula el **Factor de Financiamiento I+D** $F \in [0.0, 1.0]$ que se envía directamente al minijuego 3D de Energía (Rol 3B).
     * *Columna B — Ciencia y Telecomunicaciones ($n_{\text{cie}}$ fichas):* Define el presupuesto disponible para que el Rol 4 compre instrumentos y antenas DSN.
     * *Columna C — Reserva en Bóveda UFE ($n_{\text{ufe}}$ fichas):* Fondo de emergencia inicial ($10\% \times n_{\text{ufe}}$).
  2. **Fase de Bóveda *Push Your Luck* (15–30 s):** Aparecen hasta 2 solicitudes urgentes de otros subsistemas (ej. *"Ciencia solicita $+\$40\text{M}$ para sensor criogénico"* o *"Propulsión solicita $+\$50\text{M}$ para tanque compuesto"*). Si el jugador aprueba sacando dinero de la bóveda por debajo del $25\%$, el dial analógico entra en zona amarilla/roja, incrementando la probabilidad de penalización si ocurre el evento aleatorio en Fase 3.
* **Salidas bloqueadas:** `budget_engineering_usd`, `budget_science_usd`, `ufe_reserve_pct`, `funding_factor_F`.

#### Minijuego 1B (Oleada 2): *Subasta de Cofia, Lanzador y Placa Rideshare*
* **Fundamento NASA / Industria 2026:** Un vehículo de lanzamiento no tiene una capacidad única; su carga máxima cae drásticamente con la altitud o el $\Delta v$ requerido. En vuelos compartidos (*rideshare* SpaceX *Transporter/Bandwagon* Guía v11), la tarifa 2026 es de $\$7,000\text{ USD/kg}$ con mínimos facturables por placa, tope físico de $831\text{ kg}$ por puerto, separadores opcionales de $\$370,500\text{ a }\$692,600\text{ USD}$ ($\ge 6$ meses de antelación) y un multiplicador realista de integración de $1.5\times\text{ a }2.0\times$.
* **Mecánica Interactiva en `PlayerPad` (30 s · 1 Toma):**
  * El jugador recibe en pantalla la **masa húmeda total** acumulada por sus compañeros ($m_{\text{wet}} = m_{\text{bus}} + m_{\text{inst}} + m_{\text{prop}}$), las dimensiones $(D, H)$ y la órbita/destino fijado por el Rol 3A.
  * En una sola toma debe seleccionar:
    1. **Vehículo Dedicado:** *Electron* ($\sim \$9.2\text{M USD}$, $300\text{ kg}$ LEO / $200\text{ kg}$ SSO, cofia $1.2\text{ m}$), *Falcon 9 Block 5* ($\$74\text{M USD}$, $22,800\text{ kg}$ LEO desechable / $17,500\text{ kg}$ recuperable / $5,500\text{ kg}$ GTO / $4,020\text{ kg}$ Marte, cofia $5.2\text{ m} \times 13.1\text{ m}$), *Vulcan Centaur VC6* ($\sim \$120\text{M USD}$, $27,200\text{ kg}$ LEO / $14,400\text{ kg}$ GTO, cofia $5.4\text{ m}$) o *Falcon Heavy* ($\$97\text{M–}\$150\text{M USD}$, $63,800\text{ kg}$ LEO / $16,800\text{ kg}$ Marte).
    2. **Modalidad Rideshare (si la misión es orbital terrestre/cislunar ligera $\le 831\text{ kg}$):** Elegir placa *Quarter* ($50\text{–}300\text{ kg}$, base $\$350,000\text{ USD}$), *Half* ($100\text{–}452\text{ kg}$, base $\$700,000\text{ USD}$), *Full* ($200\text{–}831\text{ kg}$, base $\$1,400,000\text{ USD}$) o *XL* ($300\text{–}831\text{ kg}$, base $\$2,100,000\text{ USD}$), más sistema de separación y remolcador orbital OMV/OTV si requiere cambio de plano.
* **Salidas bloqueadas:** `selected_launcher_id`, `launcher_max_mass_kg`, `fairing_ok` (booleano), `total_launch_cost_usd`.

---

### ROL 2: Arquitecto de Nave y Masa (`Space craft design` + `Mass`)

#### Minijuego 2A (Oleada 1): *Montaje Estructural Topológico (Bus, Reactor/Paneles y Escudo)*
* **Fundamento de Ingeniería:** Basado en los prototipos `Montaje espacial_ energía para naves.html` y `Funcionamiento.txt`. El ensamblaje aeroespacial sigue un grafo dirigido acíclico (DAG) de dependencias estructurales y eléctricas: primero se instala el chasis con aislamiento multicapa (MLI), luego se fijan los subsistemas mecánicos con pernos de titanio y par de apriete controlado (para soportar $\sim 10\text{ g}$ en el lanzamiento), y finalmente se tienden los arneses de cableado redundante o tuberías presurizadas con helio ($\text{He}$).
* **Mecánica Interactiva en `PlayerPad` (30 s · 1 Toma):**
  * **Generación de Orden Aleatorio Válido:** Al iniciar, el algoritmo topológico genera una secuencia de pasos `steps = gen()` donde cada pieza o unión $k$ solo se habilita cuando todas sus dependencias `I[k].dep` están en el conjunto `done`. El orden varía en cada partida, pero el resultado final ensamblado es idéntico.
  * **Acciones del Jugador:** Arrastrar hacia el lienzo central las piezas del bus correspondientes a la misión:
    * *Configuración Solar (Misión 1 / 2):* Chasis (`ch`), Panel Solar Izquierdo/Derecho (`pi`, `pd`), Batería Li-ion (`ba`), Unidad Reguladora PCDU (`pc`) y Escudo Térmico (`sh`), uniéndolos con **Herramienta T1 (Atornillar/Soldar)** en los nodos estructurales y **Herramienta T2 (Cableado)** entre paneles, PCDU y batería.
    * *Configuración Espacio Profundo / Superficie (Misión 2 / 3):* Chasis (`ch`), Antena HGA (`an`), Mástil/Boom (`ma`) para alejar la radiación, Generador Nuclear RTG de $\text{Pu-238}$ (`rt`, vida media $87.7\text{ años}$, efecto Seebeck), Electrónica (`el`), Cristal/Cápsula de Protección y Tanques Hipergólicos ($\text{MMH}/\text{NTO}$ presurizados con $\text{He}$).
  * **Regla de 1 Toma:** Un error de orden o de herramienta registra una falla de ensamblaje que reduce la integridad estructural o deja sin instalar el escudo térmico si se agota el tiempo.
* **Salidas bloqueadas:** `bus_dry_mass_kg`, `has_thermal_protection` (booleano), `assembly_integrity_pct`, `has_deorbit_device` (booleano para regla FCC $\le 5\text{ años}$ en LEO).

#### Minijuego 2B (Oleada 2): *Balanceo de Masa y Centro de Gravedad (`MassBalanceTask.tsx`)*
* **Fundamento NASA (*CubeSat 101* Sec. 6.4 & *JPL CML 4*):** El vector de empuje del motor debe atravesar el Centro de Gravedad (CG) de la nave; una desviación genera un torque parasitario que obliga al sistema de control de actitud (ADCS) a gastar propelente extra. Además, JPL exige un margen de crecimiento de masa (*Mass Growth Allowance*) $\ge 35\%$ en diseño preliminar.
* **Mecánica Interactiva en `PlayerPad` (30 s · 1 Toma):**
  * El jugador recibe en su bandeja izquierda los bloques reales que seleccionaron el Rol 4A (ej. cámara *HiRISE* de $65\text{ kg}$, espectrómetro *CRISM* de $33\text{ kg}$, radar *SHARAD*) y los tanques de propelente del Rol 3A.
  * Debe arrastrar cada módulo hacia las bahías de la retícula cartesiana $(X, Y)$ del chasis. Con cada movimiento se actualizan en tiempo real las coordenadas del Centro de Gravedad:
    $$X_{\text{CG}} = \frac{\sum_{i=1}^{k} m_i x_i}{\sum_{i=1}^{k} m_i}, \qquad Y_{\text{CG}} = \frac{\sum_{i=1}^{k} m_i y_i}{\sum_{i=1}^{k} m_i}, \qquad d_{\text{CG}} = \sqrt{X_{\text{CG}}^2 + Y_{\text{CG}}^2}$$
  * **Condición de Estabilidad:** Si $d_{\text{CG}} \le R_{\text{tol}}$ (donde $R_{\text{tol}}$ es $0.25\text{ m}$ en Fácil, $0.15\text{ m}$ en Media y $0.08\text{ m}$ en Difícil), el indicador pasa a verde (**NOMINAL**).
  * **Botón de Emergencia (`JETTISON BALLAST / LIGHTEN STRUCTURE`):** Si la masa total supera el límite del cohete, el jugador puede aligerar lastre estructural para bajar kilogramos a cambio de reducir el margen estructural.
* **Salidas bloqueadas:** `cg_balanced` (booleano), `fuel_burn_multiplier` ($1.0\times$ si $d_{\text{CG}} \le R_{\text{tol}}$, o $1.5\times$ si despega desbalanceada), `mass_growth_margin_pct`.

---

### ROL 3: Navegante Orbital y Energía (`Orbital constraints` + `Power`)

#### Minijuego 3A (Oleada 1): *Francotirador Orbital, Trayectoria y Ecuación de Tsiolkovsky*
* **Fundamento Físico y Orbital:** El jugador define el régimen orbital o la trayectoria interplanetaria y el tipo de propulsión a bordo, gobernando simultáneamente la cobertura, el tiempo de eclipse, la atenuación de comunicaciones (FSPL) y la fracción de masa de propelente.
* **Mecánica Interactiva en `PlayerPad` (30 s · 1 Toma):**
  1. **Selección de Órbita / Ruta (0–15 s):**
     * En misiones orbitales terrestres o fase de aparcamiento: deslizador entre **LEO** ($350\text{–}550\text{ km}$, alta resolución, eclipse $\sim 35.6\text{–}36.3\text{ min}$ = $37.2\%\text{–}39.7\%$ de la órbita), **SSO** ($700\text{–}800\text{ km}$, inclinación retrógrada $98.19^\circ\text{–}98.60^\circ$, iluminación constante), **MEO** ($20,200\text{ km}$, eclipse $55.44\text{ min}$) y **GEO** ($35,786\text{ km}$, periodo $1,436.07\text{ min}$, eclipse continuo de $69.41\text{ min}$, requiere circularización desde GTO con $\Delta v = 1,803.6\text{ m/s}$ desde Cabo Cañaveral a $27^\circ$).
     * En las 3 misiones principales: elige el dilema de ruta de la misión (*Ruta Directa 3 días* vs. *Retorno Libre 10 días* en Luna; *Sobrevuelo Rápido 15 min* vs. *Inserción Orbital* en Asteroide; *MAV de 15 tubos* vs. *MAV de 30 tubos* en Marte).
  2. **Selección de Motor y Carga de Tanque (15–30 s):** Elige entre **Hidracina Monopropelente** ($I_{sp} = 225\text{ s}$, económica pero exige $55.8\%$ de masa de propelente para $\Delta v = 1,800\text{ m/s}$), **Bipropelente $\text{MMH}/\text{NTO}$** ($I_{sp} = 315\text{ s}$, exige $44.2\%$ de propelente) o **Propulsión Eléctrica de Efecto Hall** ($I_{sp} = 1,600\text{ s}$, exige solo $10.8\%\text{–}10.9\%$ de propelente pero demanda alta potencia eléctrica en Watts del Rol 3B).
* **Salidas bloqueadas:** `orbit_or_route_id`, `required_dv_ms`, `isp_seconds`, `propellant_mass_kg`, `max_eclipse_min`, `fspl_loss_db`.

#### Minijuego 3B (Oleada 2): *AstroLogistics 3D — Cosecha y Almacenamiento Energético (`Three.js`)*
* **Fundamento Físico y Termodinámico:** Basado en `simulador_3d_de_log_stica_y_energ_a_espacial.html` y su especificación técnica `.DMD`. El jugador pilota un rover recolector en una plataforma orbital 3D con capacidad máxima de apilamiento estricto de **$N_{\max} = 3$ paquetes simultáneos** en el nodo `roverCargoMount` antes de descargarlos en el Aro Holográfico Central $(R < 4.6\text{ unidades})$.
* **Propiedades Reales de los 3 Paquetes Energéticos:**

| Tipo de Paquete | Fundamento Termodinámico | Aporte ($\text{MJ}$) | Modificador Cinemático ($\Delta v_i$) | Impacto al Apilar 3 Cajas |
| :--- | :--- | :--- | :--- | :--- |
| **Propulsión Química** *(Naranja)* | Combustión de propergoles. Baja eficiencia energética por unidad de masa, pero ofrece un **empuje instantáneo muy alto**. | $+15\text{ MJ}$ | $+8\%$ velocidad | Velocidad sube al $124\%$, pero solo entrega $45\text{ MJ}$ por viaje. |
| **Baterías Electroquímicas** *(Azul Cian)* | Reacciones químicas reversibles ($80\text{–}90\%$ efic. conversión). **Densidad energética muy baja** $\rightarrow$ muy pesadas. | $+45\text{ MJ}$ | $-14\%$ velocidad | Velocidad cae al $58\%$ ($100\% - 42\%$) por exceso de masa. |
| **Celdas de Combustible $\text{H}_2$** *(Verde/Oro)* | Conversión continua de $\text{H}_2$ en electricidad. **No limitadas por el ciclo de Carnot** $\rightarrow$ altísima eficiencia. | $+100\text{ MJ}$ | $-4\%$ velocidad | Mantiene $88\%$ de velocidad y entrega $300\text{ MJ}$ en una descarga. |

* **Ecuación de Velocidad Efectiva y Acoplamiento con el Rol 1A (Financiamiento I+D):**
  $$V_{\text{efectiva}} = V_{\text{base}} \times \text{clamp}\left(1.0 + \sum_{i=1}^{n} \Delta v_i, \; 0.55, \; 1.30\right), \qquad n \in \{0, 1, 2, 3\}$$
  La probabilidad de aparición (*spawn rate*) de cada paquete en el mapa 3D se interpola linealmente según el **Factor de Financiamiento $F \in [0.0, 1.0]$** que asignó el **Rol 1A** en la Oleada 1:
  * Si el Rol 1A invirtió el mínimo en I+D ($F = 0.0$): $P_{\text{Química}} = 0.70$, $P_{\text{Batería}} = 0.25$, $P_{\text{FuelCell}} = 0.05$.
  * Si el Rol 1A invirtió nivel medio ($F = 0.5$): $P_{\text{Química}} = 0.40$, $P_{\text{Batería}} = 0.40$, $P_{\text{FuelCell}} = 0.20$.
  * Si el Rol 1A invirtió el máximo ($F = 1.0$): $P_{\text{Química}} = 0.15$, $P_{\text{Batería}} = 0.35$, $P_{\text{FuelCell}} = 0.50$.
* **Salidas bloqueadas:** `total_energy_mj`, `power_generation_w`, `battery_reserve_pct`.

---

### ROL 4: Oficial de Ciencia y Telemetría (`Scientific instruments` + `Communications` + `Data`)

#### Minijuego 4A (Oleada 1): *Selección de Instrumentos y Calibración Espectral*
* **Fundamento NASA y Espectroscopía:** Integra el catálogo de instrumentos reales de la NASA (cámara *HiRISE* de $65\text{ kg}$ y $0.3\text{ m/píxel}$, espectrómetro *CRISM* de $33\text{ kg}$, radar *SHARAD* de $40\text{–}90\text{ Gbit/día}$) con el motor analítico de espectroscopía (`Vector`, `AnalizadorFTIR`, `LineaBase`, `Models`).
* **Mecánica Interactiva en `PlayerPad` (30 s · 1 Toma):**
  1. **Armado de Carga Útil (0–10 s):** El jugador selecciona qué instrumentos montar (respetando el presupuesto científico asignado por el Rol 1A) y decide si invierte en el **Piloto Automático Visual** (autonomía a bordo).
  2. **Reto Espectral de Calibración (10–30 s):** Para calibrar los sensores antes del vuelo, el jugador resuelve un micro-reto de 20 segundos generado por `juegos_espectrales/` acorde a la misión (ver Sección 5). La precisión de sus marcas frente a los picos reales (`puntaje.emparejar`) define el factor de calidad científica $F_{1,\text{calib}} \in [0.0, 1.0]$.
* **Salidas bloqueadas:** `instruments_mass_kg`, `instruments_power_w`, `data_generated_gbit`, `has_visual_autonomy`, `science_calibration_f1`.

#### Minijuego 4B (Oleada 2): *Osciloscopio DSN y Espectro Hacker (`CommsLinkTask.tsx` + `08_espectro_hacker`)*
* **Fundamento NASA (*JPL DESCANSO MRO*):** La antena de alta ganancia (HGA de $3\text{ m}$ en MRO) concentra la energía en un haz estrecho hacia la *Deep Space Network (DSN)* exigiendo un margen de enlace $\ge +3.0\text{ dB}$. Opera entre $0.5\text{ y }6.0\text{ Mbps}$ vaciando una memoria de estado sólido de $160\text{ Gbit}$, sujeta a retrasos de luz de $4\text{ a }25\text{ min}$ y apagones por **Conjunción Solar** ($0\text{ Mbps}$ cada $\sim 26\text{ meses}$).
* **Mecánica Interactiva en `PlayerPad` (30 s · 1 Toma):**
  1. **Sub-tarea 1 — Enganche de Antena en Osciloscopio (0–15 s):** El jugador contrarresta la deriva orbital (cuya velocidad de desplazamiento es un $50\%$ más rápida si el Rol 2B falló el balanceo del Centro de Gravedad) para mantener la retícula sobre la Tierra y superar el umbral de $+3.0\text{ dB}$ (compensando la pérdida FSPL generada por la órbita del Rol 3A).
  2. **Sub-tarea 2 — Descifrado *Espectro Hacker* y Bitrate (15–30 s):** En la consola derecha aparece el espectro de la portadora RF con ruido e interferencia solar. El jugador aplica un filtro de limpieza (`LineaBase`), identifica el tono anómalo intruso (`idx_fallos`) o par de frecuencias **DTMF** para desbloquear el enlace y ajusta el deslizador de *Bitrate* ($0.5\text{ a }6.0\text{ Mbps}$) para vaciar el búfer de $160\text{ Gbit}$ por debajo del $40\%$ sin superar los Watts que recolectó el Rol 3B.
* **Salidas bloqueadas:** `link_margin_db`, `downlink_rate_mbps`, `downlink_efficiency` ($1.0$ si supera ambas sub-tareas, $0.5$ si queda degradado), `solar_conjunction_warning` (booleano).

---

## 4. Ecuaciones Físicas y Tablas de Referencia del Motor Autoritativo (`physics_engine.py`)

Todas las validaciones del servidor utilizan las constantes **WGS84 / IAU**:
* Constante gravitacional terrestre: $\mu = 398,600.4418\text{ km}^3/\text{s}^2$
* Radio ecuatorial terrestre: $R_E = 6,378.137\text{ km}$
* Factor de achatamiento terrestre: $J_2 = 1.08262668 \times 10^{-3}$
* Precesión nodal heliosíncrona: $\dot{\Omega}_{\text{SSO}} = \frac{2\pi}{365.2421897 \times 86,400}\text{ rad/s} \approx 0.9856^\circ/\text{día}$
* Gravedad estándar: $g_0 = 9.80665\text{ m/s}^2$

### A. Fórmulas Analíticas en Tiempo Real (Con radio orbital $r = R_E + h$)

1. **Velocidad y Periodo Orbital Circular:**
   $$v = \sqrt{\frac{\mu}{r}}, \qquad T = 2\pi\sqrt{\frac{r^3}{\mu}}$$
2. **Fracción y Duración Máxima de Eclipse (Sombra cilíndrica, ángulo $\beta = 0$):**
   $$\rho = \arcsin\left(\frac{R_E}{r}\right), \qquad f_{\text{ecl}} = \frac{\rho}{\pi}, \qquad T_{\text{ecl, min}} = f_{\text{ecl}} \cdot T_{\text{min}}$$
3. **Inclinación Heliosíncrona (SSO) con movimiento medio $n = \sqrt{\mu / r^3}$:**
   $$\cos(i) = \frac{-2\,\dot{\Omega}_{\text{SSO}}\, r^2}{3\, n\, J_2\, R_E^2} \qquad (\text{válida si } -1 \le \cos(i) \le 1)$$
4. **Cobertura Terrestre y Distancia Oblicua (*Slant Range* $d$ a elevación mínima $\epsilon = 10^\circ$):**
   $$\eta = \arcsin\left(\frac{R_E}{r}\cos(\epsilon)\right), \qquad \lambda_{\text{cov}} = \frac{\pi}{2} - \epsilon - \eta, \qquad d = \sqrt{r^2 + R_E^2 - 2\,r\,R_E\cos(\lambda_{\text{cov}})}$$
5. **Pérdida en Espacio Libre (FSPL en $\text{dB}$, con $d_m$ en metros y $f_{\text{Hz}}$ en hercios):**
   $$\text{FSPL (dB)} = 20\log_{10}(d_m) + 20\log_{10}(f_{\text{Hz}}) - 147.55$$
6. **Fracción de Propelente y Masa Húmeda (Ecuación de Tsiolkovsky):**
   $$f_{\text{prop}} = 1 - \exp\left(-\frac{\Delta v \cdot M_{\text{burn}}}{I_{sp}\, g_0}\right), \qquad m_{\text{wet}} = \frac{m_{\text{dry}}}{1 - f_{\text{prop}}}$$
   *(Donde $M_{\text{burn}}$ es `fuel_burn_multiplier`: $1.0$ si el CG está balanceado o $1.5$ si está desbalanceado).*

### B. Tabla Precalculada de Órbitas para Validación y Tests Unitarios

| Altitud $h$ ($\text{km}$) | Velocidad ($\text{km/s}$) | Periodo ($\text{min}$) | Eclipse Máx ($\text{min}$) | Fracción Eclipse ($\%$) | Inclinación SSO ($^\circ$) | Semiancho a $10^\circ$ ($^\circ$) | Distancia Oblicua ($\text{km}$) | FSPL Banda S $2.2\text{ GHz}$ ($\text{dB}$) | FSPL Banda X $8.2\text{ GHz}$ ($\text{dB}$) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| $350$ (LEO) | $7.697$ | $91.54$ | $36.33$ | $39.7\%$ | $96.85^\circ$ | $11.00^\circ$ | $1,303.6$ | $161.6$ | $173.0$ |
| $420$ (ISS) | $7.657$ | $92.97$ | $36.03$ | $38.8\%$ | $97.10^\circ$ | $12.49^\circ$ | $1,492.6$ | $162.8$ | $174.2$ |
| $500$ (SSO) | $7.613$ | $94.62$ | $35.75$ | $37.8\%$ | $97.40^\circ$ | $14.05^\circ$ | $1,695.1$ | $163.9$ | $175.3$ |
| $550$ (LEO) | $7.585$ | $95.65$ | $35.61$ | $37.2\%$ | $97.59^\circ$ | $14.96^\circ$ | $1,815.7$ | $164.5$ | $175.9$ |
| $700$ (SSO) | $7.504$ | $98.77$ | $35.29$ | $35.7\%$ | $98.19^\circ$ | $17.45^\circ$ | $2,155.3$ | $166.0$ | $177.4$ |
| $800$ (SSO) | $7.452$ | $100.87$ | $35.13$ | $34.8\%$ | $98.60^\circ$ | $18.95^\circ$ | $2,366.9$ | $166.8$ | $178.2$ |
| $2,000$ (LEO) | $6.898$ | $127.20$ | $35.03$ | $27.5\%$ | $104.89^\circ$ | $31.43^\circ$ | $4,436.7$ | $172.2$ | $183.7$ |
| $20,200$ (MEO) | $3.873$ | $718.70$ | $55.44$ | $7.7\%$ | N/A | $66.33^\circ$ | $24,717.7$ | $187.2$ | $198.6$ |
| $35,786$ (GEO) | $3.075$ | $1,436.07$ | $69.41$ | $4.8\%$ | N/A | $71.43^\circ$ | $40,586.1$ | $191.5$ | $202.9$ |

---

## 5. Integración del Motor de Espectroscopía y Señales (`logica/` + `juegos_espectrales/`)

El código base del **Analizador FTIR** (`Vector`, `AnalizadorFTIR`, `LineaBase`, `Models`, `Plantilla`) se integra en el backend como el **motor generador y evaluador de los minijuegos del Rol 4 (Ciencia y Comunicaciones)**.

### A. Solución Definitiva a las 6 Brechas Técnicas del Motor Base

1. **Ampliación de `Vector.variable` y `Vector.unidadX`:**
   * Se extiende `Vector.__init__(self, x, y, variable="Absorbancia", unidadX="cm-1")` para aceptar `variable` $\in \{\text{"Absorbancia"}, \text{"Transmitancia"}, \text{"Intensidad"}, \text{"Reflectancia"}\}$ y `unidadX` $\in \{\text{"cm-1"}, \text{"nm"}, \text{"Hz"}\}$.
   * `Vector.mutar` convierte entre `"Transmitancia"` ($\%T$) y `"Absorbancia"` mediante $A = -\log_{10}(T/100)$ y conserva intactas `"Intensidad"` y `"Reflectancia"`.
2. **Escala de `Vector.distance` en Frecuencia/Longitud de Onda:**
   * Como `scipy.signal.find_peaks` recibe `distance` en número de muestras, el adaptador convierte automáticamente cualquier separación física $\Delta x_{\text{min}}$ (en $\text{Hz}$, $\text{nm}$ o $\text{cm}^{-1}$) mediante $\text{distance}_{\text{muestras}} = \max\left(1, \lfloor \Delta x_{\text{min}} / \Delta x_{\text{paso}} \rfloor\right)$.
3. **Protección en `AnalizadorFTIR.Deconvolucion` (`_p0_inicial`):**
   * En señales sintéticas limpias donde no existan depresiones intermedias, `_p0_inicial` inserta bordes sintéticos en los extremos del tramo recortado en lugar de lanzar `ErrorAnalisis`, evitando bloqueos durante los 30 segundos del minijuego.
4. **Regla de Orden `Plantilla.puede(paso)` Adaptada a Gameplay:**
   * En el analizador original, aplicar línea base después de recortar región o repetir un paso lanza excepción. En el minijuego web, `Plantilla.puede(paso)` devuelve `(False, motivo_educativo)` y aplica una penalización de $-3\text{ pts}$ de eficiencia en el cálculo de $F_1$, enseñando al jugador el flujo correcto (**Línea Base $\rightarrow$ Región $\rightarrow$ Modelo/Deconvolución**) sin abortar su única toma.

### B. Cómo Operan los 8 Juegos Espectrales dentro de las 3 Misiones Espaciales

| # | Módulo Espectral | Rol / Fase donde se Activa | Mecánica de 30 s en `PlayerPad` | Fórmulas y Validación en Backend (`puntaje.py`) |
| :--- | :--- | :--- | :--- | :--- |
| **1** | `cazadoresEstrellas` | **Rol 4A** (Misión 1 — Luna / Espacio Cislunar) | Calibrar el espectrómetro UV-Vis identificando líneas de Balmer ($\text{H}\alpha$ $656.3\text{ nm}$, $\text{H}\beta$ $486.1\text{ nm}$), doblete $\text{Na}$ ($589.0\text{ nm}$) o $\text{Ca II}$ ($393.4\text{ nm}$) y arrastrar el cursor a la cresta de Wien. | Continuo de Planck $B(\lambda, T)$ con bandas `gauss_amp` restadas en $\%T$. Ley de Wien: $T = \frac{2.898 \times 10^6\text{ nm}\cdot\text{K}}{\lambda_{\max}}$. Evalúa con `emparejar(..., tol=1.5)`. |
| **2** | `detectivesLuz` | **Rol 4A** (Misión 2 — Asteroide) | Analizar el espectro FTIR del asteroide (usando curvas reales de `dataset/A_CA` o `dataset/Dorita` + sintéticos): limpiar línea base `Splines`, aislar región $900\text{–}1,750\text{ cm}^{-1}$ y asignar bandas ($\text{Si–O–Si}$ $\approx 1,050\text{ cm}^{-1}$, $\text{O–H}$ $3,200\text{–}3,550\text{ cm}^{-1}$, $\text{C=O}$ $1,700\text{ cm}^{-1}$). | Similitud coseno normalizada $\text{sim} = \frac{\mathbf{a}\cdot\mathbf{b}}{\|\mathbf{a}\|\|\mathbf{b}\|}$ y emparejado de picos `x_Peaks` con $\text{tol} = 15\text{ cm}^{-1}$. Si `idx_fallos` es alto, revela un segundo mineral oculto. |
| **3** | `ecoespectro` | **Rol 4A** (Misión 1 — Mapeo Polar / Terrestre) | Sondear píxeles de un cubo multiespectral `(alto, ancho, bandas)`, activar la capa de índice espectral y pintar la máscara de anomalía o hielo/vegetación. | $\text{NDVI} = \frac{\text{NIR} - \text{Rojo}}{\text{NIR} + \text{Rojo}}$, $\text{NDWI} = \frac{\text{Verde} - \text{NIR}}{\text{Verde} + \text{NIR}}$, $\text{NBR} = \frac{\text{NIR} - \text{SWIR}}{\text{NIR} + \text{SWIR}}$. Puntúa por intersección sobre unión: $\text{IoU} = \frac{|M \cap V|}{|M \cup V|}$. |
| **4** | `laboratorioMusical` | **Rol 4B / Telemetría Acústica** | Leer el espectrograma FFT de vibraciones de los motores/estructura y separar armónicos ($f_0, 2f_0, 3f_0$) para descartar resonancia destructiva. | Síntesis aditiva $s(t) = \sum_k a_k \sin(2\pi k f_0 t)$ y `np.fft.rfft` con ventana Hanning. Evalúa picos con tolerancia $\pm \Delta f$. |
| **5** | `misionFoton` | **Rol 4A** (Calibración Óptica de Cámara) | Girar un prisma dispersivo y apilar 2 filtros ópticos para que solo la longitud de onda objetivo con energía $E \ge E_{\text{umbral}}$ llegue al sensor. | Dispersión de Cauchy $n(\lambda) = A + B/\lambda^2$, Ley de Snell $n_1\sin\theta_1 = n_2\sin\theta_2$, energía $E = \frac{1,239.84\text{ eV}\cdot\text{nm}}{\lambda}$ y transmitancia apilada $T_{\text{total}}(\lambda) = \prod_i T_i(\lambda)$. |
| **6** | `bioespectro` | **Rol 4A** (Misión 3 — Muestras de Marte MSR) | Aplicar deconvolución sobre la banda Amida I ($1,600\text{–}1,700\text{ cm}^{-1}$) o analizar fotoluminiscencia (`Datos fotoluminesencia.csv`) para detectar biofirmas en los tubos marcianos. | `AnalizadorFTIR.Deconvolucion("gauss_amp")` extrae `subBandasInfo["parametros"]` (Hoja $\beta$ $1,610\text{–}1,640\text{ cm}^{-1}$ vs. Hélice $\alpha$ $1,650\text{–}1,658\text{ cm}^{-1}$) y verifica desplazamiento de Stokes ($\lambda_{\text{em}} > \lambda_{\text{ex}}$). |
| **7** | `ladronColores` | **Rol 4A / 4B** (Recuperación de Datos Corruptos) | Reconstruir un tramo borrado del espectro visible ($380\text{–}750\text{ nm}$) por radiación solar o medir $\lambda$ con una rejilla de difracción. | Interpolación `CubicSpline` natural comparada por RMSE, serie de Rydberg $\frac{1}{\lambda} = R\left(\frac{1}{n_1^2} - \frac{1}{n_2^2}\right)$ y ecuación de rejilla $d\sin\theta = m\lambda$. |
| **8** | `espectroHacker` | **Rol 4B** (Desbloqueo de Enlace DSN en las 3 Misiones) | Limpiar una señal interceptada de la DSN, hallar el periodo con autocorrelación, aislar el tono intruso (`idx_fallos`) y decodificar la clave **DTMF** de 4 dígitos para abrir el *downlink*. | Matriz DTMF (filas $697, 770, 852, 941\text{ Hz}$ $\times$ columnas $1209, 1336, 1477, 1633\text{ Hz}$), autocorrelación $r(\tau) = \sum s(t)s(t+\tau)$ y detección de anomalías en el residuo $|y - y_{\text{aprox}}|$. |

### C. Función Universal de Calificación Espectral (`juegos_espectrales/nucleo/puntaje.py`)

```python
def emparejar(marcas: list[float], verdad: list[float], tolerancia: float) -> tuple[list, float, float, float]:
    """Empareja cada marca del jugador con el pico/banda real más cercano dentro de `tolerancia`."""
    marcas_ord, verdad_ord = sorted(marcas), sorted(verdad)
    usadas, aciertos = set(), []
    for m in marcas_ord:
        candidatos = [(abs(m - t), j) for j, t in enumerate(verdad_ord) if j not in usadas and abs(m - t) <= tolerancia]
        if candidatos:
            _, j = min(candidatos)
            usadas.add(j)
            aciertos.append((m, verdad_ord[j]))
    precision = len(aciertos) / max(len(marcas_ord), 1)
    recall = len(aciertos) / max(len(verdad_ord), 1)
    f1 = (2 * precision * recall) / max(precision + recall, 1e-9)
    return aciertos, precision, recall, f1
```

---

## 6. Grafo Causal de Interdependencia entre Jugadores (Matriz Input $\rightarrow$ Output)

Esta tabla define cómo **la única toma de un jugador altera matemáticamente la partida de otro compañero**:

| Jugador Origen | Decisión Tomada en su Minijuego | Jugador Destino | Efecto Matemático Directo en el Minijuego del Compañero |
| :--- | :--- | :--- | :--- |
| **Rol 1A** *(Finanzas)* | Asigna fichas a Ingeniería ($n_{\text{ing}}$) y Bóveda UFE ($n_{\text{ufe}}$). | **Rol 3B** *(Energía 3D)* y **Rol 4A** *(Ciencia)* | Fija el factor $F \in [0,1]$ que controla el porcentaje de aparición de *Celdas de Combustible $\text{H}_2$* ($5\%$ a $50\%$) en el mapa 3D del Rol 3B, y limita el techo de compra de sensores del Rol 4A. |
| **Rol 4A** *(Ciencia)* | Elige instrumentos pesados (ej. $+\$65\text{ kg}$ *HiRISE* $+ 18\text{ kg}$ desorbitador) y obtiene $F_{1,\text{calib}}$. | **Rol 2B** *(Masa/CG)* y **Rol 1B** *(Lanzador)* | Subir la masa seca de $120\text{ kg}$ a $203\text{ kg}$ bloquea el cohete *Electron* en SSO (límite $200\text{ kg}$, falla por $3\text{ kg}$) y sube la factura *rideshare* 2026 de $\$840,000\text{ a }\$1,421,000\text{ USD}$. |
| **Rol 3A** *(Órbita)* | Elige órbita alta (ej. GEO $35,786\text{ km}$) o motor de Hidracina ($I_{sp} = 225\text{ s}$) frente a Hall ($1,600\text{ s}$). | **Rol 1B** *(Lanzador)*, **Rol 3B** *(Energía)* y **Rol 4B** *(Comms)* | Con $2,200\text{ kg}$ secos hacia GEO desde GTO ($\Delta v = 1,803.6\text{ m/s}$), Hidracina eleva la masa húmeda a $4,982.2\text{ kg}$ (casi al límite de $5,500\text{ kg}$ de *Falcon 9* en GTO), mientras que Hall la deja en $2,468.0\text{ kg}$ pero exige alta potencia eléctrica al Rol 3B. Además, subir de LEO ($350\text{ km}$) a GEO suma $+29.9\text{ dB}$ de pérdida FSPL al Rol 4B. |
| **Rol 2A** *(Montaje)* | Comete un fallo en el ensamblaje del Escudo Térmico o del cristal del reactor. | **Nodo 3** *(Simulación)* y **Rol 2B** *(Masa)* | Desactiva `has_thermal_protection` (causando destrucción en la reentrada de Misión 1 o 3) o añade penalización de masa estructural. |
| **Rol 2B** *(Masa/CG)* | Termina los 30 s con el Centro de Gravedad fuera del círculo verde ($d_{\text{CG}} > R_{\text{tol}}$). | **Rol 4B** *(Comms DSN)* y **Nodo 2** *(Propulsión)* | Dispara `fuel_burn_multiplier = 1.5` (exigiendo $50\%$ más propelente al cálculo del Rol 3A) y multiplica por $1.5\times$ la amplitud de deriva de la retícula en el osciloscopio DSN del Rol 4B. |
| **Rol 3B** *(Energía 3D)* | Recolecta pocos Megajulios en el rover o abusa de baterías pesadas. | **Rol 4B** *(Comms DSN)* y **Nodo 3** *(Evento)* | Limita los Watts disponibles para el transmisor RF (impidiendo subir el *bitrate* a $6.0\text{ Mbps}$) y deja `battery_reserve_pct < 15%` ante tormentas solares o de polvo. |

---

## 7. Escalamiento Dinámico (1 a 4 Jugadores) y Motor Randomizador Funcional (`randomizer.py`)

El juego adapta automáticamente la sesión según el número de jugadores conectados en el lobby ($N \in \{1, 2, 3, 4\}$):

| Modalidad | Roles Controlados por Humanos | Roles Controlados por IA | Minijuegos Jugados por Humanos | Regla de Acoplamiento |
| :--- | :--- | :--- | :--- | :--- |
| **1 Jugador** | Elige **1 o 2 roles** (ej. *Órbita* o *Órbita + Ciencia*). | **3 o 2 roles** restantes. | **2 o 4 minijuegos** (30 s c/u). | La IA resuelve los demás roles garantizando viabilidad física pero inyectando retos según la dificultad. |
| **2 Jugadores** | Cada jugador elige **1 rol** distinto (2 roles humanos). | **2 roles** restantes. | **4 minijuegos** (2 por jugador). | En Oleada 1 y 2 los humanos juegan en paralelo; la IA adapta sus salidas a lo que hayan bloqueado los humanos. |
| **3 Jugadores** | Cada jugador elige **1 rol** distinto (3 roles humanos). | **1 rol** restante. | **6 minijuegos** (2 por jugador). | El único rol IA actúa como estabilizador con restricciones (*Constraint-Aware Clamping*). |
| **4 Jugadores** | Cada jugador elige **1 rol** distinto (4 roles humanos). | **0 roles** (100% humano). | **8 minijuegos** (2 por jugador). | Cooperativo asimétrico puro: todas las dependencias dependen exclusivamente del equipo humano. |

### Implementación Lista para Producción de `backend/randomizer.py`

```python
import random
from typing import Dict, Any

ARCHETYPE_WEIGHTS = {
    "easy":   {"CONSERVATIVE": 0.70, "AMBITIOUS": 0.20, "CHALLENGING": 0.10},
    "medium": {"CONSERVATIVE": 0.40, "AMBITIOUS": 0.40, "CHALLENGING": 0.20},
    "hard":   {"CONSERVATIVE": 0.20, "AMBITIOUS": 0.50, "CHALLENGING": 0.30},
}

def pick_archetype(difficulty: str) -> str:
    weights = ARCHETYPE_WEIGHTS.get(difficulty, ARCHETYPE_WEIGHTS["medium"])
    populations = list(weights.keys())
    probs = list(weights.values())
    return random.choices(populations, weights=probs, k=1)[0]

def synthesize_ai_role_wave1(role_id: str, difficulty: str, mission_budget: float) -> Dict[str, Any]:
    """Genera las decisiones de Oleada 1 para cualquier rol controlado por IA."""
    arch = pick_archetype(difficulty)
    if role_id == "finance_launch":
        if arch == "CONSERVATIVE":
            return {"ufe_reserve_pct": 30.0, "funding_factor_F": 0.55, "science_budget_pct": 0.20}
        elif arch == "AMBITIOUS":
            return {"ufe_reserve_pct": 18.0, "funding_factor_F": 0.85, "science_budget_pct": 0.30}
        else:
            return {"ufe_reserve_pct": 12.0, "funding_factor_F": 0.35, "science_budget_pct": 0.25}

    elif role_id == "spacecraft_mass":
        return {
            "bus_dry_mass_kg": 420.0 if difficulty != "hard" else 850.0,
            "has_thermal_protection": True,  # Nunca sabotea con muerte automática en Oleada 1
            "assembly_integrity_pct": 100.0 if arch != "CHALLENGING" else 85.0,
            "has_deorbit_device": True
        }

    elif role_id == "orbit_power":
        if arch == "CONSERVATIVE":
            return {"trajectory_choice": "free_return_or_optimal", "required_dv_ms": 1480.0, "isp_seconds": 315.0}
        elif arch == "AMBITIOUS":
            return {"trajectory_choice": "direct_fast_or_heavy_orbit", "required_dv_ms": 1803.6, "isp_seconds": 1600.0}
        else:
            return {"trajectory_choice": "standard_transfer", "required_dv_ms": 1803.6, "isp_seconds": 225.0}

    elif role_id == "science_comms":
        if arch == "CONSERVATIVE":
            return {"instruments_mass_kg": 65.0, "science_value": 80.0, "data_generated_gbit": 90.0, "science_calibration_f1": 0.88, "has_visual_autonomy": True}
        elif arch == "AMBITIOUS":
            return {"instruments_mass_kg": 135.0, "science_value": 100.0, "data_generated_gbit": 145.0, "science_calibration_f1": 0.94, "has_visual_autonomy": True}
        else:
            return {"instruments_mass_kg": 98.0, "science_value": 85.0, "data_generated_gbit": 125.0, "science_calibration_f1": 0.72, "has_visual_autonomy": False}
    return {}

def synthesize_ai_role_wave2(role_id: str, difficulty: str, consolidated_wave1: Dict[str, Any]) -> Dict[str, Any]:
    """
    Genera las decisiones de Oleada 2 acoplándose a la masa, presupuesto y órbita
    que bloquearon los jugadores humanos en la Oleada 1 (Constraint-Aware Clamping).
    """
    arch = pick_archetype(difficulty)
    total_wet_mass = consolidated_wave1.get("estimated_wet_mass_kg", 1500.0)
    remaining_budget = consolidated_wave1.get("remaining_budget_usd", 500_000_000.0)

    if role_id == "finance_launch":
        # Elige un cohete que soporte al menos la masa húmeda actual del equipo
        if total_wet_mass <= 831.0 and remaining_budget < 74_000_000:
            return {"selected_launcher": "SpaceX_Rideshare_XL", "launcher_max_mass_kg": 831.0, "launch_cost_usd": 2_800_000.0}
        elif total_wet_mass <= 4020.0:
            return {"selected_launcher": "Falcon_9_Block_5", "launcher_max_mass_kg": 4020.0, "launch_cost_usd": 74_000_000.0}
        else:
            return {"selected_launcher": "Falcon_Heavy", "launcher_max_mass_kg": 16800.0, "launch_cost_usd": 115_000_000.0}

    elif role_id == "spacecraft_mass":
        balanced = True if arch != "CHALLENGING" else False
        return {"cg_balanced": balanced, "fuel_burn_multiplier": 1.0 if balanced else 1.25}

    elif role_id == "orbit_power":
        return {
            "power_source": "rtg_nuclear" if difficulty == "hard" else "fuel_cell",
            "power_generation_w": 850.0 if arch != "CHALLENGING" else 520.0,
            "battery_reserve_pct": 25.0 if arch == "CONSERVATIVE" else (18.0 if arch == "AMBITIOUS" else 12.0)
        }

    elif role_id == "science_comms":
        eff = 1.0 if arch != "CHALLENGING" else 0.75
        return {"downlink_rate_mbps": 4.5, "link_margin_db": 4.2 if eff == 1.0 else 3.1, "downlink_efficiency": eff}
    return {}
```

---

## 8. Matriz de Adaptación Paramétrica de las 3 Misiones NASA

Los **8 componentes de minijuego** reciben al inicio de la partida el diccionario `MissionConfig` correspondiente a una de las 3 misiones oficiales:

| Parámetro / Subsistema | Misión 1 (Fácil): *Operación Artemisa — Ida y Vuelta a la Luna* | Misión 2 (Intermedia): *Cazador de Asteroides Cercanos* | Misión 3 (Difícil): *Misión de Retorno de Muestras de Marte (MSR)* |
| :--- | :--- | :--- | :--- |
| **Inspiración Real NASA** | Programa *Artemis I / II*, cápsula *Orion* y cohete *SLS*. | Misiones *OSIRIS-REx* (Bennu), *DART* y *NEAR Shoemaker*. | Campaña *Mars Sample Return (NASA/ESA)*, rover *Perseverance* y *MRO*. |
| **Presupuesto Total (`budget`)** | $\$800\text{M USD}$ | $\$1,200\text{M USD}$ | $\$2,500\text{M USD}$ (estricto por efecto bola de nieve de masa). |
| **Meta Científica Mínima** | $\ge 2$ paquetes de datos (fotografía polar y radiación) + reentrada intacta. | $100\%$ mapeo mineral + $\ge 80\text{ GB}$ transmitidos a la Tierra. | $\ge 15$ tubos de muestras marcianas selladas entregadas en la Tierra. |
| **Rol 1A (Mesa / UFE)** | Meta UFE $\ge 20\%$; holgura financiera alta. | Meta UFE $\ge 25\%$; financiar *Autonomía Visual* o propulsión. | Meta UFE $\ge 25\text{–}30\%$; financiar RTG nuclear y MAV marciano. |
| **Rol 1B (Lanzadores)** | Cohete mediano (si elige Retorno Libre) o pesado (si elige Ruta Directa). | Cohete económico (en *Flyby*) o pesado (en *Inserción Orbital*). | Cada kg en Marte multiplica masa del paracaídas, MAV y cohete terrestre. |
| **Rol 2A (Montaje 2D)** | Montaje de Satélite Solar + **Escudo Térmico de Reentrada** ($40,000\text{ km/h}$). | Montaje de Sonda con Antena de Alta Ganancia + Memoria Sólida de $160\text{ Gbit}$. | Montaje de Sonda con **Generador Nuclear RTG** + **Cápsula Hermética** + Motor Químico MAV. |
| **Rol 2B (Masa y CG)** | Tolerancia amplia ($R_{\text{tol}} = 0.25\text{ m}$). | Tolerancia media ($R_{\text{tol}} = 0.15\text{ m}$). | Tolerancia estricta ($R_{\text{tol}} = 0.08\text{ m}$); margen JPL CML 4 $\ge 35\%$. |
| **Rol 3A (Órbita / Ruta)** | **Dilema:** *Ruta Directa* (3 días, alto combustible) vs. *Retorno Libre* (10 días, resortera gravitatoria, $-400\text{ kg}$ combustible). | **Dilema:** *Sobrevuelo Rápido (Flyby)* ($15\text{ min}$, barato, exige cámara/disco rápido) vs. *Inserción Orbital* (meses, alto combustible). | **Dilema:** *MAV de 30 tubos* (máximo score pero peso crítico) vs. *MAV de 15 tubos* (ahorra $150\text{ kg}$ y permite pagar el RTG). |
| **Rol 3B (Energía 3D)** | Recolectar celdas de combustible y baterías para asegurar $\ge 15\%$ de reserva en viaje de 10 días. | Mantener potencia para cámaras rápidas y transmisor de espacio profundo. | Sobrevivir tormentas de polvo: priorizar *Celdas de Combustible $\text{H}_2$* y soporte para **RTG Nuclear**. |
| **Rol 4A (Ciencia Espectral)** | **Arquetipo 1 o 3:** *Cazadores de Estrellas* (radiación solar/estelar) o *Ecoespectro* (índices polares). | **Arquetipo 2 o 7:** *Detectives de la Luz (FTIR)* para identificar minerales y agua en el asteroide. | **Arquetipo 6 o 2:** *Bioespectro* (deconvolución Amida I y fluorescencia) sobre rocas del cráter marciano. |
| **Rol 4B (DSN + Hacker)** | Latencia baja ($\sim 1.3\text{ s}$); decodificación de 1 tono simple en *Espectro Hacker*. | Latencia de minutos; requiere *Piloto Automático Visual* y llave DTMF de 4 tonos antes de que se aleje el asteroide. | Latencia de $4\text{ a }25\text{ min}$; separar canales con deconvolución/anomalías (`idx_fallos`) y vaciar $160\text{ Gbit}$ antes de la **Conjunción Solar** ($0\text{ Mbps}$). |
| **Evento Aleatorio (Fase 3)** | **Tormenta Solar Moderada en Espacio Cislunar:** Exige $\ge 15\%$ de batería de reserva; si no, pierde 1 paquete de datos. | **Nube de Polvo y Micro-rocas:** Exige *Piloto Automático Visual* + reserva UFE para parche; si no, pierde $20\text{–}35\%$ de fotos. | **Fallo en Brazo Recolector + Tormenta de Polvo Estacional:** Exige $\ge 20\%$ UFE + RTG nuclear (o alta reserva); si no, despega con la mitad de los tubos. |

---

## 9. Árbol de Decisiones Determinista y Motor de Resolución (`decision_tree.py`)

Al concluir las 8 tomas de la Oleada 1 y la Oleada 2, el servidor ejecuta el **Árbol de Decisiones de 4 Nodos**:

```text
[ESTADO CONSOLIDADO POST-MINIJUEGOS (8 TOMAS BLOQUEADAS)]
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ NODO 1: VIABILIDAD DE DESPEGUE, COFIA Y PRESUPUESTO (Compuerta Dura)    │
│ Condición: m_wet <= launcher_max_mass AND costo_total <= budget_limit   │
│            AND fairing_ok == True                                       │
└──────────────┬───────────────────────────────────────────┬──────────────┘
               │ NO                                        │ SÍ
               ▼                                           ▼
  ┌─────────────────────────┐   ┌─────────────────────────────────────────────────────┐
  │ RAMA 1A: FRACASO TOTAL  │   │ NODO 2: MECÁNICA ORBITAL Y PROPULSIÓN (Compuerta)   │
  │ [VETO DE MANIFIESTO]    │   │ dv_efectivo = dv_propelente / fuel_burn_multiplier  │
  │ - Exceso de masa (>100%)│   │ Condición: dv_efectivo >= required_dv_ms            │
  │ - Breach presupuestario │   └──────────────┬───────────────────────────────────┬──┘
  └─────────────────────────┘                  │ NO                                │ SÍ
                                               ▼                                   ▼
                                  ┌─────────────────────────┐   ┌─────────────────────────────────────┐
                                  │ RAMA 2A: FRACASO TOTAL  │   │ NODO 3: HARDWARE CRÍTICO Y EVENTO   │
                                  │ [DERIVA ORBITAL]        │   │ 1. ¿Tiene Escudo Térmico/Cápsula?   │
                                  │ - Sin Delta-v para      │   │ 2. ¿Supera Evento Aleatorio con     │
                                  │   frenar o regresar     │   │    Batería, Autonomía, RTG y UFE?   │
                                  │ - Castigo CG (1.5x)     │   └──────┬───────────┬──────────────┬───┘
                                  └─────────────────────────┘          │ SIN       │ FALLA        │ SUPERA
                                                                       │ ESCUDO    │ EVENTO       │ EVENTO
                                                                       ▼           ▼              ▼
                                                          ┌──────────────────┐     │     ┌──────────────────────────┐
                                                          │ RAMA 3A:         │     │     │ NODO 4: CIENCIA, ESPECTRO│
                                                          │ FRACASO TOTAL    │     │     │ Y DESCARGA DSN           │
                                                          │ [PÉRDIDA DE NAVE]│     │     │ Datos_Efectivos =        │
                                                          │ - Destrucción en │     │     │ Datos * Eff_DSN * F1_Esp │
                                                          │   reentrada      │     │     └────┬────────────────┬────┘
                                                          └──────────────────┘     │          │ < 100% META    │ >= 100% META
                                                                                   ▼          ▼                ▼
                                                                          ┌───────────────────────┐   ┌────────────────┐
                                                                          │ RAMA 4A:              │   │ RAMA 4B:       │
                                                                          │ SEMI-COMPLETADA       │   │ ÉXITO TOTAL    │
                                                                          │ (PARTIAL_SUCCESS)     │   │ (FULL_SUCCESS) │
                                                                          │ - Modo Seguro activado│   │ - 100% Misión  │
                                                                          │ - Cuello de botella   │   │ - Bono UFE, CG │
                                                                          │   en 160 Gbit o F1    │   │   y F1 Espectro│
                                                                          └───────────────────────┘   └────────────────┘
```

### Código Completo del Evaluador Autoritativo (`backend/decision_tree.py`)

```python
import math
from backend.models.session import ConsolidatedMissionState, MissionResolutionOutcome

NASA_FACTS = {
    "artemis_moon": (
        "Dato real NASA: En 2022, la misión Artemis I utilizó una trayectoria de Retorno Libre "
        "alrededor de la Luna para ahorrar cientos de kilogramos de propelente y probó el escudo "
        "térmico de Orion reentrando a 40,000 km/h."
    ),
    "asteroid_hunter": (
        "Dato real NASA: En la misión OSIRIS-REx hacia el asteroide Bennu, la NASA utilizó "
        "navegación autónoma visual (Natural Feature Tracking) porque el retraso de señal "
        "impedía pilotar la sonda en tiempo real entre rocas peligrosas."
    ),
    "mars_sample_return": (
        "Dato real NASA: En el orbitador MRO, más del 52% de los 2,180 kg al lanzamiento eran "
        "propelente, y su antena de 3 metros descarga hasta 6 Mbps hacia la Deep Space Network "
        "vaciando una memoria sólida de 160 Gbit."
    ),
}

def evaluate_mission_deployment(
    mission_id: str,
    state: ConsolidatedMissionState
) -> MissionResolutionOutcome:
    wet_mass_kg = state.dry_mass_kg + state.instruments_mass_kg + state.propellant_mass_kg
    total_cost_usd = state.launch_cost_usd + state.subsystems_cost_usd
    fact = NASA_FACTS.get(mission_id, NASA_FACTS["artemis_moon"])

    # NODO 1: Viabilidad de Despegue y Presupuesto (Hard Gate)
    if wet_mass_kg > state.launcher_max_mass_kg:
        excess = round(wet_mass_kg - state.launcher_max_mass_kg, 1)
        return MissionResolutionOutcome(
            outcome="FAILED",
            completion_pct=0.0,
            total_score=100,
            failed_or_degraded_gate="NODE_1_LAUNCH",
            causal_chain_explanation=(
                f"VETO DE LANZAMIENTO: La masa húmeda total ({wet_mass_kg:.1f} kg) superó por "
                f"{excess} kg la capacidad máxima del cohete {state.selected_launcher} "
                f"({state.launcher_max_mass_kg:.1f} kg)."
            ),
            nasa_real_world_fact=fact
        )

    if total_cost_usd > state.budget_limit_usd:
        overrun = round((total_cost_usd - state.budget_limit_usd) / 1e6, 1)
        return MissionResolutionOutcome(
            outcome="FAILED",
            completion_pct=0.0,
            total_score=120,
            failed_or_degraded_gate="NODE_1_LAUNCH",
            causal_chain_explanation=(
                f"CANCELACIÓN PRESUPUESTARIA (Breach Nunn-McCurdy): El costo total excedió el "
                f"presupuesto en ${overrun}M USD por falta de reserva UFE."
            ),
            nasa_real_world_fact=fact
        )

    # NODO 2: Mecánica Orbital y Propulsión (Tsiolkovsky + Castigo por CG)
    g0 = 9.80665
    available_dv = state.isp_seconds * g0 * math.log(wet_mass_kg / max(wet_mass_kg - state.propellant_mass_kg, 1.0))
    effective_dv = available_dv / state.fuel_burn_multiplier

    if effective_dv < state.required_dv_ms:
        cg_note = (
            " El desbalance del Centro de Gravedad (Rol 2B) disparó el consumo de combustible a 1.5x."
            if not state.cg_balanced else ""
        )
        return MissionResolutionOutcome(
            outcome="FAILED",
            completion_pct=25.0,
            total_score=250,
            failed_or_degraded_gate="NODE_2_PROPULSION",
            causal_chain_explanation=(
                f"DERIVA ORBITAL: El Delta-v efectivo ({effective_dv:.0f} m/s) fue insuficiente "
                f"para completar la trayectoria seleccionada ({state.required_dv_ms:.0f} m/s).{cg_note}"
            ),
            nasa_real_world_fact=fact
        )

    # NODO 3: Supervivencia Estructural y Evento Aleatorio
    if mission_id in ("artemis_moon", "mars_sample_return") and not state.has_thermal_protection:
        return MissionResolutionOutcome(
            outcome="FAILED",
            completion_pct=45.0,
            total_score=300,
            failed_or_degraded_gate="NODE_3_EVENT",
            causal_chain_explanation=(
                "PÉRDIDA EN REENTRADA: La nave completó el viaje pero se desintegró en la atmósfera "
                "al haberse omitido el Escudo Térmico / Cápsula de Contención en el montaje (Rol 2A)."
            ),
            nasa_real_world_fact=fact
        )

    event_survival_factor = 1.0
    event_notes = []

    if mission_id == "artemis_moon" and state.battery_reserve_pct < 15.0:
        event_survival_factor = 0.65
        event_notes.append("La Tormenta Solar Cislunar obligó a entrar en Modo Seguro por tener menos de 15% de batería.")
    elif mission_id == "asteroid_hunter" and (not state.has_visual_autonomy or state.ufe_reserve_pct < 15.0):
        event_survival_factor = 0.70
        event_notes.append("La nube de polvo y micro-rocas desorientó los sensores por falta de Autonomía Visual o reserva UFE.")
    elif mission_id == "mars_sample_return" and (state.ufe_reserve_pct < 20.0 or (state.power_source != "rtg_nuclear" and state.battery_reserve_pct < 25.0)):
        event_survival_factor = 0.60
        event_notes.append("La tormenta de polvo en Marte y el atasco del brazo redujeron a la mitad los tubos recolectados por falta de RTG o UFE >= 20%.")

    # NODO 4: Ciencia, Calibración Espectral (F1) y Descarga DSN
    spectral_quality = max(0.4, state.science_calibration_f1)
    comms_factor = state.downlink_efficiency if state.link_margin_db >= 3.0 else 0.45
    effective_completion = min(1.0, event_survival_factor * comms_factor * spectral_quality)

    # Cálculo de Score (50% Objetivo + 30% Ciencia/Espectro + 20% Eficiencia de Masa y Presupuesto)
    obj_score = 500.0 * effective_completion
    sci_score = 300.0 * (state.science_value / 100.0) * state.science_calibration_f1
    mass_eff = max(0.0, 1.0 - (wet_mass_kg / state.launcher_max_mass_kg))
    budget_eff = max(0.0, 1.0 - (total_cost_usd / state.budget_limit_usd))
    eff_score = 200.0 * (0.5 * mass_eff + 0.5 * budget_eff)
    final_score = int(round(obj_score + sci_score + eff_score))

    if effective_completion < 0.85:
        if comms_factor < 1.0:
            event_notes.append("El cuello de botella en la antena DSN (< +3 dB o fallo en Espectro Hacker) dejó datos sin descargar de los 160 Gbit.")
        if spectral_quality < 0.75:
            event_notes.append(f"La calibración espectral (F1 = {state.science_calibration_f1:.2f}) redujo la nitidez de las firmas químicas.")
        return MissionResolutionOutcome(
            outcome="PARTIAL_SUCCESS",
            completion_pct=round(effective_completion * 100.0, 1),
            total_score=max(400, final_score),
            failed_or_degraded_gate="NODE_4_DOWNLINK" if comms_factor < 1.0 else "NODE_3_EVENT",
            causal_chain_explanation="MISIÓN SEMI-COMPLETADA: " + " ".join(event_notes),
            nasa_real_world_fact=fact
        )

    return MissionResolutionOutcome(
        outcome="FULL_SUCCESS",
        completion_pct=100.0,
        total_score=max(800, final_score),
        failed_or_degraded_gate=None,
        causal_chain_explanation=(
            f"¡ÉXITO TOTAL DE LA MISIÓN! El equipo equilibró la masa ({wet_mass_kg:.0f}/{state.launcher_max_mass_kg:.0f} kg), "
            f"mantuvo el Centro de Gravedad estable, superó el evento con {state.ufe_reserve_pct:.0f}% de reserva UFE "
            f"y logró una calibración espectral F1 de {state.science_calibration_f1:.2f} con enlace DSN nominal."
        ),
        nasa_real_world_fact=fact
    )
```

---

## 10. Contratos de Datos Pydantic y Eventos Socket.IO (`backend/models/session.py`)

```python
from pydantic import BaseModel
from typing import Literal, Optional, List

RoleType = Literal["finance_launch", "spacecraft_mass", "orbit_power", "science_comms"]
DifficultyType = Literal["easy", "medium", "hard"]
MissionIdType = Literal["artemis_moon", "asteroid_hunter", "mars_sample_return"]
SpectralGameType = Literal[
    "cazadores_estrellas", "detectives_luz", "ecoespectro",
    "laboratorio_musical", "mision_foton", "bioespectro",
    "ladron_colores", "espectro_hacker"
]

class MissionSessionConfig(BaseModel):
    room_pin: str
    mission_id: MissionIdType
    difficulty: DifficultyType
    player_count: int  # 1 a 4 jugadores
    human_roles: List[RoleType]
    ai_roles: List[RoleType]
    wave1_spectral_game: SpectralGameType
    wave2_spectral_game: SpectralGameType = "espectro_hacker"

class ConsolidatedMissionState(BaseModel):
    # Rol 1: Budgets + Launch Vehicles
    budget_limit_usd: float
    subsystems_cost_usd: float
    ufe_reserve_pct: float
    funding_factor_F: float        # 0.0 a 1.0 (controla spawn rate en AstroLogistics 3D)
    selected_launcher: str
    launcher_max_mass_kg: float
    launch_cost_usd: float

    # Rol 2: Spacecraft Design + Mass
    dry_mass_kg: float
    cg_balanced: bool
    fuel_burn_multiplier: float    # 1.0 nominal | 1.5 desbalanceado
    has_thermal_protection: bool
    has_deorbit_device: bool

    # Rol 3: Orbital Constraints + Power
    trajectory_choice: str
    required_dv_ms: float
    isp_seconds: float             # 225.0 (Hidracina), 315.0 (Biprop), 1600.0 (Hall)
    propellant_mass_kg: float
    power_source: Literal["solar_standard", "battery_heavy", "fuel_cell", "rtg_nuclear"]
    power_generation_w: float
    battery_reserve_pct: float

    # Rol 4: Scientific Instruments + Spectral Engine + Communications + Data
    instruments_mass_kg: float
    science_value: float
    science_calibration_f1: float  # 0.0 a 1.0 calculado con puntaje.emparejar()
    data_generated_gbit: float
    downlink_rate_mbps: float
    link_margin_db: float
    downlink_efficiency: float     # 1.0 nominal | 0.5 degradado
    has_visual_autonomy: bool

class MissionResolutionOutcome(BaseModel):
    outcome: Literal["FAILED", "PARTIAL_SUCCESS", "FULL_SUCCESS"]
    completion_pct: float
    total_score: int
    failed_or_degraded_gate: Optional[Literal["NODE_1_LAUNCH", "NODE_2_PROPULSION", "NODE_3_EVENT", "NODE_4_DOWNLINK"]]
    causal_chain_explanation: str
    nasa_real_world_fact: str
```

---

## 11. Reglas de Sincronización y Checklist para Trabajo en Paralelo con Agentes

1. **Autoridad Única del Servidor:** Ningún `PlayerPad` en React calcula el desenlace final por su cuenta; cada minijuego envía su payload al evento Socket.IO `bloquear_toma_minijuego` al confirmar su única toma o automáticamente cuando el reloj de `30.0s` llega a cero.
2. **Inyección de Contexto entre Oleadas:** Entre la Oleada 1 y la Oleada 2 hay una transición de **5 segundos** en `HostScreen` ("*Sincronizando Subsistemas...*") donde FastAPI calcula las mutaciones cruzadas (masa acumulada, factor $F$ de financiamiento para las cajas 3D, pérdida FSPL por altitud) y las envía en el evento `iniciar_oleada_2`.
3. **Serialización Ligera de Espectros:** Para los minijuegos del Rol 4A y 4B, `adaptadores_web.py` envía hacia React arreglos `Float32` de máximo $500\text{ a }1,000\text{ puntos}$ `(x, y)` junto con la lista de bandas candidatas de `biblioteca.py`, evaluando las marcas del usuario en el servidor mediante `puntaje.emparejar`.