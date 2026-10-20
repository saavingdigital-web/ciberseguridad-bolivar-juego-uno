"""blaster_cian.glb / blaster_naranja.glb - pistola futurista. Origen = centro del AGARRE (mango) donde cierra el puño.
Canon hacia -Y de Blender (= +Z glTF). Arriba = +Z Blender (= +Y glTF). Boca del canon a 0.20 m del origen."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib_bl import *

R90 = math.radians(90)


def construir(variante, acento_hex):
    nuevo_modelo()
    m = mats()
    acm = m.cian if variante == "cian" else m.naranja
    ACERO0, ACERO1, PLACA = "#232a3b", "#46526f", "#6a769a"
    P = []
    # mango (el origen queda en su centro) inclinado hacia atras
    P.append(caja("mango", (0.036, 0.042, 0.115), (0, 0.012, -0.002), m.pintado, "#1b2133", "#34405c", bisel=0.007, segs=1, rot=(math.radians(-8), 0, 0)))
    P.append(caja("mango_bandas", (0.039, 0.044, 0.012), (0, 0.011, -0.03), m.pintado, "#0c101c", bisel=0, rot=(math.radians(-8), 0, 0), suave=False))
    P.append(caja("mango_banda2", (0.039, 0.044, 0.012), (0, 0.0135, -0.006), m.pintado, "#0c101c", bisel=0, rot=(math.radians(-8), 0, 0), suave=False))
    P.append(caja("culata", (0.042, 0.03, 0.02), (0, 0.032, -0.062), m.pintado, ACERO0, ACERO1, bisel=0.006, segs=1))
    P.append(caja("culata_luz", (0.012, 0.012, 0.004), (0, 0.032, -0.0745), acm, acento_hex, bisel=0, suave=False))
    # cuerpo / corredera
    P.append(caja("cuerpo", (0.046, 0.16, 0.052), (0, -0.04, 0.076), m.pintado, ACERO0, ACERO1, bisel=0.008, segs=1))
    P.append(caja("placa_sup", (0.03, 0.12, 0.008), (0, -0.05, 0.1035), m.pintado, PLACA, "#8a96b8", bisel=0, suave=False))
    # canon: carcasa octogonal + tubo + collares luminosos
    P.append(cilindro("carcasa", 0.024, 0.085, (0, -0.1375, 0.076), m.pintado, ACERO0, ACERO1, bisel=0, rot=(R90, 0, 0), vertices=8, suave=False))
    P.append(cilindro("tubo", 0.012, 0.075, (0, -0.1625, 0.076), m.pintado, "#8d99bd", bisel=0, rot=(R90, 0, 0), vertices=8, suave=False))
    P.append(cilindro("collar1", 0.0285, 0.01, (0, -0.118, 0.076), acm, acento_hex, bisel=0, rot=(R90, 0, 0), vertices=12, suave=False))
    P.append(cilindro("collar2", 0.0285, 0.01, (0, -0.158, 0.076), acm, acento_hex, bisel=0, rot=(R90, 0, 0), vertices=12, suave=False))
    P.append(cilindro("boca", 0.0125, 0.006, (0, -0.2, 0.076), acm, acento_hex, bisel=0, rot=(R90, 0, 0), vertices=8, suave=False))
    # celda de energia sobre el cuerpo (brillante) con marco
    P.append(caja("celda_marco", (0.03, 0.08, 0.012), (0, 0.0, 0.1155), m.pintado, "#10141f", bisel=0, suave=False))
    P.append(caja("celda", (0.02, 0.07, 0.016), (0, 0.0, 0.1215), acm, acento_hex, bisel=0, suave=False))
    # franjas laterales luminosas
    for s in (-1, 1):
        P.append(caja(f"franja{s}", (0.004, 0.11, 0.008), (0.0245 * s, -0.04, 0.083), acm, acento_hex, bisel=0, suave=False))
        P.append(caja(f"franja_b{s}", (0.004, 0.05, 0.006), (0.0245 * s, -0.04, 0.066), acm, acento_hex, bisel=0, suave=False))
    # miras
    P.append(caja("mira_del", (0.008, 0.01, 0.02), (0, -0.155, 0.114), m.pintado, "#c3cbe6", bisel=0, suave=False))
    P.append(caja("mira_del_luz", (0.004, 0.004, 0.004), (0, -0.155, 0.1255), m.blanco, "#ffffff", bisel=0, suave=False))
    for s in (-1, 1):
        P.append(caja(f"mira_tra{s}", (0.008, 0.012, 0.016), (0.014 * s, 0.03, 0.11), m.pintado, "#c3cbe6", bisel=0, suave=False))
    # guardamonte y gatillo
    P.append(caja("guarda_f", (0.008, 0.008, 0.034), (0, -0.056, 0.032), m.pintado, "#161b2b", bisel=0, suave=False))
    P.append(caja("guarda_b", (0.01, 0.06, 0.008), (0, -0.026, 0.017), m.pintado, "#161b2b", bisel=0, suave=False))
    P.append(caja("gatillo", (0.008, 0.01, 0.026), (0, -0.016, 0.04), acm, acento_hex, bisel=0, rot=(math.radians(18), 0, 0), suave=False))
    o = unir(P, "blaster")
    ensuciar(o, 0.08, semilla=2)
    hornear_ao(o, rayos=14, fuerza=0.6, distancia=0.05)
    return o, m


for var, hx in (("cian", "#00f7ff"), ("naranja", "#ff9d00")):
    o, m = construir(var, hx)
    exportar(o, f"blaster_{var}", notas="origen en el agarre; canon a -Y Blender (+Z glTF); boca a 0.20 m; arriba +Z Blender (+Y glTF)",
             nodos=["blaster"])
    vista_previa(f"blaster_{var}", [o], vistas=((90, 0), (35, 24), (0, 0)), margen=1.25)
