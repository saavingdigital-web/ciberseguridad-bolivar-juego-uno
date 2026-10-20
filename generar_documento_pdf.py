# -*- coding: utf-8 -*-
"""
Genera el Documento Ejecutivo en PDF para la Secretaría de las TIC de la Gobernación de Bolívar.
Utiliza Microsoft Edge headless para compilar HTML5/CSS moderno en un PDF de calidad editorial.
"""
import os
import subprocess
import base64

DIRECTORIO_RAIZ = r"C:\Users\jonat\Desktop\antygravisti\secretaria TIC\video juego"
PDF_DESTINO_PROYECTO = os.path.join(DIRECTORIO_RAIZ, "DOCUMENTO_EJECUTIVO_CIBERESCUDO_BOLIVAR.pdf")
PDF_DESTINO_ESCRITORIO = r"C:\Users\jonat\Desktop\DOCUMENTO_EJECUTIVO_CIBERESCUDO_BOLIVAR.pdf"

def codificar_base64(ruta_relativa, mime="image/png"):
    ruta_completa = os.path.join(DIRECTORIO_RAIZ, ruta_relativa)
    if not os.path.exists(ruta_completa):
        return ""
    with open(ruta_completa, "rb") as f:
        return f"data:{mime};base64," + base64.b64encode(f.read()).decode("utf-8")

logo_b64 = codificar_base64(r"marca secretaria tic de bolivar\logo_secretaria.png", "image/png")
escudo_b64 = codificar_base64(r"marca secretaria tic de bolivar\escudo.png", "image/png")
skybox_b64 = codificar_base64(r"CiberEscudo_XR\texturas\skybox_ciber_command.jpg", "image/jpeg")
sala_b64 = codificar_base64(r"CiberEscudo_XR\modelos\vistas\scifi_sala_centro_1.png", "image/png")
dron_b64 = codificar_base64(r"CiberEscudo_XR\modelos\vistas\dron_mensaje.png", "image/png")
amigo_b64 = codificar_base64(r"CiberEscudo_XR\modelos\vistas\amigo_holo.png", "image/png")
escudo_amigo_b64 = codificar_base64(r"CiberEscudo_XR\modelos\vistas\escudo_amigo.png", "image/png")
blaster_alien_b64 = codificar_base64(r"CiberEscudo_XR\texturas\concepto_blaster_alien.jpg", "image/jpeg")
guante_espacial_b64 = codificar_base64(r"CiberEscudo_XR\texturas\concepto_guante_espacial.jpg", "image/jpeg")

