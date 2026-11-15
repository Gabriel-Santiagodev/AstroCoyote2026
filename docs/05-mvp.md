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
