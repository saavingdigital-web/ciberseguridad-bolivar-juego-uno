# Revisión visual AAA · Ronda 1 · CiberDetective: Puerto Nexo

**Revisor:** dirección de arte (estándar de referencia: *Age of Empires II: Definitive Edition*, comparación a ciegas A/B)
**Material revisado:** 01_menu, 02_intro, 03_partida_hud, 04_partida_incidente, 05_ciudad_vieja, 06_investigacion, 07_investigacion_completa, y el código de `js/mundo/*.js`, `js/ui/*.js` y `css/estilo.css`.
**A** = estas capturas · **B** = estándar visual de AoE2 DE.

---

## 1. Puntajes

| # | Criterio | Nota | Ganador | Justificación (una línea) |
|---|---|:---:|:---:|---|
| 1 | Composición y legibilidad | **5.0** | **B** | La detective no aparece en ninguna captura de partida, las torres de vidrio tapan la Central (03) y nada distingue un edificio jugable de uno decorativo; en AoE2 cada unidad y edificio se lee al instante, incluso detrás de un muro (silueta de color). |
| 2 | Iluminación | **6.0** | **B** | El sol cálido y rasante va en buena dirección, pero la imagen sale lavada: ventanas emisivas encendidas a pleno sol, blancos quemados por el bloom (torre de telecomunicaciones en 01 y 04), charcos de luz de farola de día y poco contraste en las sombras. |
| 3 | Materiales y texturas | **5.5** | **B** | Las texturas procedurales funcionan en fachadas y tejas, pero los techos planos (la superficie que más se ve con cámara a 50°) son losas grises lisas, los árboles son icosaedros *flat-shaded* y los cuerpos `M.solido` son color plano: se lee como low-poly genérico. |
| 4 | Densidad de detalle | **6.0** | **B** | Hay balcones, buganvilias, toldos, letreros, farolas y semáforos, pero a distancia de juego se pierden y dominan el asfalto gris y las azoteas vacías; AoE2 pinta cada metro de suelo. |
| 5 | Vida | **6.5** | **B** | Tráfico, 320 peatones, oleaje con espuma, balizas, hologramas y viento en las copas suman mucho, pero la protagonista no se ve y los peatones son cajas de unos 10 px; la vida de AoE2 está en unidades legibles y bien animadas. |
| 6 | Interfaz | **7.0** | **B** | Metal oscuro con filete dorado, medallón de era y minimapa con leyenda: coherente y con jerarquía. Pierde por los retratos e íconos en emoji del sistema, la rejilla de 15 ranuras con 1 sola acción y un par de textos con poco contraste o cortados (01, 04). |
| 7 | Tablero de investigación | **7.0** | **A** | Las evidencias (SMS, barra de URL con el dominio resaltado, extracto, bitácora) parecen artefactos reales y superan las pantallas de briefing de AoE2; pero el tablero es un *dashboard* web oscuro, no un tablero físico, y la deducción es un cuestionario de opción múltiple. |
| 8 | Identidad | **6.5** | **B** | La ciudad amurallada caribeña con neón (05) tiene personalidad propia; el distrito moderno, en cambio, parece SimCity genérico, y la interfaz dorada estilo Cinzel con emoji podría ser de cualquier juego de móvil. |

**Promedio: 6.19 / 10** (49.5 / 8)

## 2. Veredicto

### NO APROBADO

El promedio queda por debajo de 8.5 y todos los criterios están por debajo de 8. A favor: hay mucha ingeniería y varias buenas decisiones de arte (ciudad vieja, evidencias, expediente). Lo que un jugador nota en los primeros 10 segundos es otra cosa: **no encuentra a la detective, la imagen se ve lavada, las azoteas son losas grises, los árboles son poliedros y los retratos son emoji.** Esas cinco cosas son la firma de una "demo técnica de Three.js" y hay que eliminarlas antes de la ronda 2.

---

## 3. Las 10 correcciones de mayor impacto (en orden de prioridad)

