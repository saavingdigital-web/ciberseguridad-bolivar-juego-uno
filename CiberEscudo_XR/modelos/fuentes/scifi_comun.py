"""
CiberEscudo XR · utilidades comunes para convertir piezas de "Modular SciFi MegaKit [Standard]"
(Quaternius, CC0 1.0) en GLB ligeros para Meta Quest 3S.  Blender 5.2, modo consola.

El kit se trata como DATOS: solo se leen .gltf/.bin/.png; no se ejecuta nada de él.
Variable de entorno SCIFI_KIT = carpeta con glTF/ y Textures/ (por defecto la del scratchpad).
"""
import bpy
import os
import sys
import re
import json
import struct
import math
import numpy as np
from mathutils import Vector, Matrix

KIT = os.environ.get("SCIFI_KIT", r"C:\Users\jonat\AppData\Local\Temp\claude\C--Users-jonat-Desktop--SAAVING-CL"
                     r"\c09ab66e-cca7-42b0-9ca7-8e39cce24731\scratchpad\modular_scifi")
RAIZ = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
SALIDA = os.path.join(RAIZ, "scifi")
VISTAS = os.path.join(RAIZ, "vistas")
os.makedirs(SALIDA, exist_ok=True)
os.makedirs(VISTAS, exist_ok=True)

CIAN = (0.0, 0.969, 1.0)          # #00f7ff (valores ya lineales para 0 y 1; 0.969 ~ f7 aprox.)
NARANJA = (1.0, 0.36, 0.04)


def limpiar():
    bpy.ops.wm.read_factory_settings(use_empty=True)


# ------------------------------------------------------------------ importación
def importar(carpeta, nombre):
    """Importa glTF del kit; devuelve la lista de objetos nuevos (con transformaciones ya aplicadas)."""
    antes = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(KIT, "glTF", carpeta, nombre + ".gltf"))
    nuevos = [o for o in bpy.data.objects if o not in antes]
    return nuevos


def base(nombre_mat):
    """'MI_Trim_01.003' -> 'MI_Trim_01'"""
    return re.sub(r"\.\d+$", "", nombre_mat)


# ------------------------------------------------------------------ texturas
_cache_img = {}


def imagen(nombre, res=512, no_color=False, tinte=None):
    """Carga Textures/<nombre>.png, la reduce a res×res y la devuelve (cache por nombre+res)."""
    clave = (nombre, res, no_color, tinte)
    if clave in _cache_img:
        return _cache_img[clave]
    ruta = os.path.join(KIT, "Textures", nombre + ".png")
    im = bpy.data.images.load(ruta)
    im.scale(res, res)
    if tinte is not None:
        a = np.empty(res * res * 4, dtype=np.float32)
        im.pixels.foreach_get(a)
        a = a.reshape(-1, 4)
        lum = a[:, :3].max(axis=1)
        a[:, 0] = lum * tinte[0]
        a[:, 1] = lum * tinte[1]
        a[:, 2] = lum * tinte[2]
        im.pixels.foreach_set(a.ravel())
    # se guarda reducida en una carpeta de trabajo y se vuelve a cargar desde disco (el exportador lee ese archivo)
    carpeta = os.path.join(os.environ.get("TEMP", "."), "scifi_tex")
    os.makedirs(carpeta, exist_ok=True)
    suf = "_%d" % res + ("_t" if tinte is not None else "")
    tmp = os.path.join(carpeta, nombre + suf + ".png")
    im.filepath_raw = tmp
    im.file_format = "PNG"
    im.save()
    bpy.data.images.remove(im)
    im = bpy.data.images.load(tmp)
    im.name = nombre + suf
    im.colorspace_settings.name = "Non-Color" if no_color else "sRGB"
    im.alpha_mode = "STRAIGHT"
    _cache_img[clave] = im
    return im


# ------------------------------------------------------------------ materiales
def _nodos(nombre):
    m = bpy.data.materials.new(nombre)
    m.use_nodes = True
    n = m.node_tree.nodes
    n.clear()
    out = n.new("ShaderNodeOutputMaterial")
    bsdf = n.new("ShaderNodeBsdfPrincipled")
    m.node_tree.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return m, n, m.node_tree.links, bsdf


def _tex(n, im):
    t = n.new("ShaderNodeTexImage")
    t.image = im
    t.interpolation = "Linear"
    return t


