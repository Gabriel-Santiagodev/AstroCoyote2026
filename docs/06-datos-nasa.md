# 06 · Datos de la NASA, Física y Catálogo 2026

**Qué contiene:** todas las constantes físicas verificadas, ecuaciones orbitales y termodinámicas, catálogo de misiones, cohetes, instrumentos y espectros, con sus fuentes reales y su estado de verificación.  
**Dueño:** Abraham *(en coordinación con Schoenstadt para el árbol causal)*  
**Última actualización:** 2026-11-14 (15:00 h)

**Regla sagrada:** Prohibido inventar números dentro del código. Todos los valores parametrizables viven en `frontend/src/data/nasa_catalog.json` y `backend/models/subsystems.py`, y cada registro incluye su campo `"fuente"`.

---

## Estados de verificación

| Estado | Significado | ¿Se usa en el juego? |
|---|---|---|
| **verificado** | Comprobado directamente en documentación de NASA, JPL, IAU/WGS84 o ficha oficial del fabricante | Sí |
| **fuente secundaria** | Proviene de referencias técnicas secundarias (ej. SMAD citado en OER, Wikipedia, NextSpaceflight, Astronautix) | Sí (anotando la cita) |
| **estimado del juego** | Constante de balanceo lúdico derivada de guías reales (ej. presupuesto de partida o tolerancia de CG por dificultad) | Sí, marcándolo explícitamente como balance de juego |
| **sin verificar** | Pendiente de confirmación final | No usar en texto de reporte final sin confirmar antes de H18 |

---

## 1. Constantes físicas y orbitales (WGS84 / IAU)

| Constante | Símbolo | Valor | Unidad | Estado | Fuente |
|---|---|---|---|---|---|
| Parámetro gravitacional terrestre | $\mu$ | $398,600.4418$ | $\text{km}^3/\text{s}^2$ | verificado | NIMA / WGS84 (TR8350.2) |
| Radio ecuatorial terrestre | $R_E$ | $6,378.137$ | $\text{km}$ | verificado | WGS84 |
| Factor de achatamiento terrestre | $J_2$ | $1.08262668 \times 10^{-3}$ | — | verificado | WGS84 |
| Precesión nodal heliosíncrona | $\dot{\Omega}_{\text{SSO}}$ | $\frac{2\pi}{365.2421897 \times 86,400} \approx 0.9856$ | $^\circ/\text{día}$ | verificado | Mecánica Orbital IAU |
| Gravedad estándar | $g_0$ | $9.80665$ | $\text{m/s}^2$ | verificado | CODATA / NIST |

---

## 2. Ecuaciones autoritativas del motor (`backend/physics_engine.py`)

Con radio orbital $r = R_E + h$ (en $\text{km}$):

1. **Velocidad y Periodo Orbital Circular:**
   $$v = \sqrt{\frac{\mu}{r}}, \qquad T = 2\pi\sqrt{\frac{r^3}{\mu}}$$
2. **Fracción y Duración Máxima de Eclipse (sombra cilíndrica, $\beta = 0$):**
   $$\rho = \arcsin\left(\frac{R_E}{r}\right), \qquad f_{\text{ecl}} = \frac{\rho}{\pi}, \qquad T_{\text{ecl, min}} = f_{\text{ecl}} \cdot T_{\text{min}}$$
3. **Inclinación Heliosíncrona (SSO) con movimiento medio $n = \sqrt{\mu / r^3}$:**
   $$\cos(i) = \frac{-2\,\dot{\Omega}_{\text{SSO}}\, r^2}{3\, n\, J_2\, R_E^2} \qquad (\text{válida si } -1 \le \cos(i) \le 1)$$
4. **Cobertura Terrestre y Distancia Oblicua (*Slant Range* $d$ a elevación mínima $\epsilon = 10^\circ$):**
   $$\eta = \arcsin\left(\frac{R_E}{r}\cos(\epsilon)\right), \qquad \lambda_{\text{cov}} = \frac{\pi}{2} - \epsilon - \eta, \qquad d = \sqrt{r^2 + R_E^2 - 2\,r\,R_E\cos(\lambda_{\text{cov}})}$$
5. **Pérdida en Espacio Libre (FSPL en $\text{dB}$, con $d_m$ en metros y $f_{\text{Hz}}$ en hercios):**
   $$\text{FSPL (dB)} = 20\log_{10}(d_m) + 20\log_{10}(f_{\text{Hz}}) - 147.55$$
6. **Ecuación de Tsiolkovsky y Masa Húmeda (con multiplicador de desbalanceo de CG $M_{\text{burn}} \in \{1.0, 1.5\}$):**
   $$f_{\text{prop}} = 1 - \exp\left(-\frac{\Delta v \cdot M_{\text{burn}}}{I_{sp}\, g_0}\right), \qquad m_{\text{wet}} = \frac{m_{\text{dry}}}{1 - f_{\text{prop}}}$$
