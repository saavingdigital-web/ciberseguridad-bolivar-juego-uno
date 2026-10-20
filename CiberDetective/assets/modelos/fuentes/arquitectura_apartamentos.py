"""Edificios de apartamentos (5-6 pisos) con balcones, tendederos, aires, tanque y antena. Uso: ... -- a b"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from arq_comun import *

CRIS = ("#243f52", "#4b7f99")


def ventana_mod(c, u, z, w, h, lit=0.2, marco="#e9e9e4", luz=None, vid=CRIS):
    c.box(u - w / 2 - 0.06, u + w / 2 + 0.06, -0.12, 0.0, z - 0.06, z + h + 0.06, marco, sin="ubt")
    if c.rnd() < lit:
        c.pano(u - w / 2, u + w / 2, z, z + h, -0.125, luz or lit_color(c), mat=1)
    else:
        c.pano(u - w / 2, u + w / 2, z, z + h, -0.125, vid[0], col2=vid[1])
    c.pano(u - 0.02, u + 0.02, z, z + h, -0.13, marco)
    c.box(u - w / 2 - 0.12, u + w / 2 + 0.12, -0.2, 0.0, z - 0.14, z - 0.06, tono(marco, 0.8), sin="ub")


def balcon(c, u0, u1, z, prof, col, baranda_col, tend=False, aire=False, planta=True):
    """Balcón de losa con antepecho de panel y pasamanos; opcionalmente tendedero."""
    c.box(u0, u1, -prof, 0.0, z - 0.2, z, col, sin="ub")
    h = 1.0
    c.box(u0, u1, -prof, -prof + 0.1, z, z + h, baranda_col, tono(baranda_col, 1.15), sin="u")
    for sx, x in ((0, u0), (1, u1 - 0.1)):
        c.box(x, x + 0.1, -prof + 0.1, 0.0, z, z + h, baranda_col, sin="ub")
    c.box(u0 - 0.04, u1 + 0.04, -prof - 0.03, -prof + 0.13, z + h, z + h + 0.07, tono(col, 0.8), sin="u")
    if tend:
        tendedero(c, u0 + 0.2, u1 - 0.2, -prof + 0.35, z, h=0.95)
    if planta and c.rnd() < 0.6:
        maceta(c, u1 - 0.45, -prof + 0.35, z, r=0.18, col="#c8643b")


def local_comercial(c, u0, u1, zb, h, t1, t2, nombre_col, lit):
    w = u1 - u0; cu = (u0 + u1) / 2
    c.box(u0, u1, -0.15, 0.0, zb, zb + h, "#59585a", sin="ub")
    c.box(u0 + 0.15, u1 - 0.15, -0.2, -0.1, 0.0, 0.5, "#6f6f6f", sin="ub")
    if lit:
        c.pano(u0 + 0.25, u1 - 0.25, zb + 0.55, zb + h - 0.25, -0.21, LIT_CALIDO, mat=1)
    else:
        c.pano(u0 + 0.25, u1 - 0.25, zb + 0.55, zb + h - 0.25, -0.21, "#2a4252", col2="#4b7f99")
    for k in range(1, 3):
        x = u0 + w * k / 3
        c.box(x - 0.03, x + 0.03, -0.24, -0.15, zb + 0.5, zb + h - 0.2, "#2a2a2c", sin="ub")
    toldo(c, u0 + 0.05, u1 - 0.05, zb + h + 0.05, 1.5, t1, t2, y=-0.1, franjas=6)
    c.box(cu - w * 0.3, cu + w * 0.3, -0.18, -0.1, zb + h + 0.3, zb + h + 0.78, nombre_col, mat=0, sin="ub")
    c.pano(cu - w * 0.27, cu + w * 0.27, zb + h + 0.42, zb + h + 0.66, -0.185, "#fff7d6", mat=1)


def azotea(c, W, D, z, pretil_h=1.0, col_p="#d9d4c8", escalera=True, tanques=1, ant=True, seed_aires=3):
    pretil(c, -W / 2, W / 2, -D / 2, D / 2, z, h=pretil_h, col=col_p)
    if escalera:
        caja_escalera(c, W / 2 - 4.0, W / 2 - 1.4, D / 2 - 3.8, D / 2 - 1.4, z, alto=2.6)
    for k in range(tanques):
        tanque(c, -W / 2 + 2.0 + k * 2.4, D / 2 - 2.6, z, r=0.85, alto=1.3, col=("#2c4f7a" if k % 2 == 0 else "#d8d4cc"))
    for k in range(seed_aires):
        x = -W / 2 + 2.0 + k * 1.6
        c.box(x - 0.5, x + 0.5, -D / 2 + 1.6, -D / 2 + 2.3, z, z + 0.6, "#c3c6ca", "#e0e2e4", sin="u")
        c.cil(x, -D / 2 + 1.95, 0.22, z + 0.6, z + 0.64, "#2d3035", n=10)
    if ant:
        antena(c, 0.5, 0.5, z, alto=5.5)
        antena(c, -W / 2 + 1.5, -D / 2 + 3.6, z, alto=3.0)
    # paneles solares (fila)
    for k in range(3):
        x = 1.2 + k * 1.3
        c.poly([(x, -1.5, z + 0.3), (x + 1.1, -1.5, z + 0.3), (x + 1.1, -0.3, z + 0.85), (x, -0.3, z + 0.85)], "#16304f", hacia=(0, -1, 1), cols=[L("#16304f")] * 2 + [L("#2a5a8a")] * 2)
        c.box(x + 0.02, x + 1.08, -1.5, -1.45, z, z + 0.3, "#777777", sin="u")


def apartamentos_a():
    nuevo_modelo(); m = mats(); c = Cons(5)
    W, D = 14.0, 12.0; zg = 4.0; pf = 3.0; N = 5
    H = zg + N * pf
    pared = "#f0dcae"; pared2 = "#f8ebc8"; conc = "#bdb9ae"
    c.box(-W / 2, W / 2, -D / 2, D / 2, 0, H, pared, pared2)
    c.box(-W / 2 - 0.05, W / 2 + 0.05, -D / 2 - 0.05, D / 2 + 0.05, 0, 0.5, "#8d8a82")
    for f in range(N + 1):    # cantos de losa
        z = zg + f * pf - 0.12
        c.box(-W / 2 - 0.08, W / 2 + 0.08, -D / 2 - 0.08, D / 2 + 0.08, z, z + 0.24, conc, sin="u")
    # pilastras laterales
    for sx in (-1, 1):
        c.box(sx * W / 2 - 0.3 + (0.3 if sx > 0 else 0) * 0, sx * W / 2 + 0.3, -D / 2 - 0.06, -D / 2 + 0.2, 0.5, H, tono(pared, 0.85), sin="u") if False else None
    azotea(c, W, D, H, tanques=2)
    with c.frame(0, -D / 2, 0):
        # locales de planta baja
        cols = [("#d9788c", "#fff3f5"), ("#3fa7a0", "#e9faf8"), ("#e8c55a", "#fff6d8")]
        xs = [-6.8, -2.2, 2.4, 6.8]
        for i in range(3):
            local_comercial(c, xs[i] + 0.1, xs[i + 1] - 0.1, 0.4, 2.7, cols[i][0], cols[i][1], tono(cols[i][0], 0.9), lit=(i != 1))
        c.box(-6.9, -6.7, -0.1, 0, 0.4, zg, tono(pared, 0.8), sin="ub")
        # pisos con balcones escalonados (alternan lado)
        for f in range(N):
            z = zg + f * pf
            lado = -1 if f % 2 == 0 else 1
            u0, u1 = (-6.6, -0.2) if lado < 0 else (0.2, 6.6)
            balcon(c, u0, u1, z + 0.1, 1.5, conc, ["#8ecae6", "#f2b8c6", "#b8e0a0", "#f6d58a", "#c9b8e6"][f], tend=(f % 2 == 1), aire=False)
            # ventanas: las del lado del balcón son puertas corredizas
            uc = (u0 + u1) / 2
            ventana_mod(c, uc - 1.6, z + 0.3, 1.5, 2.2, lit=0.25)
            ventana_mod(c, uc + 1.6, z + 0.3, 1.5, 2.2, lit=0.25)
            uo = -uc
            ventana_mod(c, uo, z + 0.9, 1.7, 1.4, lit=0.25)
            aire_acond(c, uo - 2.4 * lado * -1 * 0 + (2.3 * (-lado)), z + 1.0)
            aire_acond(c, uo + (-2.3 * (-lado)) * 0.0 + 0.0, z + 2.35, w=0.7, h=0.5) if f % 2 == 0 else None
    for sx, rot in ((1, 90), (-1, -90)):
        with c.frame(sx * W / 2, 0, rot):
            for f in range(N):
                z = zg + f * pf
                for u in (-3.2, 0.0, 3.2):
                    ventana_mod(c, u, z + 0.8, 1.2, 1.5, lit=0.2)
                if f % 2 == (0 if sx > 0 else 1):
                    aire_acond(c, 1.7, z + 1.2)
            ventana_mod(c, -2.5, 1.0, 1.2, 1.8, lit=0.3)
            ventana_mod(c, 2.5, 1.0, 1.2, 1.8, lit=0.3)
    with c.frame(0, D / 2, 180):
        for f in range(N):
            z = zg + f * pf
            for u in (-4.5, -1.5, 1.5, 4.5):
                ventana_mod(c, u, z + 0.8, 1.1, 1.4, lit=0.2)
        c.box(-1.0, 1.0, -0.1, 0, 0.0, 2.4, "#3b4047", sin="ub")
    return c, m


def apartamentos_b():
    nuevo_modelo(); m = mats(); c = Cons(9)
    W, D = 18.0, 11.0; zg = 3.8; pf = 3.0; N = 5          # 5 pisos + planta baja y ático retranqueado
    H = zg + N * pf
    pared = "#b9e0dc"; pared2 = "#d7f0ec"; conc = "#b4b1a8"; rosa = "#d9788c"
    c.box(-W / 2, W / 2, -D / 2, D / 2, 0, H, pared, pared2)
    c.box(-W / 2 - 0.05, W / 2 + 0.05, -D / 2 - 0.05, D / 2 + 0.05, 0, 0.5, "#8d8a82")
    for f in range(N + 1):
        z = zg + f * pf - 0.1
        c.box(-W / 2 - 0.06, W / 2 + 0.06, -D / 2 - 0.06, D / 2 + 0.06, z, z + 0.2, conc, sin="u")
    # ático retranqueado con pérgola
    z0 = H
    c.box(-W / 2 + 4.0, W / 2 - 1.0, -D / 2 + 3.0, D / 2 - 0.5, z0, z0 + 2.9, "#f4ecd6", "#fff7e6")
    c.box(-W / 2 + 3.8, W / 2 - 0.8, -D / 2 + 2.8, D / 2 - 0.3, z0 + 2.9, z0 + 3.15, conc, sin="u")
    # pretil del nivel inferior y terraza
    pretil(c, -W / 2, W / 2, -D / 2, D / 2, z0, h=1.0, col="#e9e4d8")
    for k in range(7):                                          # pérgola de listones sobre la terraza
        x = -W / 2 + 0.6 + k * 0.9
        c.box(x - 0.05, x + 0.05, -D / 2 + 0.4, -D / 2 + 3.0, z0 + 2.4, z0 + 2.5, "#7a4a2b", sin="u")
    for x in (-W / 2 + 0.6, -W / 2 + 3.4):
        c.box(x - 0.07, x + 0.07, -D / 2 + 0.4, -D / 2 + 0.55, z0, z0 + 2.4, "#7a4a2b", sin="u")
    tanque(c, -W / 2 + 1.8, 1.5, z0, r=0.8, col="#2c4f7a")
    tanque(c, -W / 2 + 1.8, 3.8, z0, r=0.8, col="#d8d4cc")
    antena(c, W / 2 - 2.5, 0.0, z0 + 3.15, alto=4.5)
    c.box(W / 2 - 3.6, W / 2 - 1.6, 1.0, 2.2, z0 + 3.15, z0 + 3.6, "#c3c6ca", sin="u")
    for k in range(3):
        x = -W / 2 + 4.5 + k * 1.5
        c.poly([(x, D / 2 - 1.2, z0 + 3.4), (x + 1.2, D / 2 - 1.2, z0 + 3.4), (x + 1.2, D / 2 - 2.1, z0 + 3.9), (x, D / 2 - 2.1, z0 + 3.9)], "#16304f", hacia=(0, -1, 1), cols=[L("#16304f")] * 2 + [L("#2a5a8a")] * 2)
    with c.frame(0, -D / 2 + 3.0, 0):          # ventanales del ático
        for u in (-2.0, 0.5, 3.0, 5.5):
            ventana_mod(c, u, z0 + 0.5, 1.8, 1.9, lit=0.4)
    with c.frame(W / 2 - 1.0, 0, 90):
        for u in (-1.5, 1.5):
            ventana_mod(c, u, z0 + 0.5, 1.6, 1.9, lit=0.4)
    with c.frame(0, -D / 2, 0):
        # planta baja: arcada de locales
        pil = [-8.6, -4.4, 0.0, 4.4, 8.6]
        for i, x in enumerate(pil):
            c.box(x - 0.3, x + 0.3, -1.2, -0.6, 0.0, zg - 0.1, "#e5dfd0", sin="u")
        c.box(-W / 2, W / 2, -1.25, 0.0, zg - 0.9, zg - 0.1, "#e5dfd0", sin="ub")
        c.box(-W / 2, W / 2, -1.25, -0.6, 0.0, 0.2, "#8d8a82", sin="ub")
        tc = [("#3d86a8", "#eaf4fa"), ("#d9788c", "#fff3f5"), ("#e8c55a", "#fff6d8"), ("#3fa7a0", "#e9faf8")]
        for i in range(4):
            u0, u1 = pil[i] + 0.4, pil[i + 1] - 0.4
            c.box(u0, u1, -0.1, 0.0, 0.0, zg - 0.9, "#3a3b3e", sin="ub")
            if c.rnd() < 0.7:
                c.pano(u0 + 0.2, u1 - 0.2, 0.5, zg - 1.2, -0.11, LIT_CALIDO, mat=1)
            else:
                c.pano(u0 + 0.2, u1 - 0.2, 0.5, zg - 1.2, -0.11, "#2a4252", col2="#4b7f99")
            toldo(c, u0, u1, zg - 1.0, 0.9, tc[i][0], tc[i][1], y=-0.6, franjas=4, caida=0.35)
        # balcones en columnas verticales a ambos extremos + ventanas centrales
        for f in range(N):
            z = zg + f * pf
            for u0, u1, col in ((-8.7, -4.4, "#f2b8c6"), (4.4, 8.7, "#8ecae6")):
                balcon(c, u0, u1, z + 0.1, 1.2, conc, col if f % 2 == 0 else tono(col, 0.85), tend=(f % 3 == 1 and u0 < 0), planta=True)
                ventana_mod(c, (u0 + u1) / 2 - 1.0, z + 0.3, 1.3, 2.2, lit=0.25)
                ventana_mod(c, (u0 + u1) / 2 + 1.3, z + 0.9, 1.1, 1.4, lit=0.25)
            for u in (-2.2, 2.2):
                ventana_mod(c, u, z + 0.8, 1.5, 1.5, lit=0.25)
            aire_acond(c, 0.0, z + 1.1, w=0.7, h=0.5)
        for u in (-4.4, 4.4):                                   # aletas verticales de concreto
            c.box(u - 0.15, u + 0.15, -1.3, 0.0, zg, H, rosa, tono(rosa, 1.1), sin="ub")
    for sx, rot in ((1, 90), (-1, -90)):
        with c.frame(sx * W / 2, 0, rot):
            for f in range(N):
                z = zg + f * pf
                for u in (-2.8, 0.0, 2.8):
                    ventana_mod(c, u, z + 0.8, 1.2, 1.5, lit=0.2)
                if f % 2 == 1:
                    aire_acond(c, 1.4, z + 1.2)
            ventana_mod(c, -2.2, 1.0, 1.2, 1.8, lit=0.3)
            ventana_mod(c, 2.2, 1.0, 1.2, 1.8, lit=0.3)
    with c.frame(0, D / 2, 180):
        for f in range(N):
            z = zg + f * pf
            for u in (-6.0, -3.0, 0.0, 3.0, 6.0):
                ventana_mod(c, u, z + 0.8, 1.1, 1.4, lit=0.2)
            tendedero(c, -7.5, -4.5, -0.9, z + 0.1) if f % 2 == 0 else None
    return c, m


def main():
    quienes = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else ["a", "b"]
    notas = {"a": "5 pisos sobre planta baja de locales con toldo, balcones escalonados que alternan lado, tendederos, aires, tanques, antenas y paneles en azotea.",
             "b": "5 pisos con arcada comercial, balcones en columnas laterales con aletas, ático retranqueado con pérgola, tanques, antena y paneles."}
    fn = {"a": apartamentos_a, "b": apartamentos_b}
    for q in quienes:
        c, m = fn[q]()
        terminar(c, f"apartamentos_{q}", m, notas=notas[q], ao=(20, 0.5, 2.0), semilla=ord(q))


if __name__ == "__main__":
    main()
