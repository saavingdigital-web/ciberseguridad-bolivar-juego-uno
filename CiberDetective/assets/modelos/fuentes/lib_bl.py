"""
CiberDetective · librería común de modelado para Blender 5.2 (modo consola).

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

RAIZ = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".."))
CARPETA_MODELOS = os.path.join(RAIZ, "assets", "modelos")
CARPETA_VISTAS = os.path.join(RAIZ, "revision", "modelos")


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

    # emisivo: color de vértices → emisión (neón, ventanas)
    e = _mat("emisivo")
    n = e.node_tree.nodes; l = e.node_tree.links
    col = n.new("ShaderNodeVertexColor"); col.layer_name = "Col"
    bsdf = n.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = (0.02, 0.02, 0.02, 1)
    bsdf.inputs["Emission Strength"].default_value = 2.5
    out = n.new("ShaderNodeOutputMaterial")
    l.new(col.outputs["Color"], bsdf.inputs["Emission Color"])
    l.new(bsdf.outputs["BSDF"], out.inputs["Surface"])

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
    return SimpleNamespace(pintado=p, emisivo=e, vidrio=v)


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
def _fin(obj, nombre, mat, color, color_alto, bisel, suave=True):
    obj.name = nombre
    obj.data.name = nombre
    if mat is not None:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    if bisel:
        md = obj.modifiers.new("bisel", "BEVEL")
        md.width = bisel; md.segments = 2; md.limit_method = "ANGLE"
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier="bisel")
    if suave:
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.shade_smooth()
        try:
            obj.data.use_auto_smooth = True
        except Exception:
            pass
    if color is not None:
        pintar(obj, color, color_alto)
    return obj


def caja(nombre, tam, pos, mat=None, color="#cccccc", color_alto=None, bisel=0.03, rot=(0, 0, 0)):
    """Caja con dimensiones tam=(x, y, z) centrada en pos."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos, rotation=rot)
    o = bpy.context.active_object
    o.scale = tam
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return _fin(o, nombre, mat, color, color_alto, bisel)


def cilindro(nombre, radio, alto, pos, mat=None, color="#cccccc", color_alto=None, bisel=0.02, rot=(0, 0, 0), vertices=20):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radio, depth=alto, location=pos, rotation=rot)
    return _fin(bpy.context.active_object, nombre, mat, color, color_alto, bisel)


def esfera(nombre, radio, pos, mat=None, color="#cccccc", color_alto=None, escala=(1, 1, 1), segmentos=16):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=radio, location=pos, segments=segmentos, ring_count=max(6, segmentos // 2))
    o = bpy.context.active_object
    o.scale = escala
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return _fin(o, nombre, mat, color, color_alto, 0)


def cono(nombre, radio1, radio2, alto, pos, mat=None, color="#cccccc", color_alto=None, vertices=20, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=radio1, radius2=radio2, depth=alto, location=pos, rotation=rot)
    return _fin(bpy.context.active_object, nombre, mat, color, color_alto, 0)


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
def exportar(obj, categoria, nombre, notas=""):
    """Exporta GLB con color de vértices y registra el modelo en el manifiesto de su categoría."""
    carpeta = os.path.join(CARPETA_MODELOS, categoria)
    os.makedirs(carpeta, exist_ok=True)
    ruta = os.path.join(carpeta, nombre + ".glb")
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.export_scene.gltf(
        filepath=ruta, export_format="GLB", use_selection=True, export_apply=True,
        export_yup=True, export_materials="EXPORT",
        export_vertex_color="ACTIVE", export_all_vertex_colors=False,
        export_active_vertex_color_when_no_material=True,
        export_cameras=False, export_lights=False)
    est = estadisticas(obj)
    est.update({"nombre": nombre, "archivo": f"{categoria}/{nombre}.glb", "kb": round(os.path.getsize(ruta) / 1024, 1), "notas": notas})
    # manifiesto de la categoría (se actualiza la entrada de este modelo)
    mf = os.path.join(carpeta, "manifiesto.json")
    datos = []
    if os.path.exists(mf):
        try:
            datos = json.load(open(mf, encoding="utf-8"))
        except Exception:
            datos = []
    datos = [d for d in datos if d.get("nombre") != nombre] + [est]
    datos.sort(key=lambda d: d["nombre"])
    json.dump(datos, open(mf, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"EXPORTADO {nombre}: {est['triangulos']} tris, {est['kb']} KB, dim {est['dimensiones_xyz_m']}")
    return ruta


def vista_previa(categoria, nombre, objs=None, resolucion=(640, 480), yaw=35, pitch=28, margen=1.35):
    """Renderiza una vista previa 3/4 con fondo oscuro en revision/modelos/<categoria>/<nombre>.png (motor Workbench)."""
    sc = bpy.context.scene
    sc.render.engine = "BLENDER_WORKBENCH"
    sc.display.shading.light = "STUDIO"
    sc.display.shading.color_type = "VERTEX"
    sc.display.shading.show_cavity = True
    sc.display.shading.background_type = "VIEWPORT"
    sc.display.shading.background_color = (0.07, 0.09, 0.13)
    sc.render.resolution_x, sc.render.resolution_y = resolucion
    objs = objs or [o for o in bpy.data.objects if o.type == "MESH"]
    pts = [o.matrix_world @ Vector(c) for o in objs for c in o.bound_box]
    mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    centro = (mn + mx) / 2
    radio = max((mx - mn).length / 2, 0.1) * margen
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
    bpy.context.collection.objects.link(cam)
    cam.data.lens = 55
    cam.data.clip_end = 5000
    dist = radio / math.tan(cam.data.angle / 2) * 0.95   # cam.data.angle ya está en radianes
    y, p = math.radians(yaw), math.radians(pitch)
    cam.location = centro + Vector((math.sin(y) * math.cos(p), -math.cos(y) * math.cos(p), math.sin(p))) * dist
    d = centro - cam.location
    cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    sc.camera = cam
    carpeta = os.path.join(CARPETA_VISTAS, categoria)
    os.makedirs(carpeta, exist_ok=True)
    sc.render.filepath = os.path.join(carpeta, nombre + ".png")
    bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(cam)
    print("VISTA", sc.render.filepath)
