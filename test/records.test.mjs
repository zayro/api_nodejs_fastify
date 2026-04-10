import { test } from 'tap';
import Fastify from 'fastify';
import db from '../src/plugins/db.mjs';
import recordsRoutes from '../src/routes/records.mjs';
import jwt from '../src/plugins/jwt.mjs';
import mariadb from '../src/plugins/mariadb.mjs';
import authRoutes from '../src/routes/auth.mjs';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

function buildFastify() {
  const app = Fastify();
  app.register(db);
  app.register(mariadb);
  app.register(jwt);
  app.register(authRoutes, { prefix: '/auth' });
  app.register(recordsRoutes, { prefix: '/records', onRequest: [app.authenticate] });
  return app;
}

test('GET /records requiere JWT', async t => {
  const app = buildFastify();
  await app.ready();
  const res = await app.inject({ method: 'GET', url: '/records' });
  t.equal(res.statusCode, 401);
  await app.close();
});
