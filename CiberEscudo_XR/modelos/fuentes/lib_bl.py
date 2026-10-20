"""
CiberEscudo XR · librería (copia adaptada de CiberDetective) común de modelado para Blender 5.2 (modo consola).

Uso desde un script de modelo (en assets/modelos/fuentes/):
    import sys, os
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from lib_bl import *

    nuevo_modelo()
    m = mats()                                   # materiales estándar
    cuerpo = caja("cuerpo", (4, 3, 2), (0, 0, 1), m.pintado, color=(0.8, 0.7, 0.5), bisel=0.06)
    ...
    obj = unir([cuerpo, ...], "nombre_modelo")
    hornear_ao(obj, rayos=24, fuerza=0.55)        # oscurece rincones en el color de vértices
    exportar(obj, "arquitectura", "nombre_modelo")
    vista_previa("arquitectura", "nombre_modelo")

Ejecutar:
    "C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe" --background --factory-startup --python mi_script.py

CONVENCIONES (obligatorias, el motor del juego las asume):
  · 1 unidad = 1 metro. En Blender el eje Z es arriba; el frente del modelo mira hacia -Y de Blender
    (al exportar queda hacia +Z de glTF, que es "adelante" en el juego).
  · Origen del modelo: centro de la base, apoyado en Z=0 (en el suelo).
  · Aspecto: pintado a mano de baja poligonía con bordes biselados, color en el atributo de vértices "Col"
    (degradado vertical + oclusión ambiental horneada). Un solo material "pintado" por modelo, más
    opcionalmente "emisivo" (neones, ventanas encendidas) y "vidrio" (transparente).
  · Sin texturas de imagen (todo es color de vértices): archivos pequeños y carga rápida sin conexión.
"""
import bpy
import bmesh
import math
import os
import sys
import json
from types import SimpleNamespace
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree

RAIZ = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
CARPETA_MODELOS = RAIZ                                   # CiberEscudo_XR/modelos
CARPETA_VISTAS = os.path.join(RAIZ, "vistas")            # CiberEscudo_XR/modelos/vistas


