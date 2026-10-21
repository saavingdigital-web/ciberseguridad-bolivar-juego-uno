"""
CiberEscudo XR - Generador del Blaster de Plasma Alienígena inspirado en Halo Covenant.
Genera 'blaster_naranja.glb' y 'blaster_cian.glb' en CiberEscudo_XR/modelos/
"""
import bpy
import math
import os

CARPETA = os.path.dirname(os.path.abspath(__file__))
DESTINO_MODELOS = os.path.abspath(os.path.join(CARPETA, ".."))

R90 = math.radians(90)

def limpiar():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def mat_pbr(nombre, color, metal=0.7, rug=0.3, emision=None, em_fuerza=0.0):
    m = bpy.data.materials.new(nombre)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1.0)
    b.inputs["Metallic"].default_value = metal
    b.inputs["Roughness"].default_value = rug
    if emision:
        b.inputs["Emission Color"].default_value = (*emision, 1.0)
        b.inputs["Emission Strength"].default_value = em_fuerza
    return m

def suave(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.shade_smooth()
    obj.select_set(False)

def crear_caja(nombre, tam, pos, mat, bisel=0.008, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos, rotation=rot)
    o = bpy.context.active_object
    o.name = nombre
    o.scale = tam
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bisel > 0:
        mod = o.modifiers.new("Bisel", "BEVEL")
        mod.width = bisel
        mod.segments = 2
    o.data.materials.append(mat)
    suave(o)
    return o

def crear_cilindro(nombre, radio, largo, pos, mat, rot=(0, 0, 0), verts=24):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radio, depth=largo, location=pos, rotation=rot)
    o = bpy.context.active_object
    o.name = nombre
    o.data.materials.append(mat)
    suave(o)
    return o

def crear_esfera(nombre, radio, pos, mat, scale=(1, 1, 1), rot=(0, 0, 0), segs=20, rings=12):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=radio, location=pos, rotation=rot, segments=segs, ring_count=rings)
    o = bpy.context.active_object
    o.name = nombre
    o.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(mat)
    suave(o)
    return o

def crear_aro(nombre, r_mayor, r_menor, pos, mat, rot=(0, 0, 0), segs=24):
    bpy.ops.mesh.primitive_torus_add(major_radius=r_mayor, minor_radius=r_menor, location=pos, rotation=rot, major_segments=segs, minor_segments=12)
    o = bpy.context.active_object
    o.name = nombre
    o.data.materials.append(mat)
    suave(o)
    return o

