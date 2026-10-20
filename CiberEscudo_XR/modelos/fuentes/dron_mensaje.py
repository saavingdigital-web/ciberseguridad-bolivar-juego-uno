"""dron_mensaje.glb - dron-amenaza. Frente (lente) a -Y de Blender. Origen = centro del dron.
Nodos: 'cuerpo' (todo fusionado) y 'anillo' (hijo, pieza aparte para rotar sobre el eje vertical)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib_bl import *

R90 = math.radians(90)
nuevo_modelo()
m = mats()
P = []

# --- carcasa octogonal (dos mitades) + cinturón luminoso
P.append(cono("casco_sup", 0.125, 0.078, 0.06, (0, 0, 0.036), m.pintado, "#2a3563", "#4a5c9a", vertices=8, rot=(0, 0, math.radians(22.5)), suave=False))
P.append(cono("casco_inf", 0.078, 0.125, 0.06, (0, 0, -0.036), m.pintado, "#151c38", "#2a3563", vertices=8, rot=(0, 0, math.radians(22.5)), suave=False))
P.append(cilindro("cinturon", 0.131, 0.014, (0, 0, 0), m.naranja, "#ff9d00", bisel=0, vertices=8, rot=(0, 0, math.radians(22.5)), suave=False))
# cúpula superior con ranuras de ventilación
P.append(cilindro("cupula", 0.052, 0.034, (0, 0, 0.083), m.pintado, "#34437a", "#566aab", bisel=0, vertices=8, suave=False))
for i, y in enumerate((-0.024, 0.0, 0.024)):
    P.append(caja(f"ranura{i}", (0.074, 0.009, 0.004), (0, y, 0.1), m.pintado, "#03050a", bisel=0, suave=False))
# --- lente frontal (-Y) y ceño
P.append(cilindro("lente_caja", 0.064, 0.036, (0, -0.112, 0), m.pintado, "#0d1226", "#1b2447", bisel=0, rot=(R90, 0, 0), vertices=12, suave=False))
P.append(cilindro("lente", 0.044, 0.02, (0, -0.13, 0), m.cian, "#00f7ff", bisel=0, rot=(R90, 0, 0), vertices=12, suave=False))
P.append(cilindro("pupila", 0.016, 0.014, (0, -0.138, 0), m.blanco, "#ffffff", bisel=0, rot=(R90, 0, 0), vertices=8, suave=False))
for s in (-1, 1):
    P.append(caja(f"ceno{s}", (0.075, 0.014, 0.016), (0.062 * s, -0.114, 0.056), m.naranja, "#ff9d00", bisel=0, rot=(0, math.radians(22) * s, math.radians(-24) * s), suave=False))
# --- vainas laterales con luces
for s in (-1, 1):
    P.append(caja(f"vaina{s}", (0.038, 0.09, 0.05), (0.128 * s, 0.01, 0), m.pintado, "#1a2244", "#3a4a80", bisel=0.006, segs=1))
    P.append(caja(f"luz_vaina{s}", (0.01, 0.07, 0.014), (0.149 * s, 0.01, 0), m.naranja, "#ff9d00", bisel=0, suave=False))
    P.append(caja(f"luz_frente{s}", (0.03, 0.01, 0.014), (0.128 * s, -0.036, 0.0), m.naranja, "#ff9d00", bisel=0, suave=False))
# --- propulsor trasero (+Y)
P.append(cilindro("tobera", 0.044, 0.04, (0, 0.13, 0), m.pintado, "#0d1226", "#1b2447", bisel=0, rot=(R90, 0, 0), vertices=8, suave=False))
P.append(cilindro("fuego", 0.028, 0.02, (0, 0.145, 0), m.naranja, "#ff9d00", bisel=0, rot=(R90, 0, 0), vertices=8, suave=False))
# --- antenas
for s in (-1, 1):
    P.append(cilindro(f"antena{s}", 0.0045, 0.14, (0.062 * s, 0.07, 0.13), m.pintado, "#8892b8", bisel=0, rot=(math.radians(-14), math.radians(16) * s, 0), vertices=6, suave=False))
    P.append(esfera(f"punta{s}", 0.011, (0.0835 * s, 0.092, 0.192), m.naranja, "#ff9d00", segmentos=6, anillos=4, suave=False))
# --- sensor inferior
P.append(cono("sensor", 0.024, 0.002, 0.055, (0, 0, -0.098), m.pintado, "#8892b8", vertices=6, rot=(math.radians(180), 0, 0), suave=False))
P.append(esfera("sensor_luz", 0.012, (0, 0, -0.128), m.cian, "#00f7ff", segmentos=6, anillos=4, suave=False))
for sx in (-1, 1):
    for sy in (-1, 1):
        P.append(caja(f"luz_inf{sx}{sy}", (0.03, 0.03, 0.012), (0.066 * sx, 0.066 * sy, -0.062), m.naranja, "#ff9d00", bisel=0, rot=(0, 0, math.radians(45)), suave=False))

cuerpo = unir(P, "cuerpo")
ensuciar(cuerpo, 0.08, semilla=4)
hornear_ao(cuerpo, rayos=16, fuerza=0.55, distancia=0.1)

# --- anillo giratorio (aparte)
A = []
A.append(toro("anillo_aro", 0.168, 0.012, (0, 0, 0), m.pintado, "#232d52", "#232d52", seg=16, seg_menor=5, suave=False))
for i in range(8):
    a = i * math.pi / 4
    mat = m.naranja if i % 2 == 0 else m.cian
    col = "#ff9d00" if i % 2 == 0 else "#00f7ff"
    A.append(caja(f"bloque{i}", (0.05, 0.02, 0.026), (math.cos(a) * 0.168, math.sin(a) * 0.168, 0), mat, col, bisel=0, rot=(0, 0, a + R90), suave=False))
anillo = unir(A, "anillo")
hornear_ao(anillo, rayos=12, fuerza=0.4, distancia=0.06)
anillo.parent = cuerpo

exportar([cuerpo, anillo], "dron_mensaje", notas="frente(lente) a -Y Blender = +Z glTF; anillo hijo de cuerpo, gira sobre Y glTF",
         nodos=["cuerpo", "anillo"])
vista_previa("dron_mensaje", [cuerpo, anillo])