# ---------------------------------------------------------------- escena
def nuevo_modelo():
    """Escena vacía y limpia."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    return bpy.context.scene


def hex_a_lineal(h):
    """'#rrggbb' → (r, g, b) lineal (para pasar a los colores de vértices o materiales)."""
    h = h.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4))
    f = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (f(r), f(g), f(b))


# ---------------------------------------------------------------- materiales
def _mat(nombre):
    m = bpy.data.materials.get(nombre) or bpy.data.materials.new(nombre)
    m.use_nodes = True
    m.node_tree.nodes.clear()
    return m


def mats():
    """Materiales estándar del juego: pintado (color de vértices), emisivo y vidrio."""
    # pintado: color de vértices → Principled BSDF
    p = _mat("pintado")
    n = p.node_tree.nodes; l = p.node_tree.links
    col = n.new("ShaderNodeVertexColor"); col.layer_name = "Col"
    bsdf = n.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Roughness"].default_value = 0.72
    bsdf.inputs["Metallic"].default_value = 0.0
    out = n.new("ShaderNodeOutputMaterial")
    l.new(col.outputs["Color"], bsdf.inputs["Base Color"])
    l.new(bsdf.outputs["BSDF"], out.inputs["Surface"])

    # emisivo: glTF solo admite emisión constante por material -> un material por color de acento.
    # "emisivo" = cian; emisivo_naranja, emisivo_dorado, emisivo_rojo, emisivo_verde, emisivo_blanco.
    ems = {}
    for nom, hx, fuerza in (("emisivo", "#00f7ff", 1.0), ("emisivo_naranja", "#ff9d00", 1.0),
                            ("emisivo_dorado", "#ffcc33", 1.0), ("emisivo_rojo", "#ff3b30", 1.0),
                            ("emisivo_verde", "#00ffaa", 1.0), ("emisivo_blanco", "#ffffff", 1.0)):
        e = _mat(nom)
        n = e.node_tree.nodes; l = e.node_tree.links
        bsdf = n.new("ShaderNodeBsdfPrincipled")
        c = hex_a_lineal(hx)
        bsdf.inputs["Base Color"].default_value = (c[0] * 0.15, c[1] * 0.15, c[2] * 0.15, 1)
        bsdf.inputs["Roughness"].default_value = 0.5
        bsdf.inputs["Emission Color"].default_value = (c[0], c[1], c[2], 1)
        bsdf.inputs["Emission Strength"].default_value = fuerza
        out = n.new("ShaderNodeOutputMaterial")
        l.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
        e.diffuse_color = (c[0], c[1], c[2], 1)
        ems[nom] = e
    e = ems["emisivo"]

    # vidrio: azulado, semitransparente
    v = _mat("vidrio")
    n = v.node_tree.nodes; l = v.node_tree.links
    bsdf = n.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = (0.35, 0.55, 0.68, 1)
    bsdf.inputs["Roughness"].default_value = 0.08
    bsdf.inputs["Metallic"].default_value = 0.4
    bsdf.inputs["Alpha"].default_value = 0.55
    out = n.new("ShaderNodeOutputMaterial")
    l.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    v.blend_method = "BLEND" if hasattr(v, "blend_method") else v.blend_method
    v.diffuse_color = (0.35, 0.55, 0.68, 0.4)
    return SimpleNamespace(pintado=p, emisivo=e, vidrio=v, cian=e, naranja=ems["emisivo_naranja"],
                           dorado=ems["emisivo_dorado"], rojo=ems["emisivo_rojo"], verde=ems["emisivo_verde"],
                           blanco=ems["emisivo_blanco"])


# ---------------------------------------------------------------- color de vértices
def _asegurar_col(obj):
    me = obj.data
    if "Col" not in me.color_attributes:
        me.color_attributes.new("Col", "FLOAT_COLOR", "POINT")
    me.color_attributes.active_color = me.color_attributes["Col"]
    return me.color_attributes["Col"]


def pintar(obj, color, color_alto=None, z0=None, z1=None):
    """Color uniforme o degradado vertical (color en la base → color_alto arriba). Colores lineales o '#hex'."""
    c0 = hex_a_lineal(color) if isinstance(color, str) else tuple(color)
    c1 = (hex_a_lineal(color_alto) if isinstance(color_alto, str) else tuple(color_alto)) if color_alto else None
    attr = _asegurar_col(obj)
    me = obj.data
    mw = obj.matrix_world
    zs = [(mw @ v.co).z for v in me.vertices]
    lo = z0 if z0 is not None else (min(zs) if zs else 0)
    hi = z1 if z1 is not None else (max(zs) if zs else 1)
    for i, v in enumerate(me.vertices):
        t = 0.0 if c1 is None else max(0.0, min(1.0, (zs[i] - lo) / max(hi - lo, 1e-6)))
        c = tuple(c0[k] + (c1[k] - c0[k]) * t for k in range(3)) if c1 else c0
        attr.data[i].color = (c[0], c[1], c[2], 1.0)
    return obj


def ensuciar(obj, fuerza=0.12, semilla=1):
    """Variación sutil de tono por vértice (desgaste/suciedad pintada a mano)."""
    import random
    r = random.Random(semilla)
    attr = _asegurar_col(obj)
    for d in attr.data:
        k = 1.0 - fuerza * r.random()
        d.color = (d.color[0] * k, d.color[1] * k, d.color[2] * k * (0.98 + 0.02 * r.random()), 1.0)
    return obj


def hornear_ao(obj, rayos=24, fuerza=0.55, distancia=1.2, semilla=7):
    """Oclusión ambiental por vértice: lanza rayos en el hemisferio de cada vértice contra la propia geometría."""
    import random
    r = random.Random(semilla)
    dg = bpy.context.evaluated_depsgraph_get()
    ev = obj.evaluated_get(dg)
    me = ev.to_mesh()
    mw = obj.matrix_world
    tree = BVHTree.FromObject(obj, dg)
    attr = _asegurar_col(obj)
    nm = mw.to_3x3().inverted().transposed()
    dirs = []
    for _ in range(rayos):  # direcciones en hemisferio +Z con peso coseno
        u1, u2 = r.random(), r.random()
        rr = math.sqrt(u1); th = 2 * math.pi * u2
        dirs.append(Vector((rr * math.cos(th), rr * math.sin(th), math.sqrt(max(0.0, 1 - u1)))))
    for i, v in enumerate(obj.data.vertices):
        p = mw @ v.co
        n = (nm @ v.normal).normalized()
        t = n.cross(Vector((0, 0, 1)) if abs(n.z) < 0.99 else Vector((1, 0, 0))).normalized()
        b = n.cross(t)
        golpes = 0
        for d in dirs:
            w = (t * d.x + b * d.y + n * d.z).normalized()
            hit = tree.ray_cast(p + n * 0.01, w, distancia)
            if hit[0] is not None:
                golpes += 1
        ao = 1.0 - fuerza * (golpes / rayos)
        c = attr.data[i].color
        attr.data[i].color = (c[0] * ao, c[1] * ao, c[2] * ao, 1.0)
    ev.to_mesh_clear()
    return obj


# ---------------------------------------------------------------- primitivas
def sombrear(obj, suave=True, angulo=40):
    """suave=True: suavizado por ángulo (aristas vivas se conservan); False: facetado plano."""
    bpy.ops.object.select_all(action="DESELECT")
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    if not suave:
        bpy.ops.object.shade_flat()
        return
    try:
        bpy.ops.object.shade_smooth_by_angle(angle=math.radians(angulo))
    except Exception:
        bpy.ops.object.shade_smooth()


def _fin(obj, nombre, mat, color, color_alto, bisel, suave=True, segs=2):
    obj.name = nombre
    obj.data.name = nombre
    if mat is not None:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    if bisel:
        md = obj.modifiers.new("bisel", "BEVEL")
        md.width = bisel; md.segments = segs; md.limit_method = "ANGLE"
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier="bisel")
    sombrear(obj, suave)
    if color is not None:
        pintar(obj, color, color_alto)
    return obj


def caja(nombre, tam, pos, mat=None, color="#cccccc", color_alto=None, bisel=0.03, rot=(0, 0, 0), suave=True, segs=2):
    """Caja con dimensiones tam=(x, y, z) centrada en pos."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos, rotation=rot)
    o = bpy.context.active_object
    o.scale = tam
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return _fin(o, nombre, mat, color, color_alto, bisel, suave, segs)


