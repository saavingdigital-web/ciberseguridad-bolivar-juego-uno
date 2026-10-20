"""escudo_amigo.glb - cupula hexagonal (media esfera de celdas hexagonales/pentagonales, dual de una icosfera).
Diametro 2 m, radio 1.0. Origen = centro de la base, en el suelo; cupula hacia +Z Blender (+Y glTF).
Material 'vidrio' casi transparente (relleno) + bordes emisivos dorados. Simetrico: no tiene 'frente'."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib_bl import *
import bmesh

nuevo_modelo()
m = mats()
# vidrio dorado muy tenue
g = m.vidrio.node_tree.nodes["Principled BSDF"]
g.inputs["Base Color"].default_value = (0.95, 0.75, 0.25, 1)
g.inputs["Metallic"].default_value = 0.0
g.inputs["Alpha"].default_value = 0.13
g.inputs["Emission Color"].default_value = hex_a_lineal("#ffcc33") + (1,)
g.inputs["Emission Strength"].default_value = 0.35

R = 1.0
ANCHO = 0.02
SUBD = 3
bm = bmesh.new()
bmesh.ops.create_icosphere(bm, subdivisions=SUBD, radius=1.0)
bm.verts.ensure_lookup_table(); bm.faces.ensure_lookup_table(); bm.edges.ensure_lookup_table()
centros = {f.index: f.calc_center_median().normalized() * R for f in bm.faces}


def clamp(p):
    return Vector((p.x, p.y, max(p.z, 0.0)))


# ---- relleno (una cara por celda) y bordes (una cinta por arista dual)
rell = bmesh.new()
cint = bmesh.new()
usados = set()
for v in bm.verts:
    if v.co.z < -1e-4:
        continue
    n = v.co.normalized()
    caras = list(v.link_faces)
    t0 = (caras[0].calc_center_median() - v.co)
    t0 = (t0 - n * t0.dot(n)).normalized()
    t1 = n.cross(t0)
    caras.sort(key=lambda f: math.atan2((f.calc_center_median() - v.co).dot(t1), (f.calc_center_median() - v.co).dot(t0)))
    pts = [clamp(centros[f.index]) * 0.997 for f in caras]
    rell.faces.new([rell.verts.new(p) for p in reversed(pts)] if n.z >= 0 else [rell.verts.new(p) for p in pts])
    for e in v.link_edges:
        usados.add(e.index)
for ei in usados:
    e = bm.edges[ei]
    fa, fb = e.link_faces
    A, B = clamp(centros[fa.index]), clamp(centros[fb.index])
    d = B - A
    if d.length < 1e-5:
        continue
    dn = d.normalized()
    mid = ((A + B) / 2).normalized()
    w = mid.cross(dn).normalized() * (ANCHO / 2)
    ext = dn * (ANCHO * 0.5)
    A2, B2 = A - ext, B + ext
    r = 1.006
    q = [cint.verts.new(p * r) for p in (A2 - w, A2 + w, B2 + w, B2 - w)]
    cint.faces.new(q)
# aro de base (anillo plano en el suelo)
seg = 48
ro, ri = 1.0, 0.955
vo = [cint.verts.new((math.cos(2 * math.pi * k / seg) * ro, math.sin(2 * math.pi * k / seg) * ro, 0.004)) for k in range(seg)]
vi = [cint.verts.new((math.cos(2 * math.pi * k / seg) * ri, math.sin(2 * math.pi * k / seg) * ri, 0.004)) for k in range(seg)]
for k in range(seg):
    k2 = (k + 1) % seg
    cint.faces.new((vo[k], vo[k2], vi[k2], vi[k]))
bm.free()

me1 = bpy.data.meshes.new("relleno"); rell.to_mesh(me1); rell.free()
me2 = bpy.data.meshes.new("bordes"); cint.to_mesh(me2); cint.free()
o1 = bpy.data.objects.new("relleno", me1); o2 = bpy.data.objects.new("bordes", me2)
for o in (o1, o2):
    bpy.context.collection.objects.link(o)
me1.materials.append(m.vidrio)
me2.materials.append(m.dorado)
for o, c in ((o1, "#ffd96a"), (o2, "#ffcc33")):
    sombrear(o, False)
    pintar(o, c)
escudo = unir([o1, o2], "escudo_amigo")
exportar(escudo, "escudo_amigo", notas="cupula r=1.0 m, base en Z=0, abierta por abajo; simetrica (sin frente); material vidrio + emisivo_dorado",
         nodos=["escudo_amigo"])
vista_previa("escudo_amigo", [escudo], vistas=((0, 15), (40, 35), (0, 89)), margen=1.1)
