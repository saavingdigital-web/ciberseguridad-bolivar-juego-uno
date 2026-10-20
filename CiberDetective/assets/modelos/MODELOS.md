# Biblioteca de modelos 3D · CiberDetective

Modelos hechos con **Blender 5.2** (modo consola, scripts Python en `assets/modelos/fuentes/`) y exportados a `.glb`.
Se usan para sustituir las piezas procedurales del juego por modelos con **siluetas propias, bordes biselados, color pintado y oclusión ambiental horneada**. Es la palanca principal para subir la calidad visual (materiales, densidad de detalle y variedad).

## Estilo

Estilizado pintado a mano de baja poligonía (referencia de ambiente: estrategia clásica con acabado moderno). Caribe colombiano 2026:
- Ciudad vieja: pasteles cálidos (ocre `#d9a441`, turquesa `#3fa7a0`, rosa `#d9788c`, amarillo `#e8c55a`, terracota `#c8643b`), maderas, tejas `#b8552f`, piedra coralina `#cdb48c`.
- Distrito moderno: concreto `#a9a7a2`, vidrio azulado, acentos en cian `#19d8ea`, ámbar `#ffb020`.
- Nada genérico: cada modelo debe tener **detalle propio** (remates, molduras, desgaste, objetos de uso), una **silueta reconocible** y sentirse "de aquí". Cada categoría con 2 a 4 variantes distintas.
- Todo el arte es original. Sin marcas reales, sin logos reales, sin arte de otros juegos.

## Convenciones técnicas (obligatorias)

La librería `fuentes/lib_bl.py` ya implementa lo esencial. **Léela primero** y mira `fuentes/ejemplo_ac.py` como plantilla.

- 1 unidad = 1 m. Origen en el centro de la base, apoyado en el suelo (Z = 0). El frente mira a **-Y de Blender** (queda hacia +Z en glTF).
- Color en el atributo de vértices `Col` (degradado vertical + `ensuciar` + `hornear_ao`). **Sin texturas de imagen.**
- Materiales: `pintado` (principal), opcionalmente `emisivo` (neones, ventanas encendidas, luces) y `vidrio`. Nada más.
- **Presupuesto de triángulos** (por modelo, tras exportar; está en el manifiesto):
  - Prop pequeño (aire acondicionado, papelera, hidrante…): ≤ 400.
  - Mobiliario (farola, banca, semáforo, sombrilla…): ≤ 700.
  - Árbol o palmera: ≤ 900.
  - Vehículo: ≤ 1 600. Personaje de calle: ≤ 900. Detective (héroe): ≤ 3 500.
  - Edificio o torre: ≤ 6 000. Casa colonial: ≤ 4 000.
  Usa bisel de 1 segmento en lo pequeño; el bisel multiplica los triángulos. Si un modelo pasa de presupuesto, simplifica.
- Peso del `.glb`: ≤ 150 KB por modelo (≤ 300 KB los edificios).
- Cada modelo es **un solo objeto** (`unir`) con 1 a 3 materiales.
- Cada script exporta SU categoría y actualiza `assets/modelos/<categoria>/manifiesto.json` (lo hace `exportar`).

## Categorías y responsables

| Categoría | Carpeta | Contenido |
|---|---|---|
| `arquitectura` | `assets/modelos/arquitectura/` | casas coloniales, edificios de apartamentos, torres modernas, bodega de puerto |
| `props` | `assets/modelos/props/` | equipos de azotea, mobiliario urbano, árboles y palmeras, mar y puerto (botes, contenedor, grúa) |
| `vivos` | `assets/modelos/vivos/` | vehículos, peatones y la detective |

## Nombres de modelos esperados (mínimo; puedes añadir más)

**arquitectura:** `casa_colonial_a`, `casa_colonial_b`, `casa_colonial_c`, `apartamentos_a`, `apartamentos_b`, `torre_vidrio_a`, `torre_vidrio_b`, `torre_vidrio_c`, `oficinas_a`, `oficinas_b`, `bodega_puerto`.

**props:** `ac_unidad_a` (ya hecho, ejemplo), `ac_unidad_b`, `tanque_agua`, `antena_celular`, `parabolica`, `panel_solar_fila`, `caja_escalera`, `chimenea`, `tendedero`, `farola`, `semaforo`, `banca`, `papelera`, `hidrante`, `kiosko_sombrilla`, `parada_bus`, `bolardo`, `jardinera`, `poste_electrico`, `palmera_a`, `palmera_b`, `arbol_frondoso_a`, `arbol_frondoso_b`, `sombrilla_playa`, `contenedor_20ft`, `grua_portico`, `bote_pesca`, `velero`.

**vivos:** `sedan_a`, `taxi_amarillo`, `camioneta`, `bus_urbano`, `chiva`, `moto`, `mototaxi`, `camion_reparto`, `peaton_hombre_a`, `peaton_hombre_b`, `peaton_mujer_a`, `peaton_mujer_b`, `estudiante`, `vendedor`, `nino`, `detective_valeria`.
- Los **personajes** se modelan con las piernas y los brazos como parte de la misma malla, de pie y con los brazos relajados al costado; la cadera está a 0.9 m de altura (para que el motor anime el paso con un shader). Altura total 1.75 m (niño 1.2 m).
- Los **vehículos** llevan las ruedas dentro del mismo objeto; el frente a -Y de Blender. Largo real aproximado (sedán 4.5 m, bus 11 m).

## Galería para revisar

`assets/modelos/galeria.html?cat=arquitectura|props|vivos` carga el `manifiesto.json` de la categoría y muestra todos los modelos con luz y sombras. Sirve para revisarlos en el navegador (servidor del proyecto: `py servidor.py`, luego `http://localhost:8130/assets/modelos/galeria.html?cat=props`).
Cada modelo genera además una vista previa PNG en `revision/modelos/<categoria>/` (la hace `vista_previa`).