html_contenido = f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Documento Ejecutivo · CiberEscudo XR · Gobernación de Bolívar</title>
<style>
  @page {{
    size: letter;
    margin: 14mm 14mm 14mm 14mm;
  }}
  * {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
  }}
  body {{
    background-color: #070a12;
    color: #e6ffee;
    line-height: 1.55;
    font-size: 11pt;
  }}
  .pagina {{
    page-break-after: always;
    min-height: 250mm;
    position: relative;
    padding-bottom: 12mm;
  }}
  .pagina:last-child {{
    page-break-after: avoid;
  }}

  /* Encabezados y barras institucionales */
  .header-institucional {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #0a0e1a;
    border: 1px solid #1a263f;
    border-left: 5px solid #ffcc29;
    padding: 10px 16px;
    border-radius: 6px;
    margin-bottom: 16px;
  }}
  .logo-caja {{
    background: #070a09;
    padding: 6px 12px;
    border-radius: 4px;
    display: inline-flex;
    align-items: center;
    gap: 12px;
    border: 1px solid #1f2d26;
  }}
  .logo-caja img {{
    height: 38px;
    object-fit: contain;
  }}
  .header-texto {{
    text-align: right;
  }}
  .header-texto .depto {{
    font-size: 9pt;
    color: #ffcc29;
    font-weight: 700;
    letter-spacing: 1.2px;
  }}
  .header-texto .sec {{
    font-size: 8pt;
    color: #00e5ff;
    font-weight: 600;
  }}

  /* Portada */
  .portada-hero {{
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #00e5ff44;
    margin-bottom: 22px;
    height: 200px;
    background: url('{skybox_b64}') center/cover no-repeat;
  }}
  .portada-overlay {{
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(2, 6, 18, 0.94) 30%, rgba(0, 117, 184, 0.75) 100%);
    padding: 24px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }}
  .badge-operacion {{
    display: inline-block;
    background: rgba(0, 229, 255, 0.15);
    border: 1px solid #00e5ff;
    color: #00e5ff;
    font-size: 8.5pt;
    font-weight: 800;
    padding: 3px 10px;
    border-radius: 3px;
    letter-spacing: 1.5px;
    margin-bottom: 8px;
    width: fit-content;
  }}
  .titulo-principal {{
    font-size: 23pt;
    font-weight: 900;
    color: #ffffff;
    line-height: 1.15;
    letter-spacing: 0.5px;
  }}
  .titulo-principal span {{
    color: #00e5ff;
    text-shadow: 0 0 16px rgba(0, 229, 255, 0.6);
  }}
  .subtitulo-hero {{
    color: #ffcc29;
    font-size: 11pt;
    font-weight: 600;
    margin-top: 6px;
  }}

  /* Secciones y tarjetas */
  h2 {{
    font-size: 13.5pt;
    color: #00e5ff;
    border-bottom: 2px solid #00e5ff44;
    padding-bottom: 4px;
    margin: 16px 0 10px 0;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }}
  h2::before {{
    content: "■";
    color: #ffcc29;
    font-size: 11pt;
  }}
  h3 {{
    font-size: 11pt;
    color: #ffcc29;
    margin: 10px 0 4px 0;
  }}
  p {{
    margin-bottom: 8px;
    color: #c7d5e4;
    font-size: 9.8pt;
    text-align: justify;
  }}
  .grid-2 {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 12px;
  }}
  .grid-3 {{
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
    margin-bottom: 12px;
  }}
  .tarjeta {{
    background: #0d1322;
    border: 1px solid #1b263b;
    border-radius: 6px;
    padding: 10px 12px;
  }}
  .tarjeta.destacada {{
    border-color: #0075b8;
    background: linear-gradient(180deg, #0d1527 0%, #090e1c 100%);
    border-left: 3px solid #00e5ff;
  }}
  .tarjeta.oro {{
    border-left: 3px solid #ffcc29;
  }}
  .tarjeta-titulo {{
    font-size: 10pt;
    font-weight: 700;
    color: #00e5ff;
    margin-bottom: 4px;
  }}
  .tarjeta-texto {{
    font-size: 9pt;
    color: #a8b8cc;
  }}

  /* Tablas de mecánicas */
  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0 14px 0;
    font-size: 9pt;
  }}
  th, td {{
    padding: 7px 10px;
    border: 1px solid #1a2538;
    text-align: left;
  }}
  th {{
    background: #111a2f;
    color: #00e5ff;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 8.5pt;
    letter-spacing: 0.5px;
  }}
  tr:nth-child(even) {{
    background: #0a0f1d;
  }}
  .tag-victoria {{
    background: #00e5ff22;
    color: #00e5ff;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 3px;
    border: 1px solid #00e5ff;
  }}
  .tag-derrota {{
    background: #ff334b22;
    color: #ff4d64;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 3px;
    border: 1px solid #ff4d64;
  }}

  /* Cajas de diseño visual y equipamiento */
  .caja-equipamiento {{
    background: #080d1a;
    border: 1px solid #162238;
    border-radius: 6px;
    padding: 10px;
    margin-bottom: 10px;
    display: flex;
    gap: 14px;
    align-items: center;
  }}
  .caja-equipamiento img {{
    width: 110px;
    height: 95px;
    object-fit: contain;
    background: #04070f;
    border: 1px solid #1c2b45;
    border-radius: 4px;
    padding: 4px;
  }}
  .equip-detalle {{
    flex: 1;
  }}
  .equip-detalle h4 {{
    font-size: 10.5pt;
    color: #00e5ff;
    margin-bottom: 3px;
  }}
  .equip-detalle p {{
    font-size: 8.8pt;
    margin-bottom: 0;
    line-height: 1.45;
  }}

  /* Banner cita institucional */
  .cita-bolivar {{
    background: #0a1120;
    border-left: 4px solid #ffcc29;
    border-right: 1px solid #1a2942;
    border-top: 1px solid #1a2942;
    border-bottom: 1px solid #1a2942;
    padding: 10px 14px;
    border-radius: 4px;
    margin: 12px 0;
  }}
  .cita-bolivar p {{
    font-style: italic;
    color: #ffffff;
    font-size: 9.8pt;
    margin: 0;
  }}
  .cita-autor {{
    text-align: right;
    font-size: 8.5pt;
    color: #ffcc29;
    font-weight: 700;
    margin-top: 4px;
  }}

  /* Footer de página */
  .footer-institucional {{
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #162238;
    padding-top: 6px;
    font-size: 8pt;
    color: #6a7f99;
  }}
  .footer-institucional .oro {{
    color: #ffcc29;
    font-weight: 700;
  }}
