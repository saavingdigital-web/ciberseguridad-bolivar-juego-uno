"""
Familia vivos · gente: peatones (hombre_a/b, mujer_a/b, estudiante, vendedor, nino).

Convención para el animador del motor (shader de paso): pies en Z=0, cadera a Z=0.9 m (niño: 0.576 m),
piernas separadas (pierna izquierda x<0, derecha x>0, |x|<0.18), brazos relajados con |x|>=0.21 y Z entre 0.62 y 1.48,
torso dentro de |x|<=0.19. Frente a -Y.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from vivos_util import *

OSC = "#1a1a1a"


def tono(c, k):
    """Oscurece (k<0) o aclara (k>0) un color."""
    return mezcla(c, "#ffffff" if k > 0 else "#000000", abs(k))


def varilla(m, p0, p1, r, color, n=4):
    return m.tubo([p0, p1], [r, r], n=n, color=color, tapas=(True, True), fase=math.pi / 4)


def cabeza(m, hc, K, hs, piel, n=8, ojos=True, fino=False):
    """Cabeza redondeada (elipsoide con mandíbula) centrada en hc. Devuelve la altura de coronilla."""
    s = K * hs
    perfil = [(-0.135, 0.032), (-0.112, 0.074), (-0.062, 0.104), (0.0, 0.118), (0.06, 0.115), (0.11, 0.086), (0.137, 0.03)]
    if fino:
        perfil = [(-0.135, 0.03), (-0.125, 0.055), (-0.1, 0.08), (-0.06, 0.103), (-0.02, 0.114), (0.03, 0.118), (0.075, 0.108), (0.115, 0.082), (0.137, 0.03)]
    col = [mezcla(piel, "#000000", 0.08 * (1 - (e[0] + 0.135) / 0.27)) for e in perfil]
    m.rev([(e[0] * s, e[1] * s) for e in perfil], M=T(hc), n=n, esc=(1.0, 1.05), color=col, fase=math.pi / n)
    if ojos:
        yo = hc[1] - 0.108 * s - 0.004
        for sx in (-1, 1):
            m.poligono([(sx * 0.052 * s - 0.016 * s, yo, hc[2] + 0.004 * s), (sx * 0.052 * s + 0.016 * s, yo, hc[2] + 0.004 * s),
                        (sx * 0.052 * s + 0.016 * s, yo, hc[2] + 0.03 * s), (sx * 0.052 * s - 0.016 * s, yo, hc[2] + 0.03 * s)], "#17110d", PINTADO, (0, -1, 0))
        m.caja((0, hc[1] - 0.124 * s, hc[2] - 0.028 * s), (0.032 * s, 0.03 * s, 0.045 * s), tono(piel, -0.1), afil=0.7)
    return hc[2] + 0.137 * s


def pelo(m, estilo, hc, K, hs, color, n=8):
    s = K * hs
    sh = [(0.032, 0.122), (0.06, 0.128), (0.095, 0.113), (0.127, 0.07), (0.147, 0.03)]
    c1 = tono(color, 0.1)
    if estilo == "afro":
        sh = [(0.0, 0.17), (0.07, 0.2), (0.14, 0.19), (0.2, 0.13), (0.24, 0.05), (0.25, 0.02)]
    elif estilo == "rapado":
        sh = [(0.0, 0.118), (0.05, 0.12), (0.1, 0.1), (0.135, 0.06), (0.15, 0.03)]
    col = [mezcla(color, c1, k / (len(sh) - 1)) for k in range(len(sh))]
    m.rev([(a * s, b * s * 1.1) for a, b in sh], M=T((hc[0], hc[1] + 0.02 * s, hc[2])), n=n, esc=(1.0, 1.06), color=col, fase=math.pi / n)
    if estilo not in ("afro", "rapado"):   # nuca (la frente queda libre)
        m.rev([(-0.075 * s, 0.07 * s, color), (-0.02 * s, 0.1 * s, color), (0.04 * s, 0.105 * s, color)], M=T((hc[0], hc[1] + 0.05 * s, hc[2])), n=n, color=color, fase=math.pi / n)
    if estilo == "largo":
        m.tubo([(0, hc[1] + 0.07 * s, hc[2] + 0.02 * s), (0, hc[1] + 0.09 * s, hc[2] - 0.12 * s), (0, hc[1] + 0.085 * s, hc[2] - 0.30 * s)],
               [(0.12 * s, 0.05 * s), (0.125 * s, 0.055 * s), (0.10 * s, 0.045 * s)], n=n, color=[color, color, tono(color, 0.2)], tapas=(False, True))
    elif estilo == "cola":
        m.tubo([(0, hc[1] + 0.1 * s, hc[2] + 0.04 * s), (0, hc[1] + 0.2 * s, hc[2] - 0.07 * s), (0, hc[1] + 0.22 * s, hc[2] - 0.26 * s)],
               [0.035 * s, 0.05 * s, 0.022 * s], n=6, color=[color, color, tono(color, 0.2)], tapas=(False, True))
    elif estilo == "mono":
        m.rev([(-0.05 * s, 0.03 * s), (0.0, 0.065 * s), (0.05 * s, 0.03 * s)], M=T((0, hc[1] + 0.08 * s, hc[2] + 0.16 * s)), n=8, color=color)
    elif estilo == "trenzas":
        for sx in (-1, 1):
            m.tubo([(sx * 0.115 * s, hc[1] + 0.03 * s, hc[2] + 0.0), (sx * 0.15 * s, hc[1] + 0.05 * s, hc[2] - 0.12 * s), (sx * 0.16 * s, hc[1] + 0.05 * s, hc[2] - 0.26 * s)],
                   [0.038 * s, 0.034 * s, 0.02 * s], n=6, color=[color, color, tono(color, 0.15)], tapas=(False, True))
            m.caja((sx * 0.14 * s, hc[1] + 0.045 * s, hc[2] - 0.05 * s), (0.05 * s, 0.05 * s, 0.03 * s), "#e63946")


def gorra(m, hc, K, hs, color, visera=None):
    s = K * hs
    visera = visera or color
    m.rev([(0.03 * s, 0.13 * s, tono(color, -0.1)), (0.09 * s, 0.135 * s, color), (0.14 * s, 0.1 * s, tono(color, 0.15)), (0.162 * s, 0.03 * s, tono(color, 0.2))],
          M=T((hc[0], hc[1] + 0.012 * s, hc[2])), n=8, esc=(1.0, 1.06), color=color, fase=math.pi / 8)
    m.caja((0, hc[1] - 0.145 * s, hc[2] + 0.055 * s), (0.2 * s, 0.14 * s, 0.022 * s), visera, rot=(-12, 0, 0), afil=0.9)


def vueltiao(m, hc, K, hs):
    s = K * hs
    m.rev([(0.0, 0.31 * s, "#d8cba4"), (0.014 * s, 0.31 * s, "#efe6c6")], M=T((hc[0], hc[1], hc[2] + 0.075 * s)), n=11, esc=(1.0, 1.0), color="#efe6c6")
    m.rev([(0.0, 0.125 * s, "#e9dfbc"), (0.075 * s, 0.118 * s, "#efe6c6"), (0.115 * s, 0.098 * s, "#efe6c6"), (0.127 * s, 0.04 * s, "#efe6c6")],
          M=T((hc[0], hc[1], hc[2] + 0.075 * s)), n=8, color="#efe6c6")
    m.rev([(0.014 * s, 0.128 * s), (0.05 * s, 0.123 * s)], M=T((hc[0], hc[1], hc[2] + 0.075 * s)), n=10, color="#1c1a18", tapas=(False, False))


def brazos(m, K, c, manga, camisa, piel, n=7, guantes=None, pose=None, lados=(-1, 1)):
    """Brazos relajados. manga: 'corta' | 'larga' | 'sin'."""
    for s in lados:
        cx = 0.235
        P = [((cx, 0.0, 1.41), 0.062), ((cx + 0.015, 0.0, 1.28), 0.054), ((cx + 0.027, 0.0, 1.14), 0.048),
             ((cx + 0.033, -0.01, 0.98), 0.040), ((cx + 0.035, -0.012, 0.88), 0.034), ((cx + 0.035, -0.015, 0.80), (0.042, 0.03)),
             ((cx + 0.035, -0.02, 0.74), (0.03, 0.02))]
        cols = []
        pts, rad, corte = [], [], ()
        z_cut = {"corta": 1.19, "sin": 1.38, "larga": 0.90}[manga]
        out = []
        for i, (p, r) in enumerate(P):
            out.append((p, r))
        # insertar anillo duplicado en el corte de manga
        res = []
        for i in range(len(out) - 1):
            (p0, r0), (p1, r1) = out[i], out[i + 1]
            res.append((p0, r0, camisa if p0[2] > z_cut else piel))
            if p0[2] > z_cut >= p1[2]:
                t = (p0[2] - z_cut) / (p0[2] - p1[2])
                pm = tuple(p0[k] + (p1[k] - p0[k]) * t for k in range(3))
                rm = r0 if not isinstance(r0, tuple) else r0[0]
                rm1 = r1 if not isinstance(r1, tuple) else r1[0]
                rr = rm + (rm1 - rm) * t
                if manga == "larga":
                    rr *= 1.12
                res.append((pm, rr, camisa))
                corte_i = len(res) - 1
                res.append((pm, rr * (0.92 if manga == "larga" else 0.9), piel))
        res.append((out[-1][0], out[-1][1], piel))
        pts = [(s * x * c, y, z) for (x, y, z), r, col in [(a, b, d) for a, b, d in res]]
        pts = [(s * (x if i > 0 else x), y, z) for i, ((x, y, z)) in enumerate([(a[0][0] * c, a[0][1], a[0][2]) for a in res])]
        rad = [(r[0] * c, r[1] * c) if isinstance(r, tuple) else r * c for _, r, _ in res]
        cl = [col for _, _, col in res]
        ci = tuple(i for i in range(len(res) - 1) if res[i][0] == res[i + 1][0])
        # color de la manga con un poco de degradado
        cl = [tono(col, 0.0) for col in cl]
        m.tubo(pts, rad, n=n, color=cl, corte=ci, tapas=(True, True))


def piernas(m, K, c, pant, piel, tipo="largo", zapato="#222", n=8, calzado_sombra=True):
    n = min(n, 7)
    for s in (-1, 1):
        x = 0.095 * (0.5 + 0.5 * c)
        Z = {"largo": [(0.90, 0.088, 0.082, 0), (0.60, 0.072, 0.07, 0), (0.30, 0.064, 0.064, 0), (0.09, 0.052, 0.052, 0)],
             "corto": [(0.90, 0.088, 0.082, 0), (0.58, 0.074, 0.074, 0), (0.58, 0.07, 0.07, 1), (0.30, 0.064, 0.064, 1), (0.09, 0.052, 0.052, 1)],
             "capri": [(0.90, 0.088, 0.082, 0), (0.60, 0.072, 0.07, 0), (0.42, 0.066, 0.066, 0), (0.42, 0.064, 0.064, 1), (0.09, 0.052, 0.052, 1)]}[tipo]
        pts = [(s * x, 0.0, z) for z, _, _, _ in Z]
        rad = [(rx * c, ry * c) for _, rx, ry, _ in Z]
        cols = [tono(pant, 0.06 - 0.07 * i) if sk == 0 else piel for i, (_, _, _, sk) in enumerate(Z)]
        corte = tuple(i for i in range(len(Z) - 1) if Z[i][0] == Z[i + 1][0])
        m.tubo(pts, rad, n=n, color=cols, corte=corte, tapas=(False, False))
        zc = G([(0.0, "#101010"), (0.022, "#101010"), (0.03, zapato), (0.1, tono(zapato, 0.12))])
        rings = [anillo_rr(y, w * c, 0.0, h, 0.03, None, 2, xc=s * x) for (y, w, h) in [(0.085, 0.092, 0.085), (-0.06, 0.104, 0.07), (-0.185, 0.08, 0.04)]]
        m.anillos(rings, zc)


def torso(m, K, c, sexo, camisa, pant, n=10, cintura=1.0, grad=0.15):
    f = (1.0 if sexo == "h" else 0.0)
    hip = (0.168 * c, 0.102 * c)
    cin = ((0.155 + 0.0 * f) * c * cintura if sexo == "h" else 0.125 * c, 0.096 * c * (cintura if sexo == "h" else 1.0))
    pecho = ((0.19 if sexo == "h" else 0.165) * c, (0.112 if sexo == "h" else 0.118) * c)
    homb = ((0.205 if sexo == "h" else 0.185) * c, 0.098 * c)
    dobladillo = (hip[0] * 1.08, hip[1] * 1.06)
    sc = lambda col, z: mezcla(col, "#000000", grad * (1.47 - z) / 0.67)
    # (z, radios, color)
    rs = [(0.80, hip, pant), (0.88, hip, pant), (0.88, dobladillo, sc(camisa, 0.88)), (1.05, cin, sc(camisa, 1.05)),
          (1.28, pecho, sc(camisa, 1.28)), (1.42, homb, sc(camisa, 1.42)), (1.47, (0.13 * c, 0.078 * c), tono(camisa, 0.08))]
    pts = [(0, 0.0 if i != 4 or sexo == "h" else -0.012, z) for i, (z, _, _) in enumerate(rs)]
    m.tubo(pts, [r for _, r, _ in rs], n=n, color=[col for _, _, col in rs], corte=(1,), tapas=(False, True))


def cuello(m, piel, K, n=8):
    m.tubo([(0, 0.0, 1.43), (0, 0.0, 1.55)], [0.055, 0.05], n=n, color=[tono(piel, -0.12), piel])


def persona(nombre, p):
    nuevo_modelo()
    m = Malla()
    K = p.get("K", 1.0)
    hs = p.get("hs", 1.0)
    c = p.get("c", 1.0)
    piel = p.get("piel", "#c68a5e")
    sexo = p.get("sexo", "h")
    camisa, pant = p["camisa"], p["pant"]
    # se construye a escala 1 y al final se escala toda la malla (niño) con la transformación sobre el bmesh
    piernas(m, 1, c, pant, piel, p.get("tipo", "largo"), p.get("zapato", "#2a2a2e"), n=p.get("n", 8))
    torso(m, 1, c, sexo, camisa, pant, n=p.get("nt", 8), cintura=p.get("cintura", 1.0))
    brazos(m, 1, c, p.get("manga", "corta"), camisa, piel, n=6)
    cuello(m, piel, 1)
    hs1 = hs if K != 1.0 else 1.0
    hc = (0.0, 0.0, 1.485 + 0.135 * hs1)
    cabeza(m, hc, 1, hs1, piel)
    est = p.get("peinado", "corto")
    if est != "ninguno":
        pelo(m, est, hc, 1, hs1, p.get("pelo", "#1d1410"))
    if p.get("gorra"):
        gorra(m, hc, 1, hs1, p["gorra"], p.get("visera"))
    if p.get("vueltiao"):
        vueltiao(m, hc, 1, hs1)
    if p.get("gafas"):
        m.caja((0, -0.118 * hs1, hc[2] + 0.02 * hs1), (0.2 * hs1, 0.02, 0.04 * hs1), "#101214", afil=0.95)
    if p.get("bigote"):
        m.caja((0, -0.122 * hs1, hc[2] - 0.045 * hs1), (0.075 * hs1, 0.02, 0.018 * hs1), p.get("pelo", "#1d1410"))
    for a in p.get("acc", []):
        accesorio(m, a, p)
    if K != 1.0:   # escala uniforme (niño): z, x, y por K; cabeza ya fue agrandada por hs
        for v in m.bm.verts:
            v.co *= K
    notas = p.get("notas", "")
    extra = {"cadera_z": round(0.9 * K, 3), "convencion": "pies Z=0; piernas |x|<0.18 separadas por signo de x; brazos |x|>=0.21; torso |x|<=0.19"}
    terminar(m, "vivos", nombre, notas=notas, sucio=0.07, ao=(18, 0.5, 0.35), vistas=VISTAS_GENTE, res=(340, 460), cols=4, ang_agudo=50.0, extra=extra, margen=1.12)


def accesorio(m, a, p):
    camisa = p["camisa"]
    if a == "mochila":
        col = p.get("col_mochila", "#2a9d4f")
        m.caja((0, 0.2, 1.2), (0.32, 0.16, 0.42), col, bis=0.035, afil=0.92)
        for s in (-1, 1):
            m.caja((s * 0.1, -0.095, 1.31), (0.05, 0.02, 0.3), tono(col, -0.3))
            m.caja((s * 0.1, 0.115, 1.38), (0.05, 0.16, 0.04), tono(col, -0.3))
    elif a == "mochila_peq":
        col = p.get("col_mochila", "#ffd60a")
        m.caja((0, 0.18, 1.2), (0.3, 0.14, 0.34), col, bis=0.03)
        for s in (-1, 1):
            m.caja((s * 0.1, -0.095, 1.28), (0.05, 0.02, 0.24), tono(col, -0.3))
    elif a == "maletin":
        m.caja((0.3, -0.02, 0.56), (0.08, 0.38, 0.28), "#6b4423", bis=0.02)
        m.caja((0.3, -0.02, 0.73), (0.03, 0.14, 0.04), "#2b1b0e")
    elif a == "corbata":
        col = p.get("col_corbata", "#c1121f")
        m.caja((0, -0.116, 1.37), (0.05, 0.02, 0.05), col)
        m.poligono([(-0.025, -0.119, 1.35), (0.025, -0.119, 1.35), (0.035, -0.119, 1.12), (0, -0.119, 1.08), (-0.035, -0.119, 1.12)], col, PINTADO, (0, -1, 0))
    elif a == "bolso_cruzado":
        col = p.get("col_bolso", "#e0527a")
        varilla(m, (-0.12, -0.105, 1.45), (0.2, -0.04, 0.95), 0.014, tono(col, -0.2))
        m.caja((0.23, -0.04, 0.9), (0.09, 0.26, 0.21), col, bis=0.025)
        m.caja((0.23, -0.04, 0.99), (0.092, 0.27, 0.05), tono(col, -0.18), bis=0.01)
    elif a == "cartera":
        col = p.get("col_bolso", "#f2c230")
        m.caja((-0.3, -0.03, 0.56), (0.09, 0.3, 0.26), col, bis=0.03)
        m.tubo([(-0.3, -0.12, 0.7), (-0.3, -0.03, 0.77), (-0.3, 0.06, 0.7)], [0.012] * 3, n=4, color=tono(col, -0.3))
    elif a == "delantal":
        col = p.get("col_delantal", "#2a8a4f")
        m.caja((0, -0.115, 1.0), (0.31, 0.02, 0.52), col)
        m.caja((0, -0.128, 0.92), (0.2, 0.012, 0.12), tono(col, -0.2))
        for s in (-1, 1):
            varilla(m, (s * 0.1, -0.1, 1.27), (s * 0.075, -0.06, 1.44), 0.011, tono(col, -0.3))
    elif a == "bandeja":
        m.caja((0, -0.3, 1.02), (0.38, 0.34, 0.03), "#b58a55", bis=0.008)
        for s in (-1, 1):
            varilla(m, (s * 0.17, -0.3, 1.03), (s * 0.075, -0.07, 1.47), 0.011, "#3a2a1a")
            m.caja((s * 0.19, -0.3, 1.06), (0.015, 0.34, 0.05), "#8b6a3d")
        m.caja((0, -0.46, 1.06), (0.38, 0.015, 0.05), "#8b6a3d")
        for k, (x, y, w, h, col) in enumerate([(-0.11, -0.36, 0.11, 0.1, "#e63946"), (0.0, -0.4, 0.1, 0.09, "#ffd60a"), (0.11, -0.35, 0.1, 0.12, "#2ec4b6"), (-0.05, -0.27, 0.12, 0.08, "#ff8c1a")]):
            m.caja((x, y, 1.035 + h / 2), (w, 0.08, h), col)
    elif a == "chaleco":
        col = p.get("col_chaleco", "#1f2f5c")
        m.caja((0, -0.098, 1.2), (0.26, 0.03, 0.32), col, afil=0.9)


# ------------------------------------------------------------------ los siete
def todos(sel=None):
    modelos = {
        "peaton_hombre_a": dict(sexo="h", piel="#c68a5e", camisa="#dfe9f5", manga="larga", pant="#33373f", zapato="#1b1b1d",
                                pelo="#1d1410", peinado="corto", acc=["corbata", "maletin"], col_corbata="#c1121f",
                                notas="oficinista: camisa clara, corbata roja, maletin en la mano derecha"),
        "peaton_hombre_b": dict(sexo="h", piel="#9a6238", camisa="#f2c81c", manga="corta", pant="#2f4f8a", zapato="#f1f1ee", c=1.16, cintura=1.12,
                                pelo="#120d0a", peinado="rapado", gorra="#c1121f", bigote=True, acc=["mochila"], col_mochila="#222a38",
                                notas="hombre robusto: camiseta amarilla, gorra roja, mochila oscura, bigote"),
        "peaton_mujer_a": dict(sexo="m", piel="#e0ac69", camisa="#2fb5a8", manga="corta", pant="#3a5a8c", zapato="#f4f4f0", c=0.94,
                               pelo="#3a2418", peinado="largo", acc=["bolso_cruzado"], col_bolso="#e0527a",
                               notas="joven: pelo largo suelto, blusa turquesa, jeans, bolso cruzado rosa"),
        "peaton_mujer_b": dict(sexo="m", piel="#8d5524", camisa="#e0788c", manga="corta", pant="#ece9e1", zapato="#6b3a22", tipo="capri", c=1.02,
                               pelo="#171210", peinado="mono", gafas=True, acc=["cartera"], col_bolso="#f2c230",
                               notas="mujer: mono alto, gafas oscuras, blusa rosa, pantalon capri claro, cartera amarilla"),
        "estudiante": dict(sexo="m", piel="#f1c27d", camisa="#f6f6f2", manga="corta", pant="#1f2f5c", zapato="#16161a", c=0.95,
                           pelo="#15100c", peinado="trenzas", acc=["chaleco", "corbata", "mochila"], col_corbata="#f2c230", col_chaleco="#8e1b2e",
                           col_mochila="#2a9d4f", notas="uniforme escolar: blusa blanca, chaleco y corbata rojos, pantalon azul, mochila verde, trenzas"),
        "vendedor": dict(sexo="h", piel="#b87a4b", camisa="#efe3c2", manga="corta", pant="#4a4a52", zapato="#2a2018", c=1.06, cintura=1.08,
                         pelo="#1d1410", peinado="ninguno", vueltiao=True, acc=["delantal", "bandeja"], col_delantal="#2a8a4f",
                         notas="vendedor ambulante: sombrero vueltiao, guayabera, delantal verde y bandeja de dulces al cuello"),
        "nino": dict(sexo="h", piel="#a0673e", camisa="#e63946", manga="corta", pant="#2b4b8c", tipo="corto", zapato="#f1f1ee", K=0.64, hs=1.28,
                     c=0.95, pelo="#150f0b", peinado="corto", acc=["mochila_peq"], col_mochila="#ffd60a",
                     notas="nino 1.2 m: cadera a 0.576 m (proporcional); cabeza grande"),
    }
    for nombre, p in modelos.items():
        if sel is None or nombre in sel:
            persona(nombre, p)


if __name__ == "__main__":
    s = os.environ.get("VIVOS")
    todos(s.split(",") if s else None)
