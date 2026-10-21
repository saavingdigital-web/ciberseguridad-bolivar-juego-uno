"""
CiberEscudo XR - Generador de Guantes Espaciales en Primera Persona (POV).
Genera:
  - mano_izquierda.glb : Guante espacial en posición ABIERTA y receptiva con vórtice electromagnético de captura en la palma.
  - mano_derecha.glb   : Guante espacial en empuñadura ergonómica sosteniendo el blaster de plasma.
"""
import bpy
import math
import os

CARPETA = os.path.dirname(os.path.abspath(__file__))

# Colores PBR (espacio lineal aproximado para Principled BSDF)
COLOR_GUANTE = (0.018, 0.028, 0.055)     # Grafito / Obsidiana espacial profundo
COLOR_ARMADURA = (0.035, 0.055, 0.095)   # Titanio azul medianoche
COLOR_CARBONO = (0.012, 0.015, 0.022)    # Fibra de carbono mate
COLOR_CIAN = (0.0, 0.9, 1.0)             # Cian neón Bolívar (#00E5FF)
COLOR_MENTA = (0.0, 1.0, 0.65)           # Verde esmeralda captura (#00FFAA)
COLOR_ORO = (0.9, 0.7, 0.12)             # Oro institucional (#FFCC29)
COLOR_HUD = (0.1, 0.85, 1.0)             # Pantalla holográfica de muñeca

def limpiar():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def mat_pbr(nombre, color, metal=0.6, rug=0.35, emision=None, em_fuerza=0.0):
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

def caja(nombre, tam, pos, mat, bisel=0.006, rot=(0, 0, 0)):
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

def cilindro(nombre, radio, largo, pos, mat, rot=(0, 0, 0), verts=20):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radio, depth=largo, location=pos, rotation=rot)
    o = bpy.context.active_object
    o.name = nombre
    o.data.materials.append(mat)
    suave(o)
    return o

def esfera(nombre, radio, pos, mat, scale=(1, 1, 1), rot=(0, 0, 0), segs=16, rings=10):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=radio, location=pos, rotation=rot, segments=segs, ring_count=rings)
    o = bpy.context.active_object
    o.name = nombre
    o.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(mat)
    suave(o)
    return o

def aro(nombre, r_mayor, r_menor, pos, mat, rot=(0, 0, 0), segs=24):
    bpy.ops.mesh.primitive_torus_add(major_radius=r_mayor, minor_radius=r_menor, location=pos, rotation=rot, major_segments=segs, minor_segments=12)
    o = bpy.context.active_object
    o.name = nombre
    o.data.materials.append(mat)
    suave(o)
    return o