### 1. La detective es invisible: es el problema más grave del juego
**Qué está mal:** no se ve en 03, 04 ni 05. Mide unos 2.4 m (`ESCALA = 1.38`) frente a edificios de 8 a 78 m, el anillo solo aparece al seleccionarla y no tiene marcador. En AoE2 las unidades se exageran a propósito, más o menos un tercio de la altura de una casa.
**Dónde:** `js/mundo/detective.js` → `construirModelo()`, `crearAnillo()`, `crearDetective().actualizar()`; `js/mundo/mundo.js` → `elegir()`.
**Qué cambiar:**
- `ESCALA` de 1.38 a **2.4** (unos 4.2 m: escala de juego, no de la vida real). Subir `radio` de 1.6 a **2.6** y `alto` de 2.4 a **4.2** para los clics.
- Anillo siempre visible: en `actualizar`, usar `anillo.material.uniforms.uSel.value = 0.35 + 0.65 * sel` y quitar `anillo.visible = sel > 0.01`. Agrandar el plano de 2.9 a **3.6**.
- Marcador flotante con tamaño constante en pantalla: un `THREE.Sprite` con un rombo o una lupa cian `#3fe0ff` a `y = 5.2`, escalado como el ícono de alerta (`Math.max(2.2, distancia * 0.03)`), con `depthTest: false` y `renderOrder 21`.
- Firma de color: en la bufanda, `emissiveIntensity` de 0.35 a **1.4** y `emissive` a `#19d8ea`. La gabardina, de `#b48a52` a **`#c8963e`**, para que se separe del adoquín.
- Silueta cuando un edificio la tapa (el recurso clásico de AoE2): renderizar una segunda vez la malla con `MeshBasicMaterial({ color: 0x3fe0ff, transparent: true, opacity: 0.55, depthFunc: THREE.GreaterDepth, depthWrite: false })` y `renderOrder 6`.

### 2. Encuadre inicial y torres que tapan la acción (03)
**Qué está mal:** al empezar, la pantalla es un techo gris gigante con un mástil. Las torres de 34 a 78 m, con cámara a 50° y FOV de 30°, tapan la Central, que mide 13.5 m, y todo lo que hay detrás.
**Dónde:** `js/mundo/ciudad.js` → `manzanaModerna()`; `js/mundo/edificios.js` → bloque TECNOSTORE (`torre(globalCtx(), {... alto: 44 ...})`); `js/mundo/camara.js` → `centrar()`.
**Qué cambiar:**
- `manzanaModerna`: `az.rango(34, 78)` pasa a **`az.rango(18, 38)`**; `az.rango(30, 62)` a **`(16, 32)`**; `az.rango(22, 44)` a **`(12, 24)`**. Las torres altas solo en las afueras (`escalaAlto` igual o mayor que 1 cuando `i >= 6`).
- Torre decorativa de TecnoStore: `alto: 44` a **`alto: 22`**.
- `centrar()`: la primera vez, `distObj = 125` (no 170) y apuntar a `detective.posicion` desplazado `(+4, 0, +6)`, para que la Central quede en el tercio superior y la detective en el centro.
- (Opcional, de nivel AAA) recorte por oclusión: en `parchear` de `M.vidrio`, `M.oficinas` y `M.techo`, añadir el uniform `uFoco` (posición en pantalla de la detective) y hacer `discard` con un patrón *dither* 4×4 cuando el fragmento esté a menos de 90 px de `uFoco` y más cerca de la cámara que ella.

