"""Casas coloniales de la ciudad vieja (Puerto Nexo): a (balcón corrido), b (esquina con chaflán), c (mirador y parapeto).
Uso: blender --background --factory-startup --python arquitectura_colonial.py -- a b c
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from arq_comun import *


def consola(c, x, y, z_top, prof, alto, ancho=0.16, col="#6b4a2e"):
    """Ménsula triangular de madera bajo un balcón (en el marco de la fachada)."""
    perfil = [(0, z_top), (-prof, z_top), (-prof, z_top - 0.12), (-prof * 0.3, z_top - alto * 0.6), (0, z_top - alto)]
    with c.frame(x + ancho / 2, y, 90):
        c.extruir_xz(perfil, 0.0, ancho, col, sin_base=False)


def esquineros(c, x0, x1, y0, y1, z0, z1, col, g=0.34, sal=0.05):
    for sx in (-1, 1):
        for sy in (-1, 1):
            xs = x1 if sx > 0 else x0; ys = y1 if sy > 0 else y0
            c.box(min(xs, xs - sx * g) - (sal if sx < 0 else 0), max(xs, xs - sx * g) + (sal if sx > 0 else 0),
                  min(ys, ys - sy * g) - (sal if sy < 0 else 0), max(ys, ys - sy * g) + (sal if sy > 0 else 0), z0, z1, col, sin="u")


def chimenea(c, x, y, zb, zt, col="#d9c9a8"):
    c.box(x - 0.55, x + 0.55, y - 0.45, y + 0.45, zb, zt, col, mezcla(col, "#ffffff", 0.1), sin="u")
    c.box(x - 0.7, x + 0.7, y - 0.6, y + 0.6, zt, zt + 0.15, tono(col, 0.8), sin="u")
    c.box(x - 0.4, x + 0.4, y - 0.3, y + 0.3, zt + 0.15, zt + 0.38, "#4a3d36", sin="u")


def piramide_teja(c, poly, z0, alto, col, alero=0.6, cursos=7, lip=0.07, col2=None):
    """Techo piramidal sobre un polígono convexo (escalando hacia el centro) con hileras escalonadas."""
    n = len(poly)
    cx = sum(p[0] for p in poly) / n; cy = sum(p[1] for p in poly) / n
    rad = sum(math.hypot(p[0] - cx, p[1] - cy) for p in poly) / n
    f0 = 1 + alero / rad
    pend = alto / rad
    ze = z0 - pend * alero
    zr = z0 + alto
    c0 = L(col); c1 = L(col2) if col2 else mezcla(col, "#ffffff", 0.12)
    for k in range(cursos):
        t0 = k / cursos; t1 = (k + 1) / cursos
        s0 = f0 * (1 - t0) + lip / rad; s1 = f0 * (1 - t1)
        za = ze + (zr - ze) * t0; zb = ze + (zr - ze) * t1
        cc = tuple((c0[i] if k % 2 == 0 else c1[i]) * (0.93 + 0.07 * t0) for i in range(3))
        for i in range(n):
            j = (i + 1) % n
            A = [(cx + (poly[q][0] - cx) * s0, cy + (poly[q][1] - cy) * s0) for q in (i, j)]
            B = [(cx + (poly[q][0] - cx) * s1, cy + (poly[q][1] - cy) * s1) for q in (i, j)]
            mx = (A[0][0] + A[1][0]) / 2 - cx; my = (A[0][1] + A[1][1]) / 2 - cy
            c.poly([(A[0][0], A[0][1], za), (A[1][0], A[1][1], za), (B[1][0], B[1][1], zb), (B[0][0], B[0][1], zb)], None, 0, hacia=(mx, my, 1), cols=[cc] * 4)


# =========================================================== CASA A: balcón corrido
def casa_a():
    nuevo_modelo(); m = mats(); c = Cons(11)
    W, D, H = 9.0, 11.0, 7.4
    pared = "#efc766"; pared_alta = "#f8dc98"; crema = "#f1e7cf"; mad = "#7a4a2b"; post = "#3fa7a0"
    hy = -D / 2
    c.box(-W / 2, W / 2, -D / 2, D / 2, 0, H, pared, pared_alta)
    c.box(-W / 2 - 0.08, W / 2 + 0.08, -D / 2 - 0.08, D / 2 + 0.08, 0, 0.95, PAL["coralina"])
    c.box(-W / 2 - 0.14, W / 2 + 0.14, -D / 2 - 0.14, D / 2 + 0.14, 0.95, 1.07, mezcla(PAL["coralina"], "#ffffff", 0.2))
    esquineros(c, -W / 2, W / 2, -D / 2, D / 2, 1.07, 7.0, crema)
    c.box(-W / 2 - 0.05, W / 2 + 0.05, -D / 2 - 0.05, D / 2 + 0.05, 3.55, 3.75, crema)
    # cornisa con friso y ménsulas
    c.box(-W / 2 - 0.28, W / 2 + 0.28, -D / 2 - 0.28, D / 2 + 0.28, 7.0, 7.3, crema)
    c.box(-W / 2 - 0.12, W / 2 + 0.12, -D / 2 - 0.12, D / 2 + 0.12, 6.7, 7.0, mezcla(pared, "#ffffff", 0.3))
    for i in range(12):
        x = -W / 2 + 0.4 + i * (W - 0.8) / 11
        c.box(x - 0.09, x + 0.09, -D / 2 - 0.28, -D / 2 - 0.1, 6.78, 7.0, tono(crema, 0.86), sin="ub")
    c.tejado2(-W / 2, W / 2, -D / 2, D / 2, 7.3, 2.4, PAL["teja"], alero=0.9, alero_x=0.3, hastial=pared_alta, cursos=8)
    chimenea(c, -2.6, 2.4, 8.2, 10.15)

    # --- fachada frontal
    with c.frame(0, hy, 0):
        for u in (-3.0, 3.0):
            ventana(c, u, 1.2, 1.2, 1.75, lit=0.2, postigo=post, reja=True)
        puerta_arco(c, 0, 1.5, 2.9, marco=crema, madera="#5e371d")
        farol(c, -1.55, 2.95)
        farol(c, 1.55, 2.95)
        # balcón corrido de madera con balaustres torneados, viguetas y ménsulas
        pb = 0.9; zf = 3.82
        c.box(-W / 2 - 0.4, W / 2 + 0.4, -pb, 0.0, zf - 0.2, zf, mad, sin="ub")
        c.box(-W / 2 - 0.45, W / 2 + 0.45, -pb - 0.06, -pb + 0.04, zf - 0.38, zf - 0.2, tono(mad, 0.75), sin="u")
        for i in range(9):
            x = -W / 2 - 0.2 + i * (W + 0.4) / 8
            c.box(x - 0.07, x + 0.07, -pb, 0.0, zf - 0.38, zf - 0.2, tono(mad, 0.9), sin="ub")
        for x in (-W / 2 - 0.3, -2.3, 0.0, 2.3, W / 2 + 0.3):
            consola(c, x - 0.08, 0.0, zf - 0.38, pb * 0.9, 0.85, 0.16, mad)
        baranda(c, -W / 2 - 0.4, W / 2 + 0.4, -pb + 0.06, zf, 0.95, "#f1e7cf", pasamano=mad, paso=0.29)
        for sx in (-1, 1):
            with c.frame(sx * (W / 2 + 0.4), 0, 90):
                baranda(c, -pb + 0.06, 0.0, 0.0, zf, 0.95, "#f1e7cf", pasamano=mad, paso=0.29)
        for x in (-W / 2 - 0.36, -3.0, 0.0, 3.0, W / 2 + 0.36):
            c.box(x - 0.08, x + 0.08, -pb - 0.04, -pb + 0.12, zf, 6.9, mad, sin="u")
        c.box(-W / 2 - 0.45, W / 2 + 0.45, -pb - 0.06, -pb + 0.14, 6.72, 6.92, tono(mad, 0.8), sin="u")
        for u in (-2.9, 0.0, 2.9):
            ventana(c, u, 3.95, 1.1, 2.4, lit=0.28, postigo=post, alfeizar=False)
        for x in (-3.8, -1.5, 1.5, 3.8):
            maceta(c, x, -pb + 0.06, zf + 0.95 + 0.05, r=0.2, flor=c.R.choice(["#ff5a7a", "#ffd23c", "#ff8a3c"]))
    # --- laterales y trasera
    for sx, rot in ((1, 90), (-1, -90)):
        with c.frame(sx * W / 2, 0, rot):
            for u in (-2.4, 1.6):
                ventana(c, u, 1.3, 1.0, 1.6, lit=0.2, marco=crema)
                ventana(c, u, 4.3, 1.0, 1.9, lit=0.25, marco=crema, postigo=post)
    with c.frame(0, D / 2, 180):
        for u in (-2.8, 0.0, 2.8):
            ventana(c, u, 4.3, 1.0, 1.9, lit=0.2, marco=crema, postigo=post)
        ventana(c, -2.8, 1.3, 1.0, 1.6, lit=0.2, marco=crema)
        ventana(c, 2.8, 1.3, 1.0, 1.6, lit=0.2, marco=crema)
        puerta_arco(c, 0, 1.1, 2.4, marco=crema, madera="#5e371d", f=0.16)
    return c, m


# =========================================================== CASA B: esquina con chaflán
def casa_b():
    nuevo_modelo(); m = mats(); c = Cons(23)
    W = D = 10.0; ch = 2.8; H = 7.6
    pared = "#86d4cb"; pared_alta = "#b2e6df"; crema = "#f6efdc"; mad = "#8a5430"; post = "#f4efe0"
    h = W / 2
    poly = [(-h + ch, -h), (h, -h), (h, h), (-h, h), (-h, -h + ch)]
    c.prisma(poly, 0, H, pared, pared_alta)
    zp = [(-h + ch - 0.04, -h - 0.08), (h + 0.08, -h - 0.08), (h + 0.08, h + 0.08), (-h - 0.08, h + 0.08), (-h - 0.08, -h + ch - 0.04)]
    c.prisma(zp, 0, 0.95, PAL["coralina"])
    zp2 = [(-h + ch - 0.1, -h - 0.14), (h + 0.14, -h - 0.14), (h + 0.14, h + 0.14), (-h - 0.14, h + 0.14), (-h - 0.14, -h + ch - 0.1)]
    c.prisma(zp2, 0.95, 1.07, mezcla(PAL["coralina"], "#ffffff", 0.2))
    cr = [(-h + ch - 0.28, -h - 0.28), (h + 0.28, -h - 0.28), (h + 0.28, h + 0.28), (-h - 0.28, h + 0.28), (-h - 0.28, -h + ch - 0.28)]
    c.prisma(cr, 7.05, 7.35, crema)
    c.prisma(zp2, 6.75, 7.05, mezcla(pared, "#ffffff", 0.3))
    c.prisma([(x + (0.06 if x > 0 else -0.06), y + (0.06 if y > 0 else -0.06)) for x, y in poly], 3.55, 3.75, crema)
    for (qx, qy) in ((h, -h), (h, h), (-h, h)):
        sx = 1 if qx > 0 else -1; sy = 1 if qy > 0 else -1
        c.box(min(qx, qx - 0.3 * sx) - (0.05 if sx < 0 else 0), max(qx, qx - 0.3 * sx) + (0.05 if sx > 0 else 0),
              min(qy, qy - 0.3 * sy) - (0.05 if sy < 0 else 0), max(qy, qy - 0.3 * sy) + (0.05 if sy > 0 else 0), 1.07, 6.75, crema, sin="u")
    # techo piramidal + linterna (cupulino)
    piramide_teja(c, cr, 7.35, 3.0, PAL["teja"], alero=0.35, cursos=8)
    cx0 = sum(p[0] for p in cr) / 5; cy0 = sum(p[1] for p in cr) / 5
    zl = 7.35 + 3.0 - 0.05
    c.box(cx0 - 0.7, cx0 + 0.7, cy0 - 0.7, cy0 + 0.7, zl, zl + 1.0, crema, sin="u")
    c.pano(cx0 - 0.35, cx0 + 0.35, zl + 0.2, zl + 0.8, cy0 - 0.715, LIT_CALIDO, mat=1)
    c.pano(cx0 - 0.35, cx0 + 0.35, zl + 0.2, zl + 0.8, cy0 + 0.715, LIT_AMBAR, mat=1, cara=1)
    with c.frame(cx0 + 0.705, cy0, 90):
        c.pano(-0.35, 0.35, zl + 0.2, zl + 0.8, 0.0, LIT_AMBAR, mat=1)
    with c.frame(cx0 - 0.705, cy0, -90):
        c.pano(-0.35, 0.35, zl + 0.2, zl + 0.8, 0.0, LIT_CALIDO, mat=1)
    c.prisma([(cx0 - 0.95, cy0 - 0.95), (cx0 + 0.95, cy0 - 0.95), (cx0 + 0.95, cy0 + 0.95), (cx0 - 0.95, cy0 + 0.95)], zl + 1.0, zl + 1.9, PAL["teja"], esc=0.0, tapa=False)
    c.box(cx0 - 0.03, cx0 + 0.03, cy0 - 0.03, cy0 + 0.03, zl + 1.9, zl + 2.6, "#2b2b2b", sin="u")
    c.box(cx0 - 0.25, cx0 + 0.25, cy0 - 0.02, cy0 + 0.02, zl + 2.25, zl + 2.3, "#2b2b2b", sin="u")
    # --- puerta en el chaflán
    zz = 3.82
    with c.frame(-h + ch / 2, -h + ch / 2, -45):
        puerta_arco(c, 0, 1.5, 3.1, marco=crema, madera="#5e371d", f=0.24)
        farol(c, -1.4, 3.15)
        farol(c, 1.4, 3.15)
        ventana(c, 0, 4.0, 1.1, 2.4, lit=0.3, postigo=post, alfeizar=False)
    # --- balcón en L: frente + chaflán + costado izquierdo
    pb = 1.1
    pts = [(h, -h), (h, -h - pb), (-2.656, -h - pb), (-h - pb, -2.656), (-h - pb, 1.5), (-h, 1.5), (-h, -h + ch), (-h + ch, -h)]
    c.prisma(pts, zz - 0.2, zz, mad)
    c.prisma([(x * 0.985, y * 0.985) for x, y in pts], zz - 0.4, zz - 0.2, tono(mad, 0.75), tapa=False)
    ruta = [(h, -h - pb + 0.07), (-2.62, -h - pb + 0.07), (-h - pb + 0.07, -2.62), (-h - pb + 0.07, 1.43)]
    for (xa, ya), (xb, yb) in zip(ruta[:-1], ruta[1:]):
        ang = math.degrees(math.atan2(yb - ya, xb - xa)); ln = math.hypot(xb - xa, yb - ya)
        with c.frame(xa, ya, ang):
            baranda(c, 0.0, ln, 0.0, zz, 0.95, "#f6efdc", pasamano=mad, paso=0.3)
    with c.frame(h - 0.03, -h - pb + 0.07, 90):
        baranda(c, 0.0, pb - 0.07, 0.0, zz, 0.95, "#f6efdc", pasamano=mad, paso=0.3)
    with c.frame(-h - pb + 0.07, 1.43, 0):
        baranda(c, 0.0, pb - 0.07, 0.0, zz, 0.95, "#f6efdc", pasamano=mad, paso=0.3)
    for (px, py) in ((h - 0.1, -h - pb + 0.1), (-2.62, -h - pb + 0.1), (-h - pb + 0.1, -2.62), (-h - pb + 0.1, 1.35)):
        c.box(px - 0.08, px + 0.08, py - 0.08, py + 0.08, zz, 6.95, mad, sin="u")
    for (mx, my) in ((2.2, -h - pb + 0.07), (-0.6, -h - pb + 0.07), (-h - pb + 0.07, -0.5), (-h - pb + 0.07, 0.9)):
        maceta(c, mx, my, zz + 1.0, r=0.2, flor=c.R.choice(["#ff5a7a", "#ffd23c", "#ff8a3c"]))
    # --- fachadas
    with c.frame(0, -h, 0):
        for u in (0.9, 3.6):
            ventana(c, u, 1.2, 1.2, 1.75, lit=0.22, postigo=post, reja=True)
            ventana(c, u, 4.0, 1.1, 2.4, lit=0.28, postigo=post, alfeizar=False)
    with c.frame(-h, 0, -90):                    # costado izquierdo; u local = -y
        for u in (-3.6, -0.8, 1.2):
            ventana(c, u, 1.2, 1.0, 1.75, lit=0.22, postigo=post, reja=True)
            ventana(c, u, 4.0, 1.0, 2.4, lit=0.25, postigo=post, alfeizar=False)
    with c.frame(h, 0, 90):
        for u in (-2.5, 1.0, 3.8):
            ventana(c, u, 1.3, 1.0, 1.6, lit=0.2, marco=crema)
            ventana(c, u, 4.2, 1.0, 1.9, lit=0.25, marco=crema, postigo=post)
    with c.frame(0, h, 180):
        for u in (-3.0, 0.0, 3.0):
            ventana(c, u, 4.2, 1.0, 1.9, lit=0.2, marco=crema, postigo=post)
            ventana(c, u, 1.3, 1.0, 1.6, lit=0.2, marco=crema)
    return c, m


# =========================================================== CASA C: parapeto, mirador y buhardillas
def buhardilla(c, x_front, y, rot, z_roof_front, wall, teja, prof=1.5, w=1.2, hf=1.3, marco="#f6efdc"):
    """Buhardilla con ventana y techito a dos aguas. rot=90 mira a +X, rot=-90 mira a -X."""
    with c.frame(x_front, y, rot):
        zb = z_roof_front - 0.06
        c.box(-w / 2, w / 2, -0.0, prof, zb, zb + hf, wall, mezcla(wall, "#ffffff", 0.15), sin="uf")
        ventana(c, 0, zb + 0.28, 0.62, 0.78, lit=0.45, marco=marco, prof=0.08)
        c.box(-w / 2 - 0.06, w / 2 + 0.06, -0.07, 0.0, zb, zb + hf, wall, sin="ubt")
        with c.frame(0, 0, 90):    # cumbrera hacia el interior
            c.tejado2(0.0, prof, -w / 2, w / 2, zb + hf, 0.6, teja, alero=0.2, alero_x=0.2, cursos=3, hastial=wall)


def casa_c():
    nuevo_modelo(); m = mats(); c = Cons(37)
    W, D, H = 8.5, 12.0, 7.0
    pared = "#ee96ab"; pared_alta = "#f7bfcb"; crema = "#fff1d6"; azul = "#3d86a8"; verde = "#2f7a6a"; hierro = "#1c1c22"
    hx, hy = W / 2, D / 2
    c.box(-hx, hx, -hy, hy, 0, H, pared, pared_alta)
    c.box(-hx - 0.08, hx + 0.08, -hy - 0.08, hy + 0.08, 0, 0.95, PAL["coralina"])
    c.box(-hx - 0.14, hx + 0.14, -hy - 0.14, hy + 0.14, 0.95, 1.07, mezcla(PAL["coralina"], "#ffffff", 0.2))
    esquineros(c, -hx, hx, -hy, hy, 1.07, 6.75, crema, g=0.34)
    c.box(-hx - 0.05, hx + 0.05, -hy - 0.05, hy + 0.05, 3.55, 3.75, crema)
    c.box(-hx - 0.25, hx + 0.25, -hy - 0.25, hy + 0.25, 6.7, 7.0, crema)
    # cubierta a dos aguas con la cumbrera a lo largo de Y
    with c.frame(0, 0, 90):
        c.tejado2(-hy + 0.4, hy, -hx, hx, 7.0, 2.1, PAL["teja"], alero=0.5, alero_x=0.0, cursos=8, hastial=pared_alta)
    # parapeto frontal con frontón ondulado y pináculos
    pf0, pf1 = -hy - 0.12, -hy + 0.3
    c.box(-hx - 0.2, hx + 0.2, pf0, pf1, 7.0, 8.15, pared, pared_alta, sin="u")
    c.box(-hx - 0.3, hx + 0.3, pf0 - 0.08, pf1 + 0.06, 8.15, 8.3, crema, sin="u")
    fr = [(-2.3, 8.3), (-1.8, 8.5), (-1.4, 8.62), (-1.1, 8.95), (-0.7, 9.25), (-0.3, 9.45), (0.0, 9.8), (0.3, 9.45), (0.7, 9.25), (1.1, 8.95), (1.4, 8.62), (1.8, 8.5), (2.3, 8.3)]
    c.extruir_xz(fr, pf0, pf1, pared_alta, cara_trasera=True)
    c.extruir_xz([(x * 0.86, 8.3 + (z - 8.3) * 0.8) for x, z in fr[2:-2]], pf0 - 0.06, pf0, crema)
    for x in (-hx - 0.1, hx + 0.1, -2.3, 2.3):
        pinaculo(c, x, pf0 + 0.2, 8.3, r=0.2, alto=1.0, col=crema, punta="#c8643b")
    # --- fachada frontal
    with c.frame(0, -hy, 0):
        puerta_arco(c, 0, 2.0, 3.3, marco=crema, madera="#4e2e18", f=0.26, prof=0.2)
        for u in (-3.05, 3.05):
            ventana(c, u, 1.25, 1.0, 1.75, lit=0.22, marco=crema, postigo=azul, reja=True)
        escudo(c, 0, 7.2, 0.62, 0.78, y=-0.12)
        # mirador de madera volado
        mx0, mx1, pm = -1.55, 1.55, 1.1
        zb, zt = 3.85, 6.5
        c.box(mx0 - 0.1, mx1 + 0.1, -pm - 0.1, 0.0, zb - 0.22, zb, tono(verde, 0.7), sin="ub")
        for x in (mx0, 0.0, mx1):
            consola(c, x - 0.08, 0.0, zb - 0.22, pm * 0.95, 0.8, 0.16, tono(verde, 0.6))
        c.box(mx0 - 0.04, mx1 + 0.04, -pm - 0.06, -pm + 0.06, zb, zb + 0.14, tono(verde, 0.8), sin="u")
        c.box(mx0 - 0.1, mx1 + 0.1, -pm - 0.1, -pm + 0.1, zt - 0.14, zt + 0.1, tono(verde, 0.8), sin="u")
        for xx in (mx0, mx1):
            c.box(xx - 0.08, xx + 0.08, -pm - 0.08, -pm + 0.08, zb, zt, verde, sin="u")
        for k in range(3):
            xa = mx0 + 0.08 + k * (mx1 - mx0 - 0.16) / 3; xb = mx0 + 0.08 + (k + 1) * (mx1 - mx0 - 0.16) / 3
            if c.rnd() < 0.3:
                c.pano(xa + 0.07, xb - 0.07, zb + 0.4, zt - 0.3, -pm - 0.02, LIT_CALIDO, mat=1)
            else:
                c.pano(xa + 0.07, xb - 0.07, zb + 0.4, zt - 0.3, -pm - 0.02, VID_OSC[0], col2=VID_OSC[1])
            c.box(xa, xa + 0.06, -pm - 0.05, -pm, zb + 0.3, zt - 0.2, tono(verde, 0.85), sin="ub")
            c.box(xa + 0.07, xb - 0.07, -pm - 0.05, -pm, zb + 0.34, zb + 0.42, verde, sin="ub")
            c.box(xa + 0.07, xb - 0.07, -pm - 0.05, -pm, zt - 0.34, zt - 0.26, verde, sin="ub")
        for xx, sg in ((mx0, -1), (mx1, 1)):
            c.poly([(xx + sg * 0.09, -pm, zb + 0.4), (xx + sg * 0.09, -0.1, zb + 0.4), (xx + sg * 0.09, -0.1, zt - 0.3), (xx + sg * 0.09, -pm, zt - 0.3)], VID_OSC[1], hacia=(sg, 0, 0))
        c.tejado4(mx0 - 0.1, mx1 + 0.1, -pm - 0.1, 0.0, zt + 0.1, 0.75, PAL["teja"], alero=0.2, cursos=4)
        # balconcillos de hierro con ventana alta
        for u in (-3.05, 3.05):
            ventana(c, u, 3.95, 0.9, 2.4, lit=0.3, marco=crema, postigo=azul, alfeizar=False)
            c.box(u - 0.9, u + 0.9, -0.62, 0.0, zb - 0.16, zb, tono(crema, 0.9), sin="ub")
            baranda(c, u - 0.9, u + 0.9, -0.58, zb, 0.9, hierro, pasamano=hierro, paso=0.22, r=0.03)
            for sx in (-1, 1):
                with c.frame(u + sx * 0.9, 0, 90):
                    baranda(c, -0.58, 0.0, 0.0, zb, 0.9, hierro, pasamano=hierro, paso=0.22, r=0.03)
                consola(c, u + sx * 0.65 - 0.08, 0.0, zb - 0.16, 0.55, 0.5, 0.14, tono(crema, 0.8))
            maceta(c, u, -0.58, zb + 0.9, r=0.18, flor="#ff5a7a")
    # --- costados y trasera
    for sx, rot in ((1, 90), (-1, -90)):
        with c.frame(sx * hx, 0, rot):
            for u in (-3.2, 0.2, 3.2):
                ventana(c, u, 1.3, 1.0, 1.6, lit=0.2, marco=crema, postigo=azul if u > 0 else None)
                ventana(c, u, 4.2, 1.0, 1.9, lit=0.25, marco=crema, postigo=azul)
    with c.frame(0, hy, 180):
        for u in (-2.6, 0.0, 2.6):
            ventana(c, u, 4.2, 1.0, 1.9, lit=0.2, marco=crema, postigo=azul)
        puerta_arco(c, 0, 1.1, 2.4, marco=crema, madera="#4e2e18", f=0.16)
    # buhardillas sobre las dos aguas
    xf = 3.1
    zr = 7.0 + 2.1 * (1 - xf / hx)
    for yy in (-1.6, 2.6):
        buhardilla(c, xf, yy, 90, zr, pared_alta, PAL["teja"])
        buhardilla(c, -xf, yy, -90, zr, pared_alta, PAL["teja"])
    chimenea(c, 0.0, 4.3, 8.9, 10.2, col="#e0cfb0")
    return c, m


def main():
    quienes = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else ["a", "b", "c"]
    notas = {
        "a": "balcon corrido de madera con balaustres torneados, portón con arco, postigos turquesa, farolas, maceteros, chimenea, teja. Cabe en una parcela de hilera 9 x 11 m.",
        "b": "casa esquinera con chaflán y puerta en la esquina, balcón en L, linterna en el techo piramidal, teja. Parcela de esquina 10 x 10 m (balcón sale 1.1 m).",
        "c": "casa de parapeto con frontón y pináculos, mirador de madera, balconcillos de hierro, buhardillas, escudo, teja a dos aguas con cumbrera hacia el fondo. Parcela de hilera 8.5 x 12 m.",
    }
    fn = {"a": casa_a, "b": casa_b, "c": casa_c}
    for q in quienes:
        c, m = fn[q]()
        terminar(c, f"casa_colonial_{q}", m, notas=notas[q], ao=(22, 0.5, 1.6), semilla=ord(q))


if __name__ == "__main__":
    main()
