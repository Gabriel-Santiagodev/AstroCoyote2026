# 19 · Roadmap Paso a Paso: Abraham (Datos NASA, Motor Espectral y Minijuegos de Ciencia, Órbita, DSN y Energía 3D)

**Tu misión en estas 24 horas:** Mantener la **validez científica NASA** (criterio global de evaluación), adaptar el **motor analítico espectral** heredado (`logica/` + `juegos_espectrales/`) y construir los **4 minijuegos científicos, orbitales, de comunicaciones DSN y de logística energética 3D**.  
**Estado actual (`2026-11-14 23:50 h`):** `[x] ABR-01`, `[x] ABR-02`, `[x] ABR-03`, `[x] ABR-04`, `[x] ABR-05` y `[x] ABR-06` implementados y verificados con `pytest` y `tsc && vite build`.

---

## Árbol exacto de carpetas y archivos donde trabajas

Todos estos archivos ya existen implementados en el repositorio:

```text
space-apps-juego/
├── backend/
│   ├── models/
│   │   └── subsystems.py                    # TUYO: Catálogo tipado sincronizado con nasa_catalog.json (ABR-01)
│   ├── logica/                              # TUYO: Motor analítico FTIR adaptado a web sin GUI/pandas (ABR-02)
│   │   ├── __init__.py
│   │   ├── vector.py                        # Vector (Absorbancia/%T/Intensidad/Reflectancia, unidades cm-1/nm/Hz, <=500 pts)
│   │   ├── Analizador.py                    # AnalizadorFTIR (lineaBase, Recortar, Tracker d2y/dx2, Deconvolucion segura)
│   │   ├── proyecto.py                      # Plantilla.puede (-3 pts), Muestra, Proyecto y cargar_espectro_csv
│   │   ├── lineaBase/
│   │   │   ├── __init__.py
│   │   │   └── modeloLineaBase.py           # rubberband, splines, lineal, escalar
│   │   └── modelos/
│   │       ├── __init__.py
│   │       ├── model.py                     # Registro Models (gauss_amp, guassiano/gaussiano, lorentz, voigt, psd_voigt1/2)
│   │       ├── simulacion.py                # Métricas MAE/MSE/RMSE/R2 y simulador de bandas sintéticas
│   │       └── Modelo_*.py                  # Implementaciones puras NumPy/SciPy
│   └── juegos_espectrales/                  # TUYO: Generadores (8 modos + CSV real), guías y F1 (ABR-02)
│       ├── __init__.py
│       ├── adaptadores_web.py               # generar_reto_oleada1, generar_reto_hacker, generar_reto_juego, ejecutar_accion_espectral, evaluar_marcas
│       └── nucleo/
│           ├── __init__.py
│           ├── generador.py                 # 8 generadores sintéticos + generar_desde_csv_real (soporta datos_reales/<mission_id>.csv)
│           ├── puntaje.py                   # emparejar (Precision/Recall/F1), cosine_similarity y penalización de flujo
│           └── biblioteca.py                # NIST/Wien/FTIR/Cauchy/DTMF + educational_guide en inglés
└── frontend/
    └── src/
        ├── data/
        │   └── nasa_catalog.json            # TUYO: Single Source of Truth de datos NASA (ABR-01)
        └── components/
            └── minigames/
                ├── Rol3A_OrbitalSniper.tsx        # TUYO [x] (H7 · ABR-03)
                ├── Rol4A_SpectralLabTask.tsx      # TUYO [x] (H8 · ABR-04)
                ├── Rol4B_CommsSpectralHacker.tsx  # TUYO [x] (H13 · ABR-05)
                └── Rol3B_AstroLogistics3D.tsx     # TUYO [x] (H14 · ABR-06)
```

---

## Paso 1 · Catálogo Verificado NASA en JSON (`[x] ABR-01` | Meta: H3)

1. Revisa los datos marcados como `sin verificar` en `docs/06-datos-nasa.md` (masas/potencias de HiRISE, CRISM, MARCI, SHARAD y fuentes oficiales en `science.nasa.gov` / NSSDCA).
2. Llena `frontend/src/data/nasa_catalog.json` y su espejo `backend/models/subsystems.py` con:
   - Las **3 Misiones** (`artemis_moon`, `asteroid_hunter`, `mars_sample_return`) con presupuesto, metas científicas, tolerancias de CG y dato NASA real.
   - Los **Lanzadores 2026** (*Electron*, *Falcon 9 Block 5*, *Vulcan Centaur VC6*, *Falcon Heavy*, placas *SpaceX Rideshare v11*).
   - Las **Órbitas y Motores** (LEO/SSO/MEO/GEO + dilemas de ruta + Hidracina $225\text{ s}$, Biprop $315\text{ s}$, Hall $1,600\text{ s}$).
   - Los **Instrumentos científicos reales** (HiRISE, CTX, CRISM, MARCI, MCS, SHARAD, más cámaras/espectrómetros de M1/M2), cada uno con su campo `"fuente"` obligatorio.
