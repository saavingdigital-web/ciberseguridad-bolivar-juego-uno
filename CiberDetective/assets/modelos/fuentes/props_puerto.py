"""Playa y puerto: sombrilla_playa, contenedor_20ft (_rojo/_azul/_verde), grua_portico, bote_pesca, velero."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from props_util import *
SOLO = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []


def quiere(n):
    return not SOLO or n in SOLO


def inclinar(objs, rx=0.0, ry=0.0):
    M = Matrix.Rotation(math.radians(ry), 4, "Y") @ Matrix.Rotation(math.radians(rx), 4, "X")
    for o in objs:
        o.data.transform(M)
        o.data.update()


# ------------------------------------------------------------------ sombrilla de playa
def sombrilla():
    m = nuevo(); P = m.pintado; p = []
    inc = []
    inc.append(p_cil(0.03, 2.5, (0, 0, 1.25), P, "#e8e2d6", n=6))
    n = 12
    c1, c2 = "#e63946", "#fbf7ec"
    for i in range(n):
        a0, a1 = 2 * math.pi * i / n, 2 * math.pi * (i + 1) / n
        am = (a0 + a1) / 2
        def pt(r, z, a): return (math.cos(a) * r, math.sin(a) * r, z)
        c = c1 if i % 2 == 0 else c2
        verts = [pt(0, 2.8, am), pt(0.9, 2.62, a0), pt(0.9, 2.62, a1), pt(1.55, 2.2, a0), pt(1.55, 2.2, a1)]
        inc.append(p_malla(verts, [(0, 1, 2), (1, 3, 4, 2)], P, c, suave=False))
        # volante: pestaña en el borde
        verts2 = [pt(1.55, 2.2, a0), pt(1.62, 2.1, am), pt(1.55, 2.2, a1)]
        inc.append(p_malla(verts2, [(0, 1, 2)], P, oscurecer(c, 0.85), suave=False))
    inc.append(p_esfera(0.06, (0, 0, 2.84), P, "#c9a227", seg=6, anillos=4))
    inclinar(inc, 6, 9)
    p += inc
    p.append(p_cil(0.55, 0.22, (0, 0, 0.11), P, "#e3cf9f", "#f1e2b5", n=10, radio2=0.18))
    p.append(p_caja((1.3, 0.55, 0.04), (0.2, -1.0, 0.02), P, "#2a9d8f", rot=(0, 0, 15)))
    terminar(p, "sombrilla_playa", dist_ao=0.6, notas="sombrilla a rayas rojas/blancas, inclinada 9 grados, base de arena", res=(480, 460), yaw=30, pitch=22)


# ------------------------------------------------------------------ contenedor
def contenedor(sufijo, color, color_alto):
    m = nuevo(); P = m.pintado; p = []
    Lh, Wh, H = 3.03, 1.22, 2.59
    # costados acanalados (largo a lo largo de Y)
    N = 24
    for s in (-1, 1):
        secs = []
        for k in range(N * 2 + 1):
            y = -Lh + 2 * Lh * k / (N * 2)
            off = 0.05 if (k % 2 == 0) else -0.0
            if k % 4 in (1, 2):
                off = 0.05
            else:
                off = 0.0
            x = s * (Wh - 0.05 + off)
            secs.append([(x, y, 0.2), (x, y, H - 0.12)])
        p.append(p_loft(secs, P, color, color_alto, suave=False, invertir=(s < 0), z0=0, z1=H))
    # techo
    p.append(p_caja((2 * Wh - 0.1, 2 * Lh - 0.1, 0.08), (0, 0, H - 0.08), P, oscurecer(color, 0.8), color))
    for y in (-1.8, -0.6, 0.6, 1.8):
        p.append(p_caja((2 * Wh - 0.3, 0.1, 0.05), (0, y, H - 0.02), P, oscurecer(color, 0.7), suave=False))
    # marco
    for sx in (-1, 1):
        for sy in (-1, 1):
            p.append(p_caja((0.16, 0.16, H), (sx * (Wh - 0.08), sy * (Lh - 0.08), H / 2), P, oscurecer(color, 0.65), color, bisel=0.02))
            p.append(p_caja((0.2, 0.2, 0.16), (sx * (Wh - 0.1), sy * (Lh - 0.1), H - 0.08), P, "#2b2f35"))     # esquineros
            p.append(p_caja((0.2, 0.2, 0.16), (sx * (Wh - 0.1), sy * (Lh - 0.1), 0.08), P, "#2b2f35"))
        p.append(p_caja((0.12, 2 * Lh, 0.14), (sx * (Wh - 0.06), 0, H - 0.07), P, oscurecer(color, 0.7)))
        p.append(p_caja((0.12, 2 * Lh, 0.14), (sx * (Wh - 0.06), 0, 0.07), P, oscurecer(color, 0.6)))
    for sy in (-1, 1):
        p.append(p_caja((2 * Wh, 0.12, 0.14), (0, sy * (Lh - 0.06), H - 0.07), P, oscurecer(color, 0.7)))
        p.append(p_caja((2 * Wh, 0.12, 0.14), (0, sy * (Lh - 0.06), 0.07), P, oscurecer(color, 0.6)))
    # fondo ciego (atrás +Y)
    p.append(p_caja((2 * Wh - 0.2, 0.08, H - 0.3), (0, Lh - 0.1, H / 2), P, oscurecer(color, 0.85), color))
    # puertas (frente -Y)
    yf = -Lh + 0.06
    p.append(p_caja((2 * Wh - 0.2, 0.08, H - 0.3), (0, yf + 0.02, H / 2), P, oscurecer(color, 0.9), color))
    for x in (-0.5, -0.2, 0.2, 0.5):
        p.append(p_cil(0.035, H - 0.35, (x, yf - 0.08, H / 2), P, "#8d939a", "#c8ccd1", n=5))
    for x in (-0.5, 0.5):
        p.append(p_caja((0.14, 0.05, 0.3), (x, yf - 0.12, 1.15), P, "#555a61"))
        p.append(p_caja((0.04, 0.04, 0.9), (0, yf - 0.1, 0.9), P, "#333333") if False else p_caja((0.08, 0.05, 0.2), (x, yf - 0.12, 0.35), P, "#555a61"))
    p.append(p_caja((0.04, 0.05, H - 0.4), (0.0, yf - 0.06, H / 2), P, oscurecer(color, 0.5)))   # junta de puertas
    # candado y cadena
    p.append(p_caja((0.13, 0.07, 0.17), (0.0, yf - 0.16, 1.15), P, "#e9c46a", "#f6dd8f", bisel=0.01))
    p.append(p_tubo([(-0.05, yf - 0.16, 1.22), (0, yf - 0.2, 1.3), (0.05, yf - 0.16, 1.22)], 0.015, 4, P, "#b8bdc3", tapas=False))
    # placa blanca de identificación
    p.append(p_caja((0.04, 1.2, 0.35), (Wh + 0.0, -1.6, 2.2), P, "#f1f1e8") if False else p_caja((0.02, 1.6, 0.3), (Wh + 0.03, -1.4, 2.25), P, "#f1f1e8"))
    p.append(p_caja((0.02, 1.6, 0.3), (-Wh - 0.03, 1.4, 2.25), P, "#f1f1e8"))
    terminar(p, "contenedor_20ft" + sufijo, dist_ao=0.8, sucio=0.1, notas="contenedor 20 pies acanalado con puertas (frente -Y), largo en Y 6.06 m", res=(560, 440), yaw=-35, pitch=26, semilla=11)


# ------------------------------------------------------------------ casco por secciones
def casco(L, B, D, alza_proa, c_ext, c_int, c_borda, c_linea="#8a2a24", franja=None, n_est=9, grosor=0.07, quilla_alza=0.0, popa=0.82, linea_agua=0.3):
    """Casco abierto con proa a -Y. Devuelve (partes, función (t, u) -> punto exterior) para acoplar cubierta/equipo."""
    P = mats().pintado
    return None


def bote_pesca():
    m = nuevo(); P = m.pintado; p = []
    L, B, D = 6.8, 1.7, 0.95
    N = 10
    us = [-1, -0.75, -0.45, -0.15, 0, 0.15, 0.45, 0.75, 1]

    def secc(t, interior=False):
        # t=0 popa (+Y) ... t=1 proa (-Y)
        y = L / 2 - L * t
        hb = B / 2 * (0.86 if t < 0.05 else 1.0) * (1 - t ** 3.2) ** 0.6 + 0.02
        zt = D + 0.55 * t ** 2.2 + 0.1 * (1 - t)       # arrufo: proa alta
        kz = 0.12 + 0.6 * t ** 3 + 0.0
        g = 0.07
        pts = []
        for u in us:
            if interior:
                x = (hb - g) * u
                z = kz + g + (zt - kz - g) * abs(u) ** 1.7
                pts.append((x, y, z))
            else:
                x = hb * u
                z = kz + (zt - kz) * abs(u) ** 1.7
                pts.append((x, y, z))
        return pts

    ts = [i / (N - 1) for i in range(N)]
    ext = [secc(t) for t in ts]

    def col_ext(i, pp, n):
        zrel = pp.z
        if zrel < 0.55:
            return "#5b2a22"                       # fondo
        if zrel < 0.8:
            return "#f2f0e6"                        # franja blanca
        return "#2a7fba" if pp.y < 0 or True else "#2a7fba"
    p.append(p_loft(ext, P, lambda i, pp, n: (hex_a_lineal("#8a2a24") if pp.z < 0.35 + 0.4 * ((L / 2 - pp.y) / L) ** 2 else (hex_a_lineal("#f4f1e4") if pp.z < 0.62 + 0.4 * ((L / 2 - pp.y) / L) ** 2 else hex_a_lineal("#2a7fba"))),
                    fusionar=False, suave=True, ang=70))
    inte = [secc(t, True) for t in ts]
    p.append(p_loft(inte, P, "#c9a36a", "#e2c48f", invertir=True, suave=True, ang=70))
    # borda (cinta superior)
    borda_L = [ext[i][0] for i in range(N)]; borda_R = [ext[i][-1] for i in range(N)]
    for lado in (0, -1):
        e = [ext[i][lado] for i in range(N)]
        ii = [inte[i][lado] for i in range(N)]
        p.append(p_loft([[e[i], ii[i]] for i in range(N)], P, "#6a4a30", suave=False))
    # bancos y detalles
    for y, w in ((1.3, 1.5), (-0.2, 1.55), (-1.6, 1.3)):
        p.append(p_caja((w, 0.28, 0.06), (0, y, 0.72), P, "#a8783f", "#c9985a", bisel=0.01))
    p.append(p_caja((1.0, 0.5, 0.35), (0, 0.5, 0.35), P, "#e8e8e0", "#ffffff", bisel=0.02))    # hielera
    # motor fuera de borda en la popa
    ym = L / 2 + 0.12
    p.append(p_caja((0.5, 0.3, 0.55), (0, ym, 1.1), P, "#d62828", "#ef5350", bisel=0.03))
    p.append(p_caja((0.4, 0.1, 0.12), (0, ym - 0.2, 0.95), P, "#222222"))
    p.append(p_cil(0.07, 1.0, (0, ym + 0.05, 0.55), P, "#4a4f55", n=6))
    p.append(p_cil(0.14, 0.05, (0, ym + 0.05, 0.1), P, "#3a3f45", n=6, rot=(90, 0, 0)))
    p.append(p_caja((0.08, 0.28, 0.28), (0, ym + 0.05, 0.1), P, "#a9aebb"))
    p.append(p_caja((0.7, 0.12, 0.08), (0, ym - 0.12, 0.98), P, "#555a61"))                 # espejo/pletina
    p.append(p_tubo([(0, ym, 1.1), (0.0, ym + 0.5, 1.2)], 0.03, 4, P, "#333333"))
    # toldo de lona sobre 2 postes
    for y in (-0.9, 1.5):
        for x in (-0.65, 0.65):
            p.append(p_cil(0.03, 1.3, (x, y, 1.45), P, "#8a8f96", n=5))
    toldo = [[(-0.9, -1.1, 2.15), (0, -1.1, 2.3), (0.9, -1.1, 2.15)], [(-0.9, 1.7, 2.15), (0, 1.7, 2.3), (0.9, 1.7, 2.15)]]
    p.append(p_loft(toldo, P, "#f4a261", "#ffd166", suave=False))
    # boyas y cabo
    for x, y in ((-0.5, -2.4), (0.45, -2.5)):
        p.append(p_esfera(0.14, (x, y, 1.1), P, "#ff6b1a", seg=6, anillos=4))
    terminar(p, "bote_pesca", dist_ao=0.9, fuerza_ao=0.35, notas="lancha de pesca artesanal 6.8 m; quilla en Z=0, línea de flotación aprox. Z=0.35; proa a -Y", res=(600, 460), yaw=40, pitch=30, margen=1.15)


def velero():
    m = nuevo(); P = m.pintado; p = []
    L, B, D = 9.0, 2.9, 1.15
    N = 11
    us = [-1, -0.7, -0.35, 0, 0.35, 0.7, 1]

    def secc(t):
        y = L / 2 - L * t
        hb = B / 2 * (1 - t ** 2.6) ** 0.55 * (1.0 if t > 0.04 else 0.9) + 0.02
        zt = D + 0.45 * t ** 2.4
        kz = 0.1 + 0.75 * t ** 2.5
        return [(hb * u, y, kz + (zt - kz) * abs(u) ** 1.6) for u in us], hb, zt

    ts = [i / (N - 1) for i in range(N)]
    S = [secc(t) for t in ts]
    p.append(p_loft([s[0] for s in S], P,
                    lambda i, pp, n: hex_a_lineal("#2a5aa0") if pp.z > 0.9 + 0.5 * ((L / 2 - pp.y) / L) ** 2.4 else hex_a_lineal("#f7f7f2") if pp.z > 0.45 + 0.4 * ((L / 2 - pp.y) / L) ** 2.4 else hex_a_lineal("#b5342a"),
                    suave=True, ang=70))
    # cubierta
    cub = [[(-s[1] * 0.98, ts_y, s[2] + 0.01), (s[1] * 0.98, ts_y, s[2] + 0.01)] for s, ts_y in zip(S, [L / 2 - L * t for t in ts])]
    p.append(p_loft(cub, P, "#c9a36a", "#dcbc86", suave=False))
    # cabina
    p.append(p_caja((1.6, 2.6, 0.55), (0, 0.6, D + 0.28), P, "#f1efe6", "#ffffff", bisel=0.03))
    p.append(p_caja((1.62, 1.4, 0.2), (0, 0.9, D + 0.62), m.vidrio, "#7fb6d0"))
    p.append(p_caja((1.7, 2.7, 0.06), (0, 0.6, D + 0.58), P, "#d9d6c9"))
    # mástil y botavara
    p.append(p_cil(0.07, 11.0, (0, -0.8, D + 5.4), P, "#c9ced3", "#e9ecef", n=6))
    p.append(p_cil(0.045, 3.6, (0, 1.2, D + 1.35), P, "#c9ced3", n=5, rot=(90, 0, 0)))
    # vela mayor (curvada) y foque
    vm = []
    pts_ = [(-0.8 + 0.0, D + 1.4), (-0.8, D + 10.2)]
    rows = 6
    for r in range(rows + 1):
        h = r / rows
        yb = -0.9 + 0.0
        ycl = 2.9 * (1 - h)                       # largo de la baja disminuye
        z = D + 1.45 + h * 8.7
        bul = 0.35 * math.sin(math.pi * h * 0.9 + 0.1)
        vm.append([(0.0, -0.9, z), (bul, -0.9 + ycl * 0.55, z), (0.0, -0.9 + ycl + 0.0, z)])
    p.append(p_loft(vm, P, "#fbfbf3", "#f2eadb", suave=True, ang=90, fusionar=False))
    fo = []
    for r in range(rows + 1):
        h = r / rows
        z = D + 0.9 + h * 8.3
        ycl = 3.4 * (1 - h)
        fo.append([(0.0, -0.9 - 0.15 * h, z), (-0.28 * math.sin(math.pi * h * 0.9 + 0.1), -0.9 - ycl * 0.5 - 0.1, z), (0.0, -0.9 - ycl, z - ycl * 0.2 * 0)])
    # foque: ancla en proa
    fo = []
    for r in range(rows + 1):
        h = r / rows
        z = D + 0.8 + h * 8.8
        ycl = 3.6 * (1 - h)
        fo.append([(0, -0.9 - 0.05 * h, z), (0.25 * math.sin(math.pi * h * 0.9 + 0.1), -0.9 - ycl * 0.5, z - ycl * 0.1), (0, -0.9 - ycl, z - ycl * 0.35)])
    p.append(p_loft(fo, P, "#ffd166", "#fff0b8", suave=True, ang=90))
    # estays y baranda
    p.append(p_tubo([(0, -0.8, D + 10.7), (0, -3.6, D + 0.5)], 0.015, 4, P, "#a9aebb"))
    p.append(p_tubo([(0, -0.8, D + 10.7), (0, 3.6, D + 0.4)], 0.015, 4, P, "#a9aebb"))
    p.append(p_esfera(0.08, (0, -0.8, D + 10.95), m.emisivo, "#ff3b2f", seg=6, anillos=4))
    # quilla y timón
    p.append(p_caja((0.12, 1.4, 1.1), (0, -0.2, -0.0), P, "#2b3a55") if False else p_caja((0.1, 1.2, 0.8), (0, 0.2, 0.4), P, "#2b3a55"))
    p.append(p_caja((0.08, 0.6, 0.7), (0, L / 2 - 0.2, 0.55), P, "#2b3a55"))
    terminar(p, "velero", dist_ao=0.9, fuerza_ao=0.25, luz=(0.95, 1.1), notas="velero 9 m, casco blanco/azul, vela mayor y foque; proa a -Y; quilla en Z=0", res=(560, 640), yaw=50, pitch=18, margen=1.1)


# ------------------------------------------------------------------ grúa pórtico
def grua():
    m = nuevo(); P = m.pintado; p = []
    az, bl, gr = "#2a6fb0", "#f1f1ea", "#9aa3ad"
    H = 26.0
    X = 7.5; Y = 6.5
    for sx in (-1, 1):
        for sy in (-1, 1):
            p.append(p_caja((1.3, 1.3, H), (sx * X, sy * Y, H / 2 + 0.6), P, az, "#4b8bd0"))
            for k in range(2):
                p.append(p_cil(0.55, 0.5, (sx * X, sy * Y + (k - 0.5) * 1.0, 0.35), P, "#2b2f35", n=8, rot=(0, 90, 0)))
        p.append(p_caja((1.1, 2 * Y + 2, 0.7), (sx * X, 0, 0.55), P, "#3a3f45"))
        # diagonales de los marcos laterales
        for sg in (1, -1):
            ln = math.hypot(2 * Y, 16.0)
            ang = math.degrees(math.atan2(16.0, 2 * Y))
            p.append(p_caja((0.5, ln, 0.5), (sx * X, 0, 9.5), P, az, rot=(sg * ang, 0, 0)))
        p.append(p_caja((1.0, 2 * Y, 1.0), (sx * X, 0, 17.0), P, az))
    for sy in (-1, 1):
        p.append(p_caja((2 * X, 1.1, 1.1), (0, sy * Y, 17.0), P, az))
        p.append(p_caja((2 * X, 1.4, 1.5), (0, sy * Y, H + 0.1), P, bl))
    # cabina de máquinas y mástil
    p.append(p_caja((12.5, 8.5, 3.2), (0, 2.0, H + 2.4), P, bl, "#ffffff"))
    p.append(p_caja((4.0, 0.2, 1.0), (0, -2.3, H + 2.8), m.vidrio, "#7fb6d0"))
    # pluma (a -Y, sobre el agua) y contrapluma
    zb = H + 1.0
    p.append(p_caja((2.6, 46.0, 2.0), (0, -9.5, zb), P, bl, "#ffffff"))
    L1 = 24.0
    for s in (-1, 1):
        for k in range(10):
            y = -31.0 + k * 3.7
            a = 1 if k % 2 == 0 else -1
            p.append(p_caja((0.25, 4.0, 0.25), (s * 1.3, y + 1.8, zb), P, "#d1372f", rot=(a * 28, 0, 0)))
    p.append(p_caja((2.7, 3.0, 2.2), (0, -32.2, zb), P, "#d1372f"))
    # A-frame y tirantes
    for sx in (-1, 1):
        p.append(p_caja((0.7, 0.7, 11.5), (sx * 1.2, 2.0, zb + 5.5), P, az, rot=(0, 0, 0)))
        p.append(p_tubo([(sx * 1.2, 2.0, zb + 11.0), (sx * 1.2, -31.0, zb + 1.0)], 0.22, 4, P, "#cfd3d8", tapas=True))
        p.append(p_tubo([(sx * 1.2, 2.0, zb + 11.0), (sx * 1.2, 12.5, zb + 0.5)], 0.22, 4, P, "#cfd3d8", tapas=True))
    p.append(p_caja((3.4, 1.0, 0.7), (0, 2.0, zb + 11.4), P, az))
    p.append(p_esfera(0.35, (0, 2.0, zb + 12.2), m.emisivo, "#ff3b2f", seg=6, anillos=4))
    p.append(p_caja((2.6, 5.5, 3.0), (0, 10.5, zb), P, "#d1d4d8"))   # contrapeso
    # carro, cables, spreader y contenedor colgando
    yc = -20.0
    p.append(p_caja((3.4, 3.4, 1.4), (0, yc, zb - 1.6), P, "#e9b44c", "#f6cf62"))
    p.append(p_caja((2.2, 2.0, 1.8), (1.9, yc, zb - 3.2), P, bl))   # cabina del operador
    for dx, dy in ((-1.0, -2.0), (1.0, -2.0), (-1.0, 2.0), (1.0, 2.0)):
        p.append(p_tubo([(dx, yc + dy * 0.2, zb - 2.2), (dx * 1.1, yc + dy, 6.5)], 0.06, 4, P, "#222222", tapas=False))
    p.append(p_caja((2.6, 6.3, 0.5), (0, yc, 6.2), P, "#e9b44c"))
    p.append(p_caja((2.44, 6.06, 2.59), (0, yc, 4.6), P, "#b5342a", "#cf5042"))
    terminar(p, "grua_portico", dist_ao=3.0, rayos=10, fuerza_ao=0.45, sucio=0.05, notas="grúa pórtico de muelle ~39 m de alto, pluma de 44 m hacia -Y (agua); contenedor colgando incluido", res=(720, 560), yaw=-40, pitch=20, margen=1.0)


if quiere("sombrilla_playa"): sombrilla()
if quiere("contenedor_20ft_rojo"): contenedor("_rojo", "#b5342a", "#cf5042")
if quiere("contenedor_20ft_azul"): contenedor("_azul", "#2a5aa0", "#4b7fc4")
if quiere("contenedor_20ft_verde"): contenedor("_verde", "#2f7a4a", "#4ea36c")
if quiere("grua_portico"): grua()
if quiere("bote_pesca"): bote_pesca()
if quiere("velero"): velero()
