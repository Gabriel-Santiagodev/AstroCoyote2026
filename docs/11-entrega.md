# 11 · Entrega y Presentación (Jueces Locales y Globales)

**Qué contiene:** reglas oficiales de entrega de NASA Space Apps 2026, guion actualizado del video de 30 segundos, plantilla de la página del proyecto en inglés y lista de verificación final.  
**Dueño:** Rubén  
**Última actualización:** 2026-11-14 (15:00 h)

---

## Reglas críticas que no podemos romper

| Regla oficial Space Apps | Qué hacemos para cumplir al 100 % |
|---|---|
| **Video de 30 segundos exactos** (o máx. 7 diapositivas) en inglés | Grabamos un video de **29–30 s exactos** con subtítulos en inglés y ritmo dinámico. Jamás pasarnos de 30 s. |
| **Página del proyecto en inglés** | Usamos la plantilla de abajo revisada por dos personas del equipo antes de las H23 (domingo 14:00 h). |
| **Uso obligatorio de datos o recursos de la NASA** | Citamos MRO, JPL DESCANSO, Artemis I, OSIRIS-REx, WGS84, GMAT, CMLs y CubeSat 101 con sus enlaces oficiales. |
| **Uso de IA declarado** | Incluimos sección **AI Use** detallando las herramientas usadas para planeación, roadmaps y apoyo en código. Si hubiera alguna imagen/video IA, llevaría marca de agua visible. |
| **Todo recurso externo en `referencias.md`** | Registramos librerías (`React`, `FastAPI`, `Three.js`, `Framer Motion`, `tsParticles`, `SciPy`), fuentes (`Google Fonts`) y datos NASA desde H1. |
| **Nunca usar el logo de la NASA** | Verificado visualmente en todas las vistas, iconos, favicon y video. |
| **Entregar 1 hora antes del cierre (H23 = Domingo 14:00 h)** | Evitamos caídas de plataforma a las 14:55 h. |

---

## Guion del Video de 30 Segundos (`[PROPUESTA]`)

*Grabado en pantalla 1080p desde el juego web desplegado, usando la Misión 3 (Mars Sample Return / MRO) o Misión 1 en modo Multiplayer (4 avatares Paper Mario × Among Us).*

| Tiempo | Qué se ve en pantalla | Texto / Subtítulo en inglés (voz o rótulo claro) |
|---|---|---|
| **0–4 s** | `HomeMenu` $\rightarrow$ `LobbyView` con código PIN y 4 tripulantes *Paper Mario × Among Us* eligiendo roles. | *"Four engineers. One web lobby. Real NASA mission trade-offs in 5 minutes."* |
| **4–12 s** | `LinearStationTrack`: los avatares caminan en línea a Estación 1 y 2; cortes rápidos de `Rol2A` (montaje), `Rol4A` (espectro) y `Rol3B` (3D) mientras las barras de masa y FSPL cambian en vivo en pantalla. | *"Linear stations in parallel: every kilogram or watt you pick reshapes your teammates' limits live."* |
| **12–21 s** | `Flight60sView`: el cohete despega en el espacio, estalla alerta de tormenta de polvo marciana y un jugador responde el turno de crisis en 15 segundos. | *"Then survive a 60-second turn-based space flight powered by real orbital physics and DSN links."* |
| **21–27 s** | `MissionReportDashboard`: aparece el veredicto (`FULL SUCCESS` o `FAILED` educativo), puntaje, cadena causal con Tsiolkovsky/MRO y enlace NASA. | *"Win or fail, instant NASA-backed causal feedback teaches why every engineering choice mattered."* |
| **27–30 s** | Logo del juego + URL jugable + *Querétaro · NASA Space Apps Challenge 2026*. | *"[Game Name] — Play it live in your browser."* |

---

## Estructura de la Página del Proyecto (en inglés, en la plataforma Space Apps)

1. **Summary:** Videojuego web cooperativo/individual de 5 minutos donde los jugadores diseñan, integran y operan una misión espacial real mediante estaciones lineales en cadena y un vuelo de 60 segundos con crisis por turnos.
2. **How It Works:** Flujo de 4 pasos (Menú/Lobby PIN $\rightarrow$ Pista Lineal de Estaciones paralelas $\rightarrow$ Vuelo 60s por turnos $\rightarrow$ Reporte Causal NASA).
3. **NASA Data & Physics:** Explicación concisa de WGS84, Tsiolkovsky, FSPL, NPR 7120.5 UFE, JPL CML 4 y los datos de MRO, Artemis I y OSIRIS-REx.
4. **Live Demo (Play It):** URL pública del juego web (funciona en PC y móvil sin instalación) + enlace al repositorio GitHub.
5. **Educational Impact:** Diseñado para que estudiantes y público general entiendan ingeniería de sistemas sin barreras técnicas, evitando simuladores estáticos aburridos gracias a su estética *Paper Mario × Among Us*.
6. **AI Use Declaration:** Declaración transparente del uso de agentes de IA en planeación estructurada y asistencia de desarrollo React/Python bajo arquitectura y validación humana del equipo.
7. **References:** Lista completa de fuentes NASA y librerías Open Source (`referencias.md`).

---

## Checklist Final de Entrega (Antes de Domingo 14:00 h / H23)

- [ ] URL pública del juego probada desde una red o teléfono externo (no solo `localhost` de la laptop dev).
- [ ] Video de exactamente $\le 30\text{ s}$ con subtítulos en inglés y audio limpio, subido y previsualizado.
- [ ] Página del proyecto en inglés revisada ortográficamente por dos integrantes.
- [ ] `referencias.md` completo y cero logos de la NASA en todo el proyecto.
- [ ] Confirmación enviada en la plataforma oficial de Space Apps antes de las 14:00 h del domingo.
