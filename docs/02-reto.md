# 02 · El reto

**Qué contiene:** qué pide exactamente la NASA, cómo nos califican los jueces, cómo lo cubre nuestro juego web de 5 minutos y el texto oficial completo (incluyendo *NASA Data & Resources*).  
**Dueños:** Rubén, Abraham  
**Última actualización:** 2026-11-14 (15:00 h)

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
| **Accesible, educativo y divertido (no *AI slop*)** | Estética híbrida **Paper Mario × Among Us + HUD NASA**, conceptos explicados visualmente en el juego (sin exigir conocimientos previos de ingeniería) y partida ágil de ~5 minutos. |

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
