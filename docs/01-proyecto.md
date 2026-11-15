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
