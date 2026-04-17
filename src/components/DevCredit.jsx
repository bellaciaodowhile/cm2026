import { useState } from 'react'
import { X, Mail, Heart } from 'lucide-react'

function WhatsAppIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

export default function DevCredit({ inline = false, style }) {
  const [open, setOpen] = useState(false)

  const triggerBtn = (cls) => (
    <button onClick={() => setOpen(true)} className={cls}>
      by <span className="underline underline-offset-2">codezardi</span>
    </button>
  )

  return (
    <>
      {inline ? (
        <div className="flex justify-center mt-5">
          {triggerBtn('cursor-pointer text-gray-400 hover:text-gray-600 transition text-xs tracking-wide')}
        </div>
      ) : (
        <div className="absolute top-4 left-5" style={{ zIndex: 10, ...style }}>
          {triggerBtn('cursor-pointer text-white/30 hover:text-white/70 transition text-xs tracking-wide')}
        </div>
      )}

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 relative">
            <button
              onClick={() => setOpen(false)}
              className="cursor-pointer absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-bold text-gray-900 text-md mb-0.5 flex items-center">
              Desarrollado con <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 mx-1" /> por codezardi
            </h3>
            <p className="text-gray-400 text-xs mb-1">Desarrollo web & aplicaciones</p>
            <div className="space-y-3">
              <a
                href="mailto:codezardi@gmail.com"
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition group"
              >
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <Mail className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="text-sm text-gray-700 group-hover:text-indigo-600 transition">
                  codezardi@gmail.com
                </span>
              </a>

              <a
                href="https://wa.me/584122974011?text=%C2%A1Hola!%20Quiero%20llevar%20mi%20idea%20al%20siguiente%20nivel%20y%20creo%20que%20puedes%20ayudarme.%20%C2%BFHablamos%3F"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition group"
              >
                <div className="bg-green-100 p-2 rounded-lg">
                  <WhatsAppIcon className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm text-gray-700 group-hover:text-green-600 transition">
                  Contactar por WhatsApp
                </span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
