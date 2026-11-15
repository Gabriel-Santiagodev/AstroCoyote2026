# 04 · El juego

**Qué contiene:** diseño completo del videojuego de 5 minutos paso a paso: menús, lobby estilo Kahoot/PIN, pista lineal de preparación en cadena (donde empacas/diseñas tus subsistemas), fase de travesía y supervivencia inspirada en el videojuego ***60 Seconds! / 60 Parsecs!*** (cabina 2D + bitácora de crisis + saltos de escena con pantallas de carga) y reporte educativo NASA.  
**Dueños:** Schoenstadt, Rubén  
**Última actualización:** 2026-11-14 (22:20 h)

## En una frase

Un videojuego web cooperativo y educativo de **5 minutos** (1 a 4 jugadores) con estética **2D Flash Arcade (`ASTRO SPRITES`) + supervivencia en cabina estilo *60 Seconds! / 60 Parsecs!***, donde cada ingeniero diseña y equipa los subsistemas en dos estaciones cronometradas de 30 s, para después encerrarse en la **cabina de la nave espacial**, enfrentar las 4 compuertas de crisis consultando la **Bitácora del Capitán** con **saltos entre escenas y pantallas de carga**, y recibir retroalimentación científica real de la NASA.

---

## Estructura cronológica de una partida (5:00 minutos)

| Fase | Pantalla principal | Qué ocurre | Duración |
|---|---|---|---|
| **0 · Inicio y Lobby** | `HomeMenu` $\rightarrow$ `LobbyView` | Elegir `Singleplayer` o `Multiplayer`. Pantalla Principal en Host (PC/TV) y entrada por PIN en celulares; elegir especialista `ASTRO SPRITES` (1–4) y 1 de 3 misiones + dificultad. | ~0:30 |
| **1 · Pista Lineal: Estación 1 (Oleada 1)** | `LinearStationTrack` + `MinigameShell` | Los especialistas avanzan automáticamente a la Estación 1 y equipan presupuesto, chasis/escudo térmico, órbita e instrumentos (30 s, mutación en vivo). *(Equivalente a la fase de recolección rápida de 60 Seconds!)*. | ~1:00 |
| **2 · Pista Lineal: Estación 2 (Oleada 2)** | `LinearStationTrack` + `MinigameShell` | Tras la pantalla de carga `wave1_to_wave2` (5 s), cada rol equipa lanzador, balanceo CG, energía 3D y enlace DSN (30 s) antes del salto al lanzamiento. | ~1:00 |
| **3 · Travesía en Cabina estilo *60 Seconds!*** | `Flight60sView` | **Cabina 2D estilo *60 Seconds! / 60 Parsecs!*:** vemos a los 4 Astro Sprites dentro de la nave rodeados de los subsistemas que sí diseñaron, abriendo la **Bitácora de Crisis** en 4 rondas por turnos (15 s c/u) con **saltos de escena y pantallas de carga** entre cada compuerta. | 1:00 |
| **4 · Retroalimentación NASA** | `MissionReportDashboard` | Tras la pantalla de carga de decodificación (`flight_to_report`), se revela éxito total, parcial o fallo con cadena causal numérica, dato real NASA e historial comparativo. | ~1:30 |

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
- **Briefing y sin reloj (2026-11-15):** al abrirse cada estación aparece una tarjeta con *por qué importa*, las metas y los controles (`frontend/src/data/stationBriefings.ts`); el jugador pulsa **Start**, juega sin cronómetro y bloquea cuando quiere. Cada minijuego es una ventana de pantalla completa (`MinigameShell fill` + `components/minigames/kit/GameKit.tsx`: zona de juego + panel de metas, lecturas en vivo y botón de bloqueo) sin desplazamiento de página.
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

## Paso 3 · Fase de Supervivencia en Cabina estilo *60 Seconds!* (`Flight60sView`)

Al terminar la Estación 2 (como cuando termina la recolección y se cierra la escotilla en *60 Seconds! / 60 Parsecs!*), el estado consolidado se vuelve inmutable y la tripulación salta a la **Fase de Travesía y Supervivencia en Cabina (`Flight60sView`)** dividida en **4 escenas / capítulos de 15 segundos por turnos** (60 s en total):

1. **Escenario Diorama 2D estilo *60 Seconds!* (Cabina de Mando + Estantes de Subsistemas):**
   - La pantalla principal muestra el **interior ilustrado 2D de la cabina/módulo de mando** (panel metálico, ventana espacial hacia Luna/Asteroide/Marte, indicadores de salud de la nave y estantería con los objetos/subsistemas que el equipo realmente logró configurar en Estación 1 y 2: caja de Reserva UFE, Escudo Térmico TPS, Tanque/Giroscopio de CG, Banco de Energía y Rack Espectral/Antena DSN).
   - Los **4 `ASTRO SPRITES`** (`ASTRO_ENGINEER`, `ASTRO_MEDIC`, `ASTRO_SOLDIER`, `ASTRO_DEFENDER`) aparecen dentro de la cabina reaccionando en vivo (`idle`, `work`, `panic` si `rocket_health_pct` baja o hay alerta crítica, `cheer` al superar una compuerta).
