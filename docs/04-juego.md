# 04 · El juego

**Qué contiene:** diseño completo del videojuego de 5 minutos paso a paso: menús, lobby estilo *Among Us*, pista lineal de estaciones en cadena, vuelo de 60 segundos con preguntas por turnos y reporte educativo NASA.  
**Dueños:** Schoenstadt, Rubén  
**Última actualización:** 2026-11-14 (15:00 h)

## En una frase

Un videojuego web cooperativo y educativo de **5 minutos** (1 a 4 jugadores) con estilo **Paper Mario × Among Us**, donde cada ingeniero recorre una **pista lineal automática de estaciones** resolviendo minijuegos en paralelo cuyas decisiones se afectan en cadena en tiempo real, para luego enfrentar un **vuelo espacial de 60 segundos con crisis por turnos** y recibir retroalimentación científica real de la NASA.

---

## Estructura cronológica de una partida (5:00 minutos)

| Fase | Pantalla principal | Qué ocurre | Duración |
|---|---|---|---|
| **0 · Inicio y Lobby** | `HomeMenu` $\rightarrow$ `LobbyView` | Elegir `Singleplayer` o `Multiplayer`. Si es multi, entrar por PIN tipo *Among Us*, elegir rol (1–4) y seleccionar 1 de 3 misiones + dificultad. | ~0:30 |
| **1 · Pista Lineal: Estación 1 (Oleada 1)** | `LinearStationTrack` + `MinigameShell` | El personaje camina automáticamente a la Estación 1. Los roles ejecutan su primer minijuego de 30 s en paralelo; las decisiones mutan restricciones en vivo. | ~1:00 |
| **2 · Pista Lineal: Estación 2 (Oleada 2)** | `LinearStationTrack` + `MinigameShell` | El personaje avanza automáticamente a la Estación 2. Cada rol juega su segundo minijuego (30 s) adaptado a lo que acaban de decidir sus compañeros. | ~1:00 |
| **3 · Vuelo de 60 Segundos** | `Flight60sView` | Vemos el cohete/nave viajar por el espacio. Se atraviesan los 4 Nodos del Árbol de Decisiones con **4 rondas de preguntas/crisis por turnos** (15 s c/u). | 1:00 |
| **4 · Retroalimentación NASA** | `MissionReportDashboard` | Se revela éxito total, parcial o fallo con cadena causal numérica exacta, dato real NASA y botón de Reintentar / Rediseñar. | ~1:30 |

---

## Paso 0 · Menú Principal, Lobby estilo *Among Us* y Selección de Misión

1. **Menú Principal (`HomeMenu`):**
   - Muestra el título del juego, personajes animados estilo **Paper Mario × Among Us** flotando en el espacio y dos botones principales claros: **SINGLEPLAYER** y **MULTIPLAYER**.
   - Incluye acceso discreto a un botón *How to Play / NASA Data* (1 pantalla visual sin muros de texto).
2. **Lobby de Conexión (si es `Multiplayer`):**
   - El anfitrión crea una sala y recibe un **código PIN de 6 caracteres** (ej. `MARS26`) y URL/QR para entrar desde cualquier navegador o teléfono.
   - En la sala aparecen hasta **4 espacios de tripulación** con el avatar *Paper Mario × Among Us* esperando conexión en tiempo real, igual que la sala de espera de *Among Us / Kahoot*.
3. **Selección de Rol (en `Multiplayer` y `Singleplayer`):**
   - Hay **4 Roles** que cubren los 9 subsistemas del reto NASA sin solapamientos:
     1. **Rol 1 — Director de Finanzas y Lanzamiento** (`Budgets` + `Launch vehicles`) · *Color Dorado*
     2. **Rol 2 — Arquitecto de Nave y Masa** (`Spacecraft design` + `Mass`) · *Color Cian*
     3. **Rol 3 — Navegante Orbital y Energía** (`Orbital constraints` + `Power`) · *Color Verde*
     4. **Rol 4 — Oficial de Ciencia y Telemetría** (`Scientific instruments` + `Communications` + `Data`) · *Color Violeta*
   - En **Multiplayer** ($N = 2, 3, 4$ jugadores): cada jugador elige su rol; si sobran roles ($4 - N$), el servidor los asigna al motor inteligente `randomizer.py`.
   - En **Singleplayer** ($N = 1$ jugador): el jugador elige **1 rol principal** (partida súper rápida de 2 minijuegos + vuelo) o **2 roles** (4 minijuegos + vuelo); `randomizer.py` simula en paralelo los roles restantes reaccionando a las decisiones del humano.