### 3. Imagen lavada: emisivos de día, blancos quemados y poco contraste
**Qué está mal:** en 01, 03 y 04 las ventanas brillan a pleno sol, el fuste de la torre de telecomunicaciones es una mancha blanca con bloom, hay manchas naranjas de luz de farola en las aceras de día y las sombras salen grises por exceso de luz ambiental.
**Dónde:** `js/mundo/mundo.js` (luces y postproceso), `js/mundo/materiales.js` → `crearMateriales()`, `js/mundo/props.js` (charcos de luz), `js/mundo/edificios.js` (torre de telecomunicaciones).
**Qué cambiar:**
- `mundo.js`: `sol` de 3.4 a **2.8**; `hemi` de 0.55 a **0.32**, con suelo `#7a5a3a`; `escena.environmentIntensity` de 0.55 a **0.38**; `UnrealBloomPass(…, 0.38, 0.45, 1.05)` a **`(…, 0.22, 0.4, 1.35)`**; `toneMappingExposure` de 0.82 a **0.88**.
- `materiales.js`: `emissiveIntensity` de `M.fachada` de 1.25 a **0.2**, de `M.vidrio` de 1.5 a **0.3** y de `M.oficinas` de 1.4 a **0.25**. Los valores de ahora sirven para una versión nocturna, no para la hora dorada.
- `props.js`, charcos de luz: el degradado de `rgba(255,190,110,0.5)` pasa a **`rgba(255,190,110,0.08)`**, o se ocultan (`im3.visible = false`) mientras sea de día.
- Torre de telecomunicaciones: fuste de `#eef0f2` a **`#c9cdd2`**; anillos blancos `multiplyScalar(2.4)` a **1.2**.
- Gradación final: un `ShaderPass` antes de `OutputPass` con contraste de **1.12**, saturación de **1.08**, sombras teñidas a `#2b3a4a` y viñeta de **0.22**. Es lo que separa un render "correcto" de uno "pintado".

### 4. Azoteas: la superficie más visible es la más pobre
**Qué está mal:** a 50° de inclinación, los techos ocupan el 40 % de la pantalla y son losas gris claro uniformes. En 03 el techo ocupa la mitad del encuadre, y la sala de máquinas es una caja gris sin puerta.
**Dónde:** `js/mundo/texturas.js` → `texturaTecho()`; `js/mundo/construccion.js` → `casa()` (techo plano) y `torre()` (techo y sala de máquinas).
**Qué cambiar:**
- `texturaTecho()`: subir la resolución de 256 a **512**. Base de `#b5ada2` a **`#978d80`**, `grano` de 22 a **38**, 40 manchas de impermeabilizante `rgba(38,36,32,A)` con alfa de 0.35, juntas de dilatación cada 128 px con 3 px de `rgba(0,0,0,0.3)`, 6 sumideros (círculo oscuro de 6 px con halo) y chorreados verticales de óxido `rgba(110,70,40,0.15)`.
- `torre()`: techo de `#e0e0e0` a **`#a39b8f`**; sala de máquinas de `#8e949b` a **`#7d7468`**, con puerta (`sol.caja` de 1.0×2.1 en `#3a3f45`) y rejillas.
- `casa()`, techo plano: añadir una franja de sombra interior de 0.5 m junto al pretil (quad en `M.solido`, `#5e574e`). Variar el tinte por casa con `az.elegir(['#ffffff','#e9e2d6','#d8d0c2','#c9bfae'])`.
- Más vida caribeña en las azoteas: tendederos con ropa (2 postes y 3 planos de color), materas, parabólicas pequeñas y calentadores solares en el 30 % de las casas.

### 5. Árboles poliédricos: la marca de "low-poly genérico"
**Qué está mal:** en 05 las copas son icosaedros de detalle 0 con `flatShading`, y se ven como gemas verdes. En AoE2, los árboles son masas densas pintadas, con el envés oscuro.
**Dónde:** `js/mundo/props.js` → bloque "Árboles (dos especies)" y `mata()` (buganvilias).
**Qué cambiar:**
- `IcosahedronGeometry(r, 0)` pasa a **`IcosahedronGeometry(r, 1)`** y `flatShading: true` a **`false`**. Recalcular las normales como esféricas desde el centro de la copa (`normal = normalize(pos - centroCopa)`) para lograr un sombreado suave y "pintado".
- Gradiente de oclusión por vértice: multiplicar el color por `mix(0.55, 1.1, (y - yMin) / (yMax - yMin))`, con el envés oscuro y la cima clara.
- Paleta: de `#4f7f2f` y `#5f9238` a **`#2f6b2a`, `#4f8f3a`, `#79a84a`**, y tintes de instancia con más rango (`#ffffff`, `#d6e6b0`, `#b9cf8f`, `#e9f0c8`).
- Lo ideal: 30 a 40 tarjetas de hojas con *alpha-test* por copa (textura de canvas de 256 px con hojas recortadas, `alphaTest: 0.5`), que da una silueta irregular en vez de facetas.

