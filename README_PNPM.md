# Uso de pnpm en este proyecto

Este proyecto está configurado para usar pnpm como gestor de paquetes.

## Comandos principales

- Instalar dependencias:
  ```bash
  pnpm install
  ```
- Ejecutar en desarrollo:
  ```bash
  pnpm run dev
  ```
- Ejecutar pruebas:
  ```bash
  pnpm test
  ```
- Agregar un paquete:
  ```bash
  pnpm add <paquete>
  ```
- Agregar un paquete de desarrollo:
  ```bash
  pnpm add -D <paquete>
  ```

## Notas
- Puedes seguir usando los scripts definidos en package.json con pnpm.
- Si tienes problemas con dependencias, elimina node_modules y ejecuta `pnpm install`.
