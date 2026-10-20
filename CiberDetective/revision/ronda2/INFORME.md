# Informe de dirección de arte: CiberDetective, Puerto Nexo (ronda 2)

Capturas revisadas: 01_menu, 02_partida_incidentes, 03_ciudad_vieja, 04_tablero_investigacion, 05_detective_central (800x450, formato .jpg). Comparación a ciegas: A = estas capturas, B = estándar visual de AoE2 DE.

## Puntajes

| # | Criterio | Nota | Ganador | Justificación |
|---|---|---|---|---|
| 1 | Composición y legibilidad | 7.5 | B | En 03 la lectura es excelente (alerta roja con pilar y triángulo, Torre del Reloj), pero en 02/05 la zona de la detective está dominada por un cubo blanco con cúpula y asfalto gris vacío; la detective (diminuta, a la derecha del cilindro) se pierde y el pin azul es el único ancla. AoE2 nunca deja la unidad principal sin silueta contrastada. |
| 2 | Iluminación | 7.5 | B | Sol cálido y sombras largas bien dirigidas en 03, pero en 02/05 los techos blancos están lavados, las sombras del vecindario moderno son manchas negras duras y el asfalto es casi negro plano; el contraste entre zonas es demasiado alto. |
| 3 | Materiales y texturas | 7.0 | B | Teja, piedra de muralla y adoquín funcionan (03). El hormigón blanco de los edificios modernos, la cúpula de vidrio y las cajas de oficinas son planos tipo "maqueta"; el asfalto no tiene desgaste, parches ni líneas de cuneta. AoE2 pinta cada superficie con ruido de mano. |
| 4 | Densidad de detalle | 6.5 | B | Es el punto más débil. En 02/05 hay grandes azoteas vacías, cruces enormes sin mobiliario y manzanas sin vegetación. 03 está mejor (palmeras, sombrillas, bus, plaza con fuente) pero aun así faltan balcones, toldos, ropa tendida, cajas de aire acondicionado y letreros a escala humana. |
| 5 | Vida | 6.5 | B | Se ven 2-3 taxis amarillos y peatones de 2-3 px casi invisibles; en AoE2 cada unidad tiene silueta y animación legible. El mar de 03 no muestra espuma ni movimiento perceptible en estático. La detective es legible solo por el pin y el aro. |
| 6 | Interfaz | 8.5 | A | Marco bronce/oro, barra de era con escudo, tarjetas de incidente con temporizador y rejilla de comandos: reinterpreta AoE2 sin copiarlo y se siente 2026. Fallos menores: toasts apilados tapan la lista de incidentes (02), minimapa y leyenda recortados (05: "ASEGURADO" cortado), retrato inconsistente (foto en 02, letra "V" en 05), rejilla de comandos con distinto contenido. |
| 7 | Tablero de investigación | 8.5 | A | Es el corazón del juego y se nota: corcho, polaroid con sello, hilo rojo con chincheta, SMS dentro de un móvil creíble, chapa "CLAVE", libreta de deducción con estampa "CONCLUSIÓN". Las evidencias parecen artefactos. Resta: el móvil es muy oscuro frente al corcho cálido y el texto de la declaración queda cortado al borde inferior sin indicador de scroll. |
| 8 | Identidad | 8.0 | A | Título con degradado oro/cian, escudo-lupa, paleta bronce + cian digital y ciudad caribeña amurallada con Torre del Reloj: tiene voz propia. Las zonas modernas (02/05) la diluyen hacia "ciudad Three.js genérica". |

**Promedio: 7.5 / 10**

## Veredicto: NO APROBADO

El promedio (7.5) está por debajo de 8.5 y cinco criterios (1, 2, 3, 4 y 5) están por debajo de 8. La interfaz y el tablero ya alcanzan nivel AAA; el mundo 3D fuera del casco antiguo todavía se lee como demo técnica pulida.

## Las 8 correcciones de mayor impacto

1. **Silueta y legibilidad de la detective (y de lo seleccionable).** Qué está mal: en 02/05 la detective mide pocos píxeles y se confunde con el entorno. Dónde: `js/mundo/detective.js` (grupo del personaje, `matSilueta` ~línea 194) y `js/mundo/efectos.js` (aro/baliza). Cambio: escalar el modelo x1.5 (o el grupo a `scale.setScalar(1.5)`), subir `matSilueta` de `multiplyScalar(0.55)` a `0.9`, y dar a la baliza un disco de selección de radio ~2.2 con pulso de opacidad 0.35 a 0.7 y un contorno dorado de 0.12 de grosor.

2. **Rellenar azoteas vacías y fachadas modernas (densidad).** Qué está mal: cubos blancos con una cúpula y cientos de m2 de azotea vacía. Dónde: `js/mundo/edificios.js` (generador de edificios modernos/oficinas) y `js/mundo/props.js`. Cambio: añadir por azotea 4-8 props: cajas de aire acondicionado (1.2x0.8x1 m), tanques de agua, antenas, parapeto con moldura de 0.4 m, pérgola/toldo, y 2-3 manchas de suciedad vía vertex color (-8% a -15% de luminosidad). En fachadas: balcones con baranda cada 2 pisos, toldos a rayas en planta baja, letreros perpendiculares (blade signs) de 1.5x0.6 m.

