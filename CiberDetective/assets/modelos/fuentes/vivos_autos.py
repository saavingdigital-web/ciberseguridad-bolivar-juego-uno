"""Familia vivos · autos: sedan_a, taxi_amarillo, camioneta. (Blender 5.2, ver vivos_util.py)"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from vivos_util import *

OSCURO = "#2a2c31"
CROMO = "#b9bfc8"
NEUMATICO = "#17181a"
LLANTA = "#a9afb8"
PLACA = "#f0cf4a"      # placa amarilla colombiana, SIN texto


def rueda(m, lado, xc, y, R=0.33, w=0.22, n=12, llanta=LLANTA):
    """Rueda con eje en X. lado=+1 derecha del mundo (+X). xc = centro lateral de la rueda."""
    xin = xc - lado * w / 2
    perfil = [(0, R * 0.9, NEUMATICO), (0.03, R, NEUMATICO), (w - 0.03, R, NEUMATICO), (w, R * 0.9, NEUMATICO),
              (w, R * 0.62, llanta), (w - 0.05, R * 0.62, "#6c727b")]
    m.rev(perfil, M=T((lado * xin, y, R), (0, 90 * lado, 0)), n=n)


def ruedas(m, xc, y_del, y_tras, R, w, n=12, llanta=LLANTA):
    for lado in (-1, 1):
        for y in (y_del, y_tras):
            rueda(m, lado, xc, y, R, w, n, llanta)


def arcos(m, perfil_lado, y_del, y_tras, R, zmin):
    """Discos oscuros pegados a la carrocería detrás de cada rueda (simulan el hueco del guardabarros)."""
    for lado in (-1, 1):
        for y in (y_del, y_tras):
            pts = []
            for k in range(14):
                a = 2 * math.pi * k / 14
                yy, zz = y + (R + 0.05) * math.cos(a), R + (R + 0.05) * math.sin(a)
                zz = max(zz, zmin)
                pts.append((lado * (perfil_lado(zz) + 0.004), yy, zz))
            m.poligono(pts, "#101113", PINTADO, (lado, 0, 0))


def lineas_puerta(m, perfil_lado, ys, z0, z1, ancho=0.014, color="#2a2c31"):
    for lado in (-1, 1):
        for y in ys:
            m.panel_x(lado * (perfil_lado(z0) + 0.012), y - ancho / 2, y + ancho / 2, z0, z1, color, lado,
                      x1=lado * (perfil_lado(z1) + 0.012))


def manijas(m, perfil_lado, ys, z, largo=0.14, color="#dfe3e8"):
    for lado in (-1, 1):
        for y in ys:
            m.panel_x(lado * (perfil_lado(z) + 0.014), y - largo / 2, y + largo / 2, z - 0.012, z + 0.012, color, lado)


def sedan(nombre, taxi=False):
    nuevo_modelo()
    m = Malla()
    if taxi:
        pint = G([(0.28, "#6b5a14"), (0.42, "#e3b50c"), (0.9, "#f6c90e"), (1.42, "#ffd93d")])
    else:
        pint = G([(0.28, "#5b5f66"), (0.42, "#c3c7cd"), (0.9, "#e9ecef"), (1.42, "#f7f9fb")])
    # casco inferior: (y, zb, zt, ancho, ancho_techo, radio)
    casco = [(-2.25, 0.40, 0.66, 1.46, 1.30, 0.10), (-2.15, 0.30, 0.74, 1.74, 1.56, 0.16),
             (-1.42, 0.28, 0.80, 1.88, 1.66, 0.17), (-0.95, 0.28, 0.86, 1.80, 1.62, 0.16), (-0.50, 0.28, 0.90, 1.80, 1.62, 0.16),
             (0.60, 0.28, 0.91, 1.80, 1.62, 0.16), (1.2, 0.28, 0.93, 1.82, 1.62, 0.16), (1.45, 0.28, 0.95, 1.88, 1.66, 0.17), (1.75, 0.28, 0.94, 1.82, 1.62, 0.16),
             (2.15, 0.30, 0.92, 1.74, 1.56, 0.15), (2.25, 0.38, 0.84, 1.50, 1.34, 0.10)]
    m.anillos([anillo_rr(y, w, zb, zt, r, wt, 3) for (y, zb, zt, w, wt, r) in casco], pint)
    lado = lambda z: x_lado(z, 0.9, 0.81, 0.28, 0.91, 0.16)
    # cabina: ventanas laterales en el tramo central, parabrisas y luneta en los extremos
    cab = [(-0.85, 0.86, 0.92, 1.56, 1.44, 0.03), (-0.20, 0.86, 1.38, 1.56, 1.30, 0.09),
           (0.95, 0.86, 1.41, 1.56, 1.30, 0.09), (1.62, 0.86, 0.95, 1.56, 1.40, 0.03)]
    rings = [anillo_trap(y, zb, zt, wb, wt, r) for (y, zb, zt, wb, wt, r) in cab]

    def mat_cab(i, j):
        if i in (0, 2):
            return VIDRIO if j in (1, 2, 3) else PINTADO
        return VIDRIO if j in (0, 4) else PINTADO
    m.anillos(rings, G([(0.86, "#dfe3e8"), (1.4, "#f7f9fb")]) if not taxi else G([(0.86, "#efbd0d"), (1.4, "#ffd93d")]),
              PINTADO, matf=mat_cab)
    # montantes B
    for s in (-1, 1):
        m.caja((s * 0.69, 0.38, 1.12), (0.07, 0.10, 0.52), pint, afil=0.9, rot=(0, -s * 12, 0))
    # ruedas
    ruedas(m, 0.80, -1.42, 1.45, 0.35, 0.23)
    arcos(m, lambda z: x_lado(z, 0.94, 0.84, 0.28, 0.80, 0.17) + 0.0, -1.42, 1.45, 0.35, 0.285)
    # detalles de carrocería
    lineas_puerta(m, lado, (-0.95, 0.32, 1.32), 0.44, 0.88)
    manijas(m, lado, (-0.18, 0.78), 0.80)
    # parachoques y rejilla
    m.caja((0, -2.27, 0.45), (1.64, 0.13, 0.17), OSCURO, bis=0.035)
    m.caja((0, 2.27, 0.45), (1.62, 0.13, 0.17), OSCURO, bis=0.035)
    m.caja((0, -2.265, 0.60), (0.64, 0.05, 0.12), "#16181b", bis=0.01)
    m.caja((0, -2.29, 0.62), (0.70, 0.025, 0.02), CROMO)
    # placas amarillas sin texto (marco oscuro + placa)
    m.caja((0, -2.345, 0.46), (0.42, 0.012, 0.2), "#1c1d20")
    m.caja((0, -2.352, 0.46), (0.37, 0.012, 0.15), PLACA if taxi else "#f1f2ee")
    m.caja((0, 2.345, 0.50), (0.42, 0.012, 0.2), "#1c1d20")
    m.caja((0, 2.352, 0.50), (0.37, 0.012, 0.15), PLACA if taxi else "#f1f2ee")
    # faros delanteros y traseros (emisivos)
    for s in (-1, 1):
        m.caja((s * 0.57, -2.215, 0.67), (0.40, 0.07, 0.13), "#fff1c8", EMISIVO, rot=(0, 0, s * 17), bis=0.01)
        m.caja((s * 0.58, -2.225, 0.55), (0.18, 0.05, 0.07), "#ffe9a8", EMISIVO, rot=(0, 0, s * 17))
        m.caja((s * 0.60, 2.225, 0.77), (0.40, 0.07, 0.13), "#ff2a1a", EMISIVO, rot=(0, 0, -s * 17), bis=0.01)
        # retrovisores
        m.caja((s * 0.97, -0.58, 0.99), (0.17, 0.11, 0.11), pint, afil=0.8, bis=0.02)
        m.caja((s * 0.88, -0.58, 0.93), (0.12, 0.04, 0.04), OSCURO)
    # escape
    m.rev([(0, 0.045), (0.14, 0.045)], M=T((0.55, 2.31, 0.33), (-90, 0, 0)), n=6, color="#5c6068")
    if taxi:
        m.caja((0, 0.3, 1.49), (0.58, 0.24, 0.16), "#f4f1e0", bis=0.03)
        m.panel_y(0.3 - 0.121, -0.21, 0.21, 1.44, 1.54, "#ffc61a", -1, EMISIVO)
        m.panel_y(0.3 + 0.121, -0.21, 0.21, 1.44, 1.54, "#ffc61a", 1, EMISIVO)
        # franja de ajedrez de taxi en las puertas
        z0, z1 = 0.50, 0.60
        for sd in (-1, 1):
            for k in range(17):
                if k % 2 == 0:
                    ya, yb = -0.92 + k * 0.115, -0.92 + (k + 1) * 0.115
                    m.panel_x(sd * (lado(z0) + 0.02), ya, yb, z0, z1, "#1a1a1c", sd, x1=sd * (lado(z1) + 0.02))
    else:
        # moldura de cintura
        for sd in (-1, 1):
            m.panel_x(sd * (lado(0.62) + 0.02), -1.0, 1.0, 0.615, 0.635, "#aab0b8", sd, x1=sd * (lado(0.635) + 0.02))
    notas = "carroceria en tono claro tintable" if not taxi else "amarillo horneado (usar tinte blanco); farol de taxi con panel emisivo"
    terminar(m, "vivos", nombre, notas=notas, ao=(18, 0.5, 0.6), vistas=VISTAS_AUTO, res=(560, 380), cols=2)


def camioneta(nombre="camioneta"):
    nuevo_modelo()
    m = Malla()
    pint = G([(0.36, "#555a61"), (0.55, "#c1c5cb"), (1.1, "#e8ebef"), (1.85, "#f8fafc")])
    casco = [(-2.35, 0.50, 0.85, 1.58, 1.42, 0.12), (-2.25, 0.38, 0.98, 1.84, 1.70, 0.16),
             (-1.5, 0.36, 1.05, 1.90, 1.76, 0.16), (-0.8, 0.36, 1.10, 1.90, 1.76, 0.16),
             (1.5, 0.36, 1.12, 1.90, 1.76, 0.16), (2.25, 0.38, 1.12, 1.88, 1.74, 0.14),
             (2.35, 0.46, 1.04, 1.70, 1.56, 0.10)]
    m.anillos([anillo_rr(y, w, zb, zt, r, wt, 3) for (y, zb, zt, w, wt, r) in casco], pint)
    lado = lambda z: x_lado(z, 0.95, 0.88, 0.36, 1.12, 0.16)
    cab = [(-0.95, 1.06, 1.15, 1.74, 1.62, 0.03), (-0.25, 1.06, 1.80, 1.74, 1.50, 0.10),
           (1.95, 1.06, 1.82, 1.74, 1.50, 0.10), (2.31, 1.06, 1.30, 1.72, 1.50, 0.04)]
    rings = [anillo_trap(y, zb, zt, wb, wt, r) for (y, zb, zt, wb, wt, r) in cab]

    def mat_cab(i, j):
        if i in (0, 2):
            return VIDRIO if j in (1, 2, 3) else PINTADO
        return VIDRIO if j in (0, 4) else PINTADO
    m.anillos(rings, G([(1.06, "#e4e8ec"), (1.8, "#f8fafc")]), PINTADO, matf=mat_cab)
    for s in (-1, 1):
        for y in (0.40, 1.35):
            m.caja((s * 0.74, y, 1.43), (0.08, 0.11, 0.72), pint, afil=0.9, rot=(0, -s * 9, 0))
    ruedas(m, 0.82, -1.55, 1.50, 0.40, 0.28, n=12, llanta="#8b919a")
    arcos(m, lado, -1.55, 1.50, 0.40, 0.375)
    lineas_puerta(m, lado, (-0.95, 0.40, 1.38), 0.52, 1.06)
    manijas(m, lado, (-0.20, 0.85), 0.95)
    # parachoques robustos, barra y rejilla
    m.caja((0, -2.36, 0.52), (1.78, 0.16, 0.24), OSCURO, bis=0.04)
    m.caja((0, 2.38, 0.52), (1.72, 0.16, 0.24), OSCURO, bis=0.04)
    m.caja((0, -2.33, 0.80), (0.9, 0.06, 0.20), "#15171a", bis=0.012)
    m.caja((0, -2.365, 0.86), (0.96, 0.025, 0.03), CROMO)
    m.caja((0, -2.365, 0.76), (0.96, 0.025, 0.03), CROMO)
    m.caja((0, -2.445, 0.50), (0.42, 0.012, 0.2), "#1c1d20")
    m.caja((0, -2.452, 0.50), (0.37, 0.012, 0.15), "#f1f2ee")
    m.caja((0, 2.465, 0.55), (0.42, 0.012, 0.2), "#1c1d20")
    m.caja((0, 2.472, 0.55), (0.37, 0.012, 0.15), "#f1f2ee")
    for s in (-1, 1):
        m.caja((s * 0.70, -2.30, 0.88), (0.38, 0.09, 0.16), "#fff1c8", EMISIVO, rot=(0, 0, s * 14), bis=0.01)
        m.caja((s * 0.78, -2.33, 0.62), (0.16, 0.07, 0.08), "#ffe9a8", EMISIVO, rot=(0, 0, s * 14))
        m.caja((s * 0.77, 2.34, 0.92), (0.14, 0.08, 0.40), "#ff2a1a", EMISIVO, bis=0.01)
        m.caja((s * 1.03, -0.62, 1.20), (0.18, 0.12, 0.13), pint, afil=0.8, bis=0.02)
        m.caja((s * 0.94, -0.62, 1.12), (0.12, 0.04, 0.04), OSCURO)
    # rack de techo con barras
    for s in (-1, 1):
        m.caja((s * 0.62, 0.85, 1.88), (0.05, 2.35, 0.05), OSCURO)
    for y in (-0.15, 0.75, 1.65):
        m.caja((0, y, 1.90), (1.34, 0.06, 0.05), OSCURO)
    # estribos laterales
    for s in (-1, 1):
        m.caja((s * 0.97, 0.3, 0.42), (0.14, 2.6, 0.05), OSCURO, bis=0.01)
    # llanta de repuesto en la puerta trasera
    m.rev([(0, 0.34 * 0.9, NEUMATICO), (0.03, 0.34, NEUMATICO), (0.17, 0.34, NEUMATICO), (0.2, 0.34 * 0.9, NEUMATICO),
           (0.2, 0.21, "#8b919a"), (0.15, 0.21, "#6c727b")], M=T((0, 2.4, 1.0), (-90, 0, 0)), n=12)
    m.caja((0, 2.37, 1.0), (0.3, 0.08, 0.3), OSCURO)
    terminar(m, "vivos", nombre, notas="SUV con rack de techo y repuesto trasero; carroceria en tono claro tintable",
             ao=(18, 0.5, 0.65), vistas=VISTAS_AUTO, res=(560, 380), cols=2)


if __name__ == "__main__":
    pedido = os.environ.get("VIVOS", "sedan_a,taxi_amarillo,camioneta").split(",")
    if "sedan_a" in pedido:
        sedan("sedan_a")
    if "taxi_amarillo" in pedido:
        sedan("taxi_amarillo", taxi=True)
    if "camioneta" in pedido:
        camioneta("camioneta")
