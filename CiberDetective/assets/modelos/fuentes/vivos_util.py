"""
CiberDetective · utilidades de modelado para la categoría `vivos` (vehículos y personajes).

Construye TODO el modelo en un único bmesh (sin operadores de Blender, sin modificadores de bisel) para
controlar los triángulos y el color de vértices:

    m = Malla()
    m.anillos(rings, color, mat=0)           # superficie por anillos (loft) con tapas
    m.rev(perfil, M, n, esc, color)           # sólido de revolución (ruedas, cabezas, sombreros...)
    m.tubo(pts, radios, n, color)             # tubo elíptico siguiendo una polilínea (miembros, torso)
    m.caja(centro, tam, color, bis=0.0)       # caja (con bisel de un segmento opcional)
    m.poligono(pts, color, mat, hacia)        # calcomanía plana (líneas de puerta, placas, ventanas)
    obj = m.objeto("nombre")                  # → objeto de Blender con atributo de vértices Col y materiales
    terminar(m, "vivos", "nombre", ...)       # ensucia, hornea AO, exporta y hace la hoja de vistas

Materiales por cara: 0 = pintado, 1 = vidrio, 2 = emisivo.
Convenciones: frente a -Y, Z arriba, 1 unidad = 1 m, pies/ruedas en Z=0.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib_bl import *            # noqa: F401,F403  (bpy, bmesh, math, Vector, Matrix, hex_a_lineal, mats, ...)
from mathutils import Euler

PINTADO, VIDRIO, EMISIVO = 0, 1, 2


# ------------------------------------------------------------------ color
def C(c):
    """'#hex' o tupla lineal → tupla lineal rgb."""
    if isinstance(c, str):
        h = c.lstrip("#")
        if len(h) == 3:
            c = "#" + "".join(ch * 2 for ch in h)
        return hex_a_lineal(c)
    return tuple(c)[:3]


def mezcla(a, b, t):
    a, b = C(a), C(b)
    return tuple(a[k] + (b[k] - a[k]) * t for k in range(3))


def G(paradas, eje=2):
    """Degradado por tramos a lo largo de un eje del mundo: G([(0.3,'#555'),(0.9,'#eee')])."""
    st = [(v, C(c)) for v, c in paradas]

    def f(p):
        v = p[eje]
        if v <= st[0][0]:
            return st[0][1]
        for (v0, c0), (v1, c1) in zip(st, st[1:]):
            if v <= v1:
                t = (v - v0) / max(v1 - v0, 1e-9)
                return tuple(c0[k] + (c1[k] - c0[k]) * t for k in range(3))
        return st[-1][1]
    return f


def T(pos=(0, 0, 0), rot=(0, 0, 0)):
    """Matriz de traslación + rotación (grados, XYZ)."""
    R = Euler(tuple(math.radians(a) for a in rot), "XYZ").to_matrix().to_4x4()
    return Matrix.Translation(Vector(pos)) @ R


# ------------------------------------------------------------------ generadores de anillos
def anillo_rr(y, ancho, zb, zt, r=0.12, ancho_top=None, n=3, xc=0.0):
    """Sección (plano XZ en la posición y) de rectángulo redondeado, ancho en la base y en el techo."""
    hw = ancho / 2
    ht = (ancho_top if ancho_top is not None else ancho) / 2
    r = min(r, (zt - zb) / 2 - 1e-4, hw - 1e-4, ht - 1e-4)
    cent = [(hw - r, zb + r, -90), (ht - r, zt - r, 0), (-(ht - r), zt - r, 90), (-(hw - r), zb + r, 180)]
    pts = []
    for cx, cz, a0 in cent:
        for k in range(n):
            a = math.radians(a0 + (k + 0.5) * 90.0 / n)
            pts.append((xc + cx + r * math.cos(a), y, cz + r * math.sin(a)))
    return pts


def anillo_trap(y, zb, zt, wb, wt, r=0.09):
    """Cabina: trapecio de 6 puntos (lado inferior abierto). Lados 0-1 y 4-5, techo 2-3."""
    r = min(r, (zt - zb) * 0.45)
    return [(wb / 2, y, zb), (wt / 2, y, zt - r), (wt / 2 - r, y, zt),
            (-(wt / 2 - r), y, zt), (-wt / 2, y, zt - r), (-wb / 2, y, zb)]


def anillo_el(cx, cy, cz, rx, ry, n=8, fase=0.0):
    """Elipse horizontal (plano XY a altura cz)."""
    return [(cx + rx * math.cos(2 * math.pi * k / n + fase), cy + ry * math.sin(2 * math.pi * k / n + fase), cz) for k in range(n)]


def x_lado(z, hw, ht, zb, zt, r):
    """x de la pared lateral de un casco con 'tumblehome' (para pegar calcomanías)."""
    z0, z1 = zb + r, zt - r
    t = max(0.0, min(1.0, (z - z0) / max(z1 - z0, 1e-6)))
    return hw - (hw - ht) * t


# ------------------------------------------------------------------ malla
class Malla:
    def __init__(self, vidrio=None):
        self.bm = bmesh.new()
        self.col = []
        self.mat = []
        self.vidrio = vidrio or G([(0.3, "#54788f"), (1.9, "#a6cadd")])

    # ---- internos
    def _color(self, color, i, p):
        if isinstance(color, list):
            color = color[i]
        if callable(color):
            return color(p)
        return C(color)

    def _vert(self, p, col, mat):
        v = self.bm.verts.new(p)
        v.index = len(self.col)
        self.col.append(col)
        self.mat.append(mat)
        return v

    def _cara(self, vs, mat_v, mat_f):
        if mat_f != mat_v:
            nv = []
            for v in vs:
                p = v.co.copy()
                col = self.vidrio(p) if mat_f == VIDRIO else self.col[v.index]
                nv.append(self._vert(p, col, mat_f))
            vs = nv
        try:
            f = self.bm.faces.new(vs)
            f.material_index = mat_f
            return f
        except ValueError:
            return None

    # ---- primitivas
    def anillos(self, rings, color, mat=PINTADO, tapas=(True, True), matf=None, corte=(), M=None, cerrado=True):
        """Loft entre anillos (listas de puntos del mismo tamaño). matf(i, j) → material de la cara (i=banda, j=lado)."""
        M = M if M is not None else Matrix.Identity(4)
        nr, n = len(rings), len(rings[0])
        P = [[M @ Vector(p) for p in ring] for ring in rings]
        V = [[self._vert(P[i][j], self._color(color, i, P[i][j]), mat) for j in range(n)] for i in range(nr)]
        jmax = n if cerrado else n - 1
        bandas = []
        for i in range(nr - 1):
            if i in corte:
                continue
            for j in range(jmax):
                bandas.append((i, j, [V[i][j], V[i][(j + 1) % n], V[i + 1][(j + 1) % n], V[i + 1][j]]))
        # orientación global (hacia afuera): suma de normal · (centro de cara - centroide de la pieza)
        cen = sum((p for fila in P for p in fila), Vector()) / (nr * n)
        s = 0.0
        for i, j, vs in bandas:
            a, b, c, d = (v.co for v in vs)
            nrm = (b - a).cross(d - a) + (c - b).cross(a - b) * 0  # normal de la cara por (b-a)x(d-a)
            s += nrm.dot((a + b + c + d) / 4 - cen)
        flip = s < 0
        caras = []
        for i, j, vs in bandas:
            v = list(reversed(vs)) if flip else vs
            m = matf(i, j) if matf else mat
            caras.append(self._cara(v, mat, m))
        if cerrado:
            if tapas[0]:
                v = list(V[0]) if flip else list(reversed(V[0]))
                caras.append(self._cara(v, mat, mat))
            if tapas[1]:
                v = list(reversed(V[-1])) if flip else list(V[-1])
                caras.append(self._cara(v, mat, mat))
        return caras

    def rev(self, perfil, M=None, n=12, esc=(1.0, 1.0), color=None, mat=PINTADO, tapas=(True, True), corte=(), fase=0.0):
        """Sólido de revolución sobre el eje Z local. perfil = [(z, radio) o (z, radio, color), ...]."""
        rings, cols = [], []
        for e in perfil:
            z, r = e[0], e[1]
            rings.append([(esc[0] * r * math.cos(2 * math.pi * k / n + fase), esc[1] * r * math.sin(2 * math.pi * k / n + fase), z) for k in range(n)])
            cols.append(e[2] if len(e) > 2 else (color[len(cols)] if isinstance(color, list) else color))
        col = cols if all(c is not None for c in cols) else color
        return self.anillos(rings, col, mat, tapas, M=M, corte=corte)

    def tubo(self, pts, radios, n=8, color=None, mat=PINTADO, tapas=(False, False), corte=(), M=None, fase=0.0, ref=None):
        """Tubo elíptico a lo largo de una polilínea. radios: float o (rx, ry) por punto; color: valor, función o lista por anillo."""
        P = [Vector(p) for p in pts]
        rings = []
        for i, p in enumerate(P):
            a = P[max(i - 1, 0)]
            b = P[min(i + 1, len(P) - 1)]
            d = (b - a).normalized()
            rf = Vector(ref) if ref is not None else Vector((0, 1, 0))
            if abs(d.dot(rf)) > 0.9:
                rf = Vector((1, 0, 0))
            u = d.cross(rf).normalized()
            v = d.cross(u).normalized()
            r = radios[i]
            rx, ry = (r, r) if not isinstance(r, (tuple, list)) else r
            ring = []
            for k in range(n):
                t = 2 * math.pi * k / n + fase
                ring.append(p + u * (rx * math.cos(t)) + v * (ry * math.sin(t)))
            rings.append(ring)
        return self.anillos(rings, color, mat, tapas, corte=corte, M=M)

    def caja(self, centro, tam, color, mat=PINTADO, rot=(0, 0, 0), afil=1.0, bis=0.0):
        """Caja centrada. afil<1 estrecha la cara superior (en XY). bis>0: bisel de 1 segmento en los bordes superior/inferior."""
        hx, hy, hz = tam[0] / 2, tam[1] / 2, tam[2] / 2

        def r4(k, z):
            return [(-hx * k, -hy * k, z), (hx * k, -hy * k, z), (hx * k, hy * k, z), (-hx * k, hy * k, z)]
        if bis > 0:
            b = min(bis, hz * 0.9, hx * 0.9, hy * 0.9)
            rings = [self._r4i(hx, hy, b, -hz, 1.0),
                     self._r4i(hx, hy, 0, -hz + b, 1.0),
                     self._r4i(hx, hy, 0, hz - b, afil),
                     self._r4i(hx, hy, b, hz, afil)]
        else:
            rings = [r4(1.0, -hz), r4(afil, hz)]
        return self.anillos(rings, color, mat, M=T(centro, rot))

    @staticmethod
    def _r4i(hx, hy, b, z, k):
        x, y = (hx - b) * k, (hy - b) * k
        return [(-x, -y, z), (x, -y, z), (x, y, z), (-x, y, z)]

    def poligono(self, pts, color, mat=PINTADO, hacia=None):
        """Cara plana (n-gono). 'hacia' = dirección hacia la que debe mirar la normal."""
        P = [Vector(p) for p in pts]
        vs = [self._vert(p, self._color(color, 0, p), mat) for p in P]
        if hacia is not None:
            n = Vector()
            for k in range(1, len(P) - 1):
                n += (P[k] - P[0]).cross(P[k + 1] - P[0])
            if n.dot(Vector(hacia)) < 0:
                vs.reverse()
        return self._cara(vs, mat, mat)

    def panel_x(self, x, y0, y1, z0, z1, color, lado=1, mat=PINTADO, x1=None):
        """Rectángulo en plano ~X mirando a ±X. x1 (opcional) = x en z1 (para paredes inclinadas)."""
        xt = x if x1 is None else x1
        return self.poligono([(x, y0, z0), (x, y1, z0), (xt, y1, z1), (xt, y0, z1)], color, mat, (lado, 0, 0))

    def panel_y(self, y, x0, x1, z0, z1, color, lado=-1, mat=PINTADO):
        return self.poligono([(x0, y, z0), (x1, y, z0), (x1, y, z1), (x0, y, z1)], color, mat, (0, lado, 0))

    # ---- cierre
    def objeto(self, nombre, ang_agudo=40.0):
        bm = self.bm
        for f in bm.faces:
            f.smooth = True
        lim = math.radians(ang_agudo)
        for e in bm.edges:
            if len(e.link_faces) == 2 and e.calc_face_angle(0.0) > lim:
                e.smooth = False
        bm.verts.index_update()
        me = bpy.data.meshes.new(nombre)
        bm.to_mesh(me)
        bm.free()
        M = mats()
        base = [M.pintado, M.vidrio, M.emisivo]
        usados = sorted({p.material_index for p in me.polygons})
        remap = {u: k for k, u in enumerate(usados)}
        for u in usados:
            me.materials.append(base[u])
        for p in me.polygons:
            p.material_index = remap[p.material_index]
        attr = me.color_attributes.new("Col", "FLOAT_COLOR", "POINT")
        for i, c in enumerate(self.col):
            attr.data[i].color = (c[0], c[1], c[2], 1.0)
        me.color_attributes.active_color = attr
        try:
            me.color_attributes.render_color_index = list(me.color_attributes.keys()).index("Col")
        except Exception:
            pass
        obj = bpy.data.objects.new(nombre, me)
        bpy.context.collection.objects.link(obj)
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        self.obj = obj
        return obj

    def restaurar_emisivos(self):
        attr = self.obj.data.color_attributes["Col"]
        for i, m in enumerate(self.mat):
            if m == EMISIVO:
                c = self.col[i]
                attr.data[i].color = (c[0], c[1], c[2], 1.0)


# ------------------------------------------------------------------ vistas y cierre
def hoja(categoria, nombre, vistas, res=(420, 320), cols=None, margen=1.22):
    """Renderiza varias vistas y las compone en una sola imagen revision/modelos/<cat>/<nombre>.png."""
    import numpy as np
    sc = bpy.context.scene
    try:
        sc.view_settings.view_transform = "Standard"
    except Exception:
        pass
    w, h = res
    rutas = []
    for k, (yaw, pitch) in enumerate(vistas):
        vista_previa(categoria, f"_t{k}", resolucion=res, yaw=yaw, pitch=pitch, margen=margen)
        rutas.append(os.path.join(CARPETA_VISTAS, categoria, f"_t{k}.png"))
    cols = cols or len(vistas)
    filas = math.ceil(len(vistas) / cols)
    out = np.zeros((filas * h, cols * w, 4), dtype=np.float32)
    out[..., 3] = 1.0
    for k, r in enumerate(rutas):
        im = bpy.data.images.load(r)
        a = np.array(im.pixels[:], dtype=np.float32).reshape(h, w, 4)
        fila, col = k // cols, k % cols
        y0 = (filas - 1 - fila) * h
        out[y0:y0 + h, col * w:(col + 1) * w] = a
        bpy.data.images.remove(im)
        os.remove(r)
    img = bpy.data.images.new("hoja_" + nombre, cols * w, filas * h, alpha=False)
    img.pixels.foreach_set(out.ravel())
    img.filepath_raw = os.path.join(CARPETA_VISTAS, categoria, nombre + ".png")
    img.file_format = "PNG"
    img.save()
    print("HOJA", img.filepath_raw)


VISTAS_AUTO = [(32, 24), (148, 24), (90, 6), (20, 62)]
VISTAS_GENTE = [(0, 6), (35, 22), (180, 6), (25, 58)]


def anotar(categoria, nombre, **kw):
    """Añade campos extra (cadera_z, notas, ...) a la entrada del manifiesto."""
    import json
    mf = os.path.join(CARPETA_MODELOS, categoria, "manifiesto.json")
    datos = json.load(open(mf, encoding="utf-8"))
    for d in datos:
        if d["nombre"] == nombre:
            d.update(kw)
    json.dump(datos, open(mf, "w", encoding="utf-8"), ensure_ascii=False, indent=2)


def terminar(malla, categoria, nombre, notas="", sucio=0.08, ao=(20, 0.5, 0.6), semilla=3,
             vistas=None, res=(420, 320), cols=None, ang_agudo=40.0, extra=None, margen=1.22):
    obj = malla.objeto(nombre, ang_agudo)
    ensuciar(obj, sucio, semilla)
    hornear_ao(obj, rayos=ao[0], fuerza=ao[1], distancia=ao[2])
    malla.restaurar_emisivos()
    exportar(obj, categoria, nombre, notas=notas)
    if extra:
        anotar(categoria, nombre, **extra)
    hoja(categoria, nombre, vistas or VISTAS_AUTO, res=res, cols=cols, margen=margen)
    return obj