3. **Contraste y sombras demasiado duros en el barrio moderno (iluminación).** Dónde: `js/mundo/mundo.js`, bloque de luces (líneas ~71-80) y gradación (línea ~139+). Cambio: `hemi` de 0.32 a 0.5 con suelo `#8a6a48`; `sol` de 2.8 a 2.4; `environmentIntensity` de 0.38 a 0.55; en el shader de gradación bajar `uContraste` de 1.12 a 1.06 y levantar el color de sombra para que no haya negros puros. Techos blancos: bajar su albedo en `texturaTecho()` a ~0.78 para evitar el lavado.

4. **Asfalto sin carácter.** Dónde: `js/mundo/texturas.js` (`texturaAsfalto`) y `js/mundo/ciudad.js` (calles). Cambio: añadir en la textura parches de bacheo más claros/oscuros (opacidad 0.06-0.12), grietas finas, manchas de aceite en el carril central, bordillos con franja de desgaste y pintura amarilla/blanca desgastada; subir el albedo medio de ~0.16 a ~0.24 para que no sea un negro plano. Añadir alcantarillas y tapas cada ~30 m como decals.

5. **Más tráfico y peatones legibles (vida).** Dónde: `js/mundo/trafico.js` (`crearTrafico`), `js/mundo/peatones.js` (`crearPeatones({caminantes:240, quietos:80})`, geometría en `geometriaPeaton`). Cambio: subir caminantes a 420 y quietos a 140; escalar la geometría del peatón x1.35 y usar colores de ropa más saturados con sombrero/mochila en la silueta; densidad de autos x1.6 con variedad (bus, moto-taxi, camión de reparto) y luces de freno en cruces. Añadir 2-3 grupos conversando en plazas.

6. **Agua con vida visible.** Dónde: `js/mundo/terreno.js` (material del agua, `terreno.agua.malla`). Cambio: añadir franja de espuma en la orilla (textura alfa animada con offset `uT*0.05`), normal map con dos capas a velocidades distintas y un brillo especular del sol; 3-4 botes/lanchas fondeados con balanceo sinusoidal (amplitud 0.08 rad).

7. **Pulir los fallos de la interfaz.** Dónde: `js/ui/hud.js`, `js/ui/minimapa.js`, `js/ui/retratos.js`, `css/estilo.css`. Cambio: (a) apilar los toasts con un máximo de 2 y empujar el panel "Incidentes activos" (`.cd-recursos` no, el panel de incidentes) con `margin-top` según la altura de los toasts, para que no lo tapen (02); (b) garantizar que el minimapa y su leyenda caben en el panel inferior izquierdo (la leyenda "ASEGURADO" se corta en 05: `min-width` o abreviar a "OK"); (c) usar siempre el retrato SVG de la detective y no el fallback con la inicial "V" (`.cd-retrato-ini`), y mostrar la rejilla de comandos igual en todos los estados; (d) en el tablero, añadir un degradado de desvanecimiento y una barra de scroll fina dorada a la declaración inferior y a la libreta.

8. **Edificios modernos con materiales de verdad (materiales).** Dónde: `js/mundo/materiales.js` (`M.oficinas`, `M.vidrio`, `M.cristal`) y `js/mundo/texturas.js` (`texturaOficinas`, `texturaVidrio`). Cambio: para el hormigón, usar mapa con juntas de paneles cada 3 m, manchas de lluvia verticales bajo ventanas y zócalo oscurecido; para el vidrio, reducir `metalness` de 0.72 a 0.45 y añadir reflejo de cielo graduado y ventanas con persianas y luces cálidas aleatorias al 15% (emisivo 0.5); para la cúpula de cristal, añadir nervaduras estructurales (rejilla de 12 meridianos de 0.08 m) para evitar el aspecto de burbuja plástica.

## Lo que SÍ funciona y no hay que tocar

- **Casco antiguo (03):** teja con color variado, muralla de piedra con desgaste, Torre del Reloj, plaza con fuente, palmeras y bugambilias: es lo más cercano a AAA y define la identidad. No tocar la paleta ni la composición.
- **Marcador de alerta roja (03):** pilar luminoso + triángulo + aro en el suelo; legibilidad inmediata.
- **Tablero de investigación (04):** corcho, polaroid, hilo rojo, chapa CLAVE, libreta con sello, móvil SMS. Conservar la estructura de tres columnas y la tipografía serif de títulos.
- **Menú (01):** título con degradado oro-cian, escudo-lupa, botón dorado y fondo desenfocado de la propia ciudad.
- **Marco del HUD:** barra superior con escudo de era, tarjetas de incidente con temporizador, tipografía y colores bronce/cian.
- **Postprocesado base:** GTAO + bloom con umbral alto + gradación con viñeta suave; la dirección es correcta, solo hay que suavizar contraste (corrección 3).
