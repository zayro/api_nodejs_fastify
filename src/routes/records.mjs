import fastifyHashids from "fastify-hashids";

export default async function routes(fastify, options) {
  await fastify.register(fastifyHashids, {
    salt: process.env.HASHIDS_SALT || "supersecreto",
    minLength: 8,
  });

  fastify.get("/", async (request, reply) => {
    return { data: "hello world world" };
  });

  fastify.get(
    "/all",
    {
      schema: {
        description: "Obtener todos los registros de usuarios",
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                identificacion: { type: "string" },
                informacion: { type: "object" },
                estado: { type: "string" },
                created_at: { type: "string", format: "date-time" },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { rows } = await fastify.pg.query(
        "SELECT * FROM hv.registros_usuarios",
      );
      return rows;
    },
  );

  fastify.get(
    "/find/:identificacion",
    async (request, reply) => {
      // Decodifica solo el identificador recibido
      const encode = fastify.hashids.encode('123456');
      const decoded = fastify.hashids.decode(request.params.identificacion);
      console.log("Identificador recibido:", request.params.identificacion);
      console.log("Identificador codificado:", encode);
      console.log("Identificador decodificado:", decoded);
      if (!decoded || !decoded.length) {
        console.error("Error al decodificar el identificador:", request.params.identificacion);
        return reply.code(400).send({ error: "Identificador inválido" });
    }
      const identificacion = decoded[0].toString();
      const { rows } = await fastify.pg.query(
        "SELECT * FROM hv.registros_usuarios WHERE identificacion = $1",
        [identificacion],
      );
      return rows;
    },
  );

  fastify.get(
    "/buscar/:identificacion",
    async (request, reply) => {
      const { rows } = await fastify.pg.query(
        "SELECT * FROM hv.registros_usuarios WHERE identificacion = $1",
        [request.params.identificacion],
      );
      return rows;
    },
  );

  fastify.post(
    "/save",
    {
      schema: {
        body: {
          type: "object",
          required: ["identificacion", "informacion", "estado"],
          properties: {
            identificacion: { type: "string" },
            informacion: { type: "object" },
            estado: {
              type: "string",
              enum: ["activo", "inactivo", "retirado"],
            },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              identificacion: { type: "string" },
              informacion: { type: "object" },
              estado: { type: "string" },
              created_at: { type: "string", format: "date-time" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { identificacion, informacion, estado } = request.body;
      const { rows } = await fastify.pg.query(
        "INSERT INTO registros_usuarios(identificacion, informacion, estado) VALUES($1, $2, $3) RETURNING *",
        [identificacion, JSON.stringify(informacion), estado],
      );
      reply.code(201);
      // Enviar correo si hay email en informacion
      if (informacion.email) {
        try {
          await fastify.mailer.sendMail({
            to: informacion.email,
            subject: 'Registro exitoso',
            text: `Hola, tu registro con identificación ${identificacion} fue guardado exitosamente.`
          });
        } catch (err) {
          fastify.log.error('Error enviando correo:', err);
        }
      }
      return rows[0];
    },
  );
}
