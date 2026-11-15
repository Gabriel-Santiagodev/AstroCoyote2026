# 09 · Arte y Sonido (2D Flash Arcade `ASTRO SPRITES` × *60 Seconds!* Cabin + HUD NASA)

**Qué contiene:** identidad visual oficial del videojuego para evitar el aspecto genérico de simulador (*AI slop*), paleta de colores, anatomía de los 4 personajes 2D (`ASTRO SPRITES`), estética de cabina y bitácora estilo *60 Seconds! / 60 Parsecs!*, transiciones con pantallas de carga, tipografía y reglas legales de arte/IA.  
**Dueño:** Leonardo  
**Última actualización:** 2026-11-14 (22:20 h)

---

## Concepto Visual: *2D Flash Arcade (`ASTRO SPRITES`) × Cabina 60 Seconds! + HUD NASA* (`[DECIDIDO]` / `[ACTUALIZADO]`)

Queremos un juego con personalidad propia, visual profesional de **videojuego 2D estilo Flash Arcade** e inolvidable frente a los jueces:
- **De los `ASTRO SPRITES` (Originales 2D — Cero Copyright):** Reemplazamos cualquier silueta tipo frijol (*Among Us*) por **4 astronautas SVG de cuerpo completo con contornos gruesos `#0F172A`**, visor LED animado, mochila propulsora, rodilleras y equipamiento específico de rol (`ASTRO_ENGINEER`, `ASTRO_MEDIC`, `ASTRO_SOLDIER`, `ASTRO_DEFENDER`), sin ningún riesgo de derechos de autor.
- **De *60 Seconds! / 60 Parsecs!* (Cabina, Bitácora y Saltos de Escena):** Tras la fase de preparación cronometrada en las estaciones (Estación 1 y 2), la fase de vuelo/travesía (`Flight60sView`) adopta la jugabilidad clásica de **cabina 2D + Bitácora del Capitán**: los personajes dentro del módulo espacial con sus subsistemas visibles en estantes/consolas, decisiones de supervivencia tipo diario ilustrado y **saltos de escena con pantallas de carga temáticas** entre cada nodo.
- **De *Paper Mario* / Cartulina 2D Arcade:**
  - Contorno de tinta oscura (`3px solid #0F172A`), paneles metálicos `.flash-panel`, consolas portátiles para celular `.handheld-console-frame`, cintas `.hazard-stripe-bar` y sombras sólidas sin difuminado (`5px 5px 0px #0F172A`).
  - Fondo estelar con `tsParticles` + planetas parallax detrás del módulo/pista.
- **Del *HUD Aeroespacial NASA*:** Telemetría de precisión en tipografía monoespaciada (`IBM Plex Mono`), barras segmentadas de recursos (`ResourceHUD`) y etiquetas técnicas reales (`MASS 2,180 / 4,020 kg`, `DSN +3.4 dB`, `UFE 26 %`).

---

## Paleta de Colores Oficial (`[PROPUESTA]`)

### Fondos y Cartulina
| Uso | Nombre | Hex | Nota de uso |
|---|---|---|---|
| Espacio profundo | `space-ink` | `#0B1021` | Fondo principal de `tsParticles` |
| Pasillo / Estación | `blueprint-navy` | `#162347` | Paneles, fondo de pista lineal y consolas |
| Cartulina / Sticker | `paper-cream` | `#F8FAFC` | Tarjetas claras, bordes de recorte, fichas |
| Tinta / Contorno | `ink-black` | `#0F172A` | Contorno de personajes, tarjetas y sombras sólidas `4px 4px 0` |

### Colores de los 4 Roles (Identidad de Tripulantes)
| Rol | Color principal | Hex | Visor / Acento |
|---|---|---|---|
| **Rol 1 · Finanzas y Lanzador** | Dorado / Ámbar | `#F59E0B` | `#FEF3C7` |
| **Rol 2 · Nave y Masa** | Cian Eléctrico | `#06B6D4` | `#CFFAFE` |
| **Rol 3 · Órbita y Energía** | Esmeralda | `#10B981` | `#D1FAE5` |
| **Rol 4 · Ciencia y Comms** | Violeta Cósmico | `#A855F7` | `#F3E8FF` |

