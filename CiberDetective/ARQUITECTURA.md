# CiberDetective: Puerto Nexo · Arquitectura y contratos

Juego de estrategia y detectives para **PC (navegador)**, hecho con **Three.js r170**, todo en **español**.
El referente visual y de jugabilidad es *Age of Empires II*: cámara alta isométrica sobre una ciudad viva, barra de recursos arriba, panel de mando abajo con minimapa, unidades que se seleccionan y reciben órdenes, tecnologías que se investigan y eras que se avanzan. La ambientación es una ciudad costera del Caribe colombiano en **2025-2026**.

**Prohibido:** usar o copiar arte, logos, nombres o recursos de Age of Empires, de Microsoft o de marcas reales (bancos, apps, operadores). Todo el arte es propio: procedural, hecho con Blender o con canvas. Los nombres de marcas son inventados ("Banco del Puerto", "ChatVerde", "FotoGram").

---

## 1. Equivalencias AoE2 → 2025-2026

| Age of Empires II | CiberDetective |
|---|---|
| Centro urbano | **Central de Ciberpolicía** (`central`) |
| Aldeanos / unidades | **Detective Valeria Ríos** (unidad héroe) |
| Universidad / herrería (investigar) | **Laboratorio Forense** (`laboratorio`) → tecnologías |
| Comida / Madera / Oro / Piedra | **Confianza** 🤝 / **Energía** ⚡ / **Presupuesto** 💰 / **Evidencia** 🔍 |
| Edades (Oscura → Imperial) | **Eras del Ciudadano Digital Seguro:** 1 CONOCE · 2 APLICA · 3 REACCIONA · 4 DENUNCIA |
| Murallas | Murallas coloniales de la ciudad vieja, decorativas, más un "firewall" holográfico que crece al avanzar de era |
| Ataques enemigos | **Incidentes cibernéticos** que aparecen sobre edificios con una baliza de alerta |
| Batalla | **Investigación:** analizar evidencias y deducir qué pasó |
| Botín | Recompensas, más un **Escudo táctico** (consejo de la presentación) al resolver |

## 2. Estructura de archivos y responsables

```
CiberDetective/
  index.html            (integrador)  importmap: "three" y "three/addons/"
  ARQUITECTURA.md       (integrador)
  css/estilo.css        (INTERFAZ)
  js/main.js            (integrador)  arranque, bucle, economía, flujo de casos
  js/nucleo/bus.js      (integrador)  bus de eventos
  js/nucleo/estado.js   (integrador)  estado de la partida
  js/mundo/*.js         (MUNDO)       entrada única: js/mundo/mundo.js
  js/ui/*.js            (INTERFAZ)    entrada única: js/ui/interfaz.js
  js/datos/*.js         (CONTENIDO)   entrada única: js/datos/datos.js
  js/audio/*.js         (AUDIO)       entrada única: js/audio/audio.js
  assets/modelos/       (MUNDO)       .glb generados con Blender
  assets/texturas/      (MUNDO / INTERFAZ)
  vendor/three/         Three.js r170 (NO modificar)
  revision/             capturas y críticas visuales
```

Cada agente **solo escribe en sus carpetas**. Si necesitas algo de otro módulo, usa el contrato; no edites su código.

Las importaciones van con el importmap:
```js
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
```
No hay paso de compilación ni npm: son módulos ES nativos. Para servirlo: `py -m http.server 8130` desde la carpeta `CiberDetective`.

---

## 3. Catálogo de edificios (ids FIJOS: los usan MUNDO, CONTENIDO e INTERFAZ)

| id | nombre | tipo | rol |
|---|---|---|---|
| `central` | Central de Ciberpolicía | `central` | base del jugador; el detective sale de aquí |
| `laboratorio` | Laboratorio Forense | `laboratorio` | tecnologías |
| `banco` | Banco del Puerto | `banco` | caso de cuentas vaciadas |
| `colegio` | Colegio La Muralla | `colegio` | casos escolares |
| `cibercafe` | Cibercafé Pixel | `cibercafe` | caso gamer / grooming |
| `cafe-malecon` | Café del Malecón (Wi-Fi público) | `cafe` | caso Wi-Fi público |
| `tecnostore` | TecnoStore | `tienda` | caso troyano / APK |
| `torre-telecom` | Torre de Telecomunicaciones | `torre` | hito visual del skyline |
| `alcaldia` | Alcaldía de Puerto Nexo | `alcaldia` | hito colonial |
| `puerto` | Terminal Portuaria | `puerto` | grúas y contenedores |
| `casa-1` … `casa-8` | Vivienda de la familia … | `casa` | casos de ciudadanos |

