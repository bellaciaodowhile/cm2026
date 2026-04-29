import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Users, Filter, Search, CheckCircle, XCircle, Clock, DollarSign, Upload, Eye, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import PaymentUploadModalFinal from './PaymentUploadModalFinal'

const CUOTAS = [
  { numero: 1, nombre: 'Cuota 1', monto: 15, fechaInicio: '2026-05-15', fechaFin: '2026-05-18' },
  { numero: 2, nombre: 'Cuota 2', monto: 15, fechaInicio: '2026-06-15', fechaFin: '2026-06-18' },
  { numero: 3, nombre: 'Cuota 3', monto: 20, fechaInicio: '2026-07-10', fechaFin: '2026-07-10' }
]

const ESTADOS_PAGO = ['Todos', 'Pendiente', 'Pagado'] // Solo estos estados ahora
const PAGE_SIZES = [10, 20, 30, 'Todos']

export default function PaymentControl() {
  const [participantes, setParticipantes] = useState([])
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({ 
    asociacion: 'Todas', 
    categoria: 'Todas', 
    estadoPago: 'Todos',
    cuota: 'Todas'
  })
  const [query, setQuery] = useState('')
  const [selectedParticipante, setSelectedParticipante] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const [stats, setStats] = useState({
    totalParticipantes: 0,
    totalPagado: 0,
    cuota1Pagada: 0,
    cuota2Pagada: 0,
    cuota3Pagada: 0
  })

  async function fetchData() {
    setLoading(true)
    
    // Obtener participantes
    const { data: participantesData, error: participantesError } = await supabase
      .from('inscripciones')
      .select('*')
      .order('nombre_apellido', { ascending: true })
    
    if (participantesError) {
      console.error('Error fetching participantes:', participantesError)
      setLoading(false)
      return
    }
    
    // Obtener pagos
    const { data: pagosData, error: pagosError } = await supabase
      .from('pagos')
      .select('*')
      .order('fecha_pago', { ascending: false })
    
    if (pagosError) {
      console.error('Error fetching pagos:', pagosError)
    }
    
    setParticipantes(participantesData || [])
    setPagos(pagosData || [])
    calcularEstadisticas(participantesData || [], pagosData || [])
    setLoading(false)
  }

  function calcularEstadisticas(participantesData, pagosData) {
    const totalParticipantes = participantesData.length
    
    // Contar pagos por cuota (todos los pagos son 'pagados')
    const cuota1Pagada = pagosData.filter(p => p.cuota_numero === 1).length
    const cuota2Pagada = pagosData.filter(p => p.cuota_numero === 2).length
    const cuota3Pagada = pagosData.filter(p => p.cuota_numero === 3).length
    
    // Calcular total pagado (todos los pagos son 'pagados')
    const totalPagado = pagosData
      .reduce((sum, p) => sum + parseFloat(p.monto), 0)
    
    // Calcular participantes que pagaron completo
    const participantesConPagos = [...new Set(pagosData.map(p => p.inscripcion_id))]
    const pagaronCompleto = participantesConPagos.filter(participanteId => {
      const pagosParticipante = pagosData.filter(p => p.inscripcion_id === participanteId)
      const cuotasPagadas = [...new Set(pagosParticipante.map(p => p.cuota_numero))]
      return cuotasPagadas.length === 3
    }).length
    
    setStats({
      totalParticipantes,
      totalPagado,
      cuota1Pagada,
      cuota2Pagada,
      cuota3Pagada,
      pagaronCompleto
    })
  }

  useEffect(() => { fetchData() }, [])

  // Filtrar participantes
  const filteredParticipantes = participantes.filter((p) => {
    if (filtros.asociacion !== 'Todas' && p.asociacion !== filtros.asociacion) return false
    if (filtros.categoria !== 'Todas' && p.categoria !== filtros.categoria) return false
    
    // Filtrar por estado de pago
    if (filtros.estadoPago !== 'Todos') {
      const pagosParticipante = pagos.filter(pago => pago.inscripcion_id === p.id)
      
      if (filtros.estadoPago === 'Pendiente') {
        // Si tiene algún pago registrado
        if (pagosParticipante.length > 0) return false
      } else if (filtros.estadoPago === 'Pagado') {
        // Si no tiene ningún pago registrado
        if (pagosParticipante.length === 0) return false
      }
    }
    
    // Filtrar por cuota específica
    if (filtros.cuota !== 'Todas') {
      const cuotaNum = parseInt(filtros.cuota)
      const pagoCuota = pagos.find(pago => 
        pago.inscripcion_id === p.id && 
        pago.cuota_numero === cuotaNum
      )
      if (!pagoCuota) return false
    }
    
    // Búsqueda por texto
    if (query.trim()) {
      const q = query.toLowerCase()
      const searchable = [p.nombre_apellido, p.ciudad, p.iglesia, p.distrito, p.categoria, p.nombre_agrupacion]
        .filter(Boolean).join(' ').toLowerCase()
      if (!searchable.includes(q)) return false
    }
    
    return true
  })

  // Reset página cuando cambian filtros o búsqueda
  useEffect(() => { setPage(1) }, [filtros, query, pageSize])

  // Calcular paginación
  const isAll = pageSize === 'Todos'
  const totalPages = isAll ? 1 : Math.ceil(filteredParticipantes.length / pageSize)
  const paginated = isAll ? filteredParticipantes : filteredParticipantes.slice((page - 1) * pageSize, page * pageSize)

  // Obtener estado de pagos para un participante
  function getEstadoPagos(participanteId) {
    const pagosParticipante = pagos.filter(p => p.inscripcion_id === participanteId)
    
    return CUOTAS.map(cuota => {
      const pago = pagosParticipante.find(p => p.cuota_numero === cuota.numero)
      return {
        ...cuota,
        estado: pago ? 'pagado' : 'pendiente', // Siempre 'pagado' si existe
        fechaPago: pago?.fecha_pago,
        referencia: pago?.referencia,
        tienePago: !!pago
      }
    })
  }

  // Verificar si el participante ha pagado el monto completo
  function haPagadoCompleto(participanteId) {
    const pagosParticipante = pagos.filter(p => p.inscripcion_id === participanteId) // Todos los pagos son 'pagados'
    const cuotasPagadas = [...new Set(pagosParticipante.map(p => p.cuota_numero))]
    
    // Verificar si tiene las 3 cuotas pagadas
    return cuotasPagadas.length === 3
  }

  // Obtener cuotas pagadas para un participante
  function getCuotasPagadas(participanteId) {
    const pagosParticipante = pagos.filter(p => p.inscripcion_id === participanteId) // Todos los pagos son 'pagados'
    return [...new Set(pagosParticipante.map(p => p.cuota_numero))].sort()
  }

  function handleUploadSuccess() {
    fetchData()
    setShowUploadModal(false)
    setSelectedParticipante(null)
  }

  function getEstadoColor(estado) {
    switch(estado) {
      case 'pagado': return 'bg-green-100 text-green-700'
      case 'pendiente': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  function getEstadoIcon(estado) {
    switch(estado) {
      case 'pagado': return <CheckCircle className="w-4 h-4" />
      case 'pendiente': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-indigo-500" />
            <span className="text-sm text-gray-600">Participantes</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.totalParticipantes}</div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-600">Total Pagado</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">${stats.totalPagado.toFixed(2)}</div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-600">Cuota 1</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.cuota1Pagada}</div>
          <div className="text-xs text-gray-500 mt-1">pagadas</div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-gray-600">Cuota 2</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.cuota2Pagada}</div>
          <div className="text-xs text-gray-500 mt-1">pagadas</div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-gray-600">Cuota 3</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.cuota3Pagada}</div>
          <div className="text-xs text-gray-500 mt-1">pagadas</div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-600">Completos</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.pagaronCompleto || 0}</div>
          <div className="text-xs text-gray-500 mt-1">pagaron todo</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-3 text-gray-600">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-semibold">Filtros</span>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar participante..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <FilterSelect 
            label="Asociación" 
            value={filtros.asociacion} 
            onChange={(v) => setFiltros(p => ({ ...p, asociacion: v }))} 
            options={['Todas', 'AVSOR', 'AVOR']} 
          />
          <FilterSelect 
            label="Categoría" 
            value={filtros.categoria} 
            onChange={(v) => setFiltros(p => ({ ...p, categoria: v }))} 
            options={['Todas', 'Solista', 'Coral', 'Grupo', 'Trío', 'Dúo']} 
          />
          <FilterSelect 
            label="Estado Pago" 
            value={filtros.estadoPago} 
            onChange={(v) => setFiltros(p => ({ ...p, estadoPago: v }))} 
            options={ESTADOS_PAGO} 
          />
          <FilterSelect 
            label="Cuota" 
            value={filtros.cuota} 
            onChange={(v) => setFiltros(p => ({ ...p, cuota: v }))} 
            options={['Todas', '1', '2', '3']} 
          />
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-gray-700">
          <Users className="w-5 h-5 text-indigo-500" />
          <span className="font-semibold">{filteredParticipantes.length} participante{filteredParticipantes.length !== 1 ? 's' : ''}</span>
          <span className="text-sm text-gray-500">
            {!isAll && `(Página ${page} de ${totalPages})`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Selector de tamaño de página */}
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <span>Mostrar</span>
            <div className="flex gap-1">
              {PAGE_SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setPageSize(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    pageSize === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* Cards para móvil */}
      <div className="sm:hidden space-y-3">
        {loading ? (
          <p className="text-center py-10 text-gray-400">Cargando...</p>
        ) : paginated.length === 0 ? (
          <p className="text-center py-10 text-gray-400">No hay participantes con estos filtros.</p>
        ) : (
          paginated.map((p) => {
            const estados = getEstadoPagos(p.id)
            const haPagadoCompletoParticipante = haPagadoCompleto(p.id)
            const cuotasPagadas = getCuotasPagadas(p.id)
            
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                {/* Información del participante */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{p.nombre_apellido}</div>
                      <div className="text-xs text-gray-500">{p.categoria} • {p.asociacion}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${p.asociacion === 'AVSOR' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {p.asociacion}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    <div>{p.iglesia} • {p.distrito}</div>
                    <div>{p.ciudad} • {p.edad} años</div>
                  </div>
                </div>

                {/* Estado de cuotas */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Estado de Cuotas:</div>
                  <div className="grid grid-cols-3 gap-2">
                    {estados.map((cuota) => (
                      <div key={cuota.numero} className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Cuota {cuota.numero}</div>
                        <div className="flex flex-col items-center gap-1">
                          {getEstadoIcon(cuota.estado)}
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(cuota.estado)}`}>
                            {cuota.estado === 'pendiente' ? 'Pendiente' : 'Pagado'}
                          </span>
                          {cuota.estado !== 'pendiente' && (
                            <span className="text-xs text-gray-500">
                              {new Date(cuota.fechaPago).toLocaleDateString('es-ES')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Badges especiales */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {haPagadoCompletoParticipante && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        ✓ Pagó completo
                      </span>
                    )}
                    {cuotasPagadas.length > 1 && !haPagadoCompletoParticipante && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {cuotasPagadas.length} cuotas pagadas
                      </span>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setSelectedParticipante(p)
                      setShowUploadModal(true)
                    }}
                    className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    Registrar Pago
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Mostrar detalles del participante
                      console.log('Ver detalles de:', p.id)
                    }}
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    Ver Detalles
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Tabla para desktop */}
      <div className="hidden sm:block overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-indigo-50 text-indigo-700">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Participante</th>
              <th className="px-4 py-3 text-left font-semibold">Cuota 1 (15$)</th>
              <th className="px-4 py-3 text-left font-semibold">Cuota 2 (15$)</th>
              <th className="px-4 py-3 text-left font-semibold">Cuota 3 (20$)</th>
              <th className="px-4 py-3 text-left font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-400">Cargando...</td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-400">No hay participantes con estos filtros.</td></tr>
            ) : (
              paginated.map((p) => {
                const estados = getEstadoPagos(p.id)
                return (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-800">{p.nombre_apellido}</div>
                        <div className="text-xs text-gray-500">{p.categoria} • {p.asociacion}</div>
                        <div className="text-xs text-gray-400">{p.iglesia}, {p.ciudad}</div>
                      </div>
                    </td>
                    {estados.map((cuota) => {
                      const haPagadoCompletoParticipante = haPagadoCompleto(p.id)
                      const cuotasPagadas = getCuotasPagadas(p.id)
                      
                      return (
                        <td key={cuota.numero} className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {getEstadoIcon(cuota.estado)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(cuota.estado)}`}>
                              {cuota.estado === 'pendiente' ? 'Pendiente' : 'Pagado'}
                            </span>
                            {cuota.estado !== 'pendiente' && (
                              <span className="text-xs text-gray-500">
                                {new Date(cuota.fechaPago).toLocaleDateString('es-ES')}
                              </span>
                            )}
                          </div>
                          {/* Mostrar badge si pagó completo */}
                          {haPagadoCompletoParticipante && cuota.numero === 1 && (
                            <div className="mt-1">
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                ✓ Completo
                              </span>
                            </div>
                          )}
                          {/* Mostrar si pagó múltiples cuotas juntas */}
                          {cuotasPagadas.length > 1 && cuota.numero === 1 && !haPagadoCompletoParticipante && (
                            <div className="mt-1">
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                {cuotasPagadas.length} cuotas
                              </span>
                            </div>
                          )}
                        </td>
                      )
                    })}
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedParticipante(p)
                            setShowUploadModal(true)
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs hover:bg-indigo-700 transition cursor-pointer"
                        >
                          Registrar Pago
                        </button>
                        <button
                          onClick={() => {
                            // TODO: Mostrar detalles del participante
                            console.log('Ver detalles de:', p.id)
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200 transition cursor-pointer"
                        >
                          Ver
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {!isAll && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="cursor-pointer p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce((acc, p, idx, arr) => {
              if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
              acc.push(p)
              return acc
            }, [])
            .map((p, idx) =>
              p === '...' ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 text-sm">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`cursor-pointer w-9 h-9 rounded-lg text-sm font-medium transition ${
                    page === p ? 'bg-indigo-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              )
            )}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="cursor-pointer p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modal para subir pago */}
      {showUploadModal && selectedParticipante && (
        <PaymentUploadModalFinal
          participante={selectedParticipante}
          onClose={() => {
            setShowUploadModal(false)
            setSelectedParticipante(null)
          }}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  )
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}