def construir_blaster_alien(variante="naranja"):
    """
    Construye el arma de plasma alienígena inspirada en Halo Covenant.
    En Blender:
      - Origen = centro del mango (0, 0, 0)
      - Cañón / frente = hacia -Y de Blender (que al exportar a glTF es +Z)
      - Arriba = +Z de Blender (+Y glTF)
      - Boca de disparo = a ~0.205 m en -Y
    """
    # Materiales PBR
    # Coraza Covenant: cobalto oscuro iridiscente y titanio obsidiana
    mat_carcasa = mat_pbr("Carapace_Obsidian", (0.04, 0.07, 0.14), metal=0.88, rug=0.22)
    mat_chasis_oscuro = mat_pbr("Chassis_Dark", (0.015, 0.02, 0.035), metal=0.75, rug=0.35)
    mat_acento_oro = mat_pbr("Armor_Gold", (0.85, 0.65, 0.12), metal=0.92, rug=0.28)
    
    # Plasma neón bio-luminiscente (Cian eléctrico #00E5FF)
    color_plasma = (0.0, 0.9, 1.0)
    mat_plasma = mat_pbr("Plasma_Cyan", color_plasma, metal=0.1, rug=0.15, emision=color_plasma, em_fuerza=12.0)
    color_nucleo = (0.3, 0.95, 1.0)
    mat_nucleo = mat_pbr("Plasma_Core", color_nucleo, metal=0.0, rug=0.1, emision=color_nucleo, em_fuerza=16.0)

    partes = []

    # 1. Mango ergonómico Covenant (inclinado -16° hacia atrás)
    partes.append(crear_caja("Mango_Base", (0.034, 0.046, 0.11), (0, 0.015, -0.01), mat_chasis_oscuro, bisel=0.008, rot=(math.radians(-16), 0, 0)))
    partes.append(crear_caja("Mango_Grip1", (0.036, 0.048, 0.014), (0, 0.018, -0.025), mat_carcasa, bisel=0.004, rot=(math.radians(-16), 0, 0)))
    partes.append(crear_caja("Mango_Grip2", (0.036, 0.048, 0.014), (0, 0.012, 0.005), mat_carcasa, bisel=0.004, rot=(math.radians(-16), 0, 0)))
    
    # Tapa de batería inferior del mango
    partes.append(crear_esfera("Culata_Cap", 0.022, (0, 0.032, -0.068), mat_acento_oro, scale=(0.9, 1.2, 0.6), rot=(math.radians(-16), 0, 0)))
    partes.append(crear_esfera("Culata_Luz", 0.009, (0, 0.033, -0.076), mat_plasma, scale=(0.8, 1.0, 0.5)))

    # 2. Coraza Superior Curva Biomecánica (Perfil elipsoidal aerodinámico)
    # Lomo arqueado principal
    partes.append(crear_esfera("Lomo_Principal", 0.048, (0, -0.045, 0.082), mat_carcasa, scale=(0.6, 2.3, 0.75), rot=(math.radians(12), 0, 0)))
    partes.append(crear_esfera("Capucha_Superior", 0.036, (0, -0.06, 0.108), mat_carcasa, scale=(0.65, 1.7, 0.6), rot=(math.radians(14), 0, 0)))

    # Quilla inferior protectora
    partes.append(crear_esfera("Quilla_Inferior", 0.032, (0, -0.055, 0.038), mat_chasis_oscuro, scale=(0.58, 2.0, 0.55), rot=(math.radians(10), 0, 0)))

    # 3. Cámara de Energía de Plasma (Batería brillante visible en el dorso)
    partes.append(crear_cilindro("Plasma_Cell", 0.016, 0.10, (0, -0.035, 0.102), mat_plasma, rot=(R90 + math.radians(12), 0, 0), verts=20))
    partes.append(crear_esfera("Plasma_Core_Bulb", 0.022, (0, -0.01, 0.096), mat_nucleo, scale=(0.6, 0.9, 0.6)))

    # Costillas / Branquias de enfriamiento de plasma sobre el lomo
    for i, y_pos in enumerate([-0.005, -0.035, -0.065]):
        z_pos = 0.098 + (i * 0.006)
        partes.append(crear_aro(f"Costilla_{i}", 0.027, 0.0035, (0, y_pos, z_pos), mat_acento_oro, rot=(math.radians(12), 0, 0), segs=20))

    # 4. Doble Pinza Frontal de Plasma (Split Muzzle Prongs - Estilo Halo Covenant)
    # Pinza Superior (curva hacia abajo)
    partes.append(crear_esfera("Pinza_Sup_Base", 0.022, (0, -0.13, 0.088), mat_carcasa, scale=(0.65, 1.6, 0.55), rot=(math.radians(18), 0, 0)))
    partes.append(crear_esfera("Pinza_Sup_Punta", 0.014, (0, -0.185, 0.082), mat_acento_oro, scale=(0.6, 1.9, 0.4), rot=(math.radians(12), 0, 0)))

    # Pinza Inferior (curva hacia arriba)
    partes.append(crear_esfera("Pinza_Inf_Base", 0.020, (0, -0.125, 0.046), mat_carcasa, scale=(0.65, 1.5, 0.5), rot=(math.radians(-10), 0, 0)))
    partes.append(crear_esfera("Pinza_Inf_Punta", 0.013, (0, -0.18, 0.052), mat_acento_oro, scale=(0.58, 1.8, 0.38), rot=(math.radians(-6), 0, 0)))

    # Emi-anillo de compresión y foco de plasma entre las pinzas (a -0.205 m, justo en la boca de disparo)
    partes.append(crear_aro("Anillo_Foco_Plasma", 0.015, 0.0038, (0, -0.175, 0.067), mat_plasma, rot=(R90, 0, 0), segs=24))
    partes.append(crear_esfera("Nucleo_Boca_Disparo", 0.009, (0, -0.205, 0.067), mat_nucleo, scale=(1.0, 1.2, 1.0)))

    # 5. Ranuras Bio-Luminiscentes Laterales (Vents de ventilación de plasma)
    for lado in (-1, 1):
        x = 0.024 * lado
        # Acento aerodinámico lateral
        partes.append(crear_caja(f"Vent_Lateral_Sup_{lado}", (0.004, 0.085, 0.006), (x, -0.045, 0.085), mat_plasma, bisel=0.001, rot=(math.radians(12), 0, math.radians(6 * lado))))
        partes.append(crear_caja(f"Vent_Lateral_Inf_{lado}", (0.0035, 0.055, 0.005), (x * 0.95, -0.04, 0.062), mat_plasma, bisel=0.001, rot=(math.radians(10), 0, math.radians(6 * lado))))
        # Aleta deflectora Covenant
        partes.append(crear_esfera(f"Aleta_Covenant_{lado}", 0.016, (x * 1.05, -0.07, 0.072), mat_acento_oro, scale=(0.28, 1.4, 0.5), rot=(math.radians(14), 0, math.radians(8 * lado))))

    # 6. Guardamonte integrado y Gatillo de Plasma
    partes.append(crear_caja("Guarda_Curva", (0.010, 0.065, 0.008), (0, -0.042, 0.016), mat_chasis_oscuro, bisel=0.002, rot=(math.radians(24), 0, 0)))
    partes.append(crear_caja("Gatillo_Plasma", (0.008, 0.014, 0.024), (0, -0.018, 0.038), mat_plasma, bisel=0.002, rot=(math.radians(18), 0, 0)))

    return partes

def exportar(nombre_base):
    limpiar()
    partes = construir_blaster_alien(nombre_base)
    bpy.ops.object.select_all(action="DESELECT")
    for o in partes:
        o.select_set(True)
    bpy.context.view_layer.objects.active = partes[0]
    bpy.ops.object.join()
    unido = bpy.context.view_layer.objects.active
    unido.name = "blaster"
    
    destino = os.path.join(DESTINO_MODELOS, f"{nombre_base}.glb")
    bpy.ops.export_scene.gltf(
        filepath=destino,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_materials="EXPORT",
    )
    print(f"Exportado exitosamente: {destino}")

if __name__ == "__main__":
    exportar("blaster_naranja")
    exportar("blaster_cian")