3. Comparte inmediatamente este JSON con **Ismael** (`Rol1B` y `Rol2B`) y **Schoenstadt** (`decision_tree.py` y `story_tree.json`).

---

## Paso 2 · Motor Espectral y Adaptadores Web (`[x] ABR-02` | Meta: H5)

Integra el código analítico de espectroscopía (`arquitectura_integral_y_motor_espectral_nasa_space_apps_2026.md` §5) dentro de `backend/logica/` y `backend/juegos_espectrales/`:
1. **Aplica las 4 correcciones críticas para la web:**
   - Extiende `Vector.__init__` para aceptar `variable` $\in \{\text{"Absorbancia"}, \text{"Transmitancia"}, \text{"Intensidad"}, \text{"Reflectancia"}\}$ y `unidadX` $\in \{\text{"cm-1"}, \text{"nm"}, \text{"Hz"}\}$.
   - Convierte `distance` física a número de muestras para `scipy.signal.find_peaks`.
   - Protege `AnalizadorFTIR.Deconvolucion` (`_p0_inicial`) insertando bordes sintéticos si la señal limpia no tiene depresiones intermedias (cero excepciones fatales en vivo).
   - En `Plantilla.puede(paso)`, devuelve `(False, motivo_educativo)` y penaliza $-3\text{ pts}$ sin abortar el juego.
2. **En `backend/juegos_espectrales/adaptadores_web.py`:**
   - Crea `generar_reto_oleada1(mission_id, difficulty)` devolviendo máximo $500$ puntos `(x, y)` serializados en JSON + bandas candidatas de `biblioteca.py`:
     - M1 Luna $\rightarrow$ `cazadores_estrellas` (líneas Balmer/Na/Wien) o `ecoespectro` (NDVI/NDWI).
     - M2 Asteroide $\rightarrow$ `detectives_luz` (bandas FTIR $\text{Si–O–Si}$, $\text{O–H}$, $\text{C=O}$).
     - M3 Marte $\rightarrow$ `bioespectro` (deconvolución Amida I).
   - Crea `generar_reto_hacker(mission_id, difficulty)` para Oleada 2 (tono anómalo + matriz DTMF de `espectro_hacker`).
   - Crea `evaluar_marcas(marcas_usuario, verdad, tolerancia)` llamando a `puntaje.emparejar(...)` para devolver `science_calibration_f1` $\in [0.0, 1.0]$.

   - Expone también `generar_reto_juego(game_id, ...)`, `ejecutar_accion_espectral(...)` y `generar_desde_csv_real(...)` para cubrir los **8 arquetipos** (`cazadores_estrellas`, `detectives_luz`, `ecoespectro`, `laboratorio_musical`, `mision_foton`, `bioespectro`, `ladron_colores`, `espectro_hacker`), guías educativas paso a paso (`educational_guide`) y carga automática de espectros experimentales CSV en `datos_reales/<mission_id>.csv`.

---

## Paso 3 (Prioridad 1 · Meta H7) · `Rol3A_OrbitalSniper.tsx` (`[x] ABR-03` · *Orbital Constraints*)

1. Implementa `MinigameProps` en `/dev-sandbox`.
2. **Parte 1 (0–15 s):** Selector visual de órbita/ruta:
   - M1: *Direct Route (3 days)* vs. *Free-Return Trajectory (10 days, $-400\text{ kg}$ prop.)*
   - M2: *Fast Flyby (15 min)* vs. *Orbital Insertion*
   - M3: *MAV 30 Tubes* vs. *MAV 15 Tubes ($-150\text{ kg}$, allows RTG)* + Altitud de estacionamiento (LEO $350\text{ km}$, SSO $700\text{ km}$, MEO $20,200\text{ km}$, GEO $35,786\text{ km}$).
3. **Parte 2 (15–30 s):** Selector de motor (*Hydrazine* $225\text{ s}$, *MMH/NTO Bipropellant* $315\text{ s}$, *Hall Effect Electric* $1,600\text{ s}$).
4. Muestra en vivo la fracción de propelente (Tsiolkovsky) y la pérdida **FSPL (dB)** que hereda Rol 4B, llamando `onLiveMutation` en cada cambio y `onSubmitTake` al confirmar o llegar a `0 s`.

---

