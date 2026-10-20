"""Vistas previas Workbench de los GLB del kit: python scifi_vistas.py -- alien|plataforma|sala"""
import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scifi_comun import *

que = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else ["alien", "plataforma", "sala"]
V = lambda n: os.path.join(VISTAS, "scifi_" + n + ".png")

if "alien" in que:
    importar_glb(os.path.join(SALIDA, "alien_cyclop.glb"))
    # glTF +Z = Blender -Y. Frente del alien hacia +Z glTF -> camara en -Y de Blender
    vista(V("alien_frente"), (0, -4.0, 1.0), (0, 0, 0.95), lens=40, res=(800, 800), tipo="MATERIAL")
    vista(V("alien_34"), (2.8, -2.8, 1.6), (0, 0, 0.95), lens=40, res=(800, 800), tipo="MATERIAL")
    vista(V("alien_lado"), (4.0, 0, 1.0), (0, 0, 0.95), lens=40, res=(800, 800), tipo="MATERIAL")
if "plataforma" in que:
    importar_glb(os.path.join(SALIDA, "plataforma_mando.glb"))
    vista(V("plataforma_arriba"), (0, -0.01, 12), (0, 0, 0), lens=35, res=(900, 900))
    vista(V("plataforma_34"), (7, -7, 4.5), (0, 0, 0), lens=35, res=(900, 700))
if "sala" in que:
    importar_glb(os.path.join(SALIDA, "sala_mando.glb"))
    ojo = 1.6
    for k, ang in enumerate((0, 120, 240)):
        a = math.radians(ang)
        vista(V("sala_centro_%d" % k), (0, 0, ojo), (math.cos(a) * 8, math.sin(a) * 8, ojo + 0.5), lens=14, res=(1280, 720))
    vista(V("sala_arriba"), (0, -0.01, 28), (0, 0, 0), lens=35, res=(1000, 1000))
    vista(V("sala_exterior"), (14, -14, 12), (0, 0, 1.5), lens=30, res=(1100, 800))
