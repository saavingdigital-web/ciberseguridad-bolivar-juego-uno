# CiberDetective: Puerto Nexo

Juego de estrategia y detectives sobre ciberseguridad, para PC (navegador). Hecho con Three.js r170, todo en español.
Eres la inspectora **Valeria Ríos**: recorres una ciudad costera del Caribe en 2026, analizas evidencias de incidentes cibernéticos, deduces cómo ocurrió el ataque y recibes el **Escudo táctico** (el consejo de la presentación de la charla).

## Cómo jugar

1. Desde esta carpeta ejecuta:
```bash
py servidor.py
```
2. Abre `http://localhost:8130` en Chrome o Edge reciente. Con `?rapido` al final de la dirección se salta el menú y la intro.
3. Controles estilo AoE2:
   - **Cámara:** WASD o flechas, mouse en los bordes, botón central para arrastrar, rueda para el zoom.
   - **Seleccionar** a la detective con clic; **clic derecho** sobre un edificio con alerta para investigar.
   - En el tablero de investigación: **Analizar** evidencias (cuesta energía), marcar las claves y responder la deducción.
   - **Central:** avanzar de era (CONOCE → APLICA → REACCIONA → DENUNCIA). **Laboratorio:** investigar tecnologías.
   - Esc abre la pausa.

## Contenido

11 casos tomados de la presentación: phishing bancario, WhatsApp robado (spoofing), Wi-Fi público falso, contraseña débil, APK troyano, ransomware, grooming, voz clonada con IA, ciberestrés, sextorsión y doxing. Todas las marcas, personas y dominios son ficticios.

## Estructura

| Carpeta | Qué hay |
|---|---|
| `js/main.js` | Reglas, economía, flujo de casos |
| `js/mundo/` | Ciudad 3D, tráfico, peatones, detective, cámara, efectos |
| `js/ui/` | HUD, minimapa, tablero de investigación, retratos y pantallas |
| `js/datos/` | Casos, tecnologías, eras y autoridades |
| `js/audio/` | Música y sonido sintetizados (sin archivos) |
| `css/` | Estilos y fuentes locales |
| `vendor/three/` | Three.js r170 |
| `revision/` | Capturas y críticas de las 4 rondas de revisión visual |
| `ARQUITECTURA.md` | Contrato entre módulos |

## Estado y pendientes

- **Funciona de punta a punta:** menú, intro, ciudad, casos, tablero, recompensas, eras y tecnologías (probado en el navegador).
- **Revisión visual:** 4 rondas con revisores independientes (6,19 → 7,5 → 7,88 → 7,44 sobre 10). Interfaz, tablero e identidad ganan al estándar; materiales y detalle de la ciudad no llegan a 8. El techo del enfoque 100 % procedural ronda el 8; para pasar de ahí harían falta modelos 3D hechos a mano (30-40 piezas), texturas horneadas y un color por distrito.
- **Sin medir:** los cuadros por segundo reales (la ciudad ronda 1,2 millones de triángulos; hay calidad adaptativa).
- **Sin oír:** el audio solo se probó sin navegador.
- **Verificar antes de publicar:** las autoridades (CAI Virtual, ADenunciar, SIC) vienen de la presentación; confirma teléfonos y correos en sus páginas oficiales. Revisa también que los dominios ficticios no existan.
- **Idea pendiente:** que cada pregunta indique qué evidencia la responde, para que el hilo rojo una la pista correcta.
