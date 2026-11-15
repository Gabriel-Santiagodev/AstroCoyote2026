# Lista de Mejoras y Correcciones del Proyecto

Este documento detalla las áreas de oportunidad identificadas en el proyecto actual, organizadas por categorías para facilitar su implementación y seguimiento.

---

## 1. Narrativa y Experiencia de Usuario (UX)
* **Simplificación del lenguaje:** Reducir la cantidad de texto en pantalla y sustituir el exceso de lenguaje técnico por términos más accesibles para facilitar el aprendizaje y la comprensión del jugador.
* **Ritmo de progresión:** Ajustar la velocidad de transición entre misiones, ya que actualmente el avance es demasiado rápido y no permite asimilar los eventos o decisiones.

## 2. Interfaz de Usuario (UI) y Diseño Visual
* **Estructura de ventanas:** Implementar las interfaces independientes especificadas para cada fase del juego (ventana de menú principal, pantalla de selección de roles, vistas de misión, etc.).
* **Rediseño minimalista:** Eliminar elementos genéricos asociados al diseño automatizado (*AI Slop design*), mejorando la paleta de colores y los cuadros de texto. Adoptar una estética más minimalista y funcional, tomando como referencia juegos como *Among Us* o *60 Seconds!*.

## 3. Jugabilidad y Dinámica de Minijuegos
* **Profundidad en minijuegos:** Desarrollar la dinámica real de los minijuegos en lugar de simplificarlos a una mera toma de decisiones que carece de contexto o fundamento previo.
* **Interconexión por fortalezas:** Implementar los minijuegos priorizando las fortalezas de cada rol o mecánica al momento de conectarlos entre sí dentro de la partida.

## 4. Flujo del Juego y Modo Multijugador
* **Secuencia de juego:** Corregir el flujo general para que respete estrictamente el orden diseñado:
  1. Selección de roles
  2. Asignación de misión
  3. Ejecución de minijuegos
  4. Despliegue de nave con dinámica de toma de decisiones
* **Escalabilidad en multijugador:** Solucionar el problema en partidas multijugador con menos de 4 participantes (que no son *single player*), asegurando que los roles faltantes no queden vacíos ni afecten el desarrollo de la partida.