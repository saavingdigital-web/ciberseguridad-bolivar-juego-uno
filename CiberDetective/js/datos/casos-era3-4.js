// CiberDetective · Casos de las eras 3 (REACCIONA) y 4 (DENUNCIA)
// Todos los nombres, marcas, números y dominios son FICTICIOS.
// Los casos de grooming y sextorsión se tratan sin detalles explícitos: el foco es la protección,
// la documentación y que la víctima NUNCA tiene la culpa.

const AUT_CAI = 'Centro Cibernético Policial (CAI Virtual)';
const AUT_SIC = 'Superintendencia de Industria y Comercio (SIC)';
const AUT_APOYO = 'Red de apoyo: padres, profesores y orientación escolar';

export const CASOS_ERA_3_4 = [
  // ───────────────────────────── ERA 3 · REACCIONA ─────────────────────────────
  {
    id: 'grooming-pixelplay',
    titulo: 'El amigo de las skins',
    edificio: 'cibercafe',
    era: 3,
    cuadrante: 'contacto',
    urgencia: 'alta',
    plazo: 240,
    victima: { nombre: 'Juan José Rodelo', edad: 14, rol: 'Estudiante de 9.° · cliente frecuente del Cibercafé Pixel', retrato: '👦🏻' },
    resumen: 'Un "gamer de 15 años" regala skins y pide fotos por un chat privado.',
    declaracion: 'En Leyendas de Arena conocí a "Nico_Pro", que decía tener 15 años y ser streamer. Me regalaba skins y me ayudaba a subir de nivel. Después me pidió que habláramos por una app privada y que no le contara a nadie, porque "los adultos no entienden". Hace dos días me pidió fotos personales "para un concurso" y, como le dije que no, me amenazó. Me dio miedo y le conté a don Efraín, el del cibercafé.',
    evidencias: [
      {
        id: 'perfil-nico',
        tipo: 'perfil',
        titulo: 'Perfil de "Nico_Pro_15"',
        contenido: {
          red: 'PixelPlay',
          usuario: 'Nico_Pro_15',
          nombreVisible: 'Nico 🎮 15 años',
          seguidores: 41,
          siguiendo: 389,
          creado: 'Hace 3 semanas',
          bio: 'Streamer 💜 regalo skins a mis amigos 🎁',
          publicaciones: 0,
          observaciones: 'Ninguna transmisión real. La foto de perfil aparece en otras 6 cuentas con nombres distintos (es de un banco de imágenes). Sigue casi solo a menores de colegios de la ciudad.'
        },
        pista: 'Perfil nuevo, sin transmisiones, con foto robada y que solo sigue a menores: es un perfil falso hecho para acercarse a niños y adolescentes.',
        costo: 15,
        clave: true
      },
      {
        id: 'chat-nico',
        tipo: 'chat',
        titulo: 'Conversación con Nico_Pro_15',
        contenido: {
          app: 'PixelPlay → SusurroChat',
          contacto: 'Nico_Pro_15',
          mensajes: [
            { de: 'contacto', texto: 'te mandé la skin dorada 😎 eres el mejor de la partida', hora: 'Lun 19:40' },
            { de: 'victima', texto: 'gracias!!! 😮', hora: 'Lun 19:41' },
            { de: 'contacto', texto: 'pásate a SusurroChat, aquí los moderadores leen todo', hora: 'Mié 20:02' },
            { de: 'contacto', texto: 'y porfa no le cuentes a tus papás, se ponen raros con los amigos de internet', hora: 'Mié 20:05' },
            { de: 'contacto', texto: 'para el concurso necesito unas fotos tuyas, nadie más las va a ver 🤫', hora: 'Sáb 21:30' },
            { de: 'victima', texto: 'no sé... no quiero', hora: 'Sáb 21:34' },
            { de: 'contacto', texto: 'si no me las mandas te quito todo y le digo a todos que eres un tramposo', hora: 'Sáb 21:36' }
          ]
        },
        pista: 'Es el patrón del grooming paso a paso: regalos para ganar confianza, mudarse a un chat privado sin moderación, pedir secreto, pedir fotos y, al recibir un no, amenazar.',
        costo: 15,
        clave: true
      },
      {
        id: 'extracto-regalos',
        tipo: 'extracto',
        titulo: 'Informe de pagos de la plataforma',
        contenido: {
          banco: 'PixelPlay Créditos · informe entregado a la Policía',
          cuenta: 'Cuenta Nico_Pro_15',
          movimientos: [
            { fecha: '22/09/2026', hora: '21:10', concepto: 'Compra de créditos', monto: -60000, destino: 'Tarjeta de un titular adulto de 38 años' },
            { fecha: '29/09/2026', hora: '19:38', concepto: 'Regalo: Skin Dorada', monto: -45000, destino: 'Juan José (JJ_Rodelo)' },
            { fecha: '03/10/2026', hora: '20:12', concepto: 'Regalo: Pase de temporada', monto: -38000, destino: 'Juan José (JJ_Rodelo)' },
            { fecha: '05/10/2026', hora: '18:44', concepto: 'Regalos a otras 4 cuentas', monto: -152000, destino: 'Cuentas de menores de 13 a 15 años' }
          ]
        },
        pista: 'El supuesto chico de 15 años paga con la tarjeta de un adulto de 38 y le regala a varios menores. Los regalos no son generosidad: son la inversión para ganar confianza.',
        costo: 15,
        clave: false
      },
      {
        id: 'url-susurro',
        tipo: 'url',
        titulo: 'Invitación a la app privada',
        contenido: {
          mostrada: 'susurrochat.app/invita/nico',
          real: 'http://susurro-chat-privado.xyz/inv?ref=nico',
          certificado: 'Ninguno',
          creado: 'Hace 2 meses',
          observaciones: 'App de mensajes que se borran solos, fuera de las tiendas oficiales y sin botón de reporte.'
        },
        pista: 'Buscaba sacarlo del juego, donde hay moderadores, a un canal donde los mensajes se borran solos: aislar a la víctima y borrar las huellas.',
        costo: 10,
        clave: false
      },
      {
        id: 'registro-moderacion',
        tipo: 'registro',
        titulo: 'Bitácora de moderación de PixelPlay',
        contenido: {
          sistema: 'PixelPlay · Moderación y seguridad',
          lineas: [
            { hora: '01/10 · 17:20', evento: 'Reporte de usuario', detalle: 'Nico_Pro_15 reportado por "insistir en hablar en privado"' },
            { hora: '06/10 · 16:05', evento: 'Reporte de usuario', detalle: 'Nico_Pro_15 reportado por "pedir fotos"' },
            { hora: '12/10 · 19:30', evento: 'Reporte de usuario', detalle: 'Tercer reporte de otro jugador menor de edad' },
            { hora: '13/10 · 10:00', evento: 'Cuenta suspendida', detalle: 'Datos preservados para la investigación policial' }
          ]
        },
        pista: 'Otros tres chicos ya lo habían reportado: usar el botón de reportar funciona y protege a más personas. La plataforma guardó los datos para la Policía.',
        costo: 10,
        clave: false
      }
    ],
    preguntas: [
      {
        id: 'p1',
        texto: '¿Quién es realmente "Nico_Pro_15"?',
        opciones: [
          { texto: 'Un adulto con un perfil falso que se hace pasar por adolescente.', correcta: true, retro: 'Correcto. La foto robada, la tarjeta de un adulto de 38 años y los reportes lo confirman.' },
          { texto: 'Un streamer de 15 años muy generoso.', correcta: false, retro: 'No tiene ni una transmisión y paga con la tarjeta de un adulto. Nada en su perfil es real.' },
          { texto: 'Un bot automático de la plataforma.', correcta: false, retro: 'Un bot no adapta las conversaciones, ni amenaza, ni compra regalos con una tarjeta personal.' }
        ]
      },
      {
        id: 'p2',
        texto: '¿Qué patrón muestra la conversación?',
        opciones: [
          { texto: 'Una amistad normal de videojuegos.', correcta: false, retro: 'Las amistades sanas no piden secretos, no aíslan y no amenazan cuando les dices que no.' },
          { texto: 'Ciberbullying entre compañeros.', correcta: false, retro: 'No es un compañero: es un adulto desconocido que busca ganarse la confianza de un menor.' },
          { texto: 'Grooming: regalos para ganar confianza, aislamiento en un chat privado, secreto, petición de fotos y amenazas.', correcta: true, retro: 'Exacto. Reconocer el patrón a tiempo es lo que protege.' }
        ]
      },
      {
        id: 'p3',
        texto: '¿Qué fue lo más acertado que hizo Juan José?',
        opciones: [
          { texto: 'Bloquear y borrar todo el chat de inmediato.', correcta: false, retro: 'Bloquear está bien, pero antes de borrar hay que documentar: capturas, nombre de usuario y enlaces.' },
          { texto: 'No enviar las fotos y contárselo a un adulto de confianza.', correcta: true, retro: 'Así es. Rompió el silencio, que es justo lo que el acosador quería evitar. Y él no tiene ninguna culpa: la responsabilidad es del adulto que lo engañó.' },
          { texto: 'Seguirle la corriente para descubrirlo por su cuenta.', correcta: false, retro: 'Es peligroso. Investigar le corresponde a la Policía; tu tarea es protegerte y pedir ayuda.' }
        ]
      }
    ],
    explicacion: '1) Un adulto creó un perfil falso de "gamer de 15 años" con una foto robada.\n2) Se acercó a menores en el juego y les regaló skins para ganarse su confianza.\n3) Movió la conversación a una app privada sin moderación y pidió mantenerla en secreto.\n4) Cuando ya había confianza, pidió fotos personales y, al recibir un no, amenazó.\n5) Juan José rompió el silencio: el dueño del cibercafé documentó todo, la plataforma suspendió la cuenta y el caso pasó al CAI Virtual.',
    recompensa: { presupuesto: 120, evidencia: 25, confianza: 8 },
    consejo: {
      titulo: 'ESCUDO TÁCTICO',
      puntos: [
        'Nunca aceptes solicitudes de desconocidos.',
        'Duda siempre de quien no conoces en persona, aunque te haga regalos.',
        'Cero complicidad: denuncia, bloquea y reporta a los acosadores.'
      ]
    },
    autoridad: AUT_CAI
  },

  {
    id: 'voz-clonada-abuela',
    titulo: 'La voz de Valentina',
    edificio: 'casa-3',
    era: 3,
    cuadrante: 'tecnico',
    urgencia: 'alta',
    plazo: 220,
    victima: { nombre: 'Gloria Ospino', edad: 67, rol: 'Abuela de Valentina, estudiante de 11.°', retrato: '👵🏽' },
    resumen: 'Una abuela recibió la llamada de su "nieta" pidiendo plata: era una voz hecha con IA.',
    declaracion: 'Me llamó mi nieta Valentina llorando. Era su voz, se lo juro. Me dijo que había chocado una moto, que estaba en la estación y que necesitaba plata para que no la dejaran detenida, y que no le contara a su mamá. Después me pasó a un "abogado" que me dio una cuenta. Alcancé a consignar 500.000 pesos y, cuando iba a mandar el resto, mi vecino me dijo que llamara a Valentina a su celular. Ella estaba en clase, tranquila.',
    evidencias: [
      {
        id: 'registro-llamadas',
        tipo: 'registro',
        titulo: 'Registro de llamadas',
        contenido: {
          sistema: 'Celular de Gloria · Historial de llamadas del 14/10/2026',
          lineas: [
            { hora: '10:02', evento: 'Llamada entrante', detalle: '+57 301 555 0177 (número desconocido) · 1 min 48 s · "Valentina"' },
            { hora: '10:05', evento: 'Llamada entrante', detalle: 'Mismo número · el "abogado" · 6 min 12 s' },
            { hora: '10:14', evento: 'Sin llamadas', detalle: 'Gloria va al corresponsal bancario' },
            { hora: '10:20', evento: 'Llamada saliente', detalle: 'Valentina (contacto guardado) · 2 min · estaba en clase' }
          ]
        },
        pista: 'La "nieta" llamó desde un número desconocido, no desde el contacto guardado de Valentina. Cuando Gloria llamó al número real, el engaño se cayó.',
        costo: 10,
        clave: false
      },
      {
        id: 'archivo-audio',
        tipo: 'archivo',
        titulo: 'Grabación de la llamada',
        contenido: {
          nombre: 'llamada_2026-10-14_10-02.m4a',
          tamano: '1,7 MB · 1:48 min',
          origen: 'Grabadora automática de llamadas del celular de Gloria',
          firma: 'Análisis de audio: voz sintética con 94 % de parecido a los videos públicos de Valentina · respiraciones repetidas en bucle · ningún ruido de fondo de una estación',
          permisos: []
        },
        pista: 'La voz fue clonada con IA a partir de los videos públicos de Valentina. Bastan unos segundos de audio para que una IA imite a cualquier persona.',
        costo: 20,
        clave: true
      },
      {
        id: 'perfil-valentina',
        tipo: 'perfil',
        titulo: 'Perfil público de Valentina',
        contenido: {
          red: 'VibraClip',
          usuario: '@vale.ospino',
          nombreVisible: 'Valentina Ospino',
          seguidores: 8900,
          siguiendo: 610,
          creado: '2022',
          bio: 'Puerto Nexo 🌊 | 11.° La Muralla | mi abue Gloria es mi todo 👵💖',
          publicaciones: 62,
          observaciones: '62 videos hablando a la cámara. En uno presenta a su abuela por su nombre. Perfil público: su voz, su colegio y su familia están a la vista de cualquiera.'
        },
        pista: 'De aquí sacaron la voz para clonarla y el dato clave para el engaño: quién es su abuela y cómo se llama. Un perfil privado les habría cerrado la puerta.',
        costo: 10,
        clave: true
      },
      {
        id: 'sms-abogado',
        tipo: 'sms',
        titulo: 'SMS del "abogado"',
        contenido: {
          remitente: '+57 301 555 0177',
          hora: '14/10/2026 · 10:09',
          texto: 'Sra Gloria consigne YA a la cuenta de ahorros 4410009921 a nombre de Gestiones Juridicas Rapidas. Su nieta sale apenas confirme. NO comente con nadie es un tema delicado.',
          enlaces: []
        },
        pista: 'Urgencia ("YA"), secreto ("NO comente con nadie") y una cuenta a nombre de un tercero. La presión para no hablar con nadie busca impedir que verifique.',
        costo: 10,
        clave: false
      },
      {
        id: 'extracto-gloria',
        tipo: 'extracto',
        titulo: 'Comprobante de consignación',
        contenido: {
          banco: 'Banco del Puerto',
          cuenta: 'Ahorros ****2290 · Gloria Ospino',
          movimientos: [
            { fecha: '14/10/2026', hora: '10:14', concepto: 'Consignación en corresponsal bancario', monto: -500000, destino: 'Cta. ****9921 · Gestiones Juridicas Rapidas' }
          ]
        },
        pista: 'Este comprobante es evidencia clave. Si se reporta rápido al banco, a veces se puede congelar el dinero antes de que lo saquen.',
        costo: 10,
        clave: false
      }
    ],
    preguntas: [
      {
        id: 'p1',
        texto: '¿Cómo lograron imitar la voz de Valentina?',
        opciones: [
          { texto: 'Contrataron a una actriz con una voz parecida.', correcta: false, retro: 'El análisis detecta voz sintética, con respiraciones repetidas en bucle: no era una persona.' },
          { texto: 'Valentina participó en el engaño.', correcta: false, retro: 'Valentina estaba en clase. Ella también es víctima: suplantaron su identidad.' },
          { texto: 'Con una IA entrenada con sus videos públicos de VibraClip.', correcta: true, retro: 'Exacto. Es phishing con IA: clonan voces de amigos y familiares para hacer los engaños más creíbles.' }
        ]
      },
      {
        id: 'p2',
        texto: '¿Qué gesto desarmó la estafa?',
        opciones: [
          { texto: 'Verificar por otro canal: llamar a Valentina a su número guardado.', correcta: true, retro: 'Correcto. Colgar y llamar tú al número que ya conoces es la defensa más simple y efectiva.' },
          { texto: 'Pedir hablar otra vez con el abogado.', correcta: false, retro: 'El "abogado" es parte de la estafa. Hablar con él solo aumenta la presión.' },
          { texto: 'Preguntarle a la voz cómo se llamaba su colegio.', correcta: false, retro: 'Ese dato está en su perfil público. Las preguntas cuya respuesta está en internet no sirven para verificar.' }
        ]
      },
      {
        id: 'p3',
        texto: '¿Qué deberían acordar en la familia para la próxima vez?',
        opciones: [
          { texto: 'No contestar nunca números desconocidos.', correcta: false, retro: 'No es práctico y tampoco basta: también pueden falsificar el número que aparece en pantalla.' },
          { texto: 'Una palabra clave familiar para emergencias, perfiles privados y siempre devolver la llamada al número guardado.', correcta: true, retro: 'Bien. Una palabra secreta que no esté en internet desarma cualquier voz clonada.' },
          { texto: 'Tener siempre plata en efectivo lista para emergencias.', correcta: false, retro: 'Eso solo facilita que el estafador se lleve más. La clave es verificar antes de pagar.' }
        ]
      }
    ],
    explicacion: '1) Los atacantes encontraron el perfil público de Valentina, con decenas de videos y el nombre de su abuela.\n2) Con esos audios entrenaron una IA que imitaba su voz.\n3) Llamaron a Gloria desde un número desconocido con la voz clonada, llorando y con una emergencia inventada.\n4) Un falso "abogado" presionó con urgencia y secreto para que consignara a la cuenta de un tercero.\n5) Gloria alcanzó a enviar 500.000 pesos, pero al verificar por otro canal descubrió el engaño y frenó el resto.',
    recompensa: { presupuesto: 115, evidencia: 25, confianza: 6 },
    consejo: {
      titulo: 'ESCUDO TÁCTICO',
      puntos: [
        'Phishing con IA: clonan marcas, instituciones e incluso la voz de tus amigos y familiares. Que suene igual no significa que sea.',
        'Verifica por otro canal: llama tú directamente a tu familiar y confirma cualquier solicitud inusual de dinero.',
        'Sentido de urgencia = ALERTA ROJA. Quieren que actúes con pánico: tómate tu tiempo para verificar.'
      ]
    },
    autoridad: AUT_CAI
  },

  {
    id: 'ciberestres-phubbing',
    titulo: 'Siempre conectado',
    edificio: 'casa-4',
    era: 3,
    cuadrante: 'conducta',
    urgencia: 'media',
    plazo: 300,
    victima: { nombre: 'Sebastián Castro', edad: 16, rol: 'Estudiante de 10.°', retrato: '🧑🏻' },
    resumen: 'Un estudiante duerme 4 horas, bajó en tres materias y "vive" en el celular.',
    declaracion: 'No sé qué me pasa. Duermo como cuatro horas porque me quedo viendo videos y contestando los grupos. Si no reviso el celular siento que me pierdo de algo. En el almuerzo con mi familia ni hablo, y el viernes, en el partido, me la pasé grabando y casi no jugué. Bajé en tres materias y ando de mal genio. Mi mamá dice que parezco "un fantasma con pantalla".',
    evidencias: [
      {
        id: 'registro-pantalla',
        tipo: 'registro',
        titulo: 'Tiempo de pantalla de la última semana',
        contenido: {
          sistema: 'Bienestar digital · Celular de Sebastián',
          lineas: [
            { hora: 'Promedio diario', evento: 'Tiempo de pantalla', detalle: '9 h 40 min (la semana anterior: 7 h 15 min)' },
            { hora: 'Promedio diario', evento: 'Desbloqueos', detalle: '187 veces al día · uno cada 5 minutos despierto' },
            { hora: 'Promedio diario', evento: 'Notificaciones', detalle: '1.320 al día · 70 % de grupos y de VibraClip' },
            { hora: 'Noches', evento: 'Último uso', detalle: '2:47 a. m. en promedio · se levanta a las 5:30 a. m.' },
            { hora: 'Semana', evento: 'App más usada', detalle: 'VibraClip · 4 h 15 min diarias' }
          ]
        },
        pista: 'Casi diez horas diarias, 187 desbloqueos y menos de tres horas de sueño. No hay un hacker: el riesgo es el uso desmedido, que ya afecta su salud y sus notas.',
        costo: 10,
        clave: true
      },
      {
        id: 'chat-parche',
        tipo: 'chat',
        titulo: 'Grupo de amigos de madrugada',
        contenido: {
          app: 'ChatVerde',
          contacto: 'Grupo "11-B Parche 🔥" · 312 mensajes sin leer',
          mensajes: [
            { de: 'contacto', texto: 'quién está despierto?? 👀', hora: '01:12' },
            { de: 'contacto', texto: 'el que no responda en 5 min es un aburrido 😂', hora: '01:40' },
            { de: 'victima', texto: 'aquí toy', hora: '01:41' },
            { de: 'contacto', texto: 'Seba siempre conectado jajaja leyenda', hora: '02:30' },
            { de: 'victima', texto: 'jaja no puedo dormir', hora: '02:31' }
          ]
        },
        pista: 'La presión del grupo ("el que no responda es un aburrido") y el miedo a perderse algo lo mantienen despierto. Responder de madrugada no es una obligación.',
        costo: 10,
        clave: false
      },
      {
        id: 'correo-orientacion',
        tipo: 'correo',
        titulo: 'Correo de orientación escolar',
        contenido: {
          de: 'orientacion@colegiolamuralla.edu.co',
          para: 'familia.castro@correonexo.co',
          asunto: 'Seguimiento académico y de bienestar de Sebastián',
          fecha: '10/10/2026 · 14:30',
          cuerpo: 'Estimada familia: los docentes reportan que Sebastián se duerme en clase, usa el celular a escondidas y bajó en Matemáticas, Química y Física. Queremos apoyarlo, no sancionarlo. Los invitamos a una charla con orientación para construir juntos un plan de uso saludable de la tecnología.',
          adjuntos: ['Reporte_periodo_3_Sebastian.pdf']
        },
        pista: 'El cansancio ya se nota en el colegio. Orientación ofrece apoyo, no castigo: es parte de la red que está para ayudarlo.',
        costo: 10,
        clave: false
      },
      {
        id: 'perfil-seba',
        tipo: 'perfil',
        titulo: 'Perfil de Sebastián',
        contenido: {
          red: 'VibraClip',
          usuario: '@seba.castro.10',
          nombreVisible: 'Seba 🎧',
          seguidores: 1730,
          siguiendo: 2400,
          creado: '2023',
          bio: 'si no está en video no pasó 📱',
          publicaciones: 498,
          observaciones: 'Publica de 6 a 8 videos al día y borra los que no llegan a 100 "me gusta". Revisa sus estadísticas más de 40 veces al día.'
        },
        pista: 'Depende de los "me gusta" para sentirse bien: borra lo que no tiene suficientes. Esa búsqueda constante de aprobación alimenta el ciberestrés.',
        costo: 15,
        clave: false
      },
      {
        id: 'sms-mama',
        tipo: 'sms',
        titulo: 'Mensaje de la mamá',
        contenido: {
          remitente: 'Mamá ❤️',
          hora: '12/10/2026 · 13:20',
          texto: 'Seba, ¿vienes a almorzar o sigues en el celular? Tu abuelo vino a visitarnos y te estamos esperando hace 20 minutos 😔',
          enlaces: []
        },
        pista: 'Eso es phubbing: ignorar a las personas que tienes al frente por estar pendiente del celular. Estaba en la casa, a pocos metros, y su familia tuvo que escribirle.',
        costo: 10,
        clave: true
      }
    ],
    preguntas: [
      {
        id: 'p1',
        texto: '¿En qué cuadrante del riesgo está este caso?',
        opciones: [
          { texto: 'Técnico: hay un malware que mantiene el celular encendido.', correcta: false, retro: 'No hay ningún programa malicioso. El problema es cómo se usa la tecnología.' },
          { texto: 'De conducta: ciberestrés y phubbing por uso desmedido.', correcta: true, retro: 'Correcto. Es el cuadrante de la acción propia: el riesgo nace de nuestros hábitos.' },
          { texto: 'De contacto: alguien lo está acosando.', correcta: false, retro: 'Sus amigos lo presionan un poco, pero nadie lo acosa ni lo engaña. Es un tema de hábitos.' }
        ]
      },
      {
        id: 'p2',
        texto: '¿Qué es el phubbing?',
        opciones: [
          { texto: 'Un tipo de phishing que llega por llamada.', correcta: false, retro: 'Suena parecido, pero no es un ataque. Viene de "phone" (teléfono) y "snubbing" (despreciar).' },
          { texto: 'Un virus que gasta la batería del celular.', correcta: false, retro: 'No es un programa: es un comportamiento.' },
          { texto: 'Ignorar a las personas que tienes al frente por estar pendiente del celular.', correcta: true, retro: 'Exacto. Como dejar esperando a la familia en el almuerzo.' }
        ]
      },
      {
        id: 'p3',
        texto: '¿Qué plan ayuda más a Sebastián?',
        opciones: [
          { texto: 'Silenciar notificaciones, dejar el celular fuera del cuarto en la noche, ponerse límites de tiempo y hablar con orientación.', correcta: true, retro: 'Bien. La meta no es dejar la tecnología, sino usarla con equilibrio y con apoyo.' },
          { texto: 'Borrar todas sus redes para siempre.', correcta: false, retro: 'Es una medida extrema que casi nunca dura. Funcionan más los hábitos pequeños y sostenidos.' },
          { texto: 'Nada: todos los jóvenes son así.', correcta: false, retro: 'Dormir 4 horas y bajar en tres materias no es "normal". Merece atención y apoyo.' }
        ]
      }
    ],
    explicacion: '1) Las notificaciones constantes y la presión de los grupos hicieron que Sebastián revisara el celular cada cinco minutos.\n2) La necesidad de "me gusta" lo llevó a publicar y revisar estadísticas todo el día.\n3) Empezó a usar el celular de madrugada y a dormir menos de tres horas.\n4) El cansancio afectó sus notas, su ánimo y su rendimiento deportivo.\n5) El phubbing lo fue alejando de su familia y de sus amigos en persona. No hubo atacante: el riesgo vino del uso desmedido.',
    recompensa: { presupuesto: 100, evidencia: 20, confianza: 6 },
    consejo: {
      titulo: 'ESCUDO TÁCTICO',
      puntos: [
        'El hacker necesita que reacciones rápido y sin pensar; las apps también. Tu mejor defensa es la pausa: silencia notificaciones y desconéctate en la noche.',
        'Rompe el silencio: habla con tus padres, profesores o adultos de confianza si sientes que el celular te controla.',
        'Cero culpabilidad: las apps están diseñadas para engancharte. Pedir ayuda no es debilidad.'
      ]
    },
    autoridad: AUT_APOYO
  },

  // ───────────────────────────── ERA 4 · DENUNCIA ─────────────────────────────
  {
    id: 'sextorsion-fotogram',
    titulo: 'La amenaza',
    edificio: 'casa-5',
    era: 4,
    cuadrante: 'contenido',
    urgencia: 'alta',
    plazo: 220,
    victima: { nombre: 'Isabela Mercado', edad: 16, rol: 'Estudiante de 11.°', retrato: '👧🏽' },
    resumen: 'Amenazan a una estudiante con publicar una foto íntima si no paga.',
    declaracion: 'Conocí a "Thiago" en FotoGram. Decía tener 17 años y ser de otra ciudad. Hablamos durante semanas, le tuve confianza y le envié una foto íntima. Desde ayer otra cuenta me escribe diciendo que si no le pago 800.000 pesos o le mando más fotos, se la envía a mi familia y a todo el colegio. Me siento horrible y me da mucha vergüenza. Solo le he contado a mi tía, que fue quien me trajo.',
    evidencias: [
      {
        id: 'chat-extorsion',
        tipo: 'chat',
        titulo: 'Mensajes de la cuenta extorsionadora',
        contenido: {
          app: 'FotoGram · mensajes directos',
          contacto: '@cobros.privados_77',
          mensajes: [
            { de: 'contacto', texto: 'Tengo tu foto. Tienes 24 horas.', hora: 'Lun 20:15' },
            { de: 'contacto', texto: 'Paga 800.000 o se la mando a tu mamá y a tu colegio', hora: 'Lun 20:16' },
            { de: 'victima', texto: 'por favor no, no tengo esa plata', hora: 'Lun 20:22' },
            { de: 'contacto', texto: 'entonces mándame más fotos y te doy más tiempo', hora: 'Lun 20:23' },
            { de: 'contacto', texto: 'si le cuentas a alguien la publico de una', hora: 'Lun 20:24' }
          ]
        },
        pista: 'La amenaza busca aislarla ("si le cuentas a alguien...") y escalar ("más fotos"). Pagar o enviar más no detiene la extorsión: la alimenta. Estos mensajes son la evidencia central.',
        costo: 15,
        clave: true
      },
      {
        id: 'perfil-thiago',
        tipo: 'perfil',
        titulo: 'Perfil de "Thiago"',
        contenido: {
          red: 'FotoGram',
          usuario: '@th1ago_17',
          nombreVisible: 'Thiago 🌴 17',
          seguidores: 1204,
          siguiendo: 2980,
          creado: 'Hace 2 meses',
          bio: '17 | fútbol y playa 🌴 | busco amigos',
          publicaciones: 9,
          observaciones: 'La búsqueda inversa muestra que las 9 fotos son de un modelo extranjero. Sigue a cientos de adolescentes de varias ciudades y escribe igual que @cobros.privados_77.'
        },
        pista: 'Perfil falso con fotos robadas, operado por una red de extorsión que repite el mismo guion con muchas víctimas. Isabela no fue "ingenua": la engañaron profesionales.',
        costo: 15,
        clave: true
      },
      {
        id: 'sms-cobro',
        tipo: 'sms',
        titulo: 'SMS de cobro',
        contenido: {
          remitente: '+57 320 555 0190',
          hora: '13/10/2026 · 21:47',
          texto: 'Isabela recuerda: 800 mil antes de mañana 9pm a la Billetera Rapida 3205550190. Si no, todos lo van a ver.',
          enlaces: []
        },
        pista: 'El número de celular y la cuenta de cobro son datos valiosos para que las autoridades rastreen a los extorsionadores. No se borra: se documenta.',
        costo: 10,
        clave: false
      },
      {
        id: 'url-perfil-cobros',
        tipo: 'url',
        titulo: 'Dirección exacta del perfil',
        contenido: {
          mostrada: '@cobros.privados_77',
          real: 'https://fotogram.com/cobros.privados_77',
          certificado: 'Válido: es la red social legítima',
          creado: 'Cuenta creada ayer',
          observaciones: 'Hay que guardar la URL exacta del perfil, no solo el nombre visible: el nombre se puede cambiar en segundos, pero la URL permite a las autoridades y a la plataforma identificar y bajar la cuenta.'
        },
        pista: 'Antes de bloquear, se copia la URL de cada perfil falso. Sin ella, las autoridades no tienen cómo pedir que bajen la cuenta.',
        costo: 10,
        clave: false
      },
      {
        id: 'registro-plataforma',
        tipo: 'registro',
        titulo: 'Respuesta de FotoGram al reporte',
        contenido: {
          sistema: 'FotoGram · Centro de seguridad (tras el reporte de la familia)',
          lineas: [
            { hora: '14/10 · 08:10', evento: 'Reporte recibido', detalle: 'Categoría: extorsión con contenido íntimo de una menor' },
            { hora: '14/10 · 08:40', evento: 'Cuentas vinculadas', detalle: '@th1ago_17 y @cobros.privados_77 usan el mismo dispositivo' },
            { hora: '14/10 · 08:42', evento: 'Bloqueo preventivo de la imagen', detalle: 'Huella digital de la foto registrada: no se podrá publicar en la plataforma' },
            { hora: '14/10 · 09:00', evento: 'Cuentas suspendidas', detalle: 'Datos preservados para el Centro Cibernético Policial' }
          ]
        },
        pista: 'Reportar funciona: las dos cuentas eran de la misma persona, la plataforma bloqueó la imagen para que no pueda subirse y guardó los datos para la Policía.',
        costo: 15,
        clave: false
      }
    ],
    preguntas: [
      {
        id: 'p1',
        texto: '¿Qué debe hacer Isabela frente a la amenaza?',
        opciones: [
          { texto: 'Pagar para que borren la foto.', correcta: false, retro: 'Pagar no garantiza nada: casi siempre piden más. El extorsionador sabe que funcionó y vuelve.' },
          { texto: 'Enviar una foto más para ganar tiempo.', correcta: false, retro: 'Eso le da más poder al extorsionador. Nunca se envía más material.' },
          { texto: 'No pagar, no enviar más y cortar el contacto, apoyándose en un adulto de confianza.', correcta: true, retro: 'Exacto: NO PAGUES, NO ENVÍES MÁS. Corta el contacto y pide ayuda. No estás sola.' }
        ]
      },
      {
        id: 'p2',
        texto: 'Antes de bloquear las cuentas, ¿qué es lo primero?',
        opciones: [
          { texto: 'Documentar: capturas de los mensajes, URL de los perfiles, número y cuenta de cobro.', correcta: true, retro: 'Correcto. Antes de borrar, documenta: sin esa evidencia las autoridades no pueden investigar ni bajar los perfiles.' },
          { texto: 'Borrar el chat para que nadie lo vea.', correcta: false, retro: 'Es el primer instinto, pero borra la evidencia. Primero se documenta.' },
          { texto: 'Restablecer el celular de fábrica.', correcta: false, retro: 'Eso no detiene al extorsionador y sí destruye las pruebas.' }
        ]
      },
      {
        id: 'p3',
        texto: '¿Quién tiene la culpa de lo que pasó?',
        opciones: [
          { texto: 'Isabela, por haber confiado.', correcta: false, retro: 'No. Confiar no es un delito; extorsionar sí. Cero culpabilidad.' },
          { texto: 'El extorsionador: Isabela es víctima de un delito y no tiene la culpa.', correcta: true, retro: 'Así es. Los atacantes son manipuladores profesionales. La vergüenza y el silencio son sus aliados; romperlos es la salida.' },
          { texto: 'Su familia, por no revisarle el celular.', correcta: false, retro: 'La responsabilidad es de quien comete el delito. La familia es parte de la solución.' }
        ]
      }
    ],
    explicacion: '1) Una red de extorsión creó un perfil falso de un joven de 17 años con fotos robadas.\n2) Durante semanas se ganó la confianza de Isabela hasta conseguir una foto íntima.\n3) Con otra cuenta la amenazó con publicarla si no pagaba o enviaba más material, y le pidió silencio.\n4) Isabela rompió el silencio con su tía: documentaron mensajes, URL, número y cuenta de cobro.\n5) La familia reportó en FotoGram, que bloqueó la imagen y suspendió las cuentas, y denunció ante el CAI Virtual.',
    recompensa: { presupuesto: 130, evidencia: 30, confianza: 8 },
    consejo: {
      titulo: 'ESCUDO TÁCTICO',
      puntos: [
        'Si eres víctima: NO PAGUES, NO ENVÍES MÁS. Corta el contacto y pide ayuda.',
        'Antes de borrar, documenta: capturas de los mensajes, URL de los perfiles falsos y comprobantes.',
        'Cero culpabilidad: no te culpes por haber confiado en alguien. Los atacantes son manipuladores profesionales.'
      ]
    },
    autoridad: AUT_CAI
  },

  {
    id: 'doxing-memes',
    titulo: 'La cuenta de chismes',
    edificio: 'colegio',
    era: 4,
    cuadrante: 'contacto',
    urgencia: 'alta',
    plazo: 240,
    victima: { nombre: 'Luisa Fernanda Barrios', edad: 15, rol: 'Estudiante de 10.° del Colegio La Muralla', retrato: '👧🏻' },
    resumen: 'Una cuenta de memes publicó la dirección y la rutina de una estudiante.',
    declaracion: 'Hace una semana apareció en FotoGram una cuenta de memes, "@lamuralla.chismes", que publica fotos mías editadas para burlarse. Al principio intenté reírme, pero ahora publicaron mi dirección, el nombre de mi mamá y a qué hora salgo del colegio. Unos desconocidos me escribieron que "ya saben dónde vivo". No quiero volver al colegio.',
    evidencias: [
      {
        id: 'perfil-chismes',
        tipo: 'perfil',
        titulo: 'La cuenta de memes',
        contenido: {
          red: 'FotoGram',
          usuario: '@lamuralla.chismes',
          nombreVisible: 'La Muralla Chismes 🐍',
          seguidores: 1530,
          siguiendo: 12,
          creado: 'Hace 9 días',
          bio: 'Lo que nadie se atreve a decir 🤐 manda tu chisme por DM',
          publicaciones: 23,
          observaciones: '17 de las 23 publicaciones son sobre Luisa: memes con su cara, apodos y comentarios hirientes. La del lunes muestra la fachada de su casa con la dirección, el nombre de su mamá y "sale a las 12:30 por la puerta de atrás".'
        },
        pista: 'Son dos ataques: ciberbullying (burlas constantes para destruir su autoestima) y doxing (publicar su dirección, su familia y su rutina para acosarla en la vida real).',
        costo: 15,
        clave: true
      },
      {
        id: 'chat-curso',
        tipo: 'chat',
        titulo: 'Grupo de un curso',
        contenido: {
          app: 'ChatVerde',
          contacto: 'Grupo "10-A sin profes 🤫" (captura enviada por un compañero)',
          mensajes: [
            { de: 'contacto', texto: 'Brayan: jajaja vieron lo último de la cuenta??', hora: '19:02' },
            { de: 'contacto', texto: 'Camila: yo le pasé la foto de la casa, vive al lado de mi tía 😂', hora: '19:04' },
            { de: 'contacto', texto: 'Tomás: oigan ya se están pasando, lo de la dirección es peligroso', hora: '19:10' },
            { de: 'contacto', texto: 'Brayan: ay no sea sapo, es un chiste', hora: '19:11' },
            { de: 'contacto', texto: 'Tomás: no es chiste. Yo le voy a contar a la coordinadora', hora: '19:12' }
          ]
        },
        pista: 'Los datos los aportaron compañeros. Reírse, compartir o "pasar la foto" también es participar. Tomás muestra la otra opción: cero complicidad y avisar a un adulto.',
        costo: 10,
        clave: true
      },
      {
        id: 'registro-informe',
        tipo: 'registro',
        titulo: 'Informe de la plataforma',
        contenido: {
          sistema: 'FotoGram · Informe solicitado por el colegio y la familia',
          lineas: [
            { hora: '05/10 · 10:42', evento: 'Cuenta creada', detalle: 'Desde la red Wi-Fi del Colegio La Muralla, en hora de descanso' },
            { hora: '05/10 · 10:43', evento: 'Correo de registro', detalle: 'chismes.lm2026@mailrapido.top' },
            { hora: '05/10 - 13/10', evento: 'Inicios de sesión', detalle: '3 dispositivos distintos: la manejan varias personas' },
            { hora: '13/10 · 22:00', evento: 'Reportes', detalle: '41 reportes de usuarios por acoso' }
          ]
        },
        pista: 'La cuenta se creó desde el colegio, en el descanso, y la usan tres personas: es un grupo de estudiantes. Con este informe el colegio puede actuar.',
        costo: 15,
        clave: false
      },
      {
        id: 'sms-amenaza',
        tipo: 'sms',
        titulo: 'Mensaje de un desconocido',
        contenido: {
          remitente: '+57 318 555 0104',
          hora: '13/10/2026 · 19:03',
          texto: 'ya sabemos donde vives, la casa azul de la esquina 👀 cuidadito al salir',
          enlaces: []
        },
        pista: 'El doxing ya pasó a amenazas de desconocidos. Esto pone en riesgo su seguridad física: hay que documentarlo y denunciarlo de inmediato.',
        costo: 10,
        clave: false
      },
      {
        id: 'archivo-foto',
        tipo: 'archivo',
        titulo: 'Foto de la fachada',
        contenido: {
          nombre: 'IMG_20260912_casa.jpg',
          tamano: '3,2 MB',
          origen: 'Copiada de una publicación del perfil PÚBLICO de Luisa ("mi casita nueva 🏡", septiembre)',
          firma: 'Metadatos de la foto: ubicación GPS exacta incluida · fecha y modelo del celular',
          permisos: []
        },
        pista: 'La foto la subió la propia Luisa a su perfil público y guardaba la ubicación exacta. Así armaron su "huella digital". No es su culpa, pero un perfil privado y sin ubicación lo habría hecho mucho más difícil.',
        costo: 15,
        clave: false
      }
    ],
    preguntas: [
      {
        id: 'p1',
        texto: '¿Qué ataques sufre Luisa?',
        opciones: [
          { texto: 'Phishing y malware.', correcta: false, retro: 'No hay enlaces falsos ni programas maliciosos: la atacan con burlas y con sus datos personales.' },
          { texto: 'Ciberbullying (memes y burlas) y doxing (publicar su dirección y su rutina).', correcta: true, retro: 'Correcto. El doxing convierte el acoso en línea en un riesgo en la vida real.' },
          { texto: 'Sextorsión y deepfake.', correcta: false, retro: 'No hay contenido íntimo ni videos falsos con IA. Son memes y datos personales.' }
        ]
      },
      {
        id: 'p2',
        texto: '¿Cómo consiguieron su dirección?',
        opciones: [
          { texto: 'De su huella digital: una foto pública con ubicación y datos que aportaron compañeros.', correcta: true, retro: 'Exacto. Lo que publicamos deja rastro, y quienes comparten datos ajenos se vuelven parte del ataque.' },
          { texto: 'Hackearon la base de datos del colegio.', correcta: false, retro: 'No hay señales de intrusión: los datos venían de su perfil público y de compañeros.' },
          { texto: 'Con un virus en su celular.', correcta: false, retro: 'No hizo falta ningún malware. Fue información pública más chismes.' }
        ]
      },
      {
        id: 'p3',
        texto: '¿Cuál es la mejor respuesta?',
        opciones: [
          { texto: 'Crear otra cuenta para responder con memes.', correcta: false, retro: 'Responder con más acoso empeora todo y puede traerte problemas.' },
          { texto: 'Ignorarlo y esperar a que se aburran.', correcta: false, retro: 'Con amenazas de por medio, el silencio es peligroso. Hay que actuar.' },
          { texto: 'Documentar, reportar la cuenta, avisar al colegio y a la familia, y denunciar el uso indebido de sus datos y las amenazas.', correcta: true, retro: 'Bien. La SIC atiende el uso indebido de datos personales y el CAI Virtual atiende el ciberacoso y las amenazas.' }
        ]
      }
    ],
    explicacion: '1) Un grupo de estudiantes creó la cuenta desde el Wi-Fi del colegio para burlarse de Luisa (ciberbullying).\n2) Rastrearon su huella digital: una foto pública de su casa con la ubicación GPS guardada.\n3) Una compañera aportó más datos y la cuenta publicó su dirección, el nombre de su mamá y su horario (doxing).\n4) Desconocidos vieron la publicación y empezaron a amenazarla.\n5) Un compañero rompió la complicidad y avisó. Con la evidencia documentada, el colegio actúa, la plataforma baja la cuenta y la familia denuncia ante la SIC y el CAI Virtual.',
    recompensa: { presupuesto: 130, evidencia: 30, confianza: 8 },
    consejo: {
      titulo: 'ESCUDO TÁCTICO',
      puntos: [
        'Configura tus redes sociales como PRIVADAS y oculta tu colegio, tu teléfono y tu ubicación.',
        'Cero complicidad: denuncia, bloquea y reporta a los acosadores. Compartir o reírse también es participar.',
        'Rompe el silencio: habla de inmediato con tus padres, profesores o adultos de confianza.'
      ]
    },
    autoridad: AUT_SIC
  }
];
