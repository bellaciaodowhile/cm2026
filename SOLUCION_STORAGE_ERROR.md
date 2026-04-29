# Solución al Error: "new row violates row-level security policy"

## 📋 Problema
Al intentar subir una imagen al registrar un pago, aparece el error:
```
Error al subir imagen: new row violates row-level security policy
```

## 🔍 Causa
Las políticas de seguridad (RLS) del bucket `pagos` en Supabase Storage están configuradas para requerir autenticación, pero la aplicación no tiene sistema de login.

## ✅ Solución Paso a Paso

### Paso 1: Ejecutar Script SQL en Supabase
1. Ve al **SQL Editor** de tu proyecto Supabase
2. Copia y pega TODO el contenido de `simple_storage_fix.sql`
3. Haz clic en **"Run"**
4. Deberías ver el mensaje: "Bucket creado/configurado correctamente"

### Paso 2: Verificar en Dashboard de Supabase
1. Ve a **Storage** en el dashboard de Supabase
2. Deberías ver el bucket `pagos` en la lista
3. Haz clic en `pagos` y ve a la pestaña **"Policies"**
4. Deberías ver 4 políticas:
   - Allow all SELECT on pagos
   - Allow all INSERT on pagos  
   - Allow all UPDATE on pagos
   - Allow all DELETE on pagos

### Paso 3: Configurar CORS (Opcional pero Recomendado)
1. En el bucket `pagos`, ve a **"Settings"** → **"CORS Configuration"**
2. Agrega los siguientes orígenes:
   - `http://localhost:5173` (desarrollo)
   - `https://tu-dominio.com` (producción)
3. Métodos permitidos: `POST, PUT, GET, DELETE`
4. Headers: `Authorization, Content-Type, x-client-info`
5. Guarda los cambios

### Paso 4: Probar la Aplicación
1. Regresa a tu aplicación
2. Intenta registrar un pago CON imagen
3. Si funciona, ¡perfecto!
4. Si no funciona, prueba el **Paso 5**

### Paso 5: Usar Versión Simple (Sin Imágenes)
Si el error persiste:
1. La aplicación ya está usando `PaymentUploadModalSimple.jsx`
2. Esta versión **NO** sube imágenes
3. Puedes registrar pagos normalmente, solo sin imágenes
4. Los datos se guardan correctamente en la tabla `pagos`

### Paso 6: Habilitar Imágenes Más Tarde
Una vez que el storage funcione:
1. Cambia en `PaymentControl.jsx`:
   ```javascript
   // De:
   import PaymentUploadModalSimple from './PaymentUploadModalSimple'
   // A:
   import PaymentUploadModal from './PaymentUploadModal'
   ```
2. Cambia en el render:
   ```javascript
   // De:
   <PaymentUploadModalSimple ... />
   // A:
   <PaymentUploadModal ... />
   ```

## 🔧 Solución Alternativa: Configuración Manual

Si los scripts SQL no funcionan, configura manualmente:

### En SQL Editor de Supabase:
```sql
-- 1. Crear bucket si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('pagos', 'pagos', true);

-- 2. Eliminar políticas existentes
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
-- Repite para todas las políticas que veas

-- 3. Crear políticas abiertas
CREATE POLICY "pagos_select" ON storage.objects
FOR SELECT USING (bucket_id = 'pagos');

CREATE POLICY "pagos_insert" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'pagos');

CREATE POLICY "pagos_update" ON storage.objects
FOR UPDATE USING (bucket_id = 'pagos');

CREATE POLICY "pagos_delete" ON storage.objects
FOR DELETE USING (bucket_id = 'pagos');
```

### En Dashboard de Supabase:
1. Storage → New Bucket → Nombre: `pagos` → Public: ON
2. Policies → Add Policy para cada operación (SELECT, INSERT, UPDATE, DELETE)
3. En cada política: Usar expresión `bucket_id = 'pagos'`

## 📊 Verificación de que Funciona

### Prueba 1: Subir archivo manualmente
```javascript
// En consola del navegador (F12)
const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
const { data, error } = await supabase.storage
  .from('pagos')
  .upload('test.jpg', file);
console.log('Resultado:', { data, error });
```

### Prueba 2: Listar archivos en bucket
```javascript
const { data, error } = await supabase.storage
  .from('pagos')
  .list();
console.log('Archivos en bucket:', { data, error });
```

## 🚨 Consideraciones de Seguridad

### Para Desarrollo:
- Las políticas abiertas están bien
- No hay datos sensibles en las imágenes de comprobantes

### Para Producción:
1. **Agregar autenticación** a la aplicación
2. **Restringir políticas** a usuarios autenticados
3. **Validar tipos de archivo** en el servidor
4. **Limitar tamaño** de archivos
5. **Usar nombres de archivo** con UUIDs

## 📞 Soporte Adicional

Si el problema persiste:
1. Revisa la **consola del navegador** (F12) para más detalles del error
2. Verifica que las **variables de entorno** de Supabase estén configuradas
3. Prueba con un **archivo más pequeño** (< 1MB)
4. Intenta **formato JPG** en lugar de PNG

El sistema funciona completamente sin imágenes, pero con imágenes es mejor. Una vez configurado el storage, podrás subir comprobantes normalmente.