def cilindro(nombre, radio, alto, pos, mat=None, color="#cccccc", color_alto=None, bisel=0.02, rot=(0, 0, 0), vertices=20, suave=True, segs=2):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radio, depth=alto, location=pos, rotation=rot)
    return _fin(bpy.context.active_object, nombre, mat, color, color_alto, bisel, suave, segs)


def esfera(nombre, radio, pos, mat=None, color="#cccccc", color_alto=None, escala=(1, 1, 1), segmentos=16, anillos=None, suave=True):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=radio, location=pos, segments=segmentos, ring_count=anillos or max(6, segmentos // 2))
    o = bpy.context.active_object
    o.scale = escala
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return _fin(o, nombre, mat, color, color_alto, 0, suave)


def cono(nombre, radio1, radio2, alto, pos, mat=None, color="#cccccc", color_alto=None, vertices=20, rot=(0, 0, 0), suave=True):
    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=radio1, radius2=radio2, depth=alto, location=pos, rotation=rot)
    return _fin(bpy.context.active_object, nombre, mat, color, color_alto, 0, suave)


def toro(nombre, mayor, menor, pos, mat=None, color="#cccccc", color_alto=None, seg=24, seg_menor=6, rot=(0, 0, 0), suave=True):
    bpy.ops.mesh.primitive_torus_add(major_radius=mayor, minor_radius=menor, major_segments=seg, minor_segments=seg_menor,
                                     location=pos, rotation=rot)
    return _fin(bpy.context.active_object, nombre, mat, color, color_alto, 0, suave)


def malla(nombre, verts, caras, pos=(0, 0, 0), mat=None, color="#cccccc", color_alto=None, suave=False):
    """Malla desde listas de vértices y caras."""
    me = bpy.data.meshes.new(nombre)
    me.from_pydata(verts, [], caras)
    me.update()
    o = bpy.data.objects.new(nombre, me)
    bpy.context.collection.objects.link(o)
    o.location = pos
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
    if mat is not None:
        o.data.materials.append(mat)
    sombrear(o, suave)
    if color is not None:
        pintar(o, color, color_alto)
    return o


