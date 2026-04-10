export default async function authRoutes(fastify, options) {
  fastify.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string' },
          password: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: { token: { type: 'string' } }
        },
        401: {
          type: 'object',
          properties: { error: { type: 'string' } }
        }
      }
    }
  }, async (request, reply) => {
    const { username, password } = request.body;
    // Buscar usuario en MariaDB
    const [rows] = await fastify.mysql.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return reply.code(401).send({ error: 'Credenciales inválidas' });
    }
    const user = rows[0];
    // Comparación simple, para producción usar hash seguro
    if (user.password !== password) {
      return reply.code(401).send({ error: 'Credenciales inválidas' });
    }
    const token = fastify.jwt.sign({ username });
    return { token };
  });
}
