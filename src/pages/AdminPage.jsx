import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import AdminPanel from '../components/AdminPanel'
import { Music, LogOut, Home } from 'lucide-react'

export default function AdminPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm sm:text-base">Panel de Administración</h1>
              <p className="text-xs text-gray-400">Congreso de Músicos · Las Delicias, Caripe</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Inicio</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Participantes Registrados</h2>
          <p className="text-gray-500 text-sm mt-1">Filtra y consulta las inscripciones</p>
        </div>
        <AdminPanel />
      </main>
    </div>
  )
}
