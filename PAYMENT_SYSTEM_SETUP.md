# Sistema de Control de Pagos - Configuración

## 📋 Resumen
Sistema implementado para controlar los pagos de los participantes con tres cuotas específicas:
1. **Cuota 1**: $15 (15-18 de Mayo 2026)
2. **Cuota 2**: $15 (15-18 de Junio 2026)
3. **Cuota 3**: $20 (10 de Julio 2026)

## 🗄️ Configuración de Base de Datos

### 1. Ejecutar scripts SQL en Supabase

**Primero**, ejecuta el contenido de `supabase_schema.sql` en el SQL Editor de Supabase para crear:
- Tabla `pagos` con todas las relaciones y políticas de seguridad
- Índices para búsquedas rápidas
- Triggers para actualización automática de timestamps

**Segundo**, ejecuta `supabase_storage_setup.sql` para:
- Crear el bucket `pagos` para almacenar imágenes de comprobantes
- Configurar políticas de seguridad del storage
- Crear vistas de estadísticas

### 2. Configurar Storage en Supabase Dashboard

1. Ve a **Storage** en el dashboard de Supabase
2. Crea un nuevo bucket llamado `pagos` (si no se creó automáticamente)
3. Configura CORS para permitir subidas desde:
   - `http://localhost:5173` (desarrollo)
   - Tu dominio de producción

## 🎨 Componentes Implementados

### 1. **PaymentControl.jsx** (`src/components/PaymentControl.jsx`)
- Vista principal del control de pagos
- Muestra lista de participantes con estado de cada cuota
- Estadísticas en tiempo real
- Filtros avanzados (asociación, categoría, estado de pago, cuota)
- Botón para registrar nuevos pagos

### 2. **PaymentUploadModal.jsx** (`src/components/PaymentUploadModal.jsx`)
- Modal para registrar pagos
- Selección de cuota (1, 2 o 3)
- Subida de imágenes de comprobantes (PNG, JPG hasta 5MB)
- Campos para referencia, fecha y notas
- Validación de datos

### 3. **Modificaciones en AdminPanel.jsx**
- Agregado tab "Control de Pagos" junto a "Registros"
- Navegación entre vistas
- Mantiene todas las funcionalidades existentes

## 🔧 Funcionalidades del Sistema

### ✅ Vista de Control
- Tabla con participantes y estado de cada cuota (✓/✗)
- Colores indicativos: verde (pagado/verificado), rojo (pendiente)
- Filtros por: asociación, categoría, estado de pago, cuota específica
- Búsqueda por nombre, iglesia, ciudad

### ✅ Registro de Pagos
- Selección de participante
- Elección de cuota (1, 2 o 3)
- Subida de imagen del comprobante (opcional)
- Ingreso de referencia bancaria/transacción
- Fecha personalizable
- Notas adicionales
- Estados: "pagado" o "verificado"

### ✅ Estadísticas
- Total de participantes
- Total recaudado
- Cuotas 1, 2 y 3 pagadas por separado
- Actualización en tiempo real

## 🚀 Uso del Sistema

### Para Administradores:
1. Accede al panel de administración
2. Haz clic en el tab **"Control de Pagos"**
3. Busca el participante usando filtros o búsqueda
4. Haz clic en **"Registrar Pago"** para ese participante
5. Completa el formulario con los datos del pago
6. Sube la imagen del comprobante (opcional)
7. Confirma el registro

### Flujo de Trabajo:
```
Participante se inscribe → Aparece en lista → 
Administrador registra pago → Estado cambia a "pagado" → 
Sistema actualiza estadísticas
```

## 🛠️ Solución de Problemas

### Problema: No se pueden subir imágenes
**Solución:**
1. Verifica que el bucket `pagos` existe en Supabase Storage
2. Configura políticas CORS correctamente
3. Asegúrate de que las variables de entorno de Supabase estén configuradas

### Problema: Error al registrar pago
**Solución:**
1. Verifica que la tabla `pagos` esté creada
2. Revisa la consola del navegador para mensajes de error
3. Asegúrate de que el participante exista en la tabla `inscripciones`

### Problema: Estadísticas no se actualizan
**Solución:**
1. Haz clic en el botón "Actualizar"
2. Verifica la conexión a Supabase
3. Revisa que los datos se estén insertando correctamente

## 📊 Estructura de Datos

### Tabla `pagos`:
```sql
id UUID
inscripcion_id UUID (FK a inscripciones)
cuota_numero INTEGER (1, 2, 3)
monto DECIMAL (15.00, 20.00)
fecha_pago DATE
referencia TEXT
imagen_url TEXT
estado TEXT ('pendiente', 'pagado', 'verificado')
notas TEXT
created_at TIMESTAMP
updated_at TIMESTAMP
```

## 🔐 Seguridad

- **RLS (Row Level Security)** habilitado en todas las tablas
- Solo usuarios autenticados pueden acceder/modificar datos
- Políticas específicas para cada operación (SELECT, INSERT, UPDATE, DELETE)
- Storage configurado con políticas de acceso apropiadas

## 📈 Mejoras Futuras

1. **Exportar reportes** a Excel/PDF
2. **Recordatorios automáticos** para cuotas próximas a vencer
3. **Notificaciones** por email a participantes con pagos pendientes
4. **Dashboard avanzado** con gráficos de tendencias
5. **API REST** para integración con otros sistemas

## 🎯 Consideraciones Importantes

1. Las fechas de las cuotas están hardcodeadas para 2026
2. Los montos son fijos ($15, $15, $20)
3. El sistema asume que cada participante debe las 3 cuotas
4. Se puede modificar fácilmente para más cuotas o montos variables

## 📞 Soporte

Para problemas técnicos o preguntas sobre la implementación, revisa:
1. Consola del navegador (F12)
2. Logs de Supabase
3. Archivos de configuración SQL

El sistema está listo para producción una vez configurado correctamente en Supabase.