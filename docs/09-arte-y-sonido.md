# 09 · Arte y Sonido (Paper Mario × Among Us + HUD NASA)

**Qué contiene:** identidad visual oficial del videojuego para evitar el aspecto genérico de simulador (*AI slop*), paleta de colores, anatomía de los personajes recortables 2.5D, animaciones de pista lineal y vuelo, tipografía y reglas legales de arte/IA.  
**Dueño:** Leonardo  
**Última actualización:** 2026-11-14 (15:00 h)

---

## Concepto Visual: *Paper Mario × Among Us + HUD NASA* (`[DECIDIDO]`)

Queremos un juego con personalidad propia e inolvidable frente a los jueces:
- **De *Among Us*:** Tripulantes/ingenieros espaciales adorables y expresivos con visor brillante, mochila de soporte vital y silueta clara reconocible a distancia (ideal en celulares y en el video de 30 s). Además, la vibra de sala de espera en el Lobby y consolas de tarea por estación.
- **De *Paper Mario*:** Todo personaje, nave, ficha, cohete y tarjeta se siente como un **recorte de cartulina gruesa 2.5D**:
  - **Doble borde tipo sticker:** Borde blanco interior (`3px solid #FFFFFF`) + contorno grueso de tinta oscura (`3px solid #0F172A`) + sombra sólida sin difuminado (`box-shadow: 4px 4px 0px #0F172A` o `drop-shadow(4px 4px 0px #0F172A)`).
  - **Movimiento tipo papel:** Cuando el personaje camina automáticamente en `LinearStationTrack`, hace pequeños saltos con inclinación (`rotate: [-4deg, 4deg]`) y al voltear o aparecer realiza un giro plano (`scaleX` / `rotateY` de papel en Framer Motion).
  - **Profundidad por capas (*Diorama*):** Fondo estelar con `tsParticles`, planetas de cartulina en capas parallax detrás de la pista lineal y tarjetas de minijuego que caen o se despliegan como sobres/carpetas de ingeniería.
- **Del *HUD Aeroespacial NASA*:** Telemetría de precisión en tipografía monoespaciada (`IBM Plex Mono`), barras segmentadas de recursos y etiquetas técnicas reales (`MASS 2,180 / 4,020 kg`, `DSN +3.4 dB`, `UFE 26 %`).

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

## Reglas para Componentes Estilo *Paper Mario × Among Us* (Para Ismael, Abraham y Leonardo)

Para que los minijuegos de **Ismael** y **Abraham** se vean idénticos a la UI de **Leonardo**, Tailwind CSS tendrá clases utilitarias compartidas en `frontend/src/index.css`:

- `.paper-card`: fondo `#162347` o `#F8FAFC`, `border: 3px solid #0F172A`, `box-shadow: 5px 5px 0px #0F172A`, `rounded-2xl`.
- `.paper-btn`: efecto físico al presionar (`active:translate-x-[3px] active:translate-y-[3px] active:shadow-none`) con sombra dura `4px 4px 0px #0F172A`.
- `<CrewmateAvatar role={role} state="idle | walk | work | panic | cheer" />`: componente SVG modular creado por **Leonardo** reutilizado en Lobby, Pista Lineal, Vuelo 60 s y Podio final. **Importante:** dibujado en SVG original por nuestro equipo (cero sprites extraídos de otros juegos con copyright).

---

## Audio y Efectos de Sonido (Extra después de H18)

- Si sobra tiempo tras el MVP en H18, usar únicamente audio **CC0 / dominio público** (paquetes *Kenney Sci-Fi Sounds* / *Interface Sounds*) o tonos sintetizados con la **Web Audio API** nativa del navegador (cero archivos pesados, carga instantánea).
- Sonidos clave: clic de cartulina, campana de estación completada, alerta de mutación en cadena, cuenta regresiva de 5 s, propulsor en vuelo de 60 s y fanfarria/alarma final.
- Siempre incluir un botón `Mute / Unmute` en la esquina superior derecha.

---

## Reglas Legales de Arte e IA (Space Apps)

1. **NUNCA usar el logo oficial de la NASA** en pantallas, naves ni portada.
2. **Nada de sprites con copyright externo:** Los tripulantes estilo *Among Us* y estilo *Paper Mario* son **homenaje estético original dibujado en SVG/CSS por el equipo**, jamás assets extraídos de los juegos originales de Innersloth o Nintendo.
3. **Si se usa cualquier imagen o video generado por IA**, debe llevar **marca de agua visible** y declararse en `referencias.md` y en la sección *AI Use* de la entrega. (Al dibujar todo en SVG + CSS + Three.js procedural evitamos este riesgo por completo).
