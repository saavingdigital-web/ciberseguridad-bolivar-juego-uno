"""vivos · detective_valeria: la inspectora Valeria Ríos (héroe, <= 3 500 triángulos)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from vivos_gente import *

OCRE = "#c8963e"
OCRE_O = "#9a6f2e"
CIAN = "#19d8ea"
PIEL = "#c68a5e"
PELO = "#2a1810"
FIELTRO = "#2e2f3a"
CUERO = "#5a3a22"
ORO = "#f1c24a"


def valeria():
    nuevo_modelo()
    m = Malla()
    # --- piernas (pantalón slim oscuro) y botas
    for s in (-1, 1):
        x = 0.092
        m.tubo([(s * x, 0, 0.92), (s * x, 0, 0.62), (s * x, 0, 0.40), (s * x, 0, 0.30)], [(0.086, 0.08), (0.07, 0.068), (0.06, 0.06), (0.062, 0.062)],
               n=10, color=["#2b2d3a", "#2b2d3a", "#252733", "#252733"])
        m.tubo([(s * x, 0, 0.36), (s * x, 0, 0.2), (s * x, 0, 0.07)], [(0.07, 0.07), (0.062, 0.062), (0.056, 0.056)], n=10, color=["#4a2e1b", "#3a2216", "#2c1a10"],
               tapas=(True, False))
        zc = G([(0.0, "#140c08"), (0.022, "#140c08"), (0.03, "#3a2216"), (0.1, "#4a2e1b")])
        m.anillos([anillo_rr(y, w, 0.0, h, 0.03, None, 2, xc=s * x) for (y, w, h) in [(0.09, 0.098, 0.1), (-0.04, 0.108, 0.085), (-0.12, 0.1, 0.062), (-0.205, 0.08, 0.035)]], zc)
        m.caja((s * x, 0.055, 0.025), (0.075, 0.075, 0.05), "#140c08")
    # --- gabardina: torso + falda hasta la rodilla
    torso(m, 1, 0.97, "m", OCRE, OCRE_O, n=12)
    sk = [(1.02, (0.135, 0.098)), (0.82, (0.2, 0.125)), (0.64, (0.245, 0.14)), (0.52, (0.268, 0.15))]
    m.tubo([(0, 0.0, z) for z, _ in sk], [r for _, r in sk], n=12, color=[G([(0.5, "#8a6128"), (1.0, OCRE)])] * 4, tapas=(False, True))
    # dobladillo oscuro
    m.tubo([(0, 0, 0.535), (0, 0, 0.50)], [(0.266, 0.149), (0.27, 0.152)], n=12, color="#7d5522", tapas=(False, True))
    # cinturón con hebilla y cola
    m.tubo([(0, 0, 1.0), (0, 0, 1.075)], [(0.14, 0.1), (0.135, 0.098)], n=12, color=CUERO, tapas=(False, False))
    m.caja((0, -0.112, 1.04), (0.075, 0.02, 0.07), ORO, bis=0.008)
    m.caja((0, -0.115, 1.04), (0.04, 0.02, 0.035), "#7d5a1a")
    m.caja((0.1, -0.108, 0.93), (0.05, 0.016, 0.2), CUERO, rot=(0, 0, -6))
    # solapas, cuello levantado y botones
    for s in (-1, 1):
        m.poligono([(s * 0.025, -0.116, 1.46), (s * 0.115, -0.092, 1.42), (s * 0.09, -0.118, 1.16), (s * 0.012, -0.126, 1.1)], OCRE_O, PINTADO, (0, -1, 0))
        m.poligono([(s * 0.012, -0.126, 1.1), (s * 0.09, -0.118, 1.16), (s * 0.075, -0.121, 1.12)], "#7d5522", PINTADO, (0, -1, 0))
        m.caja((s * 0.2, 0.0, 1.46), (0.1, 0.07, 0.025), OCRE_O, rot=(0, 0, s * 18))       # charretera
        m.caja((s * 0.115, -0.123, 0.78), (0.1, 0.02, 0.07), OCRE_O)                         # bolsillo
    m.rev([(1.43, 0.078), (1.5, 0.098), (1.56, 0.11)], n=12, color=[OCRE_O, OCRE_O, "#b78237"], tapas=(False, False), esc=(1.0, 0.9))
    for z in (1.24, 0.98 + 0.0, 0.84, 0.7):
        m.rev([(0, 0.014), (0.012, 0.014)], M=T((0.0, -0.127 - (0.012 if z < 1.0 else 0) - (0.02 if z < 0.9 else 0), z), (90, 0, 0)), n=6, color=ORO)
    # insignia dorada (escudo) en el pecho izquierdo
    sh = [(-0.04, 0.045), (0.04, 0.045), (0.04, -0.01), (0.0, -0.06), (-0.04, -0.01)]
    m.poligono([(0.10 + a, -0.112, 1.23 + b) for a, b in sh], ORO, PINTADO, (0, -1, 0))
    m.poligono([(0.10 + a * 0.55, -0.114, 1.222 + b * 0.55) for a, b in sh], "#fff0b0", PINTADO, (0, -1, 0))
    # --- bufanda cian
    m.rev([(1.45, 0.082), (1.48, 0.112), (1.545, 0.116), (1.575, 0.088)], n=12, color=[mezcla(CIAN, "#000000", 0.2), CIAN, CIAN, mezcla(CIAN, "#ffffff", 0.15)], tapas=(False, False), esc=(1.0, 0.92))
    m.caja((0.06, -0.12, 1.30), (0.085, 0.03, 0.36), CIAN, rot=(6, 0, 4), afil=0.85)
    m.caja((0.0, -0.1, 1.40), (0.14, 0.05, 0.1), mezcla(CIAN, "#000000", 0.15))
    m.caja((-0.05, -0.12, 1.34), (0.07, 0.025, 0.24), mezcla(CIAN, "#000000", 0.18), rot=(4, 0, -5))
    # --- brazos
    brazos(m, 1, 0.97, "larga", OCRE, PIEL, n=9, lados=(-1,))
    # brazo izquierdo (+X) doblado sosteniendo la tablet
    P = [(0.235, 0.0, 1.41), (0.268, 0.02, 1.25), (0.285, 0.0, 1.13), (0.25, -0.17, 1.17), (0.205, -0.30, 1.22), (0.2, -0.305, 1.222), (0.192, -0.35, 1.235)]
    R = [0.064, 0.055, 0.05, 0.047, 0.04, 0.037, (0.04, 0.026)]
    C_ = [OCRE, OCRE, OCRE, OCRE, OCRE_O, PIEL, PIEL]
    m.tubo(P, R, n=9, color=C_, corte=(4,), tapas=(True, True))
    # tablet con pantalla emisiva cian
    cen = Vector((0.185, -0.36, 1.275))
    rot = (-32, 0, 14)
    m.caja(tuple(cen), (0.2, 0.15, 0.014), "#12161d", bis=0.004, rot=rot)
    nor = Euler(tuple(math.radians(a) for a in rot), "XYZ").to_matrix() @ Vector((0, 0, 1))
    m.caja(tuple(cen + nor * 0.0085), (0.178, 0.128, 0.004), "#5ff3ff", EMISIVO, rot=rot)
    m.caja(tuple(cen + nor * 0.011), (0.1, 0.02, 0.003), "#d8ffff", EMISIVO, rot=rot)
    # --- cuello y cabeza
    cuello(m, PIEL, 1)
    hc = (0.0, 0.0, 1.62)
    cabeza(m, hc, 1, 1.0, PIEL, n=10, fino=True)
    for s in (-1, 1):   # cejas, orejas
        m.poligono([(s * 0.065 - 0.026, -0.111, hc[2] + 0.04), (s * 0.065 + 0.026, -0.111, hc[2] + 0.04), (s * 0.065 + 0.026, -0.111, hc[2] + 0.052), (s * 0.065 - 0.026, -0.111, hc[2] + 0.046)], "#1b110c", PINTADO, (0, -1, 0))
        m.caja((s * 0.119, 0.0, hc[2] - 0.01), (0.02, 0.04, 0.05), PIEL)
    m.poligono([(-0.025, -0.113, hc[2] - 0.063), (0.025, -0.113, hc[2] - 0.063), (0.02, -0.113, hc[2] - 0.05), (-0.02, -0.113, hc[2] - 0.05)], "#b4384a", PINTADO, (0, -1, 0))
    # pelo recogido en moño bajo
    pelo(m, "corto", hc, 1, 1.0, PELO, n=10)
    m.rev([(-0.06, 0.04), (0.0, 0.085), (0.06, 0.04)], M=T((0, 0.115, hc[2] - 0.03)), n=8, color=PELO)
    m.caja((0, 0.108, hc[2] - 0.03), (0.15, 0.02, 0.025), CUERO)
    # --- sombrero fedora
    hz = hc[2] + 0.105
    m.rev([(0.0, 0.135), (0.0, 0.245), (0.014, 0.245), (0.014, 0.135)], M=T((0, 0.0, hz), (-2, 0, 0)), n=16, color=[FIELTRO, "#24252e", "#3a3b48", "#3a3b48"])
    m.rev([(0.012, 0.128, "#2a2b36"), (0.07, 0.122, FIELTRO), (0.12, 0.11, "#3a3b48"), (0.14, 0.09, "#454656"), (0.147, 0.045, "#2a2b36")], M=T((0, 0.0, hz), (-2, 0, 0)), n=14)
    m.rev([(0.014, 0.131), (0.05, 0.126)], M=T((0, 0.0, hz), (-2, 0, 0)), n=14, color=CUERO, tapas=(False, False))
    m.caja((0.03, -0.13, hz + 0.035), (0.04, 0.012, 0.045), CIAN, rot=(-2, 0, 0))
    terminar(m, "vivos", "detective_valeria", notas="heroina: gabardina ocre, bufanda cian, fedora, tablet con pantalla emisiva en la mano izquierda (+X), insignia dorada",
             sucio=0.05, ao=(24, 0.5, 0.35), vistas=VISTAS_GENTE, res=(400, 560), cols=4, ang_agudo=50.0,
             extra={"cadera_z": 0.9, "convencion": "pose neutra; abrigo en una sola malla (no dividir piernas por x)"}, margen=1.1)


if __name__ == "__main__":
    valeria()
