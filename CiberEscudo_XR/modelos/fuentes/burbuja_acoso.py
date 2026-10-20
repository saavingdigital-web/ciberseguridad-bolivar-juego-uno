"""burbuja_acoso.glb - burbuja de amenaza (acoso). Diametro ~0.25 m con puas. Frente (el rayo grande) a -Y de Blender.
Origen = centro de la esfera. Concha translucida roja (vidrio_rojo) + puas + rayo y nucleo emisivos rojos."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib_bl import *
from lib_bl import _mat, _fin
import bmesh

nuevo_modelo()
m = mats()
vr = _mat("vidrio_rojo")
n = vr.node_tree.nodes; l = vr.node_tree.links
b = n.new("ShaderNodeBsdfPrincipled")
b.inputs["Base Color"].default_value = (0.14, 0.005, 0.01, 1)
b.inputs["Roughness"].default_value = 0.3
b.inputs["Emission Color"].default_value = hex_a_lineal("#ff3b30") + (1,)
b.inputs["Emission Strength"].default_value = 0.12
b.inputs["Alpha"].default_value = 0.32
o = n.new("ShaderNodeOutputMaterial")
l.new(b.outputs["BSDF"], o.inputs["Surface"])
vr.diffuse_color = (0.8, 0.1, 0.1, 0.5)

RS = 0.092
P = []
# concha facetada (translucida)
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=RS)
concha = bpy.context.active_object
_fin(concha, "concha", vr, "#7a1018", "#ff5a50", 0, suave=False)
P.append(concha)
# puas en los 12 vertices del icosaedro
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=1.0)
ico = bpy.context.active_object
dirs = [v.co.normalized() for v in ico.data.vertices]
bpy.data.objects.remove(ico)
for i, d in enumerate(dirs):
    rot = Vector((0, 0, 1)).rotation_difference(d).to_euler()
    P.append(cono(f"pua{i}", 0.02, 0.0, 0.058, d * (RS + 0.005), m.pintado, "#2a0810", "#2a0810", vertices=5, rot=rot, suave=False))
    P.append(cono(f"pua_p{i}", 0.0095, 0.0, 0.02, d * (RS + 0.044), m.rojo, "#ff3b30", vertices=5, rot=rot, suave=False))
# nucleo brillante
P.append(esfera("nucleo", 0.022, (0, 0, 0), m.rojo, "#ff3b30", segmentos=6, anillos=4, suave=False))


def rayo(nombre, escala, giro, grosor=0.022):
    pts = [(0.012, 0.072), (-0.034, -0.004), (-0.006, -0.004), (-0.016, -0.074), (0.036, 0.01), (0.006, 0.01)]
    bm = bmesh.new()
    fr = [bm.verts.new((x * escala, -grosor / 2, z * escala)) for x, z in pts]
    bk = [bm.verts.new((x * escala, grosor / 2, z * escala)) for x, z in pts]
    bm.faces.new(fr)
    bm.faces.new(list(reversed(bk)))
    k = len(pts)
    for i in range(k):
        bm.faces.new((fr[i], bk[i], bk[(i + 1) % k], fr[(i + 1) % k]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(nombre)
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(nombre, me)
    bpy.context.collection.objects.link(ob)
    me.materials.append(m.rojo)
    ob.rotation_euler = (0, 0, math.radians(giro))
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    sombrear(ob, False)
    pintar(ob, "#ff3b30")
    return ob


P.append(rayo("rayo_a", 1.2, 0))
P.append(rayo("rayo_b", 0.9, 90))
burb = unir(P, "burbuja_acoso")
hornear_ao(burb, rayos=10, fuerza=0.4, distancia=0.05)
exportar(burb, "burbuja_acoso", notas="frente -Y Blender (+Z glTF); origen en el centro; concha translucida 'vidrio_rojo'",
         nodos=["burbuja_acoso"])
vista_previa("burbuja_acoso", [burb], vistas=((0, 0), (40, 25), (90, 0)), margen=1.1)
