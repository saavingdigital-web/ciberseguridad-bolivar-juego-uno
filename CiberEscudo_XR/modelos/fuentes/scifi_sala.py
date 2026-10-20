"""Sala de mando circular (12 lados de 4 m, apotema 7.46 m) con piezas de Modular SciFi MegaKit (Quaternius, CC0)
-> modelos/scifi/sala_mando.glb  (estatica, unida por material, sin techo).
Coordenadas Blender (Z arriba). Jugador en (0,0); Y=0 glTF = cara superior de la plataforma (z=0 Blender);
el suelo de la sala queda a z = -0.17 (base de la plataforma)."""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scifi_comun import *
import bmesh

RES = int(os.environ.get("SALA_RES", 512))
NORMAL = os.environ.get("SALA_NORMAL", "1") == "1"
CALIDAD = int(os.environ.get("SALA_Q", 72))
Z0 = -0.17                      # nivel del suelo
LADO = 4.0
N = 12
APOTEMA = LADO / (2 * math.tan(math.pi / N))     # 7.464
RVERT = LADO / (2 * math.sin(math.pi / N))       # 7.727

limpiar()
# ---------------------------------------------------------------- materiales (9)
T1 = mat_trim("Trim_01", "T_Trim_01_BaseColor", "T_Trim_01_ORM", "T_Trim_01_Normal", RES, NORMAL)
T2 = mat_trim("Trim_02_Azul", "T_Trim_02_BaseColor_Blue", "T_Trim_02_ORM", "T_Trim_02_Normal", RES, NORMAL)
T3 = mat_trim("Trim_03", "T_Trim_03_BaseColor", "T_Trim_03_ORM", "T_Trim_03_Normal", RES, NORMAL)
T3C = mat_trim("Trim_03_Oscuro", "T_Trim_03_Cables", "T_Trim_03_ORM", "T_Trim_03_Normal", RES, NORMAL)
DEC = mat_decal("Decal_Cian", RES)
NEG = mat_color("Negro", (0.006, 0.006, 0.008), 0.5)
LNAR = mat_emisivo("Luz_Naranja", (1.0, 0.33, 0.03), 1.0)
LCIA = mat_emisivo("Luz_Cian", CIAN, 1.0)
SUELO = mat_color("Suelo_Oscuro", (0.012, 0.018, 0.03), 0.55, 0.5)
TABLA = {"MI_Trim_01": T1, "MI_Trim_02": T2, "MI_Trim_03": T3, "MI_Trim_03_Dark": T3C, "MI_Trim_03_Cables": T3C,
         "MI_Decal_Red": DEC, "M_Decal_White": DEC, "M_Decal_Screen": DEC, "M_Black": NEG,
         "M_Light": LNAR, "M_LightFade_Red": LCIA}
TABLA_CIAN = dict(TABLA, M_Light=LCIA)

# ---------------------------------------------------------------- piezas fuente
fuentes = {}


def fuente(carpeta, nombre, tabla=TABLA):
    objs = importar(carpeta, nombre)
    malla = [o for o in objs if o.type == "MESH"][0]
    reasignar([malla], tabla, borrar=("M_Glass",))
    hornear_transformacion(malla)
    fuentes[nombre] = malla.data
    for o in objs:
        bpy.data.objects.remove(o)


for c, n in (("Walls", "WallAstra_Straight"), ("Walls", "WallAstra_Straight_Window"), ("Walls", "TopAstra_Straight"),
             ("Walls", "BottomMetal_Straight"), ("Columns", "Column_Round"), ("Columns", "Column_Astra"),
             ("Props", "Prop_Computer"), ("Props", "Prop_AccessPoint"), ("Props", "Prop_Light_Wide"),
             ("Props", "Prop_Vent_Big"), ("Props", "Prop_Crate3"),
             ("Decals", "Decal_Logo"), ("Decals", "Decal_Sign"), ("Decals", "Decal_XSign")):
    fuente(c, n)
fuente("Props", "Prop_Light_Floor", TABLA_CIAN)

colocados = []


def poner(nombre, M):
    o = bpy.data.objects.new(nombre + "_i", fuentes[nombre])
    bpy.context.scene.collection.objects.link(o)
    o.matrix_world = M
    colocados.append(o)
    return o


def Rz(a):
    return Matrix.Rotation(a, 4, "Z")


def Ry(a):
    return Matrix.Rotation(a, 4, "Y")


def T(x=0, y=0, z=0):
    return Matrix.Translation((x, y, z))


def marco_pared(i):
    """Marco local de la pared i: x local = hacia el centro; el plano de la pared esta en x=-2; y = a lo largo."""
    th = math.radians(i * 30.0)
    return T((APOTEMA - 2) * math.cos(th), (APOTEMA - 2) * math.sin(th), Z0) @ Rz(th + math.pi)


