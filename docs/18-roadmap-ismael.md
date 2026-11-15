# 18 · Guía Paso a Paso: Ismael (Tus 4 Minijuegos de Nave y Cohetes)

**Tu misión:** Construir **4 minijuegos visuales en 2D** muy divertidos y fáciles de entender. Tú te encargas de que el jugador **arme la nave espacial**, **reparta el dinero**, **elija el cohete** y **acomode las piezas para que la nave no vaya chueca**.

**No te preocupes si nunca has hecho una página web:**
- **No tienes que programar servidores, internet, menús ni el vuelo final.** Todo eso lo hacen Rubén, Leonardo, Abraham y Schoenstadt.
- Tú solo trabajas en **4 archivos que ya están creados para ti**, y tu agente de IA va a escribir el código por ti si le pegas los mensajes que te dejamos aquí abajo.
- Para ver si tus juegos quedaron bonitos, Leonardo te preparó una pantalla de pruebas llamada **`/dev-sandbox`** donde puedes jugar tus minijuegos tú solo en tu computadora.

---

## Tus 4 archivos (ya existen en la carpeta del proyecto)

Aquí es donde tu agente de IA va a guardar tu trabajo (no necesitas abrir ni cambiar ningún otro archivo):

```text
space-apps-juego/
└── frontend/
    └── src/
        └── components/
            └── minigames/
                ├── Rol2A_TopologicalAssembly.tsx   <-- JUEGO 1 (Prioridad 1 - para la hora H6): Armar la nave paso a paso
                ├── Rol1A_BudgetTable.tsx           <-- JUEGO 2 (Prioridad 1 - para la hora H8): Repartir 10 monedas de dinero
                ├── Rol1B_LauncherAuction.tsx       <-- JUEGO 3 (Prioridad 2 - para la hora H12): Elegir el cohete
                └── Rol2B_MassBalanceTask.tsx       <-- JUEGO 4 (Prioridad 2 - para la hora H14): Equilibrar el peso
```

---

## Paso 0 · Cómo abrir tu pantalla de pruebas en 3 minutos (o pídeselo a tu agente)

Si abres tu agente de IA, él puede instalar todo solo. Si lo haces tú en la terminal:
1. Descarga el proyecto de GitHub en tu computadora y ábrelo en tu editor (VS Code / Antigravity / Cursor).
2. En la carpeta principal del proyecto, corre una sola vez:
   ```bash
   npm run setup:frontend
   npm run dev:frontend
   ```
3. Abre tu navegador (Chrome o Edge) y entra a esta dirección:
   **`http://localhost:5173/dev-sandbox`**
4. Ahí verás un menú para escoger cualquiera de tus 4 minijuegos y probar cómo se ven y cómo funcionan.

---

## ¿Cómo se conectan tus juegos con los demás? (En palabras simples)

Cada uno de tus 4 archivos recibe una cajita de información de tus compañeros y tiene dos botones invisibles para avisar qué hizo el jugador:

1. **Lo que recibes (`liveMetrics`):** por ejemplo, cuánto pesa toda la nave hasta este momento, cuánto dinero sobra o qué aparatos científicos compraron tus compañeros.
2. **Avisa mientras juegas (`onLiveMutation`):** cada vez que el jugador ponga una pieza, mueva una moneda o toque un cohete, tu juego manda un aviso rápido para que las barras de tus compañeros se muevan en vivo.
3. **Avisa cuando terminas (`onSubmitTake`):** cuando el jugador apriete el botón verde de **Confirmar** (o cuando el reloj de 30 segundos llegue a `0`), tu juego manda el resultado final y se cierra.
4. **Cómo se debe ver:** Como cartulina recortada estilo **Paper Mario × Among Us** (bordes negros gruesos, sombras duras, botones grandes que se hunden al presionarlos) y con **todos los textos en inglés** (para los jueces).

---

## Paso 1 (Empieza por aquí · Meta H6) · Juego 1: Armar la nave paso a paso
**Archivo:** `frontend/src/components/minigames/Rol2A_TopologicalAssembly.tsx`

