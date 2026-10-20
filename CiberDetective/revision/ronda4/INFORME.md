# Informe de dirección de arte — CiberDetective: Puerto Nexo (ronda 4)

Revisión independiente sobre las 5 capturas de `revision/ronda4/` (800×450), contra la rúbrica `CRITERIOS.md`. A = estas capturas. B = estándar visual de AoE2 DE (conocimiento propio).

## 1. Tabla de puntajes

| # | Criterio | Nota | Ganador | Justificación (una línea) |
|---|---|---|---|---|
| 1 | Composición y legibilidad | 7.0 | B | La detective y su anillo se leen, pero los dos toasts tapan el tercio izquierdo del mapa, las alertas son pines diminutos o balizas gigantes (sin escala coherente) y el distrito moderno es un mosaico gris donde no se distingue qué es seleccionable. |
| 2 | Iluminación | 7.5 | B | Sol cálido, sombras suaves y AO funcionan en Ciudad Vieja y malecón (04 es lo mejor), pero los techos del distrito moderno quedan planos y claros, y el domo "firewall" dibuja un arco cian fino sobre el mar (03) que parece un error de render. |
| 3 | Materiales y texturas | 6.5 | B | Teja, mar con espuma y adoquín convencen; asfalto, techos de hormigón y vidrio azul del distrito moderno son superficies lisas con poco desgaste, lejos de la pintura densa de AoE2. |
| 4 | Densidad de detalle | 7.0 | B | Ciudad Vieja tiene balcones, toldos, flores, palmeras y sombrillas (nivel bueno); el distrito moderno y el puerto tienen pocos props en azotea y casi nada a escala humana. |
| 5 | Vida | 7.5 | B | Coches, bus, veleros, lanchas y peatones en movimiento dan vida real, pero los peatones son puntos de color de 2-3 px y no hay humo, aves, banderas ni gente agrupada en plazas. |
| 6 | Interfaz | 7.5 | B | Barra superior y panel inferior son sobrios y cuidados (bronce/oro, tipografía legible), pero hay texto cortado ("Cuentas vaci…", "El código de…"), toasts que compiten con el mapa y un bloque de comandos casi vacío. |
| 7 | Tablero de investigación | 8.5 | A | Corcho, polaroid, SMS con móvil creíble, libreta rayada con sello "CONCLUSIÓN": es el corazón del juego y AoE2 no tiene equivalente; lo lastran chinchetas doradas que tapan texto y una vista que corta contenido. |
| 8 | Identidad | 8.0 | A | Ciudad amurallada caribeña + ciberseguridad + corcho de detective es una mezcla propia y memorable; el distrito moderno diluye el efecto y parece "ciudad genérica Three.js". |

**Promedio: 59.5 / 8 = 7.44**

## 2. Veredicto: NO APROBADO

Promedio 7.44 (< 8.5) y 6 de los 8 criterios quedan por debajo de 8 (1 a 6 están entre 6.5 y 7.5; solo 7 y 8 llegan a 8+). Es un producto sólido y coherente, claramente por encima de una "demo técnica", pero todavía a una distancia visible de AoE2 DE en densidad pintada y legibilidad del distrito moderno.

## 3. Las 8 correcciones de mayor impacto visual (priorizadas)

