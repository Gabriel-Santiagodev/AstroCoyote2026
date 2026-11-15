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
