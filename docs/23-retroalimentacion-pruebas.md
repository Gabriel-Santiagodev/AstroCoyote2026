# 23 · Retroalimentación de pruebas de juego (2026-11-15)

**Qué contiene:** resultados de jugar el videojuego completo en local (`npm run play`, backend `:8000` + frontend `:5173`) desde el navegador integrado, lo que se corrigió en el momento y las **áreas de oportunidad priorizadas** para la fase final antes del pull request y el despliegue.
**Dueño:** Leonardo (redactado por Claude Code)
**Última actualización:** 2026-11-15

---

## 1. Cómo se probó

| Prueba | Configuración | Resultado |
|---|---|---|
| A | Solo · Engineer · Artemis (fácil) | Éxito total, 811/1000 pts. Evento: caída de antena DSN (bloqueado por el código de señal). |
| B | Solo · Soldier · Mars (difícil), eligiendo **Solar** en la estación de energía | Sin crash (antes rompía el vuelo). Éxito total. Evento: conjunción solar (bloqueado). |
| C | Solo · Engineer · Artemis | Éxito total. Tormenta solar −10 % batería en una corrida previa → éxito parcial. |
| D | **Multijugador:** anfitrión en escritorio + invitado en vista de teléfono (375 px) uniéndose con PIN | Asiento asignado por el servidor, cambio de rol sincronizado, misión solo para el anfitrión, cada uno en su estación, “Waiting for the crew”, avance a Estación 2 en ambos. |

Ritmo medido con script (bloqueando rápido): ~90 s hasta el vuelo; con humanos leyendo el briefing y jugando: **3–5 min** estimados (objetivo cumplido).

## 2. Lo que funciona bien (verificado)

- Menú del mockup, opciones, `HOST MATCH` / `JOIN MATCH` (PIN → apodo) en escritorio y teléfono sin scroll horizontal.
- Pantalla de carga única con la animación de nebulosa generada en Python; sprites del arte en menú, misiones y despegue.
- Estaciones a pantalla completa con briefing, metas, sin reloj; cinemáticas entre estaciones y despegue según misión.
- **Árbol de decisiones en vivo** (*If we launched now*): reacciona al instante (rideshare → *Liftoff FAILS*; gastar toda la reserva → no alcanza para el cohete → *FAILS*; volver a Falcon 9 → *READY*).
- Eventos aleatorios con mitigación por diseño y explicación con fuente real en el reporte.
- Vuelo sin congelarse (bug de autocancelación arreglado) y reporte siempre visible.

## 3. Corregido durante esta prueba

| # | Problema encontrado | Corrección |
|---|---|---|
| 1 | Los asientos de IA no aparecían como bloqueados: el invitado veía *Waiting for the crew · 1/4* y la barra de tareas arrancaba en 0/8. | `App.tsx` marca como bloqueados los roles de IA al iniciar cada ola (el servidor ya los rellena). Ahora arranca en 3/8 en solitario. |
| 2 | El banner del anfitrión decía *Join at localhost:5173* (inútil para teléfonos). | `/health` devuelve `lan_ip` (interfaz de la ruta por defecto); el lobby muestra `IP-LAN:5173`. |
| 3 | Vulcan y Electron marcados *Earth orbit only* (falso: solo falta la cifra de escape en el catálogo). | Rideshare → *Earth orbit only*; los demás sin dato → *No escape data*. |
| 4 | El reporte mostraba ids crudos (`falcon9_block5`, `sso_700`, rutas). | El reporte traduce ids del catálogo a nombres (*SpaceX Falcon 9 Block 5*, etc.). |

## 4. Áreas de oportunidad (priorizadas)

### P0 — Afectan aprender, ganar o perder

