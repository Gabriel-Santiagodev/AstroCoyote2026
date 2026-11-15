# Space Apps 2026 · Proyecto completo

Archivo generado el 2026-11-15 con `node herramientas/combinar.mjs`. No lo edites a mano: edita los archivos de `docs/` y vuelve a generarlo.

Contiene 27 archivos, en este orden: README.md, TRASPASO.md, docs/00-indice.md, docs/01-proyecto.md, docs/02-reto.md, docs/03-decisiones.md, docs/04-juego.md, docs/05-mvp.md, docs/06-datos-nasa.md, docs/07-hardware.md, docs/08-controles.md, docs/09-arte-y-sonido.md, docs/10-tecnico.md, docs/11-entrega.md, docs/12-roles.md, docs/13-plan-48h.md, docs/14-tareas.md, docs/15-preguntas-frecuentes.md, docs/16-glosario.md, docs/17-roadmap-ruben.md, docs/18-roadmap-ismael.md, docs/19-roadmap-abraham.md, docs/20-roadmap-schoenstadt.md, docs/21-roadmap-leonardo.md, docs/22-como-trabajar-y-hacer-merge.md, docs/23-retroalimentacion-pruebas.md, docs/24-validacion-reto.md.

---

<!-- Archivo: README.md -->
> **Archivo: `README.md`**

# Space Apps 2026 · Space Mission Design Game

Repositorio del equipo para el **NASA Space Apps Challenge 2026** (Querétaro, 14 y 15 de noviembre · **sprint de 24 horas**, de sábado 15:00 h a domingo 15:00 h), reto **"Space Mission Design Game"**.

Es un **videojuego web educativo de 5 minutos** (100 % software, *Singleplayer* y *Multiplayer* en línea de 1 a 4 jugadores) con estética híbrida **Paper Mario × Among Us + HUD NASA**, construido con **React + TypeScript + Vite + Three.js** en el frontend y **Python + FastAPI + Socket.IO** en el backend.

## Flujo del juego en 5 minutos

1. **Menú Principal (`HomeMenu`)**: Elige *Singleplayer* o *Multiplayer*.
2. **Lobby de Conexión (estilo *Among Us / Kahoot*)**: Sala con código PIN, selección de **Rol** (los roles vacíos los cubre automáticamente la IA `randomizer.py`) y selección de **1 de 3 Misiones NASA** (*Artemisa Luna*, *Cazador de Asteroides*, *Retorno de Muestras de Marte / MRO*) y su dificultad.
3. **Pista Lineal de Estaciones y Minijuegos en Cadena (2:00 min)**: El personaje avanza **automáticamente en línea recta** de estación en estación (sin caminar libre por mapa). En cada estación resuelve un minijuego de 30 s (estilo tareas de *Among Us*) con **afectación en cadena en vivo**: las decisiones de combustible, presupuesto, instrumentos u órbita modifican al instante las restricciones de los compañeros que juegan en paralelo.
4. **Vuelo de 60 Segundos con Preguntas por Turnos (1:00 min)**: Vemos la nave viajar por el espacio mientras el servidor evalúa el **Árbol de Decisiones de 4 Nodos** y lanza **4 rondas de preguntas/crisis de ingeniería por turnos** (15 s c/u).
5. **Reporte Final y Retroalimentación NASA (1:30 min)**: Gane o falle la misión, el jugador siempre recibe retroalimentación educativa causal con datos reales verificados de la NASA y puede volver a intentar.

## Empieza aquí

1. Lee [`AGENTS.md`](AGENTS.md) y [`docs/03-decisiones.md`](docs/03-decisiones.md) para ver las reglas y decisiones vigentes.
2. Lee [`docs/00-indice.md`](docs/00-indice.md) para ubicarte en todos los documentos.
3. Revisa los documentos técnicos base de arquitectura:
   - [`arquitectura_integral_y_motor_espectral_nasa_space_apps_2026.md`](arquitectura_integral_y_motor_espectral_nasa_space_apps_2026.md)
   - [`arquitectura_y_dependencias_nasa_space_challenge.md`](arquitectura_y_dependencias_nasa_space_challenge.md)
4. Busca tu **Roadmap paso a paso** y tus tareas en [`docs/12-roles.md`](docs/12-roles.md), [`docs/14-tareas.md`](docs/14-tareas.md) y tu guía individual:
   - **Rubén:** [`docs/17-roadmap-ruben.md`](docs/17-roadmap-ruben.md)
   - **Ismael:** [`docs/18-roadmap-ismael.md`](docs/18-roadmap-ismael.md)
   - **Abraham:** [`docs/19-roadmap-abraham.md`](docs/19-roadmap-abraham.md)
   - **Schoenstadt:** [`docs/20-roadmap-schoenstadt.md`](docs/20-roadmap-schoenstadt.md)
   - **Leonardo:** [`docs/21-roadmap-leonardo.md`](docs/21-roadmap-leonardo.md)
5. **Guía rápida de trabajo en paralelo y merge sin conflictos:** [`COMO_TRABAJAR.md`](COMO_TRABAJAR.md) y [`docs/22-como-trabajar-y-hacer-merge.md`](docs/22-como-trabajar-y-hacer-merge.md).

## Cómo trabajar con agentes de IA (Protocolo Obligatorio)

Todo el contexto consolidado del proyecto vive en **`proyecto-completo.md`**.

- **Regla de oro para humanos y agentes:** Cada vez que modifiques cualquier archivo en `docs/` o cambies un contrato de código (eventos Socket.IO, `MinigameProps`, esquemas Pydantic, datos NASA), **actualiza el documento correspondiente en `docs/` y ejecuta:**

  ```bash
  node herramientas/combinar.mjs
  ```

  Eso regenera `proyecto-completo.md` para que todos los agentes y compañeros trabajen siempre sobre la misma fuente de verdad.
- **Prompt de sistema para ChatGPT, Gemini o Claude:** Copia el bloque oficial de [`docs/00-indice.md` → "Instrucción para la IA"](docs/00-indice.md#instrucción-para-la-ia).
- Las etiquetas son estrictas: **[DECIDIDO]**, **[PROPUESTA]** o **[ABIERTO]**.

---

<!-- Archivo: TRASPASO.md -->
> **Archivo: `TRASPASO.md`**

# Traspaso y Pivote Oficial del Hackathon

**Fecha inicial del traspaso:** 10 de noviembre de 2026  
**Cierre del traspaso y pivote de 24 h:** 14 de noviembre de 2026, 15:00 h

## Estado del traspaso

Roberto dejó el equipo antes del evento. El **sábado 14 de noviembre de 2026 a las 15:00 h** (inicio efectivo de las 24 horas del hackathon, hasta el domingo 15 de noviembre a las 15:00 h), **Rubén** asume formalmente el liderazgo y la organización general del equipo (**Rubén, Ismael, Abraham, Schoenstadt, Leonardo**).

## Cambios clave adoptados al arrancar el evento (14 nov, 15:00 h)

Toda la base de investigación y diseño previa creada por Roberto se conserva como cimiento y se transforma al nuevo concepto **100 % software web**, documentado en `docs/03-decisiones.md` y en los documentos maestros de arquitectura de Leonardo (`arquitectura_integral_y_motor_espectral_nasa_space_apps_2026.md` y `arquitectura_y_dependencias_nasa_space_challenge.md`):

1. **Cero hardware físico:** Se descarta la estación USB arcade y Unity; el juego corre 100 % en navegador (**React + TypeScript + Vite + Tailwind + Framer Motion + Three.js**) respaldado por **FastAPI + Socket.IO**.
2. **Flujo ágil de 5 minutos:** Menú (`Singleplayer` / `Multiplayer`) $\rightarrow$ Lobby estilo *Among Us / Kahoot* $\rightarrow$ Selección de Rol + 1 de 3 Misiones NASA y Dificultad $\rightarrow$ **Pista Lineal de Estaciones** con movimiento automático del personaje y minijuegos paralelos con afectación en cadena en vivo $\rightarrow$ **Dinámica de vuelo de 60 segundos con preguntas por turnos** $\rightarrow$ **Retroalimentación educativa NASA** (siempre presente, gane o falle la misión).
3. **Estética propia:** Híbrido visual **Paper Mario × Among Us + HUD aeroespacial NASA**, evitando simuladores genéricos (*AI slop*).
4. **Plan de 24 horas con roadmaps individuales:** Cada uno de los 5 integrantes tiene su roadmap paso a paso (`docs/17-roadmap-ruben.md` a `docs/21-roadmap-leonardo.md`) para trabajar en paralelo con IA y ensamblar sin colisiones.

## Regla de mantenimiento

- Toda decisión y contrato vive en `docs/`.
- Después de cualquier cambio en `docs/`, corre siempre:

  ```bash
  node herramientas/combinar.mjs
  ```

Mucho éxito al equipo en estas 24 horas en Querétaro.

---

<!-- Archivo: docs/00-indice.md -->
> **Archivo: `docs/00-indice.md`**

# 00 · Índice

**Qué contiene:** el mapa de todos los documentos del proyecto, las etiquetas oficiales de estado y el System Prompt obligatorio para cualquier agente de IA.  
**Última actualización:** 2026-11-14 (15:00 h · Pivote 24h Web)

## Los documentos

| Archivo | Qué responde | Dueño |
|---|---|---|
| `01-proyecto.md` | ¿Qué es el hackathon (24 h), quiénes somos, qué pasó la vez pasada y cuáles son nuestros principios? | Rubén |
| `02-reto.md` | ¿Qué pide exactamente la NASA (texto oficial + recursos) y cómo nos califican? | Rubén, Abraham |
| `03-decisiones.md` | ¿Qué ya está decidido (`[DECIDIDO]`), qué es propuesta (`[PROPUESTA]`) y qué falta decidir? | Rubén |
| `04-juego.md` | ¿Cómo es el juego de 5 minutos paso a paso (Menú, Lobby, Estaciones Lineales en cadena, Vuelo 60s y Retroalimentación)? | Schoenstadt, Rubén |
| `05-mvp.md` | ¿Qué entra sí o sí en 24 h (MVP), qué es extra y qué queda fuera? | Todos |
| `06-datos-nasa.md` | ¿Cuáles son las ecuaciones, constantes WGS84, catálogo 2026 de cohetes/órbitas/instrumentos y sus fuentes NASA? | Abraham, Schoenstadt |
| `07-hardware.md` | Arquitectura de pantallas web (`HostScreen` + `PlayerPad` / modo unificado) que sustituye al hardware físico. | Rubén, Leonardo |
| `08-controles.md` | Interacción en estaciones, controles web y contrato de eventos Socket.IO en tiempo real. | Rubén, Leonardo |
| `09-arte-y-sonido.md` | Identidad visual híbrida **Paper Mario × Among Us + HUD NASA**, animaciones y audio libre. | Leonardo |
| `10-tecnico.md` | Arquitectura del monorepo (React/TS + FastAPI/Socket.IO), interfaz `MinigameProps` y esquemas Pydantic. | Leonardo, Rubén, Schoenstadt |
| `11-entrega.md` | ¿Qué entregamos a los jueces (video de 30 s, página en inglés, referencias, uso de IA)? | Rubén |
| `12-roles.md` | Distribución de roles para las 5 personas (Rubén, Ismael, Abraham, Schoenstadt, Leonardo). | Rubén |
| `13-plan-48h.md` | Cronograma de **24 horas** (Sábado 15:00 h a Domingo 15:00 h), hitos y turnos de descanso. | Rubén |
| `14-tareas.md` | Lista maestra de tareas por área y dueño (`RUB`, `ISM`, `ABR`, `SCH`, `LEO`, `ENT`, `QA`) y criterio de cierre. | Todos |
| `15-preguntas-frecuentes.md` | Respuestas rápidas a las dudas más frecuentes del equipo y de los jueces. | Rubén |
| `16-glosario.md` | Glosario técnico de ingeniería espacial, espectroscopía y arquitectura web del juego. | Abraham |
| `17-roadmap-ruben.md` | Roadmap paso a paso de **Rubén** (Backend Socket.IO, salas PIN, concurrencia en vivo, integración y deploy). | Rubén |
| `18-roadmap-ismael.md` | Roadmap paso a paso de **Ismael** (Minijuegos 2D de Diseño de Nave, Masa/CG, Lanzador y Presupuesto con lenguaje sencillo y prompts listos). | Ismael |
| `19-roadmap-abraham.md` | Roadmap paso a paso de **Abraham** (`nasa_catalog.json`, Motor Espectral y Minijuegos de Ciencia, DSN, Órbita y Energía 3D). | Abraham |
| `20-roadmap-schoenstadt.md` | Roadmap paso a paso de **Schoenstadt** (Motor físico, `randomizer.py`, Árbol de Decisiones de 4 Nodos y Árbol de Preguntas del Vuelo de 60s). | Schoenstadt |
| `21-roadmap-leonardo.md` | Roadmap paso a paso de **Leonardo** (Sistema visual *Paper Mario × Among Us*, Menús, Lobby, Pista Lineal, Vuelo 60s y Dashboard). | Leonardo |
| `22-como-trabajar-y-hacer-merge.md` | Reglas de trabajo en paralelo tipo rompecabezas, auto-instalación, pruebas aisladas (`/dev-sandbox` / `pytest`) y protocolo de `git merge` sin conflictos. | Rubén, Equipo |
| `24-validacion-reto.md` | Matriz de trazabilidad reto → juego, hechos NASA revisados y corregidos, verificación y pendientes. | Leonardo, Equipo |
| `23-retroalimentacion-pruebas.md` | Resultados de las pruebas de juego en local (solo y multijugador), correcciones aplicadas y áreas de oportunidad priorizadas (P0–P2) con dueño sugerido. | Leonardo, Equipo |

### Documentos maestros de arquitectura complementarios (en la raíz)
- `arquitectura_integral_y_motor_espectral_nasa_space_apps_2026.md` — Especificación matemática, ecuaciones orbitales, integración `logica/` + `juegos_espectrales/`, `randomizer.py` y `decision_tree.py`.
- `arquitectura_y_dependencias_nasa_space_challenge.md` — Dependencias base (`requirements.txt`, `package.json`) y flujo WebSocket estilo Kahoot + Netflix Interactive.

## Etiquetas

Cada dato o decisión importante lleva una de estas tres etiquetas:

- **[DECIDIDO]** — El equipo ya lo acordó. Ningún agente ni integrante puede contradecirlo sin consenso y registro en `03-decisiones.md`.
- **[PROPUESTA]** — Arquitectura o diseño recomendado para avanzar rápido. Se puede ajustar en equipo si hace falta, pero es el plan por defecto.
- **[ABIERTO]** — Falta decidirlo. Tiene dueño y momento límite en `03-decisiones.md`.

Los números del juego llevan su estado en `06-datos-nasa.md`: **verificado**, **fuente secundaria** o **sin verificar**.

## Reglas obligatorias para editar y para Agentes de IA

1. **Fuente única de verdad:** Una regla o contrato vive en un solo archivo de `docs/`. Los demás archivos lo enlazan, no lo duplican con valores distintos.
2. **Cambios a decisiones:** Si cambia algo marcado **[DECIDIDO]**, se registra arriba en `03-decisiones.md` con fecha y hora.
3. **Idiomas:** Planeación en `docs/` en **español** con UTF-8 correcto (acentos y `ñ`). Interfaz del juego, página de entrega y subtítulos del video en **inglés**. Código e identificadores de contratos en **inglés** (respetando módulos heredados como `juegos_espectrales/`).
4. **Sincronización obligatoria del contexto oficial:** Cada vez que un humano o un agente de IA edite cualquier documento en `docs/` o cambie contratos de código (eventos Socket.IO, `MinigameProps`, esquemas Pydantic, constantes NASA o estado `[x]` de tareas), debe actualizar el archivo correspondiente en `docs/` y correr inmediatamente:

```bash
node herramientas/combinar.mjs
```

para regenerar `proyecto-completo.md`.

## Instrucción para la IA (System Prompt Oficial)

Pega este bloque al iniciar cualquier sesión de trabajo en **Antigravity, Claude Code, Cursor, Gemini, ChatGPT o NotebookLM**:

```text
Eres el agente asistente de ingeniería de nuestro equipo para el NASA Space Apps Challenge 2026 (sprint de 24 horas: sábado 14 nov 15:00 h a domingo 15 nov 15:00 h).
Lee primero AGENTS.md y proyecto-completo.md (o los archivos específicos de docs/).

REGLAS ESTRICTAS QUE DEBES CUMPLIR EN CADA EJECUCIÓN:
1. Autoridad técnica: AGENTS.md y docs/03-decisiones.md mandan sobre cualquier suposición. El proyecto es 100 % web (React + TypeScript + Vite + Tailwind + Framer Motion + Three.js en frontend; Python + FastAPI + python-socketio + Pydantic v2 en backend). NO hay hardware físico ni Unity.
2. Etiquetas: [DECIDIDO] es inmutable; [PROPUESTA] es el plan por defecto; nunca inventes soluciones sobre algo marcado [ABIERTO] sin preguntar.
3. Prohibido inventar números: Toda constante física, cohete, órbita, presupuesto o instrumento debe provenir de docs/06-datos-nasa.md o frontend/src/data/nasa_catalog.json con su campo "fuente".
4. Contratos compartidos:
   - Todos los minijuegos en React deben implementar exactamente la interfaz MinigameProps (docs/10-tecnico.md) y ser autocontenidos en frontend/src/components/minigames/.
   - Los eventos en tiempo real deben respetar exactamente la tabla de docs/08-controles.md (concurrencia en vivo entre estaciones paralelas y turnos del modo vuelo de 60 segundos).
5. Estética propia: Mantén el estilo visual híbrido Paper Mario × Among Us + HUD aeroespacial NASA (docs/09-arte-y-sonido.md). Nunca uses el logo de la NASA.
6. Sincronización obligatoria: Si tu cambio modifica contratos, parámetros, arquitectura o completa una tarea, actualiza el archivo correspondiente en docs/ (marcando [x] en docs/14-tareas.md si aplica) y ejecuta `node herramientas/combinar.mjs` para actualizar proyecto-completo.md antes de terminar.
7. Idioma: Responde al equipo en español claro y directo; genera la UI del juego, textos visibles para jugadores y código en inglés.
```

---

<!-- Archivo: docs/01-proyecto.md -->
> **Archivo: `docs/01-proyecto.md`**

# 01 · El proyecto

**Qué contiene:** qué es el hackathon (24 horas), quiénes integramos el equipo, qué aprendimos de la edición anterior y los principios rectores que guían cada decisión.  
**Dueño:** Rubén  
**Última actualización:** 2026-11-14 (15:00 h)

## El hackathon

| Campo | Detalle |
|---|---|
| Evento | NASA International Space Apps Challenge 2026 |
| Sede | Evento presencial en la ciudad de Querétaro |
| Ventana de construcción | **Sábado 14 de noviembre de 2026 (15:00 h) a Domingo 15 de noviembre de 2026 (15:00 h)** — **24 horas efectivas** |
| Evaluación | Inicia el 16 de noviembre (locales $\rightarrow$ nominados globales) |
| Reto oficial | **Space Mission Design Game** (`02-reto.md`) |
| Organización interna | Traspaso cerrado el 14 nov; **Rubén** asume como organizador y líder de proyecto (`TRASPASO.md`) |

## El equipo (5 integrantes)

| Nombre | Perfil y enfoque en el sprint de 24 h |
|---|---|
| **Rubén** | **Líder de Proyecto, Backend Realtime (FastAPI + Socket.IO), Integración y Deploy.** Coordina el flujo entre los 5 integrantes, implementa salas con PIN y sincronización paralela en vivo, y asegura la entrega final a tiempo. |
| **Ismael** | **Minijuegos 2D de Nave, Masa/CG, Vehículo de Lanzamiento y Presupuesto.** Sin experiencia previa profunda en desarrollo web; trabaja con una plantilla guiada paso a paso (`docs/18-roadmap-ismael.md`) para vibecodear minijuegos visuales autocontenidos de *Spacecraft Design* y *Launch Vehicle*. |
| **Abraham** | **Datos Verificados NASA, Motor Espectral y Minijuegos de Ciencia, Comms, Órbita y Energía 3D.** Mantiene `nasa_catalog.json`, adapta el núcleo FTIR (`logica/` + `juegos_espectrales/`) y construye los minijuegos científicos, orbitales, DSN y 3D. |
| **Schoenstadt** | **Arquitecta de Sistemas, Concurrencia Causal, Árbol de Decisiones y Modo Vuelo de 60 Segundos.** Diseña el motor físico/decisiones (`physics_engine.py`, `decision_tree.py`, `randomizer.py`) y el árbol interactivo de preguntas/crisis de 60 segundos por turnos con retroalimentación NASA. |
| **Leonardo** | **Arquitecto de UI/UX, Pista Lineal, Vuelo 60s, Dashboard y Arte *Paper Mario × Among Us*.** Construye el menú principal, lobby, pista lineal con desplazamiento automático del personaje, escena de vuelo de 60s, dashboard final de retroalimentación e identidad visual del juego. |

- Todo el equipo tiene nivel de inglés suficiente (B2–C1) para que la interfaz del juego, el video de 30 s y la página de entrega estén en inglés impecable.
- Ninguno había desarrollado un videojuego web completo anteriormente: nuestra ventaja competitiva es la **arquitectura modular por contratos estrictos** + **asistencia guiada con agentes de IA** bajo criterio humano riguroso.

## Qué pasó la vez pasada (y por qué NO haremos *AI Slop*)

En una edición previa, parte del equipo presentó un clasificador de exoplanetas con una página web sencilla y no recibió retroalimentación favorable porque:
1. La idea parecía genérica y no destacaba visualmente.
2. Los jueces percibieron "solo una página web" sin narrativa ni experiencia interactiva memorable.
3. La historia del impacto educativo no quedó clara.

Para **ganar el NASA Space Apps Challenge 2026**, evitamos caer en el típico simulador genérico generado por IA (*AI slop* lleno de formularios aburridos):

- **Esencia propia (*Paper Mario × Among Us + HUD NASA*):** Personajes carismáticos con estética de recorte de papel 2.5D y bordes tipo sticker avanzando automáticamente por una pista lineal de estaciones.
- **Partida ágil de ~5 minutos:** Fricción cero para jueces y estudiantes; se entiende en segundos, entretiene de principio a fin y deja una enseñanza real.
- **Consecuencias en cadena reales:** No es trivia suelta ni simulador plano; cada decisión en una estación afecta en tiempo real las restricciones físicas de las estaciones paralelas y posteriores.
- **Siempre da retroalimentación:** Gane o pierda la misión en el árbol de 4 Nodos y el vuelo de 60 segundos, el jugador entiende exactamente *qué número falló*, *qué decisión lo causó* y *cómo ocurrió en misiones reales de la NASA*.

## Principios rectores (deciden las discusiones)

1. **[DECIDIDO] 100 % Software Web (cero hardware físico):** Descartamos la estación arcade y Unity. El juego corre en cualquier navegador moderno (PC y teléfonos en red local o web pública) mediante React + TypeScript + FastAPI + Socket.IO.
2. **[DECIDIDO] Ciclo de 5 minutos, corto y rejugable:** Menú $\rightarrow$ Lobby $\rightarrow$ Pista Lineal de Estaciones (minijuegos paralelos en cadena) $\rightarrow$ Vuelo espacial de 60 segundos con preguntas por turnos $\rightarrow$ Reporte y retroalimentación NASA.
3. **[DECIDIDO] Datos reales o no cuenta:** Cada masa, potencia, $\Delta v$, costo, cohete y espectro se respalda con fuentes de la NASA o de fabricantes en `06-datos-nasa.md`. Es la base del criterio de *Validez*.
4. **[DECIDIDO] Alcance realista para 24 horas:** Un juego sólido, conectado de punta a punta y visualmente pulido vence a diez funciones inconexas. Priorizamos primero el flujo completo funcional antes de agregar extras.
5. **[DECIDIDO] Español para el equipo, inglés para los jueces:** Toda la planeación (`docs/`) va en español; toda la interfaz del juego, el video de 30 s y la página del proyecto en Space Apps van en inglés.
6. **[DECIDIDO] Contratos antes que improvisación:** Nadie rompe `MinigameProps`, los eventos Socket.IO ni los esquemas Pydantic sin actualizar `docs/` y correr `node herramientas/combinar.mjs`.

## Reglas oficiales del evento que debemos cumplir

- **Equipos de 1 a 6 personas:** Somos 5 integrantes registrados.
- **Entrega demo:** **Video de máximo 30 segundos** (con subtítulos en inglés) o **máximo 7 diapositivas** en inglés. Exceder los 30 segundos descalifica la evaluación global.
- **Página del proyecto en inglés** con descripción clara, enlace jugable en navegador y referencias completas.
- **Premios globales:** Obligatorio usar datos o recursos oficiales de la NASA y citarlos.
- **Uso de IA:** Permitido si se declara explícitamente en la entrega; **toda imagen o video generado con IA debe llevar marca de agua visible**.
- **Nunca usar el logo oficial de la NASA.**
- **Código abierto en el repositorio:** Todo el código escrito durante las 24 h vive en este repositorio y se citan librerías externas en `referencias.md`.

---

<!-- Archivo: docs/02-reto.md -->
> **Archivo: `docs/02-reto.md`**

# 02 · El reto

**Qué contiene:** qué pide exactamente la NASA, cómo nos califican los jueces, cómo lo cubre nuestro juego web de 5 minutos y el texto oficial completo (incluyendo *NASA Data & Resources*).  
**Dueños:** Rubén, Abraham  
**Última actualización:** 2026-11-14 (23:50 h)

## En una frase

Crear un **videojuego web interactivo (1 a 4 jugadores)** donde los participantes diseñen, configuren y operen una misión espacial completa a través de **estaciones lineales con minijuegos en cadena**, sobrevivan un **vuelo de 60 segundos por turnos** y reciban **retroalimentación educativa basada en datos reales de la NASA** sobre cada compromiso de ingeniería (*trade-off*).

## Lo que pide el reto vs. dónde lo cubrimos

| Requisito / Consideración del reto | Cómo lo cubre nuestro juego |
|---|---|
| **1 o hasta 4 jugadores colaborando** (Singleplayer y Multiplayer con roles) | Menú inicial (`Singleplayer` / `Multiplayer`) $\rightarrow$ Lobby por PIN estilo *Among Us / Kahoot* con 4 roles especializados; la IA (`randomizer.py`) cubre los roles vacíos cuando juegan 1, 2 o 3 personas (`04-juego.md`). |
| **Definir objetivo, dificultad y escenario** | Selección de **3 misiones NASA** con dificultad escalonada: *Artemis Moon* (Fácil), *Asteroid Hunter* (Media), *Mars Sample Return / MRO* (Difícil). |
| **Diseñar nave, instrumentos, órbita, lanzador y presupuesto** | 2 Oleadas de **estaciones lineales** (8 minijuegos de 30 s: Presupuesto/UFE, Lanzador/Cofia, Montaje Topológico, Balanceo de Masa/CG, Órbita/Tsiolkovsky, Energía 3D, Ciencia/Calibración Espectral y Comms DSN). |
| **Cada decisión crea consecuencias e interdependencias en cadena** | Concurrencia en tiempo real (`mutacion_en_vivo`): decidir menos combustible o elegir cierto motor/instrumento modifica al instante la masa disponible, la pérdida FSPL, la reserva UFE y la dificultad de las estaciones paralelas y siguientes. |
| **Validar compatibilidad masa / órbita / lanzador** | Nodo 1 (`NODE_1_LAUNCH`) y Nodo 2 (`NODE_2_PROPULSION`) en `decision_tree.py` evalúan capacidad del cohete, presupuesto y $\Delta v$ de Tsiolkovsky. |
| **Simular la misión con eventos y operación por turnos** | **Fase de Vuelo de 60 segundos**: animación del cohete en ruta mientras ocurren eventos reales (tormenta solar, nube de polvo, conjunción solar) y los jugadores responden por turnos preguntas/crisis de ingeniería de 15 s (`story_tree.json`). |
| **Evaluar y explicar por qué la misión tuvo éxito o falló** | **Dashboard Final de Retroalimentación NASA**: se muestra siempre (gane o pierda), detallando la cadena causal numérica, el puntaje (0–1,000 pts), un dato histórico real NASA y el botón de reintentar/rediseñar. |
| **Accesible, educativo y divertido (no *AI slop*)** | Estética híbrida **Paper Mario × Among Us + HUD NASA**, guías paso a paso y conceptos científicos explicados dentro de cada minijuego espectral/orbital (`educational_guide`, sin exigir conocimientos previos) y partida ágil de ~5 minutos. |

## Cómo nos califican (5 criterios globales)

| Criterio | Qué evalúan los jueces | Cómo destacamos |
|---|---|---|
| **Influence (Impacto)** | Alcance educativo e impacto práctico. | Juego web sin descargas ni hardware propietario; útil en salones de clase y talleres STEM con partidas de 5 min. |
| **Creativity (Creatividad)** | Originalidad mecánica y artística. | Pista lineal con avance automático estilo *Paper Mario × Among Us*, minijuegos espectrales reales (`logica/` FTIR) + vuelo de 60 s con decisiones por turnos. |
| **Validity (Validez)** | Rigor científico y verosimilitud real. | Ecuaciones WGS84, Tsiolkovsky, FSPL, centro de gravedad, reservas UFE (NPR 7120.5) y datos reales de Artemis I, OSIRIS-REx y MRO/MSR con fuentes citadas (`06-datos-nasa.md`). |
| **Relevance (Relevancia)** | Alineación directa con "diseñar, manejar, simular y aprender trade-offs". | Cada subsistema del reto (*mass, power, budget, data, communications, lifetime, orbit, launcher, instruments*) está acoplado matemáticamente. |
| **Presentation (Presentación)** | Claridad de la historia y demostración. | Video de 30 s nítido mostrando el flujo completo en vivo, página en inglés impecable y reporte causal legible. |

**Recordatorio crítico:** Los jueces globales solo ven el **video de 30 segundos** y la **página del proyecto** (y pueden abrir la URL del juego web). Por eso el deploy en navegador funcional y el video son prioridad máxima.

## Texto oficial completo del reto (NASA Space Apps Challenge 2026)

```text
BACKGROUND
Space missions are complex systems in which scientific objectives, engineering requirements, available resources, and operational constraints must work together. Designing a mission involves decisions about the spacecraft, scientific instruments, launch vehicle, orbit, power, mass, communications, budget, and mission lifetime. A decision that improves one aspect of a mission can create limitations in another. For example, adding a more capable instrument may increase scientific value while also increasing mass, power consumption, data volume, and cost. Understanding these trade-offs is essential to developing successful space missions.

However, learning space mission design is often limited to theoretical exercises because students and aspiring engineers rarely have access to an environment where they can experiment with an entire mission from concept to operation. Existing tools often focus on individual topics such as orbital mechanics, spacecraft design, or rocket launches without demonstrating how these elements interact as a complete system. This leaves a gap between learning individual space concepts and understanding how mission teams make integrated engineering decisions.

An interactive game can help address this gap by allowing participants to experiment, make decisions, encounter constraints, and learn from both successful and unsuccessful missions. Players could design missions individually or collaborate in teams of up to four people, with each participant contributing to the mission strategy and working together to achieve the best possible result. Potential approaches could include mission planning, spacecraft configuration, instrument selection, resource management, orbital selection, launch planning, communications, and mission simulation. You are encouraged to develop creative alternatives that make the experience engaging while preserving the fundamental trade-offs of real-world space mission design.

OBJECTIVES
Your challenge is to create an interactive Space Mission Design Game that allows participants to experience the process of designing and managing a complete space mission. You may consider enabling a player to participate individually or collaborate with a team of up to four people, with participants working together to make strategic decisions and achieve the highest possible mission performance.

The game could allow participants to define a mission objective, establish mission requirements, design a spacecraft, select scientific instruments, choose a launch vehicle and orbit, and manage key constraints such as budget, mass, power, communications, data, and mission lifetime. Players benefit from seeing how their decisions affect other parts of the mission, and from understanding the trade-offs involved in real-world space mission design.

A strong solution might include a functional interactive game or simulation with a clear user interface, mission configuration system, resource management mechanisms, collaboration or multiplayer functionality for up to four participants, and a mission simulation and evaluation system. The game could provide feedback on mission performance and reward effective engineering decisions, efficient resource management, successful collaboration, and achievement of mission objectives. Participants are encouraged to develop creative game mechanics, visualizations, scoring systems, and mission scenarios that make the experience engaging while requiring players to solve problems, make trade-offs, and collaborate to achieve mission success.

POTENTIAL CONSIDERATIONS
You may (but are not required to) consider the following:

Game design and experience
- The game could be accessible to participants with different levels of knowledge about space science and engineering.
- The game could support both single-player and team play, allowing up to four participants to collaborate on the same mission.
- Team members could have different responsibilities, such as mission planning, spacecraft design, science, communications, or resource management.
- Clear objectives and feedback help participants understand why a mission succeeds or fails.
- Consider making the game interactive, allowing participants to modify their mission design and simulate it multiple times.
- A scoring system could reward mission success, scientific value, efficient use of resources, and effective decision making.
- The game could include different difficulty levels, mission types, or scenarios.

Mission design
- Participants could begin by defining a mission objective before making spacecraft and engineering decisions.
- Consider giving every major design decision a consequence. For example, increasing the number of instruments could increase scientific capabilities but also increase mass, power consumption, cost, and data generation.
- Consider demonstrating that there is rarely a single perfect solution. Different combinations of spacecraft, instruments, orbits, and launch vehicles could achieve the same mission objective.
- Consider including realistic constraints such as limited budget, spacecraft mass, available power, communications capacity, and mission lifetime.

Spacecraft and payload
- The spacecraft could include components such as structure, power systems, batteries, communications, onboard computers, attitude control, and scientific instruments.
- Scientific instruments could have different characteristics, including mass, power consumption, cost, data generation, and scientific value.
- Consider allowing participants to choose between simple and advanced spacecraft components depending on the difficulty level.

Orbit and launch
- The game could provide several orbital options and explain their basic characteristics.
- Participants could consider how the selected orbit affects coverage, observation opportunities, communications, mission lifetime, and other mission requirements.
- Launch vehicles could have different payload capacities, costs, and orbital capabilities.
- Consider building in a check that the spacecraft mass and selected orbit are compatible with the chosen launch vehicle.

Resource Management
- The game should clearly display the main resources available to the mission team.
- Important resources could include:
  - Mass: the total mass of the spacecraft and payload.
  - Power: the energy available to operate spacecraft systems and instruments.
  - Budget: the financial resources available to develop and operate the mission.
  - Data: the amount of information generated by scientific instruments.
  - Communications: the spacecraft's ability to transmit data to ground stations.
  - Time: The planned development and operational lifetime of the mission.
- You may consider identifying which resources are most critical to your specific mission.

Collaboration
- In team mode, up to four participants could work together on the same mission.
- Consider giving team members different roles or responsibilities while asking them to make decisions collectively.
- The game could include situations where team members must negotiate between competing priorities.
- The final mission result could depend on how effectively the team coordinates its decisions.

Educational value
- Scientific and engineering concepts work best when explained in simple terms rather than assuming advanced knowledge.
- Complex concepts such as orbital altitude, payload capacity, power consumption, data rate, and communications could be introduced through the game itself.
- Consider including short explanations, tutorials, visual indicators, or optional learning resources.
- Consider teaching participants why a particular decision affects mission performance, rather than simply indicating whether the decision is correct or incorrect.

You may consider adding features such as:
- Multiple mission scenarios with different objectives
- Random events or unexpected mission constraints
- Different difficulty levels
- Realistic or simplified spacecraft models
- Interactive spacecraft visualizations
- Mission dashboards showing real-time resource consumption
- Leaderboards or mission rankings
- Mission reports generated at the end of each simulation
- The ability to save, share, and compare mission designs
- Cooperative missions for teams of up to four participants
- Competitive scenarios where different teams design missions to solve the same objective
- A sandbox mode that allows participants to experiment without predefined constraints
- A post-mission analysis explaining why the mission succeeded or failed
```

## Recursos Oficiales NASA y Socios (NASA Data & Resources)

Estas fuentes oficiales de la pestaña *Resources* del reto fundamentan nuestra arquitectura (`06-datos-nasa.md`):

1. **Design and Develop Science Missions:** Enfoque de ingeniería de sistemas dividido en 4 segmentos (*Launch segment*, *Space segment*, *Ground segment*, *User segment*). Nuestro juego modela los 4 segmentos a través de los 4 Roles y los 4 Nodos del Árbol de Decisiones.
2. **General Mission Analysis Tool (GMAT):** Base de inspiración para los cálculos de propagación orbital, $\Delta v$, maniobras y comparación de trayectorias en `physics_engine.py`.
3. **Concept Maturity Levels (CMLs 1–4 de JPL):** Marco para evaluar madurez temprana de misión (factibilidad, *trade studies*, márgenes de diseño como el margen de crecimiento de masa $\ge 35\%$ en CML 4 del Rol 2B).
4. **Mission Design Lab (MDL de NASA):** Estudio colaborativo concurrente entre disciplinas (potencia, propulsión, térmica, estructuras, aviónica, comunicaciones, control de actitud, software, confiabilidad, costo y riesgo), reflejado en las 2 oleadas paralelas y la reserva UFE (NPR 7120.5).
5. **NASA Mission Viz:** Inspiración para visualizar en tiempo real las trayectorias, el cohete y los cuerpos celestes durante la fase de vuelo de 60 segundos y la escena 3D de logística energética.
6. **A Learning Game About Telescopes:** Referencia directa de flujo educativo: elegir objetivo científico $\rightarrow$ seleccionar instrumentos/longitudes de onda compatibles $\rightarrow$ lanzar mediante animación $\rightarrow$ recibir resultados científicos y comparación con misiones reales de la NASA.
7. **CubeSat 101 (CSLI):** Guía base sobre ConOps, balance de masa/Centro de Gravedad (Sección 6.4) y presupuesto de potencia/enlace en misiones espaciales.
8. **Visualize a Space Mission Using Virtual Reality (2023 Space Apps):** Referencia para presentar el concepto de misión, trayectorias, línea temporal de eventos y relaciones espaciales de manera intuitiva.
9. **Space Agency Partner Resources — CSA (Canadian Space Agency):** Colección de juegos digitales y actividades educativas accesibles para todas las edades como estándar de claridad pedagógica.

---

<!-- Archivo: docs/03-decisiones.md -->
> **Archivo: `docs/03-decisiones.md`**

# 03 · Decisiones

**Qué contiene:** todo lo que el equipo ya decidió (`[DECIDIDO]`), lo que está propuesto como arquitectura recomendada (`[PROPUESTA]`), lo que sigue abierto (`[ABIERTO]`) y el historial previo al pivote para trazabilidad.  
**Dueño:** Rubén  
**Última actualización:** 2026-11-14 (15:00 h)

Lo más nuevo va arriba.

---

## 15 de noviembre de 2026 · Juego sin límite de tiempo (Leonardo)

| Tema | Decisión vigente | Qué reemplaza |
|---|---|---|
| **Sin cronómetro en estaciones ni en el vuelo** `[DECIDIDO]` | Por pedido explícito de Leonardo tras la prueba de juego: cada estación abre con una **tarjeta de briefing** (por qué importa, metas, controles) y el jugador bloquea su toma cuando quiere (`duration_sec = 0` en `iniciar_oleada_*`). El vuelo es de **4 capítulos por turnos sin reloj** (`pregunta_vuelo_60s.duration_sec = 0`); la bitácora muestra el resultado 4 s antes del siguiente capítulo. El backend conserva un **respaldo AFK oculto** (`wave_backstop_sec = 150`, `flight_backstop_sec = 90` en `backend/game_manager.py`) para que un jugador inactivo no bloquee la sala. Partida objetivo: 3–5 min. | Reemplaza la modalidad de 30 s de A5 y el reloj de 4 × 15 s del vuelo. Se mantienen la toma única (1 toma), el árbol de 4 nodos y la degradación causal. |
| **Sin pantallas de carga intermedias** `[DECIDIDO]` | Se eliminan los loaders de arranque, lobby → estación 1, sincronización, plataforma y reporte; en su lugar hay cinemáticas cortas en la pista (caminata del escuadrón, "Sharing your choices", despegue). | Reemplaza las `MissionLoadingScreen` intermedias. |

---

## 14 de noviembre de 2026 (15:00 h) · Pivote Oficial del Hackathon (24 horas)

Al iniciar el evento (**sábado 14 nov 15:00 h a domingo 15 nov 15:00 h**) bajo la coordinación de **Rubén** tras el traspaso de Roberto, el equipo acuerda el pivote completo a un videojuego **100 % software web**, consolidando los documentos maestros de Leonardo (`arquitectura_integral_y_motor_espectral_nasa_space_apps_2026.md` y `arquitectura_y_dependencias_nasa_space_challenge.md`).

### Decisiones vigentes `[DECIDIDO]`

| Tema | Decisión vigente | Qué reemplaza |
|---|---|---|
| **Cero hardware físico** | El proyecto es **100 % software web**. No se arma consola física, Arduino ni cables USB. | Reemplaza las decisiones de hardware y estación única del 4 nov (`07-hardware.md`). |
| **Stack Web (Frontend + Backend)** | **Frontend:** React 18+, TypeScript, Vite, Tailwind CSS, Framer Motion, Three.js, Lucide React, `socket.io-client`. **Backend:** Python 3.11+, FastAPI, `python-socketio`, Pydantic v2, `numpy`, `scipy`. | Reemplaza a Unity y builds WebGL/Windows del 29 oct y 4 nov. |
| **Flujo de partida (~5 minutos)** | 1) Menú (`Singleplayer` / `Multiplayer`) $\rightarrow$ 2) Lobby con código PIN estilo *Among Us / Kahoot* $\rightarrow$ 3) Selección de Rol + 1 de 3 Misiones NASA y dificultad $\rightarrow$ 4) **Pista Lineal de Estaciones** con avance automático del personaje y minijuegos paralelos interconectados en cadena $\rightarrow$ 5) **Dinámica de vuelo de 60 segundos** viendo la nave en el espacio y respondiendo preguntas por turnos $\rightarrow$ 6) **Retroalimentación educativa NASA** siempre visible (gane o falle). | Reemplaza las rondas largas de 13 min y el mapa de turnos múltiples sin línea lineal. |
| **Movimiento lineal automático** | Los jugadores **no caminan libremente** por un mapa; el personaje se desplaza automáticamente en línea recta de una estación a la siguiente. | Descarta exploración libre tipo *Among Us* clásico para mantener la partida en 5 minutos. |
| **Concurrencia en cadena en vivo** | En multijugador todas las estaciones avanzan sincronizadas; cada decisión tomada en una estación modifica en tiempo real las restricciones y parámetros de las demás estaciones (masa, potencia, presupuesto UFE, FSPL, etc.). | Sustituye el sistema de "solo al final" por mutación causal en vivo vía Socket.IO. |
| **Estética visual propia** | Híbrido entre **Paper Mario × Among Us + HUD aeroespacial NASA**, evitando simuladores genéricos (*AI slop*). | Reemplaza el plano técnico monocromático puro en 2D. |
| **Enfoque de Ismael** | **Ismael** desarrolla los minijuegos de *Spacecraft Design* (diseño de nave y masa) y *Launch Vehicle* (vehículo de lanzamiento y presupuesto) con guía paso a paso (`18-roadmap-ismael.md`). | Reemplaza su rol previo de armado y soldadura de hardware. |
| **Sincronización documental** | Todo cambio de contratos o arquitectura se refleja en `docs/` y se regenera `proyecto-completo.md` con `node herramientas/combinar.mjs`. | Regla reforzada para agentes de IA y humanos. |

