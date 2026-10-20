# Plan de integración: Modular SciFi MegaKit [Standard] en CiberEscudo XR

Estado: **PROPUESTA. Todavía no se ha tocado el juego.** Se ejecuta cuando des el visto bueno (ver «Decisiones que necesito de ti»).

## 1. Qué es el kit

- **Autor:** Quaternius. **Licencia:** CC0 1.0 (dominio público): se puede usar, modificar y publicar sin pedir permiso y sin dar créditos. Aun así se dejará una línea de agradecimiento en el README.
- **Archivo recibido:** `Modular SciFi MegaKit[Standard].zip` (48 MB, es un ZIP, no una carpeta). Versión *Standard* (gratuita, parcial). Trae FBX, OBJ y **glTF** (usaremos solo glTF).
- **Contenido (glTF):** 6 categorías.

| Categoría | Piezas | Para qué sirven |
|---|---|---|
| Walls | 84 | paredes, esquinas, ventanas, franjas, bandas superiores e inferiores (módulos de 4 m) |
| Platforms | 38 | suelos, rampas, escaleras, puertas y marcos de puerta |
| Columns | 8 | columnas y soportes |
| Props | 28 | computadores, punto de acceso, cajas, luces, rejillas, ventiladores, rieles, cables |
| Decals | 29 | letras, números, líneas y logos para pegar en paredes |
| Aliens | 3 | criaturas animadas (con esqueleto) |

- **Texturas:** 21 PNG con materiales PBR (color, normal, ORM) y emisivos. Suman unos 30 MB: **demasiado pesado para el Quest tal cual**. Hay que reducirlas.
- Es un kit **modular de interiores** (estaciones espaciales). Pensado para armar salas, no para personajes ni para vuelo de mensajes.

## 2. Qué modelos usar (recomendación)

| Uso en el juego | Pieza del kit | Triángulos | Por qué |
|---|---|---|---|
| **Atacantes de la fase 2 (ciberacoso)** | `Alien_Cyclop` (2 m, animado) | 2 084 | Criatura con carácter y ojo único; sustituye la burbuja de acoso. Entra en el presupuesto del Quest. |
| **Plataforma de mando bajo el jugador** | `Platform_Round1` (Ø 6 m) | 720 | Un anillo de suelo luminoso ancla la experiencia (también en realidad mixta). |
| **Sala de mando (solo VR y modo pantalla)** | `WallAstra_Straight`, `WallAstra_Straight_Window`, `WallBand_Straight`, `TopAstra_Straight`, `BottomMetal_Straight`, `Column_Astra`, `Column_Round` | 66 a 570 c/u | Cierran el escenario con una estación espacial en vez de la cuadrícula negra con estrellas. |
| **Escenografía y utilería** | `Prop_AccessPoint`, `Prop_Computer`, `Prop_Light_Floor`, `Prop_Light_Wide`, `Prop_Vent_Big`, `Prop_Fan_Small`, `Prop_Crate3`, `Prop_ItemHolder` | 150 a 740 | Detalle de sala; el punto de acceso y el computador refuerzan el tema de redes. |
| **Rótulos** | `Decal_Logo`, `Decal_Sign`, `Decal_XSign` | bajo | Marcas en paredes y suelo. |

**Se descartan (por ahora):**
- `Alien_Oculichrysalis` (6 440 tris) y `Alien_Scolitex` (11 036 tris, 3.4 m): demasiado pesados para el Quest y demasiado grandes.
- Resto de paredes y plataformas (rampas, escaleras, puertas): no hacen falta para este juego.
- FBX y OBJ: redundantes con el glTF.

**Se conservan los modelos hechos en Blender** para el dron del mensaje, el portal, los blasters, el compañero holográfico, el escudo y las tarjetas. Motivo: en la fase 1 los mensajes **seguros y las estafas deben verse iguales** (el jugador tiene que escanearlos para decidir). Si las estafas fueran aliens, el juego se regalaría solo.

## 3. Qué cambia, archivo por archivo

### 3.1 Archivos nuevos
- `modelos/scifi/alien_cyclop.glb`: el alien, con su esqueleto y animación, y texturas a 512 px.
- `modelos/scifi/sala_mando.glb`: **un solo modelo estático** con la sala ya montada (paredes, columnas, plataforma, utilería y luces emisivas), unida por material para tener pocas llamadas de dibujo.
- `modelos/scifi/plataforma_mando.glb`: el anillo de suelo para realidad mixta (separado de la sala).
- `modelos/fuentes/scifi_convertir.py`: script de Blender que importa los glTF del kit, reduce texturas, une y exporta.
- `modelos/scifi/CREDITOS.txt`: licencia CC0 y autor.

