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
    "/:identificacion",
    async (request, reply) => {
      // Decodifica solo el identificador recibido
      const encode = fastify.hashids.encode(request.params.identificacion);
      console.log("Identificador recibido:", request.params.identificacion);
      console.log("Identificador codificado:", encode);
      if (!encode || !encode.length) {
        console.error("Error al decodificar el identificador:", request.params.identificacion);
        return reply.code(400).send({ error: "Identificador inválido" });
    }
      const identificacion = encode.toString();

      return {code: 200, identificacion};
    },
  );




}
