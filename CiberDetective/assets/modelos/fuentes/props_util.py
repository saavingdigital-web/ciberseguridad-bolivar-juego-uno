"""
CiberDetective · utilidades de modelado para PROPS (sobre lib_bl.py).

Primitivas construidas con bmesh (control total de triángulos). Todas devuelven un objeto ya pintado
(color de vértices "Col") y asignado a un material; luego se unen con `terminar(...)`.

  p_caja(tam, pos, mat, color, color_alto=None, rot=(0,0,0), bisel=0.0)     rot en GRADOS, pos = centro
  p_cil(radio, alto, pos, mat, color, color_alto=None, rot, n=12, radio2=None, tapas=True)
  p_esfera(radio, pos, mat, color, esc=(1,1,1), seg=8, anillos=5)
  p_lobulo(centro, radios, mat, color_fn, subdiv=1, ruido=0.12, semilla=1)
  p_tubo(puntos, radios, n, mat, color, ...)   tubo a lo largo de una curva
  p_loft(secciones, mat, color, ...)           superficie por secciones (cascos, hojas...)
  p_malla(verts, caras, mat, color)            malla suelta
  terminar(partes, nombre, ...)                une, degradado de luz, ensucia, AO, exporta y vista previa

El color puede ser '#hex', tupla lineal, o una función f(i, p, n) -> '#hex' / (r,g,b) por vértice.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib_bl import *   # noqa
import bpy, bmesh, math, random
from mathutils import Vector, Matrix, Euler

_contador = [0]


def _nom(p="p"):
    _contador[0] += 1
    return f"{p}{_contador[0]}"


def _lin(c):
    return hex_a_lineal(c) if isinstance(c, str) else tuple(c)[:3]


def mezcla(c0, c1, t):
    """Mezcla lineal de dos colores ('#hex' o lineal) → tupla lineal."""
    a, b = _lin(c0), _lin(c1)
    t = max(0.0, min(1.0, t))
    return tuple(a[k] + (b[k] - a[k]) * t for k in range(3))


def oscurecer(c, k):
    a = _lin(c)
    return (a[0] * k, a[1] * k, a[2] * k)


def _M(pos=(0, 0, 0), rot=(0, 0, 0)):
    e = Euler(tuple(math.radians(r) for r in rot), "XYZ")
    return Matrix.Translation(Vector(pos)) @ e.to_matrix().to_4x4()


# ------------------------------------------------------------------ cierre de malla
def _cerrar(bm, mat, color, color_alto=None, z0=None, z1=None, ang=38, suave=True, nombre="p"):
    if suave:
        for f in bm.faces:
            f.smooth = True
        lim = math.radians(ang)
        for e in bm.edges:
            try:
                e.smooth = e.calc_face_angle(0.0) < lim
            except Exception:
                e.smooth = True
    else:
        for f in bm.faces:
            f.smooth = False
    me = bpy.data.meshes.new(_nom(nombre))
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(me.name, me)
    bpy.context.collection.objects.link(o)
    if mat is not None:
        me.materials.append(mat)
    colorear(o, color, color_alto, z0, z1)
    return o


def colorear(o, color, color_alto=None, z0=None, z1=None):
    if callable(color):
        attr = o.data.color_attributes.get("Col")
        if attr is None:
            attr = o.data.color_attributes.new("Col", "FLOAT_COLOR", "POINT")
        o.data.color_attributes.active_color = attr
        for i, v in enumerate(o.data.vertices):
            c = _lin(color(i, v.co.copy(), v.normal.copy()))
            attr.data[i].color = (c[0], c[1], c[2], 1.0)
    else:
        pintar(o, color, color_alto, z0, z1)
    return o


# ------------------------------------------------------------------ primitivas
def p_caja(tam, pos, mat, color="#cccccc", color_alto=None, rot=(0, 0, 0), bisel=0.0, ang=38, suave=True):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.transform(bm, matrix=Matrix.Diagonal((tam[0], tam[1], tam[2], 1.0)), verts=bm.verts)
    if bisel and bisel > 0:
        b = min(bisel, min(tam) * 0.45)
        bmesh.ops.bevel(bm, geom=list(bm.edges), offset=b, segments=1, affect="EDGES")
    bmesh.ops.transform(bm, matrix=_M(pos, rot), verts=bm.verts)
    return _cerrar(bm, mat, color, color_alto, ang=ang, suave=suave, nombre="caja")


def p_cil(radio, alto, pos, mat, color="#cccccc", color_alto=None, rot=(0, 0, 0), n=12, radio2=None, tapas=True, ang=38, suave=True):
    """Cilindro/tronco de cono con eje Z local; pos = centro. radio2 = radio de arriba (por defecto igual)."""
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=tapas, cap_tris=False, segments=n, radius1=radio,
                          radius2=radio if radio2 is None else radio2, depth=alto)
    bmesh.ops.transform(bm, matrix=_M(pos, rot), verts=bm.verts)
    return _cerrar(bm, mat, color, color_alto, ang=ang, suave=suave, nombre="cil")


def p_esfera(radio, pos, mat, color="#cccccc", color_alto=None, esc=(1, 1, 1), seg=8, anillos=5, rot=(0, 0, 0), suave=True):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=anillos, radius=radio)
    bmesh.ops.transform(bm, matrix=Matrix.Diagonal((esc[0], esc[1], esc[2], 1.0)), verts=bm.verts)
    bmesh.ops.transform(bm, matrix=_M(pos, rot), verts=bm.verts)
    return _cerrar(bm, mat, color, color_alto, suave=suave, ang=80, nombre="esf")


def _hash(i, semilla):
    r = random.Random(i * 7919 + semilla * 104729)
    return r.random()


def p_lobulo(centro, radios, mat, color_fn, subdiv=1, ruido=0.12, semilla=1, rot=(0, 0, 0), aplastar_base=0.0):
    """Masa de follaje: icosfera con ruido radial y escala elipsoidal. Suave. color_fn(i, p, n)."""
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=subdiv, radius=1.0)
    for v in bm.verts:
        d = v.co.normalized()
        k = 1.0 + ruido * (_hash(v.index, semilla) * 2 - 1)
        v.co = d * k
        if aplastar_base and v.co.z < 0:
            v.co.z *= (1.0 - aplastar_base)
    bmesh.ops.transform(bm, matrix=Matrix.Diagonal((radios[0], radios[1], radios[2], 1.0)), verts=bm.verts)
    bmesh.ops.transform(bm, matrix=_M(centro, rot), verts=bm.verts)
    return _cerrar(bm, mat, color_fn, suave=True, ang=120, nombre="lob")


def p_masa(centro, radios, mat, color_fn, subdiv=3, n_bultos=10, amp=(0.2, 0.38), sigma=(0.26, 0.44), semilla=1,
           base_plana=0.55, solo_arriba=0.75):
    """Masa de follaje de una sola pieza: elipsoide suave deformado con bultos gaussianos (lóbulos de copa).
    color_fn(i, p, n, b): b = cuánto sobresale el vértice (0..1) → las crestas salen más claras."""
    rnd = random.Random(semilla)
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=subdiv, radius=1.0)
    bultos = []
    for _ in range(n_bultos):
        while True:
            d = Vector((rnd.uniform(-1, 1), rnd.uniform(-1, 1), rnd.uniform(-1, 1))).normalized()
            if d.z > -0.35:
                break
        bultos.append((d, rnd.uniform(*amp), rnd.uniform(*sigma)))
    bs = []
    for v in bm.verts:
        d = v.co.normalized()
        b = 0.0
        for (bd, a, sg) in bultos:
            ang = math.acos(max(-1.0, min(1.0, d.dot(bd))))
            b += a * math.exp(-(ang / sg) ** 2)
        k = 1.0 + b + 0.04 * (_hash(v.index, semilla) * 2 - 1)
        p = d * k
        if p.z < 0:
            p.z *= base_plana
        v.co = p
        bs.append(b)
    bmesh.ops.transform(bm, matrix=Matrix.Diagonal((radios[0], radios[1], radios[2], 1.0)), verts=bm.verts)
    bmesh.ops.transform(bm, matrix=_M(centro, (0, 0, rnd.uniform(0, 360))), verts=bm.verts)
    bmax = max(bs) if bs else 1.0
    wrapper = lambda i, p, n: color_fn(i, p, n, bs[i] / max(bmax, 1e-6))
    return _cerrar(bm, mat, wrapper, suave=True, ang=120, nombre="masa")


def p_teja(pos, normal, radio, mat, c_apice, c_borde, rnd, lados=6, altura=0.32, inclinar=0.4):
    """Teja de follaje: copa baja (cono abierto irregular) apoyada en la superficie; ápice claro, borde oscuro."""
    n = Vector(normal).normalized()
    n2 = (n + Vector((0, 0, inclinar))).normalized()
    ref = Vector((0, 0, 1)) if abs(n2.z) < 0.95 else Vector((1, 0, 0))
    t1 = n2.cross(ref).normalized(); t2 = n2.cross(t1)
    bm = bmesh.new()
    ap = bm.verts.new(Vector(pos) + n2 * radio * altura)
    rim = []
    g0 = rnd.uniform(0, 6.28)
    for k in range(lados):
        a = g0 + 2 * math.pi * k / lados
        rr = radio * rnd.uniform(0.78, 1.12)
        rim.append(bm.verts.new(Vector(pos) + (t1 * math.cos(a) + t2 * math.sin(a)) * rr - n2 * radio * 0.08 * rnd.uniform(0, 1)))
    for k in range(lados):
        a, b = rim[k], rim[(k + 1) % lados]
        f = bm.faces.new([ap, b, a])
        if f.normal.dot(n2) < 0:
            f.normal_flip()
    ca, cb = _lin(c_apice), _lin(c_borde)
    def col(i, p, nn):
        return ca if i == 0 else tuple(cb[q] * rnd_k[i] for q in range(3))
    rnd_k = [1.0] + [rnd.uniform(0.85, 1.05) for _ in range(lados)]
    return _cerrar(bm, mat, col, suave=True, ang=100, nombre="teja")


def p_malla(verts, caras, mat, color="#cccccc", color_alto=None, suave=False, ang=38):
    bm = bmesh.new()
    vs = [bm.verts.new(Vector(v)) for v in verts]
    for c in caras:
        try:
            bm.faces.new([vs[i] for i in c])
        except ValueError:
            pass
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return _cerrar(bm, mat, color, color_alto, suave=suave, ang=ang, nombre="malla")


def p_loft(secciones, mat, color="#cccccc", color_alto=None, cerrado=False, tapas=(False, False), invertir=False,
           suave=True, ang=50, fusionar=False, recalcular=False, z0=None, z1=None):
    """Superficie por secciones (listas de puntos del mismo tamaño). cerrado=True cierra cada sección en anillo."""
    bm = bmesh.new()
    V = [[bm.verts.new(Vector(p)) for p in s] for s in secciones]
    n = len(secciones[0])
    for i in range(len(secciones) - 1):
        for j in range(n if cerrado else n - 1):
            j2 = (j + 1) % n
            vs = [V[i][j], V[i][j2], V[i + 1][j2], V[i + 1][j]]
            if invertir:
                vs.reverse()
            try:
                bm.faces.new(vs)
            except ValueError:
                pass
    if tapas[0]:
        try:
            bm.faces.new(list(reversed(V[0])) if not invertir else V[0])
        except ValueError:
            pass
    if tapas[1]:
        try:
            bm.faces.new(V[-1] if not invertir else list(reversed(V[-1])))
        except ValueError:
            pass
    if fusionar:
        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-4)
    if recalcular or (cerrado and (tapas[0] or tapas[1])):
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return _cerrar(bm, mat, color, color_alto, suave=suave, ang=ang, z0=z0, z1=z1, nombre="loft")


# ------------------------------------------------------------------ curvas y tubos
def bez2(p0, p1, p2, n=8):
    a, b, c = Vector(p0), Vector(p1), Vector(p2)
    return [(1 - t) ** 2 * a + 2 * (1 - t) * t * b + t * t * c for t in (i / n for i in range(n + 1))]


def bez3(p0, p1, p2, p3, n=8):
    a, b, c, d = Vector(p0), Vector(p1), Vector(p2), Vector(p3)
    out = []
    for i in range(n + 1):
        t = i / n
        out.append((1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t * t * c + t ** 3 * d)
    return out


def p_tubo(puntos, radios, n, mat, color="#cccccc", color_alto=None, tapas=True, aspecto=(1.0, 1.0),
           colores=None, ang=45, suave=True, giro=0.0):
    """Tubo a lo largo de `puntos`. radios: número, lista (uno por punto) o f(u). colores: lista por punto (opcional)."""
    P = [Vector(p) for p in puntos]
    m = len(P)
    T = []
    for i in range(m):
        a = P[max(i - 1, 0)]; b = P[min(i + 1, m - 1)]
        t = (b - a)
        T.append(t.normalized() if t.length > 1e-9 else Vector((0, 0, 1)))
    ref = Vector((0, 0, 1)) if abs(T[0].z) < 0.9 else Vector((1, 0, 0))
    N0 = T[0].cross(ref).normalized()
    secs = []
    N = N0
    for i in range(m):
        N = (N - T[i] * N.dot(T[i]))
        N = N.normalized() if N.length > 1e-9 else N0
        B = T[i].cross(N)
        if callable(radios):
            r = radios(i / max(m - 1, 1))
        elif isinstance(radios, (list, tuple)):
            r = radios[i]
        else:
            r = radios
        ring = []
        for j in range(n):
            a = 2 * math.pi * j / n + math.radians(giro)
            ring.append(P[i] + (N * math.cos(a) * aspecto[0] + B * math.sin(a) * aspecto[1]) * r)
        secs.append(ring)
    col = color
    if colores is not None:
        cs = [_lin(c) for c in colores]
        col = lambda i, p, nn: cs[min(i // n, len(cs) - 1)]
    o = p_loft(secs, mat, col, color_alto, cerrado=True, tapas=(tapas, tapas), suave=suave, ang=ang)
    return o


# ------------------------------------------------------------------ cierre del modelo
def luz_vertical(obj, abajo=0.82, arriba=1.08):
    """Degradado de luz pintado: más oscuro abajo, más claro arriba (multiplica el color de vértices)."""
    me = obj.data
    attr = me.color_attributes["Col"]
    zs = [v.co.z for v in me.vertices]
    lo, hi = min(zs), max(zs)
    h = max(hi - lo, 1e-6)
    for i, v in enumerate(me.vertices):
        k = abajo + (arriba - abajo) * ((v.co.z - lo) / h)
        c = attr.data[i].color
        attr.data[i].color = (c[0] * k, c[1] * k, c[2] * k, 1.0)


def apoyar_z(obj):
    """Apoya el modelo en Z=0 (sin mover X/Y)."""
    zmin = min(v.co.z for v in obj.data.vertices)
    obj.data.transform(Matrix.Translation((0, 0, -zmin)))
    obj.data.update()


def nuevo():
    nuevo_modelo()
    _contador[0] = 0
    return mats()


def terminar(partes, nombre, cat="props", luz=(0.84, 1.08), sucio=0.07, semilla=3, ao=True, rayos=16,
             fuerza_ao=0.5, dist_ao=0.8, notas="", vista=True, res=(560, 420), yaw=35, pitch=28, margen=1.3, apoyar=True):
    o = unir(partes, nombre)
    if apoyar:
        apoyar_z(o)
    luz_vertical(o, *luz)
    if sucio:
        ensuciar(o, sucio, semilla=semilla)
    if ao:
        hornear_ao(o, rayos=rayos, fuerza=fuerza_ao, distancia=dist_ao)
    exportar(o, cat, nombre, notas=notas)
    if vista:
        vista_previa(cat, nombre, resolucion=res, yaw=yaw, pitch=pitch, margen=margen)
        # segunda lectura sin "cavity" (el realce de bordes exagera las facetas): el PNG final es esta
        sc = bpy.context.scene
        sc.display.shading.show_cavity = False
        sc.display.shading.light = "STUDIO"
        sc.render.film_transparent = False
        vista_previa_sin_cavidad(cat, nombre, res, yaw, pitch, margen)
    return o


def vista_previa_sin_cavidad(cat, nombre, res, yaw, pitch, margen):
    sc = bpy.context.scene
    sc.display.shading.show_cavity = False
    objs = [o for o in bpy.data.objects if o.type == "MESH"]
    pts = [o.matrix_world @ Vector(c) for o in objs for c in o.bound_box]
    mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    centro = (mn + mx) / 2
    radio = max((mx - mn).length / 2, 0.1) * margen
    cam = bpy.data.objects.new("cam2", bpy.data.cameras.new("cam2"))
    bpy.context.collection.objects.link(cam)
    cam.data.lens = 55; cam.data.clip_end = 5000
    dist = radio / math.tan(cam.data.angle / 2) * 0.95
    y, p = math.radians(yaw), math.radians(pitch)
    cam.location = centro + Vector((math.sin(y) * math.cos(p), -math.cos(y) * math.cos(p), math.sin(p))) * dist
    cam.rotation_euler = (centro - cam.location).to_track_quat("-Z", "Y").to_euler()
    sc.camera = cam
    sc.render.resolution_x, sc.render.resolution_y = res
    sc.render.filepath = os.path.join(CARPETA_VISTAS, cat, nombre + ".png")
    bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(cam)
