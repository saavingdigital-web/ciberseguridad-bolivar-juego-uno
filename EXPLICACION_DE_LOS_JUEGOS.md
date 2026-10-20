# Explicación y Arquitectura Narrativa de los Videojuegos de Ciberseguridad
**Gobernación de Bolívar · Secretaría de las TIC**

Documento técnico, pedagógico y narrativo que describe el ecosistema de dos videojuegos educativos de ciberseguridad diseñados para estudiantes de 10° y 11° del departamento de Bolívar, jugables en **Meta Quest 3S (Realidad Mixta / VR)** y en **PC (Navegador Web 3D)**.

Fecha de actualización: 19 de octubre de 2026.

---

## 1. Resumen Ejecutivo

| Característica | **CiberEscudo XR · Comando Bolívar** | **CiberDetective: Puerto Nexo** |
|---|---|---|
| **Género** | Acción táctica en Realidad Mixta (MR / VR) y PC | Estrategia en tiempo real (RTS) y deducción forense (PC) |
| **Dispositivo** | Meta Quest 3S (90 Hz) y PC con navegador | Computador con navegador (Chrome / Edge) |
| **Público objetivo** | Estudiantes de 10° y 11° (14–18 años) | Estudiantes de 10° y 11° (14–18 años) |
| **Rol del estudiante** | **Guardián Digital Escolar** (reclutado por la Inspectora Ríos) | **Inspectora Valeria Ríos** (Líder de la Unidad de Delitos Informáticos) |
| **Duración por partida** | ~3.5 minutos (Fase 1: 90 s + Fase 2: Acoso y Escudo Solidario) | Partida por casos y 4 Eras (15–35 min o modular por clase) |
| **Objetivo pedagógico** | Desarrollar reflejos críticos ante el *phishing* y actuar como **testigo activo** frente al ciberacoso escolar | Analizar pruebas digitales forenses, aplicar el protocolo de los 15 minutos y conocer las rutas oficiales de denuncia |
| **Carpeta** | `CiberEscudo_XR` | `CiberDetective` |

---

## 2. Universo Narrativo Unificado (Storytelling: *«Operación CiberBolívar 2026»*)

Para lograr que los jóvenes de 10° y 11° sientan una conexión emocional auténtica, ambos videojuegos ahora comparten **un mismo universo narrativo en el Caribe colombiano**:

- **El antagonista común («Sombra Phish»):** En vísperas del *Gran Festival Digital del Caribe 2026*, una red de ciberdelincuentes llamada **Sombra Phish** lanza una ofensiva coordinada contra los colegios, comercios, bancos y familias del departamento de Bolívar. Su arma no es romper servidores por fuerza bruta, sino **manipular las emociones humanas**: el miedo, la urgencia, la vergüenza y el aislamiento.
- **El puente entre ambos juegos:**
  1. En **`CiberEscudo · Operación Código Verde` (VR/MR/PC)**, la **Inspectora Valeria Ríos** —jefa de la Unidad Especial de Ciberdefensa de la Secretaría TIC de Bolívar— activa al estudiante como **Guardián Digital** dentro de su propio salón de clases. El estudiante es la primera línea de defensa: intercepta los drones trampa que intentan infiltrarse en los celulares del colegio y, en el clímax emocional de la Fase 2, protege a su compañero **Mateo (11°B)** de un ataque coordinado de ciberacoso, levantando un **Escudo Comunitario**.
  2. En **`CiberDetective: Puerto Nexo` (PC)**, el estudiante asume directamente el mando de la **Inspectora Valeria Ríos** en la Central de Ciberpolicía de **Puerto Nexo** (ciudad costera inspirada en la arquitectura colonial, portuaria y moderna de Bolívar). Lo que en el salón empezó como mensajes trampa ahora se investiga a escala de ciudad: el jugador recorre los barrios, interroga víctimas, examina encabezados de correo, URLs, metadatos y bitácoras en su tablero de corcho, y despliega el **Firewall Ciudadano de Bolívar** a través de las cuatro eras del Ciudadano Digital Seguro (**CONOCE → APLICA → REACCIONA → DENUNCIA**).

---

## 3. Juego 1: *CiberEscudo XR · Comando Bolívar* (`CiberEscudo_XR`)

