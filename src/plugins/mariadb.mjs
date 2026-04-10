import fp from 'fastify-plugin';

async function mariadbConnector(fastify, options) {
  await fastify.register((await import('@fastify/mysql')).default, {
    promise: true,
    connectionString: process.env.MARIADB_URL || 'mysql://root:password@localhost:3306/fastify_auth'
  });
}

export default fp(mariadbConnector);
