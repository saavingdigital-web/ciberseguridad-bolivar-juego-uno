/* CiberEscudo XR - Contenido educativo
 * Para agregar o cambiar casos, edita estas listas.
 * Mantén los textos cortos: se leen flotando en el aire.
 *   mensaje: máx. ~95 caracteres · pista: máx. ~80 · retro: máx. ~75
 */

// FASE 1: mensajes que salen de los portales.
// esEstafa: true  -> hay que DISPARAR (bloquear)
// esEstafa: false -> hay que DEJARLO PASAR (es legítimo)
const CASOS_ESTAFA = [
  {
    id: 'c01',
    voz: 'Número nuevo: soy tu primo, ¿me prestas cincuenta mil? Es urgente.', retroVoz: 'Amenaza: dinero urgente desde un número nuevo.',
    app: '💬 WhatsApp', remitente: '+57 320 123 4567',
    mensaje: 'Hola, soy tu primo. Cambié de número. ¿Me prestas 50 mil por Nequi? Es urgente.',
    pista: 'Número nuevo + urgencia + dinero = suplantación.',
    esEstafa: true, retro: 'Llama a tu familiar a su número de siempre.'
  },
  {
    id: 'c02',
    voz: 'Discord: Nitro y diez mil Robux gratis, verifica tu cuenta en este enlace.', retroVoz: 'Amenaza: regalo falso que roba tu cuenta.',
    app: '🎮 Discord', remitente: 'Mod_Juegos_Elite',
    mensaje: '🎁 Nitro + 10.000 Robux GRATIS. Verifica tu cuenta en free-nitro-gen.io',
    pista: 'free-nitro-gen.io no es oficial: roba tu cuenta.',
    esEstafa: true, retro: 'Los regalos "gratis" con enlace roban cuentas.'
  },
  {
    id: 'c03',
    voz: 'Instagram: mira el video donde sales tú, entra ya a este enlace.', retroVoz: 'Amenaza: enlace con urgencia, trae virus.',
    app: '📸 Instagram', remitente: 'usuario_12345',
    mensaje: '😱 ¿Viste el video donde sales tú? Míralo ya: ver-video.xyz',
    pista: 'Dominio .xyz + urgencia: descarga malware.',
    esEstafa: true, retro: 'La urgencia es el anzuelo. No abras ese enlace.'
  },
  {
    id: 'c04',
    voz: 'Amigo del salón: instala este APK modificado y tienes Spotify gratis.', retroVoz: 'Amenaza: las apps modificadas traen troyanos.',
    app: '📦 Chat del salón', remitente: 'Amigo_de_clase',
    mensaje: 'Spotify Premium GRATIS 🔥 Instala este APK modificado y listo.',
    pista: 'APK fuera de la tienda oficial: puede traer troyanos.',
    esEstafa: true, retro: 'Las apps "mod" roban contraseñas y datos.'
  },
  {
    id: 'c05',
    voz: 'Mensaje del banco: su cuenta será bloqueada hoy, ingrese sus datos en este enlace.', retroVoz: 'Amenaza: ningún banco pide datos por enlace.',
    app: '✉️ SMS', remitente: 'BANCO-ALERTA',
    mensaje: 'Su cuenta será BLOQUEADA hoy. Ingrese sus datos en banco-seguro-co.net',
    pista: 'Ningún banco pide tus datos por un enlace en SMS.',
    esEstafa: true, retro: 'Es phishing: entra solo desde la app oficial.'
  },
  {
    id: 'c06',
    voz: 'Garena regala diamantes: envía tu usuario y contraseña.', retroVoz: 'Amenaza: nadie legítimo pide tu contraseña.',
    app: '🔥 Free Fire', remitente: 'Garena_Premios_Oficial',
    mensaje: '💎 10.000 diamantes gratis. Solo envíanos tu usuario y contraseña.',
    pista: 'Nadie legítimo te pide tu contraseña.',
    esEstafa: true, retro: 'Tu contraseña es solo tuya. Nunca la compartas.'
  },
  {
    id: 'c07',
    voz: 'Fan anónimo: eres especial, hablemos por privado y no le cuentes a nadie.', retroVoz: 'Amenaza: pedir secretos es señal de grooming.',
    app: '📱 TikTok', remitente: 'Fan_Anónimo',
    mensaje: 'Eres muy especial 💕 Hablemos por privado, pero no le cuentes a nadie 🤫',
    pista: '"No le cuentes a nadie" = señal de grooming.',
    esEstafa: true, retro: 'Un adulto que pide secretos es una alerta.'
  },
  {
    id: 'c08',
    voz: 'Agencia de modelos: envía fotos en ropa interior para el casting.', retroVoz: 'Amenaza: ninguna agencia pide fotos íntimas.',
    app: '📸 Instagram', remitente: 'Agencia_Modelos_Top',
    mensaje: '¡Te elegimos para modelar! Envía fotos en ropa interior para el casting.',
    pista: 'Ninguna agencia real pide fotos íntimas.',
    esEstafa: true, retro: 'Es una trampa de sextorsión. Bloquea y cuenta.'
  },
  {
    id: 'c09',
    voz: 'Correo del ICFES: ganaste una beca, paga treinta mil para reclamarla.', retroVoz: 'Amenaza: las becas reales no se cobran.',
    app: '📧 Correo', remitente: 'premios@icfes-resultados.com',
    mensaje: '🎓 Ganaste una beca. Paga $30.000 para reclamarla hoy mismo.',
    pista: 'icfes-resultados.com es falso: el real es .gov.co',
    esEstafa: true, retro: 'Las becas reales no se cobran.'
  },
  {
    id: 'c10',
    voz: 'Desconocido: tengo fotos tuyas, paga hoy o las publico.', retroVoz: 'Amenaza: es extorsión, no pagues y denuncia.',
    app: '💬 WhatsApp', remitente: 'Desconocido',
    mensaje: 'Tengo fotos tuyas. Si no me pagas hoy, las publico.',
    pista: 'Extorsión: no pagues, guarda evidencia y denuncia.',
    esEstafa: true, retro: 'No estás solo/a: cuéntale a un adulto y denuncia.'
  },
  {
    id: 'c11',
    voz: 'Correo oficial del ICFES: tus resultados Saber once ya están en el portal.', retroVoz: 'Seguro: correo oficial del Estado.',
    app: '📧 Correo ICFES', remitente: 'notificaciones@icfes.gov.co',
    mensaje: 'Ya están tus resultados Saber 11. Consúltalos en el portal oficial.',
    pista: 'Dominio oficial .gov.co y no pide pagos.',
    esEstafa: false, retro: 'Correo oficial del Estado. Es seguro.'
  },
  {
    id: 'c12',
    voz: 'PixelPlay verificado: alguien entró a tu cuenta, revisa en la aplicación oficial.', retroVoz: 'Seguro: aviso dentro de la aplicación oficial.',
    app: '🎮 PixelPlay ✔', remitente: 'Cuenta oficial verificada',
    mensaje: 'Alguien entró a tu cuenta desde un equipo nuevo. Si no fuiste tú, cambia tu clave en la app.',
    pista: 'Aviso dentro de la app oficial, sin enlaces.',
    esEstafa: false, retro: 'Aviso de seguridad real. Revísalo en la app.'
  },
  {
    id: 'c13',
    voz: 'Mamá: salí del trabajo, ¿te recojo en el colegio?', retroVoz: 'Seguro: mensaje normal de tu familia.',
    app: '💬 WhatsApp', remitente: 'Mamá ❤️ (contacto guardado)',
    mensaje: 'Ya salí del trabajo. ¿Quieres que te recoja en el colegio?',
    pista: 'Contacto conocido; no pide datos ni dinero.',
    esEstafa: false, retro: 'Mensaje normal de alguien de confianza.'
  },
  {
    id: 'c14',
    voz: 'Profe Laura: recuerden entregar el taller el viernes.', retroVoz: 'Seguro: mensaje escolar legítimo.',
    app: '📚 Classroom', remitente: 'Profe Laura · Ciencias',
    mensaje: 'Recuerden entregar el taller el viernes en Classroom.',
    pista: 'Plataforma escolar oficial, sin enlaces raros.',
    esEstafa: false, retro: 'Mensaje escolar legítimo.'
  },
  // ----- Mensajes SEGUROS adicionales: no representan riesgo; dispararles resta puntos -----
  {
    id: 'c15',
    voz: 'Papá: hoy te recojo a las cuatro, avísame cuando salgas.', retroVoz: 'Seguro: mensaje cotidiano de tu familia.',
    app: '💬 WhatsApp', remitente: 'Papá ❤️ (contacto guardado)',
    mensaje: 'Hijo, hoy te recojo a las 4. Llévate el almuerzo y avísame cuando salgas.',
    pista: 'Contacto guardado; no pide dinero, claves ni enlaces.',
    esEstafa: false, retro: 'Mensaje cotidiano de tu familia.'
  },
  {
    id: 'c16',
    voz: 'Colegio: mañana la jornada empieza a las siete, trae tu carné.', retroVoz: 'Seguro: aviso escolar normal.',
    app: '📚 Classroom', remitente: 'Colegio · Coordinación',
    mensaje: 'Mañana la jornada empieza a las 7:00. Recuerda traer tu carné y el uniforme.',
    pista: 'Aviso institucional sin enlaces ni peticiones de datos.',
    esEstafa: false, retro: 'Aviso escolar normal.'
  },
  {
    id: 'c17',
    voz: 'PixelPlay oficial: actualización lista en la tienda oficial de tu consola.', retroVoz: 'Seguro: se descarga de la tienda oficial.',
    app: '🎮 PixelPlay ✔', remitente: 'Cuenta oficial verificada',
    mensaje: 'Actualización lista: ya puedes descargar el parche desde la tienda oficial de tu consola.',
    pista: 'Te manda a la tienda oficial, sin enlaces externos ni claves.',
    esEstafa: false, retro: 'Las actualizaciones se bajan de la tienda oficial.'
  },
  {
    id: 'c18',
    voz: 'Tía Marta: feliz cumpleaños, te quiero mucho, nos vemos el domingo.', retroVoz: 'Seguro: mensaje cariñoso de alguien conocido.',
    app: '💬 WhatsApp', remitente: 'Tía Marta (contacto guardado)',
    mensaje: 'Feliz cumple, mi niño 🎂 Te quiero mucho. Nos vemos el domingo en casa.',
    pista: 'Mensaje afectuoso de un contacto conocido, sin pedidos.',
    esEstafa: false, retro: 'Mensaje inofensivo de alguien de confianza.'
  },
  {
    id: 'c19',
    voz: 'Correo del ICFES: tu inscripción quedó registrada, mira tu citación en el portal.', retroVoz: 'Seguro: correo oficial, sin pedir pagos.',
    app: '📧 Correo', remitente: 'notificaciones@icfes.gov.co',
    mensaje: 'Tu inscripción a Saber 11 quedó registrada. Consulta tu citación en el portal oficial.',
    pista: 'Dominio oficial .gov.co; no pide pagos ni contraseñas.',
    esEstafa: false, retro: 'Correo oficial del Estado.'
  },
  {
    id: 'c20',
    voz: 'Amigo del colegio: ¡qué buen video! ¿Lo hacemos juntos en el recreo?', retroVoz: 'Seguro: es tu amigo real del colegio.',
    app: '📱 TikTok', remitente: 'Amigo del colegio (te sigue de verdad)',
    mensaje: '¡Qué buen video el de ayer! ¿Hacemos el siguiente juntos en el recreo?',
    pista: 'Lo conoces en persona y propone verse en el colegio, a la vista de todos.',
    esEstafa: false, retro: 'Amistad real: se conocen en persona.'
  }
];

