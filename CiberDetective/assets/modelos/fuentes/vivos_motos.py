"""Familia vivos · motos: moto (con piloto) y mototaxi (tres ruedas con cabina)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from vivos_util import *
from vivos_autos import rueda, OSCURO, CROMO, NEUMATICO


def jinete(m, hip, torso_fin, mano_y, mano_z, pie_y, chaqueta, casco, pantalon="#2b2d3a", piel="#c68642", gorra=False):
    """Piloto sentado. hip=(0,y,z); torso_fin=(y,z) del cuello; manos en (mano_y, mano_z); pies en pie_y."""
    hx, hy, hz = hip
    ty, tz = torso_fin
    cj = G([(hz, G([(0, chaqueta)])((0, 0, 0))), (tz, mezcla(chaqueta, "#ffffff", 0.22))])
    m.tubo([(0, hy, hz), (0, (hy + ty) / 2 + 0.02, (hz + tz) / 2), (0, ty, tz)], [(0.16, 0.1), (0.18, 0.11), (0.17, 0.09)],
           n=8, color=cj, tapas=(True, True))
    m.tubo([(0, ty - 0.01, tz), (0, ty - 0.02, tz + 0.09)], [0.05, 0.045], n=6, color=piel)
    hc = (0, ty - 0.03, tz + 0.2)
    if gorra:
        m.rev([(-0.13, 0.08, piel), (0.0, 0.115, piel), (0.1, 0.1, piel)], M=T(hc), n=8, color=piel)
        m.rev([(0.07, 0.125, casco), (0.14, 0.1, casco)], M=T(hc), n=8, color=casco)
    else:
        m.rev([(-0.14, 0.09, casco), (-0.05, 0.14, casco), (0.06, 0.145, casco), (0.14, 0.09, casco)], M=T(hc), n=10, color=casco, esc=(1.0, 1.1))
        m.caja((0, ty - 0.03 - 0.13, tz + 0.2), (0.2, 0.05, 0.08), "#1b232c")        # visera oscura
    for s in (-1, 1):
        m.tubo([(s * 0.21, ty + 0.02, tz - 0.05), (s * 0.27, (ty + mano_y) / 2 - 0.05, (tz + mano_z) / 2 + 0.05), (s * 0.27, mano_y, mano_z)],
               [0.055, 0.047, 0.04], n=6, color=[chaqueta, chaqueta, "#222"])
        m.tubo([(s * 0.14, hy, hz), (s * 0.2, hy - 0.4, hz - 0.1), (s * 0.2, pie_y, 0.40)], [0.085, 0.065, 0.05], n=6, color=pantalon)
        m.caja((s * 0.2, pie_y - 0.06, 0.34), (0.1, 0.28, 0.1), "#18181a", bis=0.02)


def rueda_moto(m, y, R=0.31, w=0.13, x=0.0, n=10):
    rueda(m, 1, x, y, R, w, n=n, llanta="#aeb4bc")


def moto(nombre="moto"):
    nuevo_modelo()
    m = Malla()
    cuerpo = G([(0.3, "#8f949b"), (0.8, "#e1e4e8"), (1.0, "#f6f8fa")])
    rueda_moto(m, -0.65)
    rueda_moto(m, 0.65)
    # horquilla, manubrio, faro, guardabarros
    for s in (-1, 1):
        m.caja((s * 0.075, -0.585, 0.66), (0.045, 0.05, 0.72), "#9aa0a8", rot=(-10.7, 0, 0))
        m.caja((s * 0.31, -0.48, 1.07), (0.14, 0.04, 0.04), "#18181a")
        m.caja((s * 0.38, -0.46, 1.17), (0.07, 0.03, 0.06), "#2a2d33")
    m.caja((0, -0.5, 1.07), (0.64, 0.04, 0.04), "#2a2d33")
    m.caja((0, -0.66, 0.66), (0.12, 0.58, 0.04), cuerpo, rot=(0, 0, 0))
    m.rev([(0, 0.11), (0.1, 0.12)], M=T((0, -0.54, 0.93), (90, 0, 0)), n=10, color=cuerpo)
    m.rev([(0, 0.085), (0.04, 0.085)], M=T((0, -0.65, 0.93), (90, 0, 0)), n=10, color="#fff1c8", mat=EMISIVO)
    # tanque, motor, asiento, guardabarros trasero
    m.rev([(-0.26, 0.10), (-0.12, 0.17), (0.12, 0.18), (0.27, 0.12)], M=T((0, -0.15, 0.88), (-90, 0, 0)), n=8, color=cuerpo, esc=(1.0, 0.95))
    m.caja((0, 0.04, 0.38), (0.26, 0.5, 0.32), "#3b3f46", bis=0.03)
    m.caja((0, 0.30, 0.83), (0.30, 0.78, 0.10), "#18181a", bis=0.035)
    m.caja((0, 0.70, 0.72), (0.18, 0.5, 0.06), cuerpo, rot=(-8, 0, 0))
    m.caja((0, 0.78, 0.84), (0.22, 0.45, 0.08), cuerpo, bis=0.02, rot=(-8, 0, 0))
    m.caja((0, 1.02, 0.84), (0.15, 0.04, 0.06), "#ff2a1a", EMISIVO)
    m.caja((0, 1.0, 0.68), (0.16, 0.012, 0.1), "#f1f2ee")
    m.rev([(0, 0.045), (0.5, 0.05)], M=T((0.17, 0.5, 0.28), (-90, 0, 0)), n=6, color="#8b9099")
    # piloto con casco
    jinete(m, (0, 0.33, 0.95), (-0.03, 1.52), -0.5, 1.07, -0.05, "#2f6fbf", "#f2c230")
    terminar(m, "vivos", nombre, notas="moto con piloto de casco amarillo; carroceria clara tintable",
             ao=(16, 0.5, 0.45), vistas=[(32, 22), (148, 22), (90, 5), (20, 62)], res=(520, 400), cols=2, margen=1.15)


def mototaxi(nombre="mototaxi"):
    nuevo_modelo()
    m = Malla()
    cuerpo = G([(0.35, "#8c9199"), (0.9, "#dfe2e6"), (1.7, "#f6f8fa")])
    rueda_moto(m, -1.15, 0.30, 0.13)
    for s in (-1, 1):
        rueda(m, s, 0.64, 0.75, 0.30, 0.15, n=10, llanta="#aeb4bc")
        m.caja((s * 0.62, 0.75, 0.66), (0.22, 0.75, 0.05), cuerpo, bis=0.015)
        m.caja((s * 0.075, -1.085, 0.66), (0.045, 0.05, 0.72), "#9aa0a8", rot=(-10.7, 0, 0))
        m.caja((s * 0.32, -0.88, 1.07), (0.14, 0.04, 0.04), "#18181a")
    m.caja((0, -0.9, 1.07), (0.66, 0.04, 0.04), "#2a2d33")
    m.caja((0, -1.16, 0.66), (0.12, 0.58, 0.04), cuerpo)
    m.rev([(0, 0.11), (0.1, 0.12)], M=T((0, -1.04, 0.93), (90, 0, 0)), n=10, color=cuerpo)
    m.rev([(0, 0.085), (0.04, 0.085)], M=T((0, -1.15, 0.93), (90, 0, 0)), n=10, color="#fff1c8", mat=EMISIVO)
    m.rev([(-0.26, 0.10), (-0.12, 0.17), (0.12, 0.18), (0.27, 0.12)], M=T((0, -0.55, 0.85), (-90, 0, 0)), n=8, color=cuerpo)
    m.caja((0, -0.2, 0.40), (0.3, 0.6, 0.3), "#3b3f46", bis=0.03)
    m.caja((0, -0.2, 0.80), (0.32, 0.55, 0.10), "#18181a", bis=0.035)
    # cabina de pasajeros: tina inferior, banca, techo con postes y luneta
    tina = [(0.05, 0.40, 1.00, 1.34, 1.26, 0.1), (0.15, 0.36, 1.05, 1.42, 1.34, 0.1),
            (1.35, 0.36, 1.05, 1.42, 1.34, 0.1), (1.55, 0.42, 0.98, 1.30, 1.22, 0.1)]
    m.anillos([anillo_rr(y, w, zb, zt, r, wt, 2) for (y, zb, zt, w, wt, r) in tina], cuerpo)
    m.caja((0, 0.75, 1.12), (1.15, 0.5, 0.1), "#6b3f2a", bis=0.02)      # banca
    m.caja((0, 1.1, 1.38), (1.15, 0.1, 0.45), "#6b3f2a")
    for s in (-1, 1):
        for y in (0.1, 1.45):
            m.caja((s * 0.62, y, 1.4), (0.06, 0.06, 0.8), "#2b2d42")
    m.caja((0, 0.78, 1.82), (1.5, 1.9, 0.07), "#e63946", bis=0.02, afil=0.96)
    m.caja((0, 0.78, 1.77), (1.42, 1.82, 0.05), "#2b2d42")
    m.panel_y(1.552, -0.6, 0.6, 1.35, 1.78, "#9cc0d6", 1, VIDRIO)
    m.caja((0, 1.58, 0.62), (1.28, 0.1, 0.26), OSCURO, bis=0.03)
    m.caja((0, 1.64, 0.62), (0.34, 0.012, 0.17), "#f0cf4a")
    m.caja((0.0, 1.57, 0.95), (0.2, 0.04, 0.07), "#ff2a1a", EMISIVO)
    for s in (-1, 1):
        m.caja((s * 0.58, 1.57, 0.95), (0.12, 0.04, 0.10), "#ff2a1a", EMISIVO)
    # conductor con gorra
    jinete(m, (0, -0.2, 0.9), (-0.38, 1.48), -0.88, 1.07, -0.62, "#e9c46a", "#2a9d8f", gorra=True)
    terminar(m, "vivos", nombre, notas="mototaxi: moto delantera + cabina trasera con techo rojo; conductor con gorra",
             ao=(16, 0.5, 0.45), vistas=[(32, 22), (148, 22), (90, 5), (20, 62)], res=(520, 400), cols=2, margen=1.15)


if __name__ == "__main__":
    pedido = os.environ.get("VIVOS", "moto,mototaxi").split(",")
    if "moto" in pedido:
        moto()
    if "mototaxi" in pedido:
        mototaxi()