7. **Centro de Gravedad 2D (Rol 2B, *CubeSat 101* Sec. 6.4):**
   $$X_{\text{CG}} = \frac{\sum_{i=1}^{k} m_i x_i}{\sum_{i=1}^{k} m_i}, \qquad Y_{\text{CG}} = \frac{\sum_{i=1}^{k} m_i y_i}{\sum_{i=1}^{k} m_i}, \qquad d_{\text{CG}} = \sqrt{X_{\text{CG}}^2 + Y_{\text{CG}}^2}$$
8. **Reserva UFE y Margen JPL CML 4:**
   - **Reserva UFE (NPR 7120.5):** recomendada $\ge 25\%\text{–}30\%$ en fases tempranas (PDR) para evitar un *Nunn-McCurdy Breach* ante imprevistos.
   - **Margen de Crecimiento de Masa JPL CML 4:** $\ge 35\%$ recomendado en diseño preliminar.

---

## 3. Tabla precalculada de órbitas (referencia y tests unitarios)

| Altitud $h$ ($\text{km}$) | Velocidad ($\text{km/s}$) | Periodo ($\text{min}$) | Eclipse Máx ($\text{min}$) | Fracción Eclipse ($\%$) | Inclinación SSO ($^\circ$) | Semiancho a $10^\circ$ ($^\circ$) | Distancia Oblicua ($\text{km}$) | FSPL Banda S $2.2\text{ GHz}$ ($\text{dB}$) | FSPL Banda X $8.2\text{ GHz}$ ($\text{dB}$) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| $350$ (LEO) | $7.697$ | $91.54$ | $36.33$ | $39.7\%$ | $96.85^\circ$ | $11.00^\circ$ | $1,303.6$ | $161.6$ | $173.0$ |
| $420$ (ISS) | $7.657$ | $92.97$ | $36.03$ | $38.8\%$ | $97.10^\circ$ | $12.49^\circ$ | $1,492.6$ | $162.8$ | $174.2$ |
| $500$ (SSO) | $7.613$ | $94.62$ | $35.75$ | $37.8\%$ | $97.40^\circ$ | $14.05^\circ$ | $1,695.1$ | $163.9$ | $175.3$ |
| $550$ (LEO) | $7.585$ | $95.65$ | $35.61$ | $37.2\%$ | $97.59^\circ$ | $14.96^\circ$ | $1,815.7$ | $164.5$ | $175.9$ |
| $700$ (SSO) | $7.504$ | $98.77$ | $35.29$ | $35.7\%$ | $98.19^\circ$ | $17.45^\circ$ | $2,155.3$ | $166.0$ | $177.4$ |
| $800$ (SSO) | $7.452$ | $100.87$ | $35.13$ | $34.8\%$ | $98.60^\circ$ | $18.95^\circ$ | $2,366.9$ | $166.8$ | $178.2$ |
| $2,000$ (LEO) | $6.898$ | $127.20$ | $35.03$ | $27.5\%$ | $104.89^\circ$ | $31.43^\circ$ | $4,436.7$ | $172.2$ | $183.7$ |
| $20,200$ (MEO) | $3.873$ | $718.70$ | $55.44$ | $7.7\%$ | N/A | $66.33^\circ$ | $24,717.7$ | $187.2$ | $198.6$ |
| $35,786$ (GEO) | $3.075$ | $1,436.07$ | $69.41$ | $4.8\%$ | N/A | $71.43^\circ$ | $40,586.1$ | $191.5$ | $202.9$ |

---

## 4. Catálogo de vehículos de lanzamiento y propulsión (2026)

### Lanzadores dedicados
| Vehículo | Capacidad de carga | Costo estimado (USD) | Cofia | Estado | Fuente |
|---|---|---|---|---|---|
| **Electron** (Rocket Lab) | $300\text{ kg}$ LEO / $200\text{ kg}$ SSO | $\sim \$9.2\text{M}$ | $1.2\text{ m}$ | fuente secundaria | Guía de servicio Rocket Lab / NextSpaceflight |
| **Falcon 9 Block 5** (SpaceX) | $22,800\text{ kg}$ LEO des. / $17,500\text{ kg}$ rec. / $5,500\text{ kg}$ GTO / $4,020\text{ kg}$ Marte | $\$74\text{M}$ | $5.2\text{ m} \times 13.1\text{ m}$ | verificado / fuente secundaria | SpaceX Vehicles / NextSpaceflight |
| **Vulcan Centaur VC6** (ULA) | $27,200\text{ kg}$ LEO / $14,400\text{ kg}$ GTO | $\sim \$120\text{M}$ | $5.4\text{ m}$ | fuente secundaria | ULA / NextSpaceflight |
| **Falcon Heavy** (SpaceX) | $63,800\text{ kg}$ LEO / $16,800\text{ kg}$ Marte | $\$97\text{M–}\$150\text{M}$ | $5.2\text{ m}$ | fuente secundaria | SpaceX / Wikipedia |

