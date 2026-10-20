"""Mobiliario urbano: farola, farola_colonial, semaforo, banca, papelera, hidrante, kiosko_sombrilla, parada_bus, bolardo, jardinera, poste_electrico."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from props_util import *
SOLO = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []


def quiere(n):
    return not SOLO or n in SOLO


def farola():
    m = nuevo(); P = m.pintado; p = []
    p.append(p_cil(0.3, 0.5, (0, 0, 0.25), P, "#3a3f45", "#59606a", n=8, radio2=0.22))
    p.append(p_cil(0.2, 0.15, (0, 0, 0.55), P, "#2b2f35", n=8))
    p.append(p_cil(0.1, 6.6, (0, 0, 3.8), P, "#6a727c", "#8f98a2", n=8, radio2=0.075))
    p.append(p_cil(0.14, 0.12, (0, 0, 1.3), P, "#3a3f45", n=8))
    brazo = bez3((0, 0, 6.9), (0, -0.1, 7.5), (0, -0.9, 7.7), (0, -1.9, 7.45), 6)
    p.append(p_tubo(brazo, [0.075, 0.07, 0.06, 0.055, 0.05, 0.05, 0.05], 6, P, "#6a727c", "#8f98a2", tapas=False))
    p.append(p_caja((0.5, 0.95, 0.2), (0, -2.15, 7.5), P, "#2f343a", "#4a515a", bisel=0.04))
    p.append(p_caja((0.4, 0.8, 0.05), (0, -2.15, 7.36), m.emisivo, "#ffe2a6"))
    p.append(p_caja((0.4, 0.4, 0.14), (0, -1.75, 7.62), P, "#3a3f45"))
    terminar(p, "farola", dist_ao=0.6, notas="farola 7.8 m con brazo y lámpara emisiva (frente -Y)", res=(480, 640), yaw=40, pitch=14, margen=1.1)


def farola_colonial():
    m = nuevo(); P = m.pintado; p = []
    p.append(p_cil(0.3, 0.7, (0, 0, 0.35), P, "#1b1d20", "#2d3036", n=8, radio2=0.2))
    p.append(p_cil(0.14, 0.12, (0, 0, 0.75), P, "#14161a", n=8))
    p.append(p_cil(0.1, 3.0, (0, 0, 2.3), P, "#1b1d20", "#2d3036", n=8, radio2=0.07))
    p.append(p_cil(0.16, 0.1, (0, 0, 3.8), P, "#14161a", n=8))
    p.append(p_cil(0.34, 0.5, (0, 0, 4.1), m.emisivo, "#ffc87a", "#ffe6b8", n=6, radio2=0.26))
    for k in range(6):
        a = math.radians(k * 60)
        p.append(p_caja((0.04, 0.04, 0.6), (math.cos(a) * 0.31, math.sin(a) * 0.31, 4.1), P, "#14161a"))
    p.append(p_cil(0.44, 0.1, (0, 0, 4.45), P, "#14161a", n=6, radio2=0.36))
    p.append(p_cil(0.4, 0.4, (0, 0, 4.7), P, "#1b1d20", n=6, radio2=0.03))
    p.append(p_esfera(0.07, (0, 0, 4.95), P, "#e9c46a", seg=6, anillos=4))
    for s in (-1, 1):
        p.append(p_tubo(bez2((0, 0, 3.2), (s * 0.5, 0, 3.2), (s * 0.55, 0, 3.7), 4), 0.03, 4, P, "#14161a", tapas=False))
    terminar(p, "farola_colonial", dist_ao=0.5, notas="farola colonial de hierro negro con linterna", res=(420, 560), yaw=35, pitch=14, margen=1.1)


def semaforo():
    m = nuevo(); P = m.pintado; p = []
    p.append(p_cil(0.2, 0.3, (0, 0, 0.15), P, "#3a3f45", n=8, radio2=0.14))
    p.append(p_cil(0.11, 5.1, (0, 0, 2.85), P, "#2c3036", "#4a5058", n=8, radio2=0.085))
    brazo = bez2((0, 0, 5.2), (1.0, 0, 5.7), (3.3, 0, 5.45), 5)
    p.append(p_tubo(brazo, [0.09, 0.08, 0.07, 0.06, 0.06, 0.05], 6, P, "#2c3036", tapas=False))
    p.append(p_caja((0.5, 0.45, 1.45), (3.25, 0, 4.85), P, "#f0b429", "#f6cf62", bisel=0.04))
    for k, c in enumerate(("#ff3b30", "#ffc21a", "#2bff7a")):
        z = 5.3 - k * 0.45
        p.append(p_cil(0.19, 0.05, (3.25, -0.24, z), m.emisivo, oscurecer(c, 1.0 if k == 0 else 0.35), n=10, rot=(90, 0, 0)))
        p.append(p_caja((0.5, 0.2, 0.06), (3.25, -0.3, z + 0.23), P, "#2c3036", rot=(15, 0, 0)))
    p.append(p_caja((0.34, 0.3, 0.6), (0.3, -0.2, 3.4), P, "#2c3036", bisel=0.03))
    p.append(p_cil(0.1, 0.04, (0.3, -0.36, 3.55), m.emisivo, "#ff3b30", n=8, rot=(90, 0, 0)))
    p.append(p_cil(0.1, 0.04, (0.3, -0.36, 3.3), m.emisivo, "#0a3a1c", n=8, rot=(90, 0, 0)))
    p.append(p_caja((0.5, 0.03, 0.5), (0.0, 0.12, 2.5), P, "#2a9d8f"))
    terminar(p, "semaforo", dist_ao=0.5, notas="semáforo con brazo (arriba rojo encendido, verde y ámbar tenues); luces estáticas", res=(560, 560), yaw=-35, pitch=14)


def banca():
    m = nuevo(); P = m.pintado; p = []
    for x in (-0.8, 0.8):
        p.append(p_caja((0.1, 0.55, 0.12), (x, 0, 0.06), P, "#23262a", bisel=0.01))
        p.append(p_caja((0.1, 0.07, 0.5), (x, -0.1, 0.35), P, "#23262a"))
        p.append(p_caja((0.1, 0.07, 0.85), (x, 0.22, 0.45), P, "#23262a", rot=(-12, 0, 0)))
        p.append(p_tubo(bez2((x, -0.28, 0.65), (x, -0.32, 0.8), (x, -0.1, 0.8), 3), 0.04, 5, P, "#23262a", tapas=False))
    for i in range(4):
        p.append(p_caja((1.9, 0.1, 0.05), (0, -0.2 + i * 0.13, 0.45), P, "#9a6234", "#b87a47", bisel=0.01))
    for i in range(3):
        p.append(p_caja((1.9, 0.04, 0.12), (0, 0.24 + i * 0.03, 0.62 + i * 0.19), P, "#9a6234", "#b87a47", rot=(-12, 0, 0)))
    terminar(p, "banca", dist_ao=0.4, notas="banca de listones de madera y hierro", res=(520, 400), yaw=30, pitch=25)


def papelera():
    m = nuevo(); P = m.pintado; p = []
    p.append(p_cil(0.36, 0.9, (0, 0, 0.55), P, "#2d7a56", "#46a073", n=10, radio2=0.32))
    p.append(p_cil(0.4, 0.1, (0, 0, 1.03), P, "#1d4f3a", n=10, radio2=0.36))
    p.append(p_cil(0.2, 0.04, (0, 0, 1.1), P, "#0c1a14", n=8))
    p.append(p_cil(0.37, 0.12, (0, 0, 0.7), P, "#f2c230", n=10, radio2=0.36))
    p.append(p_caja((0.3, 0.03, 0.22), (0, -0.33, 0.55), P, "#101214"))
    for a in (45, 135, 225, 315):
        p.append(p_caja((0.1, 0.1, 0.18), (math.cos(math.radians(a)) * 0.22, math.sin(math.radians(a)) * 0.22, 0.09), P, "#2b2d30"))
    terminar(p, "papelera", dist_ao=0.4, notas="papelera verde con franja amarilla", res=(360, 440), pitch=22)


def hidrante():
    m = nuevo(); P = m.pintado; p = []
    p.append(p_cil(0.3, 0.1, (0, 0, 0.05), P, "#3a3f45", n=8))
    p.append(p_cil(0.22, 0.75, (0, 0, 0.45), P, "#d62828", "#ef5350", n=10, radio2=0.19))
    p.append(p_cil(0.26, 0.1, (0, 0, 0.82), P, "#a31d1d", n=10))
    p.append(p_esfera(0.21, (0, 0, 0.88), P, "#d62828", "#ff6b5e", esc=(1, 1, 0.8), seg=10, anillos=5))
    p.append(p_cil(0.08, 0.1, (0, 0, 1.08), P, "#e9c46a", n=6))
    for s in (-1, 1):
        p.append(p_cil(0.1, 0.3, (s * 0.28, 0, 0.55), P, "#e9c46a", "#f4d98a", n=8, rot=(0, 90, 0)))
        p.append(p_cil(0.13, 0.07, (s * 0.46, 0, 0.55), P, "#a31d1d", n=8, rot=(0, 90, 0)))
    p.append(p_cil(0.12, 0.2, (0, -0.24, 0.55), P, "#e9c46a", n=8, rot=(90, 0, 0)))
    p.append(p_cil(0.15, 0.06, (0, -0.37, 0.55), P, "#a31d1d", n=8, rot=(90, 0, 0)))
    terminar(p, "hidrante", dist_ao=0.4, notas="hidrante rojo con tomas amarillas", res=(420, 440), pitch=22)


def kiosko():
    m = nuevo(); P = m.pintado; p = []
    p.append(p_caja((2.2, 1.5, 0.15), (0, 0, 0.08), P, "#8f8a80"))
    p.append(p_caja((2.0, 1.2, 1.2), (0, 0.1, 0.75), P, "#f1e7cf", "#fff5de", bisel=0.03))
    p.append(p_caja((2.1, 0.5, 0.08), (0, -0.7, 1.15), P, "#2a9d8f", bisel=0.02))   # mostrador
    p.append(p_caja((2.0, 0.08, 0.5), (0, -0.52, 0.65), P, "#e76f51"))
    p.append(p_caja((1.7, 0.04, 0.5), (0, -0.52, 0.95), P, "#ffd166"))
    for x, c in ((-0.6, "#e63946"), (-0.2, "#2a9d8f"), (0.2, "#ffd166"), (0.6, "#457b9d")):
        p.append(p_caja((0.25, 0.2, 0.3), (x, -0.62, 1.34), P, c, bisel=0.02))      # mercancía
    p.append(p_caja((1.6, 0.06, 0.4), (0, -0.8, 1.7), P, "#d62828"))                # letrero
    p.append(p_cil(0.04, 2.6, (0.9, 0.5, 1.5), P, "#e8e2d6", n=6))
    # sombrilla a rayas
    n = 10; secs = []
    cen = Vector((0.5, -0.1, 0))
    for i in range(n):
        a0, a1 = 2 * math.pi * i / n, 2 * math.pi * (i + 1) / n
        c = "#e63946" if i % 2 == 0 else "#fbf7ec"
        am = (a0 + a1) / 2
        def pt(r, z, a): return (0.5 + math.cos(a) * r, -0.1 + math.sin(a) * r, z)
        verts = [pt(0, 2.95, am), pt(1.0, 2.7, a0), pt(1.0, 2.7, a1), pt(1.85, 2.35, a0), pt(1.85, 2.35, a1)]
        p.append(p_malla(verts, [(0, 1, 2), (1, 3, 4, 2)], P, c, suave=False))
    p.append(p_esfera(0.07, (0.5, -0.1, 3.0), P, "#c9a227", seg=6, anillos=4))
    terminar(p, "kiosko_sombrilla", dist_ao=0.8, notas="quiosco de venta con sombrilla a rayas", res=(560, 500), yaw=30, pitch=26)


def parada():
    m = nuevo(); P = m.pintado; p = []
    for x in (-1.5, 1.5):
        p.append(p_caja((0.1, 0.1, 2.6), (x, 0.45, 1.3), P, "#3a4048", bisel=0.01))
        p.append(p_caja((0.1, 0.1, 2.4), (x, -0.45, 1.2), P, "#3a4048", bisel=0.01))
    p.append(p_caja((3.4, 1.4, 0.12), (0, 0, 2.62), P, "#2a9d8f", "#3fbfae", bisel=0.03, rot=(-4, 0, 0)))
    p.append(p_caja((3.4, 0.06, 0.18), (0, -0.7, 2.5), P, "#1f7a6f"))
    p.append(p_caja((3.0, 0.05, 1.6), (0, 0.5, 1.4), m.vidrio, "#9fc3d0"))
    p.append(p_caja((0.05, 0.9, 1.6), (-1.45, 0, 1.4), m.vidrio, "#9fc3d0"))
    p.append(p_caja((2.3, 0.45, 0.07), (-0.2, 0.2, 0.55), P, "#8a5a35", bisel=0.01))
    for x in (-1.2, 0.8):
        p.append(p_caja((0.07, 0.4, 0.5), (x, 0.2, 0.27), P, "#23262a"))
    p.append(p_caja((1.0, 0.1, 1.6), (2.05, 0.35, 1.0), P, "#222831", bisel=0.02))      # valla
    p.append(p_caja((0.8, 0.04, 1.35), (2.05, 0.28, 1.0), m.emisivo, "#9be3ff", "#e8fbff"))
    p.append(p_caja((0.1, 0.1, 0.5), (2.05, 0.35, 0.25), P, "#222831"))
    p.append(p_cil(0.04, 2.6, (-2.0, -0.6, 1.3), P, "#c9d2dc", n=6))
    p.append(p_cil(0.28, 0.05, (-2.0, -0.62, 2.5), P, "#d1372f", n=12, rot=(90, 0, 0)))
    terminar(p, "parada_bus", dist_ao=0.8, notas="parada de bus con techo, banca, valla luminosa y poste de ruta", res=(640, 480), yaw=-30, pitch=24)


def bolardo():
    m = nuevo(); P = m.pintado; p = []
    p.append(p_cil(0.2, 0.8, (0, 0, 0.4), P, "#3a4350", "#5b6676", n=10, radio2=0.17))
    p.append(p_esfera(0.18, (0, 0, 0.82), P, "#5b6676", "#7a8697", esc=(1, 1, 0.6), seg=10, anillos=4))
    p.append(p_cil(0.205, 0.12, (0, 0, 0.55), P, "#f2c230", n=10, radio2=0.19))
    p.append(p_cil(0.25, 0.06, (0, 0, 0.03), P, "#2b2f35", n=10))
    terminar(p, "bolardo", dist_ao=0.3, notas="bolardo con banda amarilla", res=(300, 360), pitch=22)


def jardinera():
    m = nuevo(); P = m.pintado; p = []
    p.append(p_caja((2.0, 0.8, 0.6), (0, 0, 0.3), P, "#b9b4a8", "#d6d1c4", bisel=0.04))
    p.append(p_caja((2.15, 0.95, 0.1), (0, 0, 0.62), P, "#8f8a80", bisel=0.02))
    p.append(p_caja((1.8, 0.6, 0.05), (0, 0, 0.66), P, "#4a3426"))
    rnd = random.Random(8)
    for i in range(7):
        x = -0.8 + i * 0.27; y = rnd.uniform(-0.2, 0.2)
        a = rnd.uniform(0, 360)
        for j in range(3):
            aj = math.radians(a + j * 120)
            h = rnd.uniform(0.5, 0.8)
            p.append(p_tubo(bez2((x, y, 0.66), (x + math.cos(aj) * 0.15, y + math.sin(aj) * 0.15, 0.66 + h * 0.6), (x + math.cos(aj) * 0.3, y + math.sin(aj) * 0.3, 0.66 + h), 2),
                            [0.045, 0.04, 0.03], 3, P, "#2f7a30", "#7fc24a", tapas=False))
    cs = ["#ff4f9f", "#ffd166", "#f4a261", "#ffffff"]
    for i in range(7):
        x = -0.8 + i * 0.27; y = rnd.uniform(-0.2, 0.2)
        p.append(p_esfera(0.15, (x, y, 1.35 + rnd.uniform(-0.1, 0.15)), P, cs[i % 4], mezcla(cs[i % 4], "#ffffff", 0.3), seg=6, anillos=4))
    terminar(p, "jardinera", dist_ao=0.5, notas="jardinera de concreto con plantas y flores", res=(520, 400), yaw=28, pitch=26)


def poste():
    m = nuevo(); P = m.pintado; p = []
    p.append(p_cil(0.2, 0.3, (0, 0, 0.15), P, "#8f8a80", n=8, radio2=0.17))
    p.append(p_cil(0.17, 9.0, (0, 0, 4.8), P, "#8a8579", "#b3ad9f", n=8, radio2=0.12))
    p.append(p_caja((2.6, 0.12, 0.14), (0, 0, 8.4), P, "#6a4a30", bisel=0.015))
    p.append(p_caja((1.8, 0.12, 0.14), (0, 0, 7.6), P, "#6a4a30", bisel=0.015))
    for x in (-1.1, 0, 1.1):
        p.append(p_cil(0.08, 0.28, (x, 0, 8.6), P, "#d8d4c8", n=6))
        p.append(p_cil(0.1, 0.06, (x, 0, 8.76), P, "#8a8f94", n=6))
    p.append(p_cil(0.32, 0.8, (0.45, -0.45, 7.2), P, "#6e7f6a", "#8da088", n=10))
    p.append(p_cil(0.34, 0.08, (0.45, -0.45, 7.64), P, "#4f5d4c", n=10))
    p.append(p_cil(0.34, 0.08, (0.45, -0.45, 6.78), P, "#4f5d4c", n=10))
    for x in (-1.1, 0, 1.1):
        for s in (-1, 1):
            p.append(p_tubo(bez2((x, 0, 8.76), (x + s * 0.7, 0, 8.3), (x + s * 1.5, 0, 8.55), 3), 0.025, 4, P, "#17191c", tapas=True))
    p.append(p_tubo(bez2((0.45, -0.45, 7.6), (0.2, -0.2, 8.0), (0, 0, 8.4), 2), 0.03, 4, P, "#17191c"))
    for z in (5.5, 6.2):
        p.append(p_caja((0.05, 0.05, 0.22), (0.15, -0.05, z), P, "#3a3f45"))
    terminar(p, "poste_electrico", dist_ao=0.6, notas="poste de concreto con travesaños, transformador y cables cortos", res=(560, 640), yaw=35, pitch=14, margen=1.1)


if quiere("farola"): farola()
if quiere("farola_colonial"): farola_colonial()
if quiere("semaforo"): semaforo()
if quiere("banca"): banca()
if quiere("papelera"): papelera()
if quiere("hidrante"): hidrante()
if quiere("kiosko_sombrilla"): kiosko()
if quiere("parada_bus"): parada()
if quiere("bolardo"): bolardo()
if quiere("jardinera"): jardinera()
if quiere("poste_electrico"): poste()
