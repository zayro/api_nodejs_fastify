# Plantillas de Prompts para Microservicios y Multi-Agentes

Este archivo contiene plantillas de prompts optimizadas para interactuar con Gemini y otros LLMs utilizando la suite de agentes personalizados del proyecto backend. Estas plantillas están estructuradas para orquestar y "conectar" múltiples subagentes en tareas complejas.

---

## 1. Plantilla Maestra (Estructura Base)
Utiliza esta estructura base para cualquier tarea compleja que involucre múltiples capas del backend.

```markdown
Actúa como un Arquitecto de Software experto en microservicios y Node.js/Fastify. Tu tarea principal es:
[Escribe aquí la meta principal, ej: Crear un servicio para generar facturas PDF y subirlas a AWS S3]

Para cumplir esto de forma segura y mantenible, delega y aplica las directrices de los siguientes subagentes:
1. @db-expert: Diseña el modelo de datos local, las relaciones y las queries necesarias.
2. @security-auth: Asegura la integridad del proceso, validando tokens de acceso e implementando cifrado si aplica.
3. @api-docs: Define los contratos de entrada/salida mediante esquemas JSON Schema y documenta las rutas en Swagger.
4. @testing-qa: Diseña la suite de pruebas unitarias y de integración para validar el flujo completo.

Especificaciones del entorno:
- Microservicio afectado: [Nombre del servicio, ej: api-facturacion]
- Entrada esperada (Body/Query): [Describe el JSON esperado]
- Salida esperada (Respuesta): [Describe la respuesta exitosa]

Pasos para resolver la tarea:
1. Diseña primero los contratos de datos y la documentación con @api-docs.
2. Basándote en el contrato, estructura la persistencia de datos con @db-expert.
3. Implementa la lógica y la seguridad con @security-auth.
4. Finaliza creando la suite de pruebas automatizadas con @testing-qa.
```

---

## 2. Comunicación Asíncrona (Event-Driven con Colas/Brokers)
Para tareas donde un microservicio consume o publica mensajes en sistemas como RabbitMQ, Apache Kafka o AWS SNS/SQS.

```markdown
Actúa como un Especialista en Sistemas Mensajería Asíncrona en Node.js/Fastify. Necesitamos conectar este microservicio al broker de eventos para [publicar/consumir] mensajes.

Aplica las directrices de los siguientes subagentes:
- @db-expert: Implementa un patrón "Outbox" o un registro local de idempotencia para garantizar que cada evento procesado tenga un ID único y no se duplique si ocurre un reintento.
- @security-auth: Valida que el payload del mensaje no contenga datos sensibles expuestos en texto plano y comprueba firmas criptográficas si es necesario.
- @api-docs: Genera y actualiza la documentación del esquema del evento publicado o recibido.

El flujo a desarrollar es:
1. Escuchar en la cola/tópico: "[Nombre de la cola, ej: pagos.procesados]".
2. Al recibir un mensaje, validar la firma del emisor.
3. Almacenar el ID del mensaje en base de datos para asegurar idempotencia.
4. Ejecutar la lógica de negocio local: [ej. actualizar saldo del usuario].
```

---

## 3. Comunicación Síncrona Inter-Servicios (HTTP-REST o gRPC)
Para microservicios que necesitan consultar información de otros microservicios en tiempo real de forma segura y resiliente.

```markdown
Actúa como un Diseñador de APIs Resilientes. Necesitamos que este microservicio realice peticiones HTTP de forma segura al microservicio de "[Nombre del servicio destino, ej: Servicio de Usuarios]".

Orquesta el desarrollo siguiendo estas directrices:
- @security-auth: Configura e inyecta las cabeceras de autorización necesarias (como tokens m2m, JWT firmado o certificados TLS cliente).
- @ops-deploy: Agrega las variables de entorno necesarias para la URL base y tiempos de timeout para producción.
- @testing-qa: Desarrolla pruebas unitarias simulando que el servicio destino está caído (timeouts, 502 Bad Gateway) y asegura que manejemos la caída de forma controlada.

Requisitos específicos:
- Implementa una política de reintentos (Retries) con backoff exponencial.
- Define un Circuit Breaker básico para que no saturemos al servicio de destino si este está fallando.
```

---

## 4. Trazabilidad Distribuida (Observabilidad y Logs)
Para garantizar la trazabilidad de extremo a extremo de las peticiones a través de múltiples microservicios.

```markdown
Actúa como Especialista en Telemetría y Observabilidad de Microservicios.

Orquesta el desarrollo bajo estas directrices:
- @fastify-endpoint: Registra un hook global que verifique si la petición HTTP entrante cuenta con un TraceID en la cabecera `x-correlation-id`. Si no cuenta con él, genéralo automáticamente.
- @db-expert: Asegura que cada consulta SQL/NoSQL ejecutada por esta petición incluya el TraceID en los logs de depuración del controlador de base de datos.
- @ops-deploy: Asegura que los logs de la consola se formateen en JSON estructurado compatible con sistemas como Datadog, ElasticSearch o Grafana Loki.

Tarea: Configura el logger nativo de Fastify (pino) para que cada línea de log incluya las claves `traceId` y `microserviceName`.
```

---

## 5. Patrón Saga / Transacciones Distribuidas (Consistencia Eventual)
Para operaciones lógicas de negocio complejas que cruzan la frontera de múltiples bases de datos de microservicios y requieren compensación.

```markdown
Actúa como un Ingeniero de Sistemas Distribuidos con experiencia en consistencia de datos de negocio.

Orquesta el proceso aplicando las directrices de los siguientes subagentes:
- @db-expert: Diseña la máquina de estados local de la transacción (ej. CREADA, RESERVADA, CONFIRMADA, RECHAZADA) y la lógica atómica de base de datos para aplicar reversiones (compensación).
- @security-auth: Configura las verificaciones necesarias para asegurar que la orden de reversión/compensación sea legítima y provenga del bus de eventos o del orquestador verificado.
- @testing-qa: Escribe pruebas de integración para simular un caso donde un microservicio secundario falla y se debe ejecutar la compensación local con éxito.

Tarea: Crea una ruta o suscriptor para "[ej: cancelar_reserva_inventario]" que actúe como acción de compensación (rollback) devolviendo las unidades retenidas al inventario disponible.
```
