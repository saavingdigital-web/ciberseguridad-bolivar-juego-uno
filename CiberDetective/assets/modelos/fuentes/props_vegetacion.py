"""Vegetación: palmera_a, palmera_b, arbol_frondoso_a, arbol_frondoso_b, buganvilia."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from props_util import *
from props_util import _hash

SOLO = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []


def quiere(n):
    return not SOLO or n in SOLO


# ------------------------------------------------------------------ palmeras
def fronda(m, base, ang, largo, subida, caida, ancho, c_base, c_punta, estaciones=8, caida_borde=0.55, tooth=0.62):
    """Fronda arqueada: espina en arco, borde dentado (folíolos) y pliegue en V. 3 vértices por estación."""
    a = math.radians(ang)
    ca, sa = math.cos(a), math.sin(a)
    espina = bez2((0, 0, 0), (largo * 0.5, 0, subida), (largo, 0, -caida), estaciones)
    secs = []
    cols = []
    for i, p in enumerate(espina):
        u = i / estaciones
        w = ancho * (math.sin(math.pi * min(1.0, u * 1.05 + 0.04)) ** 0.8 + 0.05)
        if i % 2 == 1:
            w *= tooth                 # muescas entre folíolos
        # dirección lateral (en el plano local: eje Y), caída del borde (pliegue V)
        borde = Vector((0, w, -w * caida_borde))
        bordeL = Vector((0, -w, -w * caida_borde))
        # tangente para inclinar un poco los folíolos hacia delante
        pf = Vector((w * 0.35, 0, 0))
        secs.append([p + bordeL + pf, p, p + borde + pf])
    # transformar a mundo: rotación Z=ang y traslación a base
    R = Matrix.Rotation(a, 3, "Z")
    secs_m = [[Vector(base) + R @ q for q in s] for s in secs]
    nest = len(secs_m)

    def color(i, p, n):
        e, j = divmod(i, 3)
        u = e / max(nest - 1, 1)
        c = mezcla(c_base, c_punta, u ** 0.9)
        if j == 1:
            return oscurecer(c, 0.78)        # nervio central más oscuro
        return c if e % 2 == 0 else oscurecer(c, 0.9)
    return p_loft(secs_m, m.pintado, color, suave=True, ang=70)


def palmera(nombre, alto, curva_x, curva_y, n_hojas, largo, semilla, tipo="a", **kw):
    m = nuevo()
    rnd = random.Random(semilla)
    partes = []
    # ---- tronco curvado con anillos
    if tipo == "a":
        pts = bez2((0, 0, 0), (curva_x * 0.12, curva_y * 0.2, alto * 0.55), (curva_x, curva_y, alto), 12)
    else:
        pts = bez3((0, 0, 0), (-curva_x * 0.3, -curva_y * 0.2, alto * 0.35), (curva_x * 1.1, curva_y * 0.6, alto * 0.7), (curva_x, curva_y, alto), 12)
    radios, colores = [], []
    for i, p in enumerate(pts):
        u = i / (len(pts) - 1)
        r = (0.52 - 0.30 * min(1, u * 3.2) + 0.0) if u < 0.3 else (0.22 - 0.045 * (u - 0.3) / 0.7)
        if u < 0.3:
            r = 0.22 + 0.30 * (1 - min(1, u / 0.3)) ** 2.2    # base ensanchada
        else:
            r = 0.22 - 0.04 * (u - 0.3) / 0.7
        anillo = (i % 2 == 0)
        radios.append(r * (1.12 if anillo else 0.90))
        base = mezcla("#8d7a5a", "#c2a97e", u)
        if u < 0.12:
            base = mezcla("#5a5a3a", base, u / 0.12)       # musgo en la base
        colores.append(oscurecer(base, 0.62) if not anillo else base)
    partes.append(p_tubo(pts, radios, 6, m.pintado, colores=colores, ang=60))
    cima = pts[-1]
    # ---- corona: bulbo verde y cocos
    partes.append(p_esfera(0.46, (cima.x, cima.y, cima.z - 0.05), m.pintado, "#4f6a2a", "#7da13c", esc=(1, 1, 0.8), seg=7, anillos=4))
    for k in range(4):
        a = k * 1.9 + 0.5
        partes.append(p_esfera(0.27, (cima.x + math.cos(a) * 0.5, cima.y + math.sin(a) * 0.5, cima.z - 0.5 - 0.06 * (k % 2)), m.pintado,
                               "#6d5a22", "#a58a3c", seg=6, anillos=4))
    # ---- frondas verdes
    angs = [(360.0 / n_hojas) * i + rnd.uniform(-10, 10) for i in range(n_hojas)]
    for i, a in enumerate(angs):
        L = largo * rnd.uniform(0.85, 1.15)
        alta = (i % 3 == 0)
        subida = rnd.uniform(1.8, 2.6) if alta else rnd.uniform(0.9, 1.6)
        caida = rnd.uniform(0.9, 1.5) if alta else rnd.uniform(1.5, 2.4)
        partes.append(fronda(m, (cima.x, cima.y, cima.z + 0.1), a, L, subida, caida, kw.get("ancho", 0.72) * rnd.uniform(0.9, 1.1),
                             "#245f29", kw.get("punta", "#7ab83e")))
    # flecha central (hoja nueva erguida)
    partes.append(p_cil(0.07, 1.3, (cima.x, cima.y, cima.z + 0.75), m.pintado, "#7fae3c", "#c8e07a", n=5, radio2=0.01))
    # frondas secas colgando
    for a in (rnd.uniform(0, 360), rnd.uniform(0, 360)):
        partes.append(fronda(m, (cima.x, cima.y, cima.z - 0.2), a, largo * 0.8, 0.2, 2.6, 0.55, "#7a5a2e", "#b69255", estaciones=7))
    terminar(partes, nombre, ao=True, rayos=14, fuerza_ao=0.55, dist_ao=1.6, sucio=0.06,
             notas=f"palmera de coco, altura {alto} m, copa ~{largo*2:.0f} m", res=(480, 640), yaw=30, pitch=26, margen=1.1)


# ------------------------------------------------------------------ árboles
def normales_desde(o, centro, mezcla_n=0.65):
    """Normales de copa: mezcla la normal propia con la dirección radial desde el centro (volumen suave, estilo pintado)."""
    me = o.data
    ns = []
    for v in me.vertices:
        d = (v.co - centro)
        d = d.normalized() if d.length > 1e-6 else v.normal
        ns.append(v.normal.lerp(d, mezcla_n).normalized())
    me.normals_split_custom_set_from_vertices(ns)


def copa_tejas(m, masas, n_tejas, semilla, oscuro, claro, claro_cima="#d9e66c", radio_t=(0.8, 1.15), suelo_oscuro=0.0,
               nucleo=None, lados=6, altura=0.34, tonos=None, sombra_abajo=0.45):
    """Copa de tejas de follaje superpuestas sobre un núcleo oscuro suave. Luz arriba, sombra abajo."""
    rnd = random.Random(semilla)
    L = [(Vector(c), r) for c, r, *_ in masas]
    zmin = min(c.z - r[2] for c, r in L)
    zmax = max(c.z + r[2] for c, r in L)
    cx = sum(c.x for c, r in L) / len(L); cy = sum(c.y for c, r in L) / len(L)
    cc = Vector((cx, cy, zmin + (zmax - zmin) * 0.42))
    partes = []
    # núcleo oscuro (rellena huecos y da la sombra interior)
    cn = nucleo or oscuro
    for j, (c, r) in enumerate(L):
        sd = masas[j][2] if len(masas[j]) > 2 else 2
        def fcore(i, p, n, b, c=c):
            th = max(0.0, min(1.0, (p.z - zmin) / (zmax - zmin)))
            return mezcla(oscurecer(cn, 0.55), cn, th)
        partes.append(p_masa(c, (r[0] * 0.97, r[1] * 0.97, r[2] * 0.97), m.pintado, fcore, subdiv=sd, n_bultos=0, semilla=semilla + j))
    pesos = [r[0] * r[1] + r[2] * r[0] for c, r in L]
    for t in range(n_tejas):
        c, r = rnd.choices(L, weights=pesos)[0]
        while True:
            d = Vector((rnd.uniform(-1, 1), rnd.uniform(-1, 1), rnd.uniform(-1, 1))).normalized()
            if d.z > -0.55 and (d.z > 0.1 or rnd.random() < 0.55):
                break
        pos = c + Vector((d.x * r[0], d.y * r[1], d.z * r[2]))
        nrm = Vector((d.x / r[0], d.y / r[1], d.z / r[2])).normalized()
        th = max(0.0, min(1.0, (pos.z - zmin) / (zmax - zmin)))
        lit = 0.5 + 0.5 * (0.6 * nrm.z + 0.4 * (pos - cc).normalized().z)
        k = suelo_oscuro + (1 - suelo_oscuro) * (0.30 * lit + 0.42 * th ** 0.8 + 0.28 * rnd.random())
        k = max(0.0, min(1.0, k - sombra_abajo * max(0.0, 0.35 - th)))
        ca = mezcla(oscuro, claro, k)
        if k > 0.70:
            ca = mezcla(ca, claro_cima, (k - 0.70) * 2.6)
        if tonos and rnd.random() < 0.25:
            ca = mezcla(ca, rnd.choice(tonos), 0.35)
        cb = oscurecer(mezcla(oscuro, claro, k * 0.55), 0.82)
        R = rnd.uniform(*radio_t)
        partes.append(p_teja(pos + nrm * 0.0, nrm, R, m.pintado, ca, cb, rnd, lados=lados, altura=altura))
    return partes


def raices(m, n, radio, alto, largo, color="#5a4533", color_alto="#7a6048", fase=0.3):
    out = []
    for k in range(n):
        a = fase + 2 * math.pi * k / n
        ca, sa = math.cos(a), math.sin(a)
        pts = [Vector((ca * radio * 0.4, sa * radio * 0.4, alto)),
               Vector((ca * (radio + largo * 0.45), sa * (radio + largo * 0.45), alto * 0.3)),
               Vector((ca * (radio + largo), sa * (radio + largo), -0.04))]
        out.append(p_tubo(bez2(*pts, 2), [0.3, 0.2, 0.09], 6, m.pintado, color, color_alto, tapas=False, ang=70))
    return out


def arbol_a():
    m = nuevo()
    partes = []
    tronco = bez2((0, 0, 0), (0.15, 0.05, 1.6), (0.1, 0, 3.4), 4)
    partes.append(p_tubo(tronco, [0.72, 0.46, 0.34, 0.3, 0.28], 8, m.pintado, "#4f3d2e", "#8a6f52", ang=60))
    partes += raices(m, 4, 0.38, 0.95, 0.6)
    for (dx, dy, dz) in ((1.5, 0.5, 4.0), (-1.3, -0.4, 3.9)):
        partes.append(p_tubo(bez2((0.1, 0, 2.3), (dx * 0.4, dy * 0.4, 3.0), (dx, dy, dz), 2), [0.17, 0.12, 0.08], 5, m.pintado, "#5a4533", "#7a6048", tapas=False))
    masas = [((0.0, 0.0, 5.0), (2.9, 2.8, 2.2), 2), ((2.0, 0.7, 4.1), (1.6, 1.5, 1.2), 1),
             ((-1.9, -0.5, 4.2), (1.7, 1.5, 1.2), 1), ((0.2, -1.9, 4.1), (1.5, 1.4, 1.1), 1)]
    partes += copa_tejas(m, masas, 82, 7, "#1a4a22", "#86bb3f", nucleo="#1d4f24", radio_t=(0.6, 0.92), altura=0.25, sombra_abajo=0.3)
    terminar(partes, "arbol_frondoso_a", ao=True, rayos=14, fuerza_ao=0.55, dist_ao=2.2, sucio=0.04,
             notas="árbol redondo de copa densa (mango/ceiba), ~7 m", res=(560, 560), yaw=30, pitch=24, margen=1.1)


def arbol_b():
    m = nuevo()
    partes = []
    base = bez2((0, 0, 0), (-0.1, 0.1, 1.2), (0.0, 0.0, 2.8), 4)
    partes.append(p_tubo(base, [0.76, 0.5, 0.4, 0.37, 0.35], 8, m.pintado, "#4a392c", "#8a7058", ang=60))
    partes += raices(m, 5, 0.42, 1.0, 0.75, fase=0.1)
    brazos = [((2.3, 0.4, 5.0), 0.2), ((-2.2, 0.9, 4.8), 0.2), ((0.3, -2.4, 4.9), 0.2), ((-0.6, 2.3, 5.2), 0.18)]
    for (x, y, z), r in brazos:
        partes.append(p_tubo(bez2((0, 0, 2.6), (x * 0.3, y * 0.3, 3.8), (x, y, z), 3), [0.3, 0.22, 0.14, 0.09], 5, m.pintado, "#5b4636", "#7d6650", tapas=False))
    masas = [((0, 0, 5.8), (3.7, 3.6, 1.7), 2), ((3.0, 0.6, 5.2), (2.2, 2.0, 1.1), 1),
             ((-2.9, 1.1, 5.2), (2.2, 2.1, 1.1), 1), ((0.3, -3.1, 5.3), (2.2, 2.0, 1.1), 1)]
    partes += copa_tejas(m, masas, 72, 21, "#235221", "#aacf48", nucleo="#25521f", radio_t=(0.75, 1.1), altura=0.25, sombra_abajo=0.3)
    terminar(partes, "arbol_frondoso_b", ao=True, rayos=14, fuerza_ao=0.55, dist_ao=2.4, sucio=0.04,
             notas="árbol de sombra tipo samán, copa ancha en sombrilla, ~8 m", res=(640, 520), yaw=28, pitch=22, margen=1.08)


def buganvilia():
    m = nuevo()
    partes = []
    partes.append(p_cil(0.8, 0.3, (0, 0, 0.15), m.pintado, "#6b4a35", "#8c6a4a", n=10, radio2=0.7))
    masas = [((0, 0, 1.0), (1.4, 1.3, 0.95), 2), ((1.0, 0.3, 0.7), (0.85, 0.85, 0.65), 1), ((-1.0, -0.2, 0.7), (0.85, 0.85, 0.65), 1)]
    partes += copa_tejas(m, masas, 52, 33, "#8f1450", "#ff4f9f", claro_cima="#ffc2e0", nucleo="#2f6a2a", radio_t=(0.38, 0.6),
                         tonos=["#ffb0d4", "#e8b830", "#2f7a30"], lados=5)
    terminar(partes, "buganvilia", ao=True, rayos=14, fuerza_ao=0.5, dist_ao=1.0, sucio=0.05,
             notas="mata de buganvilia magenta ~1.9 m", res=(480, 400), yaw=30, pitch=22, margen=1.15)


if quiere("palmera_a"):
    palmera("palmera_a", 9.0, 1.5, 0.3, 13, 4.5, 4, tipo="a")
if quiere("palmera_b"):
    palmera("palmera_b", 11.0, -1.3, 1.1, 12, 4.4, 9, tipo="b", ancho=0.62, punta="#9ccc48")
if quiere("arbol_frondoso_a"):
    arbol_a()
if quiere("arbol_frondoso_b"):
    arbol_b()
if quiere("buganvilia"):
    buganvilia()