### ¿Cómo se juega?
Es como armar un LEGO siguiendo las instrucciones en orden (duración: **30 segundos**):
1. En el centro de la pantalla está el espacio vacío donde va la nave. A la izquierda están las piezas en tarjetas grandes.
2. El jugador tiene que ir haciendo clic en las piezas **en el orden correcto**:
   - **Primero:** poner el cuerpo principal de la nave (el chasis).
   - **Segundo:** poner los paneles solares o el generador de energía (si es la misión de Marte) y el escudo contra el calor.
   - **Tercero:** elegir la **llave de tuercas** y hacer clic para apretar los tornillos.
   - **Cuarto:** elegir los **cables** y hacer clic para conectar la electricidad.
3. Si el jugador intenta poner los cables antes de armar el cuerpo, le sale un mensajito rojo en inglés que dice *"Install chassis first!"* y baja un poquito la resistencia de la nave.
4. Si se le acaba el tiempo sin haber puesto el escudo contra el calor, la nave sale sin escudo y tendrá problemas al regresar a la Tierra.

### Copia y pega esto en tu agente de IA:
```text
Paso 0 (Automático): Si falta la carpeta frontend/node_modules, corre `npm --prefix frontend install` primero.
Lee AGENTS.md, docs/09-arte-y-sonido.md, docs/10-tecnico.md, docs/22-como-trabajar-y-hacer-merge.md y docs/18-roadmap-ismael.md.
Trabaja únicamente en el archivo frontend/src/components/minigames/Rol2A_TopologicalAssembly.tsx e implementa la interfaz MinigameProps de frontend/src/types/game.ts.
Hazlo muy visual, divertido y fácil de usar en computadora y celular, con estilo de cartulina recortada Paper Mario x Among Us (clases .paper-card y .paper-btn) y todos los textos en inglés:
1. Muestra el dibujo SVG de la nave al centro y las piezas a la izquierda según missionId:
   - En artemis_moon y asteroid_hunter: Chassis MLI (180 kg), Left/Right Solar Panels (45 kg c/u), Battery Pack (25 kg), Heat Shield (60 kg), Deorbit Thruster (18 kg).
   - En mars_sample_return: Chassis MLI (260 kg), Boom Mast + Pu-238 RTG (56 kg), HGA Dish Mount (30 kg), Sealed Sample Capsule / Heat Shield (95 kg), Deorbit Kit (20 kg).
2. Reglas de orden (con clic sencillo para que sea súper fácil en teléfono):
   - Paso 1: Colocar el Chassis.
   - Paso 2: Colocar Energía, Escudo Térmico y Deorbit.
   - Paso 3: Elegir la herramienta "TORQUE (T1)" y dar clic en los puntos de tornillo.
   - Paso 4: Elegir la herramienta "WIRING (T2)" y dar clic para conectar cables.
3. Si hacen clic fuera de orden, muestra una alerta divertida en rojo y resta 5 % a assembly_integrity_pct (mínimo 60).
4. Cada vez que pongan una pieza, llama a onLiveMutation({ dry_mass_kg: masaActual, has_thermal_protection: tieneEscudo }).
5. Al terminar todos los pasos, presionar "CONFIRM ASSEMBLY", o cuando timeLeftSec <= 0 (y !isLocked), llama a onSubmitTake({ bus_dry_mass_kg, has_thermal_protection, assembly_integrity_pct, has_deorbit_device }).
```

---

## Paso 2 (Sigue con este · Meta H8) · Juego 2: Repartir las 10 monedas del presupuesto
**Archivo:** `frontend/src/components/minigames/Rol1A_BudgetTable.tsx`

### ¿Cómo se juega?
Eres el encargado del dinero de la misión (duración: **30 segundos**):
1. Tienes **10 monedas doradas** para repartir en **3 cajas** usando botones grandes de `+` y `-`:
   - **Caja 1 — Motores y Energía:** entre más monedas pongas aquí, más fácil le salen baterías y celdas buenas a tu compañero del juego 3D.
   - **Caja 2 — Ciencia y Antenas:** define cuánto dinero tendrá tu compañero de Ciencia para comprar cámaras y sensores.
   - **Caja 3 — Alcancía de Emergencias (UFE):** dinero guardado por si algo sale mal en el espacio. Tiene una aguja tipo velocímetro que está en **verde** si guardas al menos el 25 % (3 monedas o más), amarilla si guardas poco y roja si casi no guardas nada.