### 6. Qué se puede seleccionar: los edificios del catálogo no se distinguen
**Qué está mal:** el criterio 1 pregunta "¿qué es seleccionable?". Hoy un Banco del Puerto y una casa decorativa se leen igual hasta que se pasa el cursor.
**Dónde:** `js/mundo/efectos.js` → `crearEfectos()` (nueva función `marcarCatalogo`) y `js/mundo/mundo.js` (llamarla con `ciudad.catalogo`).
**Qué cambiar:**
- Placa o estandarte flotante por edificio del catálogo: un `Sprite` de 128 px con el emblema del tipo (escudo, moneda, matraz, casa…) sobre un disco del color `e.color`, a `y = e.alto + 3`, escala `Math.max(1.6, d * 0.018)` y opacidad de **0.75**, que suba a 1 con hover.
- Calco en el suelo: un `RingGeometry(r, r + 0.35)` del color `e.color` con opacidad de **0.22**, permanente (reutilizar el anillo de `capaResalte`, pero siempre visible y más tenue).
- Contraste de valor: desaturar un 12 % los colores por vértice de las manzanas decorativas en `crearCiudad` (o subir un 10 % la saturación del catálogo), para que el ojo vaya primero a lo jugable.
- Alertas fuera de cámara: flecha roja en el borde de la pantalla, apuntando al edificio (en `hud.js` o una capa nueva), como el indicador de evento de AoE2. En 04 hay un incidente activo y no se ve en el mundo.

### 7. Placeholders de interfaz: retratos e íconos en emoji
**Qué está mal:** Valeria (02, 03), la víctima (06, 07) y todas las acciones (🔍 🏛️ ⏫ 🧪), los tipos de evidencia (💬 🔗 🏦) y los cuadrantes (⚙️) son emoji del sistema operativo. Se ven distintos en cada PC y gritan "prototipo".
**Dónde:** `js/main.js` (íconos de acciones, retrato de Valeria), `js/ui/iconos.js` → `TIPOS_EVIDENCIA` y `CUADRANTES`, `js/datos/*.js` (retratos de víctimas e íconos de tecnologías), `js/ui/hud.js` → `pintarAcciones()` y `RANURAS`.
**Qué cambiar:**
- Retratos: PNG o WebP ilustrados de 256×256, de medio cuerpo, con luz de borde cálida `#ffc58a` y fondo `#1d3946`. `retrato()` ya admite `img.cd-retrato`; basta con pasar la ruta.
- Íconos: usar el set SVG de `ICONOS` (ya existen `lupa`, `escudo`, `matraz`, `carpeta`…) con relleno grabado: `linear-gradient(#f6dc94, #9c6c1f)`, trazo `#1b1003` de 1.5 px y `drop-shadow(0 2px 0 #000)`. Prohibido el emoji en todo el HUD.
- Rejilla de acciones: `RANURAS` de 15 a **10** (5×2) y `--celda` de 60 px a **64 px**. Las ranuras vacías deben verse como zócalos de metal grabado (`inset 0 0 0 1px rgba(212,169,76,.18)` y una muesca central), no como agujeros.
- Menú (01): el subtítulo "PUERTO NEXO" en cian con `letter-spacing .6em` se pierde sobre el fondo claro y queda pegado al lema. En `.cd-logo-sub`, usar `text-shadow: 0 2px 3px #000, 0 0 12px rgba(0,229,255,.6)`; en `.cd-menu-lema`, `margin-top: 14px`. En `.cd-capa-menu`, oscurecer el centro con `rgba(3,6,10,.38)` al 45 %.
- Verificar en 04 que `.cd-casos` (right: 16px) no se recorte por el borde derecho mientras corre `cd-entra-derecha`: el contador y el tiempo "05:…" salen cortados.