1. **Distrito moderno: romper el mosaico gris** (impacto en criterios 1, 3, 4). Archivo `js/mundo/edificios.js` (generadores de edificios de oficinas/torres) y `js/mundo/texturas.js::texturaTecho` y `::texturaOficinas`. Hoy los techos son planos claros casi idénticos. Añadir por azotea 4-8 props: unidades de A/C (cajas 1.2×0.8 m, gris 0x9aa0a6 con rejilla), tanques de agua cilíndricos, antenas, helipuertos pintados en 1 de cada 6 edificios, paneles solares en otro 1 de cada 6, y tinte de techo por edificio (variación de luminosidad ±12 % y 3 paletas: grafito 0x5b6068, arena 0xb8ab94, verde cubierta 0x6f8a63). Añadir manchas de suciedad/lluvia en `texturaTecho` con `manchas(ctx,w,h,40,...,alfa 0.10-0.18)` y bordes oscurecidos (parapeto) del 4 % del tile.
2. **Toasts: no tapar el mapa** (criterio 1 y 6). `css/estilo.css` líneas ~1622 y ~1684 (`.cd-toasts`): hoy están a la izquierda con `left:100px; top: sup-h+62px; width: 340px`, ocupando el tercio izquierdo. Pasarlos a una pila compacta anclada arriba-derecha debajo del reloj, `width: 300px`, máximo 2 visibles, y colapsar la descripción a 1 línea (`-webkit-line-clamp: 1`) tras 2.5 s; o mover el aviso a un banner fino (44 px) bajo el emblema de era. Dejar libre el centro-izquierda del mapa.
3. **Texto cortado en incidentes** (criterio 6). `css/estilo.css` `.cd-casos` (ancho 318 px) y `.cd-caso-titulo` (nowrap + ellipsis, 16 px). Subir `.cd-casos` a `width: 360px`, bajar `.cd-caso-titulo` a `font-size: 14px` con `white-space: normal; -webkit-line-clamp: 2` (hasta 2 líneas), y mostrar el nombre completo en `title`. Es una violación directa de la rúbrica ("sin texto cortado").
4. **Firewall: el arco cian sobre el mar** (criterio 2). `js/mundo/efectos.js` ~líneas 177-184: `firewall.scale.set(205, 62, 190)`, `position.set(5,0,-5)`. El borde del hemisferio corta el mar como una línea fina de plástico. Opciones: bajar la opacidad de borde en `matCupula` para que el domo solo se vea al hacer flash (`NIVELES` i: 0.35-0.75 → 0.10-0.30), desvanecer el rim a alpha 0 con `smoothstep` en `y < 3.0`, o ampliar a `scale (260, 70, 240)` para que el borde quede fuera de la vista normal. En 03 es el defecto más visible de la captura.
5. **Balizas de alerta con escala coherente** (criterio 1). `js/mundo/efectos.js` (sprites de baliza, `iconoAlerta` en `texturas.js`). En 01 y 02 las alertas son pines con "!" de ~14 px y en 03/04 son triángulos de 40-60 px. Fijar tamaño en pantalla constante (≈ 34 px de alto) con `sizeAttenuation:false` o escalado por `dist` de cámara, mantener el cono de luz rojo en el edificio, y añadir flecha de borde de pantalla para alertas fuera de cuadro (hoy solo se ven 2 de ellas en el minimapa).
6. **Peatones y vida a escala humana** (criterio 5). `js/mundo/peatones.js::crearPeatones` (`caminantes = 420, quietos = 140`) y `trafico.js`. Los peatones se leen como píxeles. Subir escala visual ×1.5 (altura ~2.6 m de juego), añadir sombra de contacto (disco oscuro 0.35 alpha), agruparlos en plazas/malecón/puerto en grupos de 3-5, y añadir 3 elementos ambientales: bandada de aves (boids de 12-20 sprites) sobre el mar, humo/vapor en 2-3 azoteas y estelas de espuma tras las lanchas.
7. **Tablero: chinchetas y recortes** (criterio 7). `css/estilo.css` bloque "PIZARRA DE DETECTIVE" (~línea 1441+) y `js/ui/evidencias.js`. Las chinchetas doradas caen sobre texto (declaración, opción D de la libreta, borde de la tarjeta "Pista sin revelar"). Posicionarlas solo en el borde superior (`top: -7px`) y nunca centradas en el borde inferior; añadir `padding-bottom: 28px` en `.cd-declaracion` y en la última opción de la libreta; asegurar que el contenedor central haga scroll con degradado de fade (mask-image 24 px) en lugar de cortar la tarjeta. Añadir una sombra de papel más marcada (`box-shadow: 0 8px 14px rgba(0,0,0,.45)`) y una ligera rotación aleatoria (±1.2°) a cada evidencia para romper la rejilla.
8. **Panel inferior: comandos casi vacíos** (criterio 6). `js/ui/hud.js` (bloque de atajos 1/2/H) y `css/estilo.css` `.cd-inf` columnas. El tercio derecho de la barra muestra solo 3 iconos en una caja vacía. Añadir etiquetas de tecla visibles, un cuarto/quinto comando (centrar cámara en alerta, pausa, ver tablero) o reducir ese bloque y dar el espacio a la ficha de la detective (retrato más grande, barra de energía y estado). AoE2 aprovecha cada píxel del panel inferior; aquí hay ~25 % vacío.