4. **Selección de Misión y Dificultad:**
   - **Misión 1 (Fácil):** *Operation Artemis — Moon Roundtrip* (Inspirada en *Artemis I / Orion*). Presupuesto $\$800\text{M USD}$. Tolerancia de CG $0.25\text{ m}$.
   - **Misión 2 (Media):** *Near-Earth Asteroid Hunter* (Inspirada en *OSIRIS-REx / DART*). Presupuesto $\$1,200\text{M USD}$. Tolerancia de CG $0.15\text{ m}$.
   - **Misión 3 (Difícil):** *Mars Sample Return & Orbiter (MSR / MRO)* (Inspirada en *MRO + Perseverance*). Presupuesto $\$2,500\text{M USD}$. Tolerancia de CG $0.08\text{ m}$ y margen JPL CML 4 $\ge 35\%$.

---

## Paso 1 y 2 · Pista Lineal de Estaciones y Minijuegos en Cadena

### Regla de navegación lineal (Sin caminar libre)
A diferencia de *Among Us*, **el jugador nunca deambula perdido por un mapa**. En la vista `LinearStationTrack`, una pista horizontal iluminada muestra las estaciones de la línea de ensamblaje/operación:

```text
[BASE] ══► [ESTACIÓN 1: DISEÑO BASE (30s)] ══► (Sync 5s) ══► [ESTACIÓN 2: INTEGRACIÓN (30s)] ══► [PLATAFORMA DE LANZAMIENTO]
```

- Al empezar cada oleada, el personaje estilo *Paper Mario × Among Us* **camina automáticamente** con animación de balanceo 2.5D hasta la estación correspondiente, abre la compuerta y lanza el minijuego en `MinigameShell`.
- **Sincronización en Multiplayer:** Todos los jugadores ven su pista avanzar de forma sincronizada y trabajan en paralelo en sus respectivas consolas de estación.
- **Concurrencia y afectación en cadena en vivo (`mutacion_en_vivo`):**
  - El HUD superior muestra en todo momento las **barras compartidas de la misión** (*Mass*, *Budget*, *Power*, *Data / Comms*, *UFE Reserve*).
  - Cada cambio o toma bloqueada en una estación viaja por Socket.IO al servidor y **modifica al instante** los parámetros de las estaciones paralelas y de la Estación 2:
    - Si el **Rol 3A** selecciona poco propelente o una órbita alta (GEO/Marte), inmediatamente aumenta la pérdida **FSPL (dB)** que tendrá que compensar el **Rol 4B**, y cambia la masa húmeda máxima que el **Rol 1B** necesita cubrir con el cohete.
    - Si el **Rol 1A** sacrifica el presupuesto de I+D ($F$ bajo) para ahorrar dinero, inmediatamente baja la tasa de aparición de *Celdas de Combustible $\text{H}_2$* en el minijuego 3D del **Rol 3B**.
    - Si el **Rol 4A** monta instrumentos pesados (ej. *HiRISE* $65\text{ kg}$ + *CRISM* $33\text{ kg}$), esos bloques físicos exactos aparecen en la bandeja del **Rol 2B** para balancear el Centro de Gravedad, y pueden sacar al equipo de la capacidad de un cohete *Electron* o encarecer el *Rideshare* del **Rol 1B**.
    - Si el **Rol 2B** falla el balanceo de masa ($d_{\text{CG}} > R_{\text{tol}}$), dispara `fuel_burn_multiplier = 1.5x` y multiplica por $1.5\times$ la deriva del osciloscopio DSN en **Rol 4B**.
    - Si el **Rol 2A** omite o daña el Escudo Térmico durante el montaje, la nave sobrevivirá el lanzamiento pero correrá riesgo crítico en la reentrada del **Nodo 3**.