### 8. Tablero de investigación: de *dashboard* a tablero de detective
**Qué está mal:** las evidencias son excelentes como contenido, pero el contenedor es una web oscura con cuadrícula cian, las tarjetas apenas giran ±0.5° y el hilo rojo solo existe si el jugador marca claves. La deducción es un examen tipo test (A/B/C/D), y así no se siente el "corazón del juego".
**Dónde:** `css/estilo.css` → `.cd-inv-fondo`, `.cd-evi`, `.cd-evi:nth-child(...)`, `.cd-hilo`, `.cd-opcion`, `.cd-preg`; `js/ui/investigacion.js` → `crearTarjeta()`, `dibujarHilos()`, `crearPregunta()`.
**Qué cambiar:**
- Fondo: reemplazar la cuadrícula cian por una superficie física, ya sea un corcho oscuro (ruido de canvas `#5a3d24` y `#7a5532` con grano) o un fieltro verde petróleo `#16302c` con viñeta. Encima, una lámpara cálida: `radial-gradient(ellipse at 50% 20%, rgba(255,200,120,.16), transparent 60%)`.
- Tarjetas `.cd-evi` como impresiones físicas: marco de papel `#efe6d0` de 10 px alrededor del render (la evidencia queda como "captura impresa"), sombra `0 14px 22px rgba(0,0,0,.6)` y rotaciones de **−1.6°, +1.2° y −0.7°** (ahora son ±0.5°), con cinta adhesiva semitransparente en dos esquinas.
- Hilo rojo: `stroke: #c4231b`, `stroke-width: 3`, `stroke-dasharray: 7 2` para que parezca torcido, y caída tipo catenaria (`my = max(y1, y2) + 60 + |dx| * 0.12`). Que el hilo una cada evidencia clave con la pregunta de deducción que responde, no solo las evidencias entre sí.
- Deducción como libreta: `.cd-inv-deduccion` con fondo de papel rayado (`repeating-linear-gradient(transparent 0 27px, rgba(80,120,160,.18) 27px 28px)` sobre `#f2ead6`) y texto `#2a1e10`. `.cd-opcion` como fichas que se "clavan" con un sello rojo al elegirlas. Mantener el contenido y cambiar la metáfora.
- Víctima: reemplazar el emoji por un retrato ilustrado (ver la corrección 7) con un sello de fecha y hora.

### 9. Suelo de la ciudad vieja: cebras modernas y asfalto dominante
**Qué está mal:** en 05 hay pasos de cebra y líneas de pare en cada cruce dentro de la muralla, lo que rompe la ambientación colonial y llena el suelo de rayas blancas. El asfalto `#4a4b4f`, plano y frío, es la superficie más grande del encuadre.
**Dónde:** `js/mundo/terreno.js` → `crearTerreno()` (bloque "cebras y líneas de pare", líneas 83 a 99); `js/mundo/texturas.js` → `texturaAsfalto()` y `texturaAdoquin()`.
**Qué cambiar:**
- En el bucle de cebras, añadir `if (enViejo(x, z)) continue;`, igual que ya se hace con las líneas centrales.
- `texturaAsfalto()`: base de `#4a4b4f` a **`#57534c`** (cálido), resolución de 512 a **1024**, parches de reparación rectangulares en `rgba(30,30,30,0.35)`, desgaste más claro por carril (2 franjas de `rgba(140,130,115,0.12)`) y manchas de aceite en el centro del carril.
- `texturaAdoquin()`: tamaño de 32 a **24** px, `bumpScale` de 1.5 a **2.4** en `materiales.js`, juntas `#3a332c` y musgo entre piedras (`rgba(70,85,40,0.25)`).
- Bordillo: una franja de 0.25 m de `#d8cfc0` en el borde de cada `rectManzana` (`anden.caja` extra) para recortar las calles y que las manzanas "floten" menos.

