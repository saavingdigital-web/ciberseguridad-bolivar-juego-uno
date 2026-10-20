"""Piezas de fachada y azotea compartidas por los scripts de arquitectura. Todas trabajan en el marco local:
la fachada está en y=0 y el exterior es -Y."""
from arq_util import *

VID_OSC = ("#223d4d", "#3d6c84")       # cristal apagado (abajo, arriba)
VID_OSC2 = ("#1d3344", "#35607a")


def lit_color(c, ambar=0.35):
    return LIT_AMBAR if c.rnd() < ambar else LIT_CALIDO


def ventana(c, u, z, w, h, lit=0.22, marco="#f3ead6", postigo=None, reja=False, dintel=True, alfeizar=True,
            prof=0.10, vid=VID_OSC, cruz=True, luz=None):
    """Ventana de fachada colonial: marco en relieve, cristal (o luz encendida), cruceta, alféizar, dintel, postigos o reja."""
    c.box(u - w / 2 - 0.08, u + w / 2 + 0.08, -prof, 0.0, z - 0.08, z + h + 0.08, marco, sin="ubt")
    on = c.rnd() < lit
    if on:
        c.pano(u - w / 2, u + w / 2, z, z + h, -prof - 0.012, luz or lit_color(c), mat=1)
    else:
        c.pano(u - w / 2, u + w / 2, z, z + h, -prof - 0.012, vid[0], col2=vid[1])
    if cruz:
        c.pano(u - 0.025, u + 0.025, z, z + h, -prof - 0.02, marco)
        c.pano(u - w / 2, u + w / 2, z + h * 0.55 - 0.025, z + h * 0.55 + 0.025, -prof - 0.02, marco)
    if dintel:
        c.box(u - w / 2 - 0.16, u + w / 2 + 0.16, -prof - 0.05, 0.0, z + h + 0.08, z + h + 0.22, marco, sin="ub")
    if alfeizar:
        c.box(u - w / 2 - 0.16, u + w / 2 + 0.16, -prof - 0.14, 0.0, z - 0.17, z - 0.07, mezcla(marco, "#8a7a62", 0.3), sin="ub")
    if reja:
        n = max(3, int(w / 0.2))
        for i in range(n):
            x = u - w / 2 + 0.1 + i * (w - 0.2) / max(1, n - 1)
            c.pano(x - 0.018, x + 0.018, z, z + h, -prof - 0.03, "#1b1c20")
    if postigo:
        sw = w / 2 * 0.98
        for sg in (-1, 1):
            xc = u + sg * (w / 2 + 0.1 + sw / 2)
            c.box(xc - sw / 2, xc + sw / 2, -0.075, -0.01, z - 0.05, z + h + 0.05, postigo, sin="ubtl" if False else "ub")
            for k in range(1, 5):
                zz = z + (h + 0.1) * k / 5
                c.pano(xc - sw / 2 + 0.05, xc + sw / 2 - 0.05, zz, zz + 0.06, -0.082, tono(postigo, 0.7))


def arco_perfil(u, w, h, z0=0.0, n=6):
    """Puntos (x,z) de un vano con arco de medio punto: arranca abajo-izquierda, sube, rodea el arco y baja a la derecha."""
    r = w / 2
    zc = z0 + h - r
    pts = [(u - r, z0)]
    for i in range(n + 1):
        a = math.pi - math.pi * i / n
        pts.append((u + r * math.cos(a), zc + r * math.sin(a)))
    pts.append((u + r, z0))
    return pts


