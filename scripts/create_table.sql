CREATE TABLE IF NOT EXISTS registros_usuarios (
  identificacion VARCHAR(100) NOT NULL,
  informacion JSONB NOT NULL,
  estado boolean NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);