### Modalidad Rideshare (SpaceX *Transporter / Bandwagon* Guía v11 — 2026)
- Tarifa base 2026: $\$7,000\text{ USD/kg}$ (tope físico $831\text{ kg}$ por puerto).
- Placas: *Quarter* ($50\text{–}300\text{ kg}$, base $\$350\text{k}$), *Half* ($100\text{–}452\text{ kg}$, base $\$700\text{k}$), *Full* ($200\text{–}831\text{ kg}$, base $\$1.4\text{M}$), *XL* ($300\text{–}831\text{ kg}$, base $\$2.1\text{M}$).
- Separadores opcionales: $\$370,500\text{ a }\$692,600\text{ USD}$; multiplicador realista de integración: $1.5\times\text{ a }2.0\times$. *(Fuente secundaria: SpaceX Rideshare Payload User's Guide v11).*

### Motores / Propulsión a bordo y fuentes de energía
- **Hidracina Monopropelente:** $I_{sp} = 225\text{ s}$ (económico, exige $\sim 55.8\%$ de masa de propelente para $\Delta v = 1,800\text{ m/s}$).
- **Bipropelente $\text{MMH}/\text{NTO}$:** $I_{sp} = 315\text{ s}$ ($\sim 44.2\%$ de propelente para $\Delta v = 1,800\text{ m/s}$).
- **Propulsión Eléctrica de Efecto Hall:** $I_{sp} = 1,600\text{ s}$ ($\sim 10.8\%\text{–}10.9\%$ de propelente, demanda alta potencia eléctrica en W).
- **Generador RTG $\text{Pu-238}$:** Vida media $87.7\text{ años}$, conversión termoeléctrica por efecto Seebeck (independiente de luz solar/tormentas de polvo).
- **Paquetes energéticos (`Rol3B_AstroLogistics3D`):**
  - *Propulsión Química:* $+15\text{ MJ}$, $+8\%$ velocidad rover.
  - *Baterías Electroquímicas:* $+45\text{ MJ}$, $-14\%$ velocidad rover (efic. $80\text{–}90\%$, baja densidad energética).
  - *Celdas de Combustible $\text{H}_2$:* $+100\text{ MJ}$, $-4\%$ velocidad rover (no limitadas por ciclo de Carnot).

---

## 5. Nave de referencia MRO, instrumentos y las 3 Misiones NASA

### Mars Reconnaissance Orbiter (MRO) e instrumentos
| Dato / Instrumento | Valor clave | Estado | Fuente |
|---|---|---|---|
| **MRO Masa lanzamiento / combustible** | $2,180\text{ kg}$ / $1,149\text{ kg}$ ($>52\%$ propelente) | fuente secundaria | Astronautix / NASA |
| **Antena HGA y enlace DSN** | $3\text{ m}$, $0.5\text{–}6.0\text{ Mbps}$, margen $\ge +3.0\text{ dB}$, memoria $160\text{ Gbit}$ | verificado / fuente secundaria | JPL DESCANSO (`MRO_092106.pdf`) |
| **Retraso señal Tierra–Marte / Conjunción** | $4\text{–}25\text{ min}$ / cada $\sim 26\text{ meses}$ ($\sim 2\text{ semanas}$ sin comandos) | fuente secundaria / verificado NASA | arXiv 2211.14245 / science.nasa.gov |
| **Luz solar en Marte** | $\sim 590\text{ W/m}^2$ ($\approx 43\%$ de la Tierra) | fuente secundaria | NASA Mars Fact Sheet (NSSDCA) |
| **HiRISE** | $64.2\text{–}65\text{ kg}$, $60\text{ W}$, $0.3\text{ m/píxel}$, altísimo volumen de datos | sin verificar (confirmar NSSDCA) | NASA MRO Science |
| **CTX** | $3\text{ kg}$, $7\text{ W}$ ($5\text{ W}$ reposo), fotos $6\text{ m/píxel}$ | sin verificar | NASA MRO Science |
| **CRISM** | $32\text{–}33\text{ kg}$, espectrómetro mineralógico | sin verificar | NASA MRO Science |
| **MARCI** | $0.481\text{ kg}$, cámara climática diaria | sin verificar | NASA MRO Science |
| **MCS** | $9\text{ kg}$, $11\text{ W}$, temperatura y polvo atmosférico | sin verificar | NASA MRO Science |
| **SHARAD** | Radar subsuperficial (hielo), $40\text{–}90\text{ Gbit/día}$ | sin verificar | NASA MRO Science |

*(Nota para Abraham — tarea `ABR-01`: confirmar masas/potencias exactas de HiRISE, CRISM, MARCI, SHARAD y fijar costos de balance de juego en `nasa_catalog.json` antes de H6).*

### Parámetros de las 3 Misiones del juego
| Parámetro | M1 (Fácil): *Artemis Moon* | M2 (Media): *Asteroid Hunter* | M3 (Difícil): *Mars Sample Return (MSR/MRO)* |
|---|---|---|---|
| **Inspiración real NASA** | *Artemis I / II*, cápsula *Orion*, reentrada $40,000\text{ km/h}$ | *OSIRIS-REx* (Bennu), *DART*, *NEAR Shoemaker* | *Mars Sample Return*, *Perseverance*, *MRO* |
| **Presupuesto (`budget_limit_usd`)** | $\$800\text{M USD}$ *(estimado juego)* | $\$1,200\text{M USD}$ *(estimado juego)* | $\$2,500\text{M USD}$ *(estimado juego)* |
| **Meta UFE recomendada** | $\ge 20\%$ | $\ge 25\%$ | $\ge 25\text{–}30\%$ |
| **Tolerancia CG ($R_{\text{tol}}$)** | $0.25\text{ m}$ | $0.15\text{ m}$ | $0.08\text{ m}$ (margen JPL CML 4 $\ge 35\%$) |
| **Dilema Rol 3A (Órbita/Ruta)** | *Ruta Directa (3 días)* vs. *Retorno Libre (10 días, $-400\text{ kg}$ prop.)* | *Flyby rápido (15 min)* vs. *Inserción Orbital* | *MAV 30 tubos* vs. *MAV 15 tubos ($-150\text{ kg}$, permite RTG)* |
| **Evento Fase 60 s (Nodo 3)** | Tormenta Solar Cislunar ($\ge 15\%$ batería) | Nube de Polvo/Micro-rocas (*Autonomía Visual* + UFE) | Tormenta de Polvo Marciana + fallo de brazo (RTG + UFE $\ge 20\%$) |

---

## 6. Datos espectrales de referencia (`juegos_espectrales/`)

- **Líneas estelares de Balmer / Dobletes:** $\text{H}\alpha = 656.3\text{ nm}$, $\text{H}\beta = 486.1\text{ nm}$, $\text{Na} = 589.0\text{ nm}$, $\text{Ca II} = 393.4\text{ nm}$; Ley de Wien $T = \frac{2.898 \times 10^6\text{ nm}\cdot\text{K}}{\lambda_{\max}}$. *(Fuente verificada: NIST Atomic Spectra Database).*
- **Bandas FTIR de minerales/biofirmas:** $\text{Si–O–Si} \approx 1,050\text{ cm}^{-1}$, $\text{O–H} = 3,200\text{–}3,550\text{ cm}^{-1}$, $\text{C=O} \approx 1,700\text{ cm}^{-1}$, Amida I ($1,600\text{–}1,700\text{ cm}^{-1}$: Hoja $\beta$ $1,610\text{–}1,640\text{ cm}^{-1}$, Hélice $\alpha$ $1,650\text{–}1,658\text{ cm}^{-1}$).
- **Índices multiespectrales:** $\text{NDVI} = \frac{\text{NIR}-\text{Rojo}}{\text{NIR}+\text{Rojo}}$, $\text{NDWI} = \frac{\text{Verde}-\text{NIR}}{\text{Verde}+\text{NIR}}$, $\text{NBR} = \frac{\text{NIR}-\text{SWIR}}{\text{NIR}+\text{SWIR}}$.
- **Matriz DTMF (*Espectro Hacker*):** Filas $\{697, 770, 852, 941\}\text{ Hz}$ $\times$ Columnas $\{1209, 1336, 1477, 1633\}\text{ Hz}$. *(Estándar ITU-T Q.23).*

---

## 7. Estructura JSON obligatoria (`frontend/src/data/nasa_catalog.json`)

```json
{
  "instruments": [
    {
      "id": "hirise",
      "name": "HiRISE Camera",
      "mass_kg": 65.0,
      "power_w": 60.0,
      "data_gbit_day": 90.0,
      "cost_musd": 40.0,
      "science_value": 45.0,
      "fuente": "https://science.nasa.gov/mission/mars-reconnaissance-orbiter/",
      "estado": "verificar masa exacta"
    }
  ]
}
```
