# 16 · Glosario

**Qué contiene:** definición rápida y sencilla de los términos de ingeniería espacial, espectroscopía y desarrollo web usados en este proyecto.  
**Dueño:** Abraham  
**Última actualización:** 2026-11-14 (23:50 h)

| Término | Significado en este proyecto |
|---|---|
| **1 Toma (One-Shot)** | Modalidad de los minijuegos de 30 s: no hay botón de deshacer tras confirmar o al agotarse el reloj, obligando al equipo a asumir consecuencias reales. |
| **Árbol de 4 Nodos** | Evaluador determinista (`decision_tree.py`) que revisa secuencialmente: Nodo 1 Lanzamiento $\rightarrow$ Nodo 2 Propulsión/$\Delta v$ $\rightarrow$ Nodo 3 Escudo/Evento $\rightarrow$ Nodo 4 Ciencia/DSN. |
| **`cargar_espectro_csv` (`datos_reales/`)** | Cargador ligero en Python puro (`csv` + `numpy`) que convierte archivos experimentales reales (`%T`, `Absorbancia`, `Intensidad`, `Reflectancia`) en objetos `Vector` listos para los minijuegos. |
| **Centro de Gravedad (CG)** | Punto de equilibrio de masa de la nave. Si queda fuera de tolerancia ($d_{\text{CG}} > R_{\text{tol}}$), dispara `fuel_burn_multiplier = 1.5x` y desestabiliza la antena DSN. |
| **CML 4 (Concept Maturity Level 4)** | Nivel de madurez conceptual de NASA/JPL donde se exige un margen de crecimiento de masa (*Mass Growth Allowance*) $\ge 35\%$. |
| **Concurrencia en vivo (`mutacion_en_vivo`)** | Mecanismo por Socket.IO donde cada decisión tomada en una estación modifica al instante las barras y restricciones físicas de los compañeros en paralelo. |
| **Conjunción solar** | Alineación donde el Sol se interpone entre la Tierra y Marte (cada $\sim 26\text{ meses}$), bloqueando comandos y bajando el enlace a $0\text{ Mbps}$. |
| **Constraint-Aware Clamping** | Técnica de `randomizer.py` para que los roles controlados por IA tomen decisiones realistas sin sabotear absurdamente la masa o presupuesto de los jugadores humanos. |
| **Deconvolución (`AnalizadorFTIR`)** | Separación matemática de bandas espectrales superpuestas (usada en `bioespectro` para detectar biofirmas en Marte). |
| **Delta-v ($\Delta v$)** | Cambio total de velocidad necesario para ejecutar maniobras orbitales, calculado con la ecuación de Tsiolkovsky. |
| **`/dev-sandbox`** | Ruta local de React creada por Leonardo para que Ismael y Abraham prueben cada minijuego aislado con datos falsos antes de integrarlo al Lobby. |
| **DSN (Deep Space Network)** | Red de antenas gigantes de la NASA en Tierra; exige margen de enlace $\ge +3.0\text{ dB}$ para descargar datos de misiones profundas. |
| **DTMF** | Pares de frecuencias telefónicas usadas en el minijuego *Espectro Hacker* (`Rol4B`) para desbloquear la portadora del enlace DSN. |
| **FSPL (Free Space Path Loss)** | Pérdida de potencia de la señal de radio por distancia en espacio libre (en $\text{dB}$); crece al subir de LEO a GEO o al espacio profundo. |
| **$F$ (`funding_factor_F`)** | Factor de financiamiento I+D ($0.0$ a $1.0$) fijado por el Rol 1A que controla la probabilidad de aparición de Celdas de Combustible $\text{H}_2$ en el minijuego 3D del Rol 3B. |
| **$F_1$ Espectral (`puntaje.emparejar`)** | Métrica armónica de precisión y recall ($0.0$ a $1.0$) con la que el servidor califica la calibración científica del Rol 4A. |
| **`HostScreen` y `PlayerPad`** | Vistas de React en modo multijugador: `HostScreen` muestra el tablero común/proyector; `PlayerPad` es el control individual de cada jugador en su móvil o laptop. |
| **Impulso Específico ($I_{sp}$)** | Eficiencia del motor en segundos: Hidracina ($225\text{ s}$), Bipropelente ($315\text{ s}$), Efecto Hall ($1,600\text{ s}$). |
| **Masa húmeda ($m_{\text{wet}}$)** | Masa seca del bus + masa de instrumentos + masa de propelente. Debe caber dentro de la capacidad máxima del cohete seleccionado. |
| **`MinigameProps`** | Contrato TypeScript en `frontend/src/types/game.ts` que todos los minijuegos implementan para conectarse como piezas intercambiables. |
| **Paper Mario × Among Us** | Estilo visual del juego: tripulantes espaciales adorables con acabado de cartulina recortada 2.5D (doble contorno blanco/negro, sombra sólida, animación de papel). |
| **Pista Lineal (`LinearStationTrack`)** | Recorrido automático en línea recta entre Estación 1 y Estación 2, reemplazando la caminata libre en mapa. |
| **`Plantilla.puede` (Flujo FTIR)** | Regla educativa en `backend/logica/proyecto.py` que enseña el orden correcto (*Baseline $\rightarrow$ Region $\rightarrow$ Modelo*), devolviendo aviso y penalización leve ($-3\text{ pts}$) sin detener la partida. |
| **Rideshare** | Vuelo espacial compartido (SpaceX *Transporter/Bandwagon* v11) cobrado por masa/placa para cargas ligeras ($\le 831\text{ kg}$). |
| **RTG ($\text{Pu-238}$)** | Generador termoeléctrico por radioisótopos; genera energía constante independiente de la luz solar o tormentas de polvo marcianas. |
| **`Rubberband` (Línea Base)** | Estimador de línea base por envolvente convexa inferior que elimina la deriva instrumental antes de recortar o deconvolucionar bandas. |
| **`Tracker` ($d^2y/dx^2$ + MAD)** | Detector automático en `AnalizadorFTIR` que identifica picos estrechos no físicos (fallos de sensor o rayos cósmicos) usando la segunda derivada y desviación mediana absoluta. |
| **UFE (Unallocated Future Expenses)** | Reserva presupuestaria de contingencia exigida por NASA (NPR 7120.5: $\ge 25\%\text{–}30\%$) para no cancelar la misión ante imprevistos. |
| **`Vector` Espectral** | Clase núcleo en `backend/logica/vector.py` que almacena ejes `(x, y)`, unidades (`cm-1`, `nm`, `Hz`), variable física, derivadas y serialización $\le 500$ puntos preservando picos. |
| **Voigt / Pseudo-Voigt** | Perfiles analíticos de banda que combinan ensanchamiento gaussiano (térmico/instrumental) y lorentziano (colisional/natural) para separar picos superpuestos. |
| **Vuelo de 60 Segundos (`Flight60sView`)** | Fase animada posterior a las estaciones donde la nave viaja por el espacio mientras se disparan 4 rondas de 15 s de preguntas/crisis por turnos (`story_tree.json`). |