def prisma_tejado(nombre, ancho, fondo, alto, pos, mat=None, color="#b8552f", color_alto=None):
    """Techo a dos aguas: cumbrera a lo largo de X. pos = centro de la base."""
    me = bpy.data.meshes.new(nombre)
    hx, hy = ancho / 2, fondo / 2
    v = [(-hx, -hy, 0), (hx, -hy, 0), (hx, hy, 0), (-hx, hy, 0), (-hx, 0, alto), (hx, 0, alto)]
    f = [(0, 1, 2, 3), (0, 1, 5, 4), (2, 3, 4, 5), (0, 4, 3), (1, 2, 5)]
    me.from_pydata(v, [], f)
    me.update()
    o = bpy.data.objects.new(nombre, me)
    bpy.context.collection.objects.link(o)
    o.location = pos
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
    bpy.ops.object.shade_flat()
    if mat is not None:
        o.data.materials.append(mat)
    pintar(o, color, color_alto)
    return o


def unir(objs, nombre):
    """Une objetos en uno (conservando el color de vértices y los materiales)."""
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    o = bpy.context.active_object
    o.name = nombre; o.data.name = nombre
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    # el origen del objeto unido debe ser el origen del mundo (no la posicion del primer objeto)
    o.data.transform(o.matrix_world)
    o.matrix_world = Matrix.Identity(4)
    return o


def al_suelo(obj):
    """Apoya el modelo en Z=0 y centra el origen en la base (centro XY del cuadro, Z mínima)."""
    mw = obj.matrix_world
    pts = [mw @ Vector(c) for c in obj.bound_box]
    cx = (min(p.x for p in pts) + max(p.x for p in pts)) / 2
    cy = (min(p.y for p in pts) + max(p.y for p in pts)) / 2
    zmin = min(p.z for p in pts)
    obj.data.transform(Matrix.Translation((-cx - obj.location.x * 0, -cy, -zmin)) @ Matrix.Identity(4))
    obj.location = (0, 0, 0)
    return obj


def estadisticas(obj):
    dg = bpy.context.evaluated_depsgraph_get()
    me = obj.evaluated_get(dg).to_mesh()
    me.calc_loop_triangles()
    tris = len(me.loop_triangles)
    mw = obj.matrix_world
    pts = [mw @ Vector(c) for c in obj.bound_box]
    dim = [round(max(p[i] for p in pts) - min(p[i] for p in pts), 3) for i in range(3)]
    obj.evaluated_get(dg).to_mesh_clear()
    return {"triangulos": tris, "dimensiones_xyz_m": dim}


# ---------------------------------------------------------------- exportar y vista previa
def _parchear_glb(ruta):
    """Garantiza alphaMode BLEND (y doble cara) en los materiales 'vidrio*' del GLB."""
    import struct
    d = open(ruta, "rb").read()
    ln = struct.unpack_from("<I", d, 12)[0]
    js = json.loads(d[20:20 + ln].decode("utf-8"))
    ok = False
    for m in js.get("materials", []):
        if m.get("name", "").startswith("vidrio"):
            m["alphaMode"] = "BLEND"; m["doubleSided"] = True; ok = True
    if not ok:
        return
    nuevo = json.dumps(js, separators=(",", ":")).encode("utf-8")
    nuevo += b" " * ((4 - len(nuevo) % 4) % 4)
    resto = d[20 + ln:]
    out = d[:12] + struct.pack("<I", len(nuevo)) + d[16:20] + nuevo + resto
    out = out[:8] + struct.pack("<I", len(out)) + out[12:]
    open(ruta, "wb").write(out)