### 3.2 Archivos modificados
- **`js/juego.js`**
  - Módulo `Modelos`: añadir los 3 GLB nuevos a la precarga y un clonador de modelos con esqueleto (`SkeletonUtils.clone`) para el alien.
  - **Fase 2:** la burbuja de acoso pasa a ser el alien (escala ≈ 0.35 para que mida unos 0.7 m), con su animación en bucle, el panel de texto encima y las mismas hitboxes. Si el GLB falla, se usa la burbuja actual.
  - **Entorno:** en VR y modo pantalla se carga `sala_mando` en lugar de la cuadrícula; en realidad mixta **no** se carga (se ve tu salón real). La `plataforma_mando` se coloca bajo el jugador y el compañero en todos los modos.
  - Los textos, reglas, puntajes y audio **no cambian**.
- **`sw.js`:** añadir los GLB nuevos a `ARCHIVOS` y subir `VERSION` a `ciberescudo-v4`.
- **`index.html`:** sin cambios previstos.
- **`README`** (nuevo, breve): agradecimiento a Quaternius.

### 3.3 Qué NO se toca
Datos y mensajes (`datos.js`), audio, menú, lógica de puntos y los modelos del dron, portal, blasters, compañero, escudo y tarjetas.

## 4. Cómo se prepara el kit para el Quest

1. **Descomprimir en una carpeta nueva** y aislada (los archivos descargados se tratan como datos, nunca se ejecutan). El ZIP original no se modifica.
2. **Blender (modo consola), `scifi_convertir.py`:**
   - importar las piezas seleccionadas;
   - **reducir las texturas a 512 px** y exportarlas como JPEG de calidad media (el kit trae 2 a 4 MB por textura);
   - armar la sala (paredes en hexágono, columnas, plataforma, utilería y luces) y **unir por material**;
   - exportar GLB con las animaciones del alien.
3. **Presupuestos (Quest 3S):**

| Pieza | Triángulos | Peso del GLB |
|---|---|---|
| `alien_cyclop` | ≤ 2 100 | ≤ 400 KB |
| `plataforma_mando` | ≤ 800 | ≤ 150 KB |
| `sala_mando` | ≤ 20 000 | ≤ 1.5 MB |

   Con las piezas actuales la escena queda por debajo de **40 000 triángulos** (hoy son unos 9 000) y de **60 llamadas de dibujo**, dentro del tope razonable del Quest (~100 000).
4. **Luces:** sin luces dinámicas ni sombras (el Quest no las aguanta). El brillo sale de los materiales emisivos del kit y de la luz ambiental.

## 5. Plan de trabajo

| Paso | Qué | Verificación |
|---|---|---|
| 1 | Descomprimir el kit y ejecutar `scifi_convertir.py` | tabla de triángulos y KB; vistas previas PNG |
| 2 | Integrar el alien en la fase 2 (con respaldo procedural) | los GLB cargan con 200; el alien aparece y se anima |
| 3 | Integrar plataforma y sala de mando | capturas en modo pantalla y revisión de la mezcla de colores con el HUD |
| 4 | Ajustar escala y orientación, y medir triángulos y llamadas de dibujo | `renderer.info` en el navegador |
| 5 | Nuevo ZIP v4 para subir | revisión de la lista de archivos |

## 6. Riesgos y límites

- **Sin Quest delante no puedo ver el resultado final.** Solo verifico en el navegador. La escala del alien y el brillo en realidad mixta pueden necesitar un ajuste a ojo con el casco puesto.
- **En realidad mixta el kit casi no se nota**, porque el fondo es tu salón real. Lo que sí cambia ahí son el alien y la plataforma. La sala completa solo aparece en VR y en modo pantalla.
- **Piezas con esqueleto:** el alien usa una animación de la que no sé aún el nombre ni cómo se ve; se revisa al convertirlo.
- **Estilo:** el kit es realista con texturas pintadas; los modelos propios son de baja poligonía con color de vértices. Pueden verse algo distintos entre sí: se compensa con la paleta (naranja, cian y dorado) en luces y decals.
- **Peso:** con texturas a 512 px el juego pasa de ≈ 0.6 MB a ≈ 2.5 MB. Sigue siendo ligero y funciona sin conexión.

## 7. Decisiones que necesito de ti

1. ¿Aliens como atacantes de la fase 2 (en lugar de burbujas), o prefieres que el acoso siga con símbolos y no con criaturas?
2. ¿Sala de mando solo en VR y modo pantalla, o también un panel de estación junto al jugador en realidad mixta?
3. ¿Mantengo los modelos propios para el dron, el portal y el compañero (recomendado)?
