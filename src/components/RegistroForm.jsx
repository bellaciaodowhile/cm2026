import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { sanitizeRecord } from '../lib/utils'
import { Music, CheckCircle, Loader2, AlertCircle } from 'lucide-react'

const CATEGORIAS = ['Solista', 'Coral', 'Grupo', 'Trío', 'Dúo']
const SEMINARIOS = [
  'Manejo de sonido',
  'Dirección de himnos',
  'Formación de coros',
  'Vocalización de corales',
]
const ASOCIACIONES = ['AVSOR', 'AVOR']

const INITIAL = {
  asociacion: '',
  nombre_apellido: '',
  edad: '',
  ciudad: '',
  iglesia: '',
  distrito: '',
  categoria: '',
  nombre_agrupacion: '',
  seminario: '',
}

export default function RegistroForm({ onSuccess }) {
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('')

  const needsAgrupacion = form.categoria && form.categoria !== 'Solista'

  function validate() {
    const e = {}
    if (!form.asociacion) e.asociacion = 'Selecciona una asociación'
    if (!form.nombre_apellido.trim()) e.nombre_apellido = 'Campo requerido'
    if (!form.edad || isNaN(form.edad) || Number(form.edad) < 1) e.edad = 'Edad inválida'
    if (!form.ciudad.trim()) e.ciudad = 'Campo requerido'
    if (!form.iglesia.trim()) e.iglesia = 'Campo requerido'
    if (!form.distrito.trim()) e.distrito = 'Campo requerido'
    if (!form.categoria) e.categoria = 'Selecciona una categoría'
    if (needsAgrupacion && !form.nombre_agrupacion.trim()) e.nombre_agrupacion = 'Campo requerido'
    if (!form.seminario) e.seminario = 'Selecciona un seminario'
    return e
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
    // Si cambia a Solista, limpiar agrupación
    if (name === 'categoria' && value === 'Solista') {
      setForm((prev) => ({ ...prev, categoria: value, nombre_agrupacion: '' }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    setStatus('loading')

    const payload = sanitizeRecord(
      {
        asociacion: form.asociacion,
        nombre_apellido: form.nombre_apellido,
        edad: Number(form.edad),
        ciudad: form.ciudad,
        iglesia: form.iglesia,
        distrito: form.distrito,
        categoria: form.categoria,
        nombre_agrupacion: needsAgrupacion ? form.nombre_agrupacion : null,
        seminario: form.seminario,
      },
      ['asociacion', 'categoria', 'seminario', 'edad'] // estos no se capitalizan
    )

    const { error } = await supabase.from('inscripciones').insert([payload])

    if (error) {
      setErrorMsg(error.message)
      setStatus('error')
    } else {
      setStatus('success')
      setForm(INITIAL)
      // Si hay callback (modal), espera 1.5s y cierra
      if (onSuccess) setTimeout(onSuccess, 1500)
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <CheckCircle className="text-green-500 w-16 h-16" />
        <h2 className="text-2xl font-bold text-gray-800">¡Registro exitoso!</h2>
        <p className="text-gray-500">Tu inscripción fue guardada correctamente.</p>
        <button
          onClick={() => setStatus('idle')}
          className="cursor-pointer mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Registrar otro participante
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Asociación */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Asociación *</label>
        <div className="flex gap-4">
          {ASOCIACIONES.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => { setForm((p) => ({ ...p, asociacion: a })); setErrors((p) => ({ ...p, asociacion: undefined })) }}
              className={`cursor-pointer flex-1 py-3 rounded-xl border-2 font-bold text-lg transition ${
                form.asociacion === a
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-400'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
        {errors.asociacion && <p className="text-red-500 text-xs mt-1">{errors.asociacion}</p>}
      </div>

      {/* Datos personales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nombre y Apellido" name="nombre_apellido" value={form.nombre_apellido} onChange={handleChange} error={errors.nombre_apellido} />
        <Field label="Edad" name="edad" type="number" value={form.edad} onChange={handleChange} error={errors.edad} min="1" max="120" />
        <Field label="Ciudad" name="ciudad" value={form.ciudad} onChange={handleChange} error={errors.ciudad} />
        <Field label="Iglesia" name="iglesia" value={form.iglesia} onChange={handleChange} error={errors.iglesia} />
        <Field label="Distrito" name="distrito" value={form.distrito} onChange={handleChange} error={errors.distrito} className="sm:col-span-2" />
      </div>

      {/* Categoría */}
      <SelectField
        label="Categoría de Participación"
        name="categoria"
        value={form.categoria}
        onChange={handleChange}
        error={errors.categoria}
        options={CATEGORIAS}
      />

      {/* Nombre agrupación (dinámico) */}
      {needsAgrupacion && (
        <Field
          label="Nombre de la Agrupación"
          name="nombre_agrupacion"
          value={form.nombre_agrupacion}
          onChange={handleChange}
          error={errors.nombre_agrupacion}
        />
      )}

      {/* Seminario */}
      <SelectField
        label="Seminario"
        name="seminario"
        value={form.seminario}
        onChange={handleChange}
        error={errors.seminario}
        options={SEMINARIOS}
      />

      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMsg || 'Ocurrió un error. Intenta de nuevo.'}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="cursor-pointer w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
      >
        {status === 'loading' ? <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</> : 'Asistiré al Congreso'}
      </button>
    </form>
  )
}

function Field({ label, name, value, onChange, error, type = 'text', className = '', ...rest }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label} *</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2.5 rounded-lg border ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800`}
        {...rest}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

function SelectField({ label, name, value, onChange, error, options }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label} *</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2.5 rounded-lg border ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800 bg-white`}
      >
        <option value="">-- Seleccionar --</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}
