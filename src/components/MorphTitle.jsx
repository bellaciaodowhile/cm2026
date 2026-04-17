import { useEffect, useRef, useState } from 'react'

const STYLE = `
@keyframes noteFall {
  0%   { transform: translateY(-120px); opacity: 0; }
  60%  { transform: translateY(0px);    opacity: 1; }
  72%  { transform: translateY(-18px);  opacity: 1; }
  84%  { transform: translateY(0px);    opacity: 1; }
  92%  { transform: translateY(-7px);   opacity: 1; }
  100% { transform: translateY(0px);    opacity: 0; }
}
@keyframes titleBounceIn {
  0%   { transform: translateY(-24px); opacity: 0; }
  55%  { transform: translateY(6px);   opacity: 1; }
  75%  { transform: translateY(-4px);  opacity: 1; }
  90%  { transform: translateY(2px);   opacity: 1; }
  100% { transform: translateY(0px);   opacity: 1; }
}
@keyframes fadeSlideUp {
  0%   { opacity: 0; transform: translateY(16px); }
  100% { opacity: 1; transform: translateY(0px);  }
}
`

const TITLE_STYLE = {
  fontFamily: "'RomanceFatal', Georgia, serif",
  letterSpacing: '0.09em',
}

// onFinal: callback que se llama cuando el título cambia a "Congreso..."
export default function MorphTitle({ onFinal }) {
  const [phase, setPhase] = useState('initial') // initial | falling | final
  const [notePos, setNotePos] = useState({ top: 0, left: 0 })
  const titleRef = useRef(null)
  const styleInjected = useRef(false)

  useEffect(() => {
    if (styleInjected.current) return
    styleInjected.current = true
    const el = document.createElement('style')
    el.textContent = STYLE
    document.head.appendChild(el)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      if (titleRef.current) {
        const rect = titleRef.current.getBoundingClientRect()
        setNotePos({ top: rect.top, left: rect.left + 4 })
      }
      setPhase('falling')
      setTimeout(() => {
        setPhase('final')
        onFinal?.()
      }, 900)
    }, 1000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="relative inline-block mb-4">
      {/* Nota musical que cae */}
      {phase === 'falling' && (
        <span
          style={{
            position: 'fixed',
            top: notePos.top - 10,
            left: notePos.left,
            fontSize: '2.4rem',
            lineHeight: 1,
            color: 'white',
            zIndex: 100,
            pointerEvents: 'none',
            animation: 'noteFall 0.95s cubic-bezier(0.22,1,0.36,1) forwards',
          }}
        >
          ♪
        </span>
      )}

      {/* Título inicial — más grande */}
      {phase !== 'final' && (
        <h2
          ref={titleRef}
          className="text-6xl sm:text-8xl font-extrabold text-white leading-tight drop-shadow-lg"
          style={TITLE_STYLE}
        >
          Himnario
          <br />
          <span className="text-white/90">Adventista</span>
        </h2>
      )}

      {/* Título final con bounce */}
      {phase === 'final' && (
        <h2
          className="text-5xl sm:text-7xl font-extrabold text-white leading-tight drop-shadow-lg"
          style={{
            ...TITLE_STYLE,
            animation: 'titleBounceIn 0.6s cubic-bezier(0.22,1,0.36,1) forwards',
          }}
        >
          Congreso de
          <br />
          <span className="text-white/90">Músicos 2026</span>
        </h2>
      )}
    </div>
  )
}