def puerta_arco(c, u, w, h, z0=0.12, marco="#efe6d2", madera="#6b3f22", f=0.22, prof=0.17, hojas=True, clave=True, lit=False):
    """Portón con arco: marco de piedra con derrame, hoja de madera con entablado y herraje."""
    inner = arco_perfil(u, w, h, z0)
    # el marco crece hacia fuera; los puntos de abajo se quedan a ras del suelo
    outer = []
    n = len(inner)
    r = w / 2 + f
    zc = z0 + h - w / 2
    outer.append((u - r, z0))
    for i in range(1, n - 1):
        px, pz = inner[i]
        dx, dz = px - u, pz - zc
        d = math.hypot(dx, dz) or 1
        outer.append((u + dx / d * (d + f), zc + dz / d * (d + f)))
    outer.append((u + r, z0))
    for i in range(n - 1):
        c.poly([(outer[i][0], -prof, outer[i][1]), (outer[i + 1][0], -prof, outer[i + 1][1]),
                (inner[i + 1][0], -prof, inner[i + 1][1]), (inner[i][0], -prof, inner[i][1])], marco, hacia=(0, -1, 0))
        # derrame (la jamba interior)
        a, b = inner[i], inner[i + 1]
        cx = u; cz = zc if a[1] > zc or b[1] > zc else (a[1] + b[1]) / 2
        mx = (a[0] + b[0]) / 2 - u; mz = (a[1] + b[1]) / 2 - zc if (a[1] + b[1]) / 2 > zc else 0
        c.poly([(a[0], -prof, a[1]), (b[0], -prof, b[1]), (b[0], -0.05, b[1]), (a[0], -0.05, a[1])], tono(marco, 0.62), hacia=(-mx, 0, -mz))
    # hoja
    c.poly([(p[0], -0.05, p[1]) for p in inner], None, 0, hacia=(0, -1, 0), cols=[L(madera)] * len(inner))
    if hojas:
        c.pano(u - 0.02, u + 0.02, z0, z0 + h - w / 2 + 0.3, -0.058, tono(madera, 0.5))
        for sg in (-1, 1):
            for k in range(2):
                xx = u + sg * (0.18 + k * 0.2)
                c.pano(xx - 0.012, xx + 0.012, z0 + 0.1, z0 + h - w / 2 - 0.1, -0.056, tono(madera, 0.78))
        # clavos/herraje
        c.box(u - 0.2, u - 0.12, -0.09, -0.05, z0 + 1.0, z0 + 1.1, "#252320", sin="ub")
        c.box(u + 0.12, u + 0.2, -0.09, -0.05, z0 + 1.0, z0 + 1.1, "#252320", sin="ub")
    if clave:
        c.box(u - 0.13, u + 0.13, -prof - 0.05, 0.0, z0 + h + f * 0.2 - 0.02, z0 + h + f + 0.14, tono(marco, 0.92), sin="ub")
    return inner


def balaustre(c, x, y, z0, z1, col, r=0.045):
    """Balaustre torneado (dos troncos y cuello)."""
    zm = z0 + (z1 - z0) * 0.38
    zn = z0 + (z1 - z0) * 0.72
    pol = lambda rad, cx=x, cy=y: [(cx - rad, cy - rad), (cx + rad, cy - rad), (cx + rad, cy + rad), (cx - rad, cy + rad)]
    c.prisma(pol(r * 0.55), z0, zm, col, top=pol(r), tapa=False)
    c.prisma(pol(r), zm, zn, col, top=pol(r * 0.5), tapa=False)
    c.prisma(pol(r * 0.5), zn, z1, col, top=pol(r * 0.8), tapa=False)


def baranda(c, x0, x1, y, z, h, col, pasamano=None, paso=0.3, r=0.045, extremos=True):
    """Baranda de balaustres torneados a lo largo de X (en y)."""
    pasamano = pasamano or tono(col, 0.85)
    c.box(x0 - 0.06, x1 + 0.06, y - 0.07, y + 0.07, z + h - 0.07, z + h + 0.05, pasamano, sin="u")
    c.box(x0, x1, y - 0.05, y + 0.05, z, z + 0.08, pasamano, sin="u")
    n = max(2, int((x1 - x0) / paso))
    for i in range(n + 1):
        x = x0 + (x1 - x0) * i / n
        balaustre(c, x, y, z + 0.08, z + h - 0.07, col, r)


def maceta(c, x, y, z, r=0.2, col="#b8552f", planta="#3f8a45", flor=None):
    c.cil(x, y, r, z, z + r * 1.3, col, col2=mezcla(col, "#ffffff", 0.15), n=8, r2=r * 1.15)
    c.cil(x, y, r * 1.2, z + r * 1.3, z + r * 2.1, planta, col2=mezcla(planta, "#d8ffb0", 0.25), n=7, r2=r * 0.7)
    if flor:
        for k in range(3):
            a = k * 2.1
            c.box(x + math.cos(a) * r * 0.55 - 0.05, x + math.cos(a) * r * 0.55 + 0.05, y + math.sin(a) * r * 0.55 - 0.05,
                  y + math.sin(a) * r * 0.55 + 0.05, z + r * 1.9, z + r * 1.9 + 0.1, flor)