2. **Tarjetas sorpresa:** cuando queden 20 segundos y cuando queden 12 segundos, salen 2 mensajes urgentes de los ingenieros pidiendo dinero extra (por ejemplo: *"Propulsion asks for +$40M for stronger tanks"*). Tú decides si les das el dinero sacándolo de la alcancía de emergencias o si les dices que no.

### Copia y pega esto en tu agente de IA:
```text
Paso 0 (Automático): Si falta la carpeta frontend/node_modules, corre `npm --prefix frontend install` primero.
Lee AGENTS.md, docs/09-arte-y-sonido.md, docs/10-tecnico.md, docs/22-como-trabajar-y-hacer-merge.md y docs/18-roadmap-ismael.md.
Trabaja únicamente en el archivo frontend/src/components/minigames/Rol1A_BudgetTable.tsx e implementa MinigameProps.
Hazlo en inglés, con estilo Paper Mario x Among Us (.paper-card, .paper-btn) y monedas doradas grandes:
1. Lee el presupuesto base de frontend/src/data/nasa_catalog.json según missionId (800M, 1200M o 2500M USD).
2. Deja repartir exactamente 10 monedas (cada moneda vale 10 %) en 3 columnas con botones grandes (+ / -): "Engineering & R&D", "Science & Comms", "Emergency Vault (UFE)" (arranca en 4 / 3 / 3).
3. Calcula en vivo funding_factor_F = clamp(monedasIng / 6, 0, 1) y ufe_reserve_pct = monedasUfe * 10. Muestra un medidor visual (verde >= 25%, amarillo 15-24%, rojo < 15%).
4. Muestra 2 tarjetas sorpresa cuando timeLeftSec <= 20 y timeLeftSec <= 12 con botones "Approve from Vault" / "Reject"; si aprueban, baja 10% o 5% de ufe_reserve_pct y suma ese gasto a subsystems_cost_usd.
5. En cada toque llama a onLiveMutation({ funding_factor_F, ufe_reserve_pct, budget_science_usd, subsystems_cost_usd }).
6. Al confirmar o cuando timeLeftSec <= 0 (y !isLocked), llama a onSubmitTake({ budget_engineering_usd, budget_science_usd, ufe_reserve_pct, funding_factor_F, subsystems_cost_usd }).
```

---

## Paso 3 (Segunda mitad · Meta H12) · Juego 3: Elegir el cohete donde sí quepa la nave
**Archivo:** `frontend/src/components/minigames/Rol1B_LauncherAuction.tsx`

### ¿Cómo se juega?
Ya en la segunda estación, tus compañeros terminaron de poner piezas. Tu pantalla te dice cuánto pesa la nave completa en total y cuánto dinero queda en la caja.
1. En pantalla aparecen **5 tarjetas de cohetes reales** (*Electron*, *SpaceX Rideshare*, *Falcon 9*, *Vulcan Centaur* y *Falcon Heavy*).
2. Cada tarjeta te ayuda mostrando una etiqueta **VERDE (`FITS!`)** si el peso de la nave sí cabe en ese cohete, o una etiqueta **ROJA (`TOO HEAVY!`)** si es demasiado pesada para ese cohete. También muestra si alcanza el dinero.
3. Escoges el mejor cohete que quepa y no pase del presupuesto, activas el botón de cerrar la punta del cohete (*Fairing OK*) y confirmas.

### Copia y pega esto en tu agente de IA:
```text
Lee AGENTS.md, docs/06-datos-nasa.md, docs/10-tecnico.md y docs/18-roadmap-ismael.md.
Trabaja únicamente en el archivo frontend/src/components/minigames/Rol1B_LauncherAuction.tsx e implementa MinigameProps.
Requisitos en inglés con estética Paper Mario x Among Us (.paper-card, .paper-btn):
1. Lee la lista de cohetes desde frontend/src/data/nasa_catalog.json (Electron, SpaceX Rideshare XL, Falcon 9 Block 5, Vulcan Centaur VC6, Falcon Heavy) con su capacidad en kg y su costo en USD.
2. Muestra arriba un letrero muy claro con el peso actual de la nave (liveMetrics.estimated_wet_mass_kg) y el dinero disponible (liveMetrics.remaining_budget_usd).
3. Cada tarjeta de cohete debe mostrar en verde "PAYLOAD FITS!" si la masa cabe o en rojo "TOO HEAVY (+X kg)" si se pasa, y otra insignia verde/roja para el dinero.
4. Incluye un interruptor simple "Confirm Payload Fairing" (fairing_ok = true por defecto al elegir cohete compatible).
5. Llama a onLiveMutation al seleccionar tarjeta y a onSubmitTake({ selected_launcher, launcher_max_mass_kg, fairing_ok, launch_cost_usd }) al confirmar o al llegar timeLeftSec <= 0.
```