### Propuestas recomendadas para arrancar sin fricción `[PROPUESTA]`

| Tema | Propuesta recomendada (base de los Roadmaps `17`–`21`) | Dueño sugerido |
|---|---|---|
| **Reparto oficial de los 5 roles (`[DECIDIDO]`)** | **Rubén:** Backend Socket.IO, salas PIN, concurrencia en vivo, integración y deploy. **Ismael:** 4 minijuegos 2D de Nave/Masa/Lanzador/Presupuesto (`Rol2A`, `Rol1A`, `Rol1B`, `Rol2B`). **Abraham:** Datos NASA (`nasa_catalog.json`), motor espectral y 4 minijuegos de Ciencia/DSN/Órbita/3D (`Rol3A`, `Rol4A`, `Rol4B`, `Rol3B`). **Schoenstadt:** Física (`physics_engine.py`), `randomizer.py`, árbol de 4 Nodos (`decision_tree.py`) y **Árbol de Preguntas del Vuelo de 60s (`story_tree.json`)**. **Leonardo:** Menús, Lobby, Pista Lineal automática, Escena Vuelo 60s, Dashboard final, `MinigameShell` y arte *Paper Mario × Among Us*. | Rubén + Equipo |
| **Mínimo de 1 a 4 jugadores** | Hay **4 Roles** en toda misión. Si juegan 1, 2 o 3 humanos, `randomizer.py` cubre los roles vacíos adaptándose a las decisiones humanas (*Constraint-Aware Clamping*). | Schoenstadt |
| **Estructura del Vuelo de 60 s** | **4 rondas de 15 segundos** por turnos (4 × 15 s = 60 s exactos) ligadas a las 4 compuertas del árbol (`NODE_1_LAUNCH`, `NODE_2_PROPULSION`, `NODE_3_EVENT`, `NODE_4_DOWNLINK`) con eventos reales dinámicos según las decisiones previas de las estaciones. | Schoenstadt, Leonardo |
| **Idioma del juego** | Interfaz visible del juego, tarjetas educativas, preguntas de 60 s, página de entrega y video de 30 s en **inglés** (regla de entrega global). Documentos de equipo en español. **Enmienda 2026-11-15 (aprobada por Leonardo):** el engranaje de *Options* permite cambiar la interfaz a **español**; el juego siempre abre en inglés para quien no lo eligió, y la elección se guarda por navegador. | Todos |

### Lo que sigue abierto `[ABIERTO]`

| # | Pregunta | Qué bloquea | Quién decide | Para cuándo |
|---|---|---|---|---|
| **A6** | **Nombre oficial del videojuego** (ej. *OrbitCraft: Mission Chain*, *Paper Orbit: 60s to Mars*, *Team X: Mission Chain*) | Título en `HomeMenu`, portada de entrega y cierre del video de 30 s | Equipo completo | Antes de H18 (dom 09:00 h) |
| **A10** | **Hosting público de la demo en línea** (ej. Frontend en Vercel/Netlify + Backend FastAPI WebSocket en Render/Railway/Fly.io o túnel HTTPS para la evaluación) | Link público jugable para los jueces globales en `11-entrega.md` | Rubén | Antes de H12 (dom 03:00 h) |

### Cierre de preguntas abiertas anteriores (A1–A9)

| # | Pregunta original | Resolución al 14 de noviembre |
|---|---|---|
| A1 | Hora de inicio y entrega | **Cerrada:** Sábado 14 nov 15:00 h $\rightarrow$ Domingo 15 nov 15:00 h (24 h). |
| A2 | Hardware armado antes | **Cerrada (N/A):** Ya no hay hardware físico. |
| A3 | ¿Control de misión o astronautas? | **Cerrada:** Tripulantes/ingenieros estilizados tipo *Among Us* operando misiones espaciales reales (*Artemis*, *OSIRIS-REx*, *MRO/MSR*). |
| A4 | Idioma | **Cerrada:** Inglés en el juego y entrega para evaluación global; español en `docs/`. **Enmienda 2026-11-15:** español opcional en la interfaz desde *Options* (inglés por defecto). |
| A5 | Qué pasa al fallar un minijuego | **Cerrada:** Modalidad **1 Toma (30 s)** sin bloqueo: si falla o se acaba el tiempo, aplica degradación real (ej. sin escudo térmico, CG desbalanceado `1.5x`, menor $F_1$ espectral) que repercute en el árbol causal y se explica en la retroalimentación final. |
| A7 | Presupuesto total | **Cerrada:** Parametrizado por misión en `nasa_catalog.json`: M1 Luna $\$800\text{M USD}$, M2 Asteroide $\$1,200\text{M USD}$, M3 Marte $\$2,500\text{M USD}$. |
| A8 | Versión de Unity | **Cerrada (N/A):** Reemplazado por Node 20+ / Vite / React 18+ y Python 3.11+ / FastAPI. |
| A9 | Placa Arduino/Pico | **Cerrada (N/A):** Ya no hay hardware físico. |

---

## Historial previo al pivote (Registro histórico — NO vigente donde contradiga lo del 14 nov)

### 10 de noviembre de 2026 · Cambio en el equipo
- Roberto deja el equipo. Su rol de coordinación pasa a Rubén el 14 nov (ver `TRASPASO.md`).

### 4 de noviembre de 2026 · Diseño anterior (Unity + 1 estación arcade)
- Se había propuesto Unity con dos fases de ~13 min, 1 sola estación física compartida por turnos como teclado USB y 2 minijuegos base. **Superado por el pivote del 14 nov.**

### 2 de noviembre de 2026 · Ajustes previos
- Se había elegido MRO como escenario principal y estilo plano técnico 2D. **MRO/MSR se conserva como Misión 3 (Difícil)** junto a Artemis (Fácil) y Asteroides (Media), y el estilo evoluciona a **Paper Mario × Among Us + HUD NASA**.

### 29 de octubre de 2026 · Votación inicial
- Se acordó el concepto central de **Ingeniería Concurrente (Team X)** donde cada jugador cuida subsistemas que chocan entre sí. **Este núcleo conceptual sigue 100 % vigente y es el corazón del juego.**

---

<!-- Archivo: docs/04-juego.md -->
> **Archivo: `docs/04-juego.md`**

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

---

<!-- Archivo: docs/05-mvp.md -->
> **Archivo: `docs/05-mvp.md`**

# 05 · MVP (Alcance para 24 Horas)

**Qué contiene:** qué entra **sí o sí** en el MVP del sprint de 24 horas, en qué orden se desbloquean extras si sobra tiempo y qué queda estrictamente fuera para no entregar un proyecto a medias.  
**Dueños:** Todos  
**Última actualización:** 2026-11-14 (15:00 h)

