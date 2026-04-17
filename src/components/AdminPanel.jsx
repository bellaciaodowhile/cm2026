import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { RefreshCw, Users, Filter, Search } from 'lucide-react'
import StatsCharts from './StatsCharts'

const CATEGORIAS = ['Todas', 'Solista', 'Coral', 'Grupo', 'Trío', 'Dúo']
const SEMINARIOS = [
  'Todos',
  'Manejo de sonido',
  'Dirección de himnos',
  'Formación de coros',
  'Vocalización de corales',
]

export default function AdminPanel() {
  const [registros, setRegistros] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({ asociacion: 'Todas', categoria: 'Todas', seminario: 'Todos' })
  const [query, setQuery] = useState('')

  async function fetchData() {
    setLoading(true)
    const { data, error } = await supabase
      .from('inscripciones')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setRegistros(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const filtered = registros.filter((r) => {
    if (filtros.asociacion !== 'Todas' && r.asociacion !== filtros.asociacion) return false
    if (filtros.categoria !== 'Todas' && r.categoria !== filtros.categoria) return false
    if (filtros.seminario !== 'Todos' && r.seminario !== filtros.seminario) return false
    if (query.trim()) {
      const q = query.toLowerCase()
      const searchable = [
        r.nombre_apellido, r.ciudad, r.iglesia, r.distrito,
        r.categoria, r.seminario, r.nombre_agrupacion, r.asociacion,
      ].filter(Boolean).join(' ').toLowerCase()
      if (!searchable.includes(q)) return false
    }
    return true
  })

  return (
    <div className="space-y-6">

      {/* Gráficos — usan todos los registros sin filtrar */}
      <StatsCharts data={registros} />

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-3 text-gray-600">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-semibold">Filtros</span>
        </div>
        {/* Buscador */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, iglesia, ciudad..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FilterSelect
            label="Asociación"
            value={filtros.asociacion}
            onChange={(v) => setFiltros((p) => ({ ...p, asociacion: v }))}
            options={['Todas', 'AVSOR', 'AVOR']}
          />
          <FilterSelect
            label="Categoría"
            value={filtros.categoria}
            onChange={(v) => setFiltros((p) => ({ ...p, categoria: v }))}
            options={CATEGORIAS}
          />
          <FilterSelect
            label="Seminario"
            value={filtros.seminario}
            onChange={(v) => setFiltros((p) => ({ ...p, seminario: v }))}
            options={SEMINARIOS}
          />
        </div>
      </div>

      {/* Header con conteo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-700">
          <Users className="w-5 h-5 text-indigo-500" />
          <span className="font-semibold">{filtered.length} participante{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Cards — móvil */}
      <div className="sm:hidden space-y-3">
        {loading ? (
          <p className="text-center py-10 text-gray-400">Cargando...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center py-10 text-gray-400">No hay registros con estos filtros.</p>
        ) : (
          filtered.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">{r.nombre_apellido}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.asociacion === 'AVSOR' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                  {r.asociacion}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700 font-medium">{r.categoria}</span>
                {r.nombre_agrupacion && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">{r.nombre_agrupacion}</span>
                )}
              </div>
              <div className="text-xs text-gray-500 space-y-0.5">
                <p>{r.iglesia} · {r.distrito}</p>
                <p>{r.ciudad} · {r.edad} años</p>
                <p className="text-indigo-500">{r.seminario}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tabla — desktop */}
      <div className="hidden sm:block overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-indigo-50 text-indigo-700">
            <tr>
              {['#', 'Asociación', 'Nombre y Apellido', 'Edad', 'Ciudad', 'Iglesia', 'Distrito', 'Categoría', 'Agrupación', 'Seminario'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="text-center py-10 text-gray-400">Cargando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={10} className="text-center py-10 text-gray-400">No hay registros con estos filtros.</td></tr>
            ) : (
              filtered.map((r, i) => (
                <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.asociacion === 'AVSOR' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {r.asociacion}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{r.nombre_apellido}</td>
                  <td className="px-4 py-3 text-gray-600">{r.edad}</td>
                  <td className="px-4 py-3 text-gray-600">{r.ciudad}</td>
                  <td className="px-4 py-3 text-gray-600">{r.iglesia}</td>
                  <td className="px-4 py-3 text-gray-600">{r.distrito}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700 font-medium">{r.categoria}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.nombre_agrupacion || <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.seminario}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
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
