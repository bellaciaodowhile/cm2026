-- Script para configurar el almacenamiento de Supabase para imágenes de pagos
-- Ejecuta esto en el SQL Editor de Supabase después de crear la tabla pagos

-- 1. Crear bucket para almacenar imágenes de comprobantes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pagos', 'pagos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Configurar políticas de seguridad para el bucket
-- Política: Cualquiera puede leer archivos (público)
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT
USING (bucket_id = 'pagos');

-- Política: Solo usuarios autenticados pueden subir archivos
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'pagos' AND
  auth.role() = 'authenticated'
);

-- Política: Solo usuarios autenticados pueden actualizar sus propios archivos
CREATE POLICY "Users can update own files" ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'pagos' AND
  auth.role() = 'authenticated'
);

-- Política: Solo usuarios autenticados pueden eliminar sus propios archivos
CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'pagos' AND
  auth.role() = 'authenticated'
);

-- 3. Configurar CORS para permitir subidas desde la aplicación
-- Nota: Esto normalmente se configura en el dashboard de Supabase
-- Ve a Storage -> pagos -> Policies -> CORS Configuration
-- Agrega: http://localhost:5173 (desarrollo) y tu dominio de producción

-- 4. Crear función helper para obtener URL pública
CREATE OR REPLACE FUNCTION get_payment_image_url(file_path TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN 'https://' || current_setting('app.current_host') || '/storage/v1/object/public/pagos/' || file_path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger para limpiar imágenes cuando se elimina un pago
CREATE OR REPLACE FUNCTION delete_payment_image()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.imagen_url IS NOT NULL THEN
    -- Extraer path del archivo de la URL
    DECLARE
      file_path TEXT;
    BEGIN
      file_path := substring(OLD.imagen_url from 'pagos/(.*)$');
      IF file_path IS NOT NULL THEN
        DELETE FROM storage.objects 
        WHERE bucket_id = 'pagos' AND name = file_path;
      END IF;
    END;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER delete_payment_image_trigger
BEFORE DELETE ON pagos
FOR EACH ROW EXECUTE FUNCTION delete_payment_image();

-- 6. Índice adicional para búsqueda por referencia
CREATE INDEX IF NOT EXISTS idx_pagos_referencia ON pagos(referencia);

-- 7. Vista para estadísticas de pagos
CREATE OR REPLACE VIEW pagos_estadisticas AS
SELECT 
  COUNT(*) as total_pagos,
  COUNT(CASE WHEN estado != 'pendiente' THEN 1 END) as pagos_realizados,
  SUM(CASE WHEN estado != 'pendiente' THEN monto ELSE 0 END) as total_recaudado,
  COUNT(CASE WHEN cuota_numero = 1 AND estado != 'pendiente' THEN 1 END) as cuota1_pagada,
  COUNT(CASE WHEN cuota_numero = 2 AND estado != 'pendiente' THEN 1 END) as cuota2_pagada,
  COUNT(CASE WHEN cuota_numero = 3 AND estado != 'pendiente' THEN 1 END) as cuota3_pagada,
  COUNT(DISTINCT inscripcion_id) as participantes_con_pagos
FROM pagos;