def farol(c, u, z, col="#262626", brazo=0.38):
    """Farol de pared con brazo de hierro y cristal encendido."""
    c.box(u - 0.03, u + 0.03, -brazo, 0.0, z, z + 0.05, col, sin="ub")
    c.box(u - 0.03, u + 0.03, -0.05, 0.0, z - 0.25, z + 0.05, col, sin="ub")
    yy = -brazo
    c.prisma([(u - 0.1, yy - 0.1), (u + 0.1, yy - 0.1), (u + 0.1, yy + 0.1), (u - 0.1, yy + 0.1)], z - 0.34, z - 0.04, col,
             top=[(u - 0.14, yy - 0.14), (u + 0.14, yy - 0.14), (u + 0.14, yy + 0.14), (u - 0.14, yy + 0.14)], tapa=False)
    c.box(u - 0.09, u + 0.09, yy - 0.09, yy + 0.09, z - 0.30, z - 0.08, LIT_AMBAR, mat=1, sin="u")
    c.prisma([(u - 0.16, yy - 0.16), (u + 0.16, yy - 0.16), (u + 0.16, yy + 0.16), (u - 0.16, yy + 0.16)], z - 0.04, z + 0.12, col, esc=0.15)


def escudo(c, u, z, w=0.7, h=0.85, col="#c23b3b", borde="#e8c55a", y=0.0, prof=0.08):
    """Escudo heráldico sobre la fachada (perfil de escudo extruido) con corona."""
    r = w / 2
    pts = [(u - r, z + h), (u + r, z + h), (u + r, z + h * 0.45)]
    for i in range(1, 5):
        a = i / 5
        pts.append((u + r * (1 - a) ** 1.2, z + h * 0.45 * (1 - a * a)))
    pts += [(u, z)]
    for i in range(1, 5):
        a = i / 5
        pts.append((u - r * a ** 1.2, z + h * 0.45 * (a * a)))
    pts = [(u - r, z + h), (u + r, z + h), (u + r, z + h * 0.45), (u + r * 0.6, z + h * 0.16), (u, z), (u - r * 0.6, z + h * 0.16), (u - r, z + h * 0.45)]
    mb = [(u - r - 0.07, z + h + 0.07), (u + r + 0.07, z + h + 0.07), (u + r + 0.07, z + h * 0.45), (u + r * 0.6 + 0.04, z + h * 0.1), (u, z - 0.09),
          (u - r * 0.6 - 0.04, z + h * 0.1), (u - r - 0.07, z + h * 0.45)]
    c.extruir_xz(mb, y - prof, y, borde, sin_base=False)
    c.extruir_xz(pts, y - prof - 0.03, y, col, sin_base=False)
    c.pano(u - 0.05, u + 0.05, z + h * 0.2, z + h * 0.9, y - prof - 0.04, borde)
    c.pano(u - r * 0.8, u + r * 0.8, z + h * 0.55, z + h * 0.62, y - prof - 0.04, borde)
    # corona
    c.box(u - 0.2, u + 0.2, y - 0.07, y, z + h + 0.07, z + h + 0.2, borde, sin="ub")
    for k in (-1, 0, 1):
        c.prisma([(u + k * 0.14 - 0.035, y - 0.05), (u + k * 0.14 + 0.035, y - 0.05), (u + k * 0.14 + 0.035, y), (u + k * 0.14 - 0.035, y)], z + h + 0.2, z + h + 0.34, borde, esc=0.4)


def pinaculo(c, x, y, z, r=0.2, alto=0.9, col="#efe6d2", punta="#c8643b"):
    c.box(x - r, x + r, y - r, y + r, z, z + alto * 0.55, col, sin="u")
    c.prisma([(x - r * 1.2, y - r * 1.2), (x + r * 1.2, y - r * 1.2), (x + r * 1.2, y + r * 1.2), (x - r * 1.2, y + r * 1.2)], z + alto * 0.55, z + alto * 0.7, col, esc=0.75, tapa=False)
    c.prisma([(x - r * 0.9, y - r * 0.9), (x + r * 0.9, y - r * 0.9), (x + r * 0.9, y + r * 0.9), (x - r * 0.9, y + r * 0.9)], z + alto * 0.7, z + alto, punta, esc=0.0, tapa=False)


