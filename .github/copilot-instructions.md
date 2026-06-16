# Instrucciones del proyecto — api_nodejs_fastify

Propósito
- Repositorio para API Node.js usando Fastify; contiene rutas, plugins y pruebas.

Cuándo usar este archivo
- Consultarlo antes de crear/editar endpoints, integrar plugins o cambiar esquemas.

Comandos útiles
- Desarrollo: `pnpm dev` o `npm run dev` (usa `nodemon src/index.mjs`)
- Iniciar: `pnpm start` o `npm start`
- Pruebas: `pnpm test` o `npm test` (usa `tap`)
- Inicializar BD Postgres: `npm run db:init`
- Inicializar BD MariaDB: `npm run db:init:mariadb`

Estructura principal
- `src/` → código fuente
  - `index.mjs` → servidor y registro de plugins
  - `routes/` → definiciones de rutas (ej: `auth.mjs`, `records.mjs`)
  - `plugins/` → plugins registrados (ej: `jwt.mjs`, `db.mjs`, `mariadb.mjs`)
  - `swagger.mjs` → configuración Swagger/OpenAPI
- `scripts/` → scripts SQL y utilidades
- `test/` → pruebas automatizadas

Guía rápida para endpoints
- Añadir nuevo endpoint: crear archivo en `src/routes/` y exportar una función que registre rutas.
- Validación y schemas: añadir `schema` a las rutas para validación con AJV.
- Autenticación: reutilizar el plugin `src/plugins/jwt.mjs` y proteger rutas con `preHandler`.
- Hashids/IDs: usar el plugin existente `fastify-hashids` o utilidades en `scripts/hashids.js`.
- Swagger: actualizar `src/swagger.mjs` y añadir `schema` en cada ruta para documentación.

Estilo y convenciones
- Usar módulos ES (`.mjs`) coherentemente.
- Mantener handlers pequeños y extraer lógica de negocio a helpers o servicios si crece.
- Escribir pruebas minimalistas en `test/` para cada ruta nueva.

Dónde registrar cambios de agente
- Agentes personalizados: `.github/agents/` (ej: `fastify-endpoint.agent.md`).

Ejemplo de prompt para el agente
- "Crea un endpoint POST /records que valide el body con schema X y lo inserte en la tabla records usando el plugin `db.mjs`. Añade test."

Contacto y revisión
- Al realizar cambios significativos, abrir PR con descripción corta, comandos para reproducir y tests asociados.
