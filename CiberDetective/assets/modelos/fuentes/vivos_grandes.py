"""Familia vivos · vehículos grandes: bus_urbano (11 m), chiva (bus de escalera) y camion_reparto."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from vivos_util import *
from vivos_autos import rueda, arcos, lineas_puerta, OSCURO, CROMO, NEUMATICO

PLACA_B = "#f1f2ee"


def vista_grande():
    return [(32, 22), (148, 22), (90, 5), (20, 62)]


def placa(m, y, z, lado_y, color=PLACA_B, w=0.46, h=0.22):
    m.caja((0, y, z), (w + 0.05, 0.012, h + 0.05), "#1c1d20")
    m.caja((0, y + lado_y * 0.007, z), (w, 0.012, h), color)


# ------------------------------------------------------------------ BUS URBANO
def bus(nombre="bus_urbano"):
    nuevo_modelo()
    m = Malla()
    pint = G([(0.42, "#5d6168"), (0.95, "#b7bbc1"), (1.5, "#e3e6ea"), (3.2, "#f6f8fa")])
    hull = [(-5.50, 0.55, 2.95, 2.30, 2.18, 0.18), (-5.40, 0.46, 3.10, 2.46, 2.38, 0.22),
            (-4.80, 0.42, 3.18, 2.50, 2.42, 0.22), (4.80, 0.42, 3.18, 2.50, 2.42, 0.22),
            (5.40, 0.46, 3.10, 2.46, 2.36, 0.22), (5.50, 0.55, 2.95, 2.30, 2.16, 0.18)]
    m.anillos([anillo_rr(y, w, zb, zt, r, wt, 3) for (y, zb, zt, w, wt, r) in hull], pint)
    lado = lambda z: x_lado(z, 1.25, 1.21, 0.42, 3.18, 0.22)
    o = 0.012
    # bandas laterales (cintura gris y franja)
    for sd in (-1, 1):
        m.panel_x(sd * (lado(0.95) + o), -5.0, 5.0, 0.95, 1.30, "#8f959d", sd, x1=sd * (lado(1.3) + o))
        m.panel_x(sd * (lado(1.30) + o), -5.0, 5.0, 1.30, 1.40, "#c6cad0", sd, x1=sd * (lado(1.4) + o))
    # ventanas: marco oscuro + vidrios. Lado derecho (-X) con puerta delantera; izquierdo con ventanilla del conductor
    z0, z1 = 1.55, 2.72
    for sd in (-1, 1):
        y_ini = -3.30 if sd == -1 else -3.85
        m.panel_x(sd * (lado(z0) + o), y_ini, 5.0, z0 - 0.06, z1 + 0.06, "#1b1e23", sd, x1=sd * (lado(z1) + o))
        y = y_ini + 0.06
        while y + 0.9 < 4.95:
            m.panel_x(sd * (lado(z0) + o * 2), y, y + 1.05, z0, z1, "#9cc0d6", sd, VIDRIO, x1=sd * (lado(z1) + o * 2))
            y += 1.17
    # ventanilla del conductor (lado izquierdo, +X)
    m.panel_x(lado(1.55) + o, -4.95, -3.9, 1.45, 2.72, "#1b1e23", 1, x1=lado(2.72) + o)
    m.panel_x(lado(1.55) + o * 2, -4.9, -3.95, 1.55, 2.68, "#9cc0d6", 1, VIDRIO, x1=lado(2.68) + o * 2)
    # puerta delantera (lado derecho, -X): hoja doble con vidrio
    m.panel_x(-(lado(0.62) + o), -4.95, -3.55, 0.62, 2.86, "#1b1e23", -1, x1=-(lado(2.86) + o))
    for ya in (-4.88, -4.22):
        m.panel_x(-(lado(0.9) + o * 2), ya, ya + 0.62, 0.85, 2.72, "#9cc0d6", -1, VIDRIO, x1=-(lado(2.72) + o * 2))
    m.caja((-1.2, -4.25, 0.45), (0.6, 1.3, 0.1), "#2c2e33")   # estribo
    # parabrisas y letrero de destino
    m.panel_y(-5.506, -1.12, 1.12, 1.36, 2.76, "#1b1e23", -1)
    m.panel_y(-5.512, -1.06, -0.03, 1.42, 2.72, "#9cc0d6", -1, VIDRIO)
    m.panel_y(-5.512, 0.03, 1.06, 1.42, 2.72, "#9cc0d6", -1, VIDRIO)
    m.panel_y(-5.512, -0.85, 0.85, 2.78, 2.91, "#ffb347", -1, EMISIVO)
    m.panel_x(lado(2.85) + o * 2, -4.6, -3.6, 2.76, 2.92, "#ffb347", 1, EMISIVO, x1=lado(2.92) + o * 2)
    # luneta y rejilla del motor atrás
    m.panel_y(5.506, -0.95, 0.95, 1.9, 2.72, "#1b1e23", 1)
    m.panel_y(5.512, -0.88, 0.88, 1.96, 2.66, "#9cc0d6", 1, VIDRIO)
    m.panel_y(5.508, -0.9, 0.9, 0.95, 1.7, "#1f2227", 1)
    for k in range(4):
        m.panel_y(5.514, -0.85, 0.85, 1.0 + k * 0.17, 1.06 + k * 0.17, "#6b7079", 1)
    # parachoques, faros, placas
    m.caja((0, -5.57, 0.62), (2.40, 0.22, 0.30), OSCURO, bis=0.05)
    m.caja((0, 5.57, 0.62), (2.40, 0.22, 0.30), OSCURO, bis=0.05)
    placa(m, -5.69, 0.66, -1)
    placa(m, 5.69, 0.66, 1)
    for s in (-1, 1):
        m.caja((s * 0.90, -5.52, 0.98), (0.46, 0.07, 0.20), "#fff1c8", EMISIVO, bis=0.015)
        m.caja((s * 0.90, -5.52, 1.28), (0.30, 0.06, 0.08), "#ffb020", EMISIVO)
        m.caja((s * 1.02, 5.52, 1.20), (0.20, 0.07, 0.56), "#ff2a1a", EMISIVO, bis=0.015)
        # retrovisores grandes
        m.caja((s * 1.46, -5.0, 2.12), (0.10, 0.12, 0.58), OSCURO, bis=0.02)
        m.caja((s * 1.36, -5.0, 2.40), (0.28, 0.04, 0.04), OSCURO)
    # aire acondicionado y escotilla en el techo
    m.caja((0, 0.9, 3.34), (1.55, 3.4, 0.30), "#d9dde1", bis=0.05)
    for y in (-0.2, 0.9, 2.0):
        m.rev([(0, 0.36), (0.04, 0.36)], M=T((0, y, 3.495)), n=10, color="#30343a")
    m.caja((0, -2.8, 3.25), (0.9, 0.7, 0.10), "#cfd3d8", bis=0.02)
    # ruedas
    for y in (-3.8, 3.5):
        for sd in (-1, 1):
            rueda(m, sd, 1.04, y, 0.50, 0.32, n=14, llanta="#9ba1aa")
    arcos(m, lambda z: x_lado(z, 1.25, 1.21, 0.42, 3.18, 0.22) + 0.0, -3.8, 0.50, 0.50, 0.55) if False else None
    for sd in (-1, 1):
        for y in (-3.8, 3.5):
            pts = []
            for k in range(16):
                a = 2 * math.pi * k / 16
                yy, zz = y + 0.60 * math.cos(a), 0.50 + 0.60 * math.sin(a)
                zz = max(zz, 0.43)
                pts.append((sd * (lado(zz) + 0.008), yy, zz))
            m.poligono(pts, "#101113", PINTADO, (sd, 0, 0))
    terminar(m, "vivos", nombre, notas="11 m; carroceria clara tintable; puerta a la derecha (-X); letrero de destino emisivo",
             ao=(16, 0.5, 0.8), vistas=vista_grande(), res=(560, 380), cols=2, margen=1.18)


# ------------------------------------------------------------------ CHIVA
def chiva(nombre="chiva"):
    nuevo_modelo()
    m = Malla()
    ROJO, AMA, AZUL, TEAL, BLA, MAD = "#d62839", "#f6a91b", "#2c5fa8", "#1f9e8e", "#f7f3e6", "#8a5a2b"
    xc = 1.0
    # chasis y ruedas
    m.caja((0, 0.0, 0.78), (1.9, 9.3, 0.30), "#26262a")
    for sd in (-1, 1):
        for y in (-3.1, 2.7):
            rueda(m, sd, xc + 0.02, y, 0.52, 0.30, n=9, llanta="#c9a227")
    # guardabarros delanteros
    for sd in (-1, 1):
        m.caja((sd * 1.0, -3.1, 1.10), (0.52, 1.5, 0.12), ROJO)
        m.caja((sd * 1.0, -3.1, 1.02), (0.52, 1.5, 0.06), "#1a1a1c")
    # capó: rejilla y motor
    cap = [(-4.55, 1.00, 1.78, 1.22, 1.12, 0.12), (-4.45, 0.88, 1.98, 1.42, 1.22, 0.18),
           (-3.5, 0.88, 2.08, 1.52, 1.26, 0.2), (-2.5, 0.88, 2.12, 1.62, 1.30, 0.2)]
    m.anillos([anillo_rr(y, w, zb, zt, r, wt, 3) for (y, zb, zt, w, wt, r) in cap], G([(0.9, "#a81d2c"), (2.1, "#e8404f")]))
    m.caja((0, -4.575, 1.40), (1.00, 0.04, 0.78), "#15161a")
    for k in range(7):
        m.caja((-0.42 + k * 0.14, -4.605, 1.40), (0.05, 0.03, 0.74), CROMO)
    m.caja((0, -4.60, 1.80), (1.1, 0.04, 0.05), CROMO)
    m.caja((0, -4.70, 0.88), (1.7, 0.18, 0.22), CROMO)      # parachoques cromado
    placa(m, -4.81, 0.90, -1, color="#f0cf4a", w=0.4, h=0.2)
    for sd in (-1, 1):                                                  # faros redondos
        m.rev([(0, 0.2), (0.07, 0.2)], M=T((sd * 0.74, -4.46, 1.38), (90, 0, 0)), n=10, color=CROMO)
        m.rev([(0, 0.15), (0.05, 0.15)], M=T((sd * 0.74, -4.53, 1.38), (90, 0, 0)), n=10, color="#fff1c8", mat=EMISIVO)
        m.caja((sd * 0.74, -4.46, 1.12), (0.16, 0.06, 0.07), "#ffb020", EMISIVO)
    # tubo de escape y espejo
    m.rev([(0, 0.04), (0.95, 0.04)], M=T((0.82, -3.0, 1.9)), n=6, color="#44464c")
    for sd in (-1, 1):
        m.caja((sd * 1.28, -2.4, 2.20), (0.18, 0.04, 0.04), "#26262a")
    # carrocería de pasajeros: tablones apilados con los colores de la chiva
    bandas = [(0.22, TEAL), (0.30, ROJO), (0.10, BLA), (0.20, AMA), (0.12, AZUL)]
    z = 0.85
    for h, c in bandas:
        m.caja((0, 0.975, z + h / 2), (2.42, 6.85, h), c)
        z += h
    m.caja((0, 0.975, z + 0.03), (2.46, 6.9, 0.06), "#3b2a1d")     # borde de madera
    # rombos y soles pintados
    for sd in (-1, 1):
        for k in range(12):
            y = -1.95 + k * 0.5
            c = BLA if k % 2 == 0 else AMA
            x = sd * (1.21 + 0.012)
            m.poligono([(x, y, 1.17), (x, y + 0.17, 1.0 + 0.30 / 2 + 0.0), (x, y, 1.33), (x, y - 0.17, 1.0 + 0.30 / 2)], c, PINTADO, (sd, 0, 0)) if False else None
            zc = 0.85 + 0.22 + 0.15
            m.poligono([(x, y - 0.17, zc), (x, y, zc - 0.11), (x, y + 0.17, zc), (x, y, zc + 0.11)], c, PINTADO, (sd, 0, 0))
    ang = [2 * math.pi * k / 10 for k in range(10)]
    m.poligono([(1.0 * 0 + 0.55 * math.cos(a), 4.405, 1.3 + 0.55 * math.sin(a)) for a in ang], AMA, PINTADO, (0, 1, 0))
    m.poligono([(0.30 * math.cos(a), 4.41, 1.3 + 0.30 * math.sin(a)) for a in ang], ROJO, PINTADO, (0, 1, 0))
    # postes de madera y techo
    ys = [-2.1, -0.2, 1.8, 4.25]
    for sd in (-1, 1):
        for y in ys:
            m.caja((sd * 1.18, y, 2.45), (0.10, 0.10, 1.25), MAD)
    m.caja((0, 0.975, 3.06), (2.8, 6.95, 0.10), AMA)
    m.caja((0, 0.975, 3.13), (2.5, 6.6, 0.06), ROJO)
    m.caja((0, -2.7, 3.02), (2.5, 0.8, 0.07), AZUL, rot=(-8, 0, 0))     # visera frontal
    # parabrisas
    m.panel_y(-2.452, -1.1, 1.1, 1.9, 2.98, "#1b1e23", -1)
    m.panel_y(-2.458, -1.05, 1.05, 1.96, 2.92, "#9cc0d6", -1, VIDRIO)
    m.caja((0, -2.45, 2.45), (0.06, 0.05, 1.1), "#1b1e23")
    # bancas de madera (se ven por los costados abiertos)
    for y in ():
        m.caja((0, y, 2.15), (2.1, 0.42, 0.08), "#b47a3c")
        m.caja((0, y + 0.22, 2.45), (2.1, 0.06, 0.55), "#9a6530")
    m.caja((0, 4.3, 2.4), (2.3, 0.1, 1.1), "#3b2a1d")            # pared trasera
    # parrilla del techo con carga
    for sd in (-1, 1):
        m.caja((sd * 1.28, 0.975, 3.52), (0.05, 6.7, 0.05), "#26262a")
        for y in (-2.2, 1.0, 4.3):
            m.caja((sd * 1.28, y, 3.34), (0.05, 0.05, 0.36), "#26262a")
    m.caja((0, -2.2, 3.52), (2.56, 0.05, 0.05), "#26262a")
    m.caja((0, 4.25, 3.52), (2.56, 0.05, 0.05), "#26262a")
    m.caja((-0.45, -1.0, 3.45), (0.85, 0.55, 0.40), "#d6c48a", rot=(0, 0, 12))        # sacos
    m.caja((0.5, -1.2, 3.42), (0.7, 0.5, 0.36), "#c9b27a", rot=(0, 0, -20))
    for k, (x, y, zc) in enumerate([(0.5, 0.6, 3.32), (-0.45, 0.7, 3.32), (0.05, 0.65, 3.62)]):
        m.caja((x, y, zc), (0.7, 0.5, 0.30), "#d9892f" if k != 2 else "#c46f1e", bis=0)     # cajones
    m.caja((0, 2.5, 3.46), (1.9, 1.8, 0.5), AZUL, afil=0.85)                           # lona azul
    m.rev([(0, 0.26, "#2a5ea0"), (0.62, 0.26, "#2a5ea0")], M=T((0.7, 3.8, 3.42)), n=10, color="#2a5ea0")   # barril
    # escalera trasera
    for sd in (-1, 1):
        m.caja((sd * 0.32, 4.5, 2.2), (0.05, 0.05, 2.4), "#26262a", rot=(-8, 0, 0))
    for k in range(4):
        m.caja((0, 4.5 - (k * 0.07) * 0.14, 1.05 + k * 0.55), (0.7, 0.04, 0.04), "#26262a")
    # trasera: luces y placa
    m.caja((0, 4.62, 0.88), (1.9, 0.14, 0.2), CROMO)
    placa(m, 4.71, 0.9, 1, color="#f0cf4a", w=0.4, h=0.2)
    for sd in (-1, 1):
        m.caja((sd * 0.95, 4.42, 1.62), (0.12, 0.06, 0.3), "#ff2a1a", EMISIVO)
    terminar(m, "vivos", nombre, notas="bus de escalera: colores horneados (usar tinte blanco); parrilla con carga en el techo; escalera atras",
             ao=(16, 0.5, 0.8), vistas=vista_grande(), res=(560, 380), cols=2, margen=1.18)


# ------------------------------------------------------------------ CAMIÓN DE REPARTO
def camion(nombre="camion_reparto"):
    nuevo_modelo()
    m = Malla()
    pcab = G([(0.6, "#5d6168"), (1.0, "#c1c5cb"), (2.65, "#f4f6f8")])
    cab = [(-3.80, 0.75, 2.10, 2.12, 1.98, 0.15), (-3.70, 0.62, 2.55, 2.28, 2.12, 0.18),
           (-2.25, 0.62, 2.68, 2.32, 2.16, 0.18), (-1.95, 0.62, 2.62, 2.30, 2.14, 0.15)]
    m.anillos([anillo_rr(y, w, zb, zt, r, wt, 3) for (y, zb, zt, w, wt, r) in cab], pcab)
    lc = lambda z: x_lado(z, 1.16, 1.08, 0.62, 2.68, 0.18)
    o = 0.012
    # ventanas y puertas de la cabina
    m.panel_y(-3.706, -0.98, 0.98, 1.25, 2.42, "#1b1e23", -1)
    m.panel_y(-3.712, -0.92, 0.92, 1.31, 2.36, "#9cc0d6", -1, VIDRIO)
    for sd in (-1, 1):
        m.panel_x(sd * (lc(1.45) + o), -3.45, -2.25, 1.45, 2.42, "#1b1e23", sd, x1=sd * (lc(2.42) + o))
        m.panel_x(sd * (lc(1.5) + o * 2), -3.40, -2.30, 1.5, 2.37, "#9cc0d6", sd, VIDRIO, x1=sd * (lc(2.37) + o * 2))
    lineas_puerta(m, lc, (-3.55, -2.2), 0.80, 2.4)
    # caja de carga (blanca, tintable)
    pcar = G([(0.95, "#a9adb3"), (1.6, "#e3e6ea"), (3.45, "#f7f9fb")])
    box = [(-1.85, 0.95, 3.42, 2.38, 2.32, 0.09), (-1.75, 0.95, 3.48, 2.42, 2.38, 0.09),
           (3.55, 0.95, 3.48, 2.42, 2.38, 0.09), (3.65, 0.95, 3.42, 2.38, 2.32, 0.09)]
    m.anillos([anillo_rr(y, w, zb, zt, r, wt, 2) for (y, zb, zt, w, wt, r) in box], pcar)
    lb = lambda z: x_lado(z, 1.21, 1.19, 0.95, 3.48, 0.09)
    for sd in (-1, 1):
        # franjas de reparto (sin texto) y logo abstracto
        m.panel_x(sd * (lb(1.25) + o), -1.6, 3.5, 1.25, 1.60, "#e76f51", sd, x1=sd * (lb(1.6) + o))
        m.panel_x(sd * (lb(1.65) + o), -1.6, 3.5, 1.65, 1.72, "#2a9d8f", sd, x1=sd * (lb(1.72) + o))
        cx, cz = 0.9, 2.55
        m.poligono([(sd * (lb(cz) + o), cx + 1.1 * math.cos(2 * math.pi * k / 12), cz + 0.62 * math.sin(2 * math.pi * k / 12)) for k in range(12)],
                   "#2a9d8f", PINTADO, (sd, 0, 0))
        m.poligono([(sd * (lb(cz) + o * 2), cx - 0.35 + 0.30 * math.cos(2 * math.pi * k / 12), cz + 0.14 * math.sin(2 * math.pi * k / 12)) for k in range(12)],
                   "#f7f9fb", PINTADO, (sd, 0, 0))
    # puerta enrollable trasera: líneas
    m.panel_y(3.656, -1.0, 1.0, 1.15, 3.2, "#c9cdd3", 1)
    for k in range(9):
        m.panel_y(3.662, -1.0, 1.0, 1.25 + k * 0.22, 1.28 + k * 0.22, "#8b9099", 1)
    m.caja((0, 0.9, 3.5), (2.3, 5.4, 0.04), "#d3d7dc")     # techo con nervadura
    # chasis, tanque y parachoques
    m.caja((0, -0.2, 0.82), (1.8, 7.0, 0.22), "#25262a")
    for sd in (-1, 1):
        m.rev([(0, 0.22), (1.0, 0.22)], M=T((sd * 0.95, -0.2, 0.62), (90, 0, 0)), n=8, color="#6a6f78")
    m.caja((0, -3.85, 0.62), (2.2, 0.2, 0.28), OSCURO, bis=0.04)
    m.caja((0, 3.82, 0.62), (2.2, 0.2, 0.26), OSCURO, bis=0.04)
    placa(m, -3.96, 0.66, -1)
    placa(m, 3.93, 0.66, 1)
    for sd in (-1, 1):
        m.caja((sd * 0.85, -3.77, 0.98), (0.40, 0.08, 0.18), "#fff1c8", EMISIVO, bis=0.015)
        m.caja((sd * 1.05, 3.68, 1.30), (0.14, 0.08, 0.52), "#ff2a1a", EMISIVO, bis=0.012)
        m.caja((sd * 1.34, -3.2, 2.0), (0.10, 0.14, 0.6), OSCURO, bis=0.02)
        m.caja((sd * 1.25, -3.2, 2.28), (0.2, 0.04, 0.04), OSCURO)
    m.caja((0, -3.76, 2.62), (1.6, 0.12, 0.16), "#d9dde1", bis=0.03)     # deflector
    # ruedas (traseras gemelas)
    for sd in (-1, 1):
        rueda(m, sd, 1.00, -2.8, 0.46, 0.30, n=12, llanta="#9ba1aa")
        rueda(m, sd, 0.82, 2.45, 0.46, 0.22, n=12, llanta="#9ba1aa")
        rueda(m, sd, 1.06, 2.45, 0.46, 0.22, n=12, llanta="#9ba1aa")
    for sd in (-1, 1):
        for y in (-2.8, 2.45):
            pts = []
            for k in range(16):
                a = 2 * math.pi * k / 16
                yy, zz = y + 0.56 * math.cos(a), 0.46 + 0.56 * math.sin(a)
                zz = max(zz, 0.60)
                pts.append((sd * (1.17 + 0.006) if y < 0 else sd * (1.21 + 0.006), yy, zz))
            m.poligono(pts, "#101113", PINTADO, (sd, 0, 0))
    terminar(m, "vivos", nombre, notas="camion de reparto 7.4 m; cabina y caja claras tintables; franjas sin texto",
             ao=(16, 0.5, 0.8), vistas=vista_grande(), res=(560, 380), cols=2, margen=1.18)


if __name__ == "__main__":
    pedido = os.environ.get("VIVOS", "bus_urbano,chiva,camion_reparto").split(",")
    if "bus_urbano" in pedido:
        bus()
    if "chiva" in pedido:
        chiva()
    if "camion_reparto" in pedido:
        camion()
