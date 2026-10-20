# Informe de dirección de arte, Ronda 3 (revisión independiente)

Capturas evaluadas: 01 partida central, 02 malecón y mar, 03 ciudad vieja, 04 tablero, 05 menú (800x450).
Comparación a ciegas: A = estas capturas, B = estándar visual de Age of Empires II: Definitive Edition.

## Puntajes

| # | Criterio | Nota | Ganador | Justificación (una línea) |
|---|---|---|---|---|
| 1 | Composición y legibilidad | 8.0 | B (por poco) | El anillo de la detective, los pins de alerta y la lista de incidentes se leen a la primera, pero el suelo de acera tipo tablero de ajedrez y el tráfico denso compiten con las unidades; B separa mejor el fondo de lo accionable. |
| 2 | Iluminación | 7.5 | B | Sombras suaves y sol cálido correctos, pero la escena queda plana y azul-grisácea en calzadas y esquinas (viñeta + hemisférica fría), sin contraste de hora dorada ni sombras de contacto marcadas. |
| 3 | Materiales y texturas | 7.0 | B | Las tejas y fachadas son color casi plano con poco desgaste; el mar es un cian liso con rayas de espuma grandes y repetitivas; el andén en damero es el peor ofensor "placeholder". El vidrio de las torres sí funciona. |
| 4 | Densidad de detalle | 7.5 | B | Hay sombrillas, palmeras, aires, tanques, balcones y autos, pero los tejados coloniales y las azoteas blancas grandes están vacíos; la pintura a mano de B llena cada metro cuadrado. |
| 5 | Vida | 8.0 | A | Mar animado en 3D, veleros, lancha, tráfico en intersecciones y cientos de peatones coloridos: B es sprites con ciclos cortos y aquí hay más movimiento ambiental. Penaliza el mar vacío de la captura 02. |
| 6 | Interfaz | 8.5 | A | Reinterpretación 2026 muy lograda: marco metálico con filo dorado, tarjeta de era, retrato, minimapa isométrico, tipografía clara y panel de incidentes con prioridad; solo quedan nimiedades (ranuras vacías, solape del panel). |
| 7 | Tablero de investigación | 8.5 | A | Corcho, hilo rojo, fotos con chincheta, SMS como móvil real, libreta con sellos: se siente el corazón del juego y B no tiene equivalente; el texto cortado abajo y el retrato plano lo frenan. |
| 8 | Identidad | 8.0 | A | La ciudad vieja caribeña (colores pastel, torre de reloj, muralla, malecón) es memorable y propia; el centro moderno de cajas grises con cilindro blanco cae en genérico. |

**Promedio: 7.88 (63 / 8).**

## Veredicto: NO APROBADO

El promedio queda por debajo de 8.5 y tres criterios están por debajo de 8 (iluminación 7.5, materiales 7.0, densidad de detalle 7.5). La interfaz, el tablero y la identidad de ciudad vieja están cerca del nivel AAA; el mundo 3D todavía se lee como "muy buena demo de Three.js" por texturas planas y falta de pátina.

## Las 8 correcciones de mayor impacto (priorizadas)

Nota: las rutas de código vienen de leer los archivos; los valores son puntos de partida a ajustar mirando la captura.