## Paso 4 (Prioridad 1 · Meta H8) · `Rol4A_SpectralLabTask.tsx` (`[x] ABR-04` · *Science + Spectral*)

1. **Parte 1 (0–10 s):** Selector de carga útil desde `nasa_catalog.json` (respetando el techo presupuestario científico `liveMetrics` que fijó Rol 1A) + toggle **Visual Autopilot (Natural Feature Tracking)** vital en M2.
2. **Parte 2 (10–30 s):** Gráfica SVG/Canvas limpia del espectro recibido en `spectralChallenge`. El jugador hace clic/toca sobre los picos característicos (y opcionalmente aplica botón `Clean Baseline` antes de marcar).
3. Envía `selected_instruments` en `onLiveMutation` (para que Ismael en `Rol2B` reciba exactamente esos bloques) y `spectral_marks` en `onSubmitTake`.

---

## Paso 5 (Prioridad 2 · Meta H13) · `Rol4B_CommsSpectralHacker.tsx` (`[x] ABR-05` · *Comms + Data*)

1. **Osciloscopio DSN (0–15 s):** Una retícula objetivo se mueve por deriva orbital; si `!liveMetrics.cg_balanced`, la velocidad de deriva aumenta $1.5\times$ (con alerta visible *"Unbalanced CG causing 1.5x antenna drift!"*). El jugador centra la antena para superar $+3.0\text{ dB}$ compensando `liveMetrics.fspl_loss_db`.
2. **Espectro Hacker + Bitrate (15–30 s):** Muestra la señal de portadora con un tono intruso DTMF; el jugador aplica filtro de línea base y toca el par DTMF anómalo para desbloquear el enlace, luego desliza el *Bitrate* ($0.5\text{–}6.0\text{ Mbps}$) verificando no pasarse de `liveMetrics.available_power_w` ni dejar el búfer de $160\text{ Gbit}$ lleno antes de la Conjunción Solar.

---

## Paso 6 (Prioridad 2 · Meta H14) · `Rol3B_AstroLogistics3D.tsx` (`[x] ABR-06` · *Power 3D*)

1. Escena 3D ligera en **Three.js** (canvas dentro del contenedor de `MinigameShell` con cleanup estricto de `WebGLRenderer` en `useEffect` return para no fugar memoria al salir de la estación).
2. Rover recolector con límite estricto de **$N_{\max} = 3$ paquetes apilados** antes de descargar en el Aro Holográfico Central:
   - *Química* (Naranja): $+15\text{ MJ}$, $+8\%$ vel.
   - *Baterías* (Azul cian): $+45\text{ MJ}$, $-14\%$ vel.
   - *Celdas $\text{H}_2$* (Dorado/Verde): $+100\text{ MJ}$, $-4\%$ vel.
3. **Acoplamiento en vivo:** La probabilidad de aparición (*spawn rate*) de las Celdas $\text{H}_2$ ($5\%$ a $50\%$) se interpola directamente de `liveMetrics.funding_factor_F` que definió el Rol 1A de Ismael.
4. Soporta **WASD / Flechas** en escritorio y un **joystick táctil en pantalla** en celulares.

---

## Prompt listo para usar con tu Agente de IA

```text
Paso 0 (Automático): Antes de empezar, verifica e instala dependencias ejecutando `python -m pip install -r requirements.txt` y `npm --prefix frontend install` si faltan `node_modules` o librerías Python.
Lee AGENTS.md, arquitectura_integral_y_motor_espectral_nasa_space_apps_2026.md (§3, §4, §5, §8), docs/06-datos-nasa.md, docs/10-tecnico.md, docs/22-como-trabajar-y-hacer-merge.md y docs/19-roadmap-abraham.md.
Trabajaremos únicamente en tus archivos asignados en este orden:
1) frontend/src/data/nasa_catalog.json + backend/models/subsystems.py (todos los datos NASA verificados con "fuente").
2) backend/logica/* y backend/juegos_espectrales/* (con las 4 protecciones para no lanzar excepciones en gameplay de 30s y serializar <= 500 puntos por espectro en adaptadores_web.py).
3) Los 4 componentes React en frontend/src/components/minigames/: Rol3A_OrbitalSniper.tsx, Rol4A_SpectralLabTask.tsx, Rol4B_CommsSpectralHacker.tsx y Rol3B_AstroLogistics3D.tsx.
Reglas: todos los minijuegos implementan exactamente MinigameProps de frontend/src/types/game.ts, usan estética .paper-card / .paper-btn (Paper Mario x Among Us), textos en inglés, soporte táctil + escritorio, y llaman a onLiveMutation y onSubmitTake exactamente como pide docs/10-tecnico.md.
```
