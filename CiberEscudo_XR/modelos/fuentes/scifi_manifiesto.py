"""Escribe modelos/scifi/manifiesto.json y CREDITOS.txt a partir de los GLB exportados (python normal, sin Blender)."""
import os, sys, json, struct
AQUI = os.path.dirname(os.path.abspath(__file__))
SAL = os.path.join(AQUI, "..", "scifi")


def leer(ruta):
    d = open(ruta, "rb").read()
    n = struct.unpack("<I", d[12:16])[0]
    return json.loads(d[20:20 + n])


def stats(ruta):
    j = leer(ruta)
    acc = j["accessors"]
    tris = prim = 0
    for m in j["meshes"]:
        for p in m["primitives"]:
            prim += 1
            tris += acc[p["indices"]]["count"] // 3
    return j, tris, prim


extra = {
    "alien_cyclop.glb": {
        "descripcion": "Alien_Cyclop (2 m, un ojo) con esqueleto y animacion Alien_Idle (flotar/cernirse, bucle)",
        "origen": "base del cuerpo en reposo en Y=0, centrado en X/Z",
        "orientacion": "frente (ojo) hacia +Z de glTF",
        "notas": "Materiales de color plano (M_Alien_Body_Blue, M_Alien_Eyes); la fuente no define emision en los ojos."},
    "plataforma_mando.glb": {
        "descripcion": "Platform_Round1 (D 6 m) + anillo cian emisivo #00f7ff en el reborde",
        "origen": "centro; cara superior central a Y=0; base a Y=-0.17; el reborde exterior queda a Y=-0.11",
        "orientacion": "simetrica (revolucion)",
        "notas": "Texturas 512 px sin mapa normal para cumplir 150 KB."},
    "sala_mando.glb": {
        "descripcion": "Sala circular estatica: 12 paredes de 4 m (6 ventanas), cornisa superior, 12 columnas, utileria, decals, luces emisivas, suelo oscuro",
        "origen": "centro de la sala en X/Z; Y=0 coincide con la cara superior de la plataforma; suelo en Y=-0.17",
        "orientacion": "pared del logo ASTRANOVA justo delante (-Z de glTF) y otra detras (+Z); ventanas a los lados; sin techo",
        "notas": "Radio de pared 7.46 m (apotema), 7.73 m (vertice); altura 5 m (3 m pared + 2 m cornisa); ojos a 1.6 m."},
}
man = {"origen_kit": "Modular SciFi MegaKit [Standard] - Quaternius (CC0 1.0)", "archivos": {}}
for nombre in ("alien_cyclop.glb", "plataforma_mando.glb", "sala_mando.glb"):
    r = os.path.join(SAL, nombre)
    j, tris, prim = stats(r)
    st = json.load(open(os.path.join(SAL, "_stats_" + nombre[:-4] + ".json"), encoding="utf-8"))
    man["archivos"][nombre] = dict(
        triangulos=tris, kb=round(os.path.getsize(r) / 1024.0, 1), primitivas=prim,
        materiales=[m["name"] for m in j["materials"]], imagenes=len(j.get("images", [])),
        dimensiones_m_xyz_gltf=st["dimensiones_m"], min_xyz=st["min_xyz"], max_xyz=st["max_xyz"],
        nodos_principales=[n.get("name") for n in j["nodes"]][:40],
        animaciones=[{"nombre": a["name"], "duracion_s": st["animaciones"][k]["duracion_s"]} for k, a in enumerate(j.get("animations", []))],
        **extra[nombre])
json.dump(man, open(os.path.join(SAL, "manifiesto.json"), "w", encoding="utf-8"), indent=1, ensure_ascii=False)
open(os.path.join(SAL, "CREDITOS.txt"), "w", encoding="utf-8").write(
    "Modular SciFi MegaKit [Standard] por Quaternius (https://quaternius.com), licencia CC0 1.0\n")
print(json.dumps({k: (v["triangulos"], v["kb"]) for k, v in man["archivos"].items()}))