1. **Tejas y tejados coloniales planos (captura 03, 01). Sube materiales y detalle.**
   - `js/mundo/texturas.js`, `texturaTejas()` (línea ~294): variar tono por teja (±10 % en luminosidad y ±6° de tono), añadir 2-3 hileras con musgo/óxido (verde #5c6b3a al 12 % alfa), borde de cumbrera más claro y manchas de lluvia verticales.
   - `js/mundo/materiales.js`, `M.tejas`: `bumpScale` 1.6 a 2.6; `roughness` 0.85 a 0.78.
   - `js/mundo/construccion.js`, el rellenado de azotea (línea ~27) solo trabaja techos planos: llamarlo también para techos inclinados con chimeneas (caja 0.7x1.4x0.7 m en #b9a58a), claraboyas, bajantes y una cumbrera de remate. Meta: 1 elemento visible cada ~6 m de techo.

2. **Andén en damero (calles de las capturas 01 y 03). Materiales.**
   - `js/mundo/texturas.js`, `texturaAnden()` (línea ~428): el contraste entre las dos baldosas es enorme (rgb 196,186,170 contra 176,150,128) con 4x4 baldosas de 64 px; de lejos parece tablero de ajedrez.
   - Pasar a 8x8 baldosas (`t = 32`), ambas baldosas de la misma gama (variación `k * 8`, no 18-20), juntas más oscuras de 2 px (`rgba(60,55,50,.5)`), y que la mitad de los andenes use un hormigón liso con juntas cada 1.2 m. Reducir también el `repeat` si se ve el patrón.

3. **Iluminación plana y fría, bordes oscuros (captura 01). Iluminación.**
   - `js/mundo/mundo.js`: `toneMappingExposure` 0.88 a 0.96; `HemisphereLight` intensidad 0.5 a 0.62 y color de suelo `#8a6a48` a `#a98660` (rebote cálido en sombras en lugar de gris azul).
   - Pase de gradación (línea ~143): `uVineta` 0.22 a 0.12; `uContraste` 1.06 a 1.10; en el virado de sombras bajar el factor `* 0.25` a `* 0.15` (las calzadas se ven azul-grisáceas).
   - `js/mundo/texturas.js`, `texturaAsfalto()`: calentar el gris medio ~8 % (más rojo, menos azul) y subir su luminosidad ~10 %.
   - Opcional: `sol.intensity` 2.4 a 2.7 y sombra más larga (altura solar un poco menor en `DIR_SOL`) para dar volumen de hora dorada.

4. **Mar con rayas de espuma grandes y mucho mar vacío (captura 02). Materiales y vida.**
   - `js/mundo/terreno.js`, `crearAgua()` (shader): las bandas `b1`/`b2` son ondas senoidales regulares, por eso salen como franjas diagonales anchas. Cambiar la fase `sin(dc * 0.9 ...)` por una con ruido de mayor frecuencia (`dc * 1.9 + ruido2D(pp * 0.35) * 4.0`), estrechar la zona con `1.0 - smoothstep(0.0, 11.0, dc)` a `smoothstep(0.0, 6.5, dc)`, y bajar el `0.9` de `b1` a `0.6`.
   - Añadir variación de color (parches más oscuros de ±8 % sobre `hondo`) y destellos solares: `roughness` 0.06 a 0.10 con `envMapIntensity` 1.1 a 1.5.
   - Poblar el mar: 6-8 embarcaciones más (pirogas de pesca, una lancha en marcha con estela, boyas con luz) y gaviotas; reencuadrar la vista del malecón para que el mar no ocupe la mitad del cuadro sin nada.

5. **Centro moderno genérico y torre cilíndrica blanca lisa (captura 01). Identidad y materiales.**
   - `js/mundo/edificios.js`, torre alrededor de la línea 476: el fuste usa `'#c9cdd2'` con material sólido. Aplicar `M.oficinas`/`M.vidrio` al fuste (UV por altura) o 4 anillos de balcón en `#8f98a3` cada 3.6 m, y subir el emisivo de las plantas para que lea de noche.
   - Los edificios de oficinas cuadrados de la derecha: añadir cornisa, retranqueo en el último piso y un remate (antena + letrero corporativo emisivo con nombre) para que no sean cajas grises; hay un cartel por esquina como mínimo.

6. **Azoteas blancas grandes vacías y equipamiento pequeño (captura 01, edificio de la cúpula). Densidad de detalle.**
   - `js/mundo/construccion.js`, función de rellenado de azotea (línea ~27) y la `tanque`/`ac` de `props.js` (línea ~139): subir la densidad (probabilidad de equipo por celda de 0.35 a 0.6), añadir pretil con una franja oscura de 0.25 m, tuberías, rejillas de ventilación y manchas de humedad en el suelo de azotea (`texturaTecho()`, línea ~545). Los tanques negros `#22262b` a un tono más cálido `#3a3f45` con aro metálico.

7. **Interfaz: ranuras vacías, iconos repetidos y solape del panel de incidentes (captura 01). Interfaz.**
   - `css/estilo.css`, `.cd-acciones-grid` (línea ~400 y ~1633): de 15 ranuras solo 3 tienen contenido y dos usan la misma lupa con "1" y "2"; diferenciar los iconos (lupa/archivo/escudo) y atenuar las vacías a `opacity .35` o reducirlas a 10 ranuras.
   - Panel "Incidentes activos": ancho ~180 px que tapa un tercio derecho del mapa en 800x450; reducir a ~160 px o plegarlo cuando el cursor no esté encima, y añadir marcadores de borde de pantalla para incidentes fuera de cuadro (el "!" de la izquierda se corta contra el borde en las capturas 01 y 03).

8. **Tablero: texto cortado y retrato plano (captura 04). Tablero.**
   - `css/estilo.css` (bloque "Pizarra de detective", línea ~1441) y `js/ui/investigacion.js`: la pregunta 2 de la libreta ("¿Por qué Andrés confió en el mensaje?") y la declaración de la columna izquierda se cortan a mitad de frase contra el borde. Añadir máscara de desvanecimiento inferior (`mask-image: linear-gradient(#000 85%, transparent)`) y un indicador de scroll, y que el botón "Confirmar conclusiones" no tape la última línea.
   - `js/ui/retratos.js`: el retrato de la víctima es un avatar plano; añadir luz lateral cálida, sombra del cuello y grano fotográfico para que parezca una foto impresa.

## Lo que SÍ funciona (no tocar)

- Marco de HUD superior e inferior: chapa oscura con filo dorado, tarjeta "Era I Conoce", contadores con iconos y temporizador. Jerarquía y tipografía impecables.
- Anillo de selección dorado de la detective, con su pin de ubicación: se localiza al instante.
- Pins de alerta con icono "!" y la baliza triangular roja de la captura 03 (el edificio con alerta se ve desde lejos y no abruma).
- Ciudad vieja (captura 03): paleta pastel caribeña, torre de reloj, cúpula, muralla de piedra, árboles y esquinas con cebras. Es la imagen más fuerte y define la identidad; no rediseñar.
- Malecón: palmeras, sombrillas de colores, quiosco, veleros y adoquinado de paseo transmiten el Caribe.
- Tráfico (autos amarillos, bus rojo) y multitud de peatones: dan vida sin ensuciar.
- Cúpula de cristal del edificio principal (captura 01): reflejos y armazón creíbles.
- Tablero (captura 04): corcho, hilo rojo, nota "Clave", sello "Conclusión", móvil con SMS y panel "Hallazgo del análisis". La narrativa visual es de nivel AAA.
- Menú (captura 05): el título con degradado oro a cian, el escudo con lupa, los botones "Jugar" y "Créditos" y la ciudad desenfocada detrás funcionan; solo conviene subir el brillo de la ciudad de fondo un 10-15 %.
- Minimapa isométrico con leyenda (alerta, asegurado, detective).
