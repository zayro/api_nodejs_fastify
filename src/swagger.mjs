export default async function (fastify) {
  await fastify.register((await import('@fastify/swagger')).default, {
    swagger: {
      info: {
        title: 'API Fastify PostgreSQL',
        description: 'Documentación de la API para gestión de registros de usuarios',
        version: '1.0.0',
      },
      host: 'localhost:3000',
      schemes: ['http'],
      
      consumes: ['application/json'],
      produces: ['application/json'],
      definitions: {
        RegistroUsuario: {
          type: 'object',
          properties: {
            identificacion: { type: 'string' },
            informacion: { type: 'object' },
            estado: { type: 'string', enum: ['activo', 'inactivo', 'retirado'] },
            created_at: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  });

  await fastify.register((await import('@fastify/swagger-ui')).default, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false
    },
    staticCSP: true,
    transformSpecification: (swaggerObject, request, reply) => {
      return swaggerObject;
    },
    transformSpecificationClone: true
  });
}
