const { test } = require('tap');
const Fastify = require('fastify');
const db = require('../src/plugins/db');
const recordsRoutes = require('../src/routes/records');
require('dotenv').config({ path: '../.env' });

function buildFastify() {
  const app = Fastify();
  app.register(db);
  app.register(recordsRoutes, { prefix: '/records' });
  return app;
}

test('GET /records devuelve array', async t => {
  const app = buildFastify();
  await app.ready();
  const res = await app.inject({ method: 'GET', url: '/records' });
  t.equal(res.statusCode, 200);
  t.type(JSON.parse(res.payload), Array);
  await app.close();
});

test('POST /records crea registro', async t => {
  const app = buildFastify();
  await app.ready();
  const payload = { nombre: 'test', valor: 'valor' };
  const res = await app.inject({ method: 'POST', url: '/records', payload });
  t.equal(res.statusCode, 201);
  const body = JSON.parse(res.payload);
  t.equal(body.nombre, 'test');
  t.equal(body.valor, 'valor');
  await app.close();
});