def construir_guante_espacial_izquierdo():
    """
    MANO IZQUIERDA: Guante espacial en posición ABIERTA y receptiva.
    - Dedos extendidos en abanico natural con curva ergonómica.
    - Vórtice electromagnético de captura en la palma abierta.
    - Pantalla mini-HUD en la muñeca.
    """
    mat_traje = mat_pbr("EVA_Suit", COLOR_GUANTE, metal=0.45, rug=0.4)
    mat_placas = mat_pbr("EVA_Armor", COLOR_ARMADURA, metal=0.85, rug=0.25)
    mat_carbono = mat_pbr("Carbon_Plates", COLOR_CARBONO, metal=0.7, rug=0.3)
    mat_cian = mat_pbr("Neon_Cyan", COLOR_CIAN, metal=0.1, rug=0.2, emision=COLOR_CIAN, em_fuerza=12.0)
    mat_menta = mat_pbr("Neon_Mint", COLOR_MENTA, metal=0.1, rug=0.2, emision=COLOR_MENTA, em_fuerza=14.0)
    mat_oro = mat_pbr("Neon_Gold", COLOR_ORO, metal=0.85, rug=0.28, emision=COLOR_ORO, em_fuerza=6.0)
    mat_hud = mat_pbr("HUD_Screen", COLOR_HUD, metal=0.2, rug=0.15, emision=COLOR_HUD, em_fuerza=10.0)

    partes = []

    # 1. Palma Abierta (orientada con la cara interior hacia -Y y -Z para atrapar)
    partes.append(caja("Palma_Base", (0.076, 0.038, 0.078), (0, -0.005, 0.0), mat_traje, bisel=0.012, rot=(math.radians(10), 0, 0)))
    partes.append(caja("Palma_PlacaDorso", (0.072, 0.012, 0.070), (0, 0.018, 0.004), mat_carbono, bisel=0.006, rot=(math.radians(10), 0, 0)))

    # 2. Vórtice de Captura Electromagnético en el centro de la palma interior
    # Base circular del emisor
    partes.append(cilindro("Vortice_Base", 0.024, 0.008, (0, -0.024, -0.002), mat_placas, rot=(math.radians(100), 0, 0), verts=24))
    # Anillo exterior concéntrico en verde esmeralda
    partes.append(aro("Vortice_Aro1", 0.020, 0.003, (0, -0.028, -0.002), mat_menta, rot=(math.radians(10), 0, 0), segs=24))
    # Anillo interior concéntrico en cian neón
    partes.append(aro("Vortice_Aro2", 0.012, 0.0025, (0, -0.029, -0.002), mat_cian, rot=(math.radians(10), 0, 0), segs=20))
    # Núcleo / lente esférica bio-resonante central
    partes.append(esfera("Vortice_Nucleo", 0.008, (0, -0.030, -0.002), mat_menta, scale=(1.0, 0.6, 1.0)))

    # 3. Nudillos reforzados con placas EVA
    for i, x in enumerate([-0.027, -0.009, 0.009, 0.027]):
        partes.append(esfera(f"Nudillo_{i}", 0.012, (x, 0.022, -0.036), mat_placas, scale=(1.0, 1.1, 1.2)))
        partes.append(caja(f"Nudillo_Luz_{i}", (0.006, 0.004, 0.008), (x, 0.026, -0.036), mat_cian, bisel=0.001))

    # 4. Cuatro Dedos Extendidos en Postura Receptiva (Índice, Medio, Anular, Meñique)
    dedo_configs = [
        {"x": -0.026, "largo": 0.040, "curva": 14, "abierto": -6},  # Meñique / Exterior izq
        {"x": -0.009, "largo": 0.046, "curva": 18, "abierto": -2},  # Anular
        {"x":  0.009, "largo": 0.050, "curva": 16, "abierto":  3},  # Medio
        {"x":  0.027, "largo": 0.044, "curva": 14, "abierto":  8},  # Índice
    ]

    for i, cfg in enumerate(dedo_configs):
        x0 = cfg["x"]
        ang_y = math.radians(cfg["abierto"])
        ang_x = math.radians(cfg["curva"])

        # Falange proximal
        partes.append(cilindro(f"FalangeProx_{i}", 0.0095, 0.026, (x0, 0.008, -0.052), mat_traje,
                               rot=(math.radians(75 + cfg["curva"] * 0.5), 0, ang_y), verts=14))
        # Articulación intermedia
        partes.append(esfera(f"ArticInter_{i}", 0.009, (x0 + cfg["abierto"] * 0.0005, -0.002, -0.066), mat_placas))
        # Falange distal (yema del dedo)
        partes.append(cilindro(f"FalangeDist_{i}", 0.008, 0.022, (x0 + cfg["abierto"] * 0.001, -0.012, -0.076), mat_traje,
                               rot=(math.radians(60 + cfg["curva"]), 0, ang_y), verts=14))
        # Placa de yema sensorial en verde esmeralda
        partes.append(esfera(f"YemaLuz_{i}", 0.005, (x0 + cfg["abierto"] * 0.0014, -0.020, -0.084), mat_menta, scale=(1.0, 1.2, 0.8)))

    # 5. Pulgar Abierto hacia el lateral
    # Falange base del pulgar
    partes.append(cilindro("Pulgar_Base", 0.011, 0.030, (0.042, -0.002, -0.018), mat_traje,
                           rot=(math.radians(50), math.radians(35), math.radians(-30)), verts=14))
    # Nudillo pulgar
    partes.append(esfera("Pulgar_Nudillo", 0.011, (0.054, -0.008, -0.032), mat_placas))
    # Falange punta del pulgar
    partes.append(cilindro("Pulgar_Punta", 0.0095, 0.024, (0.060, -0.016, -0.044), mat_traje,
                           rot=(math.radians(35), math.radians(45), math.radians(-25)), verts=14))
    # Yema pulgar
    partes.append(esfera("Pulgar_Yema", 0.006, (0.066, -0.022, -0.054), mat_menta, scale=(1.1, 1.0, 0.9)))

    # 6. Muñeca con Mini-HUD Holográfico
    partes.append(cilindro("Muneca_Brazalete", 0.036, 0.032, (0, -0.005, 0.045), mat_placas, verts=24))
    # Pantalla HUD sobre el dorso de la muñeca
    partes.append(caja("HUD_Marco", (0.038, 0.006, 0.028), (0, 0.033, 0.045), mat_carbono, bisel=0.002))
    partes.append(caja("HUD_Display", (0.032, 0.004, 0.022), (0, 0.035, 0.045), mat_hud, bisel=0.001))
    # Indicador de estado en oro institucional
    partes.append(caja("HUD_StatusLED", (0.022, 0.003, 0.003), (0, 0.036, 0.054), mat_oro, bisel=0))

    # 7. Antebrazo Espacial Reforzado
    partes.append(cilindro("Antebrazo_Principal", 0.044, 0.18, (0, -0.005, 0.15), mat_traje, verts=24))
    partes.append(cilindro("Antebrazo_Manga", 0.052, 0.12, (0, -0.005, 0.28), mat_carbono, verts=24))

    # Tiras luminosas de telemetría Bolívar
    partes.append(caja("Tira_Cian_Dorso", (0.006, 0.006, 0.18), (0, 0.044, 0.15), mat_cian, bisel=0.001))
    partes.append(caja("Tira_Menta_Lateral", (0.005, 0.005, 0.14), (0.036, 0.022, 0.16), mat_menta, bisel=0.001))
    partes.append(aro("Ribete_Manga1", 0.053, 0.0045, (0, -0.005, 0.22), mat_oro))
    partes.append(aro("Ribete_Manga2", 0.053, 0.0045, (0, -0.005, 0.34), mat_cian))

    return partes