### Los 8 Minijuegos (30 segundos · Modalidad 1 Toma)

| Estación / Oleada | Rol | Minijuego | Qué decide y qué enseña |
|---|---|---|---|
| **Estación 1 (1A)** | Rol 1 · Finanzas | **La Mesa de Aprobación y Bóveda UFE** | Repartir 10 fichas (Ingeniería/I+D, Ciencia/Comms, Reserva UFE) + 2 solicitudes *Push Your Luck*. Enseña la directiva NPR 7120.5 y el costo de dejar la bóveda UFE bajo $25\%$. |
| **Estación 1 (2A)** | Rol 2 · Nave | **Montaje Estructural Topológico 2D** | Ensamblar piezas en el orden válido del grafo DAG (chasis MLI $\rightarrow$ paneles/RTG $\rightarrow$ escudo térmico $\rightarrow$ tornillos T1 $\rightarrow$ cableado T2). Enseña dependencias de integración aeroespacial. |
| **Estación 1 (3A)** | Rol 3 · Órbita | **Francotirador Orbital y Tsiolkovsky** | Elegir órbita/trayectoria (LEO/SSO/MEO/GEO o dilema de ruta de la misión) y motor (Hidracina $225\text{ s}$, Bipropelente $315\text{ s}$, Hall $1,600\text{ s}$). Enseña relación exponencial $\Delta v$-combustible y FSPL. |
| **Estación 1 (4A)** | Rol 4 · Ciencia | **Catálogo de Carga Útil y Calibración Espectral** | Escoger instrumentos NASA (HiRISE, CRISM, SHARAD, Piloto Visual) y calibrar espectros reales (Balmer/FTIR/NDVI/Bioespectro). Enseña que más ciencia cuesta masa, watts y datos. |
| **Estación 2 (1B)** | Rol 1 · Lanzador | **Subasta de Cofia, Cohete y Rideshare** | Recibe la masa húmeda real del equipo ($m_{\text{bus}} + m_{\text{inst}} + m_{\text{prop}}$) y elige lanzador (*Electron*, *Falcon 9*, *Vulcan*, *Falcon Heavy* o placa *SpaceX Rideshare* 2026). |
| **Estación 2 (2B)** | Rol 2 · Masa/CG | **Balanceo 2D de Centro de Gravedad** | Ubicar los instrumentos reales elegidos por Ciencia y tanques de Órbita en la retícula $(X,Y)$ para mantener $d_{\text{CG}} \le R_{\text{tol}}$ y cuidar el margen JPL CML 4 ($\ge 35\%$). |
| **Estación 2 (3B)** | Rol 3 · Energía | **AstroLogistics 3D (Rover Cosechador)** | Pilotar rover en Three.js recolectando Química ($+15\text{ MJ}$, rápido), Baterías ($+45\text{ MJ}$, pesadas) o Celdas $\text{H}_2$ ($+100\text{ MJ}$, eficiencia sin Carnot) cuya aparición depende del factor $F$ de Rol 1A. |
| **Estación 2 (4B)** | Rol 4 · Comms | **Osciloscopio DSN y Espectro Hacker** | Apuntar antena HGA compensando FSPL y deriva CG hasta lograr $\ge +3.0\text{ dB}$, limpiar interferencia DTMF en el espectro y ajustar bitrate ($0.5\text{–}6.0\text{ Mbps}$) sin exceder los Watts del Rol 3B. |

---

## Paso 3 · Dinámica de 60 Segundos de Vuelo Espacial (Por Turnos)

Al terminar la Estación 2, el estado consolidado se vuelve inmutable y comienza el **Vuelo Espacial de 60 Segundos (`Flight60sView`)**:

