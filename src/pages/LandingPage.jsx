import { useState, useEffect } from 'react'
import { Music, Calendar, MapPin, X } from 'lucide-react'
import RegistroForm from '../components/RegistroForm'
import PianoBackground from '../components/PianoBackground'
import MorphTitle from '../components/MorphTitle'
import logo from '../assets/logo.png'

export default function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (modalOpen) {
      requestAnimationFrame(() => setAnimateIn(true))
    } else {
      setAnimateIn(false)
    }
  }, [modalOpen])

  function closeModal() {
    setAnimateIn(false)
    setTimeout(() => setModalOpen(false), 200)
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Fondo de piano */}
      <PianoBackground />

      {/* Todo el contenido va sobre el canvas */}
      <div className="relative flex flex-col min-h-screen" style={{ zIndex: 10 }}>

        {/* Logo top-right */}
        <div className="absolute top-4 right-6">
          <img
            src={logo}
            alt="Logo"
            style={{ height: '52px', filter: 'brightness(0) invert(1)', opacity: 0.9 }}
          />
        </div>

        {/* Hero */}
        <main className="flex-1 flex items-center justify-center px-4 py-4">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto">

            <MorphTitle onFinal={() => setShowContent(true)} />

            <div style={{
              opacity: showContent ? 1 : 0,
              transition: 'opacity 0.5s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              <span className="bg-white/10 border border-white/20 text-white/80 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 tracking-widest uppercase backdrop-blur-sm">
                AVSOR · AVOR
              </span>
              <p className="text-white/60 text-lg mb-8">
                Un encuentro de alabanza, formación y comunión<br className="hidden sm:block" /> para músicos de todas las iglesias.
              </p>

              {/* Info pills */}
              <div className="flex flex-col sm:flex-row justify-center gap-3 mb-10">
                <div className="flex items-center gap-2 bg-black/40 border border-white/15 backdrop-blur-sm rounded-full px-5 py-2.5 text-base text-white/70">
                  <Calendar className="w-5 h-5 text-white/50" />
                  17 – 19 de Julio, 2026
                </div>
                <div className="flex items-center gap-2 bg-black/40 border border-white/15 backdrop-blur-sm rounded-full px-5 py-2.5 text-base text-white/70">
                  <MapPin className="w-5 h-5 text-white/50" />
                  Las Delicias, Caripe
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => setModalOpen(true)}
                className="cursor-pointer inline-flex items-center gap-3 bg-white hover:bg-white/90 active:scale-95 text-gray-900 text-xl font-bold px-10 py-5 rounded-2xl shadow-2xl shadow-black/40 transition-all duration-150"
              >
                <Music className="w-6 h-6" />
                Inscribirse Ahora
              </button>

              <p className="text-white/30 text-sm mt-4">.</p>
            </div>
          </div>
        </main>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
          className={`fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm transition-all duration-200 cursor-pointer ${
            animateIn ? 'bg-black/60' : 'bg-black/0'
          }`}
        >
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl cursor-default transition-all duration-200 ${
                animateIn ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
              }`}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Formulario de Inscripción</h3>
                  <p className="text-xs text-gray-400">Congreso de Músicos · Las Delicias, Caripe</p>
                </div>
                <button
                  onClick={closeModal}
                  className="cursor-pointer p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal body */}
              <div className="px-6 py-6">
                <RegistroForm onSuccess={closeModal} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
