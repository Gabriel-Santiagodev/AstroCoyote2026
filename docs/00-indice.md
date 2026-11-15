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
