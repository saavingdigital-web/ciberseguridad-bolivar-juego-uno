// CiberDetective · Casos de las eras 1 (CONOCE) y 2 (APLICA)
// Todos los nombres, marcas, números y dominios son FICTICIOS.
// Los dominios maliciosos usan terminaciones como .xyz o .top para que se reconozcan como falsos.
// Montos de los extractos: números en pesos colombianos (negativo = salida de dinero).

const AUT_CAI = 'Centro Cibernético Policial (CAI Virtual)';
const AUT_FISCALIA = 'Fiscalía General de la Nación';
const AUT_BANCO = 'Banco y Superintendencia Financiera de Colombia';

export const CASOS_ERA_1_2 = [
  // ───────────────────────────── ERA 1 · CONOCE ─────────────────────────────
  {
    id: 'banco-cuentas-vaciadas',
    titulo: 'Cuentas vaciadas',
    edificio: 'banco',
    era: 1,
    cuadrante: 'tecnico',
    urgencia: 'alta',
    plazo: 300,
    victima: { nombre: 'Rosa Elena Márquez', edad: 52, rol: 'Comerciante del mercado del puerto', retrato: '👩🏽' },
    resumen: 'Una clienta amaneció con la cuenta en ceros tras un SMS de "bloqueo".',
    declaracion: 'Anoche me llegó un mensaje del banco diciendo que mi cuenta iba a quedar bloqueada en 24 horas. Me asusté, porque ahí tengo la plata del surtido del negocio. Le di clic al enlace, la página era igualita a la del banco y puse mi usuario y mi clave. Esta mañana fui a pagarle a un proveedor y la cuenta estaba en ceros. Yo nunca autoricé esas transferencias.',
    evidencias: [
      {
        id: 'sms-bloqueo',
        tipo: 'sms',
        titulo: 'SMS de "bloqueo de cuenta"',
        contenido: {
          remitente: '+57 321 555 0147',
          hora: '12/10/2026 · 23:41',
          texto: 'BancoDelPuerto: Su cuenta sera BLOQUEADA en 24 horas por actividad inusual. Verifique sus datos INMEDIATAMENTE aqui para evitar la suspencion:',
          enlaces: ['https://acortar.top/bdp-v3r1f']
        },
        pista: 'Cuatro señales de alerta juntas: urgencia extrema ("BLOQUEADA en 24 horas"), errores de ortografía ("suspencion", sin tildes), un número de celular común en lugar de la línea oficial del banco y un enlace acortado que esconde el destino real.',
        costo: 10,
        clave: true
      },
      {
        id: 'url-clon',
        tipo: 'url',
        titulo: 'Destino real del enlace',
        contenido: {
          mostrada: 'https://acortar.top/bdp-v3r1f',
          real: 'http://bancodelpuerto-verificacion.seguro-web.xyz/login',
          certificado: 'Ninguno: la conexión NO usa HTTPS',
          creado: 'Hace 3 días (09/10/2026)',
          observaciones: 'El dominio real es "seguro-web.xyz"; "bancodelpuerto-verificacion" es solo un adorno al comienzo. El sitio oficial es www.bancodelpuerto.com.co. La página copia el logo, los colores y hasta el aviso de cookies del banco.'
        },
        pista: 'El enlace acortado lleva a un dominio .xyz creado hace tres días y sin HTTPS. Es un clon del portal del banco, hecho para capturar usuario y contraseña.',
        costo: 15,
        clave: true
      },
      {
        id: 'registro-accesos',
        tipo: 'registro',
        titulo: 'Accesos a la banca en línea',
        contenido: {
          sistema: 'Banco del Puerto · Bitácora de accesos de la cuenta ****4821',
          lineas: [
            { hora: '12/10 · 23:46', evento: 'Inicio de sesión exitoso', detalle: 'Dispositivo nuevo · navegador desconocido · conexión desde fuera del país' },
            { hora: '12/10 · 23:48', evento: 'Cambio de correo de notificaciones', detalle: 'rosaelena.marquez@correonexo.co → notif.cliente77@mailrapido.top' },
            { hora: '12/10 · 23:55', evento: 'Inscripción de cuentas', detalle: '2 cuentas nuevas inscritas para transferencias' },
            { hora: '13/10 · 00:09', evento: 'Transferencia aprobada', detalle: 'Clave dinámica enviada al correo modificado' },
            { hora: '13/10 · 03:58', evento: 'Retiro sin tarjeta generado', detalle: 'Código de retiro enviado al correo modificado' }
          ]
        },
        pista: 'Cinco minutos después del SMS alguien entró con la clave correcta desde otro país. No hubo intentos fallidos: tenía la contraseña real. Lo primero que hizo fue cambiar el correo de alertas para que Rosa Elena no se enterara.',
        costo: 15,
        clave: false
      },
      {
        id: 'extracto-madrugada',
        tipo: 'extracto',
        titulo: 'Extracto de la cuenta de ahorros',
        contenido: {
          banco: 'Banco del Puerto',
          cuenta: 'Ahorros ****4821 · Rosa Elena Márquez',
          movimientos: [
            { fecha: '12/10/2026', hora: '09:15', concepto: 'Abono por ventas del negocio', monto: 620000, destino: 'Cuenta propia' },
            { fecha: '13/10/2026', hora: '00:09', concepto: 'Transferencia a cuenta inscrita', monto: -1500000, destino: 'Cta. ****7730 · titular desconocido' },
            { fecha: '13/10/2026', hora: '02:13', concepto: 'Transferencia a cuenta inscrita', monto: -980000, destino: 'Cta. ****1902 · titular desconocido' },
            { fecha: '13/10/2026', hora: '03:31', concepto: 'Compra en línea', monto: -415000, destino: 'TiendaGamer Online' },
            { fecha: '13/10/2026', hora: '03:58', concepto: 'Retiro sin tarjeta', monto: -200000, destino: 'Cajero · Terminal de transportes' }
          ]
        },
        pista: 'Cuatro movimientos entre las 12:09 a. m. y las 3:58 a. m., todos hacia cuentas recién inscritas o compras que ella no hizo. Es el patrón típico: vaciar la cuenta mientras la víctima duerme.',
        costo: 15,
        clave: true
      },
      {
        id: 'correo-aviso-real',
        tipo: 'correo',
        titulo: 'Aviso legítimo del banco',
        contenido: {
          de: 'notificaciones@bancodelpuerto.com.co',
          para: 'rosaelena.marquez@correonexo.co',
          asunto: 'Se actualizó tu correo de notificaciones',
          fecha: '12/10/2026 · 23:48',
          cuerpo: 'Hola, Rosa Elena. Te informamos que el correo para recibir alertas de tu cuenta fue cambiado hoy a las 23:48. Si no fuiste tú, comunícate de inmediato con nuestra línea oficial, que aparece al respaldo de tu tarjeta. Recuerda: el Banco del Puerto NUNCA te pedirá claves ni datos por SMS, correo o llamada.',
          adjuntos: []
        },
        pista: 'El banco sí avisó del cambio, pero a medianoche y Rosa Elena ya dormía. El correo lo deja claro: el banco nunca pide claves por SMS. Ese aviso, junto con el SMS falso, es evidencia para el reclamo.',
        costo: 10,
        clave: false
      }
    ],
    preguntas: [
      {
        id: 'p1',
        texto: '¿Cómo consiguió el atacante la clave de Rosa Elena?',
        opciones: [
          { texto: 'La adivinó probando muchas combinaciones.', correcta: false, retro: 'La bitácora no muestra intentos fallidos: entró a la primera, con la clave correcta.' },
          { texto: 'Ella misma la escribió en una página clonada a la que llegó por el SMS.', correcta: true, retro: 'Exacto. El SMS la llevó a un clon del banco; lo que escribió ahí fue directo al atacante, que entró cinco minutos después.' },
          { texto: 'Un empleado del banco filtró sus datos.', correcta: false, retro: 'Nada en la evidencia apunta adentro del banco. El acceso ocurrió justo después de que ella usó la página falsa.' },
          { texto: 'Le robaron la tarjeta física.', correcta: false, retro: 'Todos los movimientos son en línea o con código de retiro: no se necesitó la tarjeta.' }
        ]
      },
      {
        id: 'p2',
        texto: '¿Cuál es la señal técnica más clara de que la página era falsa?',
        opciones: [
          { texto: 'Tenía el logo y los colores del banco.', correcta: false, retro: 'Copiar el diseño es facilísimo. Que se vea igual no prueba nada: lo que importa es el dominio.' },
          { texto: 'El dominio real era seguro-web.xyz, creado hace tres días y sin HTTPS.', correcta: true, retro: 'Correcto. El dominio oficial es bancodelpuerto.com.co. Un dominio .xyz nuevo, sin HTTPS y escondido tras un acortador es una página clonada.' },
          { texto: 'Pedía usuario y contraseña.', correcta: false, retro: 'La página real también los pide. La pregunta clave es DÓNDE los estás escribiendo.' }
        ]
      },
      {
        id: 'p3',
        texto: '¿Qué debe hacer Rosa Elena ahora mismo?',
        opciones: [
          { texto: 'Responder el SMS y pedir que le devuelvan la plata.', correcta: false, retro: 'Al otro lado está el estafador. Responder solo confirma que el número está activo.' },
          { texto: 'Llamar a la línea oficial del banco para bloquear la cuenta, cambiar la clave y poner la queja ante la Superintendencia Financiera.', correcta: true, retro: 'Bien. En un fraude bancario cada minuto cuenta: el banco puede congelar las transferencias y la Superintendencia Financiera vigila que el reclamo se atienda.' },
          { texto: 'Borrar el SMS para no volver a caer.', correcta: false, retro: 'Antes de borrar, documenta: el SMS, la URL y el extracto son la evidencia del reclamo y de la denuncia.' },
          { texto: 'Esperar unos días a ver si el banco lo reversa solo.', correcta: false, retro: 'Entre más rápido se reporta, más posibilidades hay de recuperar el dinero.' }
        ]
      }
    ],
    explicacion: '1) El atacante envió un SMS masivo haciéndose pasar por el Banco del Puerto, con urgencia y miedo ("su cuenta será bloqueada").\n2) El enlace acortado escondía un dominio falso (seguro-web.xyz) con una copia exacta del portal del banco.\n3) Rosa Elena escribió su usuario y su clave en el clon, y esos datos le llegaron al atacante.\n4) Cinco minutos después, el atacante entró a la cuenta real, cambió el correo de alertas e inscribió cuentas nuevas.\n5) De madrugada vació la cuenta con transferencias, una compra en línea y un retiro sin tarjeta.',
    recompensa: { presupuesto: 90, evidencia: 15, confianza: 6 },
    consejo: {
      titulo: 'ESCUDO TÁCTICO',
      puntos: [
        'Sentido de urgencia = ALERTA ROJA. Quieren que actúes con pánico: tómate tu tiempo para verificar.',
        'Jamás des clic en enlaces sospechosos que lleguen por SMS, DM o chat. Entra siempre directamente desde la web o la app oficial.',
        'Verifica por otro canal: llama a la línea oficial de tu banco antes de hacer cualquier cosa.'
      ]
    },
    autoridad: AUT_BANCO
  },

  {
    id: 'chatverde-robado',
    titulo: 'El código de 6 dígitos',
    edificio: 'casa-1',
    era: 1,
    cuadrante: 'tecnico',
    urgencia: 'alta',
    plazo: 270,
    victima: { nombre: 'Andrés Felipe Caicedo', edad: 16, rol: 'Estudiante de 10.° del Colegio La Muralla', retrato: '🧑🏽' },
    resumen: 'Le robaron el ChatVerde y "él" está pidiendo plata a sus contactos.',
    declaracion: 'Mi prima Laura me escribió por ChatVerde diciendo que, sin querer, me había llegado un código de 6 dígitos suyo y que se lo pasara, que era para un concurso. Se lo mandé sin pensar. A los dos minutos se me cerró la sesión y no he podido volver a entrar. Ahora mi mamá dice que "yo" le pedí 350.000 pesos prestados, y a mis amigos también les están pidiendo plata a mi nombre.',
    evidencias: [
      {
        id: 'sms-codigo',
        tipo: 'sms',
        titulo: 'SMS oficial de ChatVerde',
        contenido: {
          remitente: 'ChatVerde',
          hora: '13/10/2026 · 18:02',
          texto: 'Tu código de registro de ChatVerde es 482-913. No compartas este código con nadie. Si no lo solicitaste, ignora este mensaje.',
          enlaces: []
        },
        pista: 'El SMS es legítimo y lo advierte: "No compartas este código con nadie". Ese código sirve para registrar la cuenta en OTRO teléfono. Quien lo tenga se queda con el ChatVerde de Andrés.',
        costo: 10,
        clave: true
      },
      {
        id: 'chat-prima',
        tipo: 'chat',
        titulo: 'Conversación con "Laura Prima"',
        contenido: {
          app: 'ChatVerde',
          contacto: 'Laura Prima 💜 (+57 312 555 0163)',
          mensajes: [
            { de: 'contacto', texto: 'Holaaa primo!! 😊 una preguntica', hora: '17:58' },
            { de: 'contacto', texto: 'Es que estoy en un concurso y sin querer puse tu número, te debió llegar un código de 6 dígitos por SMS', hora: '17:59' },
            { de: 'contacto', texto: 'me lo pasas porfa? es urgente que el concurso se cierra en 5 min 🙏🙏', hora: '18:01' },
            { de: 'victima', texto: 'jaja ok ya miro', hora: '18:02' },
            { de: 'victima', texto: '482913', hora: '18:02' },
            { de: 'contacto', texto: 'graciasss primo te debo una ❤️', hora: '18:03' }
          ]
        },
        pista: 'La cuenta de "Laura" ya había sido robada. El atacante aprovecha la confianza familiar y mete prisa ("se cierra en 5 min") para que Andrés no piense. Es la misma jugada que ahora repite con todos los contactos de Andrés.',
        costo: 15,
        clave: true
      },
      {
        id: 'registro-dispositivos',
        tipo: 'registro',
        titulo: 'Dispositivos vinculados a la cuenta',
        contenido: {
          sistema: 'ChatVerde · Historial de la cuenta de Andrés (+57 300 555 0110)',
          lineas: [
            { hora: '18:03', evento: 'Registro en un teléfono nuevo', detalle: 'Modelo desconocido · código SMS verificado correctamente' },
            { hora: '18:03', evento: 'Sesión cerrada en el teléfono original', detalle: 'Motivo: la cuenta se registró en otro dispositivo' },
            { hora: '18:04', evento: 'Verificación en dos pasos ACTIVADA', detalle: 'PIN creado desde el teléfono nuevo' },
            { hora: '18:06', evento: 'Foto y estado sin cambios', detalle: 'El perfil se ve igual que antes para no levantar sospechas' },
            { hora: '18:10', evento: 'Mensajes masivos', detalle: '47 chats contactados en 6 minutos con textos casi idénticos' }
          ]
        },
        pista: 'Con el código, el atacante registró la cuenta en su teléfono y él mismo activó la verificación en dos pasos para que Andrés no pudiera recuperarla fácil. Si Andrés la hubiera activado antes, el código solo no habría bastado.',
        costo: 15,
        clave: false
      },
      {
        id: 'extracto-mama',
        tipo: 'extracto',
        titulo: 'Comprobante de la mamá',
        contenido: {
          banco: 'Billetera Rápida',
          cuenta: 'Celular ****0731 · Nidia Caicedo (mamá de Andrés)',
          movimientos: [
            { fecha: '13/10/2026', hora: '18:21', concepto: 'Envío de dinero "préstamo a Andrés"', monto: -350000, destino: 'Celular ****0199 · J. Ortega P. (desconocido)' }
          ]
        },
        pista: 'La plata no llegó a una cuenta de Andrés sino a la de un desconocido: prueba de la suplantación (spoofing). Este comprobante es evidencia clave para la denuncia y para el reclamo a la billetera.',
        costo: 10,
        clave: false
      },
      {
        id: 'perfil-laura',
        tipo: 'perfil',
        titulo: 'Perfil de FotoGram de la prima',
        contenido: {
          red: 'FotoGram',
          usuario: '@laura.caicedo.m',
          nombreVisible: 'Laura Caicedo',
          seguidores: 612,
          siguiendo: 540,
          creado: '2022',
          bio: 'Enfermería 🩺 | Puerto Nexo',
          publicaciones: 88,
          observaciones: 'Historia publicada hace 3 horas: "⚠️ ME ROBARON EL CHATVERDE. Si les escribo pidiendo códigos o plata, NO SOY YO. Llámenme."'
        },
        pista: 'Laura avisó por otra red que le habían robado la cuenta, pero Andrés no lo vio. Es una cadena: cada cuenta robada se usa para robar la siguiente. Una simple llamada habría frenado el engaño.',
        costo: 10,
        clave: false
      }
    ],
    preguntas: [
      {
        id: 'p1',
        texto: '¿Qué le permitió al atacante quedarse con la cuenta de Andrés?',
        opciones: [
          { texto: 'El código de verificación de 6 dígitos que Andrés compartió.', correcta: true, retro: 'Así es. Ese código es la llave para registrar la cuenta en otro teléfono. Por eso nunca se comparte, ni con familiares.' },
          { texto: 'Un virus que entró al celular con el SMS.', correcta: false, retro: 'El SMS no tenía enlaces ni archivos: era el código legítimo de ChatVerde. El problema fue entregarlo.' },
          { texto: 'Que Andrés usaba una contraseña débil.', correcta: false, retro: 'ChatVerde se registra con el código que llega por SMS, no con una contraseña. Lo que faltó fue no compartirlo y tener el PIN de dos pasos activo.' }
        ]
      },
      {
        id: 'p2',
        texto: '¿Por qué Andrés confió en el mensaje?',
        opciones: [
          { texto: 'Porque traía el logo oficial de ChatVerde.', correcta: false, retro: 'El mensaje no tenía logos: era un chat normal desde la cuenta de su prima.' },
          { texto: 'Porque venía de la cuenta real de su prima, que ya estaba en manos del atacante.', correcta: true, retro: 'Correcto. Es spoofing: el atacante se hace pasar por alguien de confianza usando su propia cuenta robada.' },
          { texto: 'Porque su prima lo había llamado antes para avisarle.', correcta: false, retro: 'No hubo llamada. Justamente, llamar para verificar habría destapado el engaño.' }
        ]
      },
      {
        id: 'p3',
        texto: '¿Qué es lo primero que debe hacer para cortar la estafa?',
        opciones: [
          { texto: 'Crear una cuenta nueva y olvidarse de la anterior.', correcta: false, retro: 'El atacante seguiría pidiendo plata con su nombre. Hay que recuperar la cuenta y avisar.' },
          { texto: 'Escribirle al estafador para pedirle que le devuelva la cuenta.', correcta: false, retro: 'No negocies con el atacante: puede pedirte más datos o dinero.' },
          { texto: 'Avisar por otro canal a familia y contactos que no envíen dinero, reinstalar ChatVerde con su número para pedir un código nuevo y denunciar.', correcta: true, retro: 'Exacto. Avisar frena nuevas víctimas, pedir un código nuevo inicia la recuperación, y el robo de cuentas de chat se denuncia ante el CAI Virtual.' }
        ]
      }
    ],
    explicacion: '1) Primero robaron la cuenta de Laura, la prima de Andrés.\n2) Desde esa cuenta, el atacante le escribió a Andrés con una excusa creíble y mucha prisa.\n3) Al mismo tiempo pidió registrar el ChatVerde de Andrés en su propio teléfono, y por eso a Andrés le llegó el código por SMS.\n4) Andrés compartió el código: el atacante tomó la cuenta y activó el PIN de dos pasos para bloquearlo.\n5) Con la foto y el nombre de Andrés, escribió a 47 contactos pidiendo plata. Su mamá envió 350.000 pesos a un desconocido.',
    recompensa: { presupuesto: 80, evidencia: 15, confianza: 5 },
    consejo: {
      titulo: 'ESCUDO TÁCTICO',
      puntos: [
        'Spoofing: toman tu cuenta para pedirles dinero a tus contactos haciéndose pasar por ti. Ningún código de verificación se comparte, ni siquiera con familiares.',
        'Usa la verificación en dos pasos como tu escudo: activa el PIN de ChatVerde antes de que lo haga un atacante.',
        'Verifica por otro canal: llama directamente a tu amigo o familiar y confirma cualquier solicitud rara de dinero o de información.'
      ]
    },
    autoridad: AUT_CAI
  },

  {
    id: 'wifi-gemela-malecon',
    titulo: 'La red gemela',
    edificio: 'cafe-malecon',
    era: 1,
    cuadrante: 'tecnico',
    urgencia: 'media',
    plazo: 280,
    victima: { nombre: 'Daniela Herrera', edad: 17, rol: 'Estudiante de 11.° y creadora de contenido', retrato: '👩🏻' },
    resumen: 'Clientes del café perdieron sus cuentas de FotoGram tras usar el Wi-Fi gratis.',
    declaracion: 'Estaba en el Café del Malecón haciendo una tarea y me conecté a "Malecon_Free_WiFi" porque no pedía clave. Me salió una página para "iniciar sesión con FotoGram" y tener internet gratis, y lo hice. Esa misma noche mi cuenta empezó a seguir gente rara y a mandarles mensajes con enlaces a mis seguidores. Otras dos personas que estaban en el café dicen que les pasó lo mismo.',
    evidencias: [
      {
        id: 'registro-redes',
        tipo: 'registro',
        titulo: 'Escaneo de redes Wi-Fi del café',
        contenido: {
          sistema: 'Escáner de redes inalámbricas · Café del Malecón · 13/10/2026 16:40',
          lineas: [
            { hora: '16:40:02', evento: 'Red detectada', detalle: 'CafeMalecon_Clientes · protegida (WPA2) · la clave está impresa en la carta · router del local' },
            { hora: '16:40:02', evento: 'Red detectada', detalle: 'Malecon_Free_WiFi · ABIERTA · sin cifrado · señal muy fuerte' },
            { hora: '16:40:05', evento: 'Origen de la señal', detalle: 'Malecon_Free_WiFi sale de un punto de acceso portátil en la terraza, no del router del café' },
            { hora: '16:40:09', evento: 'Portal de bienvenida', detalle: 'Exige "Inicia sesión con FotoGram para navegar gratis"' },
            { hora: '16:40:11', evento: 'Consulta al dueño', detalle: 'El café nunca ha tenido una red llamada Malecon_Free_WiFi' }
          ]
        },
        pista: 'El café tiene su red oficial con clave. "Malecon_Free_WiFi" es una red gemela: abierta, emitida desde un aparato portátil y que pide tu cuenta de FotoGram. Un atacante la montó para atraer clientes.',
        costo: 15,
        clave: true
      },
      {
        id: 'url-portal',
        tipo: 'url',
        titulo: 'Página de "inicio de sesión"',
        contenido: {
          mostrada: 'Iniciar sesión con FotoGram · Wi-Fi gratis',
          real: 'http://fotogram-login.wifi-gratis.top/acceso',
          certificado: 'Ninguno: la conexión NO usa HTTPS',
          creado: 'Hace 9 días (04/10/2026)',
          observaciones: 'Copia de la página de inicio de sesión de FotoGram. Al enviar el formulario, usuario y clave se guardan en un servidor externo y luego te manda a la página real para que no sospeches.'
        },
        pista: 'Sin HTTPS y en un dominio .top que no es de FotoGram: es una página falsa para capturar credenciales. La red gemela obligaba a pasar por ella.',
        costo: 15,
        clave: true
      },
      {
        id: 'correo-alerta-fg',
        tipo: 'correo',
        titulo: 'Alerta de inicio de sesión',
        contenido: {
          de: 'seguridad@fotogram.com',
          para: 'dani.herrera.crea@correonexo.co',
          asunto: 'Nuevo inicio de sesión en tu cuenta',
          fecha: '13/10/2026 · 16:52',
          cuerpo: 'Hola, @dani.crea. Detectamos un inicio de sesión desde un dispositivo nuevo (computador Linux, ubicación aproximada: Puerto Nexo) a las 16:52. Si fuiste tú, ignora este mensaje. Si no, cambia tu contraseña y activa la autenticación en dos pasos desde la app.',
          adjuntos: []
        },
        pista: 'Daniela no inició sesión desde un computador: el atacante usó la clave capturada un minuto después, desde la misma zona del café. Con autenticación multifactor, la clave sola no le habría servido.',
        costo: 10,
        clave: false
      },
      {
        id: 'perfil-dani',
        tipo: 'perfil',
        titulo: 'Perfil de Daniela tras el robo',
        contenido: {
          red: 'FotoGram',
          usuario: '@dani.crea',
          nombreVisible: 'Dani ✨ Herrera',
          seguidores: 12400,
          siguiendo: 2150,
          creado: '2020',
          bio: 'Gana 500 mil DIARIOS desde tu cel 💸 link abajo 👇',
          publicaciones: 341,
          observaciones: 'En una sola noche pasó de seguir 312 cuentas a 2.150. La biografía cambió y hay 3 historias nuevas con enlaces de "inversiones".'
        },
        pista: 'La cuenta robada ahora sirve de carnada: aprovecha la confianza de 12.400 seguidores para difundir una estafa de "dinero fácil".',
        costo: 10,
        clave: false
      },
      {
        id: 'chat-seguidora',
        tipo: 'chat',
        titulo: 'Mensajes enviados desde la cuenta',
        contenido: {
          app: 'FotoGram · mensajes directos',
          contacto: '@sofi_23 (seguidora de Daniela)',
          mensajes: [
            { de: 'victima', texto: 'Amiga mira esto, gané 500 mil en un día 😱 entra aca: ganadiario.top/dani', hora: '22:14' },
            { de: 'contacto', texto: 'Dani?? eso no suena a ti 🤔', hora: '22:20' },
            { de: 'victima', texto: 'jaja si soy yo, entra rapido q se acaba el cupo', hora: '22:21' },
            { de: 'contacto', texto: 'te voy a llamar mejor', hora: '22:22' }
          ]
        },
        pista: 'Codicia más urgencia ("se acaba el cupo") y errores de ortografía que no son del estilo de Daniela. La seguidora hizo lo correcto: verificar por otro canal.',
        costo: 10,
        clave: false
      }
    ],
    preguntas: [
      {
        id: 'p1',
        texto: '¿Cómo capturaron la contraseña de Daniela?',
        opciones: [
          { texto: 'Alguien miró su pantalla por encima del hombro.', correcta: false, retro: 'No hace falta: la evidencia muestra una red y una página falsas que recogían las claves automáticamente.' },
          { texto: 'Una red Wi-Fi falsa la obligó a pasar por una página de inicio de sesión clonada.', correcta: true, retro: 'Exacto. La red gemela redirigía a un clon de FotoGram sin HTTPS, y ahí quedó la clave.' },
          { texto: 'FotoGram sufrió una filtración masiva de datos.', correcta: false, retro: 'Solo cayeron quienes usaron esa red en el café. No fue un problema de FotoGram.' }
        ]
      },
      {
        id: 'p2',
        texto: '¿Qué detalle demuestra que "Malecon_Free_WiFi" no era del café?',
        opciones: [
          { texto: 'Era la red con la señal más fuerte.', correcta: false, retro: 'Una señal fuerte no prueba nada. De hecho, los atacantes se sientan cerca para que su red sea la más llamativa.' },
          { texto: 'Era abierta, salía de un aparato portátil y el dueño confirmó que no es suya, mientras la red oficial tiene clave.', correcta: true, retro: 'Correcto. Ante la duda, pregunta en el local cuál es la red oficial.' },
          { texto: 'Tenía la palabra "Free" en el nombre.', correcta: false, retro: 'El nombre lo puede poner cualquiera. Hay que comprobar el origen y preguntar en el local.' }
        ]
      },
      {
        id: 'p3',
        texto: '¿Qué debió hacer Daniela para conectarse sin riesgo?',
        opciones: [
          { texto: 'Usar sus datos móviles, o la red oficial del café, y no iniciar sesión en cuentas importantes en un Wi-Fi público.', correcta: true, retro: 'Bien. Las redes públicas y desconocidas no son para trámites ni para iniciar sesión en cuentas importantes.' },
          { texto: 'Conectarse igual, pero en modo incógnito.', correcta: false, retro: 'El modo incógnito solo evita guardar el historial en tu equipo; no te protege de una red o una página falsas.' },
          { texto: 'Elegir siempre la red que no pide clave porque es más rápida.', correcta: false, retro: 'Al revés: una red abierta y desconocida es el escenario perfecto para un atacante.' }
        ]
      }
    ],
    explicacion: '1) El atacante se sentó en la terraza con un punto de acceso portátil y creó la red abierta "Malecon_Free_WiFi".\n2) Quien se conectaba veía un portal que exigía "iniciar sesión con FotoGram" para navegar.\n3) Ese portal era una página clonada sin HTTPS en un dominio .top: guardaba usuario y clave.\n4) Un minuto después, el atacante entró a la cuenta real de Daniela desde su computador.\n5) Cambió la biografía y usó la cuenta para enviar estafas de "dinero fácil" a sus seguidores.',
    recompensa: { presupuesto: 85, evidencia: 15, confianza: 5 },
    consejo: {
      titulo: 'ESCUDO TÁCTICO',
      puntos: [
        'Evita las redes Wi-Fi públicas y desconocidas para trámites sensibles o para iniciar sesión en cuentas importantes.',
        'Verifica siempre que la página use HTTPS y que el dominio sea el oficial antes de escribir tu contraseña.',
        'Activa la autenticación multifactor (MFA): aunque roben tu contraseña, será casi imposible entrar sin el segundo factor.'
      ]
    },
    autoridad: AUT_CAI
  },

  // ───────────────────────────── ERA 2 · APLICA ─────────────────────────────
  {
    id: 'clave-cartagena123',
    titulo: 'La clave de todo',
    edificio: 'casa-2',
    era: 2,
    cuadrante: 'contenido',
    urgencia: 'alta',
    plazo: 250,
    victima: { nombre: 'Samuel Torres', edad: 17, rol: 'Estudiante de 11.° y volante de la selección del colegio', retrato: '🧑🏾' },
    resumen: 'Robaron su FotoGram y publicaron un video falso con su cara y su voz.',
    declaracion: 'Desde el sábado no puedo entrar a mi FotoGram: alguien cambió la clave y el correo. Ahora en mi perfil hay un video donde "yo" insulto a un profesor, pero yo nunca grabé eso. Es mi cara y mi voz, pero no soy yo. Mi clave era la misma para todo: Cartagena123. Nunca activé la verificación en dos pasos porque me parecía una pérdida de tiempo.',
    evidencias: [
      {
        id: 'correo-filtracion',
        tipo: 'correo',
        titulo: 'Aviso de filtración de un foro',
        contenido: {
          de: 'soporte@arenagamer-foro.com',
          para: 'samueltorres10@correonexo.co',
          asunto: 'Aviso de seguridad: filtración de datos de usuarios',
          fecha: '27/09/2026 · 10:05',
          cuerpo: 'Estimado usuario: detectamos un acceso no autorizado a nuestra base de datos. Se expusieron correos y contraseñas de parte de nuestros usuarios. Si usas la misma contraseña en otros servicios, cámbiala de inmediato en todos ellos.',
          adjuntos: []
        },
        pista: 'La clave de Samuel se filtró hace dos semanas en un foro de videojuegos. Como la usaba en todo, los atacantes la probaron en FotoGram y funcionó. Esto se llama "relleno de credenciales".',
        costo: 10,
        clave: true
      },
      {
        id: 'registro-fg',
        tipo: 'registro',
        titulo: 'Actividad de la cuenta',
        contenido: {
          sistema: 'FotoGram · Actividad de inicio de sesión de @samuel.torres10',
          lineas: [
            { hora: '11/10 · 03:10', evento: 'Inicio de sesión exitoso', detalle: 'Dispositivo desconocido · sin verificación en dos pasos · 0 intentos fallidos' },
            { hora: '11/10 · 03:11', evento: 'Contraseña cambiada', detalle: 'Desde el dispositivo desconocido' },
            { hora: '11/10 · 03:12', evento: 'Correo cambiado', detalle: 'samueltorres10@correonexo.co → s4mu3l.backup@mailrapido.top' },
            { hora: '11/10 · 03:14', evento: 'Teléfono de recuperación eliminado', detalle: '+57 300 555 0172 removido' },
            { hora: '11/10 · 09:40', evento: 'Video publicado', detalle: 'reel_samuel_profe.mp4 · 2.300 reproducciones en 3 horas' }
          ]
        },
        pista: 'Entraron a la primera, sin intentos fallidos: tenían la clave real. Sin segundo factor nada los detuvo. Luego cambiaron el correo y el teléfono para cerrarle a Samuel las puertas de recuperación.',
        costo: 15,
        clave: true
      },
      {
        id: 'archivo-video',
        tipo: 'archivo',
        titulo: 'Video publicado en su perfil',
        contenido: {
          nombre: 'reel_samuel_profe.mp4',
          tamano: '8,4 MB · 0:38 min',
          origen: 'Subido desde la cuenta robada el 11/10 a las 9:40',
          firma: 'Metadatos: generado con "CaraSwap Studio IA" · voz sintetizada · sin datos de cámara · parpadeo irregular y bordes borrosos en la mandíbula',
          permisos: []
        },
        pista: 'Es un deepfake: los metadatos muestran que lo generó una IA, no una cámara. La cara y la voz se armaron con las fotos y videos públicos de Samuel.',
        costo: 20,
        clave: true
      },
      {
        id: 'perfil-samuel',
        tipo: 'perfil',
        titulo: 'Perfil público de Samuel (antes del robo)',
        contenido: {
          red: 'FotoGram',
          usuario: '@samuel.torres10',
          nombreVisible: 'Samuel Torres ⚽',
          seguidores: 3870,
          siguiendo: 1290,
          creado: '2021',
          bio: 'Volante 🦁 | Colegio La Muralla | 11-B | Puerto Nexo',
          publicaciones: 214,
          observaciones: 'Perfil 100 % público: colegio, curso y 37 videos hablando a la cámara. Material de sobra para entrenar una IA que imite su cara y su voz.'
        },
        pista: 'Con un perfil público lleno de videos, cualquiera puede descargar su cara y su voz. La privacidad también protege contra los deepfakes.',
        costo: 10,
        clave: false
      },
      {
        id: 'sms-aviso-correo',
        tipo: 'sms',
        titulo: 'SMS que llegó de madrugada',
        contenido: {
          remitente: 'FotoGram',
          hora: '11/10/2026 · 03:12',
          texto: 'FotoGram: el correo de tu cuenta se cambió a s4m***@mailrapido.top. Si no fuiste tú, protege tu cuenta desde la app en Configuración > Ayuda > "Mi cuenta fue hackeada".',
          enlaces: []
        },
        pista: 'FotoGram avisó a las 3 a. m., mientras Samuel dormía. El aviso no trae enlaces: indica entrar por la app oficial. Así debe iniciar la recuperación.',
        costo: 10,
        clave: false
      }
    ],
    preguntas: [
      {
        id: 'p1',
        texto: '¿Cómo entraron a la cuenta de Samuel?',
        opciones: [
          { texto: 'Con una página de phishing que llegó por SMS.', correcta: false, retro: 'No hay enlace falso en este caso: entraron a la primera con la clave real, que ya estaba filtrada.' },
          { texto: 'Por fuerza bruta, probando miles de claves.', correcta: false, retro: 'La bitácora muestra 0 intentos fallidos. No tuvieron que adivinar nada.' },
          { texto: 'Con la clave filtrada en el foro, que él reutilizaba, y sin un segundo factor que los frenara.', correcta: true, retro: 'Correcto. Una misma clave en todas partes convierte una filtración en un robo en cadena. Con la verificación en dos pasos, la clave sola no habría bastado.' }
        ]
      },
      {
        id: 'p2',
        texto: '¿Qué es el video del profesor?',
        opciones: [
          { texto: 'Un deepfake creado con IA a partir de sus fotos y videos públicos.', correcta: true, retro: 'Exacto. Los metadatos revelan voz sintetizada y que no lo grabó ninguna cámara.' },
          { texto: 'Un video real que Samuel ya había olvidado.', correcta: false, retro: 'El archivo no tiene datos de cámara y muestra fallas típicas de la IA en la mandíbula y el parpadeo.' },
          { texto: 'Un filtro de una app de efectos que Samuel usó por chiste.', correcta: false, retro: 'Lo publicaron después del robo, desde un dispositivo desconocido. Samuel no lo hizo.' }
        ]
      },
      {
        id: 'p3',
        texto: '¿Cuál contraseña sigue la fórmula segura de la presentación?',
        opciones: [
          { texto: 'Cartagena123', correcta: false, retro: 'Falla por nombre propio más una secuencia numérica predecible. Es de las primeras que prueban.' },
          { texto: 'Samuel2009', correcta: false, retro: 'Tu nombre y tu año de nacimiento son lo primero que un atacante intenta.' },
          { texto: 'C@rt4g3nA#2026!', correcta: true, retro: 'Bien: más de 12 caracteres con mayúsculas, minúsculas, números y símbolos. Y debe ser única para cada servicio clave, guardada en un gestor de contraseñas.' },
          { texto: 'cartagenacartagena', correcta: false, retro: 'Es larga, pero solo usa minúsculas y repite una palabra común.' }
        ]
      }
    ],
    explicacion: '1) Un foro de videojuegos sufrió una filtración y la clave "Cartagena123" de Samuel quedó expuesta.\n2) Los atacantes probaron esa misma clave en FotoGram y entraron a la primera, porque no había verificación en dos pasos.\n3) Cambiaron contraseña, correo y teléfono para que Samuel no pudiera recuperar la cuenta.\n4) Con sus videos públicos entrenaron una IA y fabricaron un deepfake con su cara y su voz.\n5) Publicaron el video desde su cuenta para dañar su reputación: suplantación de identidad.',
    recompensa: { presupuesto: 95, evidencia: 20, confianza: 6 },
    consejo: {
      titulo: 'ESCUDO TÁCTICO',
      puntos: [
        'Usa claves largas y únicas: mínimo 12 caracteres con mayúsculas, minúsculas, números y símbolos, y apóyate en un gestor de contraseñas.',
        'Activa la verificación en dos pasos con una app autenticadora en lugar del SMS, que se puede interceptar.',
        'Configura tu perfil como cerrado, solo con amigos reales: menos material público, menos posibilidades de suplantarte.'
      ]
    },
    autoridad: AUT_FISCALIA
  },

  {
    id: 'apk-troyano',
    titulo: 'El mod "gratis"',
    edificio: 'tecnostore',
    era: 2,
    cuadrante: 'tecnico',
    urgencia: 'media',
    plazo: 270,
    victima: { nombre: 'Kevin Julio', edad: 15, rol: 'Estudiante de 10.° · llevó su celular a TecnoStore', retrato: '👦🏽' },
    resumen: 'Un juego "modificado" convirtió un celular en espía y vació una billetera.',
    declaracion: 'En un grupo pasaron un enlace para descargar "Leyendas de Arena MOD" con diamantes infinitos, gratis. No estaba en la tienda oficial, así que lo bajé como APK y le di "permitir" a todo lo que pidió. El juego nunca abrió. Desde ese día el celular se calienta, se descarga rápido y de mi Billetera Rápida desaparecieron 150.000 pesos. Lo traje a TecnoStore para que lo revisen.',
    evidencias: [
      {
        id: 'archivo-apk',
        tipo: 'archivo',
        titulo: 'Instalador descargado',
        contenido: {
          nombre: 'LeyendasArena_MOD_diamantes_v9.apk',
          tamano: '4,1 MB (el juego oficial pesa 1,2 GB)',
          origen: 'descargas-mods-gratis.top',
          firma: 'Sin la firma del desarrollador oficial · firmado con una clave genérica de pruebas',
          permisos: ['Leer y enviar SMS', 'Servicio de accesibilidad (controlar la pantalla)', 'Mostrarse sobre otras apps', 'Iniciarse al encender el teléfono', 'Leer contactos']
        },
        pista: 'Un juego no necesita leer tus SMS ni controlar tu pantalla. Y 4 MB contra 1,2 GB del juego real: no es el juego, es un troyano disfrazado que abre una puerta trasera.',
        costo: 20,
        clave: true
      },
      {
        id: 'chat-grupo-gamer',
        tipo: 'chat',
        titulo: 'Grupo donde llegó el enlace',
        contenido: {
          app: 'ChatVerde',
          contacto: 'Grupo "Gamers Puerto Nexo 🎮" · +57 315 555 0122 (desconocido)',
          mensajes: [
            { de: 'contacto', texto: '🔥🔥 LEYENDAS DE ARENA MOD 🔥🔥 diamantes infinitos + todas las skins GRATIS', hora: '20:05' },
            { de: 'contacto', texto: 'link solo por hoy 👉 descargas-mods-gratis.top/arena', hora: '20:05' },
            { de: 'victima', texto: 'funciona de verdad?', hora: '20:09' },
            { de: 'contacto', texto: 'claro bro 100% real, ya lo bajaron 300 personas', hora: '20:10' },
            { de: 'contacto', texto: 'si te sale "fuente desconocida" dale permitir, es normal 👍', hora: '20:10' }
          ]
        },
        pista: 'Premio gratis + "solo por hoy" + la instrucción de saltarse la protección del teléfono: el combo clásico de la ingeniería social para que tú mismo instales el malware.',
        costo: 10,
        clave: false
      },
      {
        id: 'url-descarga',
        tipo: 'url',
        titulo: 'Sitio de descarga',
        contenido: {
          mostrada: 'descargas-mods-gratis.top/arena',
          real: 'http://descargas-mods-gratis.top/dl/arena_mod_v9.apk',
          certificado: 'Ninguno: la conexión NO usa HTTPS',
          creado: 'Hace 6 días',
          observaciones: 'No es una tienda oficial. El sitio cambia el nombre del archivo cada día para que los antivirus no lo reconozcan.'
        },
        pista: 'Las apps se descargan únicamente de tiendas oficiales. Un sitio .top sin HTTPS, creado hace seis días y que cambia el archivo a diario, es una fábrica de malware.',
        costo: 15,
        clave: false
      },
      {
        id: 'registro-forense',
        tipo: 'registro',
        titulo: 'Análisis forense del celular',
        contenido: {
          sistema: 'TecnoStore · Revisión técnica del celular de Kevin',
          lineas: [
            { hora: '09/10 · 20:14', evento: 'Instalación desde fuente desconocida', detalle: 'LeyendasArena_MOD_diamantes_v9.apk' },
            { hora: '09/10 · 20:15', evento: 'Permiso de accesibilidad concedido', detalle: 'La app puede leer y tocar la pantalla' },
            { hora: '09/10 · 20:16', evento: 'Ícono oculto', detalle: 'La app desapareció del menú, pero sigue activa' },
            { hora: '10/10 · 02:30', evento: 'Conexiones salientes', detalle: 'panel.control-arena.xyz cada 15 minutos' },
            { hora: '11/10 · 14:02', evento: 'SMS reenviado', detalle: 'Código de Billetera Rápida reenviado a un número extranjero' }
          ]
        },
        pista: 'La app escondió su ícono, se reporta a un servidor de control y reenvía los SMS con códigos. Así el atacante autorizó los movimientos de la billetera sin que Kevin se diera cuenta.',
        costo: 15,
        clave: true
      },
      {
        id: 'extracto-billetera',
        tipo: 'extracto',
        titulo: 'Movimientos de la billetera',
        contenido: {
          banco: 'Billetera Rápida',
          cuenta: 'Celular ****8815 · Kevin Julio',
          movimientos: [
            { fecha: '10/10/2026', hora: '16:30', concepto: 'Recarga de la mesada', monto: 200000, destino: 'Cuenta propia' },
            { fecha: '11/10/2026', hora: '14:03', concepto: 'Envío de dinero', monto: -120000, destino: 'Celular ****4471 · desconocido' },
            { fecha: '11/10/2026', hora: '14:05', concepto: 'Pago de recargas', monto: -30000, destino: 'Recargas a 3 números desconocidos' }
          ]
        },
        pista: 'Los dos cobros ocurrieron justo un minuto después de que el troyano reenviara el código por SMS. Kevin no los hizo.',
        costo: 10,
        clave: false
      }
    ],
    preguntas: [
      {
        id: 'p1',
        texto: '¿Qué tipo de malware instaló Kevin?',
        opciones: [
          { texto: 'Un ransomware.', correcta: false, retro: 'Un ransomware cifra tus archivos y pide un rescate. Aquí no hubo cifrado ni nota de rescate.' },
          { texto: 'Un troyano: se disfrazó de juego gratis para abrir una puerta trasera.', correcta: true, retro: 'Exacto. Igual que el caballo de Troya: parece un regalo, pero adentro trae al enemigo.' },
          { texto: 'Un virus que se copia a otros archivos.', correcta: false, retro: 'No se replicó: se hizo pasar por una aplicación legítima para que Kevin lo instalara.' }
        ]
      },
      {
        id: 'p2',
        texto: '¿Cuál fue la bandera roja más grave al instalarlo?',
        opciones: [
          { texto: 'Que pidiera conexión a internet.', correcta: false, retro: 'Casi todas las apps usan internet. Eso solo no dice nada.' },
          { texto: 'Que pidiera leer SMS y el servicio de accesibilidad para controlar la pantalla.', correcta: true, retro: 'Correcto. Con esos permisos una app puede leer tus códigos y tocar la pantalla por ti. Un juego no los necesita.' },
          { texto: 'Que pidiera guardar archivos en el teléfono.', correcta: false, retro: 'Un juego sí guarda partidas y datos. El problema son los permisos que no tienen nada que ver con jugar.' }
        ]
      },
      {
        id: 'p3',
        texto: '¿Qué debe hacer Kevin ahora?',
        opciones: [
          { texto: 'Borrar el ícono del juego y seguir usando el celular.', correcta: false, retro: 'El ícono ya estaba oculto y la app seguía activa. Borrar un ícono no elimina el troyano.' },
          { texto: 'Instalar un "antivirus gratis" del mismo sitio.', correcta: false, retro: 'Sería instalar otro malware. El software se baja solo de fuentes oficiales.' },
          { texto: 'Respaldar fotos, restablecer el celular, cambiar sus claves desde otro equipo, avisar a la billetera y denunciar.', correcta: true, retro: 'Bien. Hay que sacar al intruso, cambiar todo lo que pudo ver y reportar el hurto informático.' }
        ]
      }
    ],
    explicacion: '1) En un grupo de chat ofrecieron un "mod" gratis del juego con urgencia ("solo por hoy").\n2) Kevin descargó un APK de un sitio no oficial y aceptó instalarlo desde una fuente desconocida.\n3) El falso juego pidió leer SMS y controlar la pantalla, y luego escondió su ícono.\n4) Desde un servidor de control, el atacante pidió dinero desde la billetera; el troyano interceptó el código por SMS y lo reenvió.\n5) Así salieron 150.000 pesos sin que Kevin tocara su celular.',
    recompensa: { presupuesto: 100, evidencia: 20, confianza: 5 },
    consejo: {
      titulo: 'ESCUDO TÁCTICO',
      puntos: [
        'Descarga software y apps únicamente de tiendas oficiales.',
        'Mantén el sistema de tu móvil actualizado y las actualizaciones automáticas activadas.',
        'Desconfía por instinto de mensajes urgentes y premios sorpresa: "gratis" e "infinito" son el anzuelo.'
      ]
    },
    autoridad: AUT_FISCALIA
  },

  {
    id: 'ransomware-proyectos',
    titulo: 'Proyectos secuestrados',
    edificio: 'colegio',
    era: 2,
    cuadrante: 'tecnico',
    urgencia: 'alta',
    plazo: 240,
    victima: { nombre: 'Marta Lucía Pacheco', edad: 44, rol: 'Coordinadora de proyectos de grado · Colegio La Muralla', retrato: '👩🏽‍🏫' },
    resumen: 'Un ransomware cifró los proyectos de grado y exige un rescate.',
    declaracion: 'Llegó un correo de la "Secretaría de Educación" con un adjunto que parecía un PDF con el nuevo cronograma de grados. Lo abrí en el computador de la sala de profesores. A los pocos minutos, todos los archivos de la carpeta compartida cambiaron de nombre y no abren. Ahí están los 38 proyectos de grado de 11.°. Apareció una nota pidiendo un pago en criptomonedas y algunos profesores dicen que paguemos ya.',
    evidencias: [
      {
        id: 'correo-cronograma',
        tipo: 'correo',
        titulo: 'Correo del "cronograma de grados"',
        contenido: {
          de: 'secretaria.educacion@sed-notificaciones-oficial.top',
          para: 'coordinacion@colegiolamuralla.edu.co',
          asunto: 'URGENTE!! Nuevo cronograma de grados 2026 - respuesta obligatoria HOY',
          fecha: '13/10/2026 · 07:12',
          cuerpo: 'Cordial saludo señores rector@s y coordinador@s. Se adjunta el cronograma ACTUALIZADO de sustentacion de proyectos de grado. Es de caracter obligatorio descargarlo antes de las 12m, de lo contrario la institucion perdera el cupo de sustentacion. Atentamente, Secretaria de Educacion.',
          adjuntos: ['Cronograma_Grados_2026.pdf.exe']
        },
        pista: 'Dominio .top que no es institucional, urgencia ("respuesta obligatoria HOY"), amenaza ("perderá el cupo"), errores de ortografía y un adjunto con doble extensión. Todas las alarmas a la vez.',
        costo: 10,
        clave: true
      },
      {
        id: 'archivo-adjunto',
        tipo: 'archivo',
        titulo: 'El adjunto "PDF"',
        contenido: {
          nombre: 'Cronograma_Grados_2026.pdf.exe',
          tamano: '612 KB',
          origen: 'Adjunto del correo del 13/10 · 07:12',
          firma: 'Sin firma digital · ícono de PDF falso · en realidad es un programa ejecutable de Windows',
          permisos: ['Modificar archivos de las carpetas compartidas', 'Borrar las copias de seguridad del sistema', 'Ejecutarse al iniciar sesión']
        },
        pista: 'Windows esconde las extensiones conocidas, así que en pantalla se veía "Cronograma_Grados_2026.pdf". En realidad era un programa (.exe) con ícono de PDF: el ransomware.',
        costo: 15,
        clave: true
      },
      {
        id: 'registro-servidor',
        tipo: 'registro',
        titulo: 'Bitácora del servidor de archivos',
        contenido: {
          sistema: 'Servidor de archivos · Colegio La Muralla',
          lineas: [
            { hora: '12/10 · 23:00', evento: 'Copia de seguridad nocturna', detalle: 'Copia completa en disco externo · luego desconectado de la red · OK' },
            { hora: '13/10 · 07:31', evento: 'Programa ejecutado', detalle: 'Cronograma_Grados_2026.pdf.exe en PC-SALAPROFES-02' },
            { hora: '13/10 · 07:32', evento: 'Copias del sistema borradas', detalle: 'El programa eliminó las copias instantáneas de Windows' },
            { hora: '13/10 · 07:33', evento: 'Cifrado masivo', detalle: '1.284 archivos renombrados a .nexolock' },
            { hora: '13/10 · 07:41', evento: 'Nota de rescate', detalle: 'LEEME_RECUPERAR.txt creada en cada carpeta' }
          ]
        },
        pista: 'El ransomware cifró todo y borró las copias de Windows, pero NO alcanzó la copia de seguridad de anoche porque estaba en un disco desconectado. Los proyectos se pueden recuperar sin pagar.',
        costo: 15,
        clave: true
      },
      {
        id: 'url-rescate',
        tipo: 'url',
        titulo: 'Portal de pago de la nota de rescate',
        contenido: {
          mostrada: 'Enlace en LEEME_RECUPERAR.txt',
          real: 'http://pago-rescate-nexolock.xyz/victima/LM-38',
          certificado: 'Ninguno',
          creado: 'Hace 2 días',
          observaciones: 'La nota dice: "Sus archivos fueron cifrados. Pague 0,05 BTC en 72 horas o se borraran para siempre." No ofrece ninguna garantía. Muchos grupos cobran y nunca entregan la llave, o vuelven a atacar a quien pagó.'
        },
        pista: 'Pagar no garantiza recuperar nada, financia el delito y marca al colegio como "cliente que paga". Con una copia de seguridad intacta, no hay razón para pagar.',
        costo: 10,
        clave: false
      },
      {
        id: 'chat-docentes',
        tipo: 'chat',
        titulo: 'Grupo de docentes',
        contenido: {
          app: 'ChatVerde',
          contacto: 'Grupo "Docentes La Muralla"',
          mensajes: [
            { de: 'contacto', texto: 'Prof. Ramiro: Paguemos de una!! son los proyectos de los muchachos', hora: '07:50' },
            { de: 'contacto', texto: 'Prof. Yaneth: yo pongo 50 mil', hora: '07:51' },
            { de: 'victima', texto: 'Esperen, el de sistemas dice que hay copia de anoche', hora: '07:55' },
            { de: 'contacto', texto: 'Rectora Inés: Nadie paga nada. Desconecten los equipos de la red, no los apaguen y no borren la nota. Ya llamé a la Policía.', hora: '07:58' }
          ]
        },
        pista: 'La rectora tomó la decisión correcta: aislar los equipos para frenar el cifrado, conservar la evidencia (la nota y el correo) y denunciar. Luego se restaura desde la copia limpia.',
        costo: 10,
        clave: false
      }
    ],
    preguntas: [
      {
        id: 'p1',
        texto: '¿Cómo entró el ransomware al colegio?',
        opciones: [
          { texto: 'Por el Wi-Fi del colegio, que no tiene clave.', correcta: false, retro: 'La bitácora muestra que todo empezó cuando se ejecutó el adjunto en el PC de la sala de profesores.' },
          { texto: 'Por un adjunto .pdf.exe en un correo falso de la Secretaría de Educación.', correcta: true, retro: 'Exacto. La doble extensión hizo pasar un programa por un PDF.' },
          { texto: 'Un estudiante hackeó el servidor desde su casa.', correcta: false, retro: 'No hay accesos externos al servidor: el programa se ejecutó dentro del colegio al abrir el correo.' }
        ]
      },
      {
        id: 'p2',
        texto: '¿Deben pagar el rescate?',
        opciones: [
          { texto: 'Sí, es la única forma de recuperar los proyectos.', correcta: false, retro: 'Falso: la copia de seguridad de anoche está intacta. Además, pagar no garantiza que entreguen la llave.' },
          { texto: 'Pagar solo la mitad para negociar.', correcta: false, retro: 'Negociar con delincuentes también los financia y no garantiza nada.' },
          { texto: 'No: hay una copia de seguridad intacta, pagar no garantiza nada y financia el delito.', correcta: true, retro: 'Correcto. La copia de seguridad desconectada es la mejor defensa contra el ransomware.' }
        ]
      },
      {
        id: 'p3',
        texto: '¿Qué señal del correo debió frenar a la coordinadora?',
        opciones: [
          { texto: 'Que empezara con un saludo formal.', correcta: false, retro: 'Los correos falsos también saludan formalmente. Eso no ayuda a distinguirlos.' },
          { texto: 'El dominio .top no institucional, la urgencia y el adjunto con doble extensión .pdf.exe.', correcta: true, retro: 'Bien. Remitente raro + urgencia + adjunto ejecutable = alerta roja.' },
          { texto: 'Que llegara temprano en la mañana.', correcta: false, retro: 'La hora no dice nada. Lo que delata el engaño es el remitente, el tono y el adjunto.' }
        ]
      }
    ],
    explicacion: '1) Los atacantes enviaron un correo con urgencia, haciéndose pasar por la Secretaría de Educación.\n2) El adjunto parecía un PDF, pero era un programa ejecutable (.pdf.exe).\n3) Al abrirlo, el ransomware borró las copias de Windows y cifró 1.284 archivos de la carpeta compartida.\n4) Dejó una nota exigiendo un pago en criptomonedas en 72 horas.\n5) La copia de seguridad nocturna estaba en un disco desconectado, así que el colegio puede restaurar todo sin pagar, después de limpiar los equipos y denunciar la extorsión.',
    recompensa: { presupuesto: 110, evidencia: 25, confianza: 7 },
    consejo: {
      titulo: 'ESCUDO TÁCTICO',
      puntos: [
        'Usa software oficial y haz copias de seguridad de todo, guardadas fuera de la red.',
        'Mantén todos tus dispositivos y apps actualizados: activa las actualizaciones automáticas.',
        'Desconfía por instinto de los mensajes urgentes: revisa el remitente y la extensión real del adjunto antes de abrirlo.'
      ]
    },
    autoridad: AUT_CAI
  }
];