1. ✅ **Resuelto (2026-11-15): curva de dificultad por peligros (ver `docs/04`).** Antes: **el juego era demasiado fácil.** 3 de 3 corridas terminaron en éxito total con decisiones por defecto, incluida **Marte (difícil) con energía solar**. Propuesta: umbrales por dificultad en `nasa_catalog.json` (con fuente), IA de autopiloto que no siempre elija lo seguro en *medium/hard*, y en Marte exigir RTG o batería alta para la tormenta de polvo. *Dueño sugerido: Schoenstadt (árbol) + Abraham (catálogo).*
2. ✅ **Resuelto (2026-11-15): compuertas *Not decided · waits ROL* hasta que su rol actúa.** Antes: **el pronóstico arrancaba todo en verde** antes de que nadie decida (son los valores por defecto/IA). Propuesta: mostrar cada compuerta como *Not decided* hasta que su rol la toque. *Leonardo.*
3. **Se perdió el trade-off de lanzadores:** solo Falcon 9 y Falcon Heavy tienen capacidad de escape con fuente, así que casi siempre gana Falcon 9. Propuesta: añadir capacidades TLI/escape con fuente (Vulcan Centaur — guía de usuario de ULA; Electron + Photon — misión CAPSTONE; Falcon Heavy expendable). *Abraham.*
4. ✅ **Resuelto (2026-11-15): HUD con DATA y TIME derivados del catálogo; Data afecta *Call Earth* (ver `docs/24`).** Antes: **faltaban dos recursos del reto: Data y Time.** Para *Data* hace falta una cifra con fuente de horas de contacto DSN por día (capacidad de bajada vs datos generados); para *Time*, la duración por ruta ya existe (`transit_days`) pero no se evalúa. *Rubén + Schoenstadt.*

### P1 — Claridad y racionalidad

5. **Bitácora de vuelo con mucha jerga** (~124 palabras por entrada: *Translunar Injection*, *cislunar*, *UFE*, *F1*). Propuesta: reescribir `story_tree.json` en lenguaje simple (≤40 palabras) y mostrar el efecto de cada opción como íconos (+combustible, −batería…). *Schoenstadt.*
6. **Reporte con jerga** (*UFE*, *F1*, *DSN*, *dB*, *4 node decision tree*). Propuesta: glosario emergente o sustituir por *reserva*, *calidad científica*, *señal*. *Leonardo.*
7. **La IA del piloto elige motor Hall (Isp 1600 s) con energía de celda de combustible** sin revisar la potencia. Propuesta: regla de margen de potencia (`generación − instrumentos − motor`) en backend y en `randomizer.py`. *Schoenstadt.*
8. **Rol 3A calcula el propelente con una masa seca estimada (620 kg)**, no con la real de la nave; una nave más pesada queda corta de combustible. *Abraham.*
9. **El costo de los instrumentos no entra al presupuesto** y en Artemis la reserva casi no afecta las compuertas. *Rubén.*
10. **El Nodo 1 se reevalúa con el estado después del vuelo** (respuestas de vuelo cambian un despegue ya ocurrido). Propuesta: `launch_snapshot`. *Rubén.*

### P2 — Pulido y despliegue

11. `herramientas/jugar.mjs` imprime la IP de un adaptador virtual (192.168.56.1); usar la de la ruta por defecto (como ya hace `/health`). *Rubén.*
12. El id del invitado se resuelve por apodo: dos jugadores con el mismo apodo pueden confundirse. Propuesta: que `unirse_sala` devuelva `player_id`. *Rubén.*
13. En pestañas en segundo plano las animaciones de transición se pausan (comportamiento del navegador); probar en teléfonos reales antes de la demo.
14. Datos por validar con fuente: costo de MSR ($2.5B vs estimaciones de NASA), pérdida de señal real Tierra–Luna/Marte, potencia real de un MMRTG (~110 W).
15. El puntaje (811/1000 con éxito total) necesita una explicación visible de qué faltó para 1000.
16. El sprite `sign-radiation` tiene texto en español con errata (*RADIACION ADVERTION*): no usarlo en la UI en inglés.

## 5. Siguiente paso recomendado

1. Resolver **P0-1 (dificultad)** y **P0-2 (pronóstico “no decidido”)**: son los que más cambian la experiencia del jurado.
2. Conseguir las cifras con fuente de **P0-3/P0-4** y activarlas en backend.
3. Reescribir textos de vuelo (**P1-5**) y luego preparar el pull request a `main` y el despliegue.