def construir_guante_espacial_derecho():
    """
    MANO DERECHA: Guante espacial en empuñadura ergonómica envolviendo el mango del Blaster.
    """
    mat_traje = mat_pbr("EVA_Suit_R", COLOR_GUANTE, metal=0.45, rug=0.4)
    mat_placas = mat_pbr("EVA_Armor_R", COLOR_ARMADURA, metal=0.85, rug=0.25)
    mat_carbono = mat_pbr("Carbon_Plates_R", COLOR_CARBONO, metal=0.7, rug=0.3)
    mat_cian = mat_pbr("Neon_Cyan_R", COLOR_CIAN, metal=0.1, rug=0.2, emision=COLOR_CIAN, em_fuerza=12.0)
    mat_oro = mat_pbr("Neon_Gold_R", COLOR_ORO, metal=0.85, rug=0.28, emision=COLOR_ORO, em_fuerza=6.0)
    mat_hud = mat_pbr("HUD_Screen_R", COLOR_HUD, metal=0.2, rug=0.15, emision=COLOR_HUD, em_fuerza=10.0)

    partes = []

    # 1. Palma en agarre firme
    partes.append(caja("Palma_Base_R", (0.072, 0.050, 0.075), (0, 0, 0), mat_traje, bisel=0.014))
    partes.append(caja("Palma_PlacaDorso_R", (0.068, 0.012, 0.070), (0, 0.026, 0.004), mat_carbono, bisel=0.006))

    # 2. Dedos cerrados en empuñadura sobre el mango
    for i, x in enumerate([-0.024, -0.008, 0.008, 0.024]):
        partes.append(cilindro(f"Dedo_{i}_R", 0.0115, 0.052, (x, -0.034, -0.012), mat_traje,
                               rot=(math.radians(90), 0, 0), verts=14))
        partes.append(cilindro(f"Falange_{i}_R", 0.0105, 0.030, (x, -0.024, 0.026), mat_traje,
                               rot=(math.radians(90), 0, 0), verts=14))
        partes.append(esfera(f"Nudillo_{i}_R", 0.0125, (x, 0.026, -0.030), mat_placas))

    # 3. Pulgar envolviendo el mango con sensor de huella
    partes.append(cilindro("Pulgar_R", 0.0125, 0.052, (0.040, 0.012, -0.016), mat_traje,
                           rot=(math.radians(90), 0, math.radians(35)), verts=14))
    partes.append(esfera("Pulgar_Placa_R", 0.011, (0.042, 0.015, -0.034), mat_placas))

    # 4. Muñeca con HUD táctico
    partes.append(cilindro("Muneca_R", 0.036, 0.032, (0, -0.005, 0.042), mat_placas, verts=24))
    partes.append(caja("HUD_Marco_R", (0.038, 0.006, 0.028), (0, 0.033, 0.045), mat_carbono, bisel=0.002))
    partes.append(caja("HUD_Display_R", (0.032, 0.004, 0.022), (0, 0.035, 0.045), mat_hud, bisel=0.001))

    # 5. Antebrazo
    partes.append(cilindro("Antebrazo_R", 0.044, 0.18, (0, -0.005, 0.15), mat_traje, verts=24))
    partes.append(cilindro("Manga_R", 0.052, 0.12, (0, -0.005, 0.28), mat_carbono, verts=24))
    partes.append(caja("Tira_Cian_R", (0.006, 0.006, 0.18), (0, 0.044, 0.15), mat_cian, bisel=0.001))
    partes.append(aro("Ribete_Manga_R1", 0.053, 0.0045, (0, -0.005, 0.22), mat_oro))
    partes.append(aro("Ribete_Manga_R2", 0.053, 0.0045, (0, -0.005, 0.34), mat_cian))

    return partes

def exportar(lado):
    limpiar()
    if lado == "izquierda":
        partes = construir_guante_espacial_izquierdo()
    else:
        partes = construir_guante_espacial_derecho()

    bpy.ops.object.select_all(action="DESELECT")
    for o in partes:
        o.select_set(True)
    bpy.context.view_layer.objects.active = partes[0]
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
    print(f"Exportado exitosamente: {destino}")

if __name__ == "__main__":
    exportar("izquierda")
    exportar("derecha")
