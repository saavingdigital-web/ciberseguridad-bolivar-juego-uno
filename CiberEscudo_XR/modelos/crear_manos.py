"""
CiberEscudo XR - Manos en primera persona (POV) para el Meta Quest.

Genera dos archivos .glb en esta misma carpeta:
  mano_derecha.glb   mano_izquierda.glb

Origen de cada modelo = el agarre del mando (donde está el blaster).
El antebrazo se extiende hacia +Z (hacia el jugador) y los dedos envuelven el agarre.

Ejecutar desde la carpeta del proyecto:
  "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" --background --factory-startup --python modelos\crear_manos.py
"""
import bpy
import math
import os

CARPETA = os.path.dirname(os.path.abspath(__file__))

# Colores (aproximados en espacio lineal)
GUANTE = (0.030, 0.045, 0.085)     # azul casi negro
MANGA = (0.045, 0.055, 0.075)      # gris oscuro
NARANJA = (1.0, 0.45, 0.0)
CIAN = (0.0, 0.85, 0.95)


def limpiar_escena():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def material(nombre, color, emision=None, fuerza=0.0, rugosidad=0.5):
    m = bpy.data.materials.new(nombre)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1.0)
    b.inputs["Roughness"].default_value = rugosidad
    b.inputs["Metallic"].default_value = 0.0
    if emision:
        b.inputs["Emission Color"].default_value = (*emision, 1.0)
        b.inputs["Emission Strength"].default_value = fuerza
    return m


def suavizar(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.shade_smooth()
    obj.select_set(False)


def caja(nombre, tam, pos, mat, bisel=0.012, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos, rotation=rot)
    o = bpy.context.active_object
    o.name = nombre
    o.scale = tam
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    mod = o.modifiers.new("bisel", "BEVEL")
    mod.width = bisel
    mod.segments = 1
    o.data.materials.append(mat)
    suavizar(o)
    return o


def cilindro(nombre, radio, largo, pos, mat, rot=(0, 0, 0), verts=20):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radio, depth=largo, location=pos, rotation=rot)
    o = bpy.context.active_object
    o.name = nombre
    o.data.materials.append(mat)
    suavizar(o)
    return o


def aro(nombre, radio_mayor, radio_menor, pos, mat):
    bpy.ops.mesh.primitive_torus_add(major_radius=radio_mayor, minor_radius=radio_menor, location=pos)
    o = bpy.context.active_object
    o.name = nombre
    o.data.materials.append(mat)
    suavizar(o)
    return o


def construir_mano(lado):
    """lado = 'derecha' o 'izquierda'. Solo cambia el lado del pulgar."""
    sentido = 1 if lado == "derecha" else -1
    mat_guante = material("Guante", GUANTE, rugosidad=0.45)
    mat_manga = material("Manga", MANGA, rugosidad=0.6)
    mat_naranja = material("Naranja", NARANJA, NARANJA, 6.0)
    mat_cian = material("Cian", CIAN, CIAN, 4.0)

    partes = []

    # Palma: bloque redondeado
    partes.append(caja("Palma", (0.072, 0.05, 0.075), (0, 0, 0), mat_guante, bisel=0.016))

    # Dedos envolviendo el agarre (por debajo y al frente de la palma)
    for i, x in enumerate([-0.024, -0.008, 0.008, 0.024]):
        partes.append(cilindro(f"Dedo{i}", 0.0115, 0.052, (x, -0.034, -0.012), mat_guante,
                               rot=(math.radians(90), 0, 0), verts=12))
        # Falange del dedo doblada hacia atrás (cierra el puño)
        partes.append(cilindro(f"Falange{i}", 0.0105, 0.03, (x, -0.024, 0.026), mat_guante,
                               rot=(math.radians(90), 0, 0), verts=12))

    # Pulgar sobre el agarre
    partes.append(cilindro("Pulgar", 0.0125, 0.052, (0.04 * sentido, 0.012, -0.016), mat_guante,
                           rot=(math.radians(90), 0, math.radians(35 * sentido)), verts=12))

    # Nudillos: pequeñas esferas para redondear la parte superior
    for i, x in enumerate([-0.026, -0.009, 0.008, 0.025]):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.0125, location=(x, 0.026, -0.03), segments=12, ring_count=8)
        o = bpy.context.active_object
        o.name = f"Nudillo{i}"
        o.data.materials.append(mat_guante)
        suavizar(o)
        partes.append(o)

    # Antebrazo
    partes.append(cilindro("Antebrazo", 0.042, 0.2, (0, -0.005, 0.14), mat_guante,
                           rot=(math.radians(0), 0, 0), verts=22))
    # Muñeca: anillo de transición
    partes.append(cilindro("Muneca", 0.034, 0.03, (0, -0.005, 0.04), mat_guante, verts=22))

    # Manga: el alumno la lleva en el antebrazo, cubriéndolo desde el codo
    partes.append(cilindro("Manga", 0.05, 0.12, (0, -0.005, 0.28), mat_manga, verts=24))
    partes.append(aro("RibeteManga", 0.05, 0.0045, (0, -0.005, 0.22), mat_naranja))
    partes.append(aro("RibeteManga2", 0.05, 0.0045, (0, -0.005, 0.34), mat_naranja))

    # Tiras luminosas en el dorso del antebrazo
    partes.append(caja("TiraCian", (0.006, 0.006, 0.19), (0, 0.042, 0.14), mat_cian, bisel=0.002))
    partes.append(caja("TiraNaranja", (0.006, 0.006, 0.09), (0.028, 0.02, 0.27), mat_naranja, bisel=0.002))

    # Anillo de luz en la palma (lo que se ve a través del guante)
    partes.append(aro("AnilloPalma", 0.03, 0.0035, (0, 0.028, 0.0), mat_cian))

    return partes


def exportar(lado):
    limpiar_escena()
    partes = construir_mano(lado)
    bpy.ops.object.select_all(action="DESELECT")
    for o in partes:
        o.select_set(True)
    bpy.context.view_layer.objects.active = partes[0]
    # Une las ~22 piezas en UNA malla (una primitiva por material): en el Quest cada primitiva
    # es una llamada de dibujo, y antes cada mano costaba 22.
    bpy.ops.object.join()
    unido = bpy.context.view_layer.objects.active
    unido.name = f"mano_{lado}"
    destino = os.path.join(CARPETA, f"mano_{lado}.glb")
    bpy.ops.export_scene.gltf(
        filepath=destino,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_materials="EXPORT",
    )
    print("Exportado:", destino)


if __name__ == "__main__":
    exportar("derecha")
    exportar("izquierda")
