import fp from 'fastify-plugin';

async function mariadbConnector(fastify, options) {
  await fastify.register((await import('@fastify/mysql')).default, {
    promise: true,
    connectionString: process.env.MARIADB_URL || 'mysql://marlon3013199303:zayro3013199303@localhost:3306/astgu'
  });
}

export default fp(mariadbConnector);
