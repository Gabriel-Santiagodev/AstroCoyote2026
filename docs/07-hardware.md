# 07 · Arquitectura de Pantallas y Dispositivos (Sustituye Hardware Físico)

**Qué contiene:** explicación del pivote que elimina el hardware arcade y define cómo operan las pantallas en navegador para *Singleplayer* y *Multiplayer*.  
**Dueños:** Rubén, Leonardo  
**Última actualización:** 2026-11-14 (15:00 h)

## Decisión vigente (`[DECIDIDO]` 14 nov, 15:00 h)

**Ya no hay hardware físico.** No construimos consola arcade, ni programamos Arduino/ESP32, ni dependemos de puertos USB o cables. Todo el videojuego corre **100 % en navegador web** sobre **React + TypeScript + Vite** conectado a **FastAPI + Socket.IO**.

---

## Cómo se visualiza y juega en cada modo

El sistema soporta dos experiencias fluidas compartiendo exactamente los mismos componentes de minijuegos (`MinigameShell`):

### 1. Modo Singleplayer (1 Jugador en una pantalla)
- Todo ocurre en **una sola pestaña de navegador** (laptop o móvil).
- La pantalla superior muestra la **Pista Lineal de Estaciones (`LinearStationTrack`)** y las barras compartidas de la misión en vivo (Masa, Presupuesto, Energía, Datos, UFE).
- El jugador elige **1 o 2 roles** y juega sus estaciones mientras el motor `randomizer.py` resuelve en paralelo los roles restantes y envía las mutaciones de cadena al HUD.
- Luego pasa directo a la vista de **Vuelo de 60 Segundos (`Flight60sView`)** y al **Reporte NASA (`MissionReportDashboard`)**.

### 2. Modo Multiplayer (2 a 4 Jugadores en red local o web)
Inspirado en **Among Us + Kahoot**, ofrece dos tipos de vista sincronizadas por código PIN:

| Vista | En qué dispositivo corre | Qué muestra |
|---|---|---|
| **`HostScreen`** *(Opcional para proyector/laptop líder o vista compartida)* | Laptop principal (proyectada ante jueces o equipo) | Muestra el **Lobby PIN**, los avatares *Paper Mario × Among Us* avanzando juntos por la **Pista Lineal de Estaciones**, el semáforo global de recursos en tiempo real, el cohete en el **Vuelo de 60 segundos**, de quién es el turno actual de respuesta y el **Podio / Reporte NASA final**. |
| **`PlayerPad`** *(Cada jugador en su laptop o celular)* | Celular o laptop de cada integrante | Ingresa el PIN y elige rol; camina por su pista lineal y abre su **minijuego de 30 s** (Estación 1 y Estación 2); muestra alertas en vivo cuando un compañero altera sus límites (`"¡Órbita elevó FSPL a 191.5 dB!"`); en el **Vuelo de 60 s** activa los botones táctiles de decisión cuando llega su turno. |

> **Nota práctica para demo con jueces (`[PROPUESTA]`):** Si un jugador se conecta en solitario o desde 4 laptops sin proyector aparte, cada jugador ve en su propia pantalla un HUD compacto superior con el estado compartido del equipo, por lo que **`HostScreen` no bloquea la partida si alguien entra directo desde dispositivos personales**.

---

## Requisitos de compatibilidad en navegador

- **Resolución mínima soportada en `PlayerPad`:** `360 × 640 px` (celular vertical) hasta `1920 × 1080 px` (escritorio).
- **Resolución recomendada en `HostScreen`:** `1280 × 720 px` o `1920 × 1080 px` (16:9).
- **Cero instalación nativa:** Funciona en Chrome, Edge, Safari móvil y Firefox sin plugins.
- **Conexión en red local / LAN:**
  - Frontend dev con `vite --host` en puerto `5173`.
  - Backend FastAPI + Socket.IO en `0.0.0.0:8000`.
  - En producción pública (para jueces globales), ver **`[ABIERTO A10]`** en `03-decisiones.md`.
