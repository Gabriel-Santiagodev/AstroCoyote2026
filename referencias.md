# Referencias y Declaración de Recursos Externos — Space Apps 2026

> **Dueño:** Rubén (todos los integrantes agregan sus fuentes desde la hora 1 — Tarea `ENT-01`)  
> Todo dato científico, librería, fuente tipográfica, sonido o recurso externo usado en el proyecto debe quedar registrado aquí para la página de entrega.

## 1. Fuentes Oficiales de la NASA y Estándares Científicos
- **NASA Mars Reconnaissance Orbiter (MRO):** https://science.nasa.gov/mission/mars-reconnaissance-orbiter/
- **MRO HiRISE & CRISM Instrument Pages:** https://www.uahirise.org/ | https://crism.jhuapl.edu/
- **NASA Lunar Reconnaissance Orbiter (LRO):** https://science.nasa.gov/mission/lro/
- **NASA JPL DESCANSO — MRO Telecommunications:** https://descanso.jpl.nasa.gov/DPSummary/MRO_092106.pdf
- **NASA Artemis Program:** https://www.nasa.gov/humans-in-space/artemis/
- **NASA OSIRIS-REx Mission:** https://science.nasa.gov/mission/osiris-rex/
- **NASA Mars Sample Return:** https://science.nasa.gov/mission/mars-sample-return/
- **NASA Cost Estimating Handbook / NPR 7120.5 (UFE):** https://nodis3.gsfc.nasa.gov/
- **NASA CubeSat 101 (CSLI):** https://www.nasa.gov/wp-content/uploads/2017/03/nasa_csli_cubesat_101_508.pdf
- **NASA General Mission Analysis Tool (GMAT) & Concept Maturity Levels (CMLs):** Recursos oficiales del reto Space Apps 2026
- **NIMA / WGS84 World Geodetic System (TR8350.2)**
- **NIST Atomic Spectra Database (Líneas de Balmer y constantes físicas)**
- **ITU-T Recommendation Q.23:** Estándar internacional de pares de frecuencias DTMF (usado en *Espectro Hacker*, `Rol4B`).
- **Optical Dispersion Reference (Cauchy Equation):** Coeficientes ópticos estándar para sílice fundida, BK7 y zafiro (*Misión Fotón*).

## 2. Librerías Open Source
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Framer Motion, Three.js, Socket.IO Client, Lucide React, tsParticles, canvas-confetti.
- **Backend:** Python, FastAPI, Uvicorn, python-socketio, Pydantic, NumPy, SciPy, Pytest.

## 3. Tipografía y Audio
- **Tipografías (Google Fonts / SIL Open Font License):** `Space Grotesk`, `IBM Plex Mono`, `IBM Plex Sans`.
- **Audio (si se agrega en Extras):** *Agregar enlaces CC0 aquí.*

## 4. Declaración de Uso de IA (AI Use)
- **Asistencia en desarrollo y documentación (`ABR-01` a `ABR-06`):** Se utilizó apoyo de agente de IA (Antigravity) para adaptar el motor analítico FTIR heredado (`backend/logica/` + `backend/juegos_espectrales/`) y redactar los componentes React (`Rol3A`, `Rol4A`, `Rol4B`, `Rol3B`). Todas las constantes físicas, contratos `MinigameProps`, cálculos orbitales/espectrales y compilación fueron revisados y validados por el equipo mediante `pytest` y `tsc && vite build`.

## 5. Arte generado con IA (sprites, fondo y animaciones)
- **Hojas de arte fuente (IA):** 9 hojas de sprites generadas con IA y aportadas por el equipo (equipo, vehículos, astronautas, nave, partes de rover, fondo de nebulosa, planetas, terreno, cohetes/cápsulas). Copias en `herramientas/arte/fuentes/`.
- **Procesamiento:** `herramientas/arte/procesar_arte.py` (+ `segmentar.py`; Python, Pillow, NumPy, SciPy) recorta los sprites (fondo negro → alfa, componentes conexos), genera el fondo `bg/nebula*.webp`, la animación `anim/loading-loop.webp`, la tira procedural `anim/thruster-flame.webp` y `anim/astronaut-float.webp` en `frontend/public/assets/art/`, y escribe `frontend/src/data/artManifest.ts`.
- **Marca de agua:** el fondo de nebulosa y la animación de carga llevan la leyenda visible "AI-generated art"; la UI del juego muestra una etiqueta global de arte generado con IA para los sprites.
- **Exclusiones (regla de AGENTS.md: nunca usar el logo de la NASA):** no se recortan el cohete grande con el logotipo "NASA", la torreta con el emblema "meatball" ni los astronautas con parches de bandera/agencia de la hoja de cohetes; se usan los astronautas genéricos de la hoja de vehículos. La cruz roja del botiquín blanco se recoloreó a verde (emblema protegido).
