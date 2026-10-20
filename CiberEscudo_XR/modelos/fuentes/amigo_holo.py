"""amigo_holo.glb - estudiante holografico de pie (1.65 m, sudadera con capucha y mochila). Un solo mesh.
Frente (visor) a -Y de Blender (+Z glTF). Origen = centro de la base, en el suelo (Z=0).
Materiales: emisivo (cian = sudadera), emisivo_azul (pantalon), emisivo_palido (piel/detalles), vidrio_holo (relleno
translucido de las bandas), pintado (capucha, mochila, zapatos). El juego puede reteñir los 'emisivo*'."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib_bl import *
from lib_bl import _mat

nuevo_modelo()
m = mats()


def emi(nombre, hx, fuerza=1.0):
    e = _mat(nombre)
    n = e.node_tree.nodes; l = e.node_tree.links
    b = n.new("ShaderNodeBsdfPrincipled")
    c = hex_a_lineal(hx)
    b.inputs["Base Color"].default_value = (c[0] * 0.15, c[1] * 0.15, c[2] * 0.15, 1)
    b.inputs["Emission Color"].default_value = (c[0], c[1], c[2], 1)
    b.inputs["Emission Strength"].default_value = fuerza
    o = n.new("ShaderNodeOutputMaterial")
    l.new(b.outputs["BSDF"], o.inputs["Surface"])
    e.diffuse_color = (c[0], c[1], c[2], 1)
    return e


e_azul = emi("emisivo_azul", "#1fa6ff")
e_palido = emi("emisivo_palido", "#b6fdff")
vh = _mat("vidrio_holo")
n = vh.node_tree.nodes; l = vh.node_tree.links
b = n.new("ShaderNodeBsdfPrincipled")
b.inputs["Base Color"].default_value = (0.0, 0.12, 0.16, 1)
b.inputs["Roughness"].default_value = 0.4
b.inputs["Emission Color"].default_value = (0.0, 0.55, 0.7, 1)
b.inputs["Emission Strength"].default_value = 0.6
b.inputs["Alpha"].default_value = 0.55
o = n.new("ShaderNodeOutputMaterial")
l.new(b.outputs["BSDF"], o.inputs["Surface"])
vh.diffuse_color = (0.0, 0.4, 0.5, 0.5)

PASO = 0.07


def banda(z, k):
    return 0 if int(round(z / PASO)) % 3 == 0 else 1


def holo(nombre, pts, rad, emis, lados=8, **kw):
    return tubo(nombre, pts, rad, lados=lados, paso=PASO, mat_fn=banda, materiales=(emis, vh), **kw)


P = []
Z0 = 0.03   # el cuerpo empieza sobre la base
# --- piernas (pantalon)
for s in (-1, 1):
    P.append(holo(f"pierna{s}", [(0.09 * s, 0, 0.86), (0.092 * s, -0.005, 0.46), (0.09 * s, 0, 0.10)],
                  [0.093, 0.075, 0.065], e_azul, lados=7))
    P.append(tubo(f"puno_p{s}", [(0.09 * s, 0, 0.10), (0.09 * s, 0, 0.065)], [0.072, 0.074], lados=8, materiales=(e_palido,), suave=False))
    # zapatos
    P.append(caja(f"zapato{s}", (0.105, 0.24, 0.055), (0.09 * s, -0.04, 0.0575), m.pintado, "#0a2f3a", "#154c5c", bisel=0.012, segs=1))
    P.append(caja(f"suela{s}", (0.11, 0.245, 0.012), (0.09 * s, -0.04, 0.036), m.cian, "#00f7ff", bisel=0, suave=False))
# --- torso: sudadera
P.append(holo("torso", [(0, 0, 0.80), (0, 0, 1.05), (0, 0, 1.30), (0, 0, 1.42)],
              [(0.20, 0.125), (0.205, 0.13), (0.215, 0.115), (0.09, 0.09)], m.cian, lados=10))
P.append(tubo("dobladillo", [(0, 0, 0.775), (0, 0, 0.83)], [(0.207, 0.137), (0.205, 0.133)], lados=10, materiales=(m.cian,), suave=False))
P.append(tubo("cuello", [(0, 0, 1.40), (0, 0, 1.46)], [0.088, 0.075], lados=8, materiales=(e_palido,), suave=False))
# bolsillo canguro y logo
P.append(caja("bolsillo", (0.22, 0.02, 0.11), (0, -0.131, 0.97), m.pintado, "#073945", "#0d5566", bisel=0, suave=False))
P.append(caja("bolsillo_l1", (0.222, 0.024, 0.008), (0, -0.131, 1.026), m.cian, "#00f7ff", bisel=0, suave=False))
P.append(caja("logo", (0.11, 0.014, 0.022), (0, -0.126, 1.2), e_palido, "#b6fdff", bisel=0, suave=False))
# --- brazos (algo caidos, ligeramente hacia afuera)
for s in (-1, 1):
    P.append(holo(f"brazo{s}", [(0.235 * s, 0, 1.31), (0.275 * s, 0.0, 1.04), (0.295 * s, -0.035, 0.82)],
                  [0.062, 0.053, 0.046], m.cian, lados=7))
    P.append(tubo(f"puno_b{s}", [(0.295 * s, -0.035, 0.83), (0.298 * s, -0.04, 0.79)], [0.054, 0.056], lados=7, materiales=(e_palido,), suave=False))
    P.append(esfera(f"mano{s}", 0.043, (0.299 * s, -0.045, 0.745), e_palido, "#b6fdff", escala=(0.8, 0.9, 1.1), segmentos=6, anillos=4, suave=False))
# --- capucha y visor
P.append(esfera("capucha", 0.128, (0, 0.02, 1.51), m.pintado, "#0a5368", "#1b93ad", escala=(1.0, 1.12, 1.1), segmentos=10, anillos=6, suave=False))
P.append(tubo("capucha_cola", [(0, 0.06, 1.44), (0, 0.11, 1.36)], [(0.11, 0.08), (0.12, 0.06)], lados=8, materiales=(m.pintado,), tapas=(False, False), suave=False, color="#06323d"))
P.append(caja("visor", (0.15, 0.05, 0.062), (0, -0.128, 1.50), m.cian, "#00f7ff", bisel=0.014, segs=1))
P.append(caja("visor_marco", (0.17, 0.03, 0.082), (0, -0.115, 1.50), m.pintado, "#052a34", bisel=0.01, segs=1))
for s in (-1, 1):
    P.append(caja(f"cordon{s}", (0.008, 0.012, 0.13), (0.045 * s, -0.128, 1.37), e_palido, "#b6fdff", bisel=0, suave=False))
# --- mochila
P.append(caja("mochila", (0.29, 0.13, 0.36), (0, 0.18, 1.12), m.pintado, "#0a4452", "#157184", bisel=0.02, segs=1))
P.append(caja("mochila_bolsillo", (0.2, 0.05, 0.16), (0, 0.265, 0.99), m.pintado, "#073945", "#0e5a6d", bisel=0.01, segs=1))
for s in (-1, 1):
    P.append(caja(f"correa_f{s}", (0.04, 0.02, 0.3), (0.105 * s, -0.128, 1.20), m.pintado, "#073945", bisel=0, suave=False))
    P.append(caja(f"correa_h{s}", (0.04, 0.3, 0.022), (0.105 * s, 0.02, 1.39), m.pintado, "#073945", bisel=0, rot=(math.radians(-6), 0, 0), suave=False))
    P.append(caja(f"mochila_luz{s}", (0.012, 0.133, 0.3), (0.145 * s, 0.18, 1.12), m.cian, "#00f7ff", bisel=0, suave=False))
# --- base holografica
P.append(cilindro("plato", 0.5, 0.02, (0, 0, 0.01), m.pintado, "#06303b", "#0b4a59", bisel=0, vertices=24, suave=False))
import bmesh
bm = bmesh.new()
seg = 32
ro, ri, za = 0.47, 0.415, 0.0215
ao_, ai_ = [], []
for k in range(seg):
    a = 2 * math.pi * k / seg
    ao_.append(bm.verts.new((math.cos(a) * ro, math.sin(a) * ro, za)))
    ai_.append(bm.verts.new((math.cos(a) * ri, math.sin(a) * ri, za)))
for k in range(seg):
    k2 = (k + 1) % seg
    bm.faces.new((ao_[k], ao_[k2], ai_[k2], ai_[k]))
me_ = bpy.data.meshes.new("anillo_base")
bm.to_mesh(me_); bm.free()
ob = bpy.data.objects.new("anillo_base", me_)
bpy.context.collection.objects.link(ob)
me_.materials.append(m.cian)
pintar(ob, "#00f7ff")
P.append(ob)
for i in range(4):
    a = i * math.pi / 2 + math.pi / 4
    P.append(caja(f"marca_base{i}", (0.08, 0.016, 0.01), (math.cos(a) * 0.38, math.sin(a) * 0.38, 0.024), m.dorado, "#ffcc33", bisel=0, rot=(0, 0, a), suave=False))

amigo = unir(P, "amigo_holo")
# escala exacta: altura total 1.65 m (cima de la capucha)
zmax = max((amigo.matrix_world @ Vector(c)).z for c in amigo.bound_box)
print("ALTURA ANTES", zmax)
ensuciar(amigo, 0.06, semilla=9)
hornear_ao(amigo, rayos=10, fuerza=0.5, distancia=0.12)
exportar(amigo, "amigo_holo", notas="un solo mesh; frente (visor) -Y Blender (+Z glTF); origen centro de la base en el suelo; altura 1.65 m",
         nodos=["amigo_holo"])
vista_previa("amigo_holo", [amigo], vistas=((0, 0), (40, 12), (90, 0)), resolucion=(480, 640), margen=1.1)