def toldo(c, x0, x1, z, prof, col1, col2, y=0.0, franjas=6, caida=0.55):
    """Toldo inclinado de rayas con volante frontal."""
    for i in range(franjas):
        a = x0 + (x1 - x0) * i / franjas; b = x0 + (x1 - x0) * (i + 1) / franjas
        col = col1 if i % 2 == 0 else col2
        c.poly([(a, y, z), (b, y, z), (b, y - prof, z - caida), (a, y - prof, z - caida)], col, hacia=(0, -1, 1))
        c.poly([(a, y - prof, z - caida), (b, y - prof, z - caida), (b, y - prof - 0.01, z - caida - 0.22), (a, y - prof - 0.01, z - caida - 0.22)], col, hacia=(0, -1, 0))
    for x in (x0, x1):
        c.poly([(x, y, z), (x, y - prof, z - caida), (x, y, z - caida)], tono(col1, 0.75), hacia=(1 if x == x1 else -1, 0, 0))


def aire_acond(c, u, z, y=0.0, w=0.8, h=0.55, col="#d9dcdf"):
    """Unidad de aire acondicionado sobre ménsulas a la fachada (con rejilla y ventilador)."""
    d = 0.32
    c.box(u - w / 2, u + w / 2, y - d - 0.05, y - 0.05, z, z + h, col, mezcla(col, "#ffffff", 0.3), sin="ub")
    c.box(u - w / 2 + 0.04, u - w / 2 + 0.09, y - 0.05, y, z - 0.12, z, "#60646a", sin="ub")
    c.box(u + w / 2 - 0.09, u + w / 2 - 0.04, y - 0.05, y, z - 0.12, z, "#60646a", sin="ub")
    for k in range(3):
        c.pano(u - w / 2 + 0.06, u + w / 2 - 0.06, z + 0.1 + k * 0.14, z + 0.14 + k * 0.14, y - d - 0.056, "#41454b")
    c.pano(u + w / 2 - 0.16, u + w / 2 - 0.1, z + h - 0.11, z + h - 0.07, y - d - 0.056, "#3dff9a", mat=1)


def tendedero(c, x0, x1, y, z, h=0.7, n=None, cols=None):
    """Cuerda con ropa colgada entre dos soportes, con prendas de colores."""
    cols = cols or ["#d9788c", "#f2f2f2", "#3fa7a0", "#e8c55a", "#8ecae6", "#c8643b", "#ffffff"]
    c.box(x0 - 0.02, x0 + 0.02, y - 0.02, y + 0.02, z, z + h + 0.2, "#6b6f75", sin="u")
    c.box(x1 - 0.02, x1 + 0.02, y - 0.02, y + 0.02, z, z + h + 0.2, "#6b6f75", sin="u")
    c.box(x0, x1, y - 0.012, y + 0.012, z + h + 0.18, z + h + 0.21, "#d8d4c8", sin="u")
    n = n or max(3, int((x1 - x0) / 0.5))
    for i in range(n):
        a = x0 + 0.12 + (x1 - x0 - 0.24) * i / max(1, n)
        w = 0.3 + 0.12 * c.rnd()
        hh = 0.45 + 0.3 * c.rnd()
        col = c.R.choice(cols)
        c.poly([(a, y, z + h + 0.18), (a + w, y, z + h + 0.18), (a + w * 0.95, y, z + h + 0.18 - hh), (a + w * 0.05, y, z + h + 0.18 - hh)], col, hacia=(0, -1, 0))
        c.poly([(a, y, z + h + 0.18), (a + w, y, z + h + 0.18), (a + w * 0.95, y, z + h + 0.18 - hh), (a + w * 0.05, y, z + h + 0.18 - hh)], tono(col, 0.8), hacia=(0, 1, 0))


