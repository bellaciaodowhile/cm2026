import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'

const COLORS_ASOC   = ['#6366f1', '#a855f7']
const COLORS_CAT    = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
const COLORS_SEM    = ['#06b6d4', '#f97316', '#84cc16', '#ec4899']
const COLORS_MIN    = ['#10b981', '#f59e0b', '#ef4444', '#6366f1']

function buildCount(data, key) {
  const map = {}
  data.forEach((r) => {
    const val = r[key] || 'Sin dato'
    map[val] = (map[val] || 0) + 1
  })
  return Object.entries(map).map(([name, value]) => ({ name, value }))
}

const RADIAN = Math.PI / 180
function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.05) return null
  const r = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function StatsCharts({ data }) {
  if (!data.length) return null

  const asocData = buildCount(data, 'asociacion')
  const catData  = buildCount(data, 'categoria')
  const semData  = buildCount(data, 'seminario')

  // Ministerio musical: conteo de quienes pertenecen, agrupados por rol
  const ministerioData = data
    .filter((r) => r.ministerio_musical)
    .reduce((acc, r) => {
      const rol = r.rol_ministerio || 'Sin rol'
      const found = acc.find((x) => x.name === rol)
      if (found) found.value++
      else acc.push({ name: rol, value: 1 })
      return acc
    }, [])

  const totalMinisterio = ministerioData.reduce((s, x) => s + x.value, 0)

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Asociación */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Por Asociación</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={asocData} cx="50%" cy="50%" outerRadius={80} dataKey="value" labelLine={false} label={CustomLabel}>
                {asocData.map((_, i) => <Cell key={i} fill={COLORS_ASOC[i % COLORS_ASOC.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v} participantes`]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Categoría */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Por Categoría</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={catData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v} participantes`]} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {catData.map((_, i) => <Cell key={i} fill={COLORS_CAT[i % COLORS_CAT.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Seminario */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Por Seminario</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={semData} cx="50%" cy="50%" outerRadius={80} dataKey="value" labelLine={false} label={CustomLabel}>
                {semData.map((_, i) => <Cell key={i} fill={COLORS_SEM[i % COLORS_SEM.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v} participantes`]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ministerio Musical */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Ministerio Musical</h3>
          <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2.5 py-1 rounded-full">
            {totalMinisterio} de {data.length} participantes
          </span>
        </div>
        {ministerioData.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Ningún participante pertenece al ministerio musical aún.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ministerioData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v} participantes`]} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {ministerioData.map((_, i) => <Cell key={i} fill={COLORS_MIN[i % COLORS_MIN.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
