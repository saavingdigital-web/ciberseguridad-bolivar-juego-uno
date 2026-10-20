"""Ejemplo mínimo: unidad exterior de aire acondicionado. Sirve de plantilla para los demás modelos."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib_bl import *

nuevo_modelo()
m = mats()
partes = []
# caja principal
partes.append(caja("cuerpo", (1.0, 0.4, 0.8), (0, 0, 0.45), m.pintado, color="#b9bcc0", color_alto="#e4e6e8", bisel=0.025))
# rejilla frontal (el frente mira a -Y de Blender)
for i in range(7):
    partes.append(caja(f"reja{i}", (0.8, 0.02, 0.025), (0, -0.205, 0.2 + i * 0.1), m.pintado, color="#3a3d42", bisel=0.004))
# ventilador
partes.append(cilindro("ventilador", 0.26, 0.03, (0, -0.205, 0.6), m.pintado, color="#25282c", rot=(math.radians(90), 0, 0), vertices=24))
# patas
for x in (-0.38, 0.38):
    partes.append(caja(f"pata{x}", (0.08, 0.34, 0.05), (x, 0, 0.025), m.pintado, color="#5b5f66", bisel=0.01))
# lucecita de estado
partes.append(caja("led", (0.04, 0.02, 0.02), (0.38, -0.205, 0.72), m.emisivo, color="#3dff9a", bisel=0.004))

ac = unir(partes, "ac_unidad_a")
ensuciar(ac, 0.10, semilla=3)
hornear_ao(ac, rayos=20, fuerza=0.5, distancia=0.5)
exportar(ac, "props", "ac_unidad_a", notas="plantilla de ejemplo")
vista_previa("props", "ac_unidad_a", resolucion=(480, 360))