### Experiencia de juego y mecánicas
1. **Briefing en el Centro de Ciberdefensa Escolar:** El estudiante recibe la transmisión de la Inspectora Valeria Ríos e ingresa en **Realidad Mixta (Passthrough)** (viendo las paredes reales de su salón), en **Modo VR 360°** (Puente de Mando con vista a la costa caribeña generado por IA) o en **Modo PC/Pantalla**.
2. **Fase 1 · Defensa Activa y Combate de Amenazas (90 s):**
   - En las paredes reales o virtuales se abren **3 portales de energía cian/cobalto** de los que emergen drones en vuelo continuo.
   - **Sistema de Disparo Táctico Asistido (`buscarImpactoRayo`):** Se garantiza que el disparo **siempre conecte con el dron**. Al presionar el gatillo derecho en Quest o hacer clic izquierdo en PC, el sistema detecta objetivos en un cono magnético asistido de 1.25 m, detonando las amenazas en pleno vuelo sin frustración.
   - **Embestida Dinámica de Amenazas (Los drones nunca se quedan estáticos frente al jugador):**
     - Si el dron es una **estafa/phishing**, transmite su mensaje y de inmediato **inicia una embestida agresiva en picado hacia el visor del jugador** (`⚠ ¡AMENAZA EN CURSO! ¡DISPARA!`).
     - Si el jugador no lo destruye a tiempo, el dron **choca e impacta contra el visor y detona en una violenta explosión**:
       - **Pérdida de Vida:** Se restan 25% de salud en la Barra de Vida del jugador (4 impactos = caída del firewall).
       - **Sacudida Física de Pantalla:** Sacudida tridimensional de cámara y retroalimentación háptica intensa en ambos mandos.
       - **Destello de Daño:** Viñeta roja en la retina del jugador y sirena de alarma de impacto crítico.
     - Si el dron es un **mensaje legítimo**, sobrevuela suavemente el flanco izquierdo a distancia cómoda de captura (0.85 m) con un halo esmeralda. El jugador debe **atraparlo con el guante izquierdo (o clic der. / tecla C)** para ganar puntos y combo. Si lo deja pasar, expira pacíficamente sin dañar la vida del jugador.
3. **Barra de Vida / Salud del Operador:**
   - Ubicada prominentemente en el visor HUD táctico:
     - Indicador numérico `SALUD / VIDA [ 100% ]`.
     - Barra de 10 segmentos (cada uno = 10% de salud).
     - Código de colores: Cian/Esmeralda (> 55%), Ámbar de advertencia (28%–55%), Rojo carmesí parpadeante en estado crítico (< 28%).
     - Barra fantasma roja de daño que muestra fluidamente la cantidad de vida perdida en cada explosión.
4. **Fase 2 · Protege a Mateo (11°B) del Ciberacoso:**
   - Aparece el holograma de **Mateo (11°B)**, un compañero del colegio que está siendo atacado por criaturas de acoso digital (*«Nadie te quiere en el grupo»*, *«Ya creamos un perfil falso tuyo»*).
   - El estudiante derriba las agresiones antes de que golpeen el ánimo de Mateo y luego dispara únicamente a las **acciones de testigo activo** (*📸 Guardar evidencia*, *🚫 Bloquear y reportar*, *🗣️ Contarle a un adulto*, *🤝 Apoyar a mi amigo*), descartando las reacciones tóxicas (*🔁 Reenviar al grupo*, *😡 Responder con insultos*, *🙈 No es mi problema*).
5. **Bitácora de Guardia Digital (Resultados):**
   - Muestra el puntaje, el rango alcanzado (*Cadete de Ciberdefensa → Defensor Digital Juvenil → Comandante CiberEscudo → Guardián Legendario de Bolívar*), el Top 5 local y las líneas reales de ayuda en Colombia (`teprotejo.org` y **Línea 141 del ICBF**).

