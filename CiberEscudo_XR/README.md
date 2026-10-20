# CiberEscudo XR: Brecha en tu salón

Juego de realidad mixta para **Meta Quest 3S**, pensado para una charla de ciberseguridad y acoso en la red con estudiantes de 10° y 11°.

**La idea:** el salón fue hackeado. En las paredes reales se abren portales y salen drones con mensajes. El estudiante los **escanea** apuntando con el mando y **dispara con el gatillo** a las estafas. Los mensajes legítimos los deja pasar. Luego aparece un compañero holográfico que está siendo acosado: hay que bloquear los ataques y elegir cómo ayudarlo.

Cada partida dura unos **2 minutos y medio**. En una charla de 40 minutos pueden jugar entre 8 y 10 estudiantes, mientras el resto mira la transmisión.

---

## Cómo se juega

| Fase | Duración | Qué hace el estudiante |
|---|---|---|
| Inicio | — | Dispara a **INICIAR MISIÓN** |
| 1 · Estafas | 70 s | Dispara a las estafas y deja pasar lo legítimo. Si apunta un momento a un mensaje, lo **escanea** y ve la pista (+50 puntos). |
| 2 · Ciberacoso | 28 s | Dispara a los mensajes de acoso antes de que alcancen a su amigo. |
| 2 · Ayuda | 30 s | Dispara **solo** a las acciones correctas: guardar evidencia, bloquear y reportar, contarle a un adulto, apoyar al amigo. |
| Informe | — | Puntaje, rango, Top 5 y líneas de ayuda. **SIGUIENTE AGENTE** inicia una nueva partida sin salir del casco. |

**Puntos:** estafa bloqueada +100 (más combo y bonus de escaneo) · mensaje legítimo recibido +100 · disparar a un mensaje real −100 · cada estafa que te alcanza baja un 20 % del firewall.

---

## Instalarlo en el Quest (hacerlo HOY, con internet)

El juego es una página web (WebXR). No necesita la tienda de Meta ni pagar nada. Para que el Quest permita realidad mixta, la página debe abrirse desde **https://**. La forma gratuita es GitHub Pages:

1. Crea una cuenta gratis en https://github.com, si no tienes una.
2. Crea un repositorio nuevo **público**, por ejemplo `ciberescudo`.
3. Toca **"uploading an existing file"** y arrastra **todo el contenido** de esta carpeta (`index.html`, `sw.js`, `manifest.webmanifest`, `icono.svg` y las carpetas `js`, `vendor` y `fuentes`). No subas `version_anterior`. Toca **Commit changes**.
4. Ve a **Settings → Pages**. En *Branch* elige `main` y la carpeta `/ (root)`, y guarda.
5. Espera 1 o 2 minutos. La dirección será `https://TU_USUARIO.github.io/ciberescudo/`.
6. **En el Quest**, abre esa dirección en el navegador, **con internet**, y guárdala en favoritos.
7. Espera a que el menú diga **"✔ Listo para usar sin conexión"**. Desde ese momento el juego queda guardado en el casco.

### Prueba sin conexión (importante)
Esta noche, en el Quest: apaga el Wi-Fi, abre el favorito y entra a una partida. Si carga, mañana funcionará sin internet.

> No borres los datos de navegación del navegador del Quest: ahí queda guardada la copia sin conexión.

---

## El día de la charla

1. **Configura el espacio** en el Quest, en el lugar de la charla: *Configuración → Entorno físico → Configuración del espacio*. Con eso el juego sabe dónde están las paredes y pone los portales en ellas. Si no se hace, los portales aparecen igual, flotando frente al jugador.
2. Abre el favorito → **REALIDAD MIXTA**.
3. Si el casco pregunta por **acceso a los datos del espacio**, toca **Permitir**.
4. Entrega el casco al estudiante. Explícale: *"Gatillo para disparar. Apunta un momento a un mensaje para escanearlo."*
5. Al terminar, el estudiante dispara a **SIGUIENTE AGENTE** y pasas el casco al siguiente.
6. Para borrar el ranking antes del evento, toca **Reiniciar ranking** en el menú.

### Que el público vea lo que pasa en el casco
- **Con Wi-Fi en el lugar:** transmite desde el Quest (*Transmitir*) a un televisor con Chromecast, o a un computador en https://www.meta.com/casting, conectados a la **misma red**.
- **Sin Wi-Fi:** la transmisión del Quest necesita red. Una opción es crear una zona Wi-Fi con un celular y conectar ahí el Quest y el computador. Pruébalo antes, porque no siempre funciona sin internet.