def exportar(objs, nombre, notas="", nodos=None):
    """Exporta objs (lista u objeto) a modelos/<nombre>.glb conservando los nodos por nombre y registra
    el modelo en modelos/manifiesto.json."""
    if not isinstance(objs, (list, tuple)):
        objs = [objs]
    os.makedirs(CARPETA_MODELOS, exist_ok=True)
    ruta = os.path.join(CARPETA_MODELOS, nombre + ".glb")
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.export_scene.gltf(
        filepath=ruta, export_format="GLB", use_selection=True, export_apply=True,
        export_yup=True, export_materials="EXPORT",
        export_vertex_color="ACTIVE", export_all_vertex_colors=False,
        export_active_vertex_color_when_no_material=True,
        export_cameras=False, export_lights=False)
    _parchear_glb(ruta)
    tris = 0; pts = []
    dg = bpy.context.evaluated_depsgraph_get()
    for o in objs:
        me = o.evaluated_get(dg).to_mesh(); me.calc_loop_triangles(); tris += len(me.loop_triangles)
        o.evaluated_get(dg).to_mesh_clear()
        pts += [o.matrix_world @ Vector(c) for c in o.bound_box]
    dim = [round(max(p[i] for p in pts) - min(p[i] for p in pts), 3) for i in range(3)]
    est = {"nombre": nombre, "archivo": nombre + ".glb", "triangulos": tris, "kb": round(os.path.getsize(ruta) / 1024, 1),
           "dimensiones_xyz_m_blender": dim, "nodos": nodos or [o.name for o in objs], "notas": notas}
    mf = os.path.join(CARPETA_MODELOS, "manifiesto.json")
    datos = []
    if os.path.exists(mf):
        try:
            datos = json.load(open(mf, encoding="utf-8"))
        except Exception:
            datos = []
    datos = [d for d in datos if d.get("nombre") != nombre] + [est]
    datos.sort(key=lambda d: d["nombre"])
    json.dump(datos, open(mf, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"EXPORTADO {nombre}: {tris} tris, {est['kb']} KB, dim {dim}")
    return ruta


def vista_previa(nombre, objs=None, resolucion=(640, 480), vistas=((35, 24), (0, 0), (90, 0)), margen=1.3, sufijo=""):
    """Renderiza (Cycles, la emisión se ve) varias vistas en modelos/vistas/<nombre>_<k>.png.
    vistas = (yaw, pitch) en grados; yaw 0 = mirando de frente al modelo (desde -Y)."""
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.samples = 24
    sc.cycles.device = "CPU"
    try:
        sc.cycles.use_denoising = False
    except Exception:
        pass
    sc.render.resolution_x, sc.render.resolution_y = resolucion
    sc.view_settings.view_transform = "Standard"
    w = bpy.data.worlds.new("w"); w.use_nodes = True
    bg = w.node_tree.nodes["Background"]
    bg.inputs[0].default_value = (0.012, 0.018, 0.03, 1); bg.inputs[1].default_value = 1.0
    sc.world = w
    objs = objs or [o for o in bpy.data.objects if o.type == "MESH"]
    pts = [o.matrix_world @ Vector(c) for o in objs for c in o.bound_box]
    mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    centro = (mn + mx) / 2
    radio = max((mx - mn).length / 2, 0.1) * margen
    for i, (ang, en) in enumerate(((35, 250), (-120, 120))):
        ld = bpy.data.lights.new(f"l{i}", "AREA"); ld.energy = en * radio * radio; ld.size = radio * 2
        lo = bpy.data.objects.new(f"l{i}", ld); bpy.context.collection.objects.link(lo)
        a = math.radians(ang)
        lo.location = centro + Vector((math.sin(a), -math.cos(a), 0.9)) * radio * 3
        lo.rotation_euler = (centro - lo.location).to_track_quat("-Z", "Y").to_euler()
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
    bpy.context.collection.objects.link(cam)
    cam.data.lens = 55; cam.data.clip_end = 5000
    sc.camera = cam
    dist = radio / math.tan(cam.data.angle / 2) * 0.95
    os.makedirs(CARPETA_VISTAS, exist_ok=True)
    rutas = []
    for k, (yaw, pitch) in enumerate(vistas):
        y, p = math.radians(yaw), math.radians(pitch)
        cam.location = centro + Vector((math.sin(y) * math.cos(p), -math.cos(y) * math.cos(p), math.sin(p))) * dist
        cam.rotation_euler = (centro - cam.location).to_track_quat("-Z", "Y").to_euler()
        sc.render.filepath = os.path.join(CARPETA_VISTAS, f"{nombre}{sufijo}_{k}.png")
        bpy.ops.render.render(write_still=True)
        rutas.append(sc.render.filepath)
    bpy.data.objects.remove(cam)
    # hoja de contacto: une las vistas en un solo PNG
    import numpy as np
    ims = [bpy.data.images.load(r) for r in rutas]
    w_, h_ = ims[0].size
    hoja = np.zeros((h_, w_ * len(ims), 4), dtype=np.float32)
    for k, im in enumerate(ims):
        hoja[:, k * w_:(k + 1) * w_, :] = np.array(im.pixels[:], dtype=np.float32).reshape(h_, w_, 4)
    out = bpy.data.images.new("hoja", w_ * len(ims), h_, alpha=False)
    out.pixels = hoja.ravel().tolist()
    out.filepath_raw = os.path.join(CARPETA_VISTAS, f"{nombre}{sufijo}.png")
    out.file_format = "PNG"
    out.save()
    for r in rutas:
        os.remove(r)
    print("HOJA", out.filepath_raw)


def luz_vertical(obj, abajo=0.75, arriba=1.15):
    """Multiplica el color de vértices por un degradado vertical (en mundo) y recalcula por objeto ya orientado."""
    attr = _asegurar_col(obj)
    me = obj.data
    mw = obj.matrix_world
    zs = [(mw @ v.co).z for v in me.vertices]
    lo, hi = min(zs), max(zs)
    for i in range(len(me.vertices)):
        t = (zs[i] - lo) / max(hi - lo, 1e-6)
        k = abajo + (arriba - abajo) * t
        c = attr.data[i].color
        attr.data[i].color = (min(1, c[0] * k), min(1, c[1] * k), min(1, c[2] * k), 1.0)
    return obj


def orientar_x(objs, grados=90):
    """Gira objetos en torno a X (origen mundo) y aplica la rotación."""
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.rotation_euler = (math.radians(grados), 0, 0)
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)


