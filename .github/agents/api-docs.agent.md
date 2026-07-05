---
name: api-docs
version: 1.0
description: "Encargado de la documentación de API Swagger/OpenAPI y esquemas JSON Schema para validación de rutas."
applyTo:
  - "src/swagger.mjs"
  - "src/routes/**/*.mjs"
  - "README.md"
---

Este agente asegura que todos los endpoints expuestos tengan validación estricta y estén documentados adecuadamente.

Reglas de oro:
- Cada endpoint nuevo debe contar con su respectivo objeto `schema` (params, query, body, response) usando JSON Schema.
- Validar que las respuestas HTTP de éxito y error estén tipadas para que Swagger las muestre correctamente.
- Asegurar que las descripciones de los parámetros y endpoints sean claras y reflejen fielmente la lógica del código.