def tanque(c, x, y, z, r=0.8, alto=1.3, col="#2c4f7a"):
    """Tanque de agua cilíndrico sobre patas, con tapa cónica."""
    for k in range(4):
        a = math.pi / 4 + k * math.pi / 2
        px, py = x + math.cos(a) * r * 0.7, y + math.sin(a) * r * 0.7
        c.box(px - 0.05, px + 0.05, py - 0.05, py + 0.05, z, z + 0.7, "#555a60", sin="u")
    c.cil(x, y, r * 1.02, z + 0.7, z + 0.78, "#444850", n=12)
    c.cil(x, y, r, z + 0.78, z + 0.78 + alto, col, col2=mezcla(col, "#ffffff", 0.18), n=12)
    c.cil(x, y, r * 1.03, z + 0.78 + alto * 0.5, z + 0.78 + alto * 0.55, tono(col, 0.7), n=12, tapa=False)
    c.cil(x, y, r, z + 0.78 + alto, z + 1.18 + alto, mezcla(col, "#ffffff", 0.25), n=12, r2=r * 0.28)
    c.box(x - 0.07, x + 0.07, y - 0.07, y + 0.07, z + 1.18 + alto, z + 1.28 + alto, "#303337", sin="u")


def antena(c, x, y, z, alto=5.0, col="#7c8086"):
    """Antena de azotea: mástil, riostras y travesaños con luz roja de aviso."""
    c.box(x - 0.04, x + 0.04, y - 0.04, y + 0.04, z, z + alto, col, sin="u")
    for k, f in enumerate((0.55, 0.75, 0.9)):
        ww = 0.7 - 0.2 * k
        c.box(x - ww, x + ww, y - 0.015, y + 0.015, z + alto * f, z + alto * f + 0.03, col, sin="u")
    for a in (0, 1.57, 3.14, 4.71):
        px, py = x + math.cos(a) * 0.7, y + math.sin(a) * 0.7
        c.poly([(x, y, z + alto * 0.55), (px + 0.015, py, z), (px - 0.015, py, z)], tono(col, 0.8), hacia=(math.cos(a), math.sin(a), 0))
    c.box(x - 0.05, x + 0.05, y - 0.05, y + 0.05, z + alto, z + alto + 0.1, "#ff3b30", mat=1, sin="u")


def caja_escalera(c, x0, x1, y0, y1, z, alto=2.6, col="#cfc8ba", puerta_lado="f"):
    """Caja de escalera de azotea con losa que sobresale, puerta metálica y luz."""
    c.box(x0, x1, y0, y1, z, z + alto, col, mezcla(col, "#ffffff", 0.12), sin="u")
    c.box(x0 - 0.15, x1 + 0.15, y0 - 0.15, y1 + 0.15, z + alto, z + alto + 0.2, tono(col, 0.82), sin="u")
    cx = (x0 + x1) / 2
    c.box(cx - 0.5, cx + 0.5, y0 - 0.05, y0, z, z + 2.0, "#3b4047", sin="ub")
    c.box(cx - 0.12, cx + 0.12, y0 - 0.12, y0 - 0.05, z + 2.1, z + 2.2, LIT_CALIDO, mat=1, sin="ub")


def pretil(c, x0, x1, y0, y1, z, h=0.9, g=0.28, col="#d4d0c6", tapa="#bdb8ac", sin=""):
    """Pretil perimetral con remate/albardilla. `sin`: lados omitidos (f,b,l,r)."""
    if "f" not in sin:
        c.box(x0, x1, y0, y0 + g, z, z + h, col, sin="u")
        c.box(x0 - 0.06, x1 + 0.06, y0 - 0.06, y0 + g + 0.06, z + h, z + h + 0.1, tapa, sin="u")
    if "b" not in sin:
        c.box(x0, x1, y1 - g, y1, z, z + h, col, sin="u")
        c.box(x0 - 0.06, x1 + 0.06, y1 - g - 0.06, y1 + 0.06, z + h, z + h + 0.1, tapa, sin="u")
    if "l" not in sin:
        c.box(x0, x0 + g, y0 + g, y1 - g, z, z + h, col, sin="u")
        c.box(x0 - 0.06, x0 + g + 0.06, y0 + g, y1 - g, z + h, z + h + 0.1, tapa, sin="u")
    if "r" not in sin:
        c.box(x1 - g, x1, y0 + g, y1 - g, z, z + h, col, sin="u")
        c.box(x1 - g - 0.06, x1 + 0.06, y0 + g, y1 - g, z + h, z + h + 0.1, tapa, sin="u")
