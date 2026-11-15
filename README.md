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
