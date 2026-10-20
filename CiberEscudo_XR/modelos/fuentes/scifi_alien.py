"""Alien_Cyclop (Quaternius, CC0) -> modelos/scifi/alien_cyclop.glb  (con esqueleto y animación)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scifi_comun import *

limpiar()
objs = importar("Aliens", "Alien_Cyclop")
for o in objs:
    print("OBJ", o.name, o.type, [round(x, 2) for x in o.location], [round(x, 2) for x in o.scale], o.parent.name if o.parent else None)
mn, mx = limites(objs)
print("BB", [round(x, 3) for x in mn], [round(x, 3) for x in mx])
for a in bpy.data.actions:
    print("ACCION", a.name, a.frame_range[:], bpy.context.scene.render.fps)
for o in objs:
    if o.type == "MESH":
        print("MALLA", o.name, len(o.data.polygons), [s.material.name for s in o.material_slots],
              [round(x, 2) for x in o.bound_box[0]], [round(x, 2) for x in o.bound_box[6]])

# materiales (colores planos): conservar; comprobar emisión
for m in bpy.data.materials:
    b = m.node_tree.nodes.get("Principled BSDF")
    if b:
        print("MAT", m.name, "emision", [round(x, 3) for x in b.inputs["Emission Color"].default_value[:3]],
              b.inputs["Emission Strength"].default_value)

# "Icosphere" es la forma personalizada de un hueso (esfera sin material): se descarta.
ico = [o for o in objs if o.name.startswith("Icosphere")]
objs = [o for o in objs if o not in ico]
for o in ico:
    bpy.data.objects.remove(o)
# origen en la base del cuerpo en reposo (la malla viene centrada en el origen)
arm = [o for o in objs if o.type == "ARMATURE"][0]
malla = [o for o in objs if o.type == "MESH"][0]
mn, mx = limites([malla])
arm.location.z -= mn.z
bpy.context.view_layer.update()
print("BB corregido", [round(x, 3) for x in limites([malla])[0]], [round(x, 3) for x in limites([malla])[1]])
objetos = [o for o in objs if o.type in ("ARMATURE", "MESH")]
ruta = os.path.join(SALIDA, "alien_cyclop.glb")
exportar_glb(ruta, objetos, animaciones=True)
guardar_stats("alien_cyclop", ruta)