MUNDO puede añadir todos los edificios decorativos que quiera (sin id de catálogo), pero **todos los ids anteriores deben existir** y poder seleccionarse.

---

## 4. Contrato del MUNDO (`js/mundo/mundo.js`)

```js
export async function crearMundo({ contenedor, alProgreso }) // contenedor: HTMLElement donde va el <canvas>
  // alProgreso(0..1, 'texto') para la pantalla de carga
  // → devuelve el objeto `mundo`:

mundo.actualizar(dt, t)        // dt en segundos; anima tráfico, peatones, agua, detective y balizas
mundo.renderizar()             // renderiza con postprocesado
mundo.redimensionar()          // lo llama main en window.resize
mundo.pausar(bool)             // congela la simulación (no la cámara)

mundo.edificios                // Map<id, { id, tipo, nombre, posicion: THREE.Vector3, entrada: THREE.Vector3 }>
mundo.detective                // { posicion: THREE.Vector3, ocupado: boolean }
mundo.moverDetective(idEdificio) // → Promise que se resuelve al llegar; camina por las calles (ruta en grafo)
mundo.seleccionarDetective(bool)  // anillo de selección
mundo.ponerAlerta(id, { nivel: 'alta'|'media', color })  // baliza holográfica pulsante + icono sobre el edificio
mundo.quitarAlerta(id)
mundo.marcarSeguro(id)         // efecto de escudo verde breve + estado "asegurado"
mundo.resaltar(id|null)        // contorno o realce al pasar el mouse
mundo.nivelFirewall(era)       // 1..4: el firewall holográfico de la ciudad crece
mundo.centrarCamara(x, z, suave = true)
mundo.datosMinimapa()          // { limites:{minX,maxX,minZ,maxZ}, calles:[[x,z],...][], edificios:[{id,x,z,w,d,tipo,color}], agua:[[x,z],...][] }
mundo.vistaCamara()            // 4 puntos [x,z] del área visible en el suelo (para dibujar el rectángulo del minimapa)

mundo.al(evento, fn)           // eventos:
  // 'click-edificio' { id, boton: 0|2 }   (2 = clic derecho, orden estilo AoE2)
  // 'click-detective' {}
  // 'click-suelo' { x, z, boton }
  // 'hover' { id|null, tipo: 'edificio'|'detective'|null }
  // 'detective-llego' { id }
```

**Cámara estilo AoE2:** perspectiva con FOV estrecho (unos 30°), inclinación de unos 50° y giro de 45°. Se mueve con WASD o las flechas, con el mouse en los bordes y arrastrando con el botón central. La rueda hace zoom con límites. No hay rotación libre (opcional: Q/E en pasos de 90° con transición suave). La cámara no sale de los límites de la ciudad.

**Las entradas de mouse las maneja el canvas del MUNDO.** La INTERFAZ es una capa DOM encima con `pointer-events: none`, salvo en sus paneles.

## 5. Contrato de la INTERFAZ (`js/ui/interfaz.js`)

