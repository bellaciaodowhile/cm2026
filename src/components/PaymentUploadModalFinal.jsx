import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { X, DollarSign, Calendar, FileText, CheckCircle, Check } from 'lucide-react'

const CUOTAS = [
  { numero: 1, nombre: 'Cuota 1', monto: 15, fechaInicio: '2026-05-15', fechaFin: '2026-05-18' },
  { numero: 2, nombre: 'Cuota 2', monto: 15, fechaInicio: '2026-06-15', fechaFin: '2026-06-18' },
  { numero: 3, nombre: 'Cuota 3', monto: 20, fechaInicio: '2026-07-10', fechaFin: '2026-07-10' }
]

const MONTO_COMPLETO = 50 // 15 + 15 + 20

export default function PaymentUploadModalFinal({ participante, onClose, onSuccess }) {
  const [cuotasSeleccionadas, setCuotasSeleccionadas] = useState([1])
  const [montoCompleto, setMontoCompleto] = useState(false)
  const [form, setForm] = useState({
    fecha_pago: new Date().toISOString().split('T')[0],
    referencia: '',
    notas: ''
    // estado siempre será 'pagado'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Calcular monto total basado en cuotas seleccionadas
  const calcularMontoTotal = () => {
    if (montoCompleto) return MONTO_COMPLETO
    
    return cuotasSeleccionadas.reduce((total, cuotaNum) => {
      const cuota = CUOTAS.find(c => c.numero === cuotaNum)
      return total + (cuota?.monto || 0)
    }, 0)
  }

  // Manejar selección/deselección de cuotas
  const toggleCuota = (cuotaNum) => {
    if (cuotasSeleccionadas.includes(cuotaNum)) {
      // Si es la última cuota seleccionada, no permitir deseleccionar todas
      if (cuotasSeleccionadas.length === 1) return
      setCuotasSeleccionadas(cuotasSeleccionadas.filter(num => num !== cuotaNum))
    } else {
      setCuotasSeleccionadas([...cuotasSeleccionadas, cuotaNum].sort())
    }
    setMontoCompleto(false)
  }

  // Manejar selección de monto completo
  const handleMontoCompleto = () => {
    setMontoCompleto(true)
    setCuotasSeleccionadas([1, 2, 3])
  }

  // Manejar selección manual de cuotas
  const handleCuotasManuales = () => {
    setMontoCompleto(false)
    if (cuotasSeleccionadas.length === 0) {
      setCuotasSeleccionadas([1])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Determinar cuotas a registrar
      const cuotasARegistrar = montoCompleto ? [1, 2, 3] : cuotasSeleccionadas
      
      // Calcular monto por cuota
      const montoPorCuota = montoCompleto 
        ? MONTO_COMPLETO / 3
        : calcularMontoTotal() / cuotasSeleccionadas.length

      // Preparar registros de pagos
      const registrosPagos = cuotasARegistrar.map(cuotaNum => {
        const cuotaInfo = CUOTAS.find(c => c.numero === cuotaNum)
        return {
          inscripcion_id: participante.id,
          cuota_numero: cuotaNum,
          monto: montoCompleto ? cuotaInfo.monto : montoPorCuota,
          fecha_pago: form.fecha_pago,
          referencia: form.referencia || null,
          imagen_url: null, // Sin imágenes
          estado: 'pagado', // Siempre 'pagado'
          notas: montoCompleto 
            ? `Pago completo${form.notas ? ` - ${form.notas}` : ''}` 
            : (form.notas || null)
        }
      })

      // Crear registros de pagos
      const { error: insertError } = await supabase
        .from('pagos')
        .insert(registrosPagos)

      if (insertError) {
        throw new Error(`Error al registrar pagos: ${insertError.message}`)
      }

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, 1500)

    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (success) {
    const cuotasRegistradas = montoCompleto ? 3 : cuotasSeleccionadas.length
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-md w-full p-6">
          <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
            <CheckCircle className="text-green-500 w-16 h-16" />
            <h2 className="text-2xl font-bold text-gray-800">
              {cuotasRegistradas > 1 ? '¡Pagos Registrados!' : '¡Pago Registrado!'}
            </h2>
            <p className="text-gray-500">
              {montoCompleto 
                ? 'Las 3 cuotas se han registrado correctamente.' 
                : `${cuotasRegistradas} cuota${cuotasRegistradas > 1 ? 's' : ''} registrada${cuotasRegistradas > 1 ? 's' : ''} correctamente.`
              }
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
              <div className="text-sm text-green-700">
                <div className="font-medium">Resumen:</div>
                <div>Monto total: <span className="font-bold">${calcularMontoTotal()}</span></div>
                <div>Cuotas: {montoCompleto ? '1+2+3 (Completo)' : cuotasSeleccionadas.map(num => num).join('+')}</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Registrar Pago</h2>
            <p className="text-sm text-gray-500 mt-1">
              {participante.nombre_apellido} • {participante.categoria}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información del participante */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Participante</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Nombre:</span>
                <span className="font-medium ml-2">{participante.nombre_apellido}</span>
              </div>
              <div>
                <span className="text-gray-600">Asociación:</span>
                <span className="font-medium ml-2">{participante.asociacion}</span>
              </div>
              <div>
                <span className="text-gray-600">Categoría:</span>
                <span className="font-medium ml-2">{participante.categoria}</span>
              </div>
              <div>
                <span className="text-gray-600">Iglesia:</span>
                <span className="font-medium ml-2">{participante.iglesia}</span>
              </div>
            </div>
          </div>

          {/* Selección de cuotas */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Cuotas a Pagar
            </label>
            
            {/* Opción de Monto Completo */}
            <div className="mb-4">
              <button
                type="button"
                onClick={handleMontoCompleto}
                className={`cursor-pointer w-full p-4 rounded-xl border-2 text-left transition flex items-center justify-between ${
                  montoCompleto
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-green-400'
                }`}
              >
                <div>
                  <div className="font-bold text-lg">${MONTO_COMPLETO} - Monto Completo</div>
                  <div className="text-sm mt-1">Todas las cuotas (1+2+3)</div>
                  <div className="text-xs text-gray-500 mt-1">Ahorra tiempo registrando todo de una vez</div>
                </div>
                {montoCompleto && <Check className="w-6 h-6 text-green-600" />}
              </button>
            </div>

            {/* Selección manual de cuotas */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Seleccionar cuotas individuales:</span>
                <button
                  type="button"
                  onClick={handleCuotasManuales}
                  className="text-sm text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  {montoCompleto ? 'Seleccionar manualmente' : 'Limpiar selección'}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {CUOTAS.map((cuota) => (
                  <button
                    key={cuota.numero}
                    type="button"
                    onClick={() => toggleCuota(cuota.numero)}
                    disabled={montoCompleto}
                    className={`cursor-pointer p-4 rounded-xl border-2 text-center transition relative ${
                      cuotasSeleccionadas.includes(cuota.numero)
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300'
                    } ${montoCompleto ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {cuotasSeleccionadas.includes(cuota.numero) && (
                      <div className="absolute -top-2 -right-2 bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                    <div className="font-bold text-lg">${cuota.monto}</div>
                    <div className="text-sm mt-1">{cuota.nombre}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {cuota.numero === 3 ? '10 Jul' : `15-18 ${cuota.numero === 1 ? 'May' : 'Jun'}`}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Resumen del monto */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-600">Cuotas seleccionadas:</div>
                  <div className="font-medium text-gray-800">
                    {montoCompleto 
                      ? 'Todas (1+2+3)' 
                      : cuotasSeleccionadas.map(num => `Cuota ${num}`).join(' + ')
                    }
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Monto total:</div>
                  <div className="text-2xl font-bold text-gray-800">${calcularMontoTotal()}</div>
                </div>
              </div>
              {montoCompleto && (
                <div className="mt-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                  ✓ Se registrarán automáticamente las 3 cuotas
                </div>
              )}
            </div>
          </div>

          {/* Fecha y referencia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Fecha de Pago
              </label>
              <input
                type="date"
                value={form.fecha_pago}
                onChange={(e) => setForm({ ...form, fecha_pago: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Número de Referencia
              </label>
              <input
                type="text"
                value={form.referencia}
                onChange={(e) => setForm({ ...form, referencia: e.target.value })}
                placeholder="Ej: TRANSF-12345"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notas Adicionales
            </label>
            <textarea
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
              placeholder="Observaciones sobre el pago..."
              rows="3"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Estado fijo - siempre pagado */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-semibold text-green-800">Estado del Pago</div>
                <div className="text-sm text-green-700">Siempre será registrado como "Pagado"</div>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              <div className="font-semibold mb-2">Error:</div>
              <div>{error}</div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>Registrando...</>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Registrar Pago
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}