def tubo(nombre, puntos, radios, lados=8, paso=None, mat_fn=None, materiales=(), tapas=(False, False),
         color="#cccccc", color_alto=None, suave=True, angulo=40, fase=0.0):
    """Tubo por lofting sobre una poli-linea. puntos=[(x,y,z)...], radios=[(rx,ry)|r ...] (uno por punto).
    paso: separacion entre anillos (re-muestrea la poli-linea); mat_fn(z_medio, k)->indice de material."""
    import bmesh
    P = [Vector(p) for p in puntos]
    Rd = [(r, r) if isinstance(r, (int, float)) else tuple(r) for r in radios]
    if paso:
        # arco acumulado
        L = [0.0]
        for i in range(1, len(P)):
            L.append(L[-1] + (P[i] - P[i - 1]).length)
        n = max(1, round(L[-1] / paso))
        nuevos, nr = [], []
        for j in range(n + 1):
            s = L[-1] * j / n
            i = max(1, next((k for k in range(1, len(L)) if L[k] >= s - 1e-9), len(L) - 1))
            t = (s - L[i - 1]) / max(L[i] - L[i - 1], 1e-9)
            nuevos.append(P[i - 1].lerp(P[i], t))
            nr.append((Rd[i - 1][0] + (Rd[i][0] - Rd[i - 1][0]) * t, Rd[i - 1][1] + (Rd[i][1] - Rd[i - 1][1]) * t))
        P, Rd = nuevos, nr
    anillos = []
    for i, c in enumerate(P):
        a, b = P[max(0, i - 1)], P[min(len(P) - 1, i + 1)]
        t = (b - a).normalized()
        u = Vector((1, 0, 0)) - t * t.x
        if u.length < 1e-3:
            u = Vector((0, 1, 0)) - t * t.y
        u.normalize()
        v = t.cross(u).normalized()
        rx, ry = Rd[i]
        anillos.append([c + u * rx * math.cos(2 * math.pi * k / lados + fase) + v * ry * math.sin(2 * math.pi * k / lados + fase)
                        for k in range(lados)])
    me = bpy.data.meshes.new(nombre)
    bm = bmesh.new()
    vs = [[bm.verts.new(p) for p in an] for an in anillos]
    idx = []
    for i in range(len(vs) - 1):
        zm = sum(v.co.z for v in vs[i] + vs[i + 1]) / (2 * lados)
        mi = mat_fn(zm, i) if mat_fn else 0
        for k in range(lados):
            f = bm.faces.new((vs[i][k], vs[i][(k + 1) % lados], vs[i + 1][(k + 1) % lados], vs[i + 1][k]))
            f.material_index = mi
    if tapas[0]:
        f = bm.faces.new(list(reversed(vs[0]))); f.material_index = mat_fn(vs[0][0].co.z, 0) if mat_fn else 0
    if tapas[1]:
        f = bm.faces.new(vs[-1]); f.material_index = mat_fn(vs[-1][0].co.z, 0) if mat_fn else 0
    bm.to_mesh(me); bm.free()
    for mt in materiales:
        me.materials.append(mt)
    o = bpy.data.objects.new(nombre, me)
    bpy.context.collection.objects.link(o)
    sombrear(o, suave, angulo)
    pintar(o, color, color_alto)
    return o
