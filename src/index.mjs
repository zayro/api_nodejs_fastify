import dotenv from 'dotenv';
dotenv.config();
import Fastify from 'fastify';
import swagger from './swagger.mjs';
import db from './plugins/db.mjs';
import mariadb from './plugins/mariadb.mjs';
import jwt from './plugins/jwt.mjs';
import recordsRoutes from './routes/records.mjs';
import authRoutes from './routes/auth.mjs';
import cifrado from './routes/cifrado.mjs';

const fastify = Fastify({ logger: true });

fastify.register(swagger);
fastify.register(db);
fastify.register(mariadb);
fastify.register(jwt);
fastify.register(authRoutes, { prefix: '/auth' });
fastify.register(recordsRoutes, { prefix: '/records', onRequest: [fastify.authenticate] });
fastify.register(cifrado, { prefix: '/cifrado' });


fastify.get('/', async (request, reply) => {
  return { api: 'version 1.0.0' }
})

const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3000, host: '127.0.0.1' });
    fastify.log.info(`Servidor iniciado en puerto ${process.env.PORT || 3000}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();