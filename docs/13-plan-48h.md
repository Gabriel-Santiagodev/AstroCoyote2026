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
