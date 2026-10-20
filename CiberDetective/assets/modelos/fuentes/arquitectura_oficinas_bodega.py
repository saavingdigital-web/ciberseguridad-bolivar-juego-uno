"""Oficinas a/b (paneles de concreto, azotea con equipos) y bodega del puerto (lámina). Uso: ... -- oa ob bo"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from arq_comun import *

VID = ("#294d63", "#5b96b3")


def ventanal(c, u0, u1, z, h, lit=0.2, marco="#6d7075", prof=0.18):
    c.box(u0 - 0.1, u1 + 0.1, -prof, 0.0, z - 0.1, z + h + 0.1, marco, sin="ubt")
    if c.rnd() < lit:
        c.pano(u0, u1, z, z + h, -prof - 0.01, LIT_AMBAR if c.rnd() < 0.5 else LIT_CALIDO, mat=1)
    else:
        c.pano(u0, u1, z, z + h, -prof - 0.01, VID[0], col2=VID[1])
    if u1 - u0 > 2.0:
        x = (u0 + u1) / 2
        c.pano(x - 0.025, x + 0.025, z, z + h, -prof - 0.02, marco)


def paneles(c, u0, u1, z0, z1, ancho, col, junta="#6b6a66", y=0.0):
    """Paneles prefabricados con juntas y pequeños relieves."""
    n = max(1, int(round((u1 - u0) / ancho)))
    w = (u1 - u0) / n
    for k in range(n):
        a = u0 + k * w
        t = 0.93 + 0.1 * c.rnd()
        c.box(a + 0.03, a + w - 0.03, -0.08, y, z0, z1, tono(col, t), tono(col, t * 1.07), sin="ub")


def rooftop(c, w, d, z, cx=0.0, cy=0.0, filas=2):
    pretil(c, cx - w / 2, cx + w / 2, cy - d / 2, cy + d / 2, z, h=0.9, col="#b8b4aa", tapa="#9e9a90")
    caja_escalera(c, cx + w / 2 - 4.5, cx + w / 2 - 1.5, cy + d / 2 - 4.2, cy + d / 2 - 1.5, z, alto=2.8)
    tanque(c, cx - w / 2 + 2.0, cy + d / 2 - 2.5, z, r=0.9, col="#2c4f7a")
    tanque(c, cx - w / 2 + 4.6, cy + d / 2 - 2.5, z, r=0.9, col="#d8d4cc")
    for f in range(filas):
        for k in range(4):
            x = cx - w / 2 + 3.0 + k * 2.0; y = cy - d / 2 + 1.8 + f * 2.2
            c.box(x - 0.8, x + 0.8, y - 0.55, y + 0.55, z, z + 0.85, "#c3c6ca", "#e2e4e6", sin="u")
            c.cil(x - 0.3, y, 0.3, z + 0.85, z + 0.9, "#2d3035", n=10)
            c.cil(x + 0.35, y, 0.3, z + 0.85, z + 0.9, "#2d3035", n=10)
    c.box(cx - 2.0, cx + 2.5, cy - 0.4, cy + 0.0, z + 0.0, z + 0.45, "#8f9298", sin="u")       # tubería con soportes
    for xx in (cx - 1.6, cx + 0.3, cx + 2.2):
        c.box(xx - 0.05, xx + 0.05, cy - 0.3, cy - 0.1, z, z + 0.45, "#5f6368", sin="u")
    antena(c, cx - w / 2 + 1.2, cy - d / 2 + 5.5, z, alto=4.5)
    c.box(cx + 3.0, cx + 5.0, cy - 1.2, cy + 0.2, z, z + 1.2, "#b9b7b0", sin="u")


def oficinas_a():
    nuevo_modelo(); m = mats(); c = Cons(71)
    W, D = 20.0, 14.0; zg = 4.6; pf = 3.6; N = 6
    H = zg + N * pf
    conc = "#b3b0a8"
    c.box(-W / 2, W / 2, -D / 2, D / 2, 0, H, conc, "#c9c6be")
    c.box(-W / 2 - 0.05, W / 2 + 0.05, -D / 2 - 0.05, D / 2 + 0.05, 0, 0.6, "#7b7973")
    # cornisa que sobresale + banda
    c.box(-W / 2 - 0.7, W / 2 + 0.7, -D / 2 - 0.7, D / 2 + 0.7, H, H + 0.55, "#c4c1b8", sin="u")
    c.box(-W / 2 - 0.4, W / 2 + 0.4, -D / 2 - 0.4, D / 2 + 0.4, H - 0.5, H, "#9f9c94", sin="u")
    for i in range(N):
        z = zg + i * pf
        c.box(-W / 2 - 0.12, W / 2 + 0.12, -D / 2 - 0.12, D / 2 + 0.12, z - 0.12, z + 0.14, "#96938b", sin="u")
    def cara(ww, k):
        u0, u1 = -ww / 2 + 0.2, ww / 2 - 0.2
        # planta baja: vitrinas y entrada en el frente
        for i in range(N):
            z = zg + i * pf
            paneles(c, u0, u1, z + 0.1, z + 1.0, 5.0, conc)
            n = max(3, int((u1 - u0) / 4.0))
            w = (u1 - u0) / n
            for q in range(n):
                ventanal(c, u0 + q * w + 0.45, u0 + (q + 1) * w - 0.45, z + 1.0, pf - 1.9, lit=0.2)
                c.box(u0 + q * w - 0.2, u0 + q * w + 0.2, -0.3, 0.0, z + 0.1, z + pf - 0.1, tono(conc, 1.05), sin="ub")
            c.box(u1 - 0.2, u1 + 0.2, -0.3, 0.0, z + 0.1, z + pf - 0.1, tono(conc, 1.05), sin="ub")
        paneles(c, u0, u1, 0.6, zg - 0.1, 5.0, tono(conc, 0.9))
        if k == 0:
            c.pano(-7.0, 7.0, 0.7, zg - 1.0, -0.12, "#2a5a78", col2="#5fa3c2")
            for q in range(5):
                c.box(-6.0 + q * 3.0 - 0.15, -6.0 + q * 3.0 + 0.15, -0.5, 0.0, 0.0, zg - 0.3, "#d0cec6", sin="ub")
            c.box(-7.2, 7.2, -2.4, 0.0, zg - 1.0, zg - 0.7, "#8f9298", sin="ub")
            c.box(-7.2, 7.2, -2.44, -2.3, zg - 1.0, zg - 0.9, LIT_CIAN, mat=1, sin="u")
            c.box(-1.2, 1.2, -0.3, 0.0, 0.0, 2.6, "#3a3d42", sin="ub")
            c.pano(-1.0, 1.0, 0.1, 2.5, -0.31, LIT_CALIDO, mat=1)
    caras_fn(c, W, D, cara)
    rooftop(c, W, D, H + 0.55)
    return c, m


def caras_fn(c, w, d, fn):
    with c.frame(0, -d / 2, 0): fn(w, 0)
    with c.frame(w / 2, 0, 90): fn(d, 1)
    with c.frame(0, d / 2, 180): fn(w, 2)
    with c.frame(-w / 2, 0, -90): fn(d, 3)


def oficinas_b():
    nuevo_modelo(); m = mats(); c = Cons(83)
    W, D = 22.0, 16.0; zg = 4.8; pf = 3.5; N = 8
    H = zg + N * pf
    conc = "#c2bdb0"
    c.box(-W / 2, W / 2, -D / 2, D / 2, 0, H, conc, "#d5d0c3")
    c.box(-W / 2 - 0.05, W / 2 + 0.05, -D / 2 - 0.05, D / 2 + 0.05, 0, 0.6, "#7b7973")
    c.box(-W / 2 - 0.5, W / 2 + 0.5, -D / 2 - 0.5, D / 2 + 0.5, H, H + 0.45, "#cfcabd", sin="u")
    c.box(-W / 2 - 0.25, W / 2 + 0.25, -D / 2 - 0.25, D / 2 + 0.25, H - 0.6, H, "#9b968a", sin="u")
    # núcleo de servicio en la esquina (más oscuro y más alto)
    cx0, cy0 = W / 2 - 2.4, D / 2 - 2.2
    c.box(cx0 - 2.4, cx0 + 2.4, cy0 - 2.2, cy0 + 2.2, H, H + 3.8, "#8f8a7e", "#aaa598", sin="u")
    c.box(cx0 - 2.6, cx0 + 2.6, cy0 - 2.4, cy0 + 2.4, H + 3.8, H + 4.05, "#6f6b61", sin="u")
    def cara(ww, k):
        u0, u1 = -ww / 2 + 0.3, ww / 2 - 0.3
        n = max(3, int((u1 - u0) / 2.75))
        w = (u1 - u0) / n
        for i in range(N):
            z = zg + i * pf
            c.box(-ww / 2 - 0.1, ww / 2 + 0.1, -0.2, 0.0, z - 0.05, z + 0.3, "#a29d92", sin="ub")
            for q in range(n):
                a = u0 + q * w
                ventanal(c, a + 0.55, a + w - 0.55, z + 0.55, pf - 1.2, lit=0.2, marco="#55585d", prof=0.25)
        for q in range(n + 1):                       # pilastras verticales profundas
            c.box(u0 + q * w - 0.25, u0 + q * w + 0.25, -0.55, 0.0, zg, H, "#d8d3c6", "#e6e1d4", sin="ub")
        c.box(u0 - 0.3, u1 + 0.3, -0.35, 0.0, 0.6, zg, "#a7a296", sin="ub")
        if k == 0:
            for q in range(n):
                a = u0 + q * w
                c.pano(a + 0.3, a + w - 0.3, 0.8, zg - 0.9, -0.1, LIT_CALIDO if c.rnd() < 0.3 else "#2a5a78", mat=1 if False else 0, col2="#5fa3c2")
            for q in range(n + 1):
                c.box(u0 + q * w - 0.3, u0 + q * w + 0.3, -1.0, -0.3, 0.0, zg - 0.4, "#d8d3c6", sin="ub")
            c.box(-4.0, 4.0, -3.2, 0.0, zg - 0.9, zg - 0.55, "#8a8f96", sin="ub")
            c.box(-4.0, 4.0, -3.26, -3.1, zg - 0.9, zg - 0.8, LIT_AMBAR, mat=1, sin="u")
            c.box(-3.8, -3.65, -3.15, -3.0, 0.0, zg - 0.9, "#555", sin="u") if False else None
    caras_fn(c, W, D, cara)
    rooftop(c, W - 6.0, D, H + 0.45, cx=-3.0)
    return c, m


# ----------------------------------------------------------------- bodega
def corrugado(c, u0, u1, z0, z1, col, col2, periodo=0.8, amp=0.07):
    n = int((u1 - u0) / periodo)
    p = (u1 - u0) / n
    for k in range(n):
        a = u0 + k * p
        for j, (xa, ya, xb, yb) in enumerate(((a, 0.0, a + p / 2, -amp), (a + p / 2, -amp, a + p, 0.0))):
            f = 1.0 if j == 0 else 0.84
            cl = [L(tono(col, f))] * 2 + [L(tono(col2, f))] * 2
            c.poly([(xa, ya, z0), (xb, yb, z0), (xb, yb, z1), (xa, ya, z1)], None, hacia=(0, -1, 0), cols=cl)


def tuberia_x(c, xa, xb, y, z, r=0.2, col="#d88a2a"):
    n = 10
    perfil = [(y + r * math.cos(2 * math.pi * i / n), z + r * math.sin(2 * math.pi * i / n)) for i in range(n)]
    with c.frame(xb, 0, 90):
        c.extruir_xz(perfil, 0.0, xb - xa, col, mezcla(col, "#ffffff", 0.25), cara_trasera=True, sin_base=False)


def bodega():
    nuevo_modelo(); m = mats(); c = Cons(97)
    W, D, Hm, Hp = 24.0, 16.0, 7.6, 2.9
    lam = "#8fa3ad"; lam2 = "#b4c3ca"
    c.box(-W / 2, W / 2, -D / 2, D / 2, 0, Hm, lam, lam2)
    c.box(-W / 2 - 0.05, W / 2 + 0.05, -D / 2 - 0.05, D / 2 + 0.05, 0, 0.9, "#7b7a76", sin="u")      # zócalo de concreto
    c.box(-W / 2 - 0.1, W / 2 + 0.1, -D / 2 - 0.1, D / 2 + 0.1, 0.9, 1.0, "#9a9993", sin="u")
    # techo a dos aguas, cumbrera a lo largo de X
    c.tejado2(-W / 2, W / 2, -D / 2, D / 2, Hm, Hp, "#6f858f", "#8ea4ae", alero=0.45, alero_x=0.3, cursos=9, hastial=lam2, cumbrera="#4d5a60", fascia="#4d5a60", lip=0.03)
    for k in range(5):                                      # ventiladores eólicos en la cumbrera
        x = -9.0 + k * 4.5
        c.cil(x, 0, 0.45, Hm + Hp, Hm + Hp + 0.5, "#c9ced1", "#e3e7e9", n=10)
        c.cil(x, 0, 0.6, Hm + Hp + 0.5, Hm + Hp + 0.95, "#aab1b6", n=10, r2=0.05)
    for k in range(4):                                      # tragaluces emisivos tenues en el faldón
        x = -8.0 + k * 5.4
        yl = -2.6
        zl = Hm + Hp * (1 - (abs(yl) / (D / 2))) - 0.0
        c.poly([(x - 1.0, yl, zl + 0.05), (x + 1.0, yl, zl + 0.05), (x + 1.0, yl + 1.4, zl + Hp * 1.4 / (D / 2) + 0.05), (x - 1.0, yl + 1.4, zl + Hp * 1.4 / (D / 2) + 0.05)],
               LIT_CALIDO if k % 2 == 0 else "#bfe4f0", mat=1 if k % 2 == 0 else 0, hacia=(0, -1, 1))
    # --- frente: corrugado, portones, ventilas
    with c.frame(0, -D / 2, 0):
        corrugado(c, -W / 2, W / 2, 1.0, Hm, lam, lam2)
        for i, x in enumerate((-7.0, 0.0, 7.0)):
            c.box(x - 3.0, x + 3.0, -0.25, 0.0, 0.0, 5.4, "#e0b830", sin="ub")                  # marco amarillo
            c.box(x - 2.7, x + 2.7, -0.3, -0.2, 0.0, 5.1, "#4f5a61", "#6f7c84", sin="ub")        # persiana
            for q in range(10):
                zz = 0.2 + q * 0.5
                c.pano(x - 2.7, x + 2.7, zz, zz + 0.07, -0.31, "#2f383d")
            c.box(x - 0.2, x + 0.2, -0.38, -0.3, 0.0, 0.35, "#e0b830", sin="ub")
            c.box(x - 0.2, x + 0.2, -0.3, -0.05, 5.5, 5.75, LIT_CALIDO if i != 1 else "#fff4c0", mat=1, sin="ub")
        for q in range(8):                                  # ventana alta corrida
            u = -10.0 + q * 2.9
            c.box(u - 0.8, u + 0.8, -0.12, 0.0, 6.3, 7.0, "#59656b", sin="ub")
            if c.rnd() < 0.25:
                c.pano(u - 0.7, u + 0.7, 6.4, 6.9, -0.13, LIT_CALIDO, mat=1)
            else:
                c.pano(u - 0.7, u + 0.7, 6.4, 6.9, -0.13, "#2a4252", col2="#4b7f99")
        for q in range(-3, 4, 1):                           # bolardos amarillos
            c.cil(q * 3.4, -1.3, 0.12, 0.0, 0.9, "#e0b830", n=6)
    # --- costado derecho (+X): puerta alta con escalera metálica
    with c.frame(W / 2, 0, 90):
        corrugado(c, -D / 2, D / 2, 1.0, Hm, lam, lam2)
        c.box(-1.5, 1.5, -0.1, 0.0, 3.2, 5.4, "#4f5a61", sin="ub")
        c.box(-0.6, 0.6, -0.12, -0.05, 3.2, 5.0, "#e0b830", sin="ub")
        plat_u = 0.0
        c.box(-2.0, 2.0, -2.0, 0.0, 3.0, 3.12, "#5a6168", sin="u")                               # descanso
        for sx in (-1, 1):
            c.box(sx * 2.0 - 0.03, sx * 2.0 + 0.03, -2.0, 0.0, 3.1, 4.1, "#e0b830", sin="u")
        c.box(-2.0, 2.0, -2.0, -1.94, 3.1, 4.1, "#e0b830", sin="u")
        # tramo de escalera: peldaños hacia el frente (u -> +)
        for s in range(14):
            u = 2.0 + s * 0.28
            c.box(u, u + 0.28, -1.7, -0.9, 3.0 - (s + 1) * 0.215, 3.0 - (s + 1) * 0.215 + 0.05, "#7b8187", sin="u")
        c.poly([(2.0, -1.7, 3.0), (2.0 + 14 * 0.28, -1.7, 0.0), (2.0 + 14 * 0.28, -1.65, 0.0), (2.0, -1.65, 3.0)], "#4f5560", hacia=(0, -1, 0))
        c.poly([(2.0, -0.9, 3.0), (2.0 + 14 * 0.28, -0.9, 0.0), (2.0 + 14 * 0.28, -0.95, 0.0), (2.0, -0.95, 3.0)], "#4f5560", hacia=(0, 1, 0))
        c.poly([(2.0, -1.7, 4.0), (2.0 + 14 * 0.28, -1.7, 1.0), (2.0 + 14 * 0.28, -1.7, 0.95), (2.0, -1.7, 3.95)], "#e0b830", hacia=(0, -1, 0))
        c.box(-3.0, -2.0, -1.2, -0.6, 0.0, 0.2, "#7b7a76", sin="u") if False else None
    # --- trasero (+Y) con tubería
    with c.frame(0, D / 2, 180):
        corrugado(c, -W / 2, W / 2, 1.0, Hm, lam, lam2)
        c.box(-1.5, 1.5, -0.12, 0.0, 0.0, 2.6, "#4f5a61", sin="ub")
        c.cil(0, 0, 0.1, 0.0, 0.0 + 0.001, "#000000", n=3) if False else None
    tuberia_x(c, -9.0, 9.0, D / 2 + 0.35, 5.8, r=0.22)
    for x in (-8.5, -4.0, 0.5, 5.0, 9.0 - 0.5):
        c.box(x - 0.06, x + 0.06, D / 2 + 0.1, D / 2 + 0.4, 5.2, 5.8, "#555a60", sin="u")
    c.cil(-9.0, D / 2 + 0.35, 0.22, 0.0, 5.8, "#d88a2a", "#f0aa4a", n=10)
    c.cil(-9.0, D / 2 + 0.35, 0.3, 0.9, 1.1, "#8a8f96", n=10)
    c.cil(-9.0, D / 2 + 0.35, 0.3, 4.2, 4.4, "#8a8f96", n=10)
    # --- costado izquierdo
    with c.frame(-W / 2, 0, -90):
        corrugado(c, -D / 2, D / 2, 1.0, Hm, lam, lam2)
        for q in range(3):
            u = -4.0 + q * 4.0
            c.box(u - 0.8, u + 0.8, -0.12, 0.0, 6.0, 6.8, "#59656b", sin="ub")
            c.pano(u - 0.7, u + 0.7, 6.1, 6.7, -0.13, LIT_CALIDO if q == 1 else "#2a4252", mat=1 if q == 1 else 0, col2=None if q == 1 else "#4b7f99")
    for sx, rot in ((1, 90), (-1, -90)):             # ventilas con lamas en los hastiales
        with c.frame(sx * (W / 2 + 0.02), 0, rot):
            for u in (-3.0, 0.0, 3.0):
                c.box(u - 0.9, u + 0.9, -0.1, 0.0, 8.2, 9.0, "#4d5a60", sin="ub")
                for q in range(4):
                    c.pano(u - 0.8, u + 0.8, 8.3 + q * 0.18, 8.3 + q * 0.18 + 0.06, -0.11, "#222a2e")
    return c, m


def main():
    quienes = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else ["oa", "ob", "bo"]
    notas = {"oa": "6 pisos sobre planta baja alta, paneles prefabricados con juntas, ventanales, cornisa volada y azotea con aires, tanques, caja de escalera, tubería y antena.",
             "ob": "8 pisos con pilastras de concreto profundas y ventanales, planta baja con soportales, núcleo de servicio más alto en la esquina y azotea equipada.",
             "bo": "nave de lámina corrugada con tres portones enrollables, ventanas altas, ventiladores eólicos, escalera metálica lateral y tubería en el fondo."}
    nom = {"oa": "oficinas_a", "ob": "oficinas_b", "bo": "bodega_puerto"}
    fn = {"oa": oficinas_a, "ob": oficinas_b, "bo": bodega}
    for q in quienes:
        c, m = fn[q]()
        terminar(c, nom[q], m, notas=notas[q], ao=(18, 0.5, 2.0), semilla=ord(q[0]))


if __name__ == "__main__":
    main()
