export default async function routes(fastify, options) {


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
          required: ["identificacion", "informacion"],
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
          200: {
            type: "object",
            properties: {
              identificacion: { type: "string" },
              informacion: { type: "object" },
              estado: { type: "string" },
              created_at: { type: "string", format: "date-time" },
            },
          },
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
      const { identificacion, informacion } = request.body;
      
      // Intenta actualizar primero para evitar errores de clave única o insertar duplicados
      const updateResult = await fastify.pg.query(
        "UPDATE hv.registros_usuarios SET informacion = $1 WHERE identificacion = $2 RETURNING *",
        [JSON.stringify(informacion), identificacion]
      );

      if (updateResult.rowCount > 0) {
        reply.code(200);
        return updateResult.rows[0];
      } else {
        const insertResult = await fastify.pg.query(
          "INSERT INTO hv.registros_usuarios(identificacion, informacion) VALUES($1, $2) RETURNING *",
          [identificacion, JSON.stringify(informacion)]
        );
        reply.code(201);
        
        return insertResult.rows[0];
      }
    },
  );


}
