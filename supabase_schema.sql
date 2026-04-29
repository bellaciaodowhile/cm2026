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

-- Tabla para control de pagos
CREATE TABLE pagos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inscripcion_id UUID REFERENCES inscripciones(id) ON DELETE CASCADE,
  cuota_numero INTEGER NOT NULL CHECK (cuota_numero IN (1, 2, 3)),
  monto DECIMAL(10, 2) NOT NULL,
  fecha_pago DATE NOT NULL DEFAULT CURRENT_DATE,
  referencia TEXT,
  estado TEXT NOT NULL DEFAULT 'pagado' CHECK (estado = 'pagado'),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_pagos_inscripcion_id ON pagos(inscripcion_id);
CREATE INDEX idx_pagos_cuota_numero ON pagos(cuota_numero);
CREATE INDEX idx_pagos_estado ON pagos(estado);
CREATE INDEX idx_pagos_fecha_pago ON pagos(fecha_pago);

-- Políticas de seguridad
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

-- Solo usuarios autenticados pueden ver y modificar pagos
CREATE POLICY "select_pagos_authenticated" ON pagos
  FOR SELECT USING (true);

CREATE POLICY "insert_pagos_authenticated" ON pagos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "update_pagos_authenticated" ON pagos
  FOR UPDATE USING (true);

CREATE POLICY "delete_pagos_authenticated" ON pagos
  FOR DELETE USING (true);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pagos_updated_at BEFORE UPDATE ON pagos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