---

## Plan B: sin internet desde el inicio

Si no lograste abrirlo con internet en el Quest, se puede servir desde un computador por cable USB, con `adb reverse` y `http://localhost`. Requiere activar el **modo desarrollador** del Quest e instalar *Android Platform Tools*. Es más técnico; úsalo solo si falla lo anterior.

```bash
adb reverse tcp:8123 tcp:8123
```
```bash
py -m http.server 8123
```
El segundo comando se ejecuta dentro de esta carpeta. Luego, en el Quest, abre `http://localhost:8123`.

---

## Probarlo en el computador

Desde esta carpeta:
```bash
py -m http.server 8123
```
Abre `http://localhost:8123` → **PROBAR EN PANTALLA**: clic para disparar, arrastra para mirar.

## Editar el contenido

- **Casos, mensajes de acoso y acciones:** `js/datos.js`. Los textos deben ser cortos, porque se leen flotando en el aire.
- **Tiempos y puntos:** el bloque `CONFIG` al inicio de `js/juego.js`.
- **Después de cambiar algo:** sube los archivos de nuevo a GitHub y, en `sw.js`, cambia `VERSION` (por ejemplo `ciberescudo-v2`).

## Marca
El juego lleva la marca institucional de la **Gobernación de Bolívar · Secretaría de las TIC**, con los emblemas que entregó la Secretaría y siguiendo el *Manual de Identidad Visual 2024 de la Gobernación de Bolívar* (resumen aplicado en `../marca secretaria tic de bolivar/REGLAS_DE_USO_EN_LOS_JUEGOS.md`).

| Archivo | Qué es |
|---|---|
| `marca/logo_secretaria.png` (500×200) | Logo completo en negativo (escudo + «GOBERNACIÓN DE BOLÍVAR \| Secretaría de las TIC» en blanco). Solo sobre fondo oscuro. |
| `marca/escudo.png` (512×512) | Escudo a color, sin texto. |

Dónde aparece:
- **Menú** (`index.html`): logo en un panel oscuro opaco con borde fino, arriba del título, y la leyenda «Una iniciativa de la Gobernación de Bolívar · Secretaría de las TIC».
- **Inicio de la misión** (todos los modos): placa oscura opaca bajo el banner, con el logo y la leyenda (no recibe el glitch ni la escritura del banner).
- **Plataforma de mando** (todos los modos, también realidad mixta): el escudo como sello en el centro, sobre un disco oscuro.
- **Sala de mando** (VR y pantalla): el logo en la pared frontal y en la trasera, en lugar del rótulo ficticio «ASTRANOVA» del kit sci-fi; los rótulos pequeños de las consolas laterales quedan tapados con paneles oscuros lisos.
- **Informe de misión**: franja inferior con el logo en un recuadro oscuro y la leyenda.
- El HUD de la partida no lleva logo.

Reglas que se respetan: el emblema va siempre sobre un panel oscuro opaco con margen de seguridad, en su proporción original, sin recolorear ni teñir con el tema verde, sin transparencia, sin brillo y sin efectos encima. Los PNG son de baja resolución; para piezas grandes o impresas hay que pedir los vectoriales a la Gobernación. Si las imágenes no cargan, el juego sigue sin ellas.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | Menú y escena |
| `js/juego.js` | Motor del juego: portales, drones, disparos, fases, efectos y ranking |
| `js/datos.js` | Contenido educativo |
| `js/audio.js` | Música y efectos sintetizados, sin archivos de audio |
| `sw.js`, `manifest.webmanifest` | Modo sin conexión |
| `vendor/`, `fuentes/` | A-Frame 1.6.0 y fuentes Orbitron y Rajdhani, guardadas en la carpeta |
| `version_anterior/` | El prototipo original de preguntas |


---

## Estilo y créditos

**CIBERESCUDO · CÓDIGO VERDE.** Estilo inspirado en las interfaces de terminal verde y la lluvia de código. Homenaje propio, sin relación con ninguna película o marca.

- Modelos del kit sci-fi (`modelos/scifi/`): **Quaternius** (https://quaternius.com), *Modular SciFi MegaKit*, licencia **CC0 1.0** (dominio público).
- Fuentes Orbitron y Rajdhani: licencia SIL Open Font License.
- Lluvia de código: shader propio (`Lluvia` en `js/juego.js`); los glifos se generan al arrancar en un canvas, sin archivos externos. Ajustes en la constante `LLUVIA`; la paleta está en la constante `COL`.