# frente del jugador en glTF = -Z = +Y de Blender (theta 90 = pared 3): pared Astra delante
for i in range(N):
    W = marco_pared(i)
    astra = (i % 2 == 1)
    poner("WallAstra_Straight" if astra else "WallAstra_Straight_Window", W)
    poner("TopAstra_Straight", W)
    poner("BottomMetal_Straight", W)

# columnas en los vertices (alternando redonda y Astra)
for i in range(N):
    th = math.radians(i * 30.0 + 15.0)
    pos = T(RVERT * math.cos(th), RVERT * math.sin(th), Z0)
    if i % 2 == 0:
        poner("Column_Round", pos)
    else:
        poner("Column_Astra", pos @ Rz(th + math.pi / 2))


def en_pared(i, nombre, x=0.0, y=0.0, z=0.0, rot=None):
    M = marco_pared(i) @ T(x, y, z)
    if rot is not None:
        M = M @ rot
    return poner(nombre, M)


en_pared(1, "Prop_Computer", x=-1.56 + 0.3, y=0.0, rot=Rz(math.pi / 2))
en_pared(5, "Prop_Computer", x=-1.56 + 0.3, y=0.0, rot=Rz(math.pi / 2))
en_pared(7, "Prop_AccessPoint", x=-1.56 + 0.22, y=0.0, rot=Rz(math.pi / 2))
en_pared(11, "Prop_AccessPoint", x=-1.56 + 0.22, y=0.0, rot=Rz(math.pi / 2))
for i in range(0, N, 2):
    en_pared(i, "Prop_Light_Floor", x=-1.3, z=0.0, rot=Rz(math.pi / 2))
    for yy in (-1.2, 1.2):
        en_pared(i, "Prop_Light_Wide", x=-1.9, y=yy, z=3.05, rot=Rz(math.pi))
for i in (1, 5, 11):
    en_pared(i, "Prop_Vent_Big", x=-1.91, z=4.0, y=1.0, rot=Ry(-math.pi / 2) @ Rz(math.pi / 2))
DEC_R = Matrix(((0, 0, 1, 0), (1, 0, 0, 0), (0, 1, 0, 0), (0, 0, 0, 1)))   # x->+Y, y->+Z, z->+X
en_pared(3, "Decal_Logo", x=-1.91 + 0.015, z=4.0, rot=DEC_R)
en_pared(9, "Decal_Logo", x=-1.91 + 0.015, z=4.0, rot=DEC_R)
en_pared(1, "Decal_Sign", x=-1.91 + 0.015, z=4.0, y=-0.8, rot=DEC_R)
en_pared(5, "Decal_XSign", x=-1.91 + 0.015, z=4.0, y=-0.8, rot=DEC_R)
en_pared(7, "Decal_Sign", x=-1.91 + 0.015, z=4.0, y=0.8, rot=DEC_R)
for a, rr, zz in ((247, 6.5, 0.5), (258, 6.5, 0.5), (252, 6.5, 1.5)):
    th = math.radians(a)
    poner("Prop_Crate3", T(rr * math.cos(th), rr * math.sin(th), Z0 + zz) @ Rz(th + 0.2))

# suelo oscuro (disco de 48 lados que llega bajo las paredes)
me = bpy.data.meshes.new("Suelo")
bm = bmesh.new()
bmesh.ops.create_circle(bm, cap_ends=True, cap_tris=False, segments=48, radius=7.9)
bm.to_mesh(me)
bm.free()
suelo = bpy.data.objects.new("Suelo", me)
bpy.context.scene.collection.objects.link(suelo)
me.materials.append(SUELO)
suelo.location.z = Z0
for p in me.polygons:
    if p.normal.z < 0:
        p.flip()
me.update()
colocados.append(suelo)
bpy.context.view_layer.update()

# ---------------------------------------------------------------- unir por material
bpy.ops.object.select_all(action="DESELECT")
for o in colocados:
    o.select_set(True)
bpy.context.view_layer.objects.active = colocados[0]
bpy.ops.object.join()
sala = bpy.context.view_layer.objects.active
sala.name = "Sala_Mando"
sala.data.name = "Sala_Mando"
bpy.ops.object.material_slot_remove_unused()
print("RANURAS", [s.material.name for s in sala.material_slots], len(sala.data.polygons))
ruta = os.path.join(SALIDA, "sala_mando.glb")
exportar_glb(ruta, [sala], calidad=CALIDAD)


def fix(j):
    for m in j["materials"]:
        if m["name"] == "Decal_Cian":
            m["alphaMode"] = "MASK"
            m["alphaCutoff"] = 0.5
            m["doubleSided"] = True


parchear_glb(ruta, fix)
guardar_stats("sala_mando", ruta)