**Regla de oro:** Si a la hora **H18** (domingo 09:00 h) lo de la sección "Sí o sí" no corre completo de principio a fin, **no se empieza ningún extra**. Un ciclo completo sólido, educativo y divertido en 5 minutos gana a diez sistemas desconectados.

---

## Sí o sí (MVP Obligatorio)

### Flujo completo y experiencia base
- [ ] **Menú Principal (`HomeMenu`)** en inglés con estética *Paper Mario × Among Us* y selector `Singleplayer` / `Multiplayer`.
- [ ] **Lobby estilo *Among Us / Kahoot*** con código PIN, lista de jugadores conectados en vivo, selección de los **4 Roles** y selector de las **3 Misiones** (*Artemis Moon*, *Asteroid Hunter*, *Mars Sample Return*) + Dificultad (`Easy`, `Medium`, `Hard`).
- [ ] **Relleno inteligente con IA (`randomizer.py`)** para que partidas de 1, 2 o 3 jugadores tengan siempre los 4 subsistemas activos.
- [ ] **Pista Lineal Automática (`LinearStationTrack`)** donde el personaje *Paper Mario × Among Us* avanza solo hacia Estación 1 y Estación 2, sin caminar libre por mapa.
- [ ] **Concurrencia en vivo (`mutacion_en_vivo`)** vía Socket.IO: las decisiones tomadas en una estación modifican al instante el HUD compartido y los límites de los compañeros.

### Minijuegos modulares (Prioridad escalonada para garantizar cero bloqueos)
- **Corte Vertical H10 (Primero estos 4 minijuegos críticos funcionando extremo a extremo):**
  - [ ] `Rol1A_BudgetTable` (Mesa de Aprobación 10 fichas + Reserva UFE) — *Ismael*
  - [ ] `Rol2A_TopologicalAssembly` (Montaje Estructural 2D con Escudo Térmico) — *Ismael*
  - [ ] `Rol3A_OrbitalSniper` (Órbita/Ruta + Tsiolkovsky + FSPL) — *Abraham*
  - [ ] `Rol4A_SpectralLabTask` (Selección de instrumentos + Calibración espectral) — *Abraham*
- **Oleada 2 completa para H16 (Completar los 8 minijuegos):**
  - [ ] `Rol1B_LauncherAuction` (Subasta de cohete / Rideshare) — *Ismael*
  - [ ] `Rol2B_MassBalanceTask` (Balanceo de Centro de Gravedad 2D) — *Ismael*
  - [ ] `Rol3B_AstroLogistics3D` (Rover 3D en Three.js dependiente del factor $F$) — *Abraham*
  - [ ] `Rol4B_CommsSpectralHacker` (Osciloscopio DSN + Espectro Hacker DTMF) — *Abraham*

> *Nota de contingencia para H16:* Si un minijuego de la Oleada 2 tuviera un bug bloqueante cerca del cierre, el `MinigameShell` permite usar un fallback rápido de selección táctica para no romper nunca el ciclo completo.

### Vuelo de 60 segundos, Árbol de Decisiones y Retroalimentación
- [ ] **Motor determinista de 4 Nodos (`decision_tree.py`)** + física real WGS84/Tsiolkovsky/FSPL (`physics_engine.py`).
- [ ] **Dinámica de Vuelo de 60 Segundos (`Flight60sView`)** con animación del cohete viajando y **4 rondas de preguntas/crisis por turnos** (`story_tree.json`) conectadas a las decisiones tomadas en las estaciones.
- [ ] **Dashboard de Retroalimentación NASA (`MissionReportDashboard`)**: siempre explica por qué ganó o falló la misión con números reales, puntaje (0–1,000 pts), dato real NASA y botón `Redesign & Retry`.
- [ ] **Textos del juego 100 % en inglés**, con datos verificados y `fuente` en `nasa_catalog.json`.

### Entrega y Deploy
- [ ] **App desplegada y funcional en navegador** (Frontend + Backend accesible en red local para jueces presenciales y vía URL pública para jueces globales).
- [ ] **Video de 30 segundos exactos** con subtítulos en inglés.
- [ ] **Página oficial del reto en inglés**, tabla de referencias (`referencias.md`) y declaración de uso de IA.

---

## Extras (Solo si a las H18 el MVP completo ya corre sin errores graves)

En este estricto orden de prioridad:
1. **Efectos de sonido libres (CC0)** para clics de papel, transición de estación, alarma de crisis en 60 s y lanzamiento.
2. **Animaciones extra estilo *Paper Mario*** (cortinilla doblada en papel al entrar a cada estación, confeti al lograr `FULL_SUCCESS`, shake de cámara al fallar Nodo 1).
3. **Tabla de puntuaciones de sala / Comparativa de intentos** tras pulsar *Redesign*.
4. **Modo Sandbox / Inspector Educativo** en el reporte final para explorar qué hubiera pasado cambiando una variable (ej. Hidracina vs. Hall).
5. **Soporte secundario de idioma español en UI** (toggle EN/ES).

---

## Fuera (No lo hacemos en estas 24 horas)

- **Hardware físico / Arduino / botones arcade / Unity** (descartado oficialmente el 14 nov a las 15:00 h).
- **Mapa libre 2D donde el personaje camine manualmente** buscando tareas (se queda la pista lineal automática).
- **Cuentas de usuario, bases de datos persistentes o login con contraseña** (solo código PIN efímero en memoria en `game_manager.py`).
- **Simulación orbital N-cuerpos 3D en tiempo real** (usamos modelos analíticos exactos WGS84 y Tsiolkovsky documentados en `06-datos-nasa.md`).
- **IA generativa en vivo generando diálogos durante la partida** (todo el árbol de decisiones y preguntas de 60 s es determinista, validado científicamente y sin latencia ni costo de API).

---

## Criterio de "MVP Terminado"

Sabemos que el juego está listo para ganar cuando una persona ajena al equipo (un juez o estudiante):
1. Abre la URL en su navegador (o entra con su teléfono usando el PIN de la sala).
2. Juega una partida completa en **~5 minutos** avanzando por la pista lineal de estaciones y respondiendo las crisis del vuelo de 60 segundos sin necesitar que nadie del equipo le explique cómo usar la interfaz.
3. Al final entiende y puede explicar con sus propias palabras **una causa real de ingeniería espacial** por la que su misión triunfó o falló.

---

<!-- Archivo: docs/06-datos-nasa.md -->
> **Archivo: `docs/06-datos-nasa.md`**

# 06 · Datos de la NASA, Física y Catálogo 2026

**Qué contiene:** todas las constantes físicas verificadas, ecuaciones orbitales y termodinámicas, catálogo de misiones, cohetes, instrumentos y espectros, con sus fuentes reales y su estado de verificación.  
**Dueño:** Abraham *(en coordinación con Schoenstadt para el árbol causal)*  
**Última actualización:** 2026-11-14 (23:50 h · `ABR-01` a `ABR-06` completados)

**Regla sagrada:** Prohibido inventar números dentro del código. Todos los valores parametrizables viven en `frontend/src/data/nasa_catalog.json` y `backend/models/subsystems.py`, y cada registro incluye su campo `"fuente"`.

---

## Estados de verificación

| Estado | Significado | ¿Se usa en el juego? |
|---|---|---|
| **verificado** | Comprobado directamente en documentación de NASA, JPL, IAU/WGS84 o ficha oficial del fabricante | Sí |
| **fuente secundaria** | Proviene de referencias técnicas secundarias (ej. SMAD citado en OER, Wikipedia, NextSpaceflight, Astronautix) | Sí (anotando la cita) |
| **estimado del juego** | Constante de balanceo lúdico derivada de guías reales (ej. presupuesto de partida o tolerancia de CG por dificultad) | Sí, marcándolo explícitamente como balance de juego |
| **sin verificar** | Pendiente de confirmación final | No usar en texto de reporte final sin confirmar antes de H18 |

---

## 1. Constantes físicas y orbitales (WGS84 / IAU)

| Constante | Símbolo | Valor | Unidad | Estado | Fuente |
|---|---|---|---|---|---|
| Parámetro gravitacional terrestre | $\mu$ | $398,600.4418$ | $\text{km}^3/\text{s}^2$ | verificado | NIMA / WGS84 (TR8350.2) |
| Radio ecuatorial terrestre | $R_E$ | $6,378.137$ | $\text{km}$ | verificado | WGS84 |
| Factor de achatamiento terrestre | $J_2$ | $1.08262668 \times 10^{-3}$ | — | verificado | WGS84 |
| Precesión nodal heliosíncrona | $\dot{\Omega}_{\text{SSO}}$ | $\frac{2\pi}{365.2421897 \times 86,400} \approx 0.9856$ | $^\circ/\text{día}$ | verificado | Mecánica Orbital IAU |
| Gravedad estándar | $g_0$ | $9.80665$ | $\text{m/s}^2$ | verificado | CODATA / NIST |

---

## 2. Ecuaciones autoritativas del motor (`backend/physics_engine.py`)

Con radio orbital $r = R_E + h$ (en $\text{km}$):

1. **Velocidad y Periodo Orbital Circular:**
   $$v = \sqrt{\frac{\mu}{r}}, \qquad T = 2\pi\sqrt{\frac{r^3}{\mu}}$$
2. **Fracción y Duración Máxima de Eclipse (sombra cilíndrica, $\beta = 0$):**
   $$\rho = \arcsin\left(\frac{R_E}{r}\right), \qquad f_{\text{ecl}} = \frac{\rho}{\pi}, \qquad T_{\text{ecl, min}} = f_{\text{ecl}} \cdot T_{\text{min}}$$
3. **Inclinación Heliosíncrona (SSO) con movimiento medio $n = \sqrt{\mu / r^3}$:**
   $$\cos(i) = \frac{-2\,\dot{\Omega}_{\text{SSO}}\, r^2}{3\, n\, J_2\, R_E^2} \qquad (\text{válida si } -1 \le \cos(i) \le 1)$$
4. **Cobertura Terrestre y Distancia Oblicua (*Slant Range* $d$ a elevación mínima $\epsilon = 10^\circ$):**
   $$\eta = \arcsin\left(\frac{R_E}{r}\cos(\epsilon)\right), \qquad \lambda_{\text{cov}} = \frac{\pi}{2} - \epsilon - \eta, \qquad d = \sqrt{r^2 + R_E^2 - 2\,r\,R_E\cos(\lambda_{\text{cov}})}$$
5. **Pérdida en Espacio Libre (FSPL en $\text{dB}$, con $d_m$ en metros y $f_{\text{Hz}}$ en hercios):**
   $$\text{FSPL (dB)} = 20\log_{10}(d_m) + 20\log_{10}(f_{\text{Hz}}) - 147.55$$
6. **Ecuación de Tsiolkovsky y Masa Húmeda (con multiplicador de desbalanceo de CG $M_{\text{burn}} \in \{1.0, 1.5\}$):**
   $$f_{\text{prop}} = 1 - \exp\left(-\frac{\Delta v \cdot M_{\text{burn}}}{I_{sp}\, g_0}\right), \qquad m_{\text{wet}} = \frac{m_{\text{dry}}}{1 - f_{\text{prop}}}$$
7. **Centro de Gravedad 2D (Rol 2B, *CubeSat 101* Sec. 6.4):**
   $$X_{\text{CG}} = \frac{\sum_{i=1}^{k} m_i x_i}{\sum_{i=1}^{k} m_i}, \qquad Y_{\text{CG}} = \frac{\sum_{i=1}^{k} m_i y_i}{\sum_{i=1}^{k} m_i}, \qquad d_{\text{CG}} = \sqrt{X_{\text{CG}}^2 + Y_{\text{CG}}^2}$$
8. **Reserva UFE y Margen JPL CML 4:**
   - **Reserva UFE (NPR 7120.5):** recomendada $\ge 25\%\text{–}30\%$ en fases tempranas (PDR) para evitar un *Nunn-McCurdy Breach* ante imprevistos.
   - **Margen de Crecimiento de Masa JPL CML 4:** $\ge 35\%$ recomendado en diseño preliminar.

---

## 3. Tabla precalculada de órbitas (referencia y tests unitarios)

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

## 4. Catálogo de vehículos de lanzamiento y propulsión (2026)

### Lanzadores dedicados
| Vehículo | Capacidad de carga | Costo estimado (USD) | Cofia | Estado | Fuente |
|---|---|---|---|---|---|
| **Electron** (Rocket Lab) | $300\text{ kg}$ LEO / $200\text{ kg}$ SSO | $\sim \$9.2\text{M}$ | $1.2\text{ m}$ | fuente secundaria | Guía de servicio Rocket Lab / NextSpaceflight |
| **Falcon 9 Block 5** (SpaceX) | $22,800\text{ kg}$ LEO des. / $17,500\text{ kg}$ rec. / $5,500\text{ kg}$ GTO / $4,020\text{ kg}$ Marte | $\$74\text{M}$ | $5.2\text{ m} \times 13.1\text{ m}$ | verificado / fuente secundaria | SpaceX Vehicles / NextSpaceflight |
| **Vulcan Centaur VC6** (ULA) | $27,200\text{ kg}$ LEO / $14,400\text{ kg}$ GTO | $\sim \$120\text{M}$ | $5.4\text{ m}$ | fuente secundaria | ULA / NextSpaceflight |
| **Falcon Heavy** (SpaceX) | $63,800\text{ kg}$ LEO / $16,800\text{ kg}$ Marte | $\$97\text{M–}\$150\text{M}$ | $5.2\text{ m}$ | fuente secundaria | SpaceX / Wikipedia |