```js
export function crearInterfaz({ raiz /* HTMLElement */, datos /* módulo de datos */ }) // → ui

ui.pantallaCarga(progreso 0..1, texto)
ui.ocultarCarga()
ui.menuPrincipal()             // → Promise<'jugar'>
ui.intro(paginas)              // → Promise (paginas: [{titulo, texto}])

ui.recursos({ confianza, energia, energiaMax, presupuesto, evidencia })
ui.era(eraObj)                 // eraObj de datos.ERAS
ui.reloj(segundosDeJuego)

ui.seleccion(info|null)        // panel inferior estilo AoE2:
  // info = { tipo:'detective'|'edificio', id, nombre, subtitulo, descripcion, retrato /* emoji o url */,
  //          estado /* texto */, acciones:[{ id, etiqueta, icono, atajo, tooltip, deshabilitado, costo }] }
ui.notificar({ titulo, texto, tipo: 'alerta'|'info'|'exito'|'error', accion?: { etiqueta, fn } })
ui.casosActivos(lista)         // lista lateral de incidentes: [{ id, titulo, edificio, urgencia, tiempoRestante }]

ui.investigacion(caso, ctx)    // → Promise<{ resuelto: boolean, aciertos, total, analizadas: [idEvidencia] }>
  // ctx = { energia: () => number, gastarEnergia: (n) => boolean, tecnologias: Set<idTecnologia> }
  // TABLERO DE INVESTIGACIÓN a pantalla completa (el corazón del juego):
  //  - ficha de la víctima, declaración, evidencias como tarjetas
  //  - "ANALIZAR" una evidencia gasta energía y revela su `pista` (algunas tecnologías revelan gratis)
  //  - render especializado por tipo de evidencia (sms, chat, correo, url, extracto, registro, perfil, archivo)
  //  - deducción: responder las `preguntas` del caso; se puede marcar evidencia como "clave"
  //  - al confirmar: resultado, y se resuelve la Promise
ui.escudoTactico(caso, resultado) // → Promise. Tarjeta del consejo (caso.consejo) y autoridad a la que acudir

ui.laboratorio(tecnologias, ctx)  // → Promise<idTecnologia|null>
  // ctx = { investigadas:Set, puedePagar:(costo)=>boolean, eraActual }
ui.avanzarEra(eraSiguiente, ctx)  // → Promise<boolean> confirmación con requisitos

ui.minimapa(datosMinimapa, { vista, alertas:[id], detective:{x,z}, seguros:[id] })  // se llama cada frame (dibujar barato)
ui.final(estadisticas)         // pantalla de victoria

ui.al(evento, fn)              // eventos:
  // 'accion' { id, contexto }   (botón del panel o atajo de teclado)
  // 'minimapa' { x, z }         (clic en el minimapa → mover cámara)
  // 'caso' { id }               (clic en un caso de la lista lateral)
  // 'pausa' { pausado }
```

**Dirección de arte de la interfaz:** "AoE2 reimaginado para 2026". Paneles con marco de metal oscuro bruñido y filetes dorados, más vidrio ahumado holográfico con acentos cian. Las tipografías son Cinzel (títulos), Rajdhani (interfaz) y JetBrains Mono (evidencias técnicas). Todas las fuentes se guardan localmente en `css/fuentes/`. Debe sentirse AAA: profundidad, sombras internas, microanimaciones y estados hover y pressed.

## 6. Contrato del CONTENIDO (`js/datos/datos.js`)

```js
export const ERAS = [ { n:1, id:'conoce', nombre:'CONOCE', subtitulo:'El Mapa', descripcion, requisito:{ casos:0, presupuesto:0, evidencia:0 }, color }, … 4 eras ]
export const RECURSOS_INICIALES = { confianza:60, energia:100, energiaMax:100, presupuesto:150, evidencia:0 }
export const TECNOLOGIAS = [ { id, nombre, icono, descripcion, era, costo:{ presupuesto, evidencia }, efecto:{ tipo, valor } } ]
  // tipos de efecto que main.js sabe aplicar:
  // 'energia-max' (+valor), 'regen-energia' (+valor por minuto), 'revelar-tipo' (valor: tipo de evidencia que se analiza gratis),
  // 'confianza-pasiva' (+valor por minuto), 'presupuesto-pasivo' (+valor por minuto), 'tiempo-casos' (+valor segundos de plazo)
export const CASOS = [ caso, … ]   // mínimo 8 casos, ordenados por era
export const INTRO = [ { titulo, texto } ]
export const FINAL = { titulo, texto, cita }
export const AUTORIDADES = [ { incidente, nombre, contacto } ]
export const DETECTIVE = { nombre:'Valeria Ríos', rango, retrato, frases:{ seleccion:[], orden:[], llegada:[] } }
```

