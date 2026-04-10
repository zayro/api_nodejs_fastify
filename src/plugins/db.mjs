import fp from 'fastify-plugin';

async function dbConnector(fastify, options) {
  await fastify.register((await import('@fastify/postgres')).default, {
    connectionString: `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`,
  });
}

export default fp(dbConnector);