### Modalidad Rideshare (SpaceX *Transporter / Bandwagon* Guía v11 — 2026)
- Tarifa base 2026: $\$7,000\text{ USD/kg}$ (tope físico $831\text{ kg}$ por puerto).
- Placas: *Quarter* ($50\text{–}300\text{ kg}$, base $\$350\text{k}$), *Half* ($100\text{–}452\text{ kg}$, base $\$700\text{k}$), *Full* ($200\text{–}831\text{ kg}$, base $\$1.4\text{M}$), *XL* ($300\text{–}831\text{ kg}$, base $\$2.1\text{M}$).
- Separadores opcionales: $\$370,500\text{ a }\$692,600\text{ USD}$; multiplicador realista de integración: $1.5\times\text{ a }2.0\times$. *(Fuente secundaria: SpaceX Rideshare Payload User's Guide v11).*

### Motores / Propulsión a bordo y fuentes de energía
- **Hidracina Monopropelente:** $I_{sp} = 225\text{ s}$ (económico, exige $\sim 55.8\%$ de masa de propelente para $\Delta v = 1,800\text{ m/s}$).
- **Bipropelente $\text{MMH}/\text{NTO}$:** $I_{sp} = 315\text{ s}$ ($\sim 44.2\%$ de propelente para $\Delta v = 1,800\text{ m/s}$).
- **Propulsión Eléctrica de Efecto Hall:** $I_{sp} = 1,600\text{ s}$ ($\sim 10.8\%\text{–}10.9\%$ de propelente, demanda alta potencia eléctrica en W).
- **Generador RTG $\text{Pu-238}$:** Vida media $87.7\text{ años}$, conversión termoeléctrica por efecto Seebeck (independiente de luz solar/tormentas de polvo).
- **Paquetes energéticos (`Rol3B_AstroLogistics3D`):**
  - *Propulsión Química:* $+15\text{ MJ}$, $+8\%$ velocidad rover.
  - *Baterías Electroquímicas:* $+45\text{ MJ}$, $-14\%$ velocidad rover (efic. $80\text{–}90\%$, baja densidad energética).
  - *Celdas de Combustible $\text{H}_2$:* $+100\text{ MJ}$, $-4\%$ velocidad rover (no limitadas por ciclo de Carnot).

---

## 5. Nave de referencia MRO, instrumentos y las 3 Misiones NASA

### Mars Reconnaissance Orbiter (MRO) e instrumentos
| Dato / Instrumento | Valor clave | Estado | Fuente |
|---|---|---|---|
| **MRO Masa lanzamiento / combustible** | $2,180\text{ kg}$ / $1,149\text{ kg}$ ($>52\%$ propelente) | fuente secundaria | Astronautix / NASA |
| **Antena HGA y enlace DSN** | $3\text{ m}$, $0.5\text{–}6.0\text{ Mbps}$, margen $\ge +3.0\text{ dB}$, memoria $160\text{ Gbit}$ | verificado / fuente secundaria | JPL DESCANSO (`MRO_092106.pdf`) |
| **Retraso señal Tierra–Marte / Conjunción** | $4\text{–}25\text{ min}$ / cada $\sim 26\text{ meses}$ ($\sim 2\text{ semanas}$ sin comandos) | fuente secundaria / verificado NASA | arXiv 2211.14245 / science.nasa.gov |
| **Luz solar en Marte** | $\sim 590\text{ W/m}^2$ ($\approx 43\%$ de la Tierra) | fuente secundaria | NASA Mars Fact Sheet (NSSDCA) |
| **HiRISE** | $65.0\text{ kg}$, $60\text{ W}$ promedio, $0.3\text{ m/píxel}$, hasta $28\text{ Gbit/imagen}$ | verificado / fuente secundaria | NASA MRO Science / `uahirise.org` |
| **CTX** | $3.0\text{ kg}$, $7\text{ W}$ activo ($5\text{ W}$ reposo), fotos $6\text{ m/píxel}$ | verificado | NASA MRO Science |
| **CRISM** | $32.9\text{ kg}$, $44.4\text{ W}$ operación ($16.1\text{ W}$ standby), espectrómetro mineralógico | verificado | NASA MRO / JHUAPL (`crism.jhuapl.edu`) |
| **MARCI** | $0.481\text{ kg}$ (heritage base), $<5\text{ W}$ activo, cámara climática diaria | verificado / fuente secundaria | NASA MRO / Malin Space Science Systems |
| **MCS** | $9.0\text{ kg}$, $11.0\text{ W}$, temperatura y polvo atmosférico | verificado | NASA MRO Science |
| **SHARAD** | $15.0\text{–}16.6\text{ kg}$, $10\text{ W}$ RF ($\sim 20\text{ W}$ pico), $40\text{–}90\text{ Gbit/día}$ | verificado / fuente secundaria | NASA MRO (ASI / JPL) |

### Instrumentos verificados para M1 (LRO / Luna) y M2 (OSIRIS-REx / Asteroide)
| Misión | Instrumento | Masa / Potencia | Estado | Fuente |
|---|---|---|---|---|
| **M1 (Luna)** | **LROC** (Lunar Reconnaissance Orbiter Camera) | $16.5\text{ kg}$, $22.0\text{ W}$ prom. ($30\text{ W}$ pico) | verificado | NASA LRO (`science.nasa.gov/mission/lro/`) |
| **M1 (Luna)** | **LOLA** (Lunar Orbiter Laser Altimeter) | $15.3\text{ kg}$, $39.6\text{ W}$ | verificado | NASA LRO (`science.nasa.gov/mission/lro/`) |
| **M1 (Luna)** | **Diviner (DLRE)** (Radiómetro Lunar) | $11.9\text{ kg}$, $21.6\text{ W}$ | verificado | NASA LRO (`science.nasa.gov/mission/lro/`) |
| **M1 (Luna)** | **LAMP** (Mapeador UV Lyman-Alpha) | $5.3\text{ kg}$, $4.86\text{ W}$ | verificado | NASA LRO (`science.nasa.gov/mission/lro/`) |
| **M2 (Asteroide)** | **OVIRS** (Espectrómetro Vis-IR) | $17.8\text{ kg}$, $8.8\text{ W}$ prom. | verificado | NASA OSIRIS-REx / *Space Science Reviews* |
| **M2 (Asteroide)** | **OTES** (Espectrómetro Emisión Térmica) | $6.27\text{ kg}$, $10.8\text{ W}$ prom. | verificado | NASA OSIRIS-REx / *Space Science Reviews* |
| **M2 (Asteroide)** | **OLA** (Altímetro Láser) | $22.9\text{ kg}$, $\sim 75\text{ W}$ | verificado | NASA OSIRIS-REx / CSA |
| **M2 (Asteroide)** | **REXIS** (Espectrómetro Rayos X Regolito) | $4.4\text{ kg}$, $10.8\text{ W}$ prom. | verificado | NASA OSIRIS-REx / *Space Science Reviews* |

*(Nota `ABR-01` completada: todos los instrumentos de MRO, LRO y OSIRIS-REx quedan verificados con fuentes oficiales y sincronizados con `frontend/src/data/nasa_catalog.json` y `backend/models/subsystems.py`; únicamente `cost_musd`, `science_value` y `data_gbit_day` estimados conservan etiqueta explícita de balance de juego).*

### Parámetros de las 3 Misiones del juego
| Parámetro | M1 (Fácil): *Artemis Moon* | M2 (Media): *Asteroid Hunter* | M3 (Difícil): *Mars Sample Return (MSR/MRO)* |
|---|---|---|---|
| **Inspiración real NASA** | *Artemis I / II*, cápsula *Orion*, reentrada $40,000\text{ km/h}$ | *OSIRIS-REx* (Bennu), *DART*, *NEAR Shoemaker* | *Mars Sample Return*, *Perseverance*, *MRO* |
| **Presupuesto (`budget_limit_usd`)** | $\$800\text{M USD}$ *(estimado juego)* | $\$1,200\text{M USD}$ *(estimado juego)* | $\$2,500\text{M USD}$ *(estimado juego)* |
| **Meta UFE recomendada** | $\ge 20\%$ | $\ge 25\%$ | $\ge 25\text{–}30\%$ |
| **Tolerancia CG ($R_{\text{tol}}$)** | $0.25\text{ m}$ | $0.15\text{ m}$ | $0.08\text{ m}$ (margen JPL CML 4 $\ge 35\%$) |
| **Dilema Rol 3A (Órbita/Ruta)** | *Ruta Directa (3 días)* vs. *Retorno Libre (10 días, $-400\text{ kg}$ prop.)* | *Flyby rápido (15 min)* vs. *Inserción Orbital* | *MAV 30 tubos* vs. *MAV 15 tubos ($-150\text{ kg}$, permite RTG)* |
| **Evento Fase 60 s (Nodo 3)** | Tormenta Solar Cislunar ($\ge 15\%$ batería) | Nube de Polvo/Micro-rocas (*Autonomía Visual* + UFE) | Tormenta de Polvo Marciana + fallo de brazo (RTG + UFE $\ge 20\%$) |

---

## 6. Datos espectrales de referencia (`juegos_espectrales/`)

- **Líneas estelares de Balmer / Dobletes / Emisión (NIST ASD):** $\text{H}\alpha = 656.28\text{ nm}$, $\text{H}\beta = 486.13\text{ nm}$, $\text{H}\gamma = 434.05\text{ nm}$, $\text{Na D1/D2} = 589.59 / 588.99\text{ nm}$, $\text{Ca II K} = 393.37\text{ nm}$, $\text{He I} = 587.56\text{ nm}$, $\text{O III} = 500.68\text{ nm}$; Ley de desplazamiento de Wien $\lambda_{\max} \cdot T = 2,897,771.955\text{ nm}\cdot\text{K}$. *(Fuente verificada: NIST Atomic Spectra Database / CODATA 2018).*
- **Bandas FTIR de minerales/biofirmas (`cm-1`):** Silicatos $\text{Si–O–Si} \approx 1,045\text{ cm}^{-1}$, Carbonatos $\text{CO}_3 \approx 1,435\text{ cm}^{-1}$, Agua ligada $\text{H}_2\text{O} \approx 1,630\text{ cm}^{-1}$, Carbonilo $\text{C=O} \approx 1,720\text{ cm}^{-1}$, Arcillas hidratadas $\text{O–H} \approx 3,620\text{ cm}^{-1}$, Amida I ($1,600\text{–}1,700\text{ cm}^{-1}$: Hoja $\beta$ $1,632\text{ cm}^{-1}$, Hélice $\alpha$ $1,654\text{ cm}^{-1}$, Giro $\beta$ $1,676\text{ cm}^{-1}$).
- **Índices multiespectrales:** $\text{NDVI} = \frac{\text{NIR}-\text{Rojo}}{\text{NIR}+\text{Rojo}}$, $\text{NDWI} = \frac{\text{Verde}-\text{NIR}}{\text{Verde}+\text{NIR}}$, $\text{NBR} = \frac{\text{NIR}-\text{SWIR}}{\text{NIR}+\text{SWIR}}$.
- **Dispersión óptica de Cauchy (*Misión Fotón*):** $n(\lambda) = A + B/\lambda^2$ con $\lambda$ en $\mu\text{m}$ (*Fused Silica* $A=1.458, B=0.00354$; *BK7* $A=1.5046, B=0.00420$; *Sapphire* $A=1.754, B=0.00610$).
- **Matriz DTMF (*Espectro Hacker*):** Filas $\{697, 770, 852, 941\}\text{ Hz}$ $\times$ Columnas $\{1209, 1336, 1477, 1633\}\text{ Hz}$. *(Estándar ITU-T Q.23).*
- **Arquetipos implementados y espectros reales:** Los 8 modos (`cazadores_estrellas`, `detectives_luz`, `ecoespectro`, `laboratorio_musical`, `mision_foton`, `bioespectro`, `ladron_colores`, `espectro_hacker`) funcionan con generadores sintéticos calibrados o cargando CSVs reales vía `cargar_espectro_csv` / `backend/juegos_espectrales/datos_reales/<mission_id>.csv`, incluyendo guías educativas paso a paso en `educational_guide`.

---

## 7. Estructura JSON obligatoria (`frontend/src/data/nasa_catalog.json`)

```json
{
  "instruments": [
    {
      "id": "hirise",
      "name": "HiRISE Camera",
      "mass_kg": 65.0,
      "power_w": 60.0,
      "data_gbit_day": 90.0,
      "cost_musd": 40.0,
      "science_value": 45.0,
      "fuente": "https://science.nasa.gov/mission/mars-reconnaissance-orbiter/ & https://www.uahirise.org/",
      "estado": "verificado (~65 kg, ~60 W, hasta 28 Gbit/imagen) / estimado juego (costo)"
    }
  ]
}
```

## Reglas de racionalidad (auditoría 2026-11-15)

- **Capacidad útil del lanzador = capacidad al destino:** asteroide y Marte usan la de escape terrestre (`max_mass_mars_kg`); la **Luna** usa la mayor entre escape e inyección translunar (`max_mass_tli_kg`): Vulcan VC6 **11 500 kg** (C3 −2 km²/s², `ulalaunch.com/rockets/vulcan-centaur`) y Electron + Lunar Photon **25 kg** (demostrado: CAPSTONE, NSSDC 2022-070A). Sin cifra con fuente para el destino → 0 kg y el Nodo 1 falla con *no alcanza el destino*. Lo aplican `game_manager`, la IA (`randomizer.py`, el más barato que alcanza) y Rol 1B. Vulcan GTO = 14 500 kg (ULA).
- **Propelente (Rol 3A):** se dimensiona con el Δv de la ruta elegida × margen 1.05 (el mismo que usa la compuerta del Nodo 2); ya no se resta otra vez `propellant_delta_kg` (doble conteo).
- **Reserva UFE:** las opciones de vuelo que gastan reserva ahora la reducen (antes la aumentaban).
- **Eventos aleatorios:** `story_tree.json → random_events` (efectos = estimado del juego; fenómenos con fuente: NOAA SWPC, NASA ODPO, OSIRIS-REx, NASA Mars, DSN).
- **Pendiente con fuente antes de implementar:** horas de contacto DSN por día (para *Data* vs capacidad de bajada), duración de misión (*Time*) por ruta, pérdida de trayecto real Tierra–Marte/Luna, potencia real de un MMRTG (~110 W), costo de instrumentos en el presupuesto y foto del despegue (`launch_snapshot`) para que el Nodo 1 no cambie con respuestas de vuelo.

- **Data (2026-11-15):** horas de enlace/día = Gbit/día ÷ (Mbps × 3600 / 1000). Límite: `constants.dsn_data_hours_per_day` = **10 h/día** (MRO: ~16 h/día de seguimiento DSN, 10–11 h enviando datos; `descanso.jpl.nasa.gov/DPSummary/MRO_092106.pdf`). Si se necesitan más horas, la compuerta *Call Earth* se degrada.
- **Pérdida real Tierra–destino (informativa):** FSPL = 92.45 + 20 log d(km) + 20 log f(GHz) (ITU-R P.525), banda X de la DSN 8.4 GHz: Luna (384 400 km) **222.6 dB**; Marte (54.6–401.4 millones de km, NSSDC) **265.7–283.0 dB**. Campo `earth_link_fspl_db` por misión; se muestra en el HUD *COMMS*. El margen del juego sigue usando la órbita elegida.
- **Diferidos:** MMRTG ~110 W al inicio de misión (`science.nasa.gov`, RPS FAQ) y ~45 kg (kit de prensa Mars 2020): no se aplica porque el resto del modelo de potencia es estimado del juego. Costos de instrumentos: sin fuente pública por instrumento (estimado del equipo). **Time:** `transit_days` de la ruta (ya con fuente). La IA del piloto ahora elige una ruta real del catálogo.
- **Foto del despegue (`launch_state`, 2026-11-15):** el servidor congela el diseño al despegar; el Nodo 1 (masa, cofia, presupuesto) y la eficiencia de masa se juzgan con esa foto, así que una respuesta de vuelo como *+30 kg de combustible* ya no puede reprobar un despegue que ya ocurrió. Los nodos 2–4 usan la nave en vuelo.
- **Combustible de Rol 3A:** se dimensiona con la masa seca real de la nave (`LiveMetrics.dry_mass_kg`) + instrumentos, la misma que vuela el Nodo 2 (antes, un estimado fijo de 620 kg).
- **Hechos corregidos:** Artemis I usó una órbita retrógrada distante (no retorno libre; eso es Artemis II). El presupuesto de MSR del juego está escalado y lo indica con fuente.

---

<!-- Archivo: docs/07-hardware.md -->
> **Archivo: `docs/07-hardware.md`**

# 07 · Arquitectura de Pantallas y Dispositivos (Sustituye Hardware Físico)

**Qué contiene:** explicación del pivote que elimina el hardware arcade y define cómo operan las pantallas en navegador para *Singleplayer* y *Multiplayer*.  
**Dueños:** Rubén, Leonardo  
**Última actualización:** 2026-11-14 (15:00 h)

## Decisión vigente (`[DECIDIDO]` 14 nov, 15:00 h)

**Ya no hay hardware físico.** No construimos consola arcade, ni programamos Arduino/ESP32, ni dependemos de puertos USB o cables. Todo el videojuego corre **100 % en navegador web** sobre **React + TypeScript + Vite** conectado a **FastAPI + Socket.IO**.

---

## Cómo se visualiza y juega en cada modo

El sistema soporta dos experiencias fluidas compartiendo exactamente los mismos componentes de minijuegos (`MinigameShell`):

### 1. Modo Singleplayer (1 Jugador en una pantalla)
- Todo ocurre en **una sola pestaña de navegador** (laptop o móvil).
- La pantalla superior muestra la **Pista Lineal de Estaciones (`LinearStationTrack`)** y las barras compartidas de la misión en vivo (Masa, Presupuesto, Energía, Datos, UFE).
- El jugador elige **1 o 2 roles** y juega sus estaciones mientras el motor `randomizer.py` resuelve en paralelo los roles restantes y envía las mutaciones de cadena al HUD.
- Luego pasa directo a la vista de **Vuelo de 60 Segundos (`Flight60sView`)** y al **Reporte NASA (`MissionReportDashboard`)**.

### 2. Modo Multiplayer (2 a 4 Jugadores en red local o web)
Inspirado en **Among Us + Kahoot**, ofrece dos tipos de vista sincronizadas por código PIN:

| Vista | En qué dispositivo corre | Qué muestra |
|---|---|---|
| **`HostScreen`** *(Opcional para proyector/laptop líder o vista compartida)* | Laptop principal (proyectada ante jueces o equipo) | Muestra el **Lobby PIN**, los avatares *Paper Mario × Among Us* avanzando juntos por la **Pista Lineal de Estaciones**, el semáforo global de recursos en tiempo real, el cohete en el **Vuelo de 60 segundos**, de quién es el turno actual de respuesta y el **Podio / Reporte NASA final**. |
| **`PlayerPad`** *(Cada jugador en su laptop o celular)* | Celular o laptop de cada integrante | Ingresa el PIN y elige rol; camina por su pista lineal y abre su **minijuego de 30 s** (Estación 1 y Estación 2); muestra alertas en vivo cuando un compañero altera sus límites (`"¡Órbita elevó FSPL a 191.5 dB!"`); en el **Vuelo de 60 s** activa los botones táctiles de decisión cuando llega su turno. |

> **Nota práctica para demo con jueces (`[PROPUESTA]`):** Si un jugador se conecta en solitario o desde 4 laptops sin proyector aparte, cada jugador ve en su propia pantalla un HUD compacto superior con el estado compartido del equipo, por lo que **`HostScreen` no bloquea la partida si alguien entra directo desde dispositivos personales**.

---

## Requisitos de compatibilidad en navegador

- **Resolución mínima soportada en `PlayerPad`:** `360 × 640 px` (celular vertical) hasta `1920 × 1080 px` (escritorio).
- **Resolución recomendada en `HostScreen`:** `1280 × 720 px` o `1920 × 1080 px` (16:9).
- **Cero instalación nativa:** Funciona en Chrome, Edge, Safari móvil y Firefox sin plugins.
- **Conexión en red local / LAN:**
  - Frontend dev con `vite --host` en puerto `5173`.
  - Backend FastAPI + Socket.IO en `0.0.0.0:8000`.
  - En producción pública (para jueces globales), ver **`[ABIERTO A10]`** en `03-decisiones.md`.

---

<!-- Archivo: docs/08-controles.md -->
> **Archivo: `docs/08-controles.md`**

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
| `resultado_turno_vuelo` | `{ "round": int, "chosen_option": str, "immediate_feedback": str, "rocket_health_pct": float, "gate_status": "PASS" \| "DEGRADED" \| "CRITICAL" }` | Dispara feedback visual en el cohete (ej. escudo brillando, corrección de trayectoria o modo seguro) durante 4 s antes de la siguiente pregunta (`flight_feedback_sec`; subido de 2 s a 4 s el 2026-11-15 para que la Bitácora del Capitán se lea con calma). **Desde el 2026-11-15 `duration_sec = 0` en `iniciar_oleada_1/2` y `pregunta_vuelo_60s` significa *sin reloj*:** el cliente no muestra cuenta atrás y el servidor solo aplica un respaldo AFK oculto. |
| `reporte_final_mision` | `MissionResolutionOutcome` + `{ "role_contributions": [...], "decision_history": [...] }` | Transiciona a `MissionReportDashboard` mostrando siempre resultado, puntaje (0–1,000), explicación causal y dato real NASA. |

## Extensiones opcionales (2026-11-15, sin cambiar nombres de eventos)

| Evento | Campo nuevo (opcional) | Significado |
|---|---|---|
| `iniciar_oleada_1` | `gate_forecast` | Pronóstico inicial de las 4 compuertas (`PASS` / `DEGRADED` / `CRITICAL`) calculado con `decision_tree.evaluate_preliminary_gates` sobre el estado compartido. |
| `mutacion_en_vivo` | `gate_forecast` | Pronóstico en vivo tras cada decisión parcial **y** tras cada toma bloqueada (el servidor emite un `mutacion_en_vivo` extra después de `jugador_bloqueo_toma`). La UI lo muestra como *If we launched now*. |
| `iniciar_vuelo_60s` | `preliminary_gates` (ahora relleno) y `random_event` | `random_event = { event_id, title, description, mitigated, mitigation_text, applied_effects, fuente }`: el evento de supervivencia aplicado al despegar (semilla = PIN de sala). |
| `reporte_final_mision` | `random_event` | El mismo resumen, para el análisis causal del reporte. |
| `iniciar_vuelo_60s` y `reporte_final_mision` | `random_events` | Lista de todos los eventos de la partida (*hard* recibe dos); `random_event` sigue siendo el primero por compatibilidad. |
| `reporte_final_mision` | `score_breakdown` | `{ objective_points, science_f1_points, efficiency_points, success_floor_points, tips[] }`: puntos por parte (500 / 300 / 200), el piso de éxito (mín. 400 parcial, 800 total) y hasta 4 consejos en lenguaje simple de qué faltó para 1 000. Solo en `PARTIAL_SUCCESS` y `FULL_SUCCESS`. |
| `reporte_final_mision` | `leaderboard` | Lista de los 4 asientos ordenada por `rank`: `{ rank, role, player_name, is_ai, gate, gate_status, stations_locked, flight_calls, points }`. Puntos: compuerta propia al despegar (`PASS` 50 · `DEGRADED` 25 · `CRITICAL` 0) + 10 por estación bloqueada por el humano (máx. 20) + 5 por llamada de vuelo respondida a tiempo. Los asientos de IA solo suman la compuerta. Empates: humanos primero y luego orden de estaciones. Cada entrada de `decision_history` incluye `answered_by_role`. |
| `reporte_final_mision` | `collaboration` | `{ score 0–100, humans, own_locks_pct, answered_pct, gates_ready_at_liftoff }`: 40 % estaciones bloqueadas por humanos (sin respaldo de IA), 30 % llamadas de vuelo respondidas, 30 % compuertas `PASS` al despegar. |
| `mutacion_en_vivo` | `quiet` | `true` en el refresco que el servidor manda tras un bloqueo: la UI actualiza métricas y pronóstico sin toast. |

---

<!-- Archivo: docs/09-arte-y-sonido.md -->
> **Archivo: `docs/09-arte-y-sonido.md`**

# 09 · Arte y Sonido (2D Flash Arcade `ASTRO SPRITES` × *60 Seconds!* Cabin + HUD NASA)

**Qué contiene:** identidad visual oficial del videojuego para evitar el aspecto genérico de simulador (*AI slop*), paleta de colores, anatomía de los 4 personajes 2D (`ASTRO SPRITES`), estética de cabina y bitácora estilo *60 Seconds! / 60 Parsecs!*, transiciones con pantallas de carga, tipografía y reglas legales de arte/IA.  
**Dueño:** Leonardo  
**Última actualización:** 2026-11-14 (22:20 h)

---

## Concepto Visual: *2D Flash Arcade (`ASTRO SPRITES`) × Cabina 60 Seconds! + HUD NASA* (`[DECIDIDO]` / `[ACTUALIZADO]`)

Queremos un juego con personalidad propia, visual profesional de **videojuego 2D estilo Flash Arcade** e inolvidable frente a los jueces:
- **De los `ASTRO SPRITES` (Originales 2D — Cero Copyright):** Reemplazamos cualquier silueta tipo frijol (*Among Us*) por **4 astronautas SVG de cuerpo completo con contornos gruesos `#0F172A`**, visor LED animado, mochila propulsora, rodilleras y equipamiento específico de rol (`ASTRO_ENGINEER`, `ASTRO_MEDIC`, `ASTRO_SOLDIER`, `ASTRO_DEFENDER`), sin ningún riesgo de derechos de autor.
- **De *60 Seconds! / 60 Parsecs!* (Cabina, Bitácora y Saltos de Escena):** Tras la fase de preparación cronometrada en las estaciones (Estación 1 y 2), la fase de vuelo/travesía (`Flight60sView`) adopta la jugabilidad clásica de **cabina 2D + Bitácora del Capitán**: los personajes dentro del módulo espacial con sus subsistemas visibles en estantes/consolas, decisiones de supervivencia tipo diario ilustrado y **saltos de escena con pantallas de carga temáticas** entre cada nodo.
- **De *Paper Mario* / Cartulina 2D Arcade:**
  - Contorno de tinta oscura (`3px solid #0F172A`), paneles metálicos `.flash-panel`, consolas portátiles para celular `.handheld-console-frame`, cintas `.hazard-stripe-bar` y sombras sólidas sin difuminado (`5px 5px 0px #0F172A`).
  - Fondo estelar con `tsParticles` + planetas parallax detrás del módulo/pista.
- **Del *HUD Aeroespacial NASA*:** Telemetría de precisión en tipografía monoespaciada (`IBM Plex Mono`), barras segmentadas de recursos (`ResourceHUD`) y etiquetas técnicas reales (`MASS 2,180 / 4,020 kg`, `DSN +3.4 dB`, `UFE 26 %`).

---

## Paleta de Colores Oficial (`[PROPUESTA]`)

### Fondos y Cartulina
| Uso | Nombre | Hex | Nota de uso |
|---|---|---|---|
| Espacio profundo | `space-ink` | `#0B1021` | Fondo principal de `tsParticles` |
| Pasillo / Estación | `blueprint-navy` | `#162347` | Paneles, fondo de pista lineal y consolas |
| Cartulina / Sticker | `paper-cream` | `#F8FAFC` | Tarjetas claras, bordes de recorte, fichas |
| Tinta / Contorno | `ink-black` | `#0F172A` | Contorno de personajes, tarjetas y sombras sólidas `4px 4px 0` |

### Colores de los 4 Roles (Identidad de Tripulantes)
| Rol | Color principal | Hex | Visor / Acento |
|---|---|---|---|
| **Rol 1 · Finanzas y Lanzador** | Dorado / Ámbar | `#F59E0B` | `#FEF3C7` |
| **Rol 2 · Nave y Masa** | Cian Eléctrico | `#06B6D4` | `#CFFAFE` |
| **Rol 3 · Órbita y Energía** | Esmeralda | `#10B981` | `#D1FAE5` |
| **Rol 4 · Ciencia y Comms** | Violeta Cósmico | `#A855F7` | `#F3E8FF` |

### Semáforo de Recursos (Accesible)
| Estado | Hex | Regla de accesibilidad |
|---|---|---|
| **Nominal / Seguro** | `#3DDC84` | Siempre acompañado de etiqueta `OK` / `NOMINAL` e ícono check (`Lucide`) |
| **Precaución / Margen bajo** | `#F2C94C` | Siempre acompañado de etiqueta `WARN` e ícono triángulo alerta |
| **Crítico / Fallo** | `#FF5A4E` | Siempre acompañado de etiqueta `CRIT` e ícono `X` o alarma |

---

## Tipografía Oficial (Licencia Libre — Google Fonts / SIL OFL)

- **Títulos y botones estilo Paper/Arcade:** `Space Grotesk` (Bold 700, tracking apretado) o `Fredoka` (para insignias divertidas).
- **Números, ecuaciones y telemetría HUD:** `IBM Plex Mono` (`tabular-nums`, para que los relojes de 30 s / 60 s y las masas no vibren al cambiar).
- **Textos educativos y preguntas:** `IBM Plex Sans`.

---

## Reglas para Componentes Estilo *2D Flash Arcade & Diorama NASA* (Para Ismael, Abraham y Leonardo)

Para que los minijuegos de **Ismael** y **Abraham** se vean coherentes con la UI de **Leonardo**, Tailwind CSS tiene clases utilitarias compartidas en `frontend/src/index.css`:

- `.paper-card` / `.flash-panel`: fondo `#162347` / degradado metálico de cabina, `border: 3px solid #0F172A`, `box-shadow: 5px 5px 0px #0F172A`, `rounded-2xl`.
- `.paper-btn`: efecto físico al presionar (`active:translate-x-[3px] active:translate-y-[3px] active:shadow-none`) con sombra dura `4px 4px 0px #0F172A`.
- `.handheld-console-frame` y `.hazard-stripe-bar`: consola portátil para jugadores en celular y cintas industriales arcade.
- `<CrewmateAvatar role={role} state="idle | walk | work | panic | cheer" />`: componente SVG modular de nuestros **4 `ASTRO SPRITES` 2D completos** creado por **Leonardo** (junto con `ROLE_CHARACTER_PROFILE` y `<MissionLoadingScreen />` en `frontend/src/components/paper/LoadingScreen.tsx`) reutilizado en Lobby, Pista Lineal, Cabina estilo *60 Seconds!* y Podio final.

---

## Audio y Efectos de Sonido (Extra después de H18)

- Si sobra tiempo tras el MVP en H18, usar únicamente audio **CC0 / dominio público** (paquetes *Kenney Sci-Fi Sounds* / *Interface Sounds*) o tonos sintetizados con la **Web Audio API** nativa del navegador (cero archivos pesados, carga instantánea).
- Sonidos clave: clic de cartulina, campana de estación completada, alerta de mutación en cadena, cuenta regresiva de 5 s, paso de página de bitácora / salto de escena estilo *60 Seconds!* y fanfarria/alarma final.
- Siempre incluir un botón `Mute / Unmute` en la esquina superior derecha.

---

## Reglas Legales de Arte e IA (Space Apps)

1. **NUNCA usar el logo oficial de la NASA** en pantallas, naves ni portada.
2. **Nada de sprites con copyright externo (cero siluetas Among Us):** Los 4 especialistas `ASTRO_ENGINEER`, `ASTRO_MEDIC`, `ASTRO_SOLDIER` y `ASTRO_DEFENDER` son **personajes originales dibujados en SVG por el equipo** en `CrewmateAvatar.tsx`, sin ningún asset ni parecido protegido por Innersloth o Nintendo.
3. **Si se usa cualquier imagen o video generado por IA**, debe llevar **marca de agua visible** y declararse en `referencias.md` y en la sección *AI Use* de la entrega. (Al dibujar todo en SVG + CSS + Three.js procedural evitamos este riesgo por completo).

---

<!-- Archivo: docs/10-tecnico.md -->
> **Archivo: `docs/10-tecnico.md`**

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

### Idioma de la interfaz: `frontend/src/i18n/` (2026-11-15)

- **Sin dependencias nuevas.** `t("English text", vars?)` devuelve la cadena en español si el jugador eligió español y existe la traducción en `i18n/es.ts`; si no, devuelve el inglés (la llave es el propio texto en inglés, estilo *gettext*). Los marcadores `{name}` se rellenan con `vars`.
- `I18nProvider` (en `main.tsx`) guarda el idioma en `localStorage` (`astro-squad.lang.v1`, con `try/catch`) y en `<html lang>`. `App` lee `useI18n()` para que todo el árbol se vuelva a dibujar al cambiar de idioma (el proyecto no usa `React.memo`).
- El selector *English / Español* vive en el modal *Options* del menú principal. **Inglés por defecto** (decisión A4, `docs/03`).
- **Traducido:** menú, opciones, sala, especialistas, misiones (nombre y objetivo), recorrido de estaciones, instrucciones de cada estación, panel de recursos, marco del minijuego, botones de sonido, escenas de transición, marco del vuelo, reporte final y leaderboard.
- **Sigue en inglés (pendiente):** el interior de los 8 minijuegos y los textos que genera el servidor (bitácora de vuelo de `story_tree.json`, eventos, explicación causal, consejos de puntaje y resúmenes por rol). Para añadir una cadena nueva: envolverla en `t()` y agregar su traducción en `es.ts`.

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

---

<!-- Archivo: docs/11-entrega.md -->
> **Archivo: `docs/11-entrega.md`**

# 11 · Entrega y Presentación (Jueces Locales y Globales)

**Qué contiene:** reglas oficiales de entrega de NASA Space Apps 2026, guion actualizado del video de 30 segundos, plantilla de la página del proyecto en inglés y lista de verificación final.  
**Dueño:** Rubén  
**Última actualización:** 2026-11-14 (15:00 h)

---

## Reglas críticas que no podemos romper

| Regla oficial Space Apps | Qué hacemos para cumplir al 100 % |
|---|---|
| **Video de 30 segundos exactos** (o máx. 7 diapositivas) en inglés | Grabamos un video de **29–30 s exactos** con subtítulos en inglés y ritmo dinámico. Jamás pasarnos de 30 s. |
| **Página del proyecto en inglés** | Usamos la plantilla de abajo revisada por dos personas del equipo antes de las H23 (domingo 14:00 h). |
| **Uso obligatorio de datos o recursos de la NASA** | Citamos MRO, JPL DESCANSO, Artemis I, OSIRIS-REx, WGS84, GMAT, CMLs y CubeSat 101 con sus enlaces oficiales. |
| **Uso de IA declarado** | Incluimos sección **AI Use** detallando las herramientas usadas para planeación, roadmaps y apoyo en código. Si hubiera alguna imagen/video IA, llevaría marca de agua visible. |
| **Todo recurso externo en `referencias.md`** | Registramos librerías (`React`, `FastAPI`, `Three.js`, `Framer Motion`, `tsParticles`, `SciPy`), fuentes (`Google Fonts`) y datos NASA desde H1. |
| **Nunca usar el logo de la NASA** | Verificado visualmente en todas las vistas, iconos, favicon y video. |
| **Entregar 1 hora antes del cierre (H23 = Domingo 14:00 h)** | Evitamos caídas de plataforma a las 14:55 h. |

---

## Guion del Video de 30 Segundos (`[PROPUESTA]`)

*Grabado en pantalla 1080p desde el juego web desplegado, usando la Misión 3 (Mars Sample Return / MRO) o Misión 1 en modo Multiplayer (4 avatares Paper Mario × Among Us).*

| Tiempo | Qué se ve en pantalla | Texto / Subtítulo en inglés (voz o rótulo claro) |
|---|---|---|
| **0–4 s** | `HomeMenu` $\rightarrow$ `LobbyView` con código PIN y 4 tripulantes *Paper Mario × Among Us* eligiendo roles. | *"Four engineers. One web lobby. Real NASA mission trade-offs in 5 minutes."* |
| **4–12 s** | `LinearStationTrack`: los avatares caminan en línea a Estación 1 y 2; cortes rápidos de `Rol2A` (montaje), `Rol4A` (espectro) y `Rol3B` (3D) mientras las barras de masa y FSPL cambian en vivo en pantalla. | *"Linear stations in parallel: every kilogram or watt you pick reshapes your teammates' limits live."* |
| **12–21 s** | `Flight60sView`: el cohete despega en el espacio, estalla alerta de tormenta de polvo marciana y un jugador responde el turno de crisis en 15 segundos. | *"Then survive a 60-second turn-based space flight powered by real orbital physics and DSN links."* |
| **21–27 s** | `MissionReportDashboard`: aparece el veredicto (`FULL SUCCESS` o `FAILED` educativo), puntaje, cadena causal con Tsiolkovsky/MRO y enlace NASA. | *"Win or fail, instant NASA-backed causal feedback teaches why every engineering choice mattered."* |
| **27–30 s** | Logo del juego + URL jugable + *Querétaro · NASA Space Apps Challenge 2026*. | *"[Game Name] — Play it live in your browser."* |

---

## Estructura de la Página del Proyecto (en inglés, en la plataforma Space Apps)

1. **Summary:** Videojuego web cooperativo/individual de 5 minutos donde los jugadores diseñan, integran y operan una misión espacial real mediante estaciones lineales en cadena y un vuelo de 60 segundos con crisis por turnos.
2. **How It Works:** Flujo de 4 pasos (Menú/Lobby PIN $\rightarrow$ Pista Lineal de Estaciones paralelas $\rightarrow$ Vuelo 60s por turnos $\rightarrow$ Reporte Causal NASA).
3. **NASA Data & Physics:** Explicación concisa de WGS84, Tsiolkovsky, FSPL, NPR 7120.5 UFE, JPL CML 4 y los datos de MRO, Artemis I y OSIRIS-REx.
4. **Live Demo (Play It):** URL pública del juego web (funciona en PC y móvil sin instalación) + enlace al repositorio GitHub.
5. **Educational Impact:** Diseñado para que estudiantes y público general entiendan ingeniería de sistemas sin barreras técnicas, evitando simuladores estáticos aburridos gracias a su estética *Paper Mario × Among Us*.
6. **AI Use Declaration:** Declaración transparente del uso de agentes de IA en planeación estructurada y asistencia de desarrollo React/Python bajo arquitectura y validación humana del equipo.
7. **References:** Lista completa de fuentes NASA y librerías Open Source (`referencias.md`).

---

## Checklist Final de Entrega (Antes de Domingo 14:00 h / H23)

- [ ] URL pública del juego probada desde una red o teléfono externo (no solo `localhost` de la laptop dev).
- [ ] Video de exactamente $\le 30\text{ s}$ con subtítulos en inglés y audio limpio, subido y previsualizado.
- [ ] Página del proyecto en inglés revisada ortográficamente por dos integrantes.
- [ ] `referencias.md` completo y cero logos de la NASA en todo el proyecto.
- [ ] Confirmación enviada en la plataforma oficial de Space Apps antes de las 14:00 h del domingo.

---

<!-- Archivo: docs/12-roles.md -->
> **Archivo: `docs/12-roles.md`**

# 12 · Roles del Equipo (5 Integrantes · Plan 24 Horas)

**Qué contiene:** asignación oficial de los 5 integrantes para cubrir sin huecos: menús, lobby, pista lineal, arte *Paper Mario × Among Us*, 8 minijuegos, concurrencia Socket.IO, árbol de decisiones en vivo, modo vuelo de 60 segundos, retroalimentación NASA, pruebas y entrega.  
**Dueño:** Rubén  
**Última actualización:** 2026-11-14 (18:00 h)  
**Estado:** **[DECIDIDO]** (ajustado el intercambio Abraham ↔ Schoenstadt el 14 nov).

---

## Diagnóstico de Arquitectura Senior: ¿Por qué esta distribución funciona?

Rubén planteó una base sólida para repartir el trabajo en 24 horas y cubrir tres preocupaciones clave:
1. **¿Quién hace menús, interfaces, pista lineal, dashboards, jugabilidad base y arte *Paper Mario × Among Us*?** $\rightarrow$ Se concentra en **Leonardo** (Frontend Core + Arte CSS/SVG), usando una arquitectura de enchufe rápido (`MinigameShell` + `MinigameProps`) para probar todo el flujo con minijuegos simulados desde H6 y luego conectar los de Ismael y Abraham en minutos.
2. **¿Cómo protegemos a Ismael si casi no ha desarrollado web?** $\rightarrow$ **Ismael** NO toca servidores, WebSockets ni rutas globales. Trabaja aislado dentro de `/dev-sandbox` en **4 minijuegos 2D visuales** (*Spacecraft Design*, *Mass/CG*, *Launch Vehicle* y *Budget*) con una guía explicada en lenguaje súper sencillo (`18-roadmap-ismael.md`).
3. **¿Quién garantiza la concurrencia en vivo, los casos del modo 60 segundos y el motor espectral?** $\rightarrow$ **Schoenstadt** construye el motor causal (`physics_engine.py` + `decision_tree.py` + `randomizer.py` + `story_tree.json` para las preguntas por turnos de 60 s y retroalimentación), mientras **Abraham** adapta el motor espectral (`logica/` + `juegos_espectrales/`), verifica `nasa_catalog.json` y desarrolla los 4 minijuegos de Ciencia, Comunicaciones DSN, Órbita y Energía 3D. **Rubén** orquesta todo en tiempo real (`game_manager.py` Socket.IO) y realiza el deploy.

---

## Resumen de Roles

| Persona | Rol en el equipo | Qué posee en el código | Roadmap propio |
|---|---|---|---|
| **Rubén** | **Líder de Proyecto, Backend Realtime (Socket.IO), Integración y Entrega** | `backend/main.py`, `backend/game_manager.py`, `backend/requirements.txt`, `frontend/src/socket.ts`, `referencias.md` | `17-roadmap-ruben.md` |
| **Ismael** | **Desarrollador de Minijuegos 2D: Nave, Masa y Lanzador/Presupuesto** | `Rol2A_TopologicalAssembly.tsx`, `Rol1A_BudgetTable.tsx`, `Rol1B_LauncherAuction.tsx`, `Rol2B_MassBalanceTask.tsx` | `18-roadmap-ismael.md` |
| **Abraham** | **Datos NASA, Motor Espectral y Minijuegos de Ciencia, Comms, Órbita y 3D** | `nasa_catalog.json`, `backend/models/subsystems.py`, `backend/logica/`, `backend/juegos_espectrales/`, `Rol3A`, `Rol4A`, `Rol4B`, `Rol3B` | `19-roadmap-abraham.md` |
| **Schoenstadt** | **Arquitecta de Concurrencia Causal, Árbol de 4 Nodos y Modo Vuelo 60s** | `backend/models/session.py`, `backend/physics_engine.py`, `backend/randomizer.py`, `backend/decision_tree.py`, `backend/story_tree.json`, `backend/tests/test_engine.py` | `20-roadmap-schoenstadt.md` |
| **Leonardo** | **Líder Frontend UI/UX, Arte *Paper Mario × Among Us*, Pista Lineal, Vuelo 60s y Dashboard** | `HomeMenu`, `LobbyView`, `LinearStationTrack`, `Flight60sView`, `MissionReportDashboard`, `MinigameShell`, `components/paper/*`, `DevSandboxView` | `21-roadmap-leonardo.md` |

---

## Detalle de Responsabilidades y Puntos de Conexión

### 1. Rubén (`RUB`) — Backend Realtime, Integración y Entrega
- Inicializa `backend/requirements.txt`, `backend/main.py` (`CORS`, `uvicorn` en `0.0.0.0:8000`) y las salas por código PIN en `backend/game_manager.py`.
- Implementa el puente de **concurrencia en vivo**: recibe `accion_parcial_minijuego`, llama a `physics_engine.compute_live_metrics(...)` de Schoenstadt y emite `mutacion_en_vivo` a toda la sala sin bloquear asyncio.
- Controla los cronómetros del servidor (30 s por oleada, 5 s de transición lineal, 4 rondas × 15 s en Vuelo 60 s).
- Coordina merges a `main`, realiza el deploy público (`[ABIERTO A10]`) y lidera la entrega final (video de 30 s + página en inglés + `referencias.md`).

### 2. Ismael (`ISM`) — Minijuegos 2D de Nave, Masa, Vehículo y Presupuesto
- **Prioridad 1 (para Corte Vertical H10):**
  1. `Rol2A_TopologicalAssembly.tsx` (*Spacecraft Design*): armar la nave en orden (cuerpo $\rightarrow$ paneles/energía $\rightarrow$ escudo térmico $\rightarrow$ tornillos $\rightarrow$ cables).
  2. `Rol1A_BudgetTable.tsx` (*Budgets*): repartir 10 monedas de presupuesto en 3 cajas + 2 cartas de gastos urgentes.
- **Prioridad 2 (para H16):**
  3. `Rol1B_LauncherAuction.tsx` (*Launch Vehicles*): tarjetas de cohetes (*Electron*, *Falcon 9*, *Vulcan*, *Falcon Heavy*, *Rideshare*) que muestran en verde si cabe el peso de la nave o en rojo si se pasa.
  4. `Rol2B_MassBalanceTask.tsx` (*Mass / CG*): acomodar las piezas que compraron los compañeros en la cuadrícula de la nave para dejar el punto de equilibrio en el círculo verde.

### 3. Abraham (`ABR`) — Datos NASA, Motor Espectral y Minijuegos Científicos/3D
- Construye y verifica `frontend/src/data/nasa_catalog.json` y `backend/models/subsystems.py` (todas las fuentes NASA reales para misiones, cohetes, órbitas e instrumentos).
- Adapta el motor heredado `backend/logica/` + `backend/juegos_espectrales/` + `adaptadores_web.py` resolviendo las brechas técnicas (`Vector`, `_p0_inicial`, `Plantilla.puede`).
- **Prioridad 1 (H10):** `Rol3A_OrbitalSniper.tsx` (Órbita/Ruta + Tsiolkovsky + cálculo FSPL) y `Rol4A_SpectralLabTask.tsx` (Instrumentos + Reto Espectral `cazadoresEstrellas` / `detectivesLuz` / `bioespectro`).
- **Prioridad 2 (H16):** `Rol4B_CommsSpectralHacker.tsx` (Osciloscopio DSN +3 dB + DTMF *Espectro Hacker*) y `Rol3B_AstroLogistics3D.tsx` (Rover Three.js con spawn rate dependiente de `liveMetrics.funding_factor_F`).

### 4. Schoenstadt (`SCH`) — Concurrencia Causal, Árbol de Decisiones y Modo Vuelo 60s
- Define los esquemas Pydantic (`backend/models/session.py`) y `backend/physics_engine.py` (WGS84, Tsiolkovsky, FSPL, cálculo parcial en vivo de `LiveMetrics`).
- Implementa `backend/randomizer.py` (*Constraint-Aware Clamping*) para que el juego funcione impecable con 1, 2, 3 o 4 humanos.
- Implementa `backend/decision_tree.py` (los 4 Nodos: Lanzamiento, Propulsión, Evento/Escudo, Descarga DSN + puntaje 0–1,000 pts + cadenas causales detalladas para **retroalimentación siempre presente**).
- Diseña y programa **`backend/story_tree.json`** con el banco ramificado de **casos y preguntas de 15 s para el Vuelo de 60 segundos** (adaptadas al estado real con el que salió la nave de las estaciones, tanto en casos nominales como en casos críticos de rescate/mitigación).

### 5. Leonardo (`LEO`) — UI Core, Arte *Paper Mario × Among Us*, Pista Lineal y Dashboards
- Configura el proyecto Vite + Tailwind + Framer Motion + paleta y clases `.paper-card` / `.paper-btn` (`09-arte-y-sonido.md`).
- Crea el componente SVG `<CrewmateAvatar />` (4 colores, visor brillante, recorte de cartulina con doble borde sticker y animación de caminata de papel).
- Construye `/dev-sandbox` (`DevSandboxView.tsx`, para que Ismael y Abraham prueben sus minijuegos solos desde H3) y `MinigameShell.tsx` (reloj de 30 s, bloqueo de toma, alertas `toast_alert` de mutación en vivo y fallback).
- Construye las 5 vistas principales:
  1. `HomeMenu.tsx`
  2. `LobbyView.tsx`
  3. `LinearStationTrack.tsx` (caminata lineal automática entre Estación 1 y Estación 2 + HUD compartido de barras en vivo)
  4. `Flight60sView.tsx` (animación del cohete viajando durante 60 s + tarjetas de pregunta por turnos de 15 s)
  5. `MissionReportDashboard.tsx` (veredicto, desglose de puntaje, cadena causal, dato real NASA y botón `Redesign & Retry`).

---

## Parejas de Apoyo Cruzado (Nadie se queda atorado)

- **Schoenstadt + Rubén:** Contrato Socket.IO $\leftrightarrow$ `physics_engine.py` y sincronización del Vuelo de 60 s.
- **Leonardo + Ismael:** Estilo *Paper Mario × Among Us* dentro de los 4 minijuegos 2D de Ismael y prueba en `/dev-sandbox`.
- **Abraham + Schoenstadt:** Que los textos de retroalimentación de `decision_tree.py` y `story_tree.json` coincidan al 100 % con los datos verificados de `nasa_catalog.json`.
- **Todos en QA (H18–H22):** Pruebas completas de partidas de 1, 2, 3 y 4 jugadores desde laptops y celulares.

---

<!-- Archivo: docs/13-plan-48h.md -->
> **Archivo: `docs/13-plan-48h.md`**

# 13 · Plan de 24 Horas del Hackathon

**Qué contiene:** cronograma operativo hora por hora desde el inicio del sprint (**Sábado 14 nov, 15:00 h**) hasta el cierre (**Domingo 15 nov, 15:00 h**), con criterios de rescate si algo se retrasa y turnos de descanso.  
**Dueño:** Rubén  
**Última actualización:** 2026-11-14 (15:00 h)

**Horario oficial:** `H0` = Sábado 14 nov, **15:00 h** | `H24` = Domingo 15 nov, **15:00 h**.  
**Meta de entrega segura (`H23`):** Domingo 15 nov, **14:00 h** (1 hora antes del cierre oficial).

---

## Cronograma por Hitos (24 Horas)

| Hora del evento | Hora real | Hito que debe estar funcionando | Plan B si falta algo (Contingencia) |
|---|---|---|---|
| **H0 – H1** | Sáb 15:00 – 16:00 | **Arranque y esqueletos:** Repo sincronizado (`proyecto-completo.md`), árbol completo de carpetas `backend/` y `frontend/`, `types/game.ts`, `session.py`, `/dev-sandbox` abierto para Ismael y Abraham. | Nadie escribe código complejo aún sin tener `/dev-sandbox` y `requirements.txt` corriendo. |
| **H3** | Sáb 18:00 | **Cimientos vivos:** Backend levanta sala por PIN y emite eventos dummy; `nasa_catalog.json` v1 listo; `physics_engine.py` pasa primeros tests `pytest`; Leonardo tiene `HomeMenu`, `LobbyView` y `<CrewmateAvatar />` caminando en `LinearStationTrack`. | Simplificar animaciones del Lobby si quitan tiempo a `LinearStationTrack`. |
| **H6** | Sáb 21:00 | **Motores listos y primeros minijuegos:** `decision_tree.py` (4 Nodos) + `randomizer.py` corren en consola con `pytest`; motor espectral (`logica/` + `adaptadores_web.py`) devuelve JSON válidos; Ismael tiene `Rol2A` y `Rol1A` jugables en `/dev-sandbox`. | Si `Rol2A` se atora con drag-and-drop en móvil, agregar clic-para-colocar como control principal. |
| **H10** | Dom 01:00 | **CORTE VERTICAL COMPLETO (Hito Crítico):** Una partida entera de **1 y 2 jugadores** corre en red local de punta a punta: `HomeMenu` $\rightarrow$ `Lobby` $\rightarrow$ `Estación 1` (`Rol1A`, `Rol2A`, `Rol3A`, `Rol4A`) con **mutación en vivo** $\rightarrow$ `Vuelo 60s` (`story_tree.json` v1) $\rightarrow$ `MissionReportDashboard`. | **Alerta roja:** Todos detienen nuevas funciones y se enfocan exclusivamente en cerrar el flujo completo antes de avanzar a Oleada 2. |
| **H14** | Dom 05:00 | **Oleada 2 en integración + Concurrencia total:** Se conectan `Rol1B`, `Rol2B`, `Rol3B` (3D) y `Rol4B` (DSN + Espectro Hacker) dentro de `LinearStationTrack` (Estación 2). Las 3 Misiones NASA y 3 dificultades son seleccionables y probadas. | Si `Rol3B` (Three.js) consume mucho tiempo o FPS bajos en móvil, simplificar la escena 3D a geometría low-poly sin sombras pesadas. |
| **H16** | Dom 07:00 | **Árbol 60s completo y pruebas multiplayer reales:** Partida completa de **4 jugadores** (4 dispositivos simultáneos por PIN) + Singleplayer completan las 2 estaciones, responden las 4 rondas de 15 s en `Flight60sView` y ven retroalimentación causal exacta. | Si algún minijuego secundario de Oleada 2 falla en QA, activar fallback táctico en `MinigameShell` para no bloquear la oleada. |
| **H18** | Dom 09:00 | **CONGELAR FUNCIONES (Feature Freeze del MVP):** El MVP completo funciona sin errores graves. Deploy inicial en URL pública (`[ABIERTO A10]`). Si sobra tiempo desde aquí, se agregan Extras (`05-mvp.md`: sonido CC0, pulido *Paper Mario*). | Prohibido meter mecánicas nuevas si hay bugs rojos abiertos en `QA`. |
| **H20** | Dom 11:00 | **QA externo y congelación visual:** Alguien fuera del equipo juega una partida completa de 5 min en navegador sin ayuda. Se verifica cero logos NASA y textos 100 % en inglés. | Priorizar legibilidad del `MissionReportDashboard` y claridad de instrucciones en cada minijuego. |
| **H21** | Dom 12:00 | **Grabación del Video de 30 s:** Captura limpia en 1080p del juego desplegado siguiendo el guion de `11-entrega.md`, con subtítulos en inglés y cronometrado a $\le 30.0\text{ s}$. | Grabar con la versión estable más limpia que ya esté desplegada. |
| **H22** | Dom 13:00 | **Página del proyecto y referencias:** Redacción en inglés en la plataforma Space Apps, declaración de IA, subida del video y verificación de links desde red externa (datos móviles). | Revisión cruzada por dos integrantes que no redactaron la página. |
| **H23** | Dom 14:00 | **ENTREGA OFICIAL (1 hora de margen).** Botón de Submit enviado y captura de confirmación guardada. | — |
| **H23 – H24** | Dom 14:00 – 15:00 | **Ensayo del pitch en vivo** para jueces locales de Querétaro y prueba final de sala LAN/Web para la demo presencial. | — |

---

## Turnos de Descanso y Energía (`[PROPUESTA]`)

En un sprint de **24 horas**, trabajar agotado destruye la productividad a partir de la madrugada:
- **Descansos escalonados (01:30 h – 06:30 h) en bloques de 2.5 a 3 horas por persona**, asegurando que nunca duerma al mismo tiempo una pareja acoplada:
  - *Turno A de descanso (ej. 01:30 – 04:30):* Ismael y Schoenstadt (justo tras validar el Corte Vertical H10 y dejar `decision_tree.py` corriendo).
  - *Turno B de descanso (ej. 04:30 – 07:30):* Rubén, Leonardo y Abraham (cuando Ismael y Schoenstadt retoman integración/QA).
- Mantener hidratación, snacks ligeros y pruebas continuas cada 2 horas.

---

<!-- Archivo: docs/14-tareas.md -->
> **Archivo: `docs/14-tareas.md`**

# 14 · Tareas (Sprint de 24 Horas)

**Qué contiene:** lista maestra de tareas por responsable (`RUB`, `ISM`, `ABR`, `SCH`, `LEO`, `ENT`, `QA`), dependencias, hora meta (`H0` = Sáb 15:00 h) y criterio exacto de "Terminado cuando".  
**Dueño:** Rubén (cada integrante marca las suyas con `[x]` y corre `node herramientas/combinar.mjs`)  
**Última actualización:** 2026-11-15 (01:08 h · `RUB-01` a `RUB-05`, `ISM-01` a `ISM-04`, `SCH-01` a `SCH-05`, `ABR-01` a `ABR-06`, `LEO-01` a `LEO-09` integrados)

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
| [x] | RUB-01 | Completar `backend/requirements.txt`, `backend/main.py` (FastAPI + Socket.IO ASGI + CORS) y verificar arranque en `0.0.0.0:8000` | — | H1 | `/health` responde `200 OK` y cliente Socket.IO conecta en red local | MVP |
| [x] | RUB-02 | Implementar salas en memoria en `backend/game_manager.py`: `crear_sala` (PIN 6 chars), `unirse_sala` (máx. 4), `seleccionar_rol_mision` | RUB-01 | H3 | Hasta 4 clientes ven actualizado el Lobby sin colisión de roles | MVP |
| [x] | RUB-03 | Implementar relojes autoritativos (30 s Oleada 1, 5 s sync lineal, 30 s Oleada 2) y cierre automático al llegar a `0 s` o al bloquear todos los humanos | RUB-02, SCH-03 | H6 | Al terminar el timer, avanza solo sin quedarse trabado aunque alguien no haga clic | MVP |
| [x] | RUB-04 | Implementar pipeline de concurrencia en vivo: recibir `accion_parcial_minijuego`, llamar `physics_engine.py` y emitir `mutacion_en_vivo` a toda la sala | RUB-03, SCH-02 | H8 | Mover un parámetro en un cliente actualiza las barras y límites en otra pestaña al instante | MVP |
| [x] | RUB-05 | Orquestar la fase de Vuelo 60s en `game_manager.py`: 4 rondas × 15 s rotando turno entre jugadores conectados (`pregunta_vuelo_60s` $\rightarrow$ `resultado_turno_vuelo` $\rightarrow$ `reporte_final_mision`) | RUB-03, SCH-04, SCH-05 | H10 | Partida completa de 1 y 2 jugadores cierra ciclo hasta el reporte final | MVP |
| [ ] | RUB-06 | Deploy público de Frontend + Backend WebSocket accesible desde fuera de la red del hackathon (`[ABIERTO A10]`) | LEO-09, RUB-05 | H18 | Juez o teléfono en datos móviles juega la partida completa sin cortes de WebSocket | MVP |

---

### Leonardo (`LEO`) — UI Core, Arte *Paper Mario × Among Us*, Pista Lineal y Dashboards

| ✓ | ID | Tarea | Depende de | Para | Terminado cuando | Prioridad |
|---|---|---|---|---|---|---|
| [x] | LEO-01 | Configurar `frontend/` (Vite, React, TS, Tailwind, Framer Motion, Lucide, Three.js, Socket.IO client), `types/game.ts` (`MinigameProps`) y `socket.ts` | — | H1 | `npm run dev -- --host` levanta sin errores TS | MVP |
| [x] | LEO-02 | Sistema visual *Paper Mario × Among Us* (`index.css`, `.paper-card`, `.paper-btn`, `Starfield.tsx`, `<CrewmateAvatar />` en 4 colores + estados) | LEO-01 | H3 | Los 4 avatares SVG con borde blanco/negro y sombra dura animan su caminata en pantalla | MVP |
| [x] | LEO-03 | Crear ruta `/dev-sandbox` (`DevSandboxView.tsx`) y `MinigameShell.tsx` (reloj 30 s, bloqueo de toma, indicador `mutacion_en_vivo`, fallback de emergencia) | LEO-01, LEO-02 | H3 | Ismael y Abraham prueban sus componentes aislados con `mockLiveMetrics` | MVP |
| [x] | LEO-04 | Construir `HomeMenu.tsx` (Singleplayer / Multiplayer) y `LobbyView.tsx` (PIN estilo *Among Us*, selección de rol, selección de 3 misiones y dificultad) | LEO-02, RUB-02 | H4 | Flujo Menú $\rightarrow$ Lobby sincroniza en vivo con Backend | MVP |
| [x] | LEO-05 | Construir `LinearStationTrack.tsx`: pista lineal con caminata automática hacia Estación 1 y Estación 2, `ResourceHUD.tsx` en vivo y toasts de mutación | LEO-03, LEO-04 | H6 | El personaje avanza solo entre estaciones y abre `MinigameShell` al llegar | MVP |
| [x] | LEO-06 | Construir `Flight60sView.tsx`: animación de cohete viajando en el espacio durante 60 s, barra de 4 Nodos, indicador de turno y tarjetas de respuesta de 15 s | LEO-02, RUB-05 | H9 | Al recibir `pregunta_vuelo_60s`, solo el jugador en turno responde y ve reacción del cohete | MVP |
| [x] | LEO-07 | Construir `MissionReportDashboard.tsx`: veredicto (`FULL_SUCCESS`/`PARTIAL_SUCCESS`/`FAILED`), score 0–1,000, cadena causal, dato NASA y botón `Redesign & Retry` | LEO-02, SCH-04 | H10 | Siempre muestra explicación educativa clara sin importar si ganó o falló | MVP |
| [x] | LEO-08 | Conectar los 4 minijuegos de Oleada 1 (`Rol1A`–`Rol4A`) en `LinearStationTrack` para el Corte Vertical H10 | LEO-05, ISM-01, ISM-02, ABR-03, ABR-04 | H10 | Partida completa jugable con los 4 roles de Estación 1 reales | MVP |
| [x] | LEO-09 | Conectar los 4 minijuegos de Oleada 2 (`Rol1B`–`Rol4B`) y pulir animaciones *Paper Mario* en todas las vistas | LEO-08, ISM-03, ISM-04, ABR-05, ABR-06 | H15 | Los 8 minijuegos corren integrados en pista lineal de extremo a extremo | MVP |

---

### Ismael (`ISM`) — Minijuegos 2D de Nave, Masa, Vehículo de Lanzamiento y Presupuesto

| ✓ | ID | Tarea | Depende de | Para | Terminado cuando | Prioridad |
|---|---|---|---|---|---|---|
| [x] | ISM-01 | `Rol2A_TopologicalAssembly.tsx` (*Spacecraft Design*): armar la nave en orden (Cuerpo $\rightarrow$ Paneles $\rightarrow$ Escudo $\rightarrow$ Tornillos $\rightarrow$ Cables) | LEO-03 | H6 | Probado en `/dev-sandbox`; avisa qué piezas puso y entrega masa + escudo térmico | MVP |
| [x] | ISM-02 | `Rol1A_BudgetTable.tsx` (*Budgets*): repartir 10 monedas en 3 cajas + 2 cartas de gastos urgentes | LEO-03 | H8 | Emite en vivo el presupuesto de ciencia/energía y reserva; funciona en PC y celular | MVP |
| [x] | ISM-03 | `Rol1B_LauncherAuction.tsx` (*Launch Vehicles*): elegir cohete (*Electron*, *Falcon 9*, *Vulcan*, *Falcon Heavy*, *Rideshare*) viendo si cabe el peso | LEO-03, ABR-01 | H12 | Indica en verde/rojo en tiempo real si la masa del equipo cabe en el cohete elegido | MVP |
| [x] | ISM-04 | `Rol2B_MassBalanceTask.tsx` (*Mass & CG*): colocar las piezas de los compañeros en los cuadritos hasta centrar el punto en el círculo verde | LEO-03 | H14 | Actualiza el equilibrio en vivo y tiene el botón rojo para tirar peso extra | MVP |

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
| [x] | ABR-01 | Completar `frontend/src/data/nasa_catalog.json` y `backend/models/subsystems.py` con todos los datos verificados de MRO, Artemis, OSIRIS-REx, cohetes, órbitas e instrumentos con `"fuente"` | — | H3 | Ningún número en el catálogo carece de `"fuente"` verificada o marcada como balance | MVP |
| [x] | ABR-02 | Integrar `backend/logica/` y `backend/juegos_espectrales/` (`Vector`, `AnalizadorFTIR` protegido en `_p0_inicial`, `Plantilla.puede`, `puntaje.emparejar`, `adaptadores_web.py`) | ABR-01 | H5 | `adaptadores_web.py` genera y califica retos para M1, M2, M3 y *Espectro Hacker* por HTTP/WS | MVP |
| [x] | ABR-03 | `Rol3A_OrbitalSniper.tsx` (*Orbital Constraints*): selector órbita/ruta (LEO/SSO/MEO/GEO o dilemas M1–M3) + motor (Hidracina/Biprop/Hall) con cálculo FSPL y $\Delta v$ en vivo | LEO-03, ABR-01 | H7 | Probado en `/dev-sandbox`; actualiza `fspl_loss_db` y `propellant_mass_kg` en `onLiveMutation` | MVP |
| [x] | ABR-04 | `Rol4A_SpectralLabTask.tsx` (*Science + Spectral*): selector de instrumentos NASA + calibración gráfica con marcas sobre espectro real enviado por `adaptadores_web.py` | LEO-03, ABR-02 | H8 | Devuelve `selected_instruments` y `spectral_marks` para cálculo real de $F_1$ en servidor | MVP |
| [x] | ABR-05 | `Rol4B_CommsSpectralHacker.tsx` (*Comms + Data*): osciloscopio DSN con deriva (agravada si `!cg_balanced`) + limpieza/clave DTMF (*Espectro Hacker*) + slider bitrate | LEO-03, ABR-02 | H13 | Compensa FSPL para alcanzar $\ge +3.0\text{ dB}$ y verifica watts vs. `liveMetrics.available_power_w` | MVP |
| [x] | ABR-06 | `Rol3B_AstroLogistics3D.tsx` (*Power 3D*): escena Three.js con rover recolectando Química/Baterías/Celdas $\text{H}_2$ (capacidad máx. 3, spawn rate según `funding_factor_F`) | LEO-03 | H14 | Corre fluido en navegador con teclado WASD + joystick táctil y emite `total_energy_mj` / `battery_reserve_pct` | MVP |

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
| [x] | EXT-01 | Sonidos CC0 / Web Audio API + botón Mute | Leonardo | Feedback sonoro en estaciones, alertas 60 s y podio |
| [x] | EXT-02 | Cortinillas de papel doblado y `canvas-confetti` en `FULL_SUCCESS` | Leonardo | Transiciones extra sin bajar FPS |
| [x] | EXT-03 | Historial comparativo de intentos en `MissionReportDashboard` al pulsar *Redesign* | Schoenstadt, Leonardo | Muestra intento anterior vs. actual |

---

<!-- Archivo: docs/15-preguntas-frecuentes.md -->
> **Archivo: `docs/15-preguntas-frecuentes.md`**

# 15 · Preguntas Frecuentes

**Qué contiene:** respuestas directas a las dudas más comunes del equipo, los agentes de IA y los jueces sobre la versión web de 24 horas.  
**Dueño:** Rubén  
**Última actualización:** 2026-11-14 (15:00 h)

---

**¿Todavía hacemos hardware físico o Unity?**  
No. Por decisión oficial del **14 de noviembre a las 15:00 h** (`03-decisiones.md`), el proyecto es **100 % software web** (React + TypeScript + Vite + Three.js + FastAPI + Socket.IO).

**¿Cómo se juega una partida de principio a fin en 5 minutos?**  
`HomeMenu` (Singleplayer / Multiplayer) $\rightarrow$ `LobbyView` con código PIN estilo *Among Us* + elección de Rol + elección de 1 de las 3 Misiones NASA y dificultad $\rightarrow$ **Pista Lineal** (el personaje camina solo hacia Estación 1 y Estación 2 con minijuegos paralelos en cadena de 30 s) $\rightarrow$ **Vuelo de 60 segundos** (cohete en espacio con 4 rondas de preguntas/crisis por turnos) $\rightarrow$ **Reporte y Retroalimentación NASA** (`04-juego.md`).

**¿Los jugadores caminan libremente por un mapa 2D?**  
No. Para mantener el ritmo en 5 minutos y evitar confusión, es una **pista lineal**: el personaje se mueve automáticamente hacia la siguiente estación, abre su tarea tipo *Among Us* y avanza en sincronía con sus compañeros.

**¿Cómo se afectan entre sí las misiones/estaciones en paralelo?**  
Cada vez que alguien mueve un recurso o confirma un minijuego (`accion_parcial_minijuego` / `bloquear_toma_minijuego`), `physics_engine.py` recalcula la masa húmeda, FSPL, factor de financiamiento $F$, potencia disponible y balance CG, y difunde `mutacion_en_vivo` por Socket.IO a toda la sala (`08-controles.md`).

**¿Qué pasa si solo juegan 1, 2 o 3 personas en vez de 4?**  
Siempre hay 4 roles en el sistema. `backend/randomizer.py` cubre automáticamente los roles vacíos usando arquetipos acoplados (*Constraint-Aware Clamping*) para que nadie quede bloqueado ni el sistema sea injusto.

**¿Por qué Ismael hace los minijuegos de Nave (`Spacecraft Design`) y Vehículo (`Launch Vehicle`)?**  
Para aprovechar su creatividad sin exponerlo a la complejidad de WebSockets ni servidores. En `18-roadmap-ismael.md` tiene pasos detallados y prompts listos para construir sus componentes en `/dev-sandbox` siguiendo el contrato `MinigameProps`.

**¿Qué pasa si la misión fracasa en el despegue o en órbita?**  
**Siempre damos retroalimentación.** Tanto en el Vuelo de 60 s como en `MissionReportDashboard`, el juego muestra la cadena causal exacta con números reales (ej. *"Tu masa húmeda de 4,982 kg superó a Falcon 9"* o *"Sin Escudo Térmico se perdió en reentrada"*) y un dato real de la NASA (`decision_tree.py`).

**¿Cómo evito romper el trabajo de otro compañero cuando use un agente de IA?**  
1. Lee tu propio roadmap (`docs/17`–`21`).  
2. Edita **solo** los archivos asignados a tu rol (`10-tecnico.md` §5).  
3. Respeta `MinigameProps` y los nombres de eventos Socket.IO de `08-controles.md`.  
4. Si modificas algo estructural en `docs/`, corre `node herramientas/combinar.mjs`.

**¿Podemos usar imágenes o modelos con logo de la NASA?**  
**Nunca.** Está estrictamente prohibido por las reglas de Space Apps. Tampoco extraemos sprites con copyright de *Among Us* o *Paper Mario*: nuestro arte es un homenaje SVG/CSS original dibujado en código (`09-arte-y-sonido.md`).

**¿De dónde salen los números del juego?**  
Exclusivamente de `06-datos-nasa.md` y `frontend/src/data/nasa_catalog.json` con su campo `"fuente"`. Nunca inventes valores dentro del código.

---

<!-- Archivo: docs/16-glosario.md -->
> **Archivo: `docs/16-glosario.md`**

# 16 · Glosario

**Qué contiene:** definición rápida y sencilla de los términos de ingeniería espacial, espectroscopía y desarrollo web usados en este proyecto.  
**Dueño:** Abraham  
**Última actualización:** 2026-11-14 (23:50 h)

| Término | Significado en este proyecto |
|---|---|
| **1 Toma (One-Shot)** | Modalidad de los minijuegos de 30 s: no hay botón de deshacer tras confirmar o al agotarse el reloj, obligando al equipo a asumir consecuencias reales. |
| **Árbol de 4 Nodos** | Evaluador determinista (`decision_tree.py`) que revisa secuencialmente: Nodo 1 Lanzamiento $\rightarrow$ Nodo 2 Propulsión/$\Delta v$ $\rightarrow$ Nodo 3 Escudo/Evento $\rightarrow$ Nodo 4 Ciencia/DSN. |
| **`cargar_espectro_csv` (`datos_reales/`)** | Cargador ligero en Python puro (`csv` + `numpy`) que convierte archivos experimentales reales (`%T`, `Absorbancia`, `Intensidad`, `Reflectancia`) en objetos `Vector` listos para los minijuegos. |
| **Centro de Gravedad (CG)** | Punto de equilibrio de masa de la nave. Si queda fuera de tolerancia ($d_{\text{CG}} > R_{\text{tol}}$), dispara `fuel_burn_multiplier = 1.5x` y desestabiliza la antena DSN. |
| **CML 4 (Concept Maturity Level 4)** | Nivel de madurez conceptual de NASA/JPL donde se exige un margen de crecimiento de masa (*Mass Growth Allowance*) $\ge 35\%$. |
| **Concurrencia en vivo (`mutacion_en_vivo`)** | Mecanismo por Socket.IO donde cada decisión tomada en una estación modifica al instante las barras y restricciones físicas de los compañeros en paralelo. |
| **Conjunción solar** | Alineación donde el Sol se interpone entre la Tierra y Marte (cada $\sim 26\text{ meses}$), bloqueando comandos y bajando el enlace a $0\text{ Mbps}$. |
| **Constraint-Aware Clamping** | Técnica de `randomizer.py` para que los roles controlados por IA tomen decisiones realistas sin sabotear absurdamente la masa o presupuesto de los jugadores humanos. |
| **Deconvolución (`AnalizadorFTIR`)** | Separación matemática de bandas espectrales superpuestas (usada en `bioespectro` para detectar biofirmas en Marte). |
| **Delta-v ($\Delta v$)** | Cambio total de velocidad necesario para ejecutar maniobras orbitales, calculado con la ecuación de Tsiolkovsky. |
| **`/dev-sandbox`** | Ruta local de React creada por Leonardo para que Ismael y Abraham prueben cada minijuego aislado con datos falsos antes de integrarlo al Lobby. |
| **DSN (Deep Space Network)** | Red de antenas gigantes de la NASA en Tierra; exige margen de enlace $\ge +3.0\text{ dB}$ para descargar datos de misiones profundas. |
| **DTMF** | Pares de frecuencias telefónicas usadas en el minijuego *Espectro Hacker* (`Rol4B`) para desbloquear la portadora del enlace DSN. |
| **FSPL (Free Space Path Loss)** | Pérdida de potencia de la señal de radio por distancia en espacio libre (en $\text{dB}$); crece al subir de LEO a GEO o al espacio profundo. |
| **$F$ (`funding_factor_F`)** | Factor de financiamiento I+D ($0.0$ a $1.0$) fijado por el Rol 1A que controla la probabilidad de aparición de Celdas de Combustible $\text{H}_2$ en el minijuego 3D del Rol 3B. |
| **$F_1$ Espectral (`puntaje.emparejar`)** | Métrica armónica de precisión y recall ($0.0$ a $1.0$) con la que el servidor califica la calibración científica del Rol 4A. |
| **`HostScreen` y `PlayerPad`** | Vistas de React en modo multijugador: `HostScreen` muestra el tablero común/proyector; `PlayerPad` es el control individual de cada jugador en su móvil o laptop. |
| **Impulso Específico ($I_{sp}$)** | Eficiencia del motor en segundos: Hidracina ($225\text{ s}$), Bipropelente ($315\text{ s}$), Efecto Hall ($1,600\text{ s}$). |
| **Masa húmeda ($m_{\text{wet}}$)** | Masa seca del bus + masa de instrumentos + masa de propelente. Debe caber dentro de la capacidad máxima del cohete seleccionado. |
| **`MinigameProps`** | Contrato TypeScript en `frontend/src/types/game.ts` que todos los minijuegos implementan para conectarse como piezas intercambiables. |
| **Paper Mario × Among Us** | Estilo visual del juego: tripulantes espaciales adorables con acabado de cartulina recortada 2.5D (doble contorno blanco/negro, sombra sólida, animación de papel). |
| **Pista Lineal (`LinearStationTrack`)** | Recorrido automático en línea recta entre Estación 1 y Estación 2, reemplazando la caminata libre en mapa. |
| **`Plantilla.puede` (Flujo FTIR)** | Regla educativa en `backend/logica/proyecto.py` que enseña el orden correcto (*Baseline $\rightarrow$ Region $\rightarrow$ Modelo*), devolviendo aviso y penalización leve ($-3\text{ pts}$) sin detener la partida. |
| **Rideshare** | Vuelo espacial compartido (SpaceX *Transporter/Bandwagon* v11) cobrado por masa/placa para cargas ligeras ($\le 831\text{ kg}$). |
| **RTG ($\text{Pu-238}$)** | Generador termoeléctrico por radioisótopos; genera energía constante independiente de la luz solar o tormentas de polvo marcianas. |
| **`Rubberband` (Línea Base)** | Estimador de línea base por envolvente convexa inferior que elimina la deriva instrumental antes de recortar o deconvolucionar bandas. |
| **`Tracker` ($d^2y/dx^2$ + MAD)** | Detector automático en `AnalizadorFTIR` que identifica picos estrechos no físicos (fallos de sensor o rayos cósmicos) usando la segunda derivada y desviación mediana absoluta. |
| **UFE (Unallocated Future Expenses)** | Reserva presupuestaria de contingencia exigida por NASA (NPR 7120.5: $\ge 25\%\text{–}30\%$) para no cancelar la misión ante imprevistos. |
| **`Vector` Espectral** | Clase núcleo en `backend/logica/vector.py` que almacena ejes `(x, y)`, unidades (`cm-1`, `nm`, `Hz`), variable física, derivadas y serialización $\le 500$ puntos preservando picos. |
| **Voigt / Pseudo-Voigt** | Perfiles analíticos de banda que combinan ensanchamiento gaussiano (térmico/instrumental) y lorentziano (colisional/natural) para separar picos superpuestos. |
| **Vuelo de 60 Segundos (`Flight60sView`)** | Fase animada posterior a las estaciones donde la nave viaja por el espacio mientras se disparan 4 rondas de 15 s de preguntas/crisis por turnos (`story_tree.json`). |

---

<!-- Archivo: docs/17-roadmap-ruben.md -->
> **Archivo: `docs/17-roadmap-ruben.md`**

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

---

<!-- Archivo: docs/18-roadmap-ismael.md -->
> **Archivo: `docs/18-roadmap-ismael.md`**

# 18 · Guía Paso a Paso: Ismael (Tus 4 Minijuegos de Nave y Cohetes)

**Tu misión:** Construir **4 minijuegos visuales en 2D** muy divertidos y fáciles de entender. Tú te encargas de que el jugador **arme la nave espacial**, **reparta el dinero**, **elija el cohete** y **acomode las piezas para que la nave no vaya chueca**.

**No te preocupes si nunca has hecho una página web:**
- **No tienes que programar servidores, internet, menús ni el vuelo final.** Todo eso lo hacen Rubén, Leonardo, Abraham y Schoenstadt.
- Tú solo trabajas en **4 archivos que ya están creados para ti**, y tu agente de IA va a escribir el código por ti si le pegas los mensajes que te dejamos aquí abajo.
- Para ver si tus juegos quedaron bonitos, Leonardo te preparó una pantalla de pruebas llamada **`/dev-sandbox`** donde puedes jugar tus minijuegos tú solo en tu computadora.

---

## Tus 4 archivos (ya existen en la carpeta del proyecto)

Aquí es donde tu agente de IA va a guardar tu trabajo (no necesitas abrir ni cambiar ningún otro archivo):

```text
space-apps-juego/
└── frontend/
    └── src/
        └── components/
            └── minigames/
                ├── Rol2A_TopologicalAssembly.tsx   <-- JUEGO 1 (Prioridad 1 - para la hora H6): Armar la nave paso a paso
                ├── Rol1A_BudgetTable.tsx           <-- JUEGO 2 (Prioridad 1 - para la hora H8): Repartir 10 monedas de dinero
                ├── Rol1B_LauncherAuction.tsx       <-- JUEGO 3 (Prioridad 2 - para la hora H12): Elegir el cohete
                └── Rol2B_MassBalanceTask.tsx       <-- JUEGO 4 (Prioridad 2 - para la hora H14): Equilibrar el peso
```

---

## Paso 0 · Cómo abrir tu pantalla de pruebas en 3 minutos (o pídeselo a tu agente)

Si abres tu agente de IA, él puede instalar todo solo. Si lo haces tú en la terminal:
1. Descarga el proyecto de GitHub en tu computadora y ábrelo en tu editor (VS Code / Antigravity / Cursor).
2. En la carpeta principal del proyecto, corre una sola vez:
   ```bash
   npm run setup:frontend
   npm run dev:frontend
   ```
3. Abre tu navegador (Chrome o Edge) y entra a esta dirección:
   **`http://localhost:5173/dev-sandbox`**
4. Ahí verás un menú para escoger cualquiera de tus 4 minijuegos y probar cómo se ven y cómo funcionan.

---

## ¿Cómo se conectan tus juegos con los demás? (En palabras simples)

Cada uno de tus 4 archivos recibe una cajita de información de tus compañeros y tiene dos botones invisibles para avisar qué hizo el jugador:

1. **Lo que recibes (`liveMetrics`):** por ejemplo, cuánto pesa toda la nave hasta este momento, cuánto dinero sobra o qué aparatos científicos compraron tus compañeros.
2. **Avisa mientras juegas (`onLiveMutation`):** cada vez que el jugador ponga una pieza, mueva una moneda o toque un cohete, tu juego manda un aviso rápido para que las barras de tus compañeros se muevan en vivo.
3. **Avisa cuando terminas (`onSubmitTake`):** cuando el jugador apriete el botón verde de **Confirmar** (o cuando el reloj de 30 segundos llegue a `0`), tu juego manda el resultado final y se cierra.
4. **Cómo se debe ver:** Como cartulina recortada estilo **Paper Mario × Among Us** (bordes negros gruesos, sombras duras, botones grandes que se hunden al presionarlos) y con **todos los textos en inglés** (para los jueces).

---

## Paso 1 (Empieza por aquí · Meta H6) · Juego 1: Armar la nave paso a paso
**Archivo:** `frontend/src/components/minigames/Rol2A_TopologicalAssembly.tsx`

### ¿Cómo se juega?
Es como armar un LEGO siguiendo las instrucciones en orden (duración: **30 segundos**):
1. En el centro de la pantalla está el espacio vacío donde va la nave. A la izquierda están las piezas en tarjetas grandes.
2. El jugador tiene que ir haciendo clic en las piezas **en el orden correcto**:
   - **Primero:** poner el cuerpo principal de la nave (el chasis).
   - **Segundo:** poner los paneles solares o el generador de energía (si es la misión de Marte) y el escudo contra el calor.
   - **Tercero:** elegir la **llave de tuercas** y hacer clic para apretar los tornillos.
   - **Cuarto:** elegir los **cables** y hacer clic para conectar la electricidad.
3. Si el jugador intenta poner los cables antes de armar el cuerpo, le sale un mensajito rojo en inglés que dice *"Install chassis first!"* y baja un poquito la resistencia de la nave.
4. Si se le acaba el tiempo sin haber puesto el escudo contra el calor, la nave sale sin escudo y tendrá problemas al regresar a la Tierra.

### Copia y pega esto en tu agente de IA:
```text
Paso 0 (Automático): Si falta la carpeta frontend/node_modules, corre `npm --prefix frontend install` primero.
Lee AGENTS.md, docs/09-arte-y-sonido.md, docs/10-tecnico.md, docs/22-como-trabajar-y-hacer-merge.md y docs/18-roadmap-ismael.md.
Trabaja únicamente en el archivo frontend/src/components/minigames/Rol2A_TopologicalAssembly.tsx e implementa la interfaz MinigameProps de frontend/src/types/game.ts.
Hazlo muy visual, divertido y fácil de usar en computadora y celular, con estilo de cartulina recortada Paper Mario x Among Us (clases .paper-card y .paper-btn) y todos los textos en inglés:
1. Muestra el dibujo SVG de la nave al centro y las piezas a la izquierda según missionId:
   - En artemis_moon y asteroid_hunter: Chassis MLI (180 kg), Left/Right Solar Panels (45 kg c/u), Battery Pack (25 kg), Heat Shield (60 kg), Deorbit Thruster (18 kg).
   - En mars_sample_return: Chassis MLI (260 kg), Boom Mast + Pu-238 RTG (56 kg), HGA Dish Mount (30 kg), Sealed Sample Capsule / Heat Shield (95 kg), Deorbit Kit (20 kg).
2. Reglas de orden (con clic sencillo para que sea súper fácil en teléfono):
   - Paso 1: Colocar el Chassis.
   - Paso 2: Colocar Energía, Escudo Térmico y Deorbit.
   - Paso 3: Elegir la herramienta "TORQUE (T1)" y dar clic en los puntos de tornillo.
   - Paso 4: Elegir la herramienta "WIRING (T2)" y dar clic para conectar cables.
3. Si hacen clic fuera de orden, muestra una alerta divertida en rojo y resta 5 % a assembly_integrity_pct (mínimo 60).
4. Cada vez que pongan una pieza, llama a onLiveMutation({ dry_mass_kg: masaActual, has_thermal_protection: tieneEscudo }).
5. Al terminar todos los pasos, presionar "CONFIRM ASSEMBLY", o cuando timeLeftSec <= 0 (y !isLocked), llama a onSubmitTake({ bus_dry_mass_kg, has_thermal_protection, assembly_integrity_pct, has_deorbit_device }).
```

---

## Paso 2 (Sigue con este · Meta H8) · Juego 2: Repartir las 10 monedas del presupuesto
**Archivo:** `frontend/src/components/minigames/Rol1A_BudgetTable.tsx`

### ¿Cómo se juega?
Eres el encargado del dinero de la misión (duración: **30 segundos**):
1. Tienes **10 monedas doradas** para repartir en **3 cajas** usando botones grandes de `+` y `-`:
   - **Caja 1 — Motores y Energía:** entre más monedas pongas aquí, más fácil le salen baterías y celdas buenas a tu compañero del juego 3D.
   - **Caja 2 — Ciencia y Antenas:** define cuánto dinero tendrá tu compañero de Ciencia para comprar cámaras y sensores.
   - **Caja 3 — Alcancía de Emergencias (UFE):** dinero guardado por si algo sale mal en el espacio. Tiene una aguja tipo velocímetro que está en **verde** si guardas al menos el 25 % (3 monedas o más), amarilla si guardas poco y roja si casi no guardas nada.
2. **Tarjetas sorpresa:** cuando queden 20 segundos y cuando queden 12 segundos, salen 2 mensajes urgentes de los ingenieros pidiendo dinero extra (por ejemplo: *"Propulsion asks for +$40M for stronger tanks"*). Tú decides si les das el dinero sacándolo de la alcancía de emergencias o si les dices que no.

### Copia y pega esto en tu agente de IA:
```text
Paso 0 (Automático): Si falta la carpeta frontend/node_modules, corre `npm --prefix frontend install` primero.
Lee AGENTS.md, docs/09-arte-y-sonido.md, docs/10-tecnico.md, docs/22-como-trabajar-y-hacer-merge.md y docs/18-roadmap-ismael.md.
Trabaja únicamente en el archivo frontend/src/components/minigames/Rol1A_BudgetTable.tsx e implementa MinigameProps.
Hazlo en inglés, con estilo Paper Mario x Among Us (.paper-card, .paper-btn) y monedas doradas grandes:
1. Lee el presupuesto base de frontend/src/data/nasa_catalog.json según missionId (800M, 1200M o 2500M USD).
2. Deja repartir exactamente 10 monedas (cada moneda vale 10 %) en 3 columnas con botones grandes (+ / -): "Engineering & R&D", "Science & Comms", "Emergency Vault (UFE)" (arranca en 4 / 3 / 3).
3. Calcula en vivo funding_factor_F = clamp(monedasIng / 6, 0, 1) y ufe_reserve_pct = monedasUfe * 10. Muestra un medidor visual (verde >= 25%, amarillo 15-24%, rojo < 15%).
4. Muestra 2 tarjetas sorpresa cuando timeLeftSec <= 20 y timeLeftSec <= 12 con botones "Approve from Vault" / "Reject"; si aprueban, baja 10% o 5% de ufe_reserve_pct y suma ese gasto a subsystems_cost_usd.
5. En cada toque llama a onLiveMutation({ funding_factor_F, ufe_reserve_pct, budget_science_usd, subsystems_cost_usd }).
6. Al confirmar o cuando timeLeftSec <= 0 (y !isLocked), llama a onSubmitTake({ budget_engineering_usd, budget_science_usd, ufe_reserve_pct, funding_factor_F, subsystems_cost_usd }).
```

---

## Paso 3 (Segunda mitad · Meta H12) · Juego 3: Elegir el cohete donde sí quepa la nave
**Archivo:** `frontend/src/components/minigames/Rol1B_LauncherAuction.tsx`

### ¿Cómo se juega?
Ya en la segunda estación, tus compañeros terminaron de poner piezas. Tu pantalla te dice cuánto pesa la nave completa en total y cuánto dinero queda en la caja.
1. En pantalla aparecen **5 tarjetas de cohetes reales** (*Electron*, *SpaceX Rideshare*, *Falcon 9*, *Vulcan Centaur* y *Falcon Heavy*).
2. Cada tarjeta te ayuda mostrando una etiqueta **VERDE (`FITS!`)** si el peso de la nave sí cabe en ese cohete, o una etiqueta **ROJA (`TOO HEAVY!`)** si es demasiado pesada para ese cohete. También muestra si alcanza el dinero.
3. Escoges el mejor cohete que quepa y no pase del presupuesto, activas el botón de cerrar la punta del cohete (*Fairing OK*) y confirmas.

### Copia y pega esto en tu agente de IA:
```text
Lee AGENTS.md, docs/06-datos-nasa.md, docs/10-tecnico.md y docs/18-roadmap-ismael.md.
Trabaja únicamente en el archivo frontend/src/components/minigames/Rol1B_LauncherAuction.tsx e implementa MinigameProps.
Requisitos en inglés con estética Paper Mario x Among Us (.paper-card, .paper-btn):
1. Lee la lista de cohetes desde frontend/src/data/nasa_catalog.json (Electron, SpaceX Rideshare XL, Falcon 9 Block 5, Vulcan Centaur VC6, Falcon Heavy) con su capacidad en kg y su costo en USD.
2. Muestra arriba un letrero muy claro con el peso actual de la nave (liveMetrics.estimated_wet_mass_kg) y el dinero disponible (liveMetrics.remaining_budget_usd).
3. Cada tarjeta de cohete debe mostrar en verde "PAYLOAD FITS!" si la masa cabe o en rojo "TOO HEAVY (+X kg)" si se pasa, y otra insignia verde/roja para el dinero.
4. Incluye un interruptor simple "Confirm Payload Fairing" (fairing_ok = true por defecto al elegir cohete compatible).
5. Llama a onLiveMutation al seleccionar tarjeta y a onSubmitTake({ selected_launcher, launcher_max_mass_kg, fairing_ok, launch_cost_usd }) al confirmar o al llegar timeLeftSec <= 0.
```

---

## Paso 4 (Último juego · Meta H14) · Juego 4: Acomodar las piezas para que la nave no vaya chueca
**Archivo:** `frontend/src/components/minigames/Rol2B_MassBalanceTask.tsx`

### ¿Cómo se juega?
Si pones todo el peso de un solo lado de la nave, al prender los motores va a girar chueca y gastar 50 % más gasolina.
1. A la izquierda te salen **las piezas reales que compró tu compañero de Ciencia** (cámaras, sensores, etc.) más el tanque de combustible.
2. Al centro hay una cuadrícula con 8 espacios alrededor del centro de la nave. Tocas una pieza y luego tocas un espacio para acomodarla.
3. En el centro hay un **círculo verde** y un puntito rojo que se mueve según dónde pongas las piezas (como una balanza). Tu meta es acomodar las piezas de forma pareja para que el puntito quede **adentro del círculo verde** (`BALANCED!`).
4. Si ves que la nave pesa demasiado para el cohete, hay un botón rojo de emergencia llamado **`JETTISON BALLAST (-40 kg)`** que tira peso extra para ayudar al equipo.

### Copia y pega esto en tu agente de IA:
```text
Lee AGENTS.md, docs/06-datos-nasa.md, docs/10-tecnico.md y docs/18-roadmap-ismael.md.
Trabaja únicamente en el archivo frontend/src/components/minigames/Rol2B_MassBalanceTask.tsx e implementa MinigameProps.
Requisitos en inglés con estilo Paper Mario x Among Us (.paper-card, .paper-btn):
1. Toma las piezas de liveMetrics.selected_instruments (si la lista viene vacía en sandbox, usa 2 piezas de prueba: "Main Camera (45 kg)" y "Avionics Box (25 kg)") más "Fuel Tank (80 kg)".
2. Dibuja una cuadrícula 2D de la nave con 8 casillas simétricas en coordenadas (x, y) entre -1.0 m y +1.0 m, y un círculo verde al centro cuyo radio es 0.25 en easy, 0.15 en medium y 0.08 en hard.
3. Permite hacer clic en una pieza y clic en una casilla para moverla. Calcula en vivo el centro de masa (X_CG, Y_CG) y qué tan lejos está del centro (d_CG = sqrt(X_CG^2 + Y_CG^2)) dibujando el punto en pantalla.
4. Si d_CG <= radio verde: cg_balanced = true y fuel_burn_multiplier = 1.0 (muestra letrero verde "NOMINAL 1.0x"). Si está afuera: cg_balanced = false y fuel_burn_multiplier = 1.5 (alerta roja "UNBALANCED 1.5x FUEL!").
5. Agrega un botón rojo "JETTISON BALLAST (-40 kg)" que reduzca peso extra.
6. Llama a onLiveMutation({ cg_balanced, fuel_burn_multiplier }) cada vez que muevan algo, y llama a onSubmitTake({ cg_balanced, fuel_burn_multiplier, mass_growth_margin_pct, ballast_jettisoned_kg }) al confirmar o cuando timeLeftSec <= 0.
```

---

## Antes de decirle a Leonardo "Ya quedó mi minijuego", revisa estos 4 puntos:
1. Abre `http://localhost:5173/dev-sandbox` y juega el minijuego completo en la computadora y haciendo la ventana chiquita como celular.
2. Verifica que todos los botones y textos que ve el jugador estén en **inglés**.
3. Deja que el reloj llegue a `0` segundos sin apretar nada para comprobar que el juego se envía solo y no se queda trabado.
4. Asegúrate de no haber cambiado ningún archivo fuera de tus 4 archivos de `frontend/src/components/minigames/`.

---

<!-- Archivo: docs/19-roadmap-abraham.md -->
> **Archivo: `docs/19-roadmap-abraham.md`**

# 19 · Roadmap Paso a Paso: Abraham (Datos NASA, Motor Espectral y Minijuegos de Ciencia, Órbita, DSN y Energía 3D)

**Tu misión en estas 24 horas:** Mantener la **validez científica NASA** (criterio global de evaluación), adaptar el **motor analítico espectral** heredado (`logica/` + `juegos_espectrales/`) y construir los **4 minijuegos científicos, orbitales, de comunicaciones DSN y de logística energética 3D**.  
**Estado actual (`2026-11-14 23:50 h`):** `[x] ABR-01`, `[x] ABR-02`, `[x] ABR-03`, `[x] ABR-04`, `[x] ABR-05` y `[x] ABR-06` implementados y verificados con `pytest` y `tsc && vite build`.

---

## Árbol exacto de carpetas y archivos donde trabajas

Todos estos archivos ya existen implementados en el repositorio:

```text
space-apps-juego/
├── backend/
│   ├── models/
│   │   └── subsystems.py                    # TUYO: Catálogo tipado sincronizado con nasa_catalog.json (ABR-01)
│   ├── logica/                              # TUYO: Motor analítico FTIR adaptado a web sin GUI/pandas (ABR-02)
│   │   ├── __init__.py
│   │   ├── vector.py                        # Vector (Absorbancia/%T/Intensidad/Reflectancia, unidades cm-1/nm/Hz, <=500 pts)
│   │   ├── Analizador.py                    # AnalizadorFTIR (lineaBase, Recortar, Tracker d2y/dx2, Deconvolucion segura)
│   │   ├── proyecto.py                      # Plantilla.puede (-3 pts), Muestra, Proyecto y cargar_espectro_csv
│   │   ├── lineaBase/
│   │   │   ├── __init__.py
│   │   │   └── modeloLineaBase.py           # rubberband, splines, lineal, escalar
│   │   └── modelos/
│   │       ├── __init__.py
│   │       ├── model.py                     # Registro Models (gauss_amp, guassiano/gaussiano, lorentz, voigt, psd_voigt1/2)
│   │       ├── simulacion.py                # Métricas MAE/MSE/RMSE/R2 y simulador de bandas sintéticas
│   │       └── Modelo_*.py                  # Implementaciones puras NumPy/SciPy
│   └── juegos_espectrales/                  # TUYO: Generadores (8 modos + CSV real), guías y F1 (ABR-02)
│       ├── __init__.py
│       ├── adaptadores_web.py               # generar_reto_oleada1, generar_reto_hacker, generar_reto_juego, ejecutar_accion_espectral, evaluar_marcas
│       └── nucleo/
│           ├── __init__.py
│           ├── generador.py                 # 8 generadores sintéticos + generar_desde_csv_real (soporta datos_reales/<mission_id>.csv)
│           ├── puntaje.py                   # emparejar (Precision/Recall/F1), cosine_similarity y penalización de flujo
│           └── biblioteca.py                # NIST/Wien/FTIR/Cauchy/DTMF + educational_guide en inglés
└── frontend/
    └── src/
        ├── data/
        │   └── nasa_catalog.json            # TUYO: Single Source of Truth de datos NASA (ABR-01)
        └── components/
            └── minigames/
                ├── Rol3A_OrbitalSniper.tsx        # TUYO [x] (H7 · ABR-03)
                ├── Rol4A_SpectralLabTask.tsx      # TUYO [x] (H8 · ABR-04)
                ├── Rol4B_CommsSpectralHacker.tsx  # TUYO [x] (H13 · ABR-05)
                └── Rol3B_AstroLogistics3D.tsx     # TUYO [x] (H14 · ABR-06)
```

---

## Paso 1 · Catálogo Verificado NASA en JSON (`[x] ABR-01` | Meta: H3)

1. Revisa los datos marcados como `sin verificar` en `docs/06-datos-nasa.md` (masas/potencias de HiRISE, CRISM, MARCI, SHARAD y fuentes oficiales en `science.nasa.gov` / NSSDCA).
2. Llena `frontend/src/data/nasa_catalog.json` y su espejo `backend/models/subsystems.py` con:
   - Las **3 Misiones** (`artemis_moon`, `asteroid_hunter`, `mars_sample_return`) con presupuesto, metas científicas, tolerancias de CG y dato NASA real.
   - Los **Lanzadores 2026** (*Electron*, *Falcon 9 Block 5*, *Vulcan Centaur VC6*, *Falcon Heavy*, placas *SpaceX Rideshare v11*).
   - Las **Órbitas y Motores** (LEO/SSO/MEO/GEO + dilemas de ruta + Hidracina $225\text{ s}$, Biprop $315\text{ s}$, Hall $1,600\text{ s}$).
   - Los **Instrumentos científicos reales** (HiRISE, CTX, CRISM, MARCI, MCS, SHARAD, más cámaras/espectrómetros de M1/M2), cada uno con su campo `"fuente"` obligatorio.
3. Comparte inmediatamente este JSON con **Ismael** (`Rol1B` y `Rol2B`) y **Schoenstadt** (`decision_tree.py` y `story_tree.json`).

---

## Paso 2 · Motor Espectral y Adaptadores Web (`[x] ABR-02` | Meta: H5)

Integra el código analítico de espectroscopía (`arquitectura_integral_y_motor_espectral_nasa_space_apps_2026.md` §5) dentro de `backend/logica/` y `backend/juegos_espectrales/`:
1. **Aplica las 4 correcciones críticas para la web:**
   - Extiende `Vector.__init__` para aceptar `variable` $\in \{\text{"Absorbancia"}, \text{"Transmitancia"}, \text{"Intensidad"}, \text{"Reflectancia"}\}$ y `unidadX` $\in \{\text{"cm-1"}, \text{"nm"}, \text{"Hz"}\}$.
   - Convierte `distance` física a número de muestras para `scipy.signal.find_peaks`.
   - Protege `AnalizadorFTIR.Deconvolucion` (`_p0_inicial`) insertando bordes sintéticos si la señal limpia no tiene depresiones intermedias (cero excepciones fatales en vivo).
   - En `Plantilla.puede(paso)`, devuelve `(False, motivo_educativo)` y penaliza $-3\text{ pts}$ sin abortar el juego.
2. **En `backend/juegos_espectrales/adaptadores_web.py`:**
   - Crea `generar_reto_oleada1(mission_id, difficulty)` devolviendo máximo $500$ puntos `(x, y)` serializados en JSON + bandas candidatas de `biblioteca.py`:
     - M1 Luna $\rightarrow$ `cazadores_estrellas` (líneas Balmer/Na/Wien) o `ecoespectro` (NDVI/NDWI).
     - M2 Asteroide $\rightarrow$ `detectives_luz` (bandas FTIR $\text{Si–O–Si}$, $\text{O–H}$, $\text{C=O}$).
     - M3 Marte $\rightarrow$ `bioespectro` (deconvolución Amida I).
   - Crea `generar_reto_hacker(mission_id, difficulty)` para Oleada 2 (tono anómalo + matriz DTMF de `espectro_hacker`).
   - Crea `evaluar_marcas(marcas_usuario, verdad, tolerancia)` llamando a `puntaje.emparejar(...)` para devolver `science_calibration_f1` $\in [0.0, 1.0]$.

   - Expone también `generar_reto_juego(game_id, ...)`, `ejecutar_accion_espectral(...)` y `generar_desde_csv_real(...)` para cubrir los **8 arquetipos** (`cazadores_estrellas`, `detectives_luz`, `ecoespectro`, `laboratorio_musical`, `mision_foton`, `bioespectro`, `ladron_colores`, `espectro_hacker`), guías educativas paso a paso (`educational_guide`) y carga automática de espectros experimentales CSV en `datos_reales/<mission_id>.csv`.

---

## Paso 3 (Prioridad 1 · Meta H7) · `Rol3A_OrbitalSniper.tsx` (`[x] ABR-03` · *Orbital Constraints*)

1. Implementa `MinigameProps` en `/dev-sandbox`.
2. **Parte 1 (0–15 s):** Selector visual de órbita/ruta:
   - M1: *Direct Route (3 days)* vs. *Free-Return Trajectory (10 days, $-400\text{ kg}$ prop.)*
   - M2: *Fast Flyby (15 min)* vs. *Orbital Insertion*
   - M3: *MAV 30 Tubes* vs. *MAV 15 Tubes ($-150\text{ kg}$, allows RTG)* + Altitud de estacionamiento (LEO $350\text{ km}$, SSO $700\text{ km}$, MEO $20,200\text{ km}$, GEO $35,786\text{ km}$).
3. **Parte 2 (15–30 s):** Selector de motor (*Hydrazine* $225\text{ s}$, *MMH/NTO Bipropellant* $315\text{ s}$, *Hall Effect Electric* $1,600\text{ s}$).
4. Muestra en vivo la fracción de propelente (Tsiolkovsky) y la pérdida **FSPL (dB)** que hereda Rol 4B, llamando `onLiveMutation` en cada cambio y `onSubmitTake` al confirmar o llegar a `0 s`.

---

## Paso 4 (Prioridad 1 · Meta H8) · `Rol4A_SpectralLabTask.tsx` (`[x] ABR-04` · *Science + Spectral*)

1. **Parte 1 (0–10 s):** Selector de carga útil desde `nasa_catalog.json` (respetando el techo presupuestario científico `liveMetrics` que fijó Rol 1A) + toggle **Visual Autopilot (Natural Feature Tracking)** vital en M2.
2. **Parte 2 (10–30 s):** Gráfica SVG/Canvas limpia del espectro recibido en `spectralChallenge`. El jugador hace clic/toca sobre los picos característicos (y opcionalmente aplica botón `Clean Baseline` antes de marcar).
3. Envía `selected_instruments` en `onLiveMutation` (para que Ismael en `Rol2B` reciba exactamente esos bloques) y `spectral_marks` en `onSubmitTake`.

---

## Paso 5 (Prioridad 2 · Meta H13) · `Rol4B_CommsSpectralHacker.tsx` (`[x] ABR-05` · *Comms + Data*)

1. **Osciloscopio DSN (0–15 s):** Una retícula objetivo se mueve por deriva orbital; si `!liveMetrics.cg_balanced`, la velocidad de deriva aumenta $1.5\times$ (con alerta visible *"Unbalanced CG causing 1.5x antenna drift!"*). El jugador centra la antena para superar $+3.0\text{ dB}$ compensando `liveMetrics.fspl_loss_db`.
2. **Espectro Hacker + Bitrate (15–30 s):** Muestra la señal de portadora con un tono intruso DTMF; el jugador aplica filtro de línea base y toca el par DTMF anómalo para desbloquear el enlace, luego desliza el *Bitrate* ($0.5\text{–}6.0\text{ Mbps}$) verificando no pasarse de `liveMetrics.available_power_w` ni dejar el búfer de $160\text{ Gbit}$ lleno antes de la Conjunción Solar.

---

## Paso 6 (Prioridad 2 · Meta H14) · `Rol3B_AstroLogistics3D.tsx` (`[x] ABR-06` · *Power 3D*)

1. Escena 3D ligera en **Three.js** (canvas dentro del contenedor de `MinigameShell` con cleanup estricto de `WebGLRenderer` en `useEffect` return para no fugar memoria al salir de la estación).
2. Rover recolector con límite estricto de **$N_{\max} = 3$ paquetes apilados** antes de descargar en el Aro Holográfico Central:
   - *Química* (Naranja): $+15\text{ MJ}$, $+8\%$ vel.
   - *Baterías* (Azul cian): $+45\text{ MJ}$, $-14\%$ vel.
   - *Celdas $\text{H}_2$* (Dorado/Verde): $+100\text{ MJ}$, $-4\%$ vel.
3. **Acoplamiento en vivo:** La probabilidad de aparición (*spawn rate*) de las Celdas $\text{H}_2$ ($5\%$ a $50\%$) se interpola directamente de `liveMetrics.funding_factor_F` que definió el Rol 1A de Ismael.
4. Soporta **WASD / Flechas** en escritorio y un **joystick táctil en pantalla** en celulares.

---

## Prompt listo para usar con tu Agente de IA

```text
Paso 0 (Automático): Antes de empezar, verifica e instala dependencias ejecutando `python -m pip install -r requirements.txt` y `npm --prefix frontend install` si faltan `node_modules` o librerías Python.
Lee AGENTS.md, arquitectura_integral_y_motor_espectral_nasa_space_apps_2026.md (§3, §4, §5, §8), docs/06-datos-nasa.md, docs/10-tecnico.md, docs/22-como-trabajar-y-hacer-merge.md y docs/19-roadmap-abraham.md.
Trabajaremos únicamente en tus archivos asignados en este orden:
1) frontend/src/data/nasa_catalog.json + backend/models/subsystems.py (todos los datos NASA verificados con "fuente").
2) backend/logica/* y backend/juegos_espectrales/* (con las 4 protecciones para no lanzar excepciones en gameplay de 30s y serializar <= 500 puntos por espectro en adaptadores_web.py).
3) Los 4 componentes React en frontend/src/components/minigames/: Rol3A_OrbitalSniper.tsx, Rol4A_SpectralLabTask.tsx, Rol4B_CommsSpectralHacker.tsx y Rol3B_AstroLogistics3D.tsx.
Reglas: todos los minijuegos implementan exactamente MinigameProps de frontend/src/types/game.ts, usan estética .paper-card / .paper-btn (Paper Mario x Among Us), textos en inglés, soporte táctil + escritorio, y llaman a onLiveMutation y onSubmitTake exactamente como pide docs/10-tecnico.md.
```

---

<!-- Archivo: docs/20-roadmap-schoenstadt.md -->
> **Archivo: `docs/20-roadmap-schoenstadt.md`**

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

---

<!-- Archivo: docs/21-roadmap-leonardo.md -->
> **Archivo: `docs/21-roadmap-leonardo.md`**

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
            └── paper/                   # Sistema visual 2D Flash ASTRO SPRITES y Audio (LEO-02, EXT-01)
                ├── CrewmateAvatar.tsx   # 4 Astro Sprites articulados + ROLE_CHARACTER_PROFILE + actionEffect
                ├── LoadingScreen.tsx    # Pantallas de carga por transición (boot, wave1→2, launch, report)
                ├── SoundEngine.tsx      # Web Audio API SFX + Ambient Synth + <SoundControlPill /> (EXT-01)
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

## Paso 7 · Conexión Final de los 8 Minijuegos, Audio y Pulido Final (`LEO-08`, `LEO-09`, `EXT-01`–`EXT-03` | H10 – H15)

- **Para H10:** Mapea en un registro limpio los primeros 4 (`Rol1A`, `Rol2A` de Ismael; `Rol3A`, `Rol4A` de Abraham) dentro de `LinearStationTrack` y verifica el flujo completo con Rubén y Schoenstadt.
- **Para H15:** Mapea los 4 restantes (`Rol1B`, `Rol2B` de Ismael; `Rol3B`, `Rol4B` de Abraham) y pule transiciones de cartulina y responsividad móvil.
- **Estado implementado en `leo-branch` (2026-11-15):** Completadas las 8 fases del frontend de Leonardo (`LEO-01`–`LEO-09`, `EXT-01`–`EXT-03`): extremidades articuladas y efectos `complete`/`error`/`scan`/`thruster` en `CrewmateAvatar.tsx`, sintetizador `SoundEngine.tsx`, sello `STATION LOCKED`, cortinillas 2D Flash, chispas de propulsor, trazabilidad `stationLoadout` (`CREW PACKED` vs `AI AUTOPILOT`), *page flip* de Bitácora en `Flight60sView.tsx` y tarjetas causales expandibles en `MissionReportDashboard.tsx`. Listo para Pull Request / Merge Request e integración final con `backend/`.

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

---

<!-- Archivo: docs/22-como-trabajar-y-hacer-merge.md -->
> **Archivo: `docs/22-como-trabajar-y-hacer-merge.md`**

# 22 · Cómo Trabajar en Equipo, Probar Solo y Hacer Merge sin Romper Nada

**Para:** Todo el equipo (**Rubén, Ismael, Abraham, Schoenstadt y Leonardo**)  
**Idea central:** Piensen en este repositorio como un **rompecabezas de 5 piezas LEGO**.  
Cada persona desarrolla su pieza en su propia rama con su agente de IA **sin tocar los archivos de los demás**, prueba su pieza sola, y en los cortes de integración (**H10**, **H15** y **H18**) hacemos `git merge` a `main` sabiendo de antemano que **todo encaja exacto**.

---

## 1. Mapa del Rompecabezas (Quién toca qué)

### Regla #1: Cada quien solo edita SUS carpetas y archivos
| Persona | Rama sugerida | Archivos donde SÍ trabaja | Cómo prueba su pieza sola antes del merge |
|---|---|---|---|
| **Rubén** | `feat/ruben-backend` | `backend/main.py`, `backend/game_manager.py`, `referencias.md` | `npm run dev:backend` y probar `/health` + eventos Socket.IO |
| **Ismael** | `feat/ismael-minigames` | `Rol2A_TopologicalAssembly.tsx`, `Rol1A_BudgetTable.tsx`, `Rol1B_LauncherAuction.tsx`, `Rol2B_MassBalanceTask.tsx` | `npm run dev:frontend` $\rightarrow$ abrir `http://localhost:5173/dev-sandbox` y probar los 4 minijuegos |
| **Abraham** | `feat/abraham-science` | `frontend/src/data/nasa_catalog.json`, `backend/models/subsystems.py`, `backend/logica/`, `backend/juegos_espectrales/`, `Rol3A`, `Rol4A`, `Rol4B`, `Rol3B` | `/dev-sandbox` para los 4 minijuegos + `npm run test:backend` para `adaptadores_web.py` |
| **Schoenstadt** | `feat/schoenstadt-engine` | `backend/models/session.py`, `backend/physics_engine.py`, `backend/randomizer.py`, `backend/decision_tree.py`, `backend/story_tree.json`, `backend/tests/test_engine.py` | `npm run test:backend` (`python -m pytest backend/tests`) |
| **Leonardo** | `feat/leonardo-ui` | `frontend/src/App.tsx`, `frontend/src/index.css`, `frontend/src/components/paper/*`, `MinigameShell.tsx`, `frontend/src/views/*` | `npm run dev:frontend` y `npm run build:frontend` (verifica 0 errores TypeScript) |

### Regla #2: Las 5 Piezas Sagradas de Unión ("Los Enchufes" del Rompecabezas)
Nadie cambia estos archivos por su cuenta en su rama personal; si hace falta ajustarlos, se acuerda en equipo, se actualiza `docs/` y se corre `node herramientas/combinar.mjs`:
1. **`frontend/src/types/game.ts`** (`MinigameProps` y `LiveMetrics`) — El enchufe entre **Leonardo** y los 8 minijuegos de **Ismael y Abraham**.
2. **`frontend/src/data/nasa_catalog.json`** — Los datos NASA compartidos por **Abraham, Ismael y Schoenstadt**.
3. **`docs/08-controles.md`** — Nombres exactos de los eventos Socket.IO entre **Rubén** y **Leonardo**.
4. **`backend/models/session.py`** — Modelos Pydantic compartidos entre **Schoenstadt** y **Rubén**.
5. **`requirements.txt`, `package.json` y `frontend/tailwind.config.js`** — Dependencias compartidas para evitar conflictos al mezclar ramas.

---

## 2. Cómo Arrancar en 3 Minutos (Instalación Automática)

El repositorio ya incluye `package.json` y `requirements.txt` en la **raíz**, además de `AGENTS.md` con instrucciones para que tu agente de IA instale todo automáticamente.

### Opción A · Si usas Agente de IA (Antigravity / Cursor / Claude / Codex)
1. Clona el repo o haz `git pull origin main`.
2. Crea tu rama personal (ver sección 3).
3. Copia y pega el **Prompt listo** que viene al final de tu roadmap (`docs/17` a `docs/21`).  
   El agente trae el **Paso 0 automático**: revisará e instalará las librerías de Node (`frontend/node_modules`) o Python (`requirements.txt`) antes de programar.

### Opción B · Comandos rápidos en terminal (desde la raíz `space-apps-juego/`)
- **Instalar Frontend (Ismael, Leonardo, Abraham):** `npm run setup:frontend`
- **Instalar Backend (Rubén, Schoenstadt, Abraham):** `npm run setup:backend`
- **Instalar TODO de una vez:** `npm run setup`
- **Prender `/dev-sandbox` y UI:** `npm run dev:frontend` $\rightarrow$ abrir `http://localhost:5173/dev-sandbox`
- **Prender servidor backend:** `npm run dev:backend`
- **Correr pruebas de física y árbol:** `npm run test:backend`
- **Validar compilación frontend antes de merge:** `npm run build:frontend`

---

## 3. Flujo Git Paso a Paso (Cero Conflictos de Merge)

1. **Antes de empezar cada bloque, asegúrate de partir de `main` actualizado:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feat/tu-nombre-tarea
   ```
   *(Ejemplo: `feat/ismael-rol2a`, `feat/schoenstadt-engine`, `feat/abraham-spectral`).*

2. **Trabaja únicamente en tus archivos** siguiendo tu roadmap (`docs/17` a `docs/21`).
   - Cada archivo del rompecabezas ya tiene **stubs compatibles** creados (exports nombrados + `export default` en React; firmas exactas en Python). **Conserva esos nombres de función y exportación** al rellenarlos.

3. **Verifica tu pieza antes de subirla:**
   - Si tocaste frontend (`Ismael`, `Leonardo`, `Abraham`): corre `npm run build:frontend`. Debe terminar sin errores.
   - Si tocaste backend (`Rubén`, `Schoenstadt`, `Abraham`): corre `npm run test:backend`. Todos los tests deben pasar.

4. **Guarda y sube tu rama:**
   ```bash
   git status
   git add <solo tus archivos modificados>
   git commit -m "feat(rol2a): implement topological spacecraft assembly"
   git push -u origin feat/tu-nombre-tarea
   ```
   **Ojo:** Si `git status` muestra que se modificó por accidente un archivo de otro compañero, deshaz solo ese archivo antes del commit (`git restore <archivo>`) o revisa con el equipo.

---

## 4. Cortes de Integración (Cómo Armamos el Rompecabezas en H10 y H15)

1. **Rubén** (o quien esté en `main`) hace merge de las ramas en este orden limpio para detectar cualquier detalle al instante:
   1. `docs` / contratos (`nasa_catalog.json`, `session.py`)
   2. Motor de **Schoenstadt** (`physics_engine.py`, `randomizer.py`, `decision_tree.py`, `story_tree.json`) + Motor espectral de **Abraham** (`logica/`, `juegos_espectrales/`)
   3. Servidor Socket.IO de **Rubén** (`main.py`, `game_manager.py`)
   4. UI base de **Leonardo** (`App.tsx`, `views/`, `paper/`, `MinigameShell.tsx`)
   5. Los 8 minijuegos de **Ismael** (`Rol1A`–`Rol2B`) y **Abraham** (`Rol3A`–`Rol4B`)
2. Después de cada merge en `main`, se corren dos comandos en la raíz:
   ```bash
   npm run test:backend
   npm run build:frontend
   ```
3. Luego todos hacen `git checkout main && git pull origin main` y abren su siguiente rama limpia para la Oleada 2 / pulido final.

---

<!-- Archivo: docs/23-retroalimentacion-pruebas.md -->
> **Archivo: `docs/23-retroalimentacion-pruebas.md`**

# 23 · Retroalimentación de pruebas de juego (2026-11-15)

**Qué contiene:** resultados de jugar el videojuego completo en local (`npm run play`, backend `:8000` + frontend `:5173`) desde el navegador integrado, lo que se corrigió en el momento y las **áreas de oportunidad priorizadas** para la fase final antes del pull request y el despliegue.
**Dueño:** Leonardo (redactado por Claude Code)
**Última actualización:** 2026-11-15

---

## 1. Cómo se probó

| Prueba | Configuración | Resultado |
|---|---|---|
| A | Solo · Engineer · Artemis (fácil) | Éxito total, 811/1000 pts. Evento: caída de antena DSN (bloqueado por el código de señal). |
| B | Solo · Soldier · Mars (difícil), eligiendo **Solar** en la estación de energía | Sin crash (antes rompía el vuelo). Éxito total. Evento: conjunción solar (bloqueado). |
| C | Solo · Engineer · Artemis | Éxito total. Tormenta solar −10 % batería en una corrida previa → éxito parcial. |
| D | **Multijugador:** anfitrión en escritorio + invitado en vista de teléfono (375 px) uniéndose con PIN | Asiento asignado por el servidor, cambio de rol sincronizado, misión solo para el anfitrión, cada uno en su estación, “Waiting for the crew”, avance a Estación 2 en ambos. |

Ritmo medido con script (bloqueando rápido): ~90 s hasta el vuelo; con humanos leyendo el briefing y jugando: **3–5 min** estimados (objetivo cumplido).

## 2. Lo que funciona bien (verificado)

- Menú del mockup, opciones, `HOST MATCH` / `JOIN MATCH` (PIN → apodo) en escritorio y teléfono sin scroll horizontal.
- Pantalla de carga única con la animación de nebulosa generada en Python; sprites del arte en menú, misiones y despegue.
- Estaciones a pantalla completa con briefing, metas, sin reloj; cinemáticas entre estaciones y despegue según misión.
- **Árbol de decisiones en vivo** (*If we launched now*): reacciona al instante (rideshare → *Liftoff FAILS*; gastar toda la reserva → no alcanza para el cohete → *FAILS*; volver a Falcon 9 → *READY*).
- Eventos aleatorios con mitigación por diseño y explicación con fuente real en el reporte.
- Vuelo sin congelarse (bug de autocancelación arreglado) y reporte siempre visible.

## 3. Corregido durante esta prueba

| # | Problema encontrado | Corrección |
|---|---|---|
| 1 | Los asientos de IA no aparecían como bloqueados: el invitado veía *Waiting for the crew · 1/4* y la barra de tareas arrancaba en 0/8. | `App.tsx` marca como bloqueados los roles de IA al iniciar cada ola (el servidor ya los rellena). Ahora arranca en 3/8 en solitario. |
| 2 | El banner del anfitrión decía *Join at localhost:5173* (inútil para teléfonos). | `/health` devuelve `lan_ip` (interfaz de la ruta por defecto); el lobby muestra `IP-LAN:5173`. |
| 3 | Vulcan y Electron marcados *Earth orbit only* (falso: solo falta la cifra de escape en el catálogo). | Rideshare → *Earth orbit only*; los demás sin dato → *No escape data*. |
| 4 | El reporte mostraba ids crudos (`falcon9_block5`, `sso_700`, rutas). | El reporte traduce ids del catálogo a nombres (*SpaceX Falcon 9 Block 5*, etc.). |

## 4. Áreas de oportunidad (priorizadas)

### P0 — Afectan aprender, ganar o perder

1. ✅ **Resuelto (2026-11-15): curva de dificultad por peligros (ver `docs/04`).** Antes: **el juego era demasiado fácil.** 3 de 3 corridas terminaron en éxito total con decisiones por defecto, incluida **Marte (difícil) con energía solar**. Propuesta: umbrales por dificultad en `nasa_catalog.json` (con fuente), IA de autopiloto que no siempre elija lo seguro en *medium/hard*, y en Marte exigir RTG o batería alta para la tormenta de polvo. *Dueño sugerido: Schoenstadt (árbol) + Abraham (catálogo).*
2. ✅ **Resuelto (2026-11-15): compuertas *Not decided · waits ROL* hasta que su rol actúa.** Antes: **el pronóstico arrancaba todo en verde** antes de que nadie decida (son los valores por defecto/IA). Propuesta: mostrar cada compuerta como *Not decided* hasta que su rol la toque. *Leonardo.*
3. ✅ **Parcial (2026-11-15): Luna con capacidad TLI con fuente para Vulcan (11 500 kg) y Electron + Photon (25 kg); ver `docs/24`.** Antes: **se perdió el trade-off de lanzadores:** solo Falcon 9 y Falcon Heavy tienen capacidad de escape con fuente, así que casi siempre gana Falcon 9. Propuesta: añadir capacidades TLI/escape con fuente (Vulcan Centaur — guía de usuario de ULA; Electron + Photon — misión CAPSTONE; Falcon Heavy expendable). *Abraham.*
4. ✅ **Resuelto (2026-11-15): HUD con DATA y TIME derivados del catálogo; Data afecta *Call Earth* (ver `docs/24`).** Antes: **faltaban dos recursos del reto: Data y Time.** Para *Data* hace falta una cifra con fuente de horas de contacto DSN por día (capacidad de bajada vs datos generados); para *Time*, la duración por ruta ya existe (`transit_days`) pero no se evalúa. *Rubén + Schoenstadt.*

### P1 — Claridad y racionalidad

5. ✅ **Resuelto (2026-11-15): bitácora reescrita en lenguaje simple con efectos en cada opción.** Antes: **bitácora de vuelo con mucha jerga** (~124 palabras por entrada: *Translunar Injection*, *cislunar*, *UFE*, *F1*). Propuesta: reescribir `story_tree.json` en lenguaje simple (≤40 palabras) y mostrar el efecto de cada opción como íconos (+combustible, −batería…). *Schoenstadt.*
6. ✅ **Resuelto (2026-11-15): explicaciones causales, resúmenes por rol, puntos de control, cabina y objetivos de misión en lenguaje simple (sin UFE/F1/DSN/ids crudos).** Antes: **reporte con jerga** (*UFE*, *F1*, *DSN*, *dB*, *4 node decision tree*). Propuesta: glosario emergente o sustituir por *reserva*, *calidad científica*, *señal*. *Leonardo.*
7. ✅ **Resuelto (2026-11-15): regla de margen de potencia en `randomizer.py` + compuerta `engine_power_short`.** Antes: **la IA del piloto elige motor Hall (Isp 1600 s) con energía de celda de combustible** sin revisar la potencia. Propuesta: regla de margen de potencia (`generación − instrumentos − motor`) en backend y en `randomizer.py`. *Schoenstadt.*
8. ✅ **Resuelto (2026-11-15): Rol 3A usa `LiveMetrics.dry_mass_kg`.** Antes: **Rol 3A calculaba el propelente con una masa seca estimada (620 kg)**, no con la real de la nave; una nave más pesada queda corta de combustible. *Abraham.*
9. **El costo de los instrumentos no entra al presupuesto** y en Artemis la reserva casi no afecta las compuertas. *Rubén.*
10. ✅ **Resuelto (2026-11-15): `launch_state` congela el despegue.** Antes: **el Nodo 1 se reevaluaba con el estado después del vuelo** (respuestas de vuelo cambian un despegue ya ocurrido). Propuesta: `launch_snapshot`. *Rubén.*

### P2 — Pulido y despliegue

11. ✅ **Resuelto (2026-11-15).** `herramientas/jugar.mjs` imprimía la IP de un adaptador virtual (192.168.56.1); usar la de la ruta por defecto (como ya hace `/health`). *Rubén.*
12. ✅ **Resuelto (2026-11-15): el cliente se identifica por su `socket.id` (igual al `sid` del servidor); el apodo queda como respaldo. Verificado con dos jugadores llamados igual.** Antes: el id del invitado se resolvía por apodo: dos jugadores con el mismo apodo pueden confundirse. Propuesta: que `unirse_sala` devuelva `player_id`. *Rubén.*
13. En pestañas en segundo plano las animaciones de transición se pausan (comportamiento del navegador); probar en teléfonos reales antes de la demo.
14. Datos por validar con fuente: costo de MSR ($2.5B vs estimaciones de NASA), pérdida de señal real Tierra–Luna/Marte, potencia real de un MMRTG (~110 W).
15. ✅ **Resuelto (2026-11-15): `score_breakdown` con puntos por parte y consejos “How to reach 1,000”.** El puntaje (811/1000 con éxito total) necesitaba una explicación visible de qué faltó para 1000.
16. ✅ **Verificado (2026-11-15): no se usa en ninguna vista.** El sprite `sign-radiation` tiene texto en español con errata (*RADIACION ADVERTION*): no usarlo en la UI en inglés.

### Iteración leaderboard (2026-11-15)

- ✅ El podio final ya no es fijo por rol (antes *Finance* siempre era #1): el servidor calcula `leaderboard` y la vista `CrewLeaderboard` muestra podio (top 3, corona al #1), lista con el aporte de cada asiento (compuerta, estaciones, llamadas de vuelo, resumen) y el puntaje de trabajo en equipo.
- ✅ Reporte reordenado: veredicto → puntaje → leaderboard → eventos → causas → puntos de control → historial → reintentar. Se eliminó la sección duplicada *Crew Contributions*.
- ✅ Correcciones de las 3 iteraciones: un asiento con su compuerta fallando ya no puede quedar #1 (pesos 50/10/5); asientos de IA con nombre propio (*Medic · AI*); etiqueta *Revisit* cuando el veredicto marca esa compuerta; texto de radio correcto cuando el margen sí supera 3 dB; sin desbordes a 375 px; sin errores de React en consola.

## 5. Siguiente paso recomendado

1. Resolver **P0-1 (dificultad)** y **P0-2 (pronóstico “no decidido”)**: son los que más cambian la experiencia del jurado.
2. Conseguir las cifras con fuente de **P0-3/P0-4** y activarlas en backend.
3. Reescribir textos de vuelo (**P1-5**) y luego preparar el pull request a `main` y el despliegue.

---

<!-- Archivo: docs/24-validacion-reto.md -->
> **Archivo: `docs/24-validacion-reto.md`**

# 24 · Validación contra el reto Space Apps (2026-11-15)

**Qué contiene:** 3 iteraciones finales de validación: (1) trazabilidad de cada requisito del reto *Space Mission Design Game* (texto oficial en `docs/02-reto.md`) con evidencia en el juego; (2) revisión del contexto de investigación (datos y hechos NASA) con correcciones; (3) verificación jugando en local y con pruebas automáticas.
**Dueño:** Leonardo (redactado por Claude Code)
**Última actualización:** 2026-11-15

---

## 1. Matriz de trazabilidad (reto → juego)

| Requisito del reto | Dónde lo cubre el juego | Estado |
|---|---|---|
| Jugar solo o en equipo de hasta 4 | `SINGLE PLAYER` / `MULTI PLAYER` (HOST / JOIN con PIN); asientos vacíos los vuela la IA (`randomizer.py`) | ✅ Verificado (anfitrión + invitado por PIN) |
| Roles con responsabilidades distintas | 4 especialistas: presupuesto/lanzador, nave/masa, órbita/energía, ciencia/comunicaciones | ✅ |
| Definir el **objetivo de misión** | Cada tarjeta de misión muestra su objetivo científico (`science_goal` del catálogo) | ✅ **Nuevo en esta ronda** (antes no se mostraba) |
| Diseñar la nave | Rol 2A (estructura, potencia, escudo térmico, deorbitación) + Rol 2B (centro de masa) | ✅ |
| Seleccionar instrumentos (masa, potencia, costo, datos, valor científico) | Rol 4A con instrumentos del catálogo con fuente | ✅ |
| Elegir lanzador y órbita, con **chequeo de compatibilidad de masa** | Rol 1B (capacidad de escape del catálogo; rideshare = solo órbita terrestre) + Rol 3A (ruta, órbita, motor) | ✅ |
| Recursos: **Mass** | HUD *MASS* (+ centrado y escudo) | ✅ |
| Recursos: **Power** | HUD *POWER*; motor y radio consumen potencia | ✅ |
| Recursos: **Budget** | HUD *BUDGET* (+ reserva) | ✅ |
| Recursos: **Data** | HUD *DATA*: Gbit/día de los instrumentos y horas de enlace/día necesarias; si pasa de 24 h/día, la compuerta *Call Earth* se degrada y el reporte explica el cuello de botella | ✅ **Nuevo en esta ronda** |
| Recursos: **Communications** | HUD *COMMS* (pérdida de trayecto) + Rol 4B (antena, margen, código) | ✅ (renombrado de *SIGNAL* a *COMMS*) |
| Recursos: **Time** (vida de misión) | HUD *TIME*: días de viaje de la ruta elegida (`transit_days` del catálogo) | ✅ **Nuevo en esta ronda** (solo informativo; no penaliza todavía) |
| Ver cómo una decisión afecta a otras partes | Pronóstico en vivo *If we launched now* (servidor) + mutaciones en vivo entre roles | ✅ |
| No hay una única solución perfecta | Varias rutas/motores/lanzadores válidos; simulado: varias combinaciones logran éxito total | ✅ |
| Eventos aleatorios / restricciones inesperadas | Peligros por misión con fuente; *hard* recibe 2 y más fuertes | ✅ |
| Niveles de dificultad / varios escenarios | Luna (fácil), asteroide (media), Marte (difícil) | ✅ |
| Simulación y evaluación de la misión | Vuelo de 4 capítulos sobre el árbol de 4 compuertas | ✅ |
| Puntaje que premia éxito, ciencia y eficiencia | 50 % objetivo · 30 % ciencia · 20 % eficiencia | ✅ |
| Premiar la **colaboración** | Tarjeta *Crew collaboration* (0–100): 40 % estaciones bloqueadas por la tripulación, 30 % llamadas de vuelo respondidas, 30 % compuertas listas al despegar | ✅ (iteración 4) |
| Explicar **por qué** triunfa o falla | Reporte causal, compuerta a revisar en palabras, eventos con fuente | ✅ |
| Rediseñar y simular varias veces | *Redesign & Retry* + comparación de intentos | ✅ |
| Accesible a distintos niveles | Briefing por estación, textos simples en estaciones y bitácora de vuelo reescrita en lenguaje simple (32 preguntas, 96 opciones; etiquetas = efectos reales) | ✅ (iteración 4) |

## 2. Contexto de investigación: hechos revisados

| Hecho / dato | Revisión | Acción |
|---|---|---|
| *“Artemis I used a Free-Return Trajectory”* (tarjeta y reporte de la Luna) | **Incorrecto.** Artemis I (2022) usó una órbita retrógrada distante (DRO); la trayectoria de retorno libre es de **Artemis II** (tripulada). La reentrada a casi 40 000 km/h sí es correcta. | ✅ Corregido en `nasa_catalog.json` con fuentes `nasa.gov/mission/artemis-i` y `artemis-ii`. |
| Presupuesto de Mars Sample Return = $2.5B | Muy por debajo de la estimación de la revisión independiente de NASA (2023), que llevó a replantear MSR. | ✅ Nota *Game-scaled budget* con fuente (`science.nasa.gov/mission/mars-sample-return/`), visible en el reporte de Marte. |
| MRO: 2 180 kg al lanzar, 1 149 kg de propelente, antena de 3 m, hasta 6 Mbps, grabador de 160 Gbit | Coincide con la ficha DESCANSO de JPL ya citada. | Sin cambio. |
| OSIRIS-REx: navegación por reconocimiento visual (Natural Feature Tracking) en Bennu | Correcto. | Sin cambio. |
| Capacidad de lanzadores para salir de la Tierra | Solo Falcon 9 y Falcon Heavy tienen cifra de escape con fuente en el catálogo. | ✅ Iteración 4: para la **Luna** basta la inyección translunar (TLI): Vulcan VC6 **11 500 kg** (ULA) y Electron + Lunar Photon **25 kg** (demostrado por CAPSTONE, NSSDC 2022-070A). Vulcan GTO corregido a 14 500 kg. Escape/Marte de Vulcan y Electron: **no publicado** → siguen en 0 kg para asteroide y Marte. |
| La IA del piloto no elegía una ruta real | Su plan solo nombraba la órbita (`sso_700`), así que el *Time* quedaba vacío y su Δv era genérico. | ✅ Corregido: la IA elige una ruta del catálogo (la de menor Δv si es conservadora) y usa su Δv. |

## 3. Verificación (iteración 3)

- **Pruebas automáticas:** `pytest backend/tests` **29/29** (nuevas: Data/Time derivados del catálogo, cuello de botella de datos que degrada *Call Earth*). Build del frontend con 0 errores.
- **Jugado en local (online):** las tarjetas de misión muestran el objetivo; el HUD muestra los 6 recursos del reto; *TIME* = 210 días en Marte; *DATA*: 242 Gbit/día con enlace de 0.5 Mbps → **134 h/día necesarias → RISK** y *Call Earth: Risky*; con 6 Mbps → 11.2 h/día → OK y *Call Earth: Ready*, pero la radio consume **347 W** (el *trade-off* de datos contra potencia que pide el reto).

## 4. Lo que queda (ordenado por impacto)

1. **Puntuar la colaboración** (el reto lo menciona): por ejemplo, bonus por roles humanos que bloquean y por decisiones de vuelo tomadas a tiempo.
2. **Hacer que *Time* tenga consecuencia**: p. ej., rutas largas consumen más reserva o batería (requiere una regla con fuente o declarada como estimado del juego).
3. **Bitácora de vuelo en lenguaje simple** (`story_tree.json`).
4. **Cifras con fuente pendientes:** escape de Vulcan / Electron + Photon, pérdida de trayecto real Tierra–Marte/Luna, potencia real de un MMRTG (~110 W), costo de instrumentos en el presupuesto.
5. **Regla de margen de potencia** para la IA (motor Hall con celda de combustible).

## 5. Iteración 4 (2026-11-15): implementado

- **Multijugador:** los invitados ya aparecen en la sala. Causa: el Firewall de Windows bloqueaba el puerto 8000; ahora Vite hace de proxy (`/socket.io`, `/health`, `/api`) y el teléfono solo usa el puerto 5173. Un *join* sin conexión ya no abre un lobby falso.
- **Colaboración puntuada** (`game_manager._collaboration_score`, campo `collaboration` en `reporte_final_mision`).
- ***Time* con consecuencia:** la eficiencia = 40 % masa + 40 % presupuesto + 20 % tiempo (ruta más rápida del catálogo ÷ ruta elegida) y nota en el reporte.
- **Bitácora en lenguaje simple** (`story_tree.json`, solo textos; ids y efectos sin cambios).
- **Regla de margen de potencia:** la IA elige el motor de mayor Isp cuya demanda cabe en la potencia de la nave; un motor sin potencia suficiente deja el Nodo 2 en *CRITICAL*.
- **Cifras con fuente aplicadas:** TLI de Vulcan/Electron (arriba); **10 h/día de datos por la DSN** (MRO: ~16 h de seguimiento, 10–11 h enviando datos; DESCANSO) en lugar del límite físico de 24 h; **pérdida real Tierra–destino** en banda X 8.4 GHz (ITU-R P.525 con distancias NSSDC): Luna 222.6 dB, Marte 265.7–283.0 dB, mostrada como contexto en *COMMS*.
- **Diferidos (sin fuente suficiente):** potencia del MMRTG (~110 W al inicio, ~45 kg) — todo el modelo de potencia del juego es estimado, cambiar solo el RTG lo desbalancea; **costo de instrumentos**: no hay fuente pública por instrumento, siguen como estimado del equipo; distancia al asteroide (depende del objetivo).
- **Verificación:** `pytest` **34/34**, build sin errores, partida en vivo (bot solo, Luna con Vulcan) → *FULL_SUCCESS*, colaboración 100/100, bitácora nueva visible.