</style>
</head>
<body>

  <!-- ==================== PÁGINA 1: PORTADA Y FUNDAMENTOS ==================== -->
  <div class="pagina">
    <div class="header-institucional">
      <div class="logo-caja">
        <img src="{escudo_b64}" alt="Escudo de Bolívar">
        <img src="{logo_b64}" alt="Secretaría de las TIC de Bolívar">
      </div>
      <div class="header-texto">
        <div class="depto">GOBERNACIÓN DE BOLÍVAR</div>
        <div class="sec">SECRETARÍA DE LAS TIC · DIRECCIÓN DE CIBERDEFENSA CIUDADANA</div>
      </div>
    </div>

    <div class="portada-hero">
      <div class="portada-overlay">
        <div class="badge-operacion">INICIATIVA ESTRATÉGICA EDUCATIVA 2026</div>
        <h1 class="titulo-principal">CIBERESCUDO XR <span>· CÓDIGO VERDE</span></h1>
        <div class="subtitulo-hero">Entrenamiento Táctico Inmersivo en Realidad Mixta (Meta Quest 3S) y Web 3D</div>
      </div>
    </div>

    <h2>1. Objetivo General de la Iniciativa</h2>
    <p>
      El programa <strong>CiberEscudo XR · Código Verde</strong> es una respuesta pedagógica y tecnológica pionera desarrollada por la <strong>Secretaría de las TIC de la Gobernación de Bolívar</strong> para capacitar a los estudiantes de <strong>10° y 11° grado</strong> del departamento frente a los riesgos crecientes de la era digital.
    </p>
    <p>
      El objetivo fundamental es sustituir las tradicionales charlas pasivas por una <strong>experiencia inmersiva vivencial</strong> donde los jóvenes desarrollan reflejos psicomotores y juicio crítico para:
    </p>

    <div class="grid-2">
      <div class="tarjeta destacada">
        <div class="tarjeta-titulo">🛡️ Detección Inmediata de Fraudes (Anti-Phishing)</div>
        <div class="tarjeta-texto">
          Identificar en microsegundos patrones de engaño, falsos premios (Robux, diamantes, dinero urgente), enlaces maliciosos (.xyz, .net), troyanos en APKs piratas y tácticas de suplantación bancaria y familiar.
        </div>
      </div>
      <div class="tarjeta oro">
        <div class="tarjeta-titulo">🤝 Cultura del Testigo Activo (Anti-Ciberacoso)</div>
        <div class="tarjeta-texto">
          Erradicar el papel del "espectador pasivo" frente al matoneo escolar en redes. El estudiante aprende a proteger a la víctima, guardar evidencia, bloquear agresores y activar canales de ayuda sin aislarse.
        </div>
      </div>
    </div>

    <h2>2. ¿Por Qué es Beneficioso para los Estudiantes?</h2>
    <p>
      Estudios de neuroeducación demuestran que el aprendizaje inmersivo en Realidad Mixta (XR) incrementa la retención de protocolos de seguridad en un <strong>76% respecto a métodos convencionales</strong>. En este simulador, el estudiante no "lee sobre un ataque", sino que <em>ve y escucha la amenaza aproximarse físicamente a su espacio escolar</em>.
    </p>

    <div class="grid-3">
      <div class="tarjeta">
        <div class="tarjeta-titulo">🧠 Reflejos Bajo Presión</div>
        <div class="tarjeta-texto">
          Entrena la toma de decisiones certera en segundos, evitando que el miedo o la curiosidad dominen la respuesta ante estafas reales.
        </div>
      </div>
      <div class="tarjeta">
        <div class="tarjeta-titulo">🌐 Acceso Universal</div>
        <div class="tarjeta-texto">
          Diseñado bajo estándares WebXR: funciona en Meta Quest 3S a 90 Hz y en computadores escolares normales sin requerir cables ni APKs externas.
        </div>
      </div>
      <div class="tarjeta">
        <div class="tarjeta-titulo">📞 Rutas Reales de Ayuda</div>
        <div class="tarjeta-texto">
          Empodera al estudiante con los números oficiales de Colombia: <strong>Línea 106</strong> (Salud Mental Bolívar), <strong>123</strong> (CAI Virtual) y <strong>Línea 141</strong> (ICBF).
        </div>
      </div>
    </div>

    <div class="cita-bolivar">
      <p>«En Bolívar ningún estudiante enfrenta el ciberacoso en soledad: la tecnología debe ser nuestro escudo protector, nunca un arma de aislamiento.»</p>
      <div class="cita-autor">— Gobernación de Bolívar · Secretaría de las TIC</div>
    </div>

    <div class="footer-institucional">
      <div>Documento Técnico y Pedagógico Oficial · <span class="oro">Secretaría TIC de Bolívar</span></div>
      <div>Página 1 de 3</div>
    </div>
  </div>

  <!-- ==================== PÁGINA 2: DINÁMICA, NIVELES Y REGLAS ==================== -->
  <div class="pagina">
    <div class="header-institucional">
      <div class="logo-caja">
        <img src="{escudo_b64}" alt="Escudo de Bolívar">
        <img src="{logo_b64}" alt="Secretaría de las TIC de Bolívar">
      </div>
      <div class="header-texto">
        <div class="depto">GUÍA METODOLÓGICA DEL VIDEOJUEGO</div>
        <div class="sec">MECÁNICAS DE JUEGO, NIVELES Y CONDICIONES DE VICTORIA</div>
      </div>
    </div>

    <h2>3. Arquitectura y Dinámica de la Partida</h2>
    <p>
      La simulación sitúa al estudiante en el rol de <strong>Guardián Digital de la Unidad de Ciberdefensa Escolar</strong>. La experiencia se estructura en tres niveles fluidos guiados por voz institucional:
    </p>

    <table>
      <thead>
        <tr>
          <th>Nivel / Fase</th>
          <th>Amenaza / Reto</th>
          <th>Mecánica del Jugador</th>
          <th>Locución y Pedagogía</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>NIVEL 1</strong><br>Nodo Escolar<br><em>(Interceptación)</em></td>
          <td>Drones tácticos que emergen de 3 portales transmitiendo mensajes de audio en voz alta (estafas vs. mensajes legítimos).</td>
          <td>
            • <strong>Amenaza:</strong> Disparo inmediato con la mano derecha.<br>
            • <strong>Seguro:</strong> Captura con el guante espacial izquierdo.
          </td>
          <td>La voz explica la dinámica antes de iniciar. Las amenazas que no se destruyen embisten hacia el visor detonando y quitando salud.</td>
        </tr>
        <tr>
          <td><strong>NIVEL 2</strong><br>Alerta Acoso<br><em>(Rescate Mateo)</em></td>
          <td>Ataque coordinado de ciberacoso contra el holograma de Mateo (11°B) con burbujas de humillación y exclusión digital.</td>
          <td>Apunta y derriba con el blaster todas las burbujas tóxicas antes de que golpeen el estado emocional de Mateo.</td>
          <td>Alerta de voz institucional que anuncia la agresión masiva en redes y convoca al estudiante a no ser indiferente.</td>
        </tr>
        <tr>
          <td><strong>NIVEL 3</strong><br>Escudo Solidario<br><em>(Decisiones)</em></td>
          <td>Tarjetas de acción flotantes con decisiones de testigo activo frente al acoso escolar.</td>
          <td>Disparar <strong>SOLO</strong> a las acciones reconstructivas (guardar capturas, reportar, avisar a un adulto, apoyar a Mateo).</td>
          <td>Cada acierto levanta una capa del escudo protector de Mateo, enseñando el protocolo formal de reacción y denuncia.</td>
        </tr>
      </tbody>
    </table>

    <h2>4. ¿Cómo Ganas y Cómo Pierdes en CiberEscudo XR?</h2>

    <div class="grid-2">
      <div class="tarjeta destacada">
        <div class="tarjeta-titulo"><span class="tag-victoria">CONDICIONES DE VICTORIA</span></div>
        <p style="margin-top:6px;">
          • <strong>Supervivencia del Firewall:</strong> Mantener la barra de vida por encima del 0% al culminar la ronda de 90 segundos.<br>
          • <strong>Defensa de Mateo:</strong> Neutralizar las burbujas de agresión y acertar en las 4 decisiones solidarias para activar el 100% de su escudo.<br>
          • <strong>Rango Honorífico:</strong> Consolidar puntos de combo y alcanzar rangos de <em>Defensor Digital Juvenil</em>, <em>Comandante CiberEscudo</em> o <em>Guardián Legendario de Bolívar</em> en la Bitácora local.
        </p>
      </div>
      <div class="tarjeta oro">
        <div class="tarjeta-titulo"><span class="tag-derrota">CONDICIONES DE DERROTA Y PENALIZACIÓN</span></div>
        <p style="margin-top:6px;">
          • <strong>Colapso del Firewall (Derrota Crítica):</strong> Si 4 amenazas no mitigadas embisten y estallan en el visor, la barra de salud llega a cero, interrumpiendo la defensa por brecha de seguridad.<br>
          • <strong>Error de Juicio:</strong> Disparar a un mensaje seguro de familia/colegio o atrapar una estafa con el guante resta puntos y rompe la racha de combo.<br>
          • <strong>Reacción Tóxica en Nivel 3:</strong> Disparar a tarjetas nocivas (<em>"Reenviar al grupo"</em> o <em>"Insultar al agresor"</em>) penaliza la energía del escudo.
        </p>
      </div>
    </div>

    <h2>5. Barra de Salud e Impactos de Amenazas</h2>
    <p>
      Para garantizar inmersión y tensión educativa, el visor HUD cuenta con una <strong>Barra de Salud del Operador [ 100% ]</strong> dividida en 10 segmentos. Las estafas ya no flotan pasivamente: si el estudiante duda, el dron acelera en picado a 12 m/s, detonando contra el visor con <strong>sacudida de cámara tridimensional, destello retiniano rojo y vibración háptica en los mandos Touch de Meta Quest</strong> (-25% de salud por impacto).
    </p>

    <div class="footer-institucional">
      <div>CiberEscudo XR · Manual Operativo del Videojuego · <span class="oro">Gobernación de Bolívar</span></div>
      <div>Página 2 de 3</div>
    </div>
  </div>

  <!-- ==================== PÁGINA 3: PROPUESTA VISUAL Y DIRECTORIO ==================== -->
  <div class="pagina">
    <div class="header-institucional">
      <div class="logo-caja">
        <img src="{escudo_b64}" alt="Escudo de Bolívar">
        <img src="{logo_b64}" alt="Secretaría de las TIC de Bolívar">
      </div>
      <div class="header-texto">
        <div class="depto">PROPUESTA DE DISEÑO DE EQUIPAMIENTO</div>
        <div class="sec">REDISEÑO DE BLASTER (MANO DER.) Y GUANTE ESPACIAL (MANO IZQ.)</div>
      </div>
    </div>

    <h2>6. Propuesta de Diseño: Equipamiento del Guardián Digital</h2>
    <p>
      Atendiendo a la retroalimentación de las pruebas en casco Meta Quest, se presenta la propuesta visual para sustituir el modelo actual por un equipamiento de alta tecnología diferenciado para cada mano:
    </p>

    <div class="caja-equipamiento">
      <img src="{blaster_alien_b64}" alt="Blaster de Plasma Alienígena">
      <div class="equip-detalle">
        <h4>⚡ Mano Derecha: Blaster de Plasma Táctico (Inspiración Covenant / Halo)</h4>
        <p>
          • <strong>Morfología Aerodinámica Curva:</strong> Inspirada en la pistola de plasma y aguijoneador alienígena de Halo. Chasis orgánico-mecánico de aleación metálica cobalto oscuro e iridiscente que se acopla con fluidez a la mano.<br>
          • <strong>Disipadores Térmicos Bio-luminiscentes:</strong> Branquias dorsales que pulsan en cian neón (<code>#00e5ff</code>) y se sobrecargan de luz al apuntar a una amenaza.<br>
          • <strong>Boca de Doble Horquilla Magnética:</strong> En lugar de un cañón cilíndrico rígido, dos pinzas curvas aceleran pulsos electromagnéticos que neutralizan los drones al instante.
        </p>
      </div>
    </div>

    <div class="caja-equipamiento">
      <img src="{guante_espacial_b64}" alt="Guante Espacial Magnético">
      <div class="equip-detalle">
        <h4>🧤 Mano Izquierda: Guante Espacial de Resonancia Magnética (Captura Segura)</h4>
        <p>
          • <strong>Eliminación del Segundo Blaster:</strong> La mano izquierda se libera completamente del arma, mostrando una <strong>mano con guante de astronauta cibernético</strong> con dedos ágiles y abiertos en pose de contención.<br>
          • <strong>Emisor de Vórtice Palmar:</strong> En el centro de la palma incorpora un disco de inducción magnética con aros esmeralda y cian (<code>#2dff6e</code>) que se activan al aproximarse un mensaje seguro (familia, colegio, amigos).<br>
          • <strong>Display de Muñeca:</strong> Mini-pantalla HUD en el antebrazo con la leyenda <em>[ MODO: CAPTURA SEGURA // SEÑAL AUTORIZADA ]</em>.
        </p>
      </div>
    </div>

    <h2>7. Directorio Oficial de Ayuda y Denuncia en Bolívar y Colombia</h2>
    <p>
      Este videojuego no concluye en la simulación; conecta directamente con la institucionalidad del Estado para proteger a los estudiantes en el mundo real:
    </p>

    <table>
      <thead>
        <tr>
          <th>Línea / Canal</th>
          <th>Entidad Responsable</th>
          <th>Tipo de Apoyo</th>
          <th>Acceso</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Línea 106</strong></td>
          <td>Secretaría de Salud y Gobernación de Bolívar</td>
          <td>Apoyo psicosocial inmediato para jóvenes víctimas de ciberacoso, ansiedad o matoneo.</td>
          <td>Gratis desde cualquier celular (24/7)</td>
        </tr>
        <tr>
          <td><strong>CAI Virtual 123</strong></td>
          <td>Policía Nacional de Colombia · Centro Cibernético</td>
          <td>Recepción de denuncias por extorsión digital, sextorsión, suplantación y ciberdelitos.</td>
          <td>Línea 123 o en caivirtual.policia.gov.co</td>
        </tr>
        <tr>
          <td><strong>Línea 141</strong></td>
          <td>Instituto Colombiano de Bienestar Familiar (ICBF)</td>
          <td>Protección urgente de derechos de niños, niñas y adolescentes en entornos digitales.</td>
          <td>Línea gratuita nacional 141</td>
        </tr>
        <tr>
          <td><strong>Te Protejo</strong></td>
          <td>Red Papaz · MinTIC</td>
          <td>Canal de denuncia ciudadana de pornografía infantil, explotación y acoso virtual.</td>
          <td>Portal web teprotejo.org</td>
        </tr>
      </tbody>
    </table>

    <div class="cita-bolivar" style="margin-top:14px;">
      <p>«CiberEscudo XR demuestra que la innovación tecnológica en Bolívar protege el futuro, la dignidad y la vida de nuestra juventud.»</p>
      <div class="cita-autor">— Secretaría de las TIC · Gobernación de Bolívar (2026)</div>
    </div>

    <div class="footer-institucional">
      <div>Gobernación de Bolívar · <span class="oro">Secretaría TIC</span> · Documento Oficial para Instituciones Educativas</div>
      <div>Página 3 de 3</div>
    </div>
  </div>

</body>
</html>
"""

html_temp = os.path.join(DIRECTORIO_RAIZ, "_temp_doc_ejecutivo.html")
with open(html_temp, "w", encoding="utf-8") as f:
    f.write(html_contenido)

print("HTML temporal generado:", html_temp)

edge_bin = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
cmd = [
    edge_bin,
    "--headless",
    "--disable-gpu",
    "--no-pdf-header-footer",
    f"--print-to-pdf={PDF_DESTINO_PROYECTO}",
    html_temp
]

print("Compilando PDF con Edge...")
res = subprocess.run(cmd, capture_output=True, text=True)
print("Salida Edge:", res.returncode)

if os.path.exists(PDF_DESTINO_PROYECTO):
    print("PDF creado exitosamente en:", PDF_DESTINO_PROYECTO)
    import shutil
    shutil.copyfile(PDF_DESTINO_PROYECTO, PDF_DESTINO_ESCRITORIO)
    print("Copia creada en el Escritorio:", PDF_DESTINO_ESCRITORIO)
else:
    print("Error al generar PDF:", res.stderr)

if os.path.exists(html_temp):
    os.remove(html_temp)