### Mejoras Gráficas, UX y de Marca Aplicadas
- **Eliminación Total del Aspecto Verde "Hacker Retro":** Sustitución completa de tintes olivo por paleta Cyber-Command Neón: Cian Eléctrico (`#00e5ff`), Azul Bolívar (`#0075b8`), Oro Institucional (`#ffcc29`) y Obsidiana (`#020612`).
- **Skybox 360° Fotorrealista por IA:** Entorno inmersivo de comando futurista sobre la costa del Caribe (`skybox_ciber_command.jpg`).
- **Ergonomía y confort en Meta Quest 3S (90 Hz):**
  - Activación automática de **90 Hz** (`xrSession.updateTargetFrameRate(90)`).
  - Ampliación del radio de captura a **`0.85 m`** (halo a `1.35 m`) evitando sobrecargas de hombro.
- **Dignidad del Manual de Marca Institucional:**
  - El Escudo de Bolívar se erige al frente sobre un **Atril / Pedestal de Mando 3D a 30°**, con respaldo 100% opaco (`#070a09`) y reserva reglamentaria ≥ 14%.

---

## 4. Juego 2: *CiberDetective: Puerto Nexo* (`CiberDetective`)

### Experiencia de juego y mecánicas
1. **Exploración táctica de Puerto Nexo:** Ciudad costera 3D completa con centro histórico amurallado, puerto de contenedores, zona financiera, hospital, colegio y malecón caribeño.
2. **Gestión de incidentes en tiempo real:** Aparecen columnas de alerta sobre los edificios; el jugador desplaza a la **Inspectora Valeria Ríos** y administra 4 recursos estratégicos (**Confianza ciudadana 🤝**, **Energía forense ⚡**, **Presupuesto 💰** y **Evidencia digital 🔍**).
3. **Tablero de Investigación Forense (Corcho Detectivesco):**
   - Izquierda: Ficha fotográfica de la víctima, declaración con comillas tipográficas y libreta de pistas.
   - Centro: Evidencias interactivas con interfaz realista (teléfono SMS, chats de WhatsApp, navegador con inspección de dominio, correos electrónicos, extractos bancarios y consolas de registros) conectadas con hilos rojos y chinchetas al marcarse como **Pista Clave**.
   - Derecha: Tres preguntas de deducción que evalúan qué ocurrió, qué señal lo delató y qué protocolo protege al ciudadano.
4. **Progresión por 4 Eras y Laboratorio Forense:**
   - El jugador investiga tecnologías reales (*Lupa de enlaces*, *Kit forense portátil*, *Protocolo de los 15 minutos*, *Caja de arena de malware*, *Alianza escuela-familia*) y eleva el **Firewall de Puerto Nexo** a través de las 4 eras (**I. CONOCE → II. APLICA → III. REACCIONA → IV. DENUNCIA**).

### Mejoras Gráficas, UX y de Marca Aplicadas
- **Cúpula del Firewall sobre el mar (`js/mundo/efectos.js`):** Se rediseñó el shader `matCupula` con desvanecimiento suave hacia la base (`smoothstep(0.02, 0.18, y)`), mayor radio (`255 × 72 × 240`) e intensidad atmosférica equilibrada para que el domo envuelva toda la ciudad sin trazar una línea artificial sobre el océano ni la playa.
- **Escala consistente de balizas y peatones (`efectos.js` y `peatones.js`):**
  - Se acotó la escala de los iconos de alerta (`Math.min(9.2, Math.max(4.2, d * 0.042))`) para mantener jerarquía visual limpia a cualquier distancia de cámara.
  - Se incrementó la escala de los peatones (`ESC = 1.68`) para que los ciudadanos caminando por las aceras y el malecón tengan siluetas claras y den vida a Puerto Nexo.
- **Ergonomía del HUD y del Tablero de Corcho (`css/estilo.css`):**
  - **Lista de incidentes sin textos truncados:** Ampliada a `284 px` en el borde derecho con soporte de 2 líneas completas para que ningún título se corte.
  - **Notificaciones (Toasts) despejadas:** Reubicadas en una franja compacta superior izquierda (`286 px`), dejando el mapa 3D y la Ciudad Vieja completamente libres.
  - **Tablero de investigación impecable:** Ajuste de posición de las chinchetas (`top: 5px`) y del relleno superior de las tarjetas (`padding-top: 20px`) para no pisar títulos ni etiquetas, además de holgura inferior ampliada (`padding-bottom: 58px`) en las columnas con desplazamiento.
