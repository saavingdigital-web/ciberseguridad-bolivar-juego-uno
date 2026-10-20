"""Tres torres modernas de vidrio con siluetas distintas. Uso: ... -- a b c
a: escalonada con retranqueos y corona; b: volumen torcido con chaflanes y heliport; c: podio con doble torre unida por pasarela."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from arq_comun import *

VIDRIO = ("#27536b", "#5c9ab8")
VIDRIO2 = ("#1f4560", "#4a86a6")
CONC = "#aeaca6"
PF = 3.2


def luz_torre(c):
    r = c.rnd()
    return LIT_CIAN if r < 0.22 else (LIT_AMBAR if r < 0.7 else LIT_CALIDO)


def muro(c, u0, u1, z0, nflo, ncol, lit=0.2, pf=PF, aletas=True, vid=VIDRIO):
    """Muro cortina de una fachada (marco local, exterior -Y): antepecho, franja de vidrio, celdas encendidas y parteluces."""
    w = (u1 - u0) / ncol
    for i in range(nflo):
        z = z0 + i * pf
        v = vid if (i % 3) else VIDRIO2
        c.pano(u0, u1, z + 0.1, z + 1.0, -0.04, "#6d7b83", col2="#8a99a1")
        c.pano(u0, u1, z + 1.0, z + pf - 0.3, -0.04, v[0], col2=v[1])
        for k in range(ncol):
            if c.rnd() < lit:
                c.pano(u0 + k * w + 0.12, u0 + (k + 1) * w - 0.12, z + 1.1, z + pf - 0.4, -0.07, luz_torre(c), mat=1)
    if aletas:
        for k in range(ncol + 1):
            c.box(u0 + k * w - 0.07, u0 + k * w + 0.07, -0.34, 0.0, z0, z0 + nflo * pf, CONC, sin="ub")


def caras(c, w, d, fn, y_off=0.0):
    """Llama fn(ancho) en las cuatro fachadas de un volumen w x d centrado en el origen (en el marco de cada una)."""
    with c.frame(0, -d / 2, 0): fn(w, 0)
    with c.frame(w / 2, 0, 90): fn(d, 1)
    with c.frame(0, d / 2, 180): fn(w, 2)
    with c.frame(-w / 2, 0, -90): fn(d, 3)


def cuerpo(c, w, d, z0, nflo, ncol_w, ncol_d, lit=0.2, cx=0.0, cy=0.0, losa=True, vid=VIDRIO):
    h = nflo * PF
    with c.frame(cx, cy, 0):
        c.box(-w / 2, w / 2, -d / 2, d / 2, z0, z0 + h, vid[0], vid[1])
        if losa:
            for i in range(nflo + 1):
                c.box(-w / 2 - 0.12, w / 2 + 0.12, -d / 2 - 0.12, d / 2 + 0.12, z0 + i * PF - 0.14, z0 + i * PF + 0.1, CONC, sin="u")
        caras(c, w, d, lambda ww, k: muro(c, -ww / 2 + 0.2, ww / 2 - 0.2, z0, nflo, ncol_w if k % 2 == 0 else ncol_d, lit=lit, vid=vid))
    return z0 + h


def franjas_cian(c, w, d, z0, z1, cx=0.0, cy=0.0, g=0.16):
    for sx in (-1, 1):
        for sy in (-1, 1):
            c.box(cx + sx * w / 2 - g, cx + sx * w / 2 + g, cy + sy * d / 2 - g, cy + sy * d / 2 + g, z0, z1, LIT_CIAN, mat=1, sin="u")


def anillo_emisivo(c, w, d, z, color=LIT_CIAN, cx=0.0, cy=0.0, g=0.12, hh=0.1):
    pts = [(cx - w / 2 - g, cy - d / 2 - g), (cx + w / 2 + g, cy - d / 2 - g), (cx + w / 2 + g, cy + d / 2 + g), (cx - w / 2 - g, cy + d / 2 + g)]
    c.prisma(pts, z, z + hh, color, mat=1, tapa=False)


def terraza(c, w, d, z, cx=0.0, cy=0.0):
    """Borde de terraza con baranda de vidrio y jardineras."""
    for (x0, x1, y0, y1) in ((cx - w / 2, cx + w / 2, cy - d / 2, cy - d / 2 + 0.1), (cx - w / 2, cx + w / 2, cy + d / 2 - 0.1, cy + d / 2),
                              (cx - w / 2, cx - w / 2 + 0.1, cy - d / 2, cy + d / 2), (cx + w / 2 - 0.1, cx + w / 2, cy - d / 2, cy + d / 2)):
        c.box(x0, x1, y0, y1, z, z + 1.0, "#7fb4c9", "#a9d2e0", sin="u")
        c.box(x0 - 0.02, x1 + 0.02, y0 - 0.02, y1 + 0.02, z + 1.0, z + 1.08, "#3a3d42", sin="u")
    for k in range(4):
        x = cx - w / 2 + 1.5 + k * (w - 3.0) / 3
        c.box(x - 0.6, x + 0.6, cy - d / 2 + 0.4, cy - d / 2 + 1.0, z, z + 0.5, "#8a7a62", sin="u")
        c.cil(x, cy - d / 2 + 0.7, 0.55, z + 0.5, z + 1.2, "#3f8a45", "#8fd070", n=7, r2=0.2)


def azotea_equipo(c, w, d, z, cx=0.0, cy=0.0):
    c.box(cx - w / 2 + 0.6, cx - w / 2 + 3.0, cy + d / 2 - 2.8, cy + d / 2 - 0.6, z, z + 2.4, "#b9b7b0", "#d0cec6", sin="u")
    for k in range(3):
        x = cx - w / 2 + 1.0 + k * 1.5
        c.box(x - 0.55, x + 0.55, cy - 0.7, cy + 0.2, z, z + 0.7, "#c3c6ca", sin="u")
        c.cil(x, cy - 0.25, 0.26, z + 0.7, z + 0.75, "#2d3035", n=10)


def corona(c, w, d, z, cx=0.0, cy=0.0, letrero=True, h=3.0):
    """Coronación: marco de acero, letrero emisivo sin texto, antenas y baliza."""
    for sx in (-1, 1):
        for sy in (-1, 1):
            c.box(cx + sx * (w / 2 - 0.3) - 0.12, cx + sx * (w / 2 - 0.3) + 0.12, cy + sy * (d / 2 - 0.3) - 0.12, cy + sy * (d / 2 - 0.3) + 0.12, z, z + h, "#4a4f57", sin="u")
    c.box(cx - w / 2 + 0.1, cx + w / 2 - 0.1, cy - d / 2 + 0.1, cy + d / 2 - 0.1, z + h, z + h + 0.3, "#3a3d42", sin="u")
    if letrero:
        c.box(cx - w / 2 + 0.5, cx + w / 2 - 0.5, cy - d / 2 + 0.05, cy - d / 2 + 0.3, z + 0.6, z + 2.2, "#202428", sin="u")
        c.pano(cx - w / 2 + 0.8, cx + w / 2 - 0.8, z + 0.9, z + 1.9, cy - d / 2 + 0.04, LIT_AMBAR, mat=1)
        c.pano(cx - w / 2 + 0.8, cx + w / 2 - 0.8, z + 1.0, z + 1.1, cy - d / 2 + 0.035, LIT_CIAN, mat=1)
    antena(c, cx, cy, z + h + 0.3, alto=6.0, col="#9aa0a8")
    antena(c, cx + w / 2 - 1.0, cy + d / 2 - 1.0, z + h + 0.3, alto=3.2, col="#9aa0a8")
    antena(c, cx - w / 2 + 1.0, cy + d / 2 - 1.0, z + h + 0.3, alto=2.4, col="#9aa0a8")


def podio(c, w, d, h):
    """Podio comercial con vestíbulo de vidrio, columnas y marquesina."""
    c.box(-w / 2, w / 2, -d / 2, d / 2, 0, h, "#8f9298", "#b6b8bb")
    c.box(-w / 2 - 0.1, w / 2 + 0.1, -d / 2 - 0.1, d / 2 + 0.1, h - 0.3, h + 0.2, CONC, sin="u")
    with c.frame(0, -d / 2, 0):
        c.pano(-w / 2 + 0.8, w / 2 - 0.8, 0.5, h - 0.9, -0.05, "#2a5a78", col2="#5fa3c2")
        for k in range(int(w / 3.5)):
            u = -w / 2 + 1.5 + k * 3.5
            c.box(u - 0.2, u + 0.2, -0.5, 0.0, 0.0, h - 0.3, "#d0cec6", sin="ub")
            if c.rnd() < 0.5:
                c.pano(u + 0.3, u + 3.0, 0.8, h - 1.4, -0.07, LIT_CALIDO, mat=1)
        c.box(-w / 4, w / 4, -2.6, 0.0, 3.4, 3.7, "#e8e6df", sin="ub")
        c.box(-w / 4, w / 4, -2.64, -2.5, 3.7, 3.82, LIT_CIAN, mat=1, sin="u")
        c.box(-w / 4 + 0.1, -w / 4 + 0.25, -2.5, -2.35, 0.0, 3.4, "#6f7279", sin="u")
        c.box(w / 4 - 0.25, w / 4 - 0.1, -2.5, -2.35, 0.0, 3.4, "#6f7279", sin="u")
    for sx, rot in ((1, 90), (-1, -90)):
        with c.frame(sx * w / 2, 0, rot):
            for k in range(int(d / 4)):
                u = -d / 2 + 2.0 + k * 4.0
                c.pano(u - 1.2, u + 1.2, 1.0, h - 1.2, -0.05, LIT_CALIDO if c.rnd() < 0.25 else "#2a5a78", mat=1 if False else 0)


# ----------------------------------------------------------------- a: escalonada
def torre_a():
    nuevo_modelo(); m = mats(); c = Cons(41)
    podio(c, 24.0, 20.0, 6.4)
    terraza(c, 24.0, 20.0, 6.6) if False else None
    z = 6.4
    z = cuerpo(c, 19.0, 15.0, z, 4, 6, 5, lit=0.22)
    terraza(c, 23.0, 19.0, 6.6)
    anillo_emisivo(c, 19.0, 15.0, 6.4)
    z2 = cuerpo(c, 14.0, 11.0, z, 3, 5, 4, lit=0.22)
    terraza(c, 19.0, 15.0, z)
    anillo_emisivo(c, 14.0, 11.0, z)
    z3 = cuerpo(c, 9.0, 7.5, z2, 2, 3, 3, lit=0.25)
    terraza(c, 14.0, 11.0, z2)
    anillo_emisivo(c, 9.0, 7.5, z2, LIT_AMBAR)
    franjas_cian(c, 19.0, 15.0, 6.4, z, g=0.14)
    franjas_cian(c, 14.0, 11.0, z, z2, g=0.14)
    franjas_cian(c, 9.0, 7.5, z2, z3, g=0.12)
    corona(c, 9.0, 7.5, z3 + 0.2)
    azotea_equipo(c, 9.0, 7.5, z3 + 0.2)
    return c, m


# ----------------------------------------------------------------- b: torcida con chaflanes y heliport
def octagono(r, ch, giro):
    a = r - ch
    pts = [(-a, -r), (a, -r), (r, -a), (r, a), (a, r), (-a, r), (-r, a), (-r, -a)]
    cg, sg = math.cos(math.radians(giro)), math.sin(math.radians(giro))
    return [(x * cg - y * sg, x * sg + y * cg) for x, y in pts]


def torre_b():
    nuevo_modelo(); m = mats(); c = Cons(53)
    pf = 3.4
    # base de vestíbulo
    c.prisma(octagono(11.0, 3.8, 0), 0, 4.2, "#8f9298", "#b6b8bb")
    c.prisma(octagono(11.3, 3.8, 0), 4.2, 4.6, CONC)
    with c.frame(0, -11.0, 0):
        c.pano(-4.5, 4.5, 0.6, 3.5, -0.05, "#2a5a78", col2="#5fa3c2")
        c.box(-3.5, 3.5, -2.2, 0.0, 3.5, 3.8, "#e8e6df", sin="ub")
        c.box(-3.5, 3.5, -2.24, -2.1, 3.8, 3.92, LIT_CIAN, mat=1, sin="u")
    nflo = 9
    for i in range(nflo):
        z = 4.6 + i * pf
        giro = (i + 1) * 3.0
        r = 10.0 - 0.07 * i * 1.6
        oc = octagono(r, 3.6, giro)
        c.prisma(oc, z + 0.35, z + pf, VIDRIO[0], VIDRIO[1])
        ob = octagono(r + 0.25, 3.6, giro)
        c.prisma(ob, z, z + 0.35, CONC)
        if i % 3 == 0:
            c.prisma(octagono(r + 0.3, 3.6, giro), z + 0.35, z + 0.45, LIT_CIAN, mat=1, tapa=False)
        n = len(oc)
        for k in range(n):
            a, b = oc[k], oc[(k + 1) % n]
            ex, ey = b[0] - a[0], b[1] - a[1]
            ln = math.hypot(ex, ey)
            if ln < 2.0:
                continue
            nx, ny = ey / ln, -ex / ln
            nc = max(2, int(ln / 3.0))
            for q in range(nc):
                t0 = (q + 0.15) / nc; t1 = (q + 0.85) / nc
                p0 = (a[0] + ex * t0 + nx * 0.03, a[1] + ey * t0 + ny * 0.03); p1 = (a[0] + ex * t1 + nx * 0.03, a[1] + ey * t1 + ny * 0.03)
                lit = c.rnd() < 0.22
                col = luz_torre(c) if lit else VIDRIO2[0]
                cols = None if lit else [L(VIDRIO2[0]), L(VIDRIO2[0]), L(VIDRIO2[1]), L(VIDRIO2[1])]
                zz0, zz1 = z + 0.8, z + pf - 0.3
                c.poly([(p0[0], p0[1], zz0), (p1[0], p1[1], zz0), (p1[0], p1[1], zz1), (p0[0], p0[1], zz1)], col, mat=1 if lit else 0, hacia=(nx, ny, 0), cols=cols)
                # parteluz entre celdas
                mx0 = a[0] + ex * (q / nc); my0 = a[1] + ey * (q / nc)
                c.box(mx0 - 0.07 + nx * 0.14, mx0 + 0.07 + nx * 0.14, my0 - 0.07 + ny * 0.14, my0 + 0.07 + ny * 0.14, z + 0.35, z + pf, CONC, sin="u")
    zt = 4.6 + nflo * pf
    r = 10.0 - 0.07 * (nflo - 1) * 1.6
    # helipuerto sobre la azotea
    c.prisma(octagono(r + 0.4, 3.6, nflo * 3.0), zt, zt + 0.6, "#8f9298")
    c.cil(0, 0, 5.8, zt + 0.6, zt + 0.9, "#4a4f57", n=24, mat=0)
    c.cil(0, 0, 5.2, zt + 0.9, zt + 0.94, LIT_CIAN, n=24, mat=1, tapa=True) if False else None
    c.cil(0, 0, 5.25, zt + 0.9, zt + 0.95, LIT_CIAN, n=24, tapa=False, mat=1)
    c.cil(0, 0, 4.9, zt + 0.9, zt + 0.93, "#4a4f57", n=24)
    for (x0, x1, y0, y1) in ((-1.4, -0.9, -1.6, 1.6), (0.9, 1.4, -1.6, 1.6), (-1.0, 1.0, -0.25, 0.25)):
        c.box(x0, x1, y0, y1, zt + 0.93, zt + 0.99, LIT_AMBAR, mat=1, sin="u")
    for k in range(12):
        a = k * math.pi / 6
        c.box(math.cos(a) * 5.6 - 0.1, math.cos(a) * 5.6 + 0.1, math.sin(a) * 5.6 - 0.1, math.sin(a) * 5.6 + 0.1, zt + 0.9, zt + 1.15, LIT_AMBAR, mat=1, sin="u")
    # núcleo de servicio con equipos y mástil
    c.box(5.0, 8.0, 3.0, 6.5, zt + 0.6, zt + 2.6, "#b9b7b0", "#d0cec6", sin="u")
    c.box(-8.0, -6.0, -6.0, -3.0, zt + 0.6, zt + 1.4, "#c3c6ca", sin="u")
    antena(c, 6.5, 4.5, zt + 2.6, alto=5.0, col="#9aa0a8")
    # letrero emisivo sin texto en el vestíbulo
    c.box(-4.0, 4.0, -11.4, -11.15, 4.65, 6.1, "#202428", sin="u")
    c.pano(-3.6, 3.6, 4.85, 5.9, -11.42, LIT_AMBAR, mat=1)
    c.pano(-3.6, 3.6, 4.95, 5.05, -11.43, LIT_CIAN, mat=1)
    return c, m


# ----------------------------------------------------------------- c: podio y doble torre unida
def torre_c():
    nuevo_modelo(); m = mats(); c = Cons(67)
    podio(c, 25.0, 21.0, 7.0)
    # techo del podio: jardín y equipos
    c.box(-12.0, 12.0, -10.0, 10.0, 7.2, 7.35, "#5f8f4f", "#79ad62", sin="u")
    for k in range(4):
        c.cil(-9.0 + k * 6.0, -8.0, 1.0, 7.2, 8.4, "#3f8a45", "#8fd070", n=8, r2=0.4)
    # torres
    zA = cuerpo(c, 9.5, 12.0, 7.0, 6, 4, 5, lit=0.22, cx=-6.3)
    zB = cuerpo(c, 9.5, 12.0, 7.0, 9, 4, 5, lit=0.22, cx=6.3, vid=VIDRIO)
    franjas_cian(c, 9.5, 12.0, 7.0, zA, cx=-6.3, g=0.13)
    franjas_cian(c, 9.5, 12.0, 7.0, zB, cx=6.3, g=0.13)
    anillo_emisivo(c, 9.5, 12.0, zA, LIT_AMBAR, cx=-6.3)
    anillo_emisivo(c, 9.5, 12.0, zB, LIT_CIAN, cx=6.3)
    # pasarela de vidrio que une las torres
    zp = 7.0 + 3 * PF
    c.box(-1.6, 1.6, -4.5, 4.5, zp, zp + PF, VIDRIO[0], VIDRIO[1])
    c.box(-1.7, 1.7, -4.6, 4.6, zp - 0.15, zp + 0.1, CONC, sin="u")
    c.box(-1.7, 1.7, -4.6, 4.6, zp + PF - 0.1, zp + PF + 0.15, CONC, sin="u")
    with c.frame(0, -4.5, 0):
        c.pano(-1.5, 1.5, zp + 0.9, zp + PF - 0.3, -0.04, LIT_CALIDO, mat=1)
    with c.frame(0, 4.5, 180):
        c.pano(-1.5, 1.5, zp + 0.9, zp + PF - 0.3, -0.04, VIDRIO[0], col2=VIDRIO[1])
    c.box(-1.6, 1.6, -4.52, 4.52, zp + 0.35, zp + 0.5, LIT_CIAN, mat=1, sin="u")
    # coronas distintas
    corona(c, 9.5, 12.0, zA + 0.2, cx=-6.3, letrero=False, h=1.6)
    corona(c, 9.5, 12.0, zB + 0.2, cx=6.3, letrero=True, h=2.2)
    azotea_equipo(c, 9.5, 12.0, zA + 0.2, cx=-6.3)
    # letrero sobre el podio
    c.box(-6.0, 6.0, -9.8, -9.5, 7.35, 9.1, "#202428", sin="u")
    c.pano(-5.6, 5.6, 7.6, 8.8, -9.82, LIT_CIAN, mat=1)
    c.pano(-5.6, 5.6, 8.0, 8.2, -9.83, LIT_AMBAR, mat=1)
    return c, m


def main():
    quienes = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else ["a", "b", "c"]
    notas = {"a": "torre escalonada: podio, tres cuerpos con retranqueos y terrazas, franjas cian, corona con letrero emisivo sin texto y antenas.",
             "b": "torre de planta octogonal (chaflanes) con volumen torcido 3 grados por piso, anillos cian, heliport con luces y letrero emisivo sin texto.",
             "c": "podio con jardín y dos torres de 6 y 9 pisos unidas por pasarela de vidrio, coronas distintas, franjas cian/ámbar y letrero emisivo."}
    fn = {"a": torre_a, "b": torre_b, "c": torre_c}
    for q in quienes:
        c, m = fn[q]()
        terminar(c, f"torre_vidrio_{q}", m, notas=notas[q], ao=(18, 0.45, 3.0), semilla=ord(q), res=(760, 760))


if __name__ == "__main__":
    main()
