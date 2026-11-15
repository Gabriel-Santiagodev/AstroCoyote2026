# 🚀 NASA Space Challenge: Arquitectura y Stack Tecnológico

Guía de arquitectura, dependencias y estructura de carpetas para desarrollar un videojuego web multijugador en tiempo real (en `localhost` y red local LAN), combinando las salas con PIN de **Kahoot** y la narrativa interactiva por decisiones de **Netflix Interactive** (*Bandersnatch* / *Trivia Quest*).

---

## 1. Stack Tecnológico Recomendado

Para un juego basado en **fases, toma de decisiones y narrativa ramificada**, una arquitectura orientada a eventos en tiempo real es más rápida, ligera y visualmente superior a un motor 3D pesado.

* **Backend (Python + FastAPI + Socket.IO):** Maneja la máquina de estados de la partida, el árbol de decisiones, los temporizadores sincronizados en el servidor y las salas multijugador mediante código PIN.
* **Frontend (React + TypeScript + Vite):** Interfaz reactiva separada en dos vistas: la pantalla principal del anfitrión (**Host/Proyector**) y los controles individuales de cada jugador (**Player Pad**).
* **Arte Visual y Animaciones:**
  * **Framer Motion:** Transiciones cinematográficas entre escenas, menús interactivos y tarjetas de decisión con barras de tiempo agotándose.
  * **Lottie / Rive:** Animaciones vectoriales interactivas (naves espaciales, radares, alertas de oxígeno, astronautas) controladas por eventos del juego.
  * **tsParticles:** Fondos espaciales dinámicos (campos de estrellas, nebulosas y asteroides en movimiento).
  * **Tailwind CSS + Lucide React:** Diseño de interfaz estilo panel de control aeroespacial (HUD de la NASA) e iconografía técnica.

---

## 2. Dependencias del Backend (`backend/requirements.txt`)

Crea una carpeta `/backend` y guarda este archivo `requirements.txt` para instalar las librerías necesarias en tu entorno virtual de Python:

```txt
fastapi==0.115.0
uvicorn[standard]==0.32.0
python-socketio==5.11.4
pydantic==2.9.2
python-dotenv==1.0.1
```

### Función de cada dependencia:
* **`fastapi` + `uvicorn`:** Servidor web asíncrono de alto rendimiento. Al ejecutarlo en `0.0.0.0`, permite que otros dispositivos en tu misma red Wi-Fi se conecten a tu `localhost`.
* **`python-socketio`:** Gestiona la comunicación bidireccional en tiempo real mediante WebSockets (ej. `jugador_unido`, `decision_tomada`, `mostrar_consecuencia`, `actualizar_podio`).
* **`pydantic`:** Valida los esquemas de datos del árbol de decisiones (nodos de historia, opciones, tiempos límite e impacto en oxígeno, combustible o puntuación científica).
* **`python-dotenv`:** Manejo limpio de variables de entorno (puertos, configuración de CORS).

---

## 3. Dependencias del Frontend (`frontend/package.json`)

En el ecosistema JavaScript/TypeScript no se utiliza `requirements.txt`, sino `package.json`. Crea una carpeta `/frontend` con Vite + React + TypeScript y utiliza esta configuración:

```json
{
  "name": "nasa-space-challenge-client",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host",
    "build": "tsc && vite build"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "socket.io-client": "^4.8.0",
    "framer-motion": "^11.11.1",
    "lucide-react": "^0.453.0",
    "lottie-react": "^2.4.0",
    "@tsparticles/react": "^3.0.0",
    "@tsparticles/slim": "^3.5.0",
    "canvas-confetti": "^1.9.3"
  },
  "devDependencies": {
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "@types/canvas-confetti": "^1.6.4",
    "tailwindcss": "^3.4.14",
    "postcss": "^8.4.47",
    "autoprefixer": "^10.4.20",
    "typescript": "^5.6.2",
    "vite": "^5.4.10"
  }
}
```

> **Nota sobre multijugador en red local:** El comando `"dev": "vite --host"` expone el servidor de desarrollo en tu red local. Así, cualquier jugador conectado al mismo Wi-Fi puede unirse desde su teléfono o laptop ingresando a `http://<TU_IP_LOCAL>:5173`.

---

## 4. Estructura de Carpetas del Proyecto

```text
nasa-space-challenge/
├── backend/
│   ├── requirements.txt         # Dependencias de Python
│   ├── main.py                  # Punto de entrada: FastAPI + servidor Socket.IO
│   ├── game_manager.py          # Lógica de salas (PIN), temporizadores y cálculo de puntos
│   └── story_tree.json          # Árbol de decisiones espaciales (Escenas, rutas, consecuencias)
│
└── frontend/
    ├── package.json             # Dependencias de React, animaciones y Socket.IO
    ├── index.html
    └── src/
        ├── assets/              # Audios de cabina, animaciones Lottie (.json), sprites NASA
        ├── socket.ts            # Cliente WebSocket centralizado
        ├── pages/
        │   ├── HomeMenu.tsx     # Menú interactivo: "Crear Misión (Host)" o "Unirse con PIN"
        │   ├── HostScreen.tsx   # Pantalla principal: Narrativa visual, estado de nave y ranking
        │   └── PlayerPad.tsx    # Control del jugador: Botones de decisión estilo Netflix + timer
        └── components/
            ├── Starfield.tsx    # Fondo espacial animado con tsParticles
            └── DecisionCard.tsx # Tarjeta interactiva con Framer Motion y barra de tiempo
```

---

## 5. Flujo de Juego y Sincronización (Kahoot + Netflix)

1. **Lobby de Misión (Estilo Kahoot):**
   * El anfitrión inicia una partida en `HostScreen` y recibe un código de sala único (ej. `ARTEMIS-26`).
   * Los jugadores abren `PlayerPad` en sus navegadores, ingresan el código PIN, eligen su nombre de astronauta y su especialidad (Ingeniería, Piloto, Ciencia, Medicina).
2. **Presentación de Escena (Estilo Netflix Interactive):**
   * El backend lee el nodo actual desde `story_tree.json` y emite el evento de nueva escena a todos los clientes conectados.
   * En la pantalla principal se reproduce la animación o cinemática del evento espacial (ej. *"Falla en los paneles solares durante órbita lunar"*).
   * Simultáneamente, en el dispositivo de cada jugador se despliegan de 2 a 4 tarjetas táctiles de decisión con una barra de cuenta regresiva sincronizada.
3. **Resolución de Decisiones:**
   * **Ruta Individual:** Cada jugador toma sus propias decisiones a lo largo del árbol narrativo. Sus elecciones modifican sus recursos personales (oxígeno, integridad del traje, puntos de investigación) y determinan qué final alcanza.
   * **Ruta de Tripulación (Votación):** Las decisiones de todos los jugadores se suman en tiempo real; la opción mayoritaria define el rumbo de la misión colectiva.
4. **Telemetría y Podio Final:**
   * Al concluir la misión, `HostScreen` muestra las rutas tomadas por cada astronauta, quiénes lograron completar el objetivo de la NASA y el ranking final de puntuación.