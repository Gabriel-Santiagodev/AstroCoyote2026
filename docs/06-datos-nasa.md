# 06 · Datos de la NASA, Física y Catálogo 2026

**Qué contiene:** todas las constantes físicas verificadas, ecuaciones orbitales y termodinámicas, catálogo de misiones, cohetes, instrumentos y espectros, con sus fuentes reales y su estado de verificación.  
**Dueño:** Abraham *(en coordinación con Schoenstadt para el árbol causal)*  
**Última actualización:** 2026-11-14 (23:50 h · `ABR-01` a `ABR-06` completados)

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
| **HiRISE** | $65.0\text{ kg}$, $60\text{ W}$ promedio, $0.3\text{ m/píxel}$, hasta $28\text{ Gbit/imagen}$ | verificado / fuente secundaria | NASA MRO Science / `uahirise.org` |
| **CTX** | $3.0\text{ kg}$, $7\text{ W}$ activo ($5\text{ W}$ reposo), fotos $6\text{ m/píxel}$ | verificado | NASA MRO Science |
| **CRISM** | $32.9\text{ kg}$, $44.4\text{ W}$ operación ($16.1\text{ W}$ standby), espectrómetro mineralógico | verificado | NASA MRO / JHUAPL (`crism.jhuapl.edu`) |
| **MARCI** | $0.481\text{ kg}$ (heritage base), $<5\text{ W}$ activo, cámara climática diaria | verificado / fuente secundaria | NASA MRO / Malin Space Science Systems |
| **MCS** | $9.0\text{ kg}$, $11.0\text{ W}$, temperatura y polvo atmosférico | verificado | NASA MRO Science |
| **SHARAD** | $15.0\text{–}16.6\text{ kg}$, $10\text{ W}$ RF ($\sim 20\text{ W}$ pico), $40\text{–}90\text{ Gbit/día}$ | verificado / fuente secundaria | NASA MRO (ASI / JPL) |

### Instrumentos verificados para M1 (LRO / Luna) y M2 (OSIRIS-REx / Asteroide)
| Misión | Instrumento | Masa / Potencia | Estado | Fuente |
|---|---|---|---|---|
| **M1 (Luna)** | **LROC** (Lunar Reconnaissance Orbiter Camera) | $16.5\text{ kg}$, $22.0\text{ W}$ prom. ($30\text{ W}$ pico) | verificado | NASA LRO (`science.nasa.gov/mission/lro/`) |
| **M1 (Luna)** | **LOLA** (Lunar Orbiter Laser Altimeter) | $15.3\text{ kg}$, $39.6\text{ W}$ | verificado | NASA LRO (`science.nasa.gov/mission/lro/`) |
| **M1 (Luna)** | **Diviner (DLRE)** (Radiómetro Lunar) | $11.9\text{ kg}$, $21.6\text{ W}$ | verificado | NASA LRO (`science.nasa.gov/mission/lro/`) |
| **M1 (Luna)** | **LAMP** (Mapeador UV Lyman-Alpha) | $5.3\text{ kg}$, $4.86\text{ W}$ | verificado | NASA LRO (`science.nasa.gov/mission/lro/`) |
| **M2 (Asteroide)** | **OVIRS** (Espectrómetro Vis-IR) | $17.8\text{ kg}$, $8.8\text{ W}$ prom. | verificado | NASA OSIRIS-REx / *Space Science Reviews* |
| **M2 (Asteroide)** | **OTES** (Espectrómetro Emisión Térmica) | $6.27\text{ kg}$, $10.8\text{ W}$ prom. | verificado | NASA OSIRIS-REx / *Space Science Reviews* |
| **M2 (Asteroide)** | **OLA** (Altímetro Láser) | $22.9\text{ kg}$, $\sim 75\text{ W}$ | verificado | NASA OSIRIS-REx / CSA |
| **M2 (Asteroide)** | **REXIS** (Espectrómetro Rayos X Regolito) | $4.4\text{ kg}$, $10.8\text{ W}$ prom. | verificado | NASA OSIRIS-REx / *Space Science Reviews* |