### 10. Restos de "demo de Three.js": wireframes y piezas rotas
**Qué está mal:** en 04, el domo del Laboratorio Forense lleva una barra negra que lo atraviesa (la "ranura del observatorio" mide 14 m de largo y sale del domo) y un icosaedro en *wireframe* aditivo. El globo de la Central también usa `wireframe: true`. El *wireframe* es la firma más reconocible de una demo de Three.js.
**Dónde:** `js/mundo/edificios.js` → bloque LABORATORIO FORENSE (`sol.cajaRot(cx - 3, b + H + 5.2, cz - 1, 1.4, 2.2, 14, 0.3, '#2a3340')` y `nerv`) y bloque CENTRAL (`alambre`).
**Qué cambiar:**
- Quitar la `cajaRot` de la ranura. Reemplazarla por una gajo de esfera: `new THREE.SphereGeometry(7.26, 6, 12, -0.07, 0.14, 0, Math.PI / 2)` trasladado a `(cx - 3, b + H, cz - 1)`, en `#1b2430`. Una ranura delgada que sigue la curva.
- Cambiar `nerv` (icosaedro de alambre) por nervaduras geodésicas sólidas: `EdgesGeometry` del icosaedro de detalle 2, renderizado como `LineSegments` en `#9fb4c4` sin aditivo y con opacidad de 0.6, o quitarlo y dar al domo `metalness: 0.85` y `roughness: 0.15` con `envMapIntensity: 1.6`.
- Central: `alambre` con `wireframe` pasa a un `LineSegments` de `EdgesGeometry` con opacidad de **0.3**. El escudo holográfico se queda como foco.
- Revisar todo `wireframe: true` en `js/mundo/` y prohibirlo en el arte final.

---

## 4. Lo que SÍ funciona (no tocar)

- **La ciudad vieja (05)** es lo mejor del juego: paleta de fachadas caribeñas (`PALETA_COLONIAL`), tejas con variación, balcones de madera, buganvilias, plaza de la Alcaldía con torre del reloj, iglesia con cúpula, muralla con garitas. Tiene identidad propia: aquí está el ADN del juego.
- **La baliza de alerta (05)**: triángulo rojo con "!", columna pulsante y onda en el suelo. Se lee de un vistazo y su tamaño se ajusta a la distancia. Solo falta el indicador fuera de cámara.
- **Las evidencias como artefactos (06, 07)**: el SMS con remitente de número común, la barra de navegador con "No seguro" y el dominio `seguro-web.xyz` resaltado, la bitácora monoespaciada y el extracto bancario con membrete. Son creíbles, didácticas y premium. Hay que conservar el contenido y su render (`evidencias.js`).
- **El expediente de la intro (02)**: carpeta de cuero, hoja de papel con renglones, sello CONFIDENCIAL, clip, paginación y botones con buen contraste. Es el tono que debería tener el tablero de investigación.
- **La barra superior y el medallón de era**: el filete dorado, los zócalos circulares de recursos con barra de progreso y el medallón colgante de la era están bien resueltos y tienen jerarquía.
- **El minimapa en rombo con leyenda** (alerta, asegurado, detective): es correcto y está en la tradición del género.
- **El mar**: degradado de bajo a hondo, bandas de espuma en la orilla, transparencia en la playa y oleaje en el vértice. Funciona; no necesita más que la gradación global.
- **La dirección del sol** (`DIR_SOL`, rasante y cálido) y las sombras con *texel snapping* que no tiemblan: la base técnica es buena; el problema es el balance (ver la corrección 3), no la dirección.
- **El logo "CIBERDETECTIVE"** en el menú: fuerte, legible y con buen tratamiento dorado.
