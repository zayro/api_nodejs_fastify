# API Node.js Fastify + PostgreSQL

## Descripción
API REST para guardar y consultar registros de usuarios en una base de datos PostgreSQL usando Fastify. Incluye documentación automática con Swagger (OpenAPI).

## Instalación

```bash
pnpm install
```

## Variables de entorno
Configura el archivo `.env` con los datos de tu base de datos PostgreSQL:

```
PGHOST=localhost
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=fastify_db
PGPORT=5432
PORT=3000
```

## Inicializar la base de datos

Asegúrate de tener PostgreSQL corriendo y ejecuta:

```bash
pnpm run db:init
```

## Ejecutar en desarrollo

```bash
pnpm run dev
```

## Documentación de la API

Accede a la documentación Swagger en: [http://localhost:3000/docs](http://localhost:3000/docs)

## Endpoints principales

- `GET /records` — Lista todos los registros de usuarios
- `POST /records` — Crea un nuevo registro de usuario

### Ejemplo de registro de usuario

```json
{
  "identificacion": "123456789",
  "informacion": { "nombre": "Juan", "email": "juan@ejemplo.com" },
  "estado": "activo"
}
```

## Estados permitidos
- activo
- inactivo
- retirado

## Buenas prácticas
- Uso de variables de entorno
- Separación de rutas, plugins y configuración
- Documentación automática
- Manejo de errores básico

## Seguridad y autenticación JWT

1. Obtén un token:

```bash
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin"}'
```

2. Usa el token en los endpoints protegidos:

```bash
curl -H "Authorization: Bearer TU_TOKEN" http://localhost:3000/records
```

Todos los endpoints bajo `/records` requieren un token JWT válido.

## Despliegue en producción

1. Instala las dependencias de producción:
   ```bash
   pnpm install --prod
   ```
2. Ejecuta la app en modo producción:
   ```bash
   pnpm run start:prod
   ```

### Servicio activo con PM2

1. Instala pm2 globalmente:
   ```bash
   pnpm add -g pm2
   ```
2. Inicia el servicio:
   ```bash
   pm2 start ecosystem.config.js
   ```
3. Verifica el estado:
   ```bash
   pm2 status
   ```
4. Guarda la configuración para reinicio automático:
   ```bash
   pm2 save
   pm2 startup
   ```
