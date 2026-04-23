import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { RefreshCw, Users, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import StatsCharts from './StatsCharts'

const CATEGORIAS = ['Todas', 'Solista', 'Coral', 'Grupo', 'Trío', 'Dúo']
const SEMINARIOS = ['Todos', 'Manejo de sonido', 'Dirección de himnos', 'Formación de coros', 'Vocalización de corales']
const MINISTERIOS = ['Todos', 'Sí', 'No']
const PAGE_SIZES = [10, 20, 30, 'Todos']

export default function AdminPanel() {
  const [registros, setRegistros] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({ asociacion: 'Todas', categoria: 'Todas', seminario: 'Todos', ministerio: 'Todos' })
  const [query, setQuery] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)

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

  // Reset página cuando cambian filtros o búsqueda
  useEffect(() => { setPage(1) }, [filtros, query, pageSize])

  const filtered = registros.filter((r) => {
    if (filtros.asociacion !== 'Todas' && r.asociacion !== filtros.asociacion) return false
    if (filtros.categoria !== 'Todas' && r.categoria !== filtros.categoria) return false
    if (filtros.seminario !== 'Todos' && r.seminario !== filtros.seminario) return false
    if (filtros.ministerio === 'Sí' && !r.ministerio_musical) return false
    if (filtros.ministerio === 'No' && r.ministerio_musical) return false
    if (query.trim()) {
      const q = query.toLowerCase()
      const searchable = [r.nombre_apellido, r.ciudad, r.iglesia, r.distrito, r.categoria, r.seminario, r.nombre_agrupacion, r.asociacion, r.rol_ministerio]
        .filter(Boolean).join(' ').toLowerCase()
      if (!searchable.includes(q)) return false
    }
    return true
  })

  const isAll = pageSize === 'Todos'
  const totalPages = isAll ? 1 : Math.ceil(filtered.length / pageSize)
  const paginated = isAll ? filtered : filtered.slice((page - 1) * pageSize, page * pageSize)

  function Row({ r, i }) {
    return (
      <tr className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
        <td className="px-4 py-3 text-gray-400">{(page - 1) * (isAll ? 0 : pageSize) + i + 1}</td>
        <td className="px-4 py-3">
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.asociacion === 'AVSOR' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
            {r.asociacion}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className="font-medium text-gray-800 whitespace-nowrap">{r.nombre_apellido}</span>
          <span className="block text-xs text-gray-400">{r.edad} años</span>
        </td>
        <td className="px-4 py-3 text-gray-600">{r.ciudad}</td>
        <td className="px-4 py-3 text-gray-600">{r.iglesia}</td>
        <td className="px-4 py-3 text-gray-600">{r.distrito}</td>
        <td className="px-4 py-3">
          <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700 font-medium">{r.categoria}</span>
        </td>
        <td className="px-4 py-3 text-gray-600">{r.nombre_agrupacion || <span className="text-gray-300">—</span>}</td>
        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.seminario}</td>
        <td className="px-4 py-3">
          {r.ministerio_musical
            ? <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700 font-medium whitespace-nowrap">{r.rol_ministerio || 'Sí'}</span>
            : <span className="text-gray-300">—</span>
          }
        </td>
      </tr>
    )
  }

  return (
    <div className="space-y-6">
      <StatsCharts data={registros} />

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
            placeholder="Buscar por nombre, iglesia, ciudad..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FilterSelect label="Asociación" value={filtros.asociacion} onChange={(v) => setFiltros((p) => ({ ...p, asociacion: v }))} options={['Todas', 'AVSOR', 'AVOR']} />
          <FilterSelect label="Categoría" value={filtros.categoria} onChange={(v) => setFiltros((p) => ({ ...p, categoria: v }))} options={CATEGORIAS} />
          <FilterSelect label="Seminario" value={filtros.seminario} onChange={(v) => setFiltros((p) => ({ ...p, seminario: v }))} options={SEMINARIOS} />
          <FilterSelect label="Ministerio Musical" value={filtros.ministerio} onChange={(v) => setFiltros((p) => ({ ...p, ministerio: v }))} options={MINISTERIOS} />
        </div>
      </div>

      {/* Header: conteo + por página + actualizar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-gray-700">
          <Users className="w-5 h-5 text-indigo-500" />
          <span className="font-semibold">{filtered.length} participante{filtered.length !== 1 ? 's' : ''}</span>
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
          <button onClick={fetchData} className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 transition cursor-pointer">
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Cards — móvil */}
      <div className="sm:hidden space-y-3">
        {loading ? (
          <p className="text-center py-10 text-gray-400">Cargando...</p>
        ) : paginated.length === 0 ? (
          <p className="text-center py-10 text-gray-400">No hay registros con estos filtros.</p>
        ) : (
          paginated.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">{r.nombre_apellido}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.asociacion === 'AVSOR' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                  {r.asociacion}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700 font-medium">{r.categoria}</span>
                {r.nombre_agrupacion && <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">{r.nombre_agrupacion}</span>}
              </div>
              <div className="text-xs text-gray-500 space-y-0.5">
                <p>{r.iglesia} · {r.distrito}</p>
                <p>{r.ciudad} · {r.edad} años</p>
                <p className="text-indigo-500">{r.seminario}</p>
                {r.ministerio_musical && (
                  <p className="text-emerald-600 font-medium">Ministerio: {r.rol_ministerio || 'Sí'}</p>
                )}
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
              {['#', 'Asociación', 'Nombre y Apellido', 'Ciudad', 'Iglesia', 'Distrito', 'Categoría', 'Agrupación', 'Seminario', 'Ministerio Musical'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="text-center py-10 text-gray-400">Cargando...</td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={10} className="text-center py-10 text-gray-400">No hay registros con estos filtros.</td></tr>
            ) : (
              paginated.map((r, i) => <Row key={r.id} r={r} i={i} />)
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
