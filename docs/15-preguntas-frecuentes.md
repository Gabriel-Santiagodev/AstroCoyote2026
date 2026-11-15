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
