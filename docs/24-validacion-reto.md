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
