// Spanish for text the SERVER sends in English (flight logbook, survival events, catalog facts,
// report causes, tips and crew summaries). The server keeps one language because players in the
// same room may pick different languages; each client translates on screen with `ts()`.
// Exact strings first; sentences with numbers use ES_PATTERNS (kept in sync with backend wording).

export const ES_SERVER: Record<string, string> = {
  // --- Flight logbook (backend/story_tree.json)
  "Rocket shaking hard at peak pressure!": "¡El cohete se sacude fuerte en la presión máxima!",
  "Your rocket is passing Max-Q, the moment of strongest air pressure. It is close to its weight limit and your reserve fund (UFE) is tight. What do you do?":
    "Tu cohete pasa por Max-Q, el momento de mayor presión del aire. Está cerca de su límite de peso y tu fondo de reserva (UFE) está justo. ¿Qué haces?",
  "Budget reserve": "Reserva del presupuesto",
  "Fund extra fuel margin (−5% reserve, +45 kg fuel)": "Pagar margen de combustible extra (−5% reserva, +45 kg combustible)",
  "Spends emergency money now to gain fuel you can use later in the flight.":
    "Gasta dinero de emergencia ahora para ganar combustible que podrás usar más adelante en el vuelo.",
  "Drop extra brackets (−45 kg weight)": "Quitar soportes extra (−45 kg de peso)",
  "A lighter spacecraft stays safely under the rocket's limit. No money spent.":
    "Una nave más ligera se mantiene por debajo del límite del cohete. Sin gastar dinero.",
  "Fly as planned (no change)": "Volar según el plan (sin cambios)",
  "Keeps your whole reserve for later problems, but leaves no safety margin now.":
    "Guarda toda tu reserva para problemas futuros, pero no deja margen de seguridad ahora.",
  "Liftoff went smoothly — what now?": "El despegue salió bien — ¿y ahora?",
  "Your rocket passed peak air pressure with weight and budget to spare. The upper stage is about to push you toward the Moon (Translunar Injection). What is your order?":
    "Tu cohete pasó la presión máxima con peso y presupuesto de sobra. La etapa superior está por empujarte hacia la Luna (inyección translunar). ¿Cuál es tu orden?",
  "Efficient Moon push": "Empuje eficiente hacia la Luna",
  "Save leftover fuel (+30 kg fuel)": "Guardar el combustible sobrante (+30 kg combustible)",
  "Extra fuel gives you room for course corrections later.": "El combustible extra te da margen para corregir el rumbo después.",
  "Warm up instruments early (+5 science, −3% battery)": "Calentar los instrumentos antes (+5 ciencia, −3% batería)",
  "Instruments that are ready sooner collect better data, but this uses some battery.":
    "Los instrumentos listos antes recogen mejores datos, pero esto gasta algo de batería.",
  "Put unused money in reserve (+3% reserve)": "Pasar el dinero sin usar a la reserva (+3% reserva)",
  "A bigger reserve fund helps you pay for emergencies later.": "Un fondo de reserva más grande te ayuda a pagar emergencias después.",
  "Moon rocket shaking at peak pressure!": "¡El cohete lunar se sacude en la presión máxima!",
  "Your Moon spacecraft is passing Max-Q, when air pressure on the rocket is strongest. Its fueled weight is near the rocket's limit and your reserve fund (UFE) is tight.":
    "Tu nave lunar pasa por Max-Q, cuando la presión del aire sobre el cohete es mayor. Su peso con combustible está cerca del límite del cohete y tu fondo de reserva (UFE) está justo.",
  "Peak pressure": "Presión máxima",
  "Uses emergency money now so you have more fuel later.": "Usa dinero de emergencia ahora para tener más combustible después.",
  "Drop spare adapter parts (−45 kg weight)": "Quitar piezas de repuesto del adaptador (−45 kg de peso)",
  "Lighter is safer for the rocket, and it costs nothing.": "Más ligero es más seguro para el cohete, y no cuesta nada.",
  "Saves your reserve for problems near the Moon, but leaves no margin now.":
    "Guarda tu reserva para problemas cerca de la Luna, pero no deja margen ahora.",
  "Clean liftoff, heading to the Moon": "Despegue limpio, rumbo a la Luna",
  "Your rocket cleared the tower with weight and money to spare. Before the long coast to the Moon, how do you use the extra capacity?":
    "Tu cohete dejó la torre con peso y dinero de sobra. Antes del largo trayecto a la Luna, ¿cómo usas la capacidad extra?",
  "Moon transfer burn": "Encendido de transferencia lunar",
  "Extra fuel lets you fine-tune your path around the Moon.": "El combustible extra te permite afinar tu trayectoria alrededor de la Luna.",
  "Warm up the light sensor (+5 science, −3% battery)": "Calentar el sensor de luz (+5 ciencia, −3% batería)",
  "A ready spectrometer, a tool that splits light, collects better Moon data.":
    "Un espectrómetro listo, una herramienta que separa la luz, recoge mejores datos de la Luna.",
  "Move ground savings to reserve (+3% reserve)": "Pasar los ahorros de tierra a la reserva (+3% reserva)",
  "More emergency money for the rest of the trip.": "Más dinero de emergencia para el resto del viaje.",
  "Too heavy for the escape burn!": "¡Demasiado pesada para el encendido de escape!",
  "You are firing the engine to escape Earth's gravity toward a near-Earth asteroid. The spacecraft's weight and cost are pushing the rocket adapter to its limit.":
    "Estás encendiendo el motor para escapar de la gravedad de la Tierra hacia un asteroide cercano. El peso y el costo de la nave llevan el adaptador del cohete al límite.",
  "Escape weight margin": "Margen de peso para el escape",
  "Drop the heavy separation ring early (−50 kg weight)": "Soltar antes el pesado anillo de separación (−50 kg de peso)",
  "Less weight means each kilogram of fuel takes you farther.": "Menos peso significa que cada kilo de combustible te lleva más lejos.",
  "Buy a small booster (−5% reserve, +55 kg fuel)": "Comprar un pequeño propulsor (−5% reserva, +55 kg combustible)",
  "Spends emergency money to give you more fuel for deep space.": "Gasta dinero de emergencia para darte más combustible en el espacio profundo.",
  "Turn off a backup heater (+4% battery, −4 science)": "Apagar un calentador de respaldo (+4% batería, −4 ciencia)",
  "Saves power, but instruments start out a little less ready.": "Ahorra energía, pero los instrumentos empiezan un poco menos listos.",
  "Perfect escape from Earth": "Escape perfecto de la Tierra",
  "Your spacecraft left Earth's gravity right on course for the asteroid, with weight and reserve fund to spare. How do you use this good start?":
    "Tu nave salió de la gravedad terrestre justo en rumbo al asteroide, con peso y reserva de sobra. ¿Cómo aprovechas este buen inicio?",
  "Clean departure": "Salida limpia",
  "Save braking fuel (+35 kg fuel)": "Guardar combustible para frenar (+35 kg combustible)",
  "You will need fuel to slow down and fly close to the asteroid.": "Necesitarás combustible para frenar y volar cerca del asteroide.",
  "Calibrate the mineral sensor on stars (+5 science)": "Calibrar el sensor de minerales con estrellas (+5 ciencia)",
  "A well-tuned infrared sensor identifies asteroid minerals more accurately.":
    "Un sensor infrarrojo bien ajustado identifica con más precisión los minerales del asteroide.",
  "Save unused launch money (+4% reserve)": "Guardar el dinero sobrante del lanzamiento (+4% reserva)",
  "More emergency money for dodging boulders near the asteroid.": "Más dinero de emergencia para esquivar rocas cerca del asteroide.",
  "Mars stack too heavy and over budget!": "¡La nave a Marte pesa demasiado y se pasa del presupuesto!",
  "Your Mars spacecraft, an orbiter plus a sample-return heat shield, is pushing the rocket's limits and the budget cap during the climb. What do you give up?":
    "Tu nave a Marte, un orbitador más un escudo térmico para regresar muestras, lleva al límite al cohete y al presupuesto durante el ascenso. ¿A qué renuncias?",
  "Weight and budget caps": "Límites de peso y presupuesto",
  "Drop cruise trim weights (−60 kg weight)": "Quitar contrapesos de crucero (−60 kg de peso)",
  "Cuts weight so the rocket is not overloaded.": "Reduce peso para no sobrecargar el cohete.",
  "Fund an upper-stage boost (−6% reserve, +65 kg fuel)": "Pagar un empuje de la etapa superior (−6% reserva, +65 kg combustible)",
  "Spends emergency money to make sure you have fuel to reach Mars.": "Gasta dinero de emergencia para asegurar combustible para llegar a Marte.",
  "Postpone extra ground work (−$35M cost, −5 science)": "Posponer trabajo extra en tierra (−$35M de costo, −5 ciencia)",
  "Saves $35 million to stay under budget, but you lose some science.":
    "Ahorra $35 millones para no pasarte del presupuesto, pero pierdes algo de ciencia.",
  "Perfect push toward Mars": "Empuje perfecto hacia Marte",
  "Over 52% of your spacecraft's weight is fuel, a good match for your heavy rocket. You are now cruising to Mars. What comes first?":
    "Más del 52% del peso de tu nave es combustible, buena combinación para tu cohete pesado. Ya vas en camino a Marte. ¿Qué haces primero?",
  "Fuel-to-weight balance": "Equilibrio combustible-peso",
  "Save fuel for Mars arrival (+45 kg fuel)": "Guardar combustible para la llegada a Marte (+45 kg combustible)",
  "You need a big braking burn to be captured into Mars orbit.": "Necesitas un gran encendido de frenado para quedar en órbita de Marte.",
  "Align the cameras during cruise (+6 science, −3% battery)": "Alinear las cámaras durante el crucero (+6 ciencia, −3% batería)",
  "Sharper cameras mean better Mars pictures, for a little battery.": "Cámaras más nítidas significan mejores fotos de Marte, a cambio de algo de batería.",
  "Put launch savings in reserve (+4% reserve)": "Pasar los ahorros del lanzamiento a la reserva (+4% reserva)",
  "Extra emergency money before Mars dust storm season.": "Dinero de emergencia extra antes de la temporada de tormentas de polvo en Marte.",
  "Off-balance spacecraft is wasting fuel!": "¡La nave desequilibrada está desperdiciando combustible!",
  "During a course correction, the spacecraft's center of gravity is off-center (or fuel is tight). The thrusters fight the wobble and burn 1.5 times the normal fuel.":
    "Durante una corrección de rumbo, el centro de gravedad de la nave está descentrado (o el combustible está justo). Los propulsores luchan contra el bamboleo y queman 1.5 veces el combustible normal.",
  "Balance and fuel use": "Equilibrio y consumo de combustible",
  "Re-balance with reaction wheels (normal fuel use, −7% battery)": "Reequilibrar con ruedas de reacción (consumo normal, −7% batería)",
  "Electric spinning wheels steady the craft, so fuel use goes back to normal.":
    "Unas ruedas eléctricas que giran estabilizan la nave, y el consumo de combustible vuelve a la normalidad.",
  "Re-balance by pumping fuel (−4% reserve, +50 kg fuel)": "Reequilibrar bombeando combustible (−4% reserva, +50 kg combustible)",
  "Fixes the balance and frees usable fuel, paid with ground support money.":
    "Corrige el equilibrio y libera combustible útil, pagado con dinero del apoyo en tierra.",
  "Burn anyway without re-balancing (no change)": "Encender de todos modos sin reequilibrar (sin cambios)",
  "Saves battery and reserve, but you keep burning 1.5 times the fuel.": "Ahorra batería y reserva, pero sigues quemando 1.5 veces el combustible.",
  "Balanced and right on course": "Equilibrada y en rumbo",
  "Your center of gravity is well centered, so the main engine burns at normal efficiency. How do you shape your arrival orbit?":
    "Tu centro de gravedad está bien centrado, así que el motor principal trabaja con eficiencia normal. ¿Cómo defines tu órbita de llegada?",
  "Balanced thrust": "Empuje equilibrado",
  "Fly lower to map (+6 science, −20 kg fuel)": "Volar más bajo para mapear (+6 ciencia, −20 kg combustible)",
  "A closer orbit gives sharper science data, using some spare fuel.": "Una órbita más cercana da datos científicos más nítidos, usando algo de combustible sobrante.",
  "Take the low-energy route (+35 kg fuel, +3% battery)": "Tomar la ruta de baja energía (+35 kg combustible, +3% batería)",
  "Saves fuel and power for whatever space throws at you next.": "Ahorra combustible y energía para lo que el espacio te depare.",
  "Reset the steering wheels (+0.03 science quality)": "Reiniciar las ruedas de orientación (+0.03 calidad científica)",
  "A steadier spacecraft lets instruments take sharper readings.": "Una nave más estable permite a los instrumentos tomar lecturas más nítidas.",
  "Wobbling near the Moon, wasting fuel!": "¡Bamboleo cerca de la Luna, desperdiciando combustible!",
  "Approaching the Moon, an off-center center of gravity (or low fuel margin) makes the spacecraft wobble, and it burns 1.5 times the normal fuel. How do you steady it?":
    "Al acercarse a la Luna, un centro de gravedad descentrado (o poco margen de combustible) hace bambolear la nave, que quema 1.5 veces el combustible normal. ¿Cómo la estabilizas?",
  "Gets fuel use back to normal, but drains battery.": "Devuelve el consumo de combustible a la normalidad, pero gasta batería.",
  "Use Moon's gravity (balanced, −4% reserve, +55 kg fuel)": "Usar la gravedad de la Luna (equilibrada, −4% reserva, +55 kg combustible)",
  "The Moon's pull saves fuel; ground teams replan the route with reserve money.":
    "La atracción de la Luna ahorra combustible; los equipos en tierra replanean la ruta con dinero de reserva.",
  "Burn directly without re-balancing (no change)": "Encender directo sin reequilibrar (sin cambios)",
  "Saves battery for solar storms, but you may run out of fuel.": "Ahorra batería para tormentas solares, pero podrías quedarte sin combustible.",
  "Smooth, balanced flyby of the Moon": "Sobrevuelo lunar suave y equilibrado",
  "Your center of gravity stayed within the 0.25 m limit for the Moon mission, so the engine burn is clean and efficient. What do you do at closest approach?":
    "Tu centro de gravedad se mantuvo dentro del límite de 0.25 m de la misión lunar, así que el encendido es limpio y eficiente. ¿Qué haces en el punto más cercano?",
  "Precise Moon flyby": "Sobrevuelo lunar preciso",
  "Skim the polar crater (+6 science, −20 kg fuel)": "Rozar el cráter polar (+6 ciencia, −20 kg combustible)",
  "Spends a little fuel to study possible ice in polar craters.": "Gasta un poco de combustible para estudiar posible hielo en cráteres polares.",
  "Save fuel, charge batteries (+35 kg fuel, +4% battery)": "Ahorrar combustible y cargar baterías (+35 kg combustible, +4% batería)",
  "Builds up survival reserves before crossing the radiation belts.": "Acumula reservas de supervivencia antes de cruzar los cinturones de radiación.",
  "Aim the antenna at Earth (4.6 dB signal)": "Apuntar la antena a la Tierra (señal de 4.6 dB)",
  "A steady craft can point its dish precisely for a stronger signal.": "Una nave estable puede apuntar su antena con precisión para una señal más fuerte.",
  "Crooked braking burn near the asteroid!": "¡Frenado torcido cerca del asteroide!",
  "As you slow down to match the asteroid's path, unevenly placed instruments (or low fuel margin) make you burn 1.5 times the normal fuel. How do you fix it?":
    "Al frenar para igualar la trayectoria del asteroide, los instrumentos mal repartidos (o poco margen de combustible) te hacen quemar 1.5 veces el combustible normal. ¿Cómo lo arreglas?",
  "Low-gravity braking": "Frenado en baja gravedad",
  "Tilt engine to re-balance (normal fuel use, −6% battery)": "Inclinar el motor para reequilibrar (consumo normal, −6% batería)",
  "Points the thrust through the true center of gravity using battery power.":
    "Dirige el empuje por el verdadero centro de gravedad usando energía de la batería.",
  "Drop cover, re-balance (−40 kg weight, +40 kg fuel)": "Soltar la cubierta y reequilibrar (−40 kg de peso, +40 kg combustible)",
  "Fixes the balance, and the lighter craft gets more from its fuel.": "Corrige el equilibrio, y la nave más ligera aprovecha mejor su combustible.",
  "Do a fast flyby instead of stopping (−8 science)": "Hacer un sobrevuelo rápido en vez de detenerse (−8 ciencia)",
  "Less time to collect data, but saves battery and reserve.": "Menos tiempo para reunir datos, pero ahorra batería y reserva.",
  "Gentle braking next to the asteroid": "Frenado suave junto al asteroide",
  "Your center of gravity is balanced within 0.15 m, and you matched the asteroid's spin with fuel to spare. What is your next command?":
    "Tu centro de gravedad está equilibrado dentro de 0.15 m, e igualaste el giro del asteroide con combustible de sobra. ¿Cuál es tu siguiente orden?",
  "Close-up operations": "Operaciones de cerca",
  "Map from 1 km (+7 science, −20 kg fuel)": "Mapear desde 1 km (+7 ciencia, −20 kg combustible)",
  "A very close orbit gives detailed mineral maps, using spare fuel.": "Una órbita muy cercana da mapas detallados de minerales, usando combustible sobrante.",
  "Save fuel for a quick escape (+40 kg fuel)": "Guardar combustible para una salida rápida (+40 kg combustible)",
  "Lets you back away fast if the surface sprays dust during sampling.": "Te permite alejarte rápido si la superficie lanza polvo durante el muestreo.",
  "Charge the battery and onboard computers (+5% battery)": "Cargar la batería y las computadoras de a bordo (+5% batería)",
  "Gets power ready for the risky close approach.": "Prepara la energía para el arriesgado acercamiento.",
  "Mars arrival: balance problem!": "Llegada a Marte: ¡problema de equilibrio!",
  "Approaching Mars, your spacecraft breaks its strict 0.08 m balance limit (or fuel is very short). It could skip off the Martian atmosphere instead of being captured.":
    "Al acercarse a Marte, tu nave rompe su estricto límite de equilibrio de 0.08 m (o le falta mucho combustible). Podría rebotar en la atmósfera marciana en vez de quedar capturada.",
  "Air braking at Mars": "Frenado atmosférico en Marte",
  "Air-brake and re-balance (−7% battery, +60 kg fuel)": "Frenar con la atmósfera y reequilibrar (−7% batería, +60 kg combustible)",
  "Thin upper air slows you down for free; wheels restore normal fuel use.":
    "El aire tenue de la alta atmósfera te frena gratis; las ruedas devuelven el consumo normal.",
  "Shift fuel to re-balance (−5% reserve, +70 kg fuel)": "Mover combustible para reequilibrar (−5% reserva, +70 kg combustible)",
  "Moves fuel from a backup tank to fix the balance; costs reserve money.":
    "Mueve combustible de un tanque de respaldo para corregir el equilibrio; cuesta dinero de reserva.",
  "Drop a spare cruise shield (−55 kg weight)": "Soltar un escudo de crucero de repuesto (−55 kg de peso)",
  "A lighter craft makes the capture burn more likely to succeed.": "Una nave más ligera hace más probable que el encendido de captura funcione.",
  "Perfect capture into Mars orbit": "Captura perfecta en órbita de Marte",
  "Even with the strict 0.08 m Mars balance limit, your spacecraft stayed steady through the main engine burn. How do you adjust your orbit?":
    "Aun con el estricto límite de equilibrio de 0.08 m en Marte, tu nave se mantuvo estable durante el encendido principal. ¿Cómo ajustas tu órbita?",
  "Sun-synced Mars orbit": "Órbita marciana sincronizada con el Sol",
  "Enter low sun-synced orbit (+8 science, −25 kg fuel)": "Entrar en órbita baja sincronizada con el Sol (+8 ciencia, −25 kg combustible)",
  "The same lighting every pass gives the best close-up images of Jezero Crater.":
    "La misma iluminación en cada pasada da las mejores imágenes de cerca del cráter Jezero.",
  "Save fuel for the trip home (+50 kg fuel)": "Guardar combustible para el regreso (+50 kg combustible)",
  "The samples still need fuel to get back to Earth.": "Las muestras todavía necesitan combustible para volver a la Tierra.",
  "Warm and charge the batteries (+6% battery)": "Calentar y cargar las baterías (+6% batería)",
  "More battery power before Martian dust storms block the Sun.": "Más batería antes de que las tormentas de polvo marcianas tapen el Sol.",
  "Space storm hits with low reserves!": "¡Llega una tormenta espacial con reservas bajas!",
  "A strong space weather event hits while your battery, self-driving camera, or reserve fund is dangerously low. Check what you packed and choose.":
    "Un fuerte evento de clima espacial llega mientras tu batería, tu cámara autónoma o tu fondo de reserva están peligrosamente bajos. Revisa lo que empacaste y elige.",
  "Space weather": "Clima espacial",
  "Fund backup power, self-driving camera (−5% reserve, +12% battery)": "Pagar energía de respaldo y cámara autónoma (−5% reserva, +12% batería)",
  "Emergency money restores the battery and turns on camera-based navigation.":
    "El dinero de emergencia recupera la batería y activa la navegación con cámara.",
  "Turn off heaters for power (+15% battery, −6 science)": "Apagar calentadores para ganar energía (+15% batería, −6 ciencia)",
  "Gives up a little science to keep power above safe-mode level.": "Sacrifica un poco de ciencia para mantener la energía por encima del modo seguro.",
  "Hide in safe mode (only 85% data delivered)": "Refugiarse en modo seguro (solo se entrega el 85% de los datos)",
  "Protects the spacecraft, but storm noise means less data reaches Earth.":
    "Protege la nave, pero el ruido de la tormenta hace que lleguen menos datos a la Tierra.",
  "Storm survived thanks to good packing": "Tormenta superada gracias a un buen equipaje",
  "When the space hazard hit, your heat shield, power source, self-driving camera, and reserve fund absorbed it. How do you use this calm moment?":
    "Cuando llegó el peligro espacial, tu escudo térmico, tu fuente de energía, tu cámara autónoma y tu fondo de reserva lo absorbieron. ¿Cómo aprovechas esta calma?",
  "Strong reserves": "Reservas sólidas",
  "Measure the storm's light (+8 science, −4% battery)": "Medir la luz de la tormenta (+8 ciencia, −4% batería)",
  "Turns the hazard into bonus science using spare battery.": "Convierte el peligro en ciencia extra usando batería sobrante.",
  "Boost the radio (4.5 dB signal, 100% delivered)": "Potenciar la radio (señal de 4.5 dB, 100% entregado)",
  "Spare power makes sure the final data transfer to Earth goes smoothly.":
    "La energía sobrante asegura que el envío final de datos a la Tierra salga bien.",
  "Keep all reserves, top up battery (+5% battery)": "Conservar todas las reservas y recargar batería (+5% batería)",
  "Maximum safety margin all the way back to Earth.": "Máximo margen de seguridad hasta volver a la Tierra.",
  "Solar storm hits on the way home!": "¡Una tormenta solar golpea en el regreso!",
  "A burst of particles from the Sun sweeps between Earth and the Moon. Your battery is under 15% or your heat protection is weak, before re-entering Earth's air at 40,000 km/h.":
    "Una ráfaga de partículas del Sol barre el espacio entre la Tierra y la Luna. Tu batería está por debajo del 15% o tu protección térmica es débil, antes de reentrar a la atmósfera a 40,000 km/h.",
  "Solar storm": "Tormenta solar",
  "Switch to backup power cells (−5% reserve, +12% battery)": "Cambiar a celdas de energía de respaldo (−5% reserva, +12% batería)",
  "Keeps Orion's battery up so it does not drop into safe mode.": "Mantiene la batería de Orion arriba para que no caiga en modo seguro.",
  "Put Moon cameras to sleep (+15% battery, −6 science)": "Poner a dormir las cámaras lunares (+15% batería, −6 ciencia)",
  "Protects the systems needed for re-entry by pausing extra imaging.":
    "Protege los sistemas necesarios para la reentrada pausando las fotos extra.",
  "Saves reserve money, but storm noise means less data reaches Earth.":
    "Ahorra dinero de reserva, pero el ruido de la tormenta hace que lleguen menos datos a la Tierra.",
  "Storm passed, heat shield ready": "La tormenta pasó, escudo térmico listo",
  "Your fuel cells and batteries (at least 15% charge) plus your heat shield handled the solar storm without losing contact. What is your order?":
    "Tus celdas de combustible y baterías (al menos 15% de carga) y tu escudo térmico resistieron la tormenta solar sin perder contacto. ¿Cuál es tu orden?",
  "Study the solar flare's light (+8 science, −4% battery)": "Estudiar la luz de la llamarada solar (+8 ciencia, −4% batería)",
  "Rare readings of solar flare light earn bonus science.": "Las lecturas poco comunes de la luz de una llamarada dan ciencia extra.",
  "Boost the radio (4.6 dB signal, 100% delivered)": "Potenciar la radio (señal de 4.6 dB, 100% entregado)",
  "Spare power guarantees a clean connection to Earth's big antennas.": "La energía sobrante garantiza una conexión limpia con las grandes antenas de la Tierra.",
  "Top up the re-entry battery (+5% battery)": "Recargar la batería de reentrada (+5% batería)",
  "Extra power for the 40,000 km/h plunge through Earth's air.": "Energía extra para la caída a 40,000 km/h por la atmósfera terrestre.",
  "Dust cloud blinds your navigation!": "¡Una nube de polvo ciega tu navegación!",
  "Descending toward the asteroid, a cloud of gravel and dust blinds the cameras that steer by the stars. Without a self-driving camera or at least 15% reserve, crash risk is high.":
    "Al descender hacia el asteroide, una nube de grava y polvo ciega las cámaras que se guían por las estrellas. Sin cámara autónoma o al menos 15% de reserva, el riesgo de choque es alto.",
  "Camera navigation": "Navegación con cámara",
  "Upload self-driving camera software (−8% reserve, −5% battery)": "Subir el software de cámara autónoma (−8% reserva, −5% batería)",
  "Lets the probe steer by recognizing surface features, paid with ground support money.":
    "Permite a la sonda guiarse reconociendo el terreno, pagado con dinero del apoyo en tierra.",
  "Retreat, enable self-driving camera (−5% reserve, −25 kg fuel)": "Retroceder y activar la cámara autónoma (−5% reserva, −25 kg combustible)",
  "Burns fuel to clear the dust, then locks on with camera navigation.": "Quema combustible para salir del polvo y luego se fija con navegación por cámara.",
  "Stay high above the surface (−8 science)": "Mantenerse alto sobre la superficie (−8 ciencia)",
  "Avoids the boulders, but you collect fewer close-up readings.": "Evita las rocas, pero reúnes menos lecturas de cerca.",
  "Safe touch-and-go between boulders": "Toque y despegue seguro entre rocas",
  "Your self-driving camera, which steers by recognizing surface features, and a reserve fund of 15% or more guided the probe past the giant boulder nicknamed Mount Doom. What next?":
    "Tu cámara autónoma, que se guía reconociendo el terreno, y un fondo de reserva de 15% o más llevaron la sonda más allá de la roca gigante apodada Monte del Destino. ¿Y ahora?",
  "Touch-and-go sampling": "Muestreo de toque y despegue",
  "Scan extra surface dust (+9 science, −3% battery)": "Escanear polvo extra de la superficie (+9 ciencia, −3% batería)",
  "Close-range infrared readings reveal water-bearing minerals.": "Las lecturas infrarrojas de cerca revelan minerales con agua.",
  "Makes sure all 160 gigabits of asteroid data reach Earth.": "Asegura que los 160 gigabits de datos del asteroide lleguen a la Tierra.",
  "Puff gas to clean solar panels (+5% battery)": "Soplar gas para limpiar los paneles solares (+5% batería)",
  "Dust-free panels make more power after leaving the dust cloud.": "Los paneles sin polvo generan más energía al salir de la nube.",
  "Dust storm and a stuck sample arm!": "¡Tormenta de polvo y un brazo de muestras atorado!",
  "A Martian dust storm cuts sunlight to 43% and the sample arm jams. Without a nuclear battery (RTG) or 25% battery, plus a 20% reserve, half the sample tubes are at risk.":
    "Una tormenta de polvo marciana reduce la luz solar al 43% y el brazo de muestras se atora. Sin batería nuclear (RTG) o 25% de batería, más un 20% de reserva, la mitad de los tubos de muestras corren peligro.",
  "Nuclear power vs dust": "Energía nuclear contra el polvo",
  "Shake the arm free (−8% reserve, +12% battery)": "Sacudir el brazo para liberarlo (−8% reserva, +12% batería)",
  "Vibration frees the stuck arm and backup power refills the battery.": "La vibración libera el brazo atorado y la energía de respaldo recarga la batería.",
  "Reroute heater power (+15% battery, −6% reserve, −6 science)": "Redirigir la energía de los calentadores (+15% batería, −6% reserva, −6 ciencia)",
  "Moves power to the arm so every sample tube is loaded in time.": "Lleva energía al brazo para cargar a tiempo cada tubo de muestras.",
  "Launch now with the tubes you have (no change)": "Despegar ya con los tubos que tienes (sin cambios)",
  "Guarantees the small rocket leaves Mars, but some tubes stay behind.": "Garantiza que el pequeño cohete salga de Marte, pero algunos tubos se quedan.",
  "Nuclear power beats the dust storm": "La energía nuclear vence a la tormenta de polvo",
  "Dust darkened the Martian sky, but your nuclear battery (RTG) or high charge, plus a 20% reserve, kept the arm warm. Every sample tube is sealed in its capsule.":
    "El polvo oscureció el cielo marciano, pero tu batería nuclear (RTG) o tu carga alta, más un 20% de reserva, mantuvieron caliente el brazo. Cada tubo de muestras está sellado en su cápsula.",
  "All-weather nuclear power": "Energía nuclear para cualquier clima",
  "Run an extra life-sign scan (+9 science, −4% battery)": "Hacer un escaneo extra de señales de vida (+9 ciencia, −4% batería)",
  "Uses spare power to double-check the tubes for signs of past life.": "Usa energía sobrante para revisar otra vez los tubos en busca de señales de vida pasada.",
  "Power the relay dish (4.6 dB signal, 100% delivered)": "Darle energía a la antena de enlace (señal de 4.6 dB, 100% entregado)",
  "Keeps the Mars-to-Earth link well above the 3 dB minimum.": "Mantiene el enlace Marte-Tierra muy por encima del mínimo de 3 dB.",
  "Save power for the trip home (+6% battery)": "Guardar energía para el regreso (+6% batería)",
  "Maximum safety margin for the return orbiter that catches the samples.": "Máximo margen de seguridad para el orbitador que atrapa las muestras.",
  "Weak signal, memory full of data!": "¡Señal débil y memoria llena de datos!",
  "Solar noise and huge distance have dropped your signal margin below the 3 dB minimum for NASA's Deep Space Network antennas, while 160 gigabits of science wait in memory.":
    "El ruido solar y la enorme distancia bajaron tu margen de señal por debajo del mínimo de 3 dB para las antenas de la Red de Espacio Profundo de la NASA, mientras 160 gigabits de ciencia esperan en memoria.",
  "Signal strength": "Fuerza de la señal",
  "Compress data (3.4 dB signal, 96% delivered, −4% battery)": "Comprimir datos (señal de 3.4 dB, 96% entregado, −4% batería)",
  "Sends the most valuable science first and re-locks the signal, using some battery.":
    "Envía primero la ciencia más valiosa y vuelve a fijar la señal, usando algo de batería.",
  "Boost antenna (3.8 dB signal, 100% delivered, −5 science)": "Potenciar la antena (señal de 3.8 dB, 100% entregado, −5 ciencia)",
  "Turns off some instruments to push their power into the antenna.": "Apaga algunos instrumentos para mandar su energía a la antena.",
  "Send slowly and safely (3.2 dB signal, 78% delivered)": "Enviar lento y seguro (señal de 3.2 dB, 78% entregado)",
  "A slow, steady signal is reliable, but not all the data gets home.": "Una señal lenta y estable es confiable, pero no todos los datos llegan a casa.",
  "Big antenna locked on Earth": "La gran antena fijada en la Tierra",
  "Your signal is well above the 3 dB minimum and the control channel is clear. How do you send the final 160 gigabits of science to Earth?":
    "Tu señal está muy por encima del mínimo de 3 dB y el canal de control está despejado. ¿Cómo envías los últimos 160 gigabits de ciencia a la Tierra?",
  "Fast data link": "Enlace de datos rápido",
  "Send the full archive (100% delivered, +5 science)": "Enviar el archivo completo (100% entregado, +5 ciencia)",
  "Everything reaches Earth, including bonus calibrated readings.": "Todo llega a la Tierra, incluidas lecturas calibradas extra.",
  "Compare with lab standards (100% delivered, +0.04 science quality)": "Comparar con estándares de laboratorio (100% entregado, +0.04 calidad científica)",
  "Comparing with reference samples on Earth makes your results more accurate.":
    "Comparar con muestras de referencia en la Tierra hace tus resultados más precisos.",
  "Send at normal speed (100% delivered, +3% battery)": "Enviar a velocidad normal (100% entregado, +3% batería)",
  "All the data arrives while you save battery.": "Llegan todos los datos mientras ahorras batería.",
  "Moon about to block your signal!": "¡La Luna está por bloquear tu señal!",
  "Soon the Moon will block your line of sight to Earth. Your radio signal margin is below 3 dB and the 160-gigabit recorder is still full. Pick a plan.":
    "Pronto la Luna tapará tu línea de vista con la Tierra. Tu margen de señal de radio está por debajo de 3 dB y la grabadora de 160 gigabits sigue llena. Elige un plan.",
  "Moon radio link": "Enlace de radio lunar",
  "Sends the key ice and light data first, before contact is lost.": "Envía primero los datos clave de hielo y luz, antes de perder contacto.",
  "Moves spare power to the dish; some extra science is lost.": "Lleva la energía sobrante a la antena; se pierde algo de ciencia extra.",
  "Sturdier error-proof coding keeps the link, but only part gets through.":
    "Una codificación más resistente a errores mantiene el enlace, pero solo pasa una parte.",
  "Clear signal, getting ready to splash down": "Señal clara, preparándose para amerizar",
  "Your signal is locked above 3 dB on the Deep Space Network station in Madrid, and the heat shield is ready. The 160-gigabit recorder is sending smoothly. Final order?":
    "Tu señal está fijada por encima de 3 dB en la estación de la Red de Espacio Profundo en Madrid, y el escudo térmico está listo. La grabadora de 160 gigabits envía sin problemas. ¿Orden final?",
  "Data and splashdown": "Datos y amerizaje",
  "Send all Moon data (100% delivered, +5 science)": "Enviar todos los datos lunares (100% entregado, +5 ciencia)",
  "Every bit of Moon science gets home.": "Cada bit de ciencia lunar llega a casa.",
  "Improves the accuracy of your light readings before splashdown.": "Mejora la precisión de tus lecturas de luz antes del amerizaje.",
  "Normal send, save re-entry power (100% delivered, +3% battery)": "Envío normal, guardar energía de reentrada (100% entregado, +3% batería)",
  "All the data arrives and you keep extra battery for splashdown.": "Llegan todos los datos y conservas batería extra para el amerizaje.",
  "So far away the signal fades!": "¡Tan lejos que la señal se desvanece!",
  "Millions of kilometers from Earth, the radio signal spreads out and weakens, dropping your margin below 3 dB. 160 gigabits of asteroid mineral maps wait in memory.":
    "A millones de kilómetros de la Tierra, la señal de radio se dispersa y se debilita, bajando tu margen de 3 dB. 160 gigabits de mapas de minerales del asteroide esperan en memoria.",
  "Distance weakens signals": "La distancia debilita las señales",
  "Compress data (3.5 dB signal, 96% delivered, −4% battery)": "Comprimir datos (señal de 3.5 dB, 96% entregado, −4% batería)",
  "Packs the mineral readings tightly without losing detail, using some battery.":
    "Empaqueta bien las lecturas de minerales sin perder detalle, usando algo de batería.",
  "Boost antenna (3.9 dB signal, 100% delivered, −5 science)": "Potenciar la antena (señal de 3.9 dB, 100% entregado, −5 ciencia)",
  "Turns off the wide-view camera so its power goes to the radio.": "Apaga la cámara de vista amplia para que su energía vaya a la radio.",
  "Send key minerals slowly (3.2 dB signal, 78% delivered)": "Enviar lento los minerales clave (señal de 3.2 dB, 78% entregado)",
  "Steady and safe, but part of the dataset stays on board.": "Estable y seguro, pero parte de los datos se queda a bordo.",
  "Strong 4.2 dB link to Earth": "Enlace fuerte de 4.2 dB con la Tierra",
  "Your signal code unlocked the radio, and your 3 m dish holds a solid link above 3 dB to the giant 70 m Goldstone antenna in California. How do you finish?":
    "Tu código de señal desbloqueó la radio, y tu antena de 3 m mantiene un enlace sólido por encima de 3 dB con la gigantesca antena de 70 m de Goldstone, en California. ¿Cómo terminas?",
  "Giant Earth antennas": "Antenas gigantes en la Tierra",
  "Send full 3D asteroid map (100% delivered, +6 science)": "Enviar el mapa 3D completo del asteroide (100% entregado, +6 ciencia)",
  "All the data arrives, with bonus science from the boulder and mineral map.": "Llegan todos los datos, con ciencia extra del mapa de rocas y minerales.",
  "Matching mineral readings to a reference library makes results more accurate.":
    "Comparar las lecturas de minerales con una biblioteca de referencia hace los resultados más precisos.",
  "Normal send, save fuel (100% delivered, +25 kg fuel)": "Envío normal, ahorrar combustible (100% entregado, +25 kg combustible)",
  "Leftover fuel could let the mission visit more places later.": "El combustible sobrante podría permitir que la misión visite más lugares después.",
  "The Sun is about to block Mars!": "¡El Sol está por tapar a Marte!",
  "Soon Mars passes behind the Sun, cutting contact for about two weeks. Signals already take 4 to 25 minutes each way, and your margin is under 3 dB. Act now!":
    "Pronto Marte pasará detrás del Sol y se cortará el contacto unas dos semanas. Las señales ya tardan de 4 a 25 minutos en cada sentido, y tu margen está por debajo de 3 dB. ¡Actúa ya!",
  "Sun blocks Mars signal": "El Sol bloquea la señal de Marte",
  "Rush data (3.5 dB signal, 96% delivered, −5% battery)": "Enviar datos de prisa (señal de 3.5 dB, 96% entregado, −5% batería)",
  "Gets the sample list and life-sign readings home before the blackout.":
    "Manda a casa la lista de muestras y las lecturas de señales de vida antes del apagón.",
  "Turns off the radar so its power goes to the dish.": "Apaga el radar para que su energía vaya a la antena.",
  "Store the rest (3.2 dB signal, 78% delivered)": "Guardar el resto (señal de 3.2 dB, 78% entregado)",
  "Keeps a safe link now; the rest waits in memory until after the blackout.":
    "Mantiene un enlace seguro ahora; el resto espera en memoria hasta después del apagón.",
  "Fast link to Earth before the blackout": "Enlace rápido con la Tierra antes del apagón",
  "Your 3 m antenna is locked above 3 dB onto Deep Space Network stations in Australia and California, emptying the 160-gigabit recorder before the Sun blocks Mars.":
    "Tu antena de 3 m está fijada por encima de 3 dB en estaciones de la Red de Espacio Profundo en Australia y California, vaciando la grabadora de 160 gigabits antes de que el Sol tape a Marte.",
  "Fast Mars data link": "Enlace rápido de datos desde Marte",
  "Send all Mars data (100% delivered, +7 science)": "Enviar todos los datos de Marte (100% entregado, +7 ciencia)",
  "Every gigabit reaches Earth with the most science possible.": "Cada gigabit llega a la Tierra con la mayor ciencia posible.",
  "A lab reference sharpens the life-sign readings.": "Una referencia de laboratorio afina las lecturas de señales de vida.",
  "Finish sending, save capsule power (100% delivered, +4% battery)": "Terminar el envío y guardar energía de la cápsula (100% entregado, +4% batería)",
  "All the data arrives and the return capsule keeps extra power.": "Llegan todos los datos y la cápsula de regreso conserva energía extra.",

  // --- Survival events
  "Solar radiation storm": "Tormenta de radiación solar",
  "A solar flare floods the cabin path with protons. Heaters and shielding drain the batteries.":
    "Una llamarada solar inunda la ruta de la cabina con protones. Los calentadores y el blindaje agotan las baterías.",
  "The RTG kept power steady through the storm.": "El RTG mantuvo la energía estable durante la tormenta.",
  "Micrometeoroid strike": "Impacto de micrometeorito",
  "A sand-grain-sized particle punches the hull. Repairs eat into the reserve fund.":
    "Una partícula del tamaño de un grano de arena perfora el casco. Las reparaciones consumen el fondo de reserva.",
  "The heat shield layers absorbed most of the hit.": "Las capas del escudo térmico absorbieron casi todo el golpe.",
  "Ground station dropout": "Caída de una estación terrestre",
  "A Deep Space Network antenna goes offline for maintenance. The link gets weaker.":
    "Una antena de la Red de Espacio Profundo se desconecta por mantenimiento. El enlace se debilita.",
  "Your clean signal code let a backup antenna lock on fast.": "Tu código de señal limpio permitió que una antena de respaldo se fijara rápido.",
  "Asteroid particle ejection": "Expulsión de partículas del asteroide",
  "The asteroid sheds pebbles like Bennu did. Navigating around them costs reserve.":
    "El asteroide suelta piedritas como lo hizo Bennu. Esquivarlas cuesta reserva.",
  "Self-driving navigation dodged the debris on its own.": "La navegación autónoma esquivó los escombros por sí sola.",
  "A solar flare hits deep space. Shielding drains the batteries.": "Una llamarada solar golpea el espacio profundo. El blindaje agota las baterías.",
  "A Deep Space Network antenna goes offline. The link gets weaker.": "Una antena de la Red de Espacio Profundo se desconecta. El enlace se debilita.",
  "Global dust storm": "Tormenta de polvo global",
  "A planet-wide dust storm blocks the Sun for weeks. Solar power collapses.":
    "Una tormenta de polvo que cubre el planeta tapa el Sol durante semanas. La energía solar se desploma.",
  "Nuclear power does not need sunlight: the RTG carried you through.": "La energía nuclear no necesita luz solar: el RTG te sacó adelante.",
  "Solar conjunction": "Conjunción solar",
  "Mars slips behind the Sun. Radio signals pass through solar plasma and get noisy.":
    "Marte queda detrás del Sol. Las señales de radio atraviesan el plasma solar y se llenan de ruido.",
  "Your error-checked signal code survived the noise.": "Tu código de señal con verificación de errores resistió el ruido.",
  "A tiny particle punches the hull. Repairs eat into the reserve fund.": "Una partícula diminuta perfora el casco. Las reparaciones consumen el fondo de reserva.",

  // --- Catalog facts shown in the report
  "NASA's Artemis I (2022) flew Orion to a distant retrograde orbit around the Moon and tested its heat shield on a reentry at nearly 40,000 km/h; Artemis II flies its crew on a free-return path around the Moon.":
    "Artemis I de la NASA (2022) llevó a Orion a una órbita retrógrada distante alrededor de la Luna y probó su escudo térmico en una reentrada a casi 40,000 km/h; Artemis II lleva a su tripulación en una trayectoria de retorno libre alrededor de la Luna.",
  "NASA OSIRIS-REx used Natural Feature Tracking (visual autonomy) at asteroid Bennu because deep-space light-time delay prevented real-time Earth piloting.":
    "OSIRIS-REx de la NASA usó seguimiento de rasgos naturales (autonomía visual) en el asteroide Bennu, porque el retraso de la señal en el espacio profundo impedía pilotearla en tiempo real desde la Tierra.",
  "Over 52% of NASA MRO's 2,180 kg launch mass was propellant (1,149 kg), and its 3 m High-Gain Antenna downlinks up to 6 Mbps to the Deep Space Network from a 160 Gbit solid-state recorder.":
    "Más del 52% de los 2,180 kg de MRO de la NASA al despegar era combustible (1,149 kg), y su antena de alta ganancia de 3 m envía hasta 6 Mbps a la Red de Espacio Profundo desde una grabadora de estado sólido de 160 Gbit.",
  "Game-scaled budget: NASA's independent review (2023) estimated the real Mars Sample Return campaign at several billion dollars more, which is why NASA re-planned it.":
    "Presupuesto a escala del juego: la revisión independiente de la NASA (2023) estimó la campaña real de Retorno de Muestras de Marte en varios miles de millones de dólares más, por eso la NASA la replanteó.",

  // --- Fixed report sentences
  "LOST ON RE-ENTRY: the ship made the whole trip but burned up when it hit Earth's atmosphere, because the heat shield / sample capsule was left out in station 2A.":
    "PERDIDA EN LA REENTRADA: la nave hizo todo el viaje pero se quemó al entrar a la atmósfera terrestre, porque el escudo térmico / la cápsula de muestras se quedó fuera en la estación 2A.",
  "Efficiency: the ship used most of the rocket's capacity; a lighter ship or a bigger rocket scores higher.":
    "Eficiencia: la nave usó casi toda la capacidad del cohete; una nave más ligera o un cohete más grande dan más puntos.",
  "Efficiency: most of the budget was spent; cheaper choices leave more money unspent.":
    "Eficiencia: se gastó casi todo el presupuesto; decisiones más baratas dejan más dinero sin gastar.",
  "Efficiency: a faster route to the target saves time.": "Eficiencia: una ruta más rápida al destino ahorra tiempo.",
  "No decisions recorded for this role": "No se registraron decisiones para este rol",
};

