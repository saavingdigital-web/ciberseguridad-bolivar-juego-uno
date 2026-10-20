"""accion_tarjeta.glb - tarjeta de accion 0.62 x 0.26 m, SIN texto. Frente a -Y de Blender (+Z glTF). Origen = centro.
Losa 0.62 x 0.024 x 0.26, marco (labios) en relieve, hueco interior 0.56 x 0.20 donde va el plano con la textura.
Plano de textura recomendado: 0.56 x 0.20, a y = -0.0135 Blender (z = +0.0135 glTF), sobre la losa y dentro del marco."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib_bl import *

nuevo_modelo()
m = mats()
W, H, T = 0.62, 0.26, 0.024
P = []
P.append(caja("losa", (W, T, H), (0, 0, 0), m.pintado, "#0a1020", "#1d2a4a", bisel=0.007, segs=1))
yl = -T / 2 - 0.0045                   # centro de los labios del marco
lip = 0.03
P.append(caja("lab_sup", (W, 0.009, lip), (0, yl, H / 2 - lip / 2), m.pintado, "#2a3659", "#3d4d7a", bisel=0, suave=False))
P.append(caja("lab_inf", (W, 0.009, lip), (0, yl, -H / 2 + lip / 2), m.pintado, "#18203a", "#2a3659", bisel=0, suave=False))
for s in (-1, 1):
    P.append(caja(f"lab{s}", (lip, 0.009, H - 2 * lip), (s * (W / 2 - lip / 2), yl, 0), m.pintado, "#223052", "#2f3f6c", bisel=0, suave=False))
yb = -T / 2 - 0.0105                   # borde luminoso cian
P.append(caja("bor_sup", (W - 0.07, 0.003, 0.006), (0, yb, H / 2 - 0.0045), m.cian, "#00f7ff", bisel=0, suave=False))
P.append(caja("bor_inf", (W - 0.07, 0.003, 0.006), (0, yb, -H / 2 + 0.0045), m.cian, "#00f7ff", bisel=0, suave=False))
for s in (-1, 1):
    P.append(caja(f"bor{s}", (0.006, 0.003, H - 0.07), (s * (W / 2 - 0.0045), yb, 0), m.cian, "#00f7ff", bisel=0, suave=False))
# filete interior (marca el hueco de la textura)
iw, ih = 0.56, 0.20
P.append(caja("fil_sup", (iw, 0.003, 0.004), (0, yb, ih / 2 + 0.002), m.cian, "#00f7ff", bisel=0, suave=False))
P.append(caja("fil_inf", (iw, 0.003, 0.004), (0, yb, -ih / 2 - 0.002), m.cian, "#00f7ff", bisel=0, suave=False))
# esquinas doradas en L
for sx in (-1, 1):
    for sz in (-1, 1):
        cx, cz = sx * (W / 2 - 0.0275), sz * (H / 2 - 0.0275)
        P.append(caja(f"esq_h{sx}{sz}", (0.055, 0.008, 0.012), (cx, -T / 2 - 0.0145, sz * (H / 2 - 0.006)), m.dorado, "#ffcc33", bisel=0, suave=False))
        P.append(caja(f"esq_v{sx}{sz}", (0.012, 0.008, 0.055), (sx * (W / 2 - 0.006), -T / 2 - 0.0145, cz), m.dorado, "#ffcc33", bisel=0, suave=False))
tar = unir(P, "accion_tarjeta")
ensuciar(tar, 0.06, semilla=1)
hornear_ao(tar, rayos=10, fuerza=0.5, distancia=0.04)
exportar(tar, "accion_tarjeta", notas="frente -Y Blender (+Z glTF); plano de textura 0.56x0.20 en z glTF +0.0135; sin texto",
         nodos=["accion_tarjeta"])
vista_previa("accion_tarjeta", [tar], vistas=((0, 0), (35, 22), (90, 0)), resolucion=(640, 360), margen=1.05)
