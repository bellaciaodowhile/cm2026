-- Script SIMPLE para arreglar el bucket de storage de pagos
-- Ejecuta TODO este script en el SQL Editor de Supabase

-- 1. Crear bucket si no existe (público)
INSERT INTO storage.buckets (id, name, public)
VALUES ('pagos', 'pagos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Eliminar TODAS las políticas existentes del bucket 'pagos'
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read payment files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload payment files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update payment files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete payment files" ON storage.objects;

-- 3. Crear políticas MUY SIMPLES (sin restricciones para desarrollo)
-- Política: Permitir TODO para SELECT
CREATE POLICY "Allow all SELECT on pagos" ON storage.objects
FOR SELECT USING (bucket_id = 'pagos');

-- Política: Permitir TODO para INSERT
CREATE POLICY "Allow all INSERT on pagos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'pagos');

-- Política: Permitir TODO para UPDATE
CREATE POLICY "Allow all UPDATE on pagos" ON storage.objects
FOR UPDATE USING (bucket_id = 'pagos');

-- Política: Permitir TODO para DELETE
CREATE POLICY "Allow all DELETE on pagos" ON storage.objects
FOR DELETE USING (bucket_id = 'pagos');

-- 4. Verificar que funciona
SELECT 
  'Bucket creado/configurado correctamente' as mensaje,
  id,
  name,
  public
FROM storage.buckets 
WHERE id = 'pagos';

-- 5. Para producción, deberías agregar políticas más restrictivas
-- pero para desarrollo/testing esto funciona