- **Placa Oficial de la Unidad de Ciberdefensa (`js/ui/marca.js` y `css/estilo.css`):**
  - El logo y el escudo de la Gobernación de Bolívar · Secretaría de las TIC ahora se presentan dentro de una **Placa Oficial de Mando** con encabezado institucional dorado (`◆ GOBERNACIÓN DE BOLÍVAR · SECRETARÍA TIC ◆`), subtítulo de la *Unidad Especial de Ciberdefensa Ciudadana* y bisel azul/cian/oro en el exterior, manteniendo en el interior el núcleo `#0a0d14` 100 % opaco y el margen de seguridad ≥ 14 % exigido por el Manual de Identidad Visual 2024.

---

## 5. Guía de Instalación en Gafas Meta Quest 3S y Repositorio Git

### A. Cómo Probar e Instalar en las Gafas Meta Quest 3S (Horizon OS)

Los videojuegos están desarrollados sobre estándares abiertos **WebXR (A-Frame 1.6 / Three.js)** y **PWA (Progressive Web App)**, lo que permite ejecutarlos sin cables ni necesidad de compilar APKs pesados.

#### Método 1: Prueba Directa en Red Local Wi-Fi (Inmediato)
1. Asegúrate de que tu PC y las gafas Meta Quest 3S estén conectadas a la **misma red Wi-Fi**.
2. En tu PC, abre PowerShell y escribe `ipconfig` para conocer tu dirección IPv4 local (por ejemplo `192.168.1.15`).
3. Ponte las gafas Meta Quest 3S y abre la aplicación oficial **Meta Quest Browser**.
4. En la barra de direcciones del navegador de las gafas, ingresa:
   * Para **CiberEscudo XR**: `http://192.168.1.15:8131` *(sustituyendo por tu IP local)*.
   * Para **CiberDetective**: `http://192.168.1.15:8130`.
5. Pulsa el botón **`> REALIDAD MIXTA (META QUEST 3S)`** o **`> MODO VR 360°`**.
6. **Instalación como App Nativa en la Biblioteca de Quest:**
   * En el Meta Quest Browser, haz clic en el menú de los **tres puntos (`...`)** en la esquina superior derecha de la ventana.
   * Selecciona **"Instalar aplicación"** / **"Agregar a aplicaciones"**.
   * El juego quedará instalado con su propio icono institucional en el menú de aplicaciones de Horizon OS y funcionará incluso sin internet gracias a su *Service Worker* integrado.

---

### B. Cómo Subirlo a un Repositorio Git (GitHub / GitLab)

Para que el proyecto esté respaldado en la nube y pueda ser alojado públicamente con HTTPS gratuito en **GitHub Pages**:

#### Paso 1: Inicializar el Repositorio Local
Abre una terminal PowerShell en la carpeta raíz del proyecto (`C:\Users\jonat\Desktop\antygravisti\secretaria TIC\video juego`):
```powershell
cd "C:\Users\jonat\Desktop\antygravisti\secretaria TIC\video juego"
git init
git add .
git commit -m "feat: CiberEscudo XR y CiberDetective v2.0 - Gobernacion de Bolivar"
```

#### Paso 2: Conectar con GitHub
1. Ingresa a [GitHub.com](https://github.com) y crea un nuevo repositorio (por ejemplo, `ciberseguridad-bolivar-vr`).
2. Copia la URL del repositorio y vincula tu repositorio local:
```powershell
git branch -M main
git remote add origin https://github.com/TU_USUARIO/ciberseguridad-bolivar-vr.git
git push -u origin main
```

#### Paso 3: Publicar Gratis con HTTPS en GitHub Pages
Para que las gafas Meta Quest puedan acceder desde cualquier lugar del mundo sin configurar IPs:
1. En tu repositorio de GitHub, ve a **Settings** (Configuración) → **Pages** (en el menú lateral izquierdo).
2. En **Build and deployment** → **Source**, selecciona **Deploy from a branch**.
3. Selecciona la rama `main` y la carpeta `/ (root)`.
4. Haz clic en **Save**. En 1 minuto GitHub te dará una URL segura con HTTPS (ejemplo: `https://TU_USUARIO.github.io/ciberseguridad-bolivar-vr/CiberEscudo_XR/`).
5. Abre esa URL directamente en el navegador de las Meta Quest 3S y ¡a jugar!
