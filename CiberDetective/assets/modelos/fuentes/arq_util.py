"""
CiberDetective · utilidades de arquitectura (sobre lib_bl.py).
Constructor de mallas barato en triángulos: cada pieza lleva sus propios vértices (sombreado plano) y color por vértice.
Convención: dentro de un `frame` la fachada vive en y=0 y el exterior es -Y (el frente del modelo mira a -Y).
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from contextlib import contextmanager
from lib_bl import *   # bpy, hex_a_lineal, mats, exportar, vista_previa, ensuciar, hornear_ao ...

PAL = dict(
    ocre="#d9a441", turquesa="#3fa7a0", rosa="#d9788c", amarillo="#e8c55a", terracota="#c8643b",
    teja="#b8552f", coralina="#cdb48c", concreto="#a9a7a2", cian="#19d8ea", ambar="#ffb020",
    crema="#efe6d2", madera="#7a4a2b", madera_clara="#a86b3c", verde_post="#2f6b5f", azul_post="#2c5d7c",
)

LIT_AMBAR = "#ffc75a"
LIT_CALIDO = "#ffe29a"
LIT_CIAN = "#19d8ea"


def L(c):
    """hex o tupla -> color lineal rgb"""
    return hex_a_lineal(c) if isinstance(c, str) else tuple(c[:3])


def mezcla(a, b, t):
    a, b = L(a), L(b)
    return tuple(a[i] + (b[i] - a[i]) * t for i in range(3))


def tono(c, k):
    c = L(c)
    return (min(1, c[0] * k), min(1, c[1] * k), min(1, c[2] * k))


def _sub(a, b): return (a[0] - b[0], a[1] - b[1], a[2] - b[2])
def _cross(a, b): return (a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0])
def _dot(a, b): return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]


class Cons:
    """Acumula geometría. Materiales: 0 pintado, 1 emisivo, 2 vidrio."""

    def __init__(s, semilla=1):
        s.V = []; s.F = []; s.FM = []; s.COL = []; s.EMI = {}
        s.R = random.Random(semilla)
        s.T = [(0.0, 0.0, 0.0)]  # (rot rad, ox, oy)

    # ------------------------------------------------ marcos locales
    @contextmanager
    def frame(s, ox, oy, rot=0.0):
        r0, x0, y0 = s.T[-1]
        wx = x0 + ox * math.cos(r0) - oy * math.sin(r0)
        wy = y0 + ox * math.sin(r0) + oy * math.cos(r0)
        s.T.append((r0 + math.radians(rot), wx, wy))
        try:
            yield
        finally:
            s.T.pop()

    def _tp(s, p):
        r, ox, oy = s.T[-1]
        c, sn = math.cos(r), math.sin(r)
        return (ox + p[0] * c - p[1] * sn, oy + p[0] * sn + p[1] * c, p[2])

    def _td(s, d):
        r = s.T[-1][0]
        c, sn = math.cos(r), math.sin(r)
        return (d[0] * c - d[1] * sn, d[0] * sn + d[1] * c, d[2])

    def rnd(s): return s.R.random()

    # ------------------------------------------------ emisión
    def _emit(s, pts, faces, cols, mat):
        base = len(s.V)
        for i, p in enumerate(pts):
            s.V.append(s._tp(p))
            s.COL.append(cols[i])
            if mat == 1:
                s.EMI[base + i] = cols[i]
        for f in faces:
            s.F.append(tuple(base + i for i in f))
            s.FM.append(mat)

    def poly(s, pts, col, mat=0, hacia=None, cols=None):
        """Una cara plana (n-gon) con orientación automática hacia el vector `hacia` (local)."""
        clean = []
        cl = []
        for i, p in enumerate(pts):
            if clean and max(abs(p[0] - clean[-1][0]), abs(p[1] - clean[-1][1]), abs(p[2] - clean[-1][2])) < 1e-5:
                continue
            clean.append(p); cl.append(cols[i] if cols else L(col))
        if len(clean) > 2 and max(abs(clean[0][0] - clean[-1][0]), abs(clean[0][1] - clean[-1][1]), abs(clean[0][2] - clean[-1][2])) < 1e-5:
            clean.pop(); cl.pop()
        if len(clean) < 3:
            return
        n = (0, 0, 0)
        for i in range(len(clean)):
            a, b = clean[i], clean[(i + 1) % len(clean)]
            n = (n[0] + (a[1] - b[1]) * (a[2] + b[2]), n[1] + (a[2] - b[2]) * (a[0] + b[0]), n[2] + (a[0] - b[0]) * (a[1] + b[1]))
        if hacia is not None and _dot(n, hacia) < 0:
            clean.reverse(); cl.reverse()
        s._emit(clean, [tuple(range(len(clean)))], cl, mat)

    def box(s, x0, x1, y0, y1, z0, z1, col, col2=None, mat=0, sin="u"):
        """Caja alineada a los ejes locales. sin: caras omitidas (f=-Y, b=+Y, l=-X, r=+X, t=arriba, u=abajo)."""
        c0 = L(col); c1 = L(col2) if col2 is not None else c0
        pts = [(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0), (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)]
        cols = [c0] * 4 + [c1] * 4
        fs = {"f": (0, 1, 5, 4), "r": (1, 2, 6, 5), "b": (2, 3, 7, 6), "l": (3, 0, 4, 7), "t": (4, 5, 6, 7), "u": (0, 3, 2, 1)}
        faces = [f for k, f in fs.items() if k not in sin]
        s._emit(pts, faces, cols, mat)

    def prisma(s, poly, z0, z1, col, col2=None, top=None, esc=1.0, tapa=True, mat=0):
        """Prisma/tronco sobre polígono (x,y). `top`: puntos de arriba (mismo nº) o `esc` = escala hacia el centro."""
        n = len(poly)
        cx = sum(p[0] for p in poly) / n; cy = sum(p[1] for p in poly) / n
        if top is None:
            top = [(cx + (p[0] - cx) * esc, cy + (p[1] - cy) * esc) for p in poly]
        c0 = L(col); c1 = L(col2) if col2 is not None else c0
        area = sum(poly[i][0] * poly[(i + 1) % n][1] - poly[(i + 1) % n][0] * poly[i][1] for i in range(n))
        sg = 1 if area > 0 else -1     # +1: antihorario -> el exterior es la normal derecha (dy,-dx)
        for i in range(n):
            j = (i + 1) % n
            ex = poly[j][0] - poly[i][0]; ey = poly[j][1] - poly[i][1]
            s.poly([(poly[i][0], poly[i][1], z0), (poly[j][0], poly[j][1], z0), (top[j][0], top[j][1], z1), (top[i][0], top[i][1], z1)],
                   None, mat, hacia=(ey * sg, -ex * sg, 0), cols=[c0, c0, c1, c1])
        if tapa:
            s.poly([(p[0], p[1], z1) for p in top], None, mat, hacia=(0, 0, 1), cols=[c1] * n)

    def cil(s, cx, cy, r, z0, z1, col, col2=None, n=12, r2=None, tapa=True, mat=0, giro=0.0):
        r2 = r if r2 is None else r2
        poly = [(cx + r * math.cos(giro + 2 * math.pi * i / n), cy + r * math.sin(giro + 2 * math.pi * i / n)) for i in range(n)]
        top = [(cx + r2 * math.cos(giro + 2 * math.pi * i / n), cy + r2 * math.sin(giro + 2 * math.pi * i / n)) for i in range(n)]
        s.prisma(poly, z0, z1, col, col2, top=top, tapa=tapa and r2 > 1e-4, mat=mat)

    def extruir_xz(s, perfil, y0, y1, col, col2=None, mat=0, cara_trasera=False, sin_base=True):
        """Extruye un perfil (x,z) a lo largo de Y entre y0 (frente, -Y) e y1."""
        n = len(perfil)
        cx = sum(p[0] for p in perfil) / n; cz = sum(p[1] for p in perfil) / n
        zmin = min(p[1] for p in perfil); zmax = max(p[1] for p in perfil)
        c0 = L(col); c1 = L(col2) if col2 is not None else c0

        def cc(z):
            t = 0 if zmax == zmin else (z - zmin) / (zmax - zmin)
            return tuple(c0[k] + (c1[k] - c0[k]) * t for k in range(3))
        s.poly([(p[0], y0, p[1]) for p in perfil], None, mat, hacia=(0, -1, 0), cols=[cc(p[1]) for p in perfil])
        if cara_trasera:
            s.poly([(p[0], y1, p[1]) for p in perfil], None, mat, hacia=(0, 1, 0), cols=[cc(p[1]) for p in perfil])
        for i in range(n):
            j = (i + 1) % n
            a, b = perfil[i], perfil[j]
            if sin_base and abs(a[1] - zmin) < 1e-6 and abs(b[1] - zmin) < 1e-6:
                continue
            mx = (a[0] + b[0]) / 2 - cx; mz = (a[1] + b[1]) / 2 - cz
            s.poly([(a[0], y0, a[1]), (b[0], y0, b[1]), (b[0], y1, b[1]), (a[0], y1, a[1])], None, mat, hacia=(mx, 0, mz), cols=[cc(a[1]), cc(b[1]), cc(b[1]), cc(a[1])])

    # ------------------------------------------------ superficies planas de fachada
    def pano(s, x0, x1, z0, z1, y, col, mat=0, col2=None, cara=-1):
        """Cuadrilátero vertical en y (cara=-1 mira a -Y)."""
        c0 = L(col); c1 = L(col2) if col2 is not None else c0
        s.poly([(x0, y, z0), (x1, y, z0), (x1, y, z1), (x0, y, z1)], None, mat, hacia=(0, cara, 0), cols=[c0, c0, c1, c1])

    # ------------------------------------------------ tejados
    def tejado2(s, x0, x1, y0, y1, z0, alto, col, col2=None, alero=0.55, alero_x=0.3, cursos=6, hastial=None,
                cumbrera="#8a3f22", fascia="#5b3a22", lip=0.07):
        """Techo a dos aguas con la cumbrera a lo largo de X, hileras de teja escalonadas y hastiales."""
        ym = (y0 + y1) / 2; semi = (y1 - y0) / 2
        pend = alto / semi
        xa, xb = x0 - alero_x, x1 + alero_x
        zr = z0 + alto
        c0 = L(col); c1 = L(col2) if col2 is not None else mezcla(col, "#ffffff", 0.12)
        for sg in (-1, 1):
            ye = ym + sg * (semi + alero); ze = z0 - pend * alero
            for k in range(cursos):
                t0 = k / cursos; t1 = (k + 1) / cursos
                yl = ye + (ym - ye) * t0 + sg * lip; zl = ze + (zr - ze) * t0
                yu = ye + (ym - ye) * t1; zu = ze + (zr - ze) * t1
                cc = tuple((c0[i] if k % 2 == 0 else c1[i]) * (0.93 + 0.07 * (k / cursos)) for i in range(3))
                s.poly([(xa, yl, zl), (xb, yl, zl), (xb, yu, zu), (xa, yu, zu)], None, 0, hacia=(0, sg, 1), cols=[cc] * 4)
            # fascia (canto del alero)
            s.poly([(xa, ye + sg * lip, ze - 0.2), (xb, ye + sg * lip, ze - 0.2), (xb, ye + sg * lip, ze), (xa, ye + sg * lip, ze)], fascia, 0, hacia=(0, sg, 0))
        if cumbrera:
            s.box(xa, xb, ym - 0.2, ym + 0.2, zr - 0.06, zr + 0.18, cumbrera)
        if hastial is not None:
            for x, sgx in ((x0, -1), (x1, 1)):
                s.poly([(x, y0, z0), (x, y1, z0), (x, ym, zr)], hastial, 0, hacia=(sgx, 0, 0))

    def tejado4(s, x0, x1, y0, y1, z0, alto, col, col2=None, alero=0.5, cursos=6, cumbrera="#8a3f22", lip=0.07):
        """Techo a cuatro aguas con hileras escalonadas (pirámide si es cuadrado)."""
        w = (x1 - x0) / 2 + alero; d = (y1 - y0) / 2 + alero
        cx = (x0 + x1) / 2; cy = (y0 + y1) / 2
        semi = min(w, d)
        pend = alto / (semi - alero)
        ze = z0 - pend * alero
        zr = z0 + alto
        c0 = L(col); c1 = L(col2) if col2 is not None else mezcla(col, "#ffffff", 0.12)

        def rect(t, ex=0.0):
            ins = semi * t
            return [(cx - w + ins - ex, cy - d + ins - ex), (cx + w - ins + ex, cy - d + ins - ex),
                    (cx + w - ins + ex, cy + d - ins + ex), (cx - w + ins - ex, cy + d - ins + ex)]
        for k in range(cursos):
            t0 = k / cursos; t1 = (k + 1) / cursos
            z_a = ze + (zr - ze) * t0; z_b = ze + (zr - ze) * t1
            cc = tuple((c0[i] if k % 2 == 0 else c1[i]) * (0.93 + 0.07 * (k / cursos)) for i in range(3))
            A = rect(t0, lip); B = rect(t1)
            for i in range(4):
                j = (i + 1) % 4
                mx = (A[i][0] + A[j][0]) / 2 - cx; my = (A[i][1] + A[j][1]) / 2 - cy
                s.poly([(A[i][0], A[i][1], z_a), (A[j][0], A[j][1], z_a), (B[j][0], B[j][1], z_b), (B[i][0], B[i][1], z_b)],
                       None, 0, hacia=(mx, my, 1), cols=[cc] * 4)
        if cumbrera and w != d:
            if w > d:
                s.box(cx - (w - semi) - 0.1, cx + (w - semi) + 0.1, cy - 0.2, cy + 0.2, zr - 0.04, zr + 0.16, cumbrera)
            else:
                s.box(cx - 0.2, cx + 0.2, cy - (d - semi) - 0.1, cy + (d - semi) + 0.1, zr - 0.04, zr + 0.16, cumbrera)
        return semi

    # ------------------------------------------------ cierre
    def construir(s, nombre, m):
        me = bpy.data.meshes.new(nombre)
        me.from_pydata(s.V, [], s.F)
        me.update()
        for k in ("pintado", "emisivo", "vidrio"):
            me.materials.append(getattr(m, k))
        for i, p in enumerate(me.polygons):
            p.material_index = s.FM[i]
            p.use_smooth = False
        attr = me.color_attributes.new("Col", "FLOAT_COLOR", "POINT")
        me.color_attributes.active_color = attr
        for i, c in enumerate(s.COL):
            attr.data[i].color = (c[0], c[1], c[2], 1.0)
        ob = bpy.data.objects.new(nombre, me)
        bpy.context.collection.objects.link(ob)
        bpy.context.view_layer.objects.active = ob
        ob.select_set(True)
        bpy.context.view_layer.update()
        return ob


def gradiente(obj, emi, base=0.80, alto=1.06, hasta=None):
    """Degradado vertical multiplicativo (más oscuro abajo)."""
    me = obj.data
    attr = me.color_attributes["Col"]
    zs = [v.co.z for v in me.vertices]
    top = hasta or max(zs)
    for i, v in enumerate(me.vertices):
        if i in emi:
            continue
        t = max(0.0, min(1.0, v.co.z / max(top, 1e-6)))
        k = base + (alto - base) * t
        c = attr.data[i].color
        attr.data[i].color = (c[0] * k, c[1] * k, c[2] * k, 1.0)


def terminar(c, nombre, m, notas="", cat="arquitectura", ao=(22, 0.45, 2.0), suciedad=0.09, grad=(0.88, 1.08), res=(760, 600), vistas=True, semilla=3):
    obj = c.construir(nombre, m)
    gradiente(obj, c.EMI, grad[0], grad[1])
    ensuciar(obj, suciedad, semilla=semilla)
    hornear_ao(obj, rayos=ao[0], fuerza=ao[1], distancia=ao[2])
    attr = obj.data.color_attributes["Col"]
    for i, col in c.EMI.items():     # las luces no se oscurecen ni se ensucian
        attr.data[i].color = (col[0], col[1], col[2], 1.0)
    est = estadisticas(obj)
    bb = est["dimensiones_xyz_m"]
    notas = f"huella {bb[0]:.1f} x {bb[1]:.1f} m (ancho x fondo), alto {bb[2]:.1f} m. " + notas
    exportar(obj, cat, nombre, notas=notas)
    vista_previa(cat, nombre, resolucion=res)
    if vistas:
        vistas_extra(cat, nombre)
    return obj


def vistas_extra(cat, nombre, res=(560, 440)):
    vista_previa(cat, nombre + "_trasera", resolucion=res, yaw=215, pitch=24)
    vista_previa(cat, nombre + "_alta", resolucion=res, yaw=-30, pitch=52)
    vista_previa(cat, nombre + "_frente", resolucion=res, yaw=8, pitch=9, margen=1.15)