## 4. Lo que SÍ funciona y no hay que tocar

- **Ciudad Vieja (captura 04)**: techos de teja con variación, fachadas de colores caribeños, balcones, buganvilias, torre de reloj, cúpulas, plaza con árboles, muralla y adoquín. Es el mejor ejemplo de identidad y densidad del juego.
- **Malecón y mar (captura 03)**: agua con degradado, espuma de orilla, sombrillas, palmeras, veleros y lanchas; el contraste de playa/mar da legibilidad inmediata.
- **Puerto de contenedores (02)**: contenedores multicolor con buena escala y lectura; no tocar.
- **Pipeline de luz**: ACES, sol cálido `#ffc58a` a 2.7, hemisférica, sombras PCFSoft de 4096 y GTAO; las sombras largas y suaves funcionan.
- **Seleccionado de la detective**: anillo de selección y marcador de rombo son legibles y estilizados.
- **Marco de la UI**: emblema de era, barra de recursos, reloj y acabado bronce/oro tienen buena jerarquía y coherencia; tipografía de títulos con carácter.
- **Tablero**: concepto de corcho, polaroid, móvil SMS, libreta con sello. La dirección es la correcta; solo falta pulido (corrección 7).

## 5. Techo visual del enfoque procedural y el salto de ~8 a ~9

**Techo honesto.** Con todo procedural (geometría paramétrica + texturas de canvas 2D), este enfoque llega a un 8 sólido en estilización y legibilidad, y la Ciudad Vieja ya lo roza. Pero tiene un techo claro: los edificios son cajas con extrusiones, sus siluetas se repiten (se nota en 02 con las torres y bloques casi clonados), las texturas son atlas pequeños con repetición visible, y las personas y vehículos son formas primitivas sin lectura de personaje. AoE2 DE gana porque cada edificio y unidad es un sprite pintado a mano con siluetas únicas, luces y suciedad cocinadas a mano. Con código solo, la variación única por objeto se paga en horas de generador y siempre acaba pareciendo "variación paramétrica".

**Cambio estructural para pasar de ~8 a ~9** (no ajustes):

1. **Biblioteca de piezas modulares hechas a mano** (aunque sean pocas: 30-40 modelos GLB de azotea, mobiliario, balcones, vehículos, personajes con 2-3 ciclos de animación) combinados con el generador procedural. Es la mayor palanca: da siluetas únicas, que es lo que el ojo lee como "AAA".
2. **Texturas horneadas (baked) con AO, suciedad y bordes pintados** por edificio o por módulo, en lugar de atlas genéricos con un tinte por vértice. Un pase de baking (Blender o similar, o un bake por script) transforma las superficies lisas en superficies con historia.
3. **Un pase de iluminación cocinada y color grading a mano**: LUT de color por distrito (cálido en Ciudad Vieja, frío en el distrito moderno, verde-azul en el puerto) y sombras de contacto horneadas, para que cada zona tenga su identidad cromática (hoy comparten el mismo tono grisáceo).
4. **Un artista de UI y de assets 2D dedicado**: marcos, iconos, retratos y papeles pintados a mano (el tablero merece papel, corcho y chinchetas fotografiados/pintados, no solo CSS). Es el criterio donde la mano humana se nota más y el que más rinde por hora invertida.

Resumen: con ajustes finos (las 8 correcciones de arriba) se puede subir de 7.4 a ~8.2-8.4. Pasar de ~8 a ~9 requiere assets hechos a mano (modelos, texturas horneadas, UI pintada) mezclados con lo procedural; solo código no lo logra.
