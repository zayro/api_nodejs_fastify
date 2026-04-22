export default async function authRoutes(fastify, options) {

  fastify.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['password'],
        properties: {
          username: { type: 'string' },
          email: { type: 'string' },
          identificacion: { type: 'string' },
          password: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: { 
            token: { type: 'string' },
            email: { type: 'string' },
            username: { type: 'string' },
            identificacion: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: { 
            statusCode: { type: 'number' },
            error: { type: 'string' },
            message: { type: 'string' }
          }
        },
        401: {
          type: 'object',
          properties: { 
            statusCode: { type: 'number' },
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { username, email, identificacion, password } = request.body;
    const loginProp = email || identificacion || username;

    if (!loginProp) {
      return reply.code(400).send({ message: 'Se requiere correo electrónico, usuario o identificación válida' });
    }

    // Buscar usuario en PostgreSQL por correo, usuario o identificacion
    const { rows } = await fastify.pg.query(
      'SELECT * FROM hv.users WHERE email = $1 OR username = $2 OR identificacion = $3', 
      [loginProp, loginProp, loginProp]
    );
    
    if (rows.length === 0) {
      return reply.code(401).send({ message: 'Credenciales inválidas' });
    }
    
    const user = rows[0];
    // Comparacion segura usando bcrypt
    const isMatch = await fastify.bcrypt.compare(password, user.password);
    if (!isMatch) {
      return reply.code(401).send({ message: 'Credenciales inválidas' });
    }
    
    const token = fastify.jwt.sign({ 
      email: user.email, 
      username: user.username,
      identificacion: user.identificacion 
    });
    
    return reply.code(200).send({ token, email: user.email, username: user.username, identificacion: user.identificacion });
  });

  fastify.post('/register', {
    schema: {
      body: {
        type: 'object',
        // Todos los campos son requeridos al registrarse, siguiendo el script SQL
        required: ['email', 'username', 'identificacion', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          username: { type: 'string' },
          identificacion: { type: 'string' },
          password: { type: 'string', minLength: 6 }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: { 
            message: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                email: { type: 'string' },
                username: { type: 'string' },
                identificacion: { type: 'string' }
              }
            }
          }
        },
        400: {
          type: 'object',
          properties: { 
            statusCode: { type: 'number' },
            error: { type: 'string' },
            message: { type: 'string' } 
          }
        },
        500: {
          type: 'object',
          properties: { 
            statusCode: { type: 'number' },
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { email, username, identificacion, password } = request.body;

    try {
      // Verificar si ya existe algun valor unico (email, username, identificacion)
      // Ajuste: pg devuelve los registros en la propiedad "rows", no como un array de resultados [rows]
      const { rows: existingUsers } = await fastify.pg.query(
        'SELECT email, username, identificacion FROM hv.users WHERE email = $1 OR username = $2 OR identificacion = $3',
        [email, username, identificacion]
      );

      if (existingUsers.length > 0) {
        return reply.code(400).send({ message: 'El correo electrónico, nombre de usuario o identificación ya se encuentran registrados.' });
      }

      // Encriptar la contraseña usando bcrypt
      const hashedPassword = await fastify.bcrypt.hash(password);
      
      await fastify.pg.query(
        'INSERT INTO hv.users (email, username, identificacion, password) VALUES ($1, $2, $3, $4)',
        [email, username, identificacion, hashedPassword]
      );

        
        // Enviar correo si hay email en informacion
        
        if (email) {
          try {
            const host = process.env.APP_HOST || 'http://localhost:3000';
            const identificadorCodificado = fastify.hashids.encode(Number(identificacion));
            const link = `${host}/update-status/${identificadorCodificado}`;
            await fastify.mailer.sendMail({
              to: informacion.email,
              subject: 'Registro exitoso',
              text: `Hola, tu registro con identificación ${identificacion} fue guardado exitosamente.\n\nPara activar tu registro, haz clic en el siguiente enlace:\n${link}\n\nEnvía un PATCH a ese endpoint con el body: { "estado": "activo" }.`
            });
          } catch (err) {
            fastify.log.error('Error enviando correo:', err);
          }
        }
            

      return reply.code(201).send({
        message: 'Usuario creado exitosamente',
        user: { email, username, identificacion }
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ message: 'Error interno del servidor al crear el usuario' });
    }
  });

  fastify.get(
    '/validate-status/:identificacion',
    async (request, reply) => {
      console.log('identificacion recibida',request.params.identificacion);
      // Decodifica el identificador
      const decoded = fastify.hashids.decode(request.params.identificacion);

       console.log('identificacion decodificada',decoded);
      if (!decoded || !decoded.length) {
        return reply.code(400).send({ error: 'Identificador inválido' });
      }
      const identificacion = decoded[0].toString();     

      const { rowCount } = await fastify.pg.query(
        'UPDATE hv.users SET estado = $1 WHERE identificacion = $2',
        [1, identificacion]
      );

      console.log('rowCount',rowCount);

      if (rowCount === 0) {
        return reply.code(404).send({ error: 'Registro no encontrado' });
      }
      return { status: 'success', message: 'Registro activado exitosamente'};
    }
  );  
}