// FASE 2: mensajes de acoso que atacan a tu amigo. Hay que bloquearlos (disparar).
const MENSAJES_ACOSO = [
  'Nadie te quiere en el grupo 🙄',
  'Jajaja miren la foto que le tomamos 📸',
  'Mejor ni vengas mañana',
  'Ya todos saben tu secreto 🤐',
  'Vamos a hacer un meme contigo 😂',
  'Te sacamos del grupo, perdedor/a',
  'Pásenle este audio a todo el salón',
  'Qué ridículo/a eres, jajaja',
  'Nadie se va a sentar contigo',
  'Ya creamos un perfil falso tuyo 😈'
];

// FASE 2: ¿Cómo ayudas a tu amigo? Disparar SOLO a las acciones correctas.
const ACCIONES_ACOSO = [
  { texto: '📸 Guardar evidencia', correcta: true, retro: 'Las capturas sirven para reportar.' },
  { texto: '🚫 Bloquear y reportar', correcta: true, retro: 'Corta el contacto y avisa a la plataforma.' },
  { texto: '🗣️ Contarle a un adulto', correcta: true, retro: 'Un adulto de confianza puede actuar.' },
  { texto: '🤝 Apoyar a mi amigo', correcta: true, retro: 'Que sepa que no está solo/a.' },
  { texto: '🔁 Reenviar al grupo', correcta: false, retro: 'Reenviar te vuelve parte del acoso.' },
  { texto: '😡 Responder con insultos', correcta: false, retro: 'Responder con odio empeora todo.' },
  { texto: '🙈 No es mi problema', correcta: false, retro: 'Callar también deja solo a tu amigo.' }
];

// Líneas de ayuda reales en Colombia (se muestran al final).
const LINEAS_AYUDA = 'En Bolívar el ciberacoso no se vive a solas · Línea 106 · CAI Virtual 123 · Línea 141 ICBF';