### Estructura de un caso
```js
{
  id: 'banco-cuentas-vaciadas',
  titulo: 'Cuentas vaciadas',
  edificio: 'banco',                // id del catálogo
  era: 1,                           // era mínima para que aparezca
  cuadrante: 'tecnico'|'contacto'|'contenido'|'conducta',   // los 4 cuadrantes del riesgo
  urgencia: 'alta'|'media',
  plazo: 240,                       // segundos antes de que se pierda confianza
  victima: { nombre, edad, rol, retrato /* emoji */ },
  resumen: 'texto corto para la notificación',
  declaracion: 'lo que cuenta la víctima, en primera persona (3-5 frases)',
  evidencias: [
    { id, tipo, titulo, contenido: {…según tipo…}, pista: 'lo que revela el análisis', costo: 15, clave: true|false }
  ],
  preguntas: [   // 2 o 3 preguntas de deducción
    { id, texto, opciones: [ { texto, correcta: true|false, retro: 'por qué' } ] }
  ],
  explicacion: 'cómo ocurrió el ataque, paso a paso (se muestra al resolver)',
  recompensa: { presupuesto, evidencia, confianza },
  consejo: { titulo: 'ESCUDO TÁCTICO', puntos: [ '…', '…', '…' ] },
  autoridad: 'Centro Cibernético Policial (CAI Virtual)'
}
```

### Contenido de cada tipo de evidencia
- `sms`: `{ remitente, hora, texto, enlaces: [] }`
- `chat`: `{ app, contacto, mensajes: [ { de: 'victima'|'contacto', texto, hora } ] }`
- `correo`: `{ de, para, asunto, fecha, cuerpo, adjuntos: [] }`
- `url`: `{ mostrada, real, certificado, creado, observaciones }`
- `extracto`: `{ banco, cuenta, movimientos: [ { fecha, hora, concepto, monto, destino } ] }`
- `registro`: `{ sistema, lineas: [ { hora, evento, detalle } ] }`
- `perfil`: `{ red, usuario, nombreVisible, seguidores, siguiendo, creado, bio, publicaciones, observaciones }`
- `archivo`: `{ nombre, tamano, origen, firma, permisos: [] }`

## 7. Contrato del AUDIO (`js/audio/audio.js`)

```js
export const audio = {
  iniciar(),               // tras el primer gesto del usuario
  volumen(general 0..1),
  ambiente(activo),        // ciudad costera: olas, tráfico lejano, gaviotas, murmullo
  musica(modo),            // 'menu' | 'exploracion' | 'tension' | 'investigacion' | 'victoria' | null
  sfx(nombre)              // 'click','hover','seleccion','orden','alerta','caso-nuevo','analizar','pista',
                           // 'acierto','error','resuelto','era','tecnologia','notificacion','abrir','cerrar'
}
```
Todo el audio es **sintetizado con Web Audio**, sin archivos (funciona sin conexión y no hay licencias que revisar).

## 8. Flujo de juego (lo implementa `main.js`)
1. Pantalla de carga → menú principal → intro → partida.
2. La cámara empieza centrada en la Central y el detective está en la puerta.
3. Cada cierto tiempo, o al resolver un caso, aparece el siguiente caso disponible para la era actual: alerta en el edificio, notificación y entrada en la lista de casos.
4. El jugador selecciona al detective (clic) y hace clic derecho en el edificio, o usa "Investigar" en el panel. El detective camina hasta allá y se abre el tablero de investigación.
5. Al resolverlo: recompensas, Escudo táctico, edificio asegurado. Si falla: pierde confianza y el caso queda reabierto con una penalización.
6. Si vence el plazo de un caso sin atender, la confianza baja de forma continua.
7. Avanzar de era (en la Central) cuando se cumplen los requisitos. Las tecnologías se investigan en el Laboratorio.
8. **Victoria:** se resuelven todos los casos y se alcanza la era 4 DENUNCIA. **Derrota:** la confianza llega a 0, con opción de reintentar.

## 9. Calidad exigida (AAA)
- 60 fps en un PC de gama media a 1080p. Usa instancias para lo repetido (árboles, autos, peatones, ventanas, farolas).
- Iluminación cálida de atardecer caribeño, sombras suaves, oclusión ambiental, bloom sutil en neones y balizas, niebla atmosférica y tone mapping ACES.
- Detalle a escala humana: balcones coloniales con flores, toldos, letreros, antenas, aires acondicionados, paneles solares, palmeras, bancas, semáforos y autos y peatones moviéndose.
- Ningún placeholder gris ni texto de depuración visible.
