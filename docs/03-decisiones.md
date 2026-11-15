# 03 · Decisiones

**Qué contiene:** todo lo que el equipo ya decidió (`[DECIDIDO]`), lo que está propuesto como arquitectura recomendada (`[PROPUESTA]`), lo que sigue abierto (`[ABIERTO]`) y el historial previo al pivote para trazabilidad.  
**Dueño:** Rubén  
**Última actualización:** 2026-11-14 (15:00 h)

Lo más nuevo va arriba.

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
| **Idioma del juego** | Interfaz visible del juego, tarjetas educativas, preguntas de 60 s, página de entrega y video de 30 s en **inglés** (regla de entrega global). Documentos de equipo en español. | Todos |

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
| A4 | Idioma | **Cerrada:** Inglés en el juego y entrega para evaluación global; español en `docs/`. |
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