### Semáforo de Recursos (Accesible)
| Estado | Hex | Regla de accesibilidad |
|---|---|---|
| **Nominal / Seguro** | `#3DDC84` | Siempre acompañado de etiqueta `OK` / `NOMINAL` e ícono check (`Lucide`) |
| **Precaución / Margen bajo** | `#F2C94C` | Siempre acompañado de etiqueta `WARN` e ícono triángulo alerta |
| **Crítico / Fallo** | `#FF5A4E` | Siempre acompañado de etiqueta `CRIT` e ícono `X` o alarma |

---

## Tipografía Oficial (Licencia Libre — Google Fonts / SIL OFL)

- **Títulos y botones estilo Paper/Arcade:** `Space Grotesk` (Bold 700, tracking apretado) o `Fredoka` (para insignias divertidas).
- **Números, ecuaciones y telemetría HUD:** `IBM Plex Mono` (`tabular-nums`, para que los relojes de 30 s / 60 s y las masas no vibren al cambiar).
- **Textos educativos y preguntas:** `IBM Plex Sans`.

---

## Reglas para Componentes Estilo *2D Flash Arcade & Diorama NASA* (Para Ismael, Abraham y Leonardo)

Para que los minijuegos de **Ismael** y **Abraham** se vean coherentes con la UI de **Leonardo**, Tailwind CSS tiene clases utilitarias compartidas en `frontend/src/index.css`:

- `.paper-card` / `.flash-panel`: fondo `#162347` / degradado metálico de cabina, `border: 3px solid #0F172A`, `box-shadow: 5px 5px 0px #0F172A`, `rounded-2xl`.
- `.paper-btn`: efecto físico al presionar (`active:translate-x-[3px] active:translate-y-[3px] active:shadow-none`) con sombra dura `4px 4px 0px #0F172A`.
- `.handheld-console-frame` y `.hazard-stripe-bar`: consola portátil para jugadores en celular y cintas industriales arcade.
- `<CrewmateAvatar role={role} state="idle | walk | work | panic | cheer" />`: componente SVG modular de nuestros **4 `ASTRO SPRITES` 2D completos** creado por **Leonardo** (junto con `ROLE_CHARACTER_PROFILE` y `<MissionLoadingScreen />` en `frontend/src/components/paper/LoadingScreen.tsx`) reutilizado en Lobby, Pista Lineal, Cabina estilo *60 Seconds!* y Podio final.

---

## Audio y Efectos de Sonido (Extra después de H18)

- Si sobra tiempo tras el MVP en H18, usar únicamente audio **CC0 / dominio público** (paquetes *Kenney Sci-Fi Sounds* / *Interface Sounds*) o tonos sintetizados con la **Web Audio API** nativa del navegador (cero archivos pesados, carga instantánea).
- Sonidos clave: clic de cartulina, campana de estación completada, alerta de mutación en cadena, cuenta regresiva de 5 s, paso de página de bitácora / salto de escena estilo *60 Seconds!* y fanfarria/alarma final.
- Siempre incluir un botón `Mute / Unmute` en la esquina superior derecha.

---

## Reglas Legales de Arte e IA (Space Apps)

1. **NUNCA usar el logo oficial de la NASA** en pantallas, naves ni portada.
2. **Nada de sprites con copyright externo (cero siluetas Among Us):** Los 4 especialistas `ASTRO_ENGINEER`, `ASTRO_MEDIC`, `ASTRO_SOLDIER` y `ASTRO_DEFENDER` son **personajes originales dibujados en SVG por el equipo** en `CrewmateAvatar.tsx`, sin ningún asset ni parecido protegido por Innersloth o Nintendo.
3. **Si se usa cualquier imagen o video generado por IA**, debe llevar **marca de agua visible** y declararse en `referencias.md` y en la sección *AI Use* de la entrega. (Al dibujar todo en SVG + CSS + Three.js procedural evitamos este riesgo por completo).
