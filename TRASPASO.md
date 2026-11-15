# Traspaso y Pivote Oficial del Hackathon

**Fecha inicial del traspaso:** 10 de noviembre de 2026  
**Cierre del traspaso y pivote de 24 h:** 14 de noviembre de 2026, 15:00 h

## Estado del traspaso

Roberto dejó el equipo antes del evento. El **sábado 14 de noviembre de 2026 a las 15:00 h** (inicio efectivo de las 24 horas del hackathon, hasta el domingo 15 de noviembre a las 15:00 h), **Rubén** asume formalmente el liderazgo y la organización general del equipo (**Rubén, Ismael, Abraham, Schoenstadt, Leonardo**).

## Cambios clave adoptados al arrancar el evento (14 nov, 15:00 h)

Toda la base de investigación y diseño previa creada por Roberto se conserva como cimiento y se transforma al nuevo concepto **100 % software web**, documentado en `docs/03-decisiones.md` y en los documentos maestros de arquitectura de Leonardo (`arquitectura_integral_y_motor_espectral_nasa_space_apps_2026.md` y `arquitectura_y_dependencias_nasa_space_challenge.md`):

1. **Cero hardware físico:** Se descarta la estación USB arcade y Unity; el juego corre 100 % en navegador (**React + TypeScript + Vite + Tailwind + Framer Motion + Three.js**) respaldado por **FastAPI + Socket.IO**.
2. **Flujo ágil de 5 minutos:** Menú (`Singleplayer` / `Multiplayer`) $\rightarrow$ Lobby estilo *Among Us / Kahoot* $\rightarrow$ Selección de Rol + 1 de 3 Misiones NASA y Dificultad $\rightarrow$ **Pista Lineal de Estaciones** con movimiento automático del personaje y minijuegos paralelos con afectación en cadena en vivo $\rightarrow$ **Dinámica de vuelo de 60 segundos con preguntas por turnos** $\rightarrow$ **Retroalimentación educativa NASA** (siempre presente, gane o falle la misión).
3. **Estética propia:** Híbrido visual **Paper Mario × Among Us + HUD aeroespacial NASA**, evitando simuladores genéricos (*AI slop*).
4. **Plan de 24 horas con roadmaps individuales:** Cada uno de los 5 integrantes tiene su roadmap paso a paso (`docs/17-roadmap-ruben.md` a `docs/21-roadmap-leonardo.md`) para trabajar en paralelo con IA y ensamblar sin colisiones.

## Regla de mantenimiento

- Toda decisión y contrato vive en `docs/`.
- Después de cualquier cambio en `docs/`, corre siempre:

  ```bash
  node herramientas/combinar.mjs
  ```

Mucho éxito al equipo en estas 24 horas en Querétaro.
