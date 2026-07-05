export default async function authRoutes(fastify, options) {
  fastify.post(
    "/login",
    {
      config: { disableHashids: true },
      schema: {
        body: {
          type: "object",
          required: ["password"],
          properties: {
            username: { type: "string" },
            email: { type: "string" },
            identificacion: { type: "string" },
            password: { type: "string" },
            success: { type: "boolean" },
            estado: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              token: { type: "string" },
              email: { type: "string" },
              username: { type: "string" },
              identificacion: { type: "string" },
              success: { type: "boolean" },
              estado: { type: "boolean" },
            },
          },
          400: {
            type: "object",
            properties: {
              statusCode: { type: "number" },
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          401: {
            type: "object",
            properties: {
              statusCode: { type: "number" },
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { username, email, identificacion, password } = request.body;
      const loginProp = email || identificacion || username;

      if (!loginProp) {
        return reply
          .code(400)
          .send({
            message:
              "Se requiere correo electrónico, usuario o identificación válida",
          });
      }

      // Buscar usuario en PostgreSQL por correo, usuario o identificacion
      const { rows } = await fastify.pg.query(
        "SELECT * FROM hv.users WHERE email = $1 OR username = $2 OR identificacion = $3",
        [loginProp, loginProp, loginProp],
      );

      if (rows.length === 0) {
        return reply.code(401).send({ message: "Credenciales inválidas" });
      }

      const user = rows[0];
      console.log("Usuario encontrado:", user);
      // Comparacion segura usando bcrypt
      const isMatch = await fastify.bcrypt.compare(password, user.password);
      if (!isMatch) {
        return reply.code(401).send({ message: "Credenciales inválidas" });
      }

      const token = fastify.jwt.sign({
        email: user.email,
        username: user.username,
        identificacion: user.identificacion,
        estado: user.estado,
      }, { expiresIn: '8h' });
      console.log("Token generado:", token);
      return reply.code(200).send({
        success: true,
        token,
        email: user.email,
        username: user.username,
        identificacion: user.identificacion,
        estado: user.estado,
      });
    },
  );

  fastify.post(
    "/register",
    {
      config: { disableHashids: true },
      schema: {
        body: {
          type: "object",
          // Todos los campos son requeridos al registrarse, siguiendo el script SQL
          required: ["email", "username", "identificacion", "password"],
          properties: {
            email: { type: "string", format: "email" },
            username: { type: "string" },
            identificacion: { type: "string" },
            password: { type: "string", minLength: 6 },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              message: { type: "string" },
              user: {
                type: "object",
                properties: {
                  email: { type: "string" },
                  username: { type: "string" },
                  identificacion: { type: "string" },
                },
              },
            },
          },
          400: {
            type: "object",
            properties: {
              statusCode: { type: "number" },
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          500: {
            type: "object",
            properties: {
              statusCode: { type: "number" },
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { email, username, identificacion, password } = request.body;

      try {
        // Verificar si ya existe algun valor unico (email, username, identificacion)
        // Ajuste: pg devuelve los registros en la propiedad "rows", no como un array de resultados [rows]
        const { rows: existingUsers } = await fastify.pg.query(
          "SELECT email, username, identificacion FROM hv.users WHERE email = $1 OR username = $2 OR identificacion = $3",
          [email, username, identificacion],
        );

        if (existingUsers.length > 0) {
          console.log("existingUsers", existingUsers);
          return reply
            .code(400)
            .send({
              message:
                "El correo electrónico, nombre de usuario o identificación ya se encuentran registrados.",
            });
        }

        // Encriptar la contraseña usando bcrypt
        const hashedPassword = await fastify.bcrypt.hash(password);

        await fastify.pg.query(
          "INSERT INTO hv.users (email, username, identificacion, password) VALUES ($1, $2, $3, $4)",
          [email, username, identificacion, hashedPassword],
        );

        // Enviar correo si hay email en informacion

        if (email) {
          try {
            const host = `${request.protocol}://${request.hostname}`;
            const identificadorCodificado = fastify.hashids.encode(Number(identificacion));
            const link = `${host}/apiHv/auth/validate-status/${identificadorCodificado}`;
            await fastify.mailer.sendMail({
              to: email,
              subject: "Registro exitoso",
              text: `Hola, tu registro con identificación ${identificacion} fue guardado exitosamente.\n\nPara activar tu registro, haz clic en el siguiente enlace:\n${link}`,
            });
          } catch (err) {
            // Mostrar un log limpio con lo más importante
            fastify.log.error(
              `Falló el envío de correo. Código: ${err.code}, Mensaje: ${err.message}`,
            );

            // Si el error viene de un rechazo del servidor SMTP, suele traer estos datos:
            if (err.response) {
              fastify.log.error(`Respuesta del servidor SMTP: ${err.response}`);
              fastify.log.error(`Comando que falló: ${err.command}`);
            }
            // Mostrar todo el objeto crudo en consola para depuración máxima
            console.error("--- DETALLE COMPLETO DEL ERROR DE MAIL ---");
            console.error(err);
            console.error("------------------------------------------");
          }
        }

        return reply.code(201).send({
          message: "Usuario creado exitosamente",
          user: { email, username, identificacion },
        });
      } catch (error) {
        request.log.error(error);
        console.log(
          "Error interno del servidor al crear el usuario",
          error.code,
        );
        console.log(
          "Error interno del servidor al crear el usuario",
          error.message,
        );
        console.log(
          "Error interno del servidor al crear el usuario",
          error.detail,
        );
        console.log(
          "Error interno del servidor al crear el usuario",
          error.hint,
        );
        return reply
          .code(500)
          .send({ message: "Error interno del servidor al crear el usuario" });
      }
    },
  );

  fastify.get(
    "/validate-status/:identificacion",
    {
      config: { disableHashids: true },
    },

    async (request, reply) => {
      console.log("identificacion recibida", request.params.identificacion);
      // Decodifica el identificador

      const decoded = fastify.hashids.decode(request.params.identificacion);

      console.log("identificacion decodificada", decoded);
      if (!decoded || !decoded.length) {
        return reply.code(400).send({ error: "Identificador inválido" });
      }
      const identificacion = decoded[0].toString();

      //const identificacion = request.params.identificacion;

      const { rowCount } = await fastify.pg.query(
        "UPDATE hv.users SET estado = $1 WHERE identificacion = $2",
        [1, identificacion],
      );

      console.log("rowCount", rowCount);

      if (rowCount === 0) {
        return reply.code(404).send({ error: "Registro no encontrado" });
      }
      return { status: "success", message: "Registro activado exitosamente" };
    },
  );

  fastify.post(
    "/update-password/:identificacion",
    {
      config: { disableHashids: true },
    },

    async (request, reply) => {
      console.log("identificacion recibida", request.params.identificacion);
      // Decodifica el identificador

      const identificacion = request.params.identificacion;

      const decoded = fastify.hashids.decode(request.params.identificacion);
      
       const { password, NewPassword } = request.body;

      // Encriptar la contraseña usando bcrypt
      const hashedPassword = await fastify.bcrypt.hash(password);
      const { rowCount } = await fastify.pg.query(
        "UPDATE hv.users SET password = $1 WHERE identificacion = $2",
        [hashedPassword, identificacion],
      );

      console.log("rowCount", rowCount);

      if (rowCount === 0) {
        return reply.code(404).send({ error: "Registro no encontrado" });
      }

      return { status: "success", message: "Registro activado exitosamente" };
    },
  );

  fastify.get(
    "/recovery-password/:email",
    {
      config: {
        disableHashids: true,
        rateLimit: {
          max: 3,
          timeWindow: '1 hour',
          keyGenerator: (request) => request.ip,
        },
      },
    },
    async (request, reply) => {
      console.log("email recibido", request.params.email);
      const { rows } = await fastify.pg.query(
        "SELECT email FROM hv.users WHERE email = $1",
        [request.params.email],
      );
    if (rows.length === 0) {
      return reply.code(404).send({ error: "Registro no encontrado" });
    }
    const email = rows[0].email;
    if (!email) {
      return reply
        .code(400)
        .send({ error: "No se encontró un correo asociado a esta identificación" });
    }
    try {


      const host = `${request.protocol}://${request.hostname}`;
      const randomPassword = Math.random().toString(36).slice(-8); // Genera una contraseña temporal de 8 caracteres
      const identificadorCodificado = fastify.hashids.encode(randomPassword);

      // Encriptar la contraseña usando bcrypt
      const hashedPassword = await fastify.bcrypt.hash(randomPassword);
      const { rowCount } = await fastify.pg.query(
        "UPDATE hv.users SET password = $1 WHERE email = $2",
        [hashedPassword, email],
      );

      console.log("rowCount", rowCount);

      if (rowCount === 0) {
        return reply.code(404).send({ error: "Registro no encontrado" });
      }


      const link = `${host}/apiHv/auth/update-password/${identificadorCodificado}`;
      console.log("Link de recuperación generado:", link);
      console.log("Contraseña temporal generada:", randomPassword);
      await fastify.mailer.sendMail({
        to: email,
        subject: "Recuperación de contraseña HV - Gente Util",
        text: `Hola, para recuperar tu contraseña con identificación ${request.params.identificacion}, su nueva contraseña es: ${randomPassword} :\n`,
      });
      return { status: "success", message: "Correo de recuperación enviado exitosamente" };
    } catch (err) {
      // Mostrar un log limpio con lo más importante
      fastify.log.error(
        `Falló el envío de correo. Código: ${err.code}, Mensaje: ${err.message}`,
      );  
      // Si el error viene de un rechazo del servidor SMTP, suele traer estos datos:
      if (err.response) {
        fastify.log.error(`Respuesta del servidor SMTP: ${err.response}`);
        fastify.log.error(`Comando que falló: ${err.command}`);
      }
      // Mostrar todo el objeto crudo en consola para depuración máxima
      console.error("--- DETALLE COMPLETO DEL ERROR DE MAIL ---");
      console.error(err);
      console.error("------------------------------------------");
      return reply
        .code(500)
        .send({ error: "Error interno del servidor al enviar el correo de recuperación" });
    } 
  });

}
