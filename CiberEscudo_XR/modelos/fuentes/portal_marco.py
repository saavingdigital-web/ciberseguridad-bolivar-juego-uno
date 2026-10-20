"""portal_marco.glb - marco de portal circular (hueco central VACIO). Diametro exterior 1.1 m.
Se construye en el plano XY (frente +Z) y se gira 90 grados en X: el FRENTE queda a -Y de Blender (+Z glTF).
Nodos: aro_exterior (aro oscuro, remaches, modulos), marcas (16 marcas doradas), aro_interior (filete cian interior)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib_bl import *

nuevo_modelo()
m = mats()
R = 0.46
MEN = 0.045
prof = 1.15

A = []
aro = toro("aro_base", R, MEN, (0, 0, 0), m.pintado, "#2c3552", "#2c3552", seg=32, seg_menor=6)
aro.scale = (1, 1, prof)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
sombrear(aro, True, 65)
A.append(aro)
zf = MEN * prof                      # cara frontal del aro
# modulos de energia (8) en la cara frontal
for i in range(8):
    a = i * math.pi / 4
    c, s = math.cos(a), math.sin(a)
    A.append(caja(f"mod{i}", (0.062, 0.11, 0.034), (c * R, s * R, zf + 0.004), m.pintado, "#161c33", "#2a3458", bisel=0, rot=(0, 0, a), suave=False))
    mat = m.cian if i % 2 == 0 else m.naranja
    col = "#00f7ff" if i % 2 == 0 else "#ff9d00"
    A.append(caja(f"mod_luz{i}", (0.034, 0.07, 0.012), (c * R, s * R, zf + 0.025), mat, col, bisel=0, rot=(0, 0, a), suave=False))
# remaches (16): dos por hueco entre modulos
for i in range(8):
    for off in (math.radians(14), math.radians(31)):
        a = i * math.pi / 4 + off
        A.append(cono(f"rem{i}_{off:.1f}", 0.015, 0.0, 0.016, (math.cos(a) * R, math.sin(a) * R, zf + 0.004), m.pintado, "#8c98c0", vertices=6, suave=False))
aro_ext = unir(A, "aro_exterior")

# filete interior luminoso (aro_interior)
ai = toro("aro_interior", 0.418, 0.011, (0, 0, 0), m.cian, "#00f7ff", seg=32, seg_menor=4, suave=False)
# 16 marcas doradas en la banda exterior
M = []
for i in range(16):
    a = i * math.pi / 8
    M.append(caja(f"marca{i}", (0.048, 0.03, 0.034), (math.cos(a) * 0.53, math.sin(a) * 0.53, 0.0), m.dorado, "#ffcc33", bisel=0, rot=(0, 0, a), suave=False))
marcas = unir(M, "marcas")

orientar_x([aro_ext, marcas, ai])
for o in (aro_ext,):
    ensuciar(o, 0.1, semilla=5)
    hornear_ao(o, rayos=16, fuerza=0.55, distancia=0.07)
    luz_vertical(o, 0.8, 1.2)

exportar([aro_ext, marcas, ai], "portal_marco", notas="frente -Y Blender (+Z glTF); hueco libre de diametro 0.84 m; ejes de giro = Z local (hacia el frente) en el juego",
         nodos=["aro_exterior", "marcas", "aro_interior"])
vista_previa("portal_marco", [aro_ext, marcas, ai], vistas=((0, 0), (40, 18), (90, 0)))