2. **Bitácora del Capitán / Cuaderno de Decisiones + 4 Compuertas por Turnos (15 s por ronda):**
   - En cada ronda el jugador activo abre la **Bitácora / Portapapeles de Crisis** (inspirado en el diario ilustrado de *60 Seconds!*) adaptado a lo que el equipo **sí construyó** en las estaciones.
   - **Escena 1 (0–15 s · `NODE_1_LAUNCH` — Despegue y Presupuesto):** Crisis en plataforma; el **Turno de `ASTRO_ENGINEER` (Rol 1)** decide entre *eyectar lastre/etapa auxiliar*, *consumir reserva UFE* o *arriesgar carga*.
   - **Escena 2 (15–30 s · `NODE_2_PROPULSION` — Inserción Orbital / Trayectoria):** El **Turno de `ASTRO_SOLDIER` (Rol 3 / Rol 2)** enfrenta la maniobra de $\Delta v$ o vibración de CG desbalanceado (`1.5x`).
   - **Escena 3 (30–45 s · `NODE_3_EVENT` — Evento Espacial Real):** Contingencia espacial real (*Tormenta Solar Cislunar*, *Nube de Polvo*, *Tormenta Marciana*) + chequeo de Escudo Térmico. El **Turno de `ASTRO_MEDIC` (Rol 2 / Rol 3)** elige la respuesta táctica según batería/RTG/escudo disponible.
   - **Escena 4 (45–60 s · `NODE_4_DOWNLINK` — Ventana DSN y Descarga Científica):** El **Turno de `ASTRO_DEFENDER` (Rol 4)** prioriza el enlace de $160\text{ Gbit}$ antes de perder la ventana con la Tierra.
3. **Saltos entre Escenas y Pantallas de Carga Intermedias:**
   - Al responder cada compuerta, aparece la consecuencia inmediata en la Bitácora (`resultado_turno_vuelo`: `PASS`, `DEGRADED`, `CRITICAL` + animación de daños/chispas o estabilización en la cabina) y acto seguido se ejecuta un **Salto de Escena con cortina / pantalla de carga de transición** (ej. `"DAY / STAGE 02 — ENTERING DEEP SPACE TRANSIT..."`) antes de pasar al siguiente capítulo o al desenlace `flight_to_report`.
4. **Host Main Stage vs. Celular por PIN:**
   - **En pantalla Principal (Host):** diorama completo de cabina, los 4 Astro Sprites reaccionando, barra de los 4 Nodos y alerta gigante de quién tiene la Bitácora en su mano.
   - **En el Celular (Jugador en turno):** tarjeta portátil estilo Bitácora de *60 Seconds!* con botones táctiles grandes (`1–4`) y reloj de 15 s; si es turno de otro compañero, muestra un visor compacto de espera con el personaje activo.
   - **En Singleplayer:** el jugador humano resuelve las 4 páginas consecutivas de la Bitácora (una cada 15 s).

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

## Flujo vigente del videojuego (2026-11-15, iteraciones de jugabilidad)

1. **Pantalla de carga única** (solo al abrir el juego): animación `loading-loop.webp` generada en Python sobre el fondo de nebulosa del arte.
2. **Menú principal** (mockup del equipo): *ASTRO SQUAD* + `SINGLE PLAYER`, `MULTI PLAYER` y engrane de opciones (nombre, sonido, música, cómo jugar, sandbox). Botones en placa dorada MLI / acero cepillado con letras blancas, paleta tomada del arte.
3. **Multijugador:** `HOST MATCH` (apodo → sala) o `JOIN MATCH` estilo Kahoot (PIN → apodo). En la sala, banner con dirección, PIN grande y jugadores conectados (los asientos vacíos los vuela la IA).
4. **Rol → Misión** (cada misión trae su dificultad: Luna fácil, asteroide media, Marte difícil).
5. **Estaciones:** cinemática a pantalla completa (el escuadrón camina a la puerta) → briefing → minijuego a pantalla completa (2 por jugador) → *Waiting for the crew* si otros no han terminado → cinemática → estación 2.
6. **Árbol de decisiones en vivo:** franja *If we launched now* con las 4 compuertas (Liftoff, Engine burn, Space hazard, Call Earth) recalculadas por el servidor tras cada decisión.
7. **Despegue según la misión** (destino Luna/asteroide/Marte con sprites del arte) → **fase de supervivencia**: un evento aleatorio por partida (tormenta solar, micrometeoroide, caída de antena DSN, eyección de partículas, tormenta de polvo, conjunción solar) que el diseño puede bloquear (p. ej. RTG contra la tormenta de polvo) → 4 capítulos de bitácora → reporte con el evento y su fuente real.

### Dificultad y pronóstico (2026-11-15, P0 de `docs/23`)

- **Curva de dificultad por peligros espaciales** (`story_tree.json → random_events._difficulty`, estimado del juego): *easy* = 1 evento ×1.0, *medium* = 1 evento ×1.5, *hard* = 2 eventos distintos ×1.5. Simulado: Luna perdona; asteroide sin cámara autónoma → éxito parcial; Marte exige RTG (o batería alta) **y** código de señal limpio para el éxito total (con energía solar la tormenta de polvo deja la batería bajo 25 % → éxito parcial).
- **Pronóstico honesto:** cada compuerta muestra *Not decided · waits ROL* hasta que su rol actúa (Liftoff → Engineer en estación 2, Engine burn → Soldier en estación 1, Space hazard → Medic en estación 1, Call Earth → Defender en estación 2); los asientos de IA cuentan como decididos al rellenarse. Etiqueta *+ hazards · dificultad* recuerda que al despegar llegan peligros aleatorios.
