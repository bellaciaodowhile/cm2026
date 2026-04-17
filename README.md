# Congreso de Músicos - Las Delicias, Caripe

Aplicación web para el registro de participantes al Congreso de Músicos del 17 al 19 de julio.

## Tecnologías

- React + Vite
- Tailwind CSS
- Supabase
- Lucide React (iconos)

## Configuración

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno en `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. Crear la tabla en Supabase:
```sql
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

4. Ejecutar en desarrollo:
```bash
npm run dev
```

## Características

- Formulario de registro con validación
- Selección de asociación (AVSOR/AVOR)
- Campo dinámico para nombre de agrupación
- Formateo automático de texto (capitalización y limpieza)
- Panel de administración con filtros
- Diseño responsivo

## Estructura

- `/src/components/Reg