/** Sentences with numbers or names. Applied in order with String.replace on the whole text. */
export const ES_PATTERNS: Array<[RegExp, string]> = [
  // Report verdict prefixes and causes (backend/decision_tree.py)
  [/^PARTIAL SUCCESS: /, "ÉXITO PARCIAL: "],
  [/LAUNCH SCRUBBED: the spacecraft does not fit inside the nose cone \(fairing\) of (.+?)\. Seal the fairing or pick a bigger rocket in station 1B\./,
    "LANZAMIENTO CANCELADO: la nave no cabe dentro de la cofia de $1. Sella la cofia o elige un cohete más grande en la estación 1B."],
  [/TOO HEAVY TO LAUNCH: the loaded ship weighed ([\d.,]+) kg \(([\d.,]+) kg body \+ ([\d.,]+) kg instruments \+ ([\d.,]+) kg fuel\), but (.+?) can only send ([\d.,]+) kg to this destination: ([\d.,]+) kg over\./,
    "DEMASIADO PESADA PARA DESPEGAR: la nave cargada pesaba $1 kg ($2 kg de cuerpo + $3 kg de instrumentos + $4 kg de combustible), pero $5 solo puede enviar $6 kg a este destino: $7 kg de más."],
  [/OVER BUDGET: the mission cost \$([\d.,]+)M, \$([\d.,]+)M over the \$([\d.,]+)M limit \(the reserve fund was ([\d.,]+)%\)\. Real NASA missions that overrun this much face cancellation reviews\./,
    "SOBRE PRESUPUESTO: la misión costó $$$1M, $$$2M por encima del límite de $$$3M (el fondo de reserva era de $4%). Las misiones reales de la NASA que se exceden tanto enfrentan revisiones de cancelación."],
  [/OUT OF FUEL BEFORE ARRIVAL: the ship could change its speed by only ([\d.,]+) m\/s \(delta-v\) but the route needs ([\d.,]+) m\/s, because /,
    "SIN COMBUSTIBLE ANTES DE LLEGAR: la nave solo podía cambiar su velocidad en $1 m/s (delta-v) pero la ruta necesita $2 m/s, porque "],
  [/an unbalanced ship \(station 2B\) burned ([\d.,]+)x the fuel \(from ([\d.,]+) down to ([\d.,]+) m\/s\)/,
    "una nave desequilibrada (estación 2B) quemó $1 veces el combustible (de $2 bajó a $3 m/s)"],
  [/the simple hydrazine engine \(efficiency ([\d.,]+) s, station 3A\) gets less push from each kilogram of fuel/,
    "el motor simple de hidracina (eficiencia de $1 s, estación 3A) saca menos empuje de cada kilo de combustible"],
  [/the fuel load was too small for the chosen route/, "la carga de combustible era muy pequeña para la ruta elegida"],
  [/(\)|combustible|route) and (el motor|una nave|la carga)/, "$1 y $2"],
  [/A solar storm forced the ship into safe mode: its battery reserve was ([\d.,]+)%, below the 15% it needs\./,
    "Una tormenta solar puso la nave en modo seguro: su reserva de batería era de $1%, por debajo del 15% que necesita."],
  [/Dust and small rocks near the asteroid confused navigation \(self-driving camera (on|off), reserve fund ([\d.,]+)%\)\./,
    "El polvo y las rocas pequeñas cerca del asteroide confundieron la navegación (cámara autónoma $1, fondo de reserva de $2%)."],
  [/cámara autónoma on,/g, "cámara autónoma encendida,"],
  [/cámara autónoma off,/g, "cámara autónoma apagada,"],
  [/A Mars dust storm and a jammed sample arm cut the samples collected \(power: (.+?), battery ([\d.,]+)%, reserve fund ([\d.,]+)%\)\./,
    "Una tormenta de polvo en Marte y un brazo de muestras atorado redujeron las muestras recolectadas (energía: $1, batería $2%, fondo de reserva $3%)."],
  [/energía: nuclear battery \(RTG\)/g, "energía: batería nuclear (RTG)"],
  [/energía: solar panels/g, "energía: paneles solares"],
  [/energía: fuel cells/g, "energía: celdas de combustible"],
  [/energía: big batteries/g, "energía: baterías grandes"],
  [/Too much data for the radio: the instruments make ([\d.,]+) Gbit a day, but a ([\d.,]+) Mbps link sends at most ([\d.,]+) Gbit in the ~([\d.,]+) h a day a mission really gets on NASA's big antennas\./,
    "Demasiados datos para la radio: los instrumentos generan $1 Gbit al día, pero un enlace de $2 Mbps envía como máximo $3 Gbit en las ~$4 h diarias que una misión realmente obtiene en las grandes antenas de la NASA."],
  [/Time: the chosen route takes ([\d.,]+) days vs ([\d.,]+) on the fastest one, lowering mission efficiency\./,
    "Tiempo: la ruta elegida tarda $1 días contra $2 de la más rápida, lo que baja la eficiencia de la misión."],
  [/Weak radio link: the signal margin was ([-\d.,]+) dB \(3 dB needed\), so only ([\d.,]+)% of the science made it home; the rest stayed on the recorder\./,
    "Enlace de radio débil: el margen de señal fue de $1 dB (se necesitan 3 dB), así que solo el $2% de la ciencia llegó a casa; el resto se quedó en la grabadora."],
  [/Only ([\d.,]+)% of the science made it home: the signal was strong enough \(([-\d.,]+) dB\) but the link ran below full efficiency \(signal code or data limits\), so the rest stayed on the recorder\./,
    "Solo el $1% de la ciencia llegó a casa: la señal era suficientemente fuerte ($2 dB) pero el enlace no funcionó a plena eficiencia (código de señal o límites de datos), así que el resto se quedó en la grabadora."],
  [/The instruments were roughly calibrated \(quality ([\d.,]+) of 1\.00 in station 4A\), so the chemical readings were less reliable\./,
    "Los instrumentos quedaron mal calibrados (calidad de $1 sobre 1.00 en la estación 4A), así que las lecturas químicas fueron menos confiables."],
  [/FULL SUCCESS! Your team launched a ([\d.,]+) kg ship on (.+?) \(limit ([\d.,]+) kg\), kept it balanced, saved a ([\d.,]+)% reserve fund for surprises, calibrated the instruments \(quality ([\d.,]+) of 1\.00\) and kept a strong ([-\d.,]+) dB radio link home\./,
    "¡ÉXITO TOTAL! Tu equipo lanzó una nave de $1 kg en $2 (límite $3 kg), la mantuvo equilibrada, guardó un fondo de reserva del $4% para imprevistos, calibró los instrumentos (calidad $5 sobre 1.00) y mantuvo un enlace de radio fuerte de $6 dB con la Tierra."],
  // Score tips
  [/Objective: mission quality reached ([\d.,]+)%\. Hazards, the radio link and instrument quality all count; strengthen the weakest one\./,
    "Objetivo: la calidad de la misión llegó al $1%. Cuentan los peligros, el enlace de radio y la calidad de los instrumentos; refuerza el más débil."],
  [/Science: carry more or better instruments \(science value ([\d.,]+) of 100\)\./,
    "Ciencia: lleva más instrumentos o mejores (valor científico de $1 sobre 100)."],
  [/Science: calibrate the instruments more precisely \(quality ([\d.,]+) of 1\.00\)\./,
    "Ciencia: calibra los instrumentos con más precisión (calidad de $1 sobre 1.00)."],
  // Crew summaries (backend/game_manager.py _summarize_role_contribution)
  [/Budget split \$([\d.,]+)M engineering \/ \$([\d.,]+)M science/g, "Presupuesto: $$$1M ingeniería / $$$2M ciencia"],
  [/reserve fund ([\d.,]+)%/g, "fondo de reserva $1%"],
  [/(^|, )rocket /g, "$1cohete "],
  [/Ship body ([\d.,]+) kg/g, "Cuerpo de la nave $1 kg"],
  [/heat shield fitted/g, "escudo térmico instalado"],
  [/NO heat shield/g, "SIN escudo térmico"],
  [/UNBALANCED \(burns 1\.5x fuel\)/g, "DESEQUILIBRADA (quema 1.5 veces el combustible)"],
  [/well balanced/g, "bien equilibrada"],
  [/Route: /g, "Ruta: "],
  [/(^|, )engine efficiency ([\d.,]+) s/g, "$1motor con eficiencia de $2 s"],
  [/(^|, )engine /g, "$1motor "],
  [/(^|, )fuel ([\d.,]+) kg/g, "$1combustible $2 kg"],
  [/power: nuclear battery \(RTG\)/g, "energía: batería nuclear (RTG)"],
  [/power: solar panels/g, "energía: paneles solares"],
  [/power: fuel cells/g, "energía: celdas de combustible"],
  [/power: big batteries/g, "energía: baterías grandes"],
  [/Instruments ([\d.,]+) kg/g, "Instrumentos $1 kg"],
  [/calibration quality ([\d.,]+) of 1\.00/g, "calidad de calibración $1 sobre 1.00"],
  [/radio signal margin ([-+\d.,]+) dB/g, "margen de señal de radio $1 dB"],
  [/ \(AI autopilot\)/g, " (piloto automático)"],
  // Catalog names that appear inside server sentences (routes, engines)
  [/Direct Lunar Route \(3 days\)/g, "Ruta lunar directa (3 días)"],
  [/Free-Return Trajectory \(10 days\)/g, "Trayectoria de retorno libre (10 días)"],
  [/Fast Asteroid Flyby \(15 min window\)/g, "Sobrevuelo rápido del asteroide (ventana de 15 min)"],
  [/Full Orbital Insertion \(Bennu Rendezvous\)/g, "Inserción orbital completa (encuentro con Bennu)"],
  [/MAV 30 Sample Tubes \(Full Cache\)/g, "MAV con 30 tubos de muestras (carga completa)"],
  [/MAV 15 Sample Tubes \(-150 kg, RTG Friendly\)/g, "MAV con 15 tubos de muestras (-150 kg, apto para RTG)"],
  [/Hydrazine Monopropellant/g, "Monopropelente de hidracina"],
  [/MMH\/NTO Bipropellant/g, "Bipropelente MMH/NTO"],
  [/Hall Effect Electric Thruster/g, "Propulsor eléctrico de efecto Hall"],
];