def mat_trim(nombre, base_png, orm_png, normal_png, res=512, usar_normal=True, usar_orm=True,
             rug=0.6, met=0.3):
    m, n, l, b = _nodos(nombre)
    tb = _tex(n, imagen(base_png, res))
    l.new(tb.outputs["Color"], b.inputs["Base Color"])
    if usar_orm and orm_png:
        to = _tex(n, imagen(orm_png, res, no_color=True))
        sp = n.new("ShaderNodeSeparateColor")
        l.new(to.outputs["Color"], sp.inputs["Color"])
        l.new(sp.outputs["Green"], b.inputs["Roughness"])
        l.new(sp.outputs["Blue"], b.inputs["Metallic"])
    else:
        b.inputs["Roughness"].default_value = rug
        b.inputs["Metallic"].default_value = met
    if usar_normal and normal_png:
        tn = _tex(n, imagen(normal_png, res, no_color=True))
        nm = n.new("ShaderNodeNormalMap")
        l.new(tn.outputs["Color"], nm.inputs["Color"])
        l.new(nm.outputs["Normal"], b.inputs["Normal"])
    m.diffuse_color = (0.5, 0.5, 0.5, 1)
    return m


def mat_decal(nombre, res=512, color=CIAN):
    """Decals del kit (atlas T_Decals), teñidos de cian y emisivos, con recorte alfa."""
    m, n, l, b = _nodos(nombre)
    im = imagen("T_Decals", res, tinte=color)
    t = _tex(n, im)
    t.interpolation = "Linear"
    l.new(t.outputs["Color"], b.inputs["Base Color"])
    l.new(t.outputs["Color"], b.inputs["Emission Color"])
    b.inputs["Emission Strength"].default_value = 1.0
    l.new(t.outputs["Alpha"], b.inputs["Alpha"])
    b.inputs["Roughness"].default_value = 0.6
    m.diffuse_color = (color[0], color[1], color[2], 1)
    return m


def mat_color(nombre, rgb, rug=0.5, met=0.0):
    m, n, l, b = _nodos(nombre)
    b.inputs["Base Color"].default_value = (rgb[0], rgb[1], rgb[2], 1)
    b.inputs["Roughness"].default_value = rug
    b.inputs["Metallic"].default_value = met
    m.diffuse_color = (rgb[0], rgb[1], rgb[2], 1)
    return m


def mat_emisivo(nombre, rgb, fuerza=1.0):
    m, n, l, b = _nodos(nombre)
    b.inputs["Base Color"].default_value = (0, 0, 0, 1)
    b.inputs["Emission Color"].default_value = (rgb[0], rgb[1], rgb[2], 1)
    b.inputs["Emission Strength"].default_value = fuerza
    m.diffuse_color = (rgb[0], rgb[1], rgb[2], 1)
    return m


def reasignar(objs, tabla, borrar=()):
    """Sustituye los materiales de los objetos según tabla {nombre_base: material}; elimina las
    caras de los materiales en `borrar` (p. ej. M_Glass)."""
    for o in objs:
        if o.type != "MESH":
            continue
        for i, s in enumerate(o.material_slots):
            nb = base(s.material.name) if s.material else None
            if nb in tabla:
                s.material = tabla[nb]
            elif nb not in borrar:
                print("AVISO material sin tabla:", nb)
        if borrar:
            idx = [i for i, s in enumerate(o.material_slots) if s.material and base(s.material.name) in borrar]
            if idx:
                bpy.context.view_layer.objects.active = o
                bpy.ops.object.mode_set(mode="EDIT")
                bpy.ops.mesh.select_all(action="DESELECT")
                for i in idx:
                    o.active_material_index = i
                    bpy.ops.object.material_slot_select()
                bpy.ops.mesh.delete(type="FACE")
                bpy.ops.object.mode_set(mode="OBJECT")


def hornear_transformacion(o):
    """Aplica la matriz mundial a la malla y deja el objeto en identidad (sin padre)."""
    mw = o.matrix_world.copy()
    o.parent = None
    o.data.transform(mw)
    o.matrix_world = Matrix()


def limites(objs):
    mn = Vector((1e9, 1e9, 1e9)); mx = Vector((-1e9, -1e9, -1e9))
    for o in objs:
        if o.type != "MESH":
            continue
        for c in o.bound_box:
            v = o.matrix_world @ Vector(c)
            for i in range(3):
                mn[i] = min(mn[i], v[i]); mx[i] = max(mx[i], v[i])
    return mn, mx


# ------------------------------------------------------------------ exportación y GLB
def exportar_glb(ruta, objetos, animaciones=False, calidad=80, formato="JPEG"):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objetos:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objetos[0]
    kw = dict(filepath=ruta, export_format="GLB", use_selection=True,
              export_image_format=formato, export_image_quality=calidad,
              export_apply=True, export_yup=True,
              export_animations=animaciones, export_cameras=False, export_lights=False)
    if "export_image_quality" not in bpy.ops.export_scene.gltf.get_rna_type().properties:
        kw.pop("export_image_quality")
    bpy.ops.export_scene.gltf(**kw)


def leer_glb(ruta):
    with open(ruta, "rb") as f:
        datos = f.read()
    ln = struct.unpack("<I", datos[12:16])[0]
    j = json.loads(datos[20:20 + ln].decode("utf-8"))
    return j, datos


