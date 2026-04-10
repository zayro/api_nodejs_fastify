import fp from 'fastify-plugin';

async function jwtPlugin(fastify, options) {
  await fastify.register((await import('@fastify/jwt')).default, {
    secret: process.env.JWT_SECRET || 'supersecret'
  });

  fastify.decorate('authenticate', async function(request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'No autorizado' });
    }
  });
}

export default fp(jwtPlugin);