*(Nota `ABR-01` completada: todos los instrumentos de MRO, LRO y OSIRIS-REx quedan verificados con fuentes oficiales y sincronizados con `frontend/src/data/nasa_catalog.json` y `backend/models/subsystems.py`; únicamente `cost_musd`, `science_value` y `data_gbit_day` estimados conservan etiqueta explícita de balance de juego).*

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

- **Líneas estelares de Balmer / Dobletes / Emisión (NIST ASD):** $\text{H}\alpha = 656.28\text{ nm}$, $\text{H}\beta = 486.13\text{ nm}$, $\text{H}\gamma = 434.05\text{ nm}$, $\text{Na D1/D2} = 589.59 / 588.99\text{ nm}$, $\text{Ca II K} = 393.37\text{ nm}$, $\text{He I} = 587.56\text{ nm}$, $\text{O III} = 500.68\text{ nm}$; Ley de desplazamiento de Wien $\lambda_{\max} \cdot T = 2,897,771.955\text{ nm}\cdot\text{K}$. *(Fuente verificada: NIST Atomic Spectra Database / CODATA 2018).*
- **Bandas FTIR de minerales/biofirmas (`cm-1`):** Silicatos $\text{Si–O–Si} \approx 1,045\text{ cm}^{-1}$, Carbonatos $\text{CO}_3 \approx 1,435\text{ cm}^{-1}$, Agua ligada $\text{H}_2\text{O} \approx 1,630\text{ cm}^{-1}$, Carbonilo $\text{C=O} \approx 1,720\text{ cm}^{-1}$, Arcillas hidratadas $\text{O–H} \approx 3,620\text{ cm}^{-1}$, Amida I ($1,600\text{–}1,700\text{ cm}^{-1}$: Hoja $\beta$ $1,632\text{ cm}^{-1}$, Hélice $\alpha$ $1,654\text{ cm}^{-1}$, Giro $\beta$ $1,676\text{ cm}^{-1}$).
- **Índices multiespectrales:** $\text{NDVI} = \frac{\text{NIR}-\text{Rojo}}{\text{NIR}+\text{Rojo}}$, $\text{NDWI} = \frac{\text{Verde}-\text{NIR}}{\text{Verde}+\text{NIR}}$, $\text{NBR} = \frac{\text{NIR}-\text{SWIR}}{\text{NIR}+\text{SWIR}}$.
- **Dispersión óptica de Cauchy (*Misión Fotón*):** $n(\lambda) = A + B/\lambda^2$ con $\lambda$ en $\mu\text{m}$ (*Fused Silica* $A=1.458, B=0.00354$; *BK7* $A=1.5046, B=0.00420$; *Sapphire* $A=1.754, B=0.00610$).
- **Matriz DTMF (*Espectro Hacker*):** Filas $\{697, 770, 852, 941\}\text{ Hz}$ $\times$ Columnas $\{1209, 1336, 1477, 1633\}\text{ Hz}$. *(Estándar ITU-T Q.23).*
- **Arquetipos implementados y espectros reales:** Los 8 modos (`cazadores_estrellas`, `detectives_luz`, `ecoespectro`, `laboratorio_musical`, `mision_foton`, `bioespectro`, `ladron_colores`, `espectro_hacker`) funcionan con generadores sintéticos calibrados o cargando CSVs reales vía `cargar_espectro_csv` / `backend/juegos_espectrales/datos_reales/<mission_id>.csv`, incluyendo guías educativas paso a paso en `educational_guide`.

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
      "fuente": "https://science.nasa.gov/mission/mars-reconnaissance-orbiter/ & https://www.uahirise.org/",
      "estado": "verificado (~65 kg, ~60 W, hasta 28 Gbit/imagen) / estimado juego (costo)"
    }
  ]
}
```

## Reglas de racionalidad (auditoría 2026-11-15)

- **Capacidad útil del lanzador = capacidad al destino:** asteroide y Marte usan la de escape terrestre (`max_mass_mars_kg`); la **Luna** usa la mayor entre escape e inyección translunar (`max_mass_tli_kg`): Vulcan VC6 **11 500 kg** (C3 −2 km²/s², `ulalaunch.com/rockets/vulcan-centaur`) y Electron + Lunar Photon **25 kg** (demostrado: CAPSTONE, NSSDC 2022-070A). Sin cifra con fuente para el destino → 0 kg y el Nodo 1 falla con *no alcanza el destino*. Lo aplican `game_manager`, la IA (`randomizer.py`, el más barato que alcanza) y Rol 1B. Vulcan GTO = 14 500 kg (ULA).
- **Propelente (Rol 3A):** se dimensiona con el Δv de la ruta elegida × margen 1.05 (el mismo que usa la compuerta del Nodo 2); ya no se resta otra vez `propellant_delta_kg` (doble conteo).
- **Reserva UFE:** las opciones de vuelo que gastan reserva ahora la reducen (antes la aumentaban).
- **Eventos aleatorios:** `story_tree.json → random_events` (efectos = estimado del juego; fenómenos con fuente: NOAA SWPC, NASA ODPO, OSIRIS-REx, NASA Mars, DSN).
- **Pendiente con fuente antes de implementar:** horas de contacto DSN por día (para *Data* vs capacidad de bajada), duración de misión (*Time*) por ruta, pérdida de trayecto real Tierra–Marte/Luna, potencia real de un MMRTG (~110 W), costo de instrumentos en el presupuesto y foto del despegue (`launch_snapshot`) para que el Nodo 1 no cambie con respuestas de vuelo.

- **Data (2026-11-15):** horas de enlace/día = Gbit/día ÷ (Mbps × 3600 / 1000). Límite: `constants.dsn_data_hours_per_day` = **10 h/día** (MRO: ~16 h/día de seguimiento DSN, 10–11 h enviando datos; `descanso.jpl.nasa.gov/DPSummary/MRO_092106.pdf`). Si se necesitan más horas, la compuerta *Call Earth* se degrada.
- **Pérdida real Tierra–destino (informativa):** FSPL = 92.45 + 20 log d(km) + 20 log f(GHz) (ITU-R P.525), banda X de la DSN 8.4 GHz: Luna (384 400 km) **222.6 dB**; Marte (54.6–401.4 millones de km, NSSDC) **265.7–283.0 dB**. Campo `earth_link_fspl_db` por misión; se muestra en el HUD *COMMS*. El margen del juego sigue usando la órbita elegida.
- **Diferidos:** MMRTG ~110 W al inicio de misión (`science.nasa.gov`, RPS FAQ) y ~45 kg (kit de prensa Mars 2020): no se aplica porque el resto del modelo de potencia es estimado del juego. Costos de instrumentos: sin fuente pública por instrumento (estimado del equipo). **Time:** `transit_days` de la ruta (ya con fuente). La IA del piloto ahora elige una ruta real del catálogo.
- **Foto del despegue (`launch_state`, 2026-11-15):** el servidor congela el diseño al despegar; el Nodo 1 (masa, cofia, presupuesto) y la eficiencia de masa se juzgan con esa foto, así que una respuesta de vuelo como *+30 kg de combustible* ya no puede reprobar un despegue que ya ocurrió. Los nodos 2–4 usan la nave en vuelo.
- **Combustible de Rol 3A:** se dimensiona con la masa seca real de la nave (`LiveMetrics.dry_mass_kg`) + instrumentos, la misma que vuela el Nodo 2 (antes, un estimado fijo de 620 kg).
- **Hechos corregidos:** Artemis I usó una órbita retrógrada distante (no retorno libre; eso es Artemis II). El presupuesto de MSR del juego está escalado y lo indica con fuente.
