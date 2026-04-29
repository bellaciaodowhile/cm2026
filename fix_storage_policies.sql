-- Script para corregir políticas de seguridad del bucket de storage
-- Ejecuta esto en el SQL Editor de Supabase

-- 1. Eliminar políticas existentes del bucket 'pagos'
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- 2. Crear políticas simplificadas (sin requerir autenticación)
-- Política: Cualquiera puede leer archivos
CREATE POLICY "Anyone can read payment files" ON storage.objects
FOR SELECT
USING (bucket_id = 'pagos');

-- Política: Cualquiera puede subir archivos (para desarrollo)
-- En producción, deberías restringir esto
CREATE POLICY "Anyone can upload payment files" ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'pagos');

-- Política: Cualquiera puede actualizar archivos
CREATE POLICY "Anyone can update payment files" ON storage.objects
FOR UPDATE
USING (bucket_id = 'pagos');

-- Política: Cualquiera puede eliminar archivos
CREATE POLICY "Anyone can delete payment files" ON storage.objects
FOR DELETE
USING (bucket_id = 'pagos');

-- 3. Alternativa: Si quieres algo más seguro pero sin autenticación
-- Política: Solo insertar archivos con prefijo específico
-- CREATE POLICY "Insert with specific pattern" ON storage.objects
-- FOR INSERT
-- WITH CHECK (
--   bucket_id = 'pagos' AND
--   (name LIKE 'pagos/%')
-- );

-- 4. Verificar que el bucket existe y es público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'pagos';

-- 5. Configuración CORS recomendada (hazlo en el dashboard de Supabase)
-- URL de desarrollo: http://localhost:5173
-- URL de producción: tu-dominio.com
-- Métodos: POST, PUT, GET, DELETE
-- Headers: Authorization, Content-Type, x-client-info

-- 6. Crear función para generar nombres de archivo seguros
CREATE OR REPLACE FUNCTION generate_payment_filename(participante_id UUID, cuotas TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN 'pagos/' || participante_id || '_' || cuotas || '_' || EXTRACT(EPOCH FROM NOW()) || '.jpg';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Script para probar que funciona
-- SELECT * FROM storage.buckets WHERE id = 'pagos';
-- SELECT * FROM storage.objects WHERE bucket_id = 'pagos' LIMIT 5;