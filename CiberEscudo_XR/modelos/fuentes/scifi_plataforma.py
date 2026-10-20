"""Platform_Round1 (Quaternius, CC0) -> modelos/scifi/plataforma_mando.glb
Origen en el centro; cara superior central a Y=0 (el jugador de pie encima). Anillo cian emisivo en el borde."""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scifi_comun import *

RES = int(os.environ.get("PLAT_RES", 512))
NORMAL = os.environ.get("PLAT_NORMAL", "0") == "1"
CALIDAD = int(os.environ.get("PLAT_Q", 75))

limpiar()
o = importar("Platforms", "Platform_Round1")[0]
tabla = {
    "MI_Trim_01": mat_trim("Trim_01", "T_Trim_01_BaseColor", "T_Trim_01_ORM", "T_Trim_01_Normal", RES, NORMAL),
    "MI_Trim_02": mat_trim("Trim_02_Azul", "T_Trim_02_BaseColor_Blue", "T_Trim_02_ORM", "T_Trim_02_Normal", RES, NORMAL),
}
reasignar([o], tabla)
hornear_transformacion(o)
o.name = "Plataforma_Mando"
o.data.name = "Plataforma_Mando"
# la cara superior central estaba a z=0.14: se baja para que quede en 0
o.data.transform(Matrix.Translation((0, 0, -0.14)))

# anillo cian emisivo fino sobre el reborde exterior (R 2.86..2.98) a z = 0.03 - 0.14 + 0.004
import bmesh
me = bpy.data.meshes.new("Anillo_Mando")
bm = bmesh.new()
N = 64
r0, r1, z = 2.87, 2.985, 0.03 - 0.14 + 0.004
a_ = [bm.verts.new((r0 * math.cos(2 * math.pi * i / N), r0 * math.sin(2 * math.pi * i / N), z)) for i in range(N)]
b_ = [bm.verts.new((r1 * math.cos(2 * math.pi * i / N), r1 * math.sin(2 * math.pi * i / N), z)) for i in range(N)]
for i in range(N):
    j = (i + 1) % N
    bm.faces.new((a_[i], b_[i], b_[j], a_[j]))
bmesh.ops.triangulate(bm, faces=bm.faces[:])
bm.to_mesh(me); bm.free()
anillo = bpy.data.objects.new("Anillo_Mando", me)
bpy.context.scene.collection.objects.link(anillo)
anillo.data.materials.append(mat_emisivo("Anillo_Cian", CIAN, 1.0))
# normales hacia +Z
for p in me.polygons:
    if p.normal.z < 0:
        p.flip()
me.update()

bpy.ops.object.select_all(action="DESELECT")
o.select_set(True); anillo.select_set(True)
bpy.context.view_layer.objects.active = o
bpy.ops.object.join()
o.name = "Plataforma_Mando"
ruta = os.path.join(SALIDA, "plataforma_mando.glb")
exportar_glb(ruta, [o], calidad=CALIDAD)
guardar_stats("plataforma_mando", ruta)