def parchear_glb(ruta, fn):
    """Aplica fn(json) y reescribe el GLB (fragmento JSON; el binario queda igual)."""
    j, datos = leer_glb(ruta)
    ln = struct.unpack("<I", datos[12:16])[0]
    resto = datos[20 + ln:]
    fn(j)
    nuevo = json.dumps(j, separators=(",", ":")).encode("utf-8")
    nuevo += b" " * ((4 - len(nuevo) % 4) % 4)
    total = 12 + 8 + len(nuevo) + len(resto)
    with open(ruta, "wb") as f:
        f.write(struct.pack("<4sII", b"glTF", 2, total))
        f.write(struct.pack("<I4s", len(nuevo), b"JSON"))
        f.write(nuevo)
        f.write(resto)


def estadisticas(ruta):
    j, _ = leer_glb(ruta)
    acc = j["accessors"]
    tris = 0
    prim = 0
    for m in j.get("meshes", []):
        for p in m["primitives"]:
            prim += 1
            pos = acc[p["attributes"]["POSITION"]]["count"]
            tris += (acc[p["indices"]]["count"] // 3) if "indices" in p else pos // 3
    dims = None
    mn = [1e9] * 3; mx = [-1e9] * 3
    for m in j.get("meshes", []):
        for p in m["primitives"]:
            a = acc[p["attributes"]["POSITION"]]
            if "min" in a:
                for i in range(3):
                    mn[i] = min(mn[i], a["min"][i]); mx[i] = max(mx[i], a["max"][i])
    anims = [{"nombre": a.get("name"), "duracion_s": _dur(j, a)} for a in j.get("animations", [])]
    return {
        "kb": round(os.path.getsize(ruta) / 1024.0, 1),
        "triangulos": tris,
        "primitivas": prim,
        "materiales": [m.get("name") for m in j.get("materials", [])],
        "imagenes": len(j.get("images", [])),
        "min_xyz": [round(x, 3) for x in mn],
        "max_xyz": [round(x, 3) for x in mx],
        "dimensiones_m": [round(mx[i] - mn[i], 3) for i in range(3)],
        "nodos": [n.get("name") for n in j.get("nodes", [])][:40],
        "animaciones": anims,
    }


def _dur(j, a):
    d = 0.0
    for s in a["samplers"]:
        acc = j["accessors"][s["input"]]
        d = max(d, acc.get("max", [0])[0])
    return round(d, 3)


def guardar_stats(nombre, ruta):
    st = estadisticas(ruta)
    p = os.path.join(SALIDA, "_stats_" + nombre + ".json")
    with open(p, "w", encoding="utf-8") as f:
        json.dump(st, f, indent=1, ensure_ascii=False)
    print("EXPORTADO", nombre, json.dumps({k: st[k] for k in ("kb", "triangulos", "primitivas", "dimensiones_m")}),
          "imagenes", st["imagenes"], "anim", st["animaciones"])
    return st


# ------------------------------------------------------------------ vistas previas (Workbench)
def importar_glb(ruta):
    limpiar()
    bpy.ops.import_scene.gltf(filepath=ruta)
    for m in bpy.data.materials:
        b = m.node_tree.nodes.get("Principled BSDF") if m.node_tree else None
        if b:
            e = b.inputs["Emission Color"].default_value
            if b.inputs["Emission Strength"].default_value > 0 and (e[0] + e[1] + e[2]) > 0 and not b.inputs["Emission Color"].is_linked:
                m.diffuse_color = (e[0], e[1], e[2], 1)
            elif not b.inputs["Base Color"].is_linked:
                c = b.inputs["Base Color"].default_value
                m.diffuse_color = (c[0], c[1], c[2], 1)
    return bpy.context.scene.objects


def vista(png, loc, objetivo, lens=18, res=(1280, 720), fondo=(0.02, 0.03, 0.07), luz="STUDIO", tipo="TEXTURE", cull=False):
    sc = bpy.context.scene
    cam = bpy.data.objects.get("CamVista")
    if cam is None:
        cd = bpy.data.cameras.new("CamVista")
        cam = bpy.data.objects.new("CamVista", cd)
        sc.collection.objects.link(cam)
    cam.data.lens = lens
    cam.data.clip_start = 0.05
    cam.data.clip_end = 200
    cam.location = Vector(loc)
    d = Vector(objetivo) - Vector(loc)
    cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    sc.camera = cam
    sc.render.engine = "BLENDER_WORKBENCH"
    sc.render.resolution_x, sc.render.resolution_y = res
    sc.render.image_settings.file_format = "PNG"
    sh = sc.display.shading
    sh.light = luz
    sh.color_type = tipo
    sh.show_backface_culling = cull
    sh.background_type = "VIEWPORT"
    sh.background_color = fondo
    sc.view_settings.view_transform = "Standard"
    if sc.world is None:
        sc.world = bpy.data.worlds.new("W")
    sc.world.color = fondo
    sc.render.filepath = png
    bpy.ops.render.render(write_still=True)
