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
import fastifyMailer from 'fastify-mailer';
import cors from '@fastify/cors';
import fastifyBcrypt from 'fastify-bcrypt';
import fastifyHashids from "fastify-hashids";

const fastify = Fastify({ logger: true });

fastify.register(cors, {
  origin: '*', // En un entorno de producción, es recomendable limitar esto a los dominios específicos
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

fastify.register(swagger);
fastify.register(db);
fastify.register(mariadb);
fastify.register(jwt);
fastify.register(fastifyBcrypt, {
  saltWorkFactor: 10
});
fastify.register(fastifyHashids, {
    salt: process.env.HASHIDS_SALT || "supersecreto",
    minLength: 8,
  });
fastify.register(authRoutes, { prefix: '/auth' });
fastify.register(recordsRoutes, { prefix: '/records', onRequest: [fastify.authenticate] });
fastify.register(cifrado, { prefix: '/cifrado' });
fastify.register(fastifyMailer, {
  defaults: { from: process.env.SMTP_FROM || 'no-reply@ejemplo.com' },
  transport: {
    host: process.env.SMTP_HOST || 'smtp.socketlabs.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: true,
    auth: {
      user: process.env.SMTP_USER || 'server23771',
      pass: process.env.SMTP_PASSWORD || 's7D5Cfb9FRm43NaSw26A',
    },
  },
});

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