---

## Paso 4 (Último juego · Meta H14) · Juego 4: Acomodar las piezas para que la nave no vaya chueca
**Archivo:** `frontend/src/components/minigames/Rol2B_MassBalanceTask.tsx`

### ¿Cómo se juega?
Si pones todo el peso de un solo lado de la nave, al prender los motores va a girar chueca y gastar 50 % más gasolina.
1. A la izquierda te salen **las piezas reales que compró tu compañero de Ciencia** (cámaras, sensores, etc.) más el tanque de combustible.
2. Al centro hay una cuadrícula con 8 espacios alrededor del centro de la nave. Tocas una pieza y luego tocas un espacio para acomodarla.
3. En el centro hay un **círculo verde** y un puntito rojo que se mueve según dónde pongas las piezas (como una balanza). Tu meta es acomodar las piezas de forma pareja para que el puntito quede **adentro del círculo verde** (`BALANCED!`).
4. Si ves que la nave pesa demasiado para el cohete, hay un botón rojo de emergencia llamado **`JETTISON BALLAST (-40 kg)`** que tira peso extra para ayudar al equipo.

### Copia y pega esto en tu agente de IA:
```text
Lee AGENTS.md, docs/06-datos-nasa.md, docs/10-tecnico.md y docs/18-roadmap-ismael.md.
Trabaja únicamente en el archivo frontend/src/components/minigames/Rol2B_MassBalanceTask.tsx e implementa MinigameProps.
Requisitos en inglés con estilo Paper Mario x Among Us (.paper-card, .paper-btn):
1. Toma las piezas de liveMetrics.selected_instruments (si la lista viene vacía en sandbox, usa 2 piezas de prueba: "Main Camera (45 kg)" y "Avionics Box (25 kg)") más "Fuel Tank (80 kg)".
2. Dibuja una cuadrícula 2D de la nave con 8 casillas simétricas en coordenadas (x, y) entre -1.0 m y +1.0 m, y un círculo verde al centro cuyo radio es 0.25 en easy, 0.15 en medium y 0.08 en hard.
3. Permite hacer clic en una pieza y clic en una casilla para moverla. Calcula en vivo el centro de masa (X_CG, Y_CG) y qué tan lejos está del centro (d_CG = sqrt(X_CG^2 + Y_CG^2)) dibujando el punto en pantalla.
4. Si d_CG <= radio verde: cg_balanced = true y fuel_burn_multiplier = 1.0 (muestra letrero verde "NOMINAL 1.0x"). Si está afuera: cg_balanced = false y fuel_burn_multiplier = 1.5 (alerta roja "UNBALANCED 1.5x FUEL!").
5. Agrega un botón rojo "JETTISON BALLAST (-40 kg)" que reduzca peso extra.
6. Llama a onLiveMutation({ cg_balanced, fuel_burn_multiplier }) cada vez que muevan algo, y llama a onSubmitTake({ cg_balanced, fuel_burn_multiplier, mass_growth_margin_pct, ballast_jettisoned_kg }) al confirmar o cuando timeLeftSec <= 0.
```

---

## Antes de decirle a Leonardo "Ya quedó mi minijuego", revisa estos 4 puntos:
1. Abre `http://localhost:5173/dev-sandbox` y juega el minijuego completo en la computadora y haciendo la ventana chiquita como celular.
2. Verifica que todos los botones y textos que ve el jugador estén en **inglés**.
3. Deja que el reloj llegue a `0` segundos sin apretar nada para comprobar que el juego se envía solo y no se queda trabado.
4. Asegúrate de no haber cambiado ningún archivo fuera de tus 4 archivos de `frontend/src/components/minigames/`.
