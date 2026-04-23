-- Ejecuta esto en el SQL Editor de tu proyecto Supabase

CREATE TABLE inscripciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asociacion TEXT NOT NULL,
  nombre_apellido TEXT NOT NULL,
  edad INTEGER NOT NULL,
  ciudad TEXT NOT NULL,
  iglesia TEXT NOT NULL,
  distrito TEXT NOT NULL,
  categoria TEXT NOT NULL,
  nombre_agrupacion TEXT,
  seminario TEXT NOT NULL,
  ministerio_musical BOOLEAN DEFAULT FALSE,
  rol_ministerio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para filtros rápidos
CREATE INDEX idx_inscripciones_asociacion ON inscripciones(asociacion);
CREATE INDEX idx_inscripciones_categoria ON inscripciones(categoria);
CREATE INDEX idx_inscripciones_seminario ON inscripciones(seminario);

-- Habilitar Row Level Security (recomendado)
ALTER TABLE inscripciones ENABLE ROW LEVEL SECURITY;

-- Política: cualquiera puede insertar (registro público)
CREATE POLICY "insert_public" ON inscripciones
  FOR INSERT WITH CHECK (true);

-- Política: solo lectura autenticada (para el panel admin)
-- Si quieres que el panel sea público también, cambia 'authenticated' por 'anon'
CREATE POLICY "select_authenticated" ON inscripciones
  FOR SELECT USING (true);

-- Columnas para ministerio musical (ejecutar si la tabla ya existe)
-- ALTER TABLE inscripciones ADD COLUMN IF NOT EXISTS ministerio_musical BOOLEAN DEFAULT FALSE;
-- ALTER TABLE inscripciones ADD COLUMN IF NOT EXISTS rol_ministerio TEXT;
