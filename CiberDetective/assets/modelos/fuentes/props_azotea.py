"""Equipos de azotea: ac_unidad_b, tanque_agua, tanque_agua_b, antena_celular, parabolica, panel_solar_fila, caja_escalera, chimenea, tendedero."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from props_util import *
SOLO = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []


def quiere(n):
    return not SOLO or n in SOLO


def ac_b():
    m = nuevo(); P = m.pintado; p = []
    p.append(p_caja((1.7, 0.7, 0.9), (0, 0, 0.62), P, "#c9ccd0", "#eceeef", bisel=0.03))
    p.append(p_caja((1.8, 0.8, 0.06), (0, 0, 1.1), P, "#8d9299", bisel=0.02))
    for x in (-0.42, 0.42):
        p.append(p_cil(0.3, 0.05, (x, -0.36, 0.7), P, "#1d2023", n=10, rot=(90, 0, 0)))
        p.append(p_cil(0.1, 0.07, (x, -0.38, 0.7), P, "#5b6068", n=6, rot=(90, 0, 0)))
        for k in range(2):
            p.append(p_caja((0.62, 0.03, 0.025), (x, -0.375, 0.45 + k * 0.5), P, "#3a3e44"))
    for x in (-0.75, 0.75):
        p.append(p_caja((0.1, 0.8, 0.17), (x, 0, 0.085), P, "#555a61"))
    p.append(p_caja((0.3, 0.28, 0.2), (0.65, 0.45, 0.5), P, "#9aa0a7", bisel=0.02))
    p.append(p_cil(0.05, 0.9, (-0.6, 0.45, 0.45), P, "#d8d8d8", n=6))
    p.append(p_caja((0.06, 0.03, 0.04), (0.7, -0.36, 1.0), m.emisivo, "#ffb020"))
    terminar(p, "ac_unidad_b", dist_ao=0.5, notas="aire acondicionado de 2 ventiladores", res=(480, 360))


def tinaco(nombre, color, tapa_c, metal=False):
    m = nuevo(); P = m.pintado; p = []
    clar = mezcla(color, "#ffffff", 0.2)
    if not metal:
        p.append(p_caja((1.8, 1.8, 0.1), (0, 0, 0.05), P, "#a9a7a2", bisel=0.03))
        p.append(p_cil(0.7, 1.4, (0, 0, 0.8), P, color, clar, n=16, radio2=0.62))
        for z in (0.4, 0.8, 1.2):
            p.append(p_cil(0.72 - (z - 0.1) * 0.06, 0.07, (0, 0, z), P, oscurecer(color, 0.7), n=16, tapas=False))
        p.append(p_esfera(0.62, (0, 0, 1.5), P, color, clar, esc=(1, 1, 0.3), seg=14, anillos=4))
        p.append(p_cil(0.26, 0.14, (0, 0, 1.72), P, tapa_c, n=12, radio2=0.22))
        p.append(p_cil(0.07, 0.4, (0.72, 0, 0.35), P, "#d8d8d8", n=8, rot=(0, 90, 0)))
        p.append(p_cil(0.07, 0.9, (0.9, 0, 0.5), P, "#d8d8d8", n=8))
    else:
        for x in (-0.55, 0.55):
            for y in (-0.55, 0.55):
                p.append(p_caja((0.1, 0.1, 1.5), (x, y, 0.75), P, "#5b6068", bisel=0.01))
        p.append(p_caja((1.4, 0.08, 0.08), (0, -0.55, 0.7), P, "#5b6068"))
        p.append(p_caja((1.4, 0.08, 0.08), (0, 0.55, 0.7), P, "#5b6068"))
        p.append(p_caja((1.3, 1.3, 0.08), (0, 0, 1.5), P, "#4a4f55"))
        p.append(p_cil(0.78, 1.2, (0, 0, 2.15), P, color, clar, n=16))
        for z in (1.8, 2.15, 2.5):
            p.append(p_cil(0.8, 0.06, (0, 0, z), P, "#7d868f", n=16, tapas=False))
        p.append(p_cil(0.78, 0.2, (0, 0, 2.85), P, tapa_c, n=16, radio2=0.35))
        p.append(p_cil(0.2, 0.1, (0, 0, 3.0), P, "#44484e", n=10))
        p.append(p_caja((0.06, 0.06, 2.0), (0.82, 0.3, 1.0), P, "#9aa0a6"))
        for k in range(6):
            p.append(p_caja((0.04, 0.3, 0.04), (0.82, 0.3, 0.3 + k * 0.4), P, "#9aa0a6"))
    terminar(p, nombre, dist_ao=0.8, notas="tanque de agua de azotea", res=(480, 480))


def antena():
    m = nuevo(); P = m.pintado; p = []
    h = 9.0
    p.append(p_caja((2.0, 1.6, 0.18), (0, 0, 0.09), P, "#a9a7a2", bisel=0.03))
    p.append(p_caja((1.0, 0.7, 1.1), (0.4, 0.3, 0.73), P, "#8d939a", "#b4b9bf", bisel=0.03))
    for a in (90, 210, 330):
        x, y = math.cos(math.radians(a)) * 0.38, math.sin(math.radians(a)) * 0.38
        p.append(p_cil(0.07, h, (x, y, 0.18 + h / 2), P, "#9aa1a9", "#d3d8dd", n=6))
    for z in range(1, 9):
        for a in (90, 210, 330):
            a2 = a + 120
            x0, y0 = math.cos(math.radians(a)) * 0.38, math.sin(math.radians(a)) * 0.38
            x1, y1 = math.cos(math.radians(a2)) * 0.38, math.sin(math.radians(a2)) * 0.38
            p.append(p_tubo([(x0, y0, z), (x1, y1, z)], 0.035, 4, P, "#b6bcc3", tapas=False))
    p.append(p_cil(0.5, 0.1, (0, 0, h + 0.2), P, "#6a7078", n=3))
    for a in (90, 210, 330):
        ca, sa = math.cos(math.radians(a)), math.sin(math.radians(a))
        p.append(p_caja((0.5, 0.14, 1.7), (ca * 0.85, sa * 0.85, h - 0.7), P, "#f1f2f0", "#d5d8d9", rot=(0, 0, a - 90), bisel=0.02))
        p.append(p_tubo([(ca * 0.4, sa * 0.4, h - 0.3), (ca * 0.8, sa * 0.8, h - 0.3)], 0.04, 4, P, "#6a7078", tapas=False))
        p.append(p_tubo([(ca * 0.4, sa * 0.4, h - 1.2), (ca * 0.8, sa * 0.8, h - 1.2)], 0.04, 4, P, "#6a7078", tapas=False))
    p.append(p_cil(0.05, 1.0, (0, 0, h + 0.8), P, "#b6bcc3", n=6))
    p.append(p_esfera(0.2, (0, 0, h + 1.35), m.emisivo, "#ff3b2f", seg=8, anillos=5))
    p.append(p_cil(0.4, 0.07, (0.3, -0.55, 6.5), P, "#e8eaeb", n=14, rot=(90, 0, 0)))
    terminar(p, "antena_celular", dist_ao=0.8, notas="mástil 10.5 m con 3 sectores y baliza roja", res=(420, 640), yaw=35, pitch=14, margen=1.1)


def parabolica():
    m = nuevo(); P = m.pintado; p = []
    p.append(p_cil(0.05, 1.1, (0, 0, 0.55), P, "#8d939a", n=6))
    p.append(p_caja((0.5, 0.06, 0.4), (0, 0.05, 0.1), P, "#6a7078", bisel=0.01))
    tilt = Matrix.Translation((0, -0.02, 1.15)) @ Matrix.Rotation(math.radians(-65), 4, "X")
    sec = []
    for i in range(5):
        r = 0.55 * i / 4
        z = 0.28 * (r / 0.55) ** 2
        sec.append([tilt @ Vector((math.cos(a * 2 * math.pi / 14) * r, math.sin(a * 2 * math.pi / 14) * r, z)) for a in range(14)])
    p.append(p_loft(sec, P, "#e9ecef", "#ffffff", cerrado=True, fusionar=True, suave=True, ang=60))
    p.append(p_cil(0.025, 0.65, (0, -0.3, 1.45), P, "#4d5258", n=5, rot=(-25, 0, 0)))
    p.append(p_cil(0.07, 0.14, (0, -0.55, 1.62), P, "#25282c", n=8, rot=(-25, 0, 0)))
    terminar(p, "parabolica", dist_ao=0.4, notas="antena parabólica con LNB", res=(420, 420), yaw=30, pitch=20)


def solar():
    m = nuevo(); P = m.pintado; p = []
    a = 28
    R = Matrix.Rotation(math.radians(a), 3, "X")
    zc = 0.85
    for x in (-1.1, 0, 1.1):
        c0 = Vector((x, 0, zc))
        p.append(p_caja((1.04, 1.75, 0.07), c0, P, "#b8bdc3", rot=(a, 0, 0), bisel=0.015))
        for r in range(6):
            for c in range(3):
                q = [c0 + R @ Vector(((c - 1) * 0.325 + dx, (r - 2.5) * 0.28 + dy, 0.04)) for dx, dy in ((-0.14, -0.12), (0.14, -0.12), (0.14, 0.12), (-0.14, 0.12))]
                p.append(p_malla(q, [(0, 1, 2, 3)], P, mezcla("#183a72", "#3c74b8", (r + c) % 2 * 0.4 + r * 0.08)))
        p.append(p_caja((0.07, 0.07, 1.2), (x, 0.75, 0.6), P, "#8d939a"))
        p.append(p_caja((0.07, 0.07, 0.4), (x, -0.75, 0.2), P, "#8d939a"))
    p.append(p_caja((3.5, 0.07, 0.07), (0, 0.75, 0.3), P, "#8d939a"))
    p.append(p_caja((3.5, 0.07, 0.07), (0, -0.75, 0.1), P, "#8d939a"))
    terminar(p, "panel_solar_fila", dist_ao=0.4, notas="3 paneles solares inclinados en fila (frente -Y)", res=(560, 380), yaw=25, pitch=30)


def escalera():
    m = nuevo(); P = m.pintado; p = []
    p.append(p_caja((3.0, 2.6, 2.5), (0, 0, 1.25), P, "#e0d2b0", "#efe4c6", bisel=0.04))
    p.append(p_caja((3.1, 2.7, 0.25), (0, 0, 0.12), P, "#bfb59f"))
    p.append(p_caja((3.3, 3.1, 0.18), (0, 0.15, 2.62), P, "#a9a7a2", "#c3c1bc", bisel=0.03))
    p.append(p_caja((1.2, 0.08, 2.05), (-0.2, -1.32, 1.1), P, "#8a8f94", bisel=0.02))
    p.append(p_caja((1.0, 0.1, 1.85), (-0.2, -1.36, 1.03), P, "#4b5b66", "#6a7b86", bisel=0.02))
    p.append(p_caja((0.08, 0.1, 0.1), (0.15, -1.43, 0.95), P, "#e9c46a"))
    p.append(p_caja((1.7, 0.9, 0.12), (-0.2, -1.7, 2.25), P, "#b8552f", rot=(12, 0, 0), bisel=0.02))
    p.append(p_caja((0.9, 0.06, 0.5), (0.95, -1.31, 1.7), P, "#7d868f"))
    for k in range(4):
        p.append(p_caja((0.8, 0.04, 0.04), (0.95, -1.35, 1.52 + k * 0.12), P, "#4a4f55"))
    p.append(p_cil(0.12, 0.6, (1.1, 0.7, 3.0), P, "#9aa0a6", n=8, radio2=0.1))
    p.append(p_cil(0.2, 0.06, (1.1, 0.7, 3.33), P, "#6a7078", n=8))
    terminar(p, "caja_escalera", dist_ao=0.9, notas="cuarto de escalera con puerta y alero", res=(520, 440), yaw=-30)


def chimenea():
    m = nuevo(); P = m.pintado; p = []
    p.append(p_caja((1.2, 1.2, 0.35), (0, 0, 0.18), P, "#a9a7a2", bisel=0.03))
    p.append(p_caja((0.9, 0.9, 2.4), (0, 0, 1.55), P, "#b4573a", "#cf7a55", bisel=0.02))
    for z in (0.7, 1.4, 2.1):
        p.append(p_caja((0.98, 0.98, 0.08), (0, 0, z), P, "#8e3f29"))
    p.append(p_caja((1.15, 1.15, 0.2), (0, 0, 2.85), P, "#a9a7a2", "#c3c1bc", bisel=0.03))
    p.append(p_caja((0.62, 0.62, 0.05), (0, 0, 2.97), P, "#1b1d20"))
    for x in (-0.5, 0.5):
        for y in (-0.5, 0.5):
            p.append(p_caja((0.07, 0.07, 0.35), (x, y, 3.12), P, "#6a7078"))
    p.append(p_caja((1.3, 1.3, 0.08), (0, 0, 3.32), P, "#555a61", "#7a8089", bisel=0.02))
    terminar(p, "chimenea", dist_ao=0.8, notas="chimenea de ladrillo con sombrerete", res=(400, 500))


def tendedero():
    m = nuevo(); P = m.pintado; p = []
    for x in (-1.7, 1.7):
        p.append(p_cil(0.045, 1.8, (x, 0, 0.9), P, "#8a8f96", n=6))
        p.append(p_caja((0.3, 0.25, 0.05), (x, 0, 0.03), P, "#6a7078"))
    p.append(p_caja((3.5, 0.05, 0.05), (0, 0, 1.8), P, "#8a8f96"))
    for y in (-0.12, 0.12):
        p.append(p_tubo([(-1.7, y, 1.72), (-0.85, y, 1.66), (0, y, 1.63), (0.85, y, 1.66), (1.7, y, 1.72)], 0.012, 4, P, "#d8d4c8", tapas=False))
    cols = ["#e63946", "#f1f1e8", "#457b9d", "#f4a261", "#2a9d8f", "#ffd166", "#d9788c", "#3fa7a0"]
    x = -1.4
    for i, c in enumerate(cols):
        y = -0.12 if i % 2 == 0 else 0.12
        zc = 1.64
        if i % 3 == 0:
            p.append(p_caja((0.4, 0.03, 0.5), (x, y, zc - 0.28), P, c, oscurecer(c, 0.85)))
            p.append(p_caja((0.2, 0.03, 0.18), (x - 0.28, y, zc - 0.12), P, c, rot=(0, -25, 0)))
            p.append(p_caja((0.2, 0.03, 0.18), (x + 0.28, y, zc - 0.12), P, c, rot=(0, 25, 0)))
            x += 0.62
        elif i % 3 == 1:
            for dx in (-0.1, 0.1):
                p.append(p_caja((0.17, 0.03, 0.75), (x + dx, y, zc - 0.4), P, c, oscurecer(c, 0.8)))
            p.append(p_caja((0.38, 0.03, 0.12), (x, y, zc - 0.07), P, c))
            x += 0.48
        else:
            p.append(p_caja((0.5, 0.03, 0.8), (x, y, zc - 0.42), P, c, oscurecer(c, 0.8)))
            x += 0.62
    terminar(p, "tendedero", dist_ao=0.4, notas="tendedero con ropa de colores", res=(560, 380), yaw=20, pitch=15)


if quiere("ac_unidad_b"): ac_b()
if quiere("tanque_agua"): tinaco("tanque_agua", "#3a5a84", "#1b232e")
if quiere("tanque_agua_b"): tinaco("tanque_agua_b", "#9ab2c2", "#6a7a86", metal=True)
if quiere("antena_celular"): antena()
if quiere("parabolica"): parabolica()
if quiere("panel_solar_fila"): solar()
if quiere("caja_escalera"): escalera()
if quiere("chimenea"): chimenea()
if quiere("tendedero"): tendedero()