1. **Visualización en vivo:** Vemos el cohete despegar desde la plataforma, cruzar la órbita y viajar hacia la Luna / Asteroide / Marte mientras un reloj de `60s` desciende y una línea temporal muestra los **4 Nodos de Decisión**.
2. **Evaluación + 4 Preguntas / Crisis por Turnos (15 s por ronda):**
   - El servidor recorre el árbol causal (`decision_tree.py` + `story_tree.json`) adaptado a lo que el equipo **sí construyó** en las estaciones.
   - **Ronda 1 (0–15 s · `NODE_1_LAUNCH` — Despegue y Presupuesto):** Pregunta/decisión de crisis en lanzamiento (ej. si la masa o costo quedaron al límite, el **Turno de Rol 1** decide entre *eyectar lastre/etapa auxiliar*, *consumir reserva UFE* o *abortar carga no crítica*). Si el veto físico es imposible ($m_{\text{wet}} > m_{\max}$ por mucho), igual se dispara la secuencia de análisis para que el jugador vea exactamente dónde reventó la estructura.
   - **Ronda 2 (15–30 s · `NODE_2_PROPULSION` — Inserción Orbital / Trayectoria):** El **Turno de Rol 3 / Rol 2** enfrenta la maniobra crítica de frenado o corrección de $\Delta v$ (ej. si el CG quedó desbalanceado a `1.5x`, aparece una alerta de vibración en el motor y el jugador en turno decide maniobra de compensación o aerofrenado de emergencia).
   - **Ronda 3 (30–45 s · `NODE_3_EVENT` — Evento Espacial Real):** Se dispara la contingencia real de la misión (*Tormenta Solar Cislunar*, *Nube de Polvo y Micro-rocas* o *Tormenta de Polvo Marciana + Atasque del Brazo*) junto con el chequeo de Escudo Térmico. El **Turno de Rol 2 / Rol 3** elige la respuesta táctica según la batería, RTG, Autonomía Visual o reserva UFE disponible.
   - **Ronda 4 (45–60 s · `NODE_4_DOWNLINK` — Ventana DSN y Descarga Científica):** El **Turno de Rol 4** decide cómo priorizar el enlace de $160\text{ Gbit}$ antes de la Conjunción Solar o pérdida de ventana (comprimir espectroscopía, sacrificar fotos de contexto o forzar potencia de antena).
   - **En Singleplayer:** El jugador responde las 4 rondas consecutivas (una cada 15 s) mientras el cohete vuela.
   - **En Multiplayer:** Cada pregunta se asigna por turno rotativo a un jugador conectado (`¡TURNO DE [NOMBRE]!`), mientras los demás observan la alerta en pantalla y animan al compañero.

---

## Paso 4 · Reporte Final y Retroalimentación Educativa NASA

Tanto si la misión termina en **`FULL_SUCCESS`**, **`PARTIAL_SUCCESS`** o **`FAILED`**, el jugador **siempre** llega al `MissionReportDashboard`:

1. **Veredicto Claro y Puntaje (0 a 1,000 pts):**
   - $50\%$ Cumplimiento de Objetivo (hasta $500\text{ pts}$).
   - $30\%$ Ciencia Ponderada por Calibración Espectral $F_1$ (hasta $300\text{ pts}$).
   - $20\%$ Eficiencia de Masa y Presupuesto restante (hasta $200\text{ pts}$).
   - Bonos/ajustes por decisiones tácticas en las 4 rondas del vuelo de 60 segundos.
2. **Cadena Causal Exacta ("Decisión $\rightarrow$ Consecuencia"):**
   - Explica paso a paso por qué ocurrió el desenlace con números reales (ej. *"Con 2,200 kg secos hacia GTO usando Hidracina ($I_{sp}=225\text{ s}$) y CG desbalanceado ($1.5\times$), la masa húmeda superó la capacidad de Falcon 9 por 140 kg en el Nodo 1"* o *"Mantuviste $28\%$ de UFE y lograste $F_1 = 0.91$ en Bioespectro"*).
3. **Dato Histórico Real NASA (`nasa_real_world_fact`):**
   - Relaciona lo que vivió el jugador con *Artemis I*, *OSIRIS-REx* o *Mars Reconnaissance Orbiter (MRO)* citando la fuente oficial.
4. **Aporte por Rol y Botón `Redesign & Retry`:**
   - Muestra qué aportó cada rol (humano o IA) y permite volver de inmediato a mejorar la estrategia en menos de 5 minutos.
