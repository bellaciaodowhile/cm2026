import { useEffect, useRef, useState } from 'react'

const KEYFRAMES = `
@keyframes keyRise {
  0%   { transform: translateY(100%); opacity: 0; }
  60%  { opacity: 1; }
  100% { transform: translateY(0%);   opacity: 1; }
}
`

let styleInjected = false

export default function PianoBackground() {
  const containerRef = useRef(null)
  const [numWhites, setNumWhites] = useState(40)

  const WHITE_W = 52
  const WHITE_H = 400
  const BLACK_W = 30
  const BLACK_H = 300
  const GAP = 5
  const BLACK_AFTER = [0, 1, 3, 4, 5]

  useEffect(() => {
    if (!styleInjected) {
      const el = document.createElement('style')
      el.textContent = KEYFRAMES
      document.head.appendChild(el)
      styleInjected = true
    }

    function calc() {
      const needed = Math.ceil(window.innerWidth / (WHITE_W + GAP)) + 4
      setNumWhites(needed)
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  const numOctaves = Math.ceil(numWhites / 7)

  const blackKeys = []
  for (let oct = 0; oct < numOctaves; oct++) {
    for (const bi of BLACK_AFTER) {
      const wi = oct * 7 + bi
      if (wi + 1 >= numWhites) continue
      const x = wi * (WHITE_W + GAP) + WHITE_W + GAP / 2 - BLACK_W / 2
      blackKeys.push({ x, wi, key: `${oct}-${bi}` })
    }
  }

  // Duración aleatoria pero estable por índice (entre 1.8s y 3.4s)
  function pressDuration(i) {
    // pseudo-random estable basado en índice
    const seed = ((i * 7 + 13) % 17) / 17
    return 1.8 + seed * 1.6
  }

  function pressDelay(i) {
    const seed = ((i * 11 + 5) % 19) / 19
    return seed * 2.5
  }

  return (
    <div
      ref={containerRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundColor: '#0f0e0e', overflow: 'hidden' }}
    >
      {/* Teclas blancas */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${WHITE_H}px` }}>
        {Array.from({ length: numWhites }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${i * (WHITE_W + GAP)}px`,
              top: 0,
              width: `${WHITE_W}px`,
              height: `${WHITE_H}px`,
              backgroundColor: '#fffdfd',
              borderRadius: '0 0 4px 4px',
              animation: `keyRise 0.7s cubic-bezier(0.22,1,0.36,1) ${(i * 0.03).toFixed(2)}s both`,
            }}
          />
        ))}

        {/* Teclas negras */}
        {blackKeys.map(({ x, wi, key }) => (
          <div
            key={key}
            style={{
              position: 'absolute',
              left: `${x}px`,
              top: 0,
              width: `${BLACK_W}px`,
              height: `${BLACK_H}px`,
              backgroundColor: '#0f0e0e',
              borderRadius: '0 0 3px 3px',
              zIndex: 1,
              animation: `keyRise 0.7s cubic-bezier(0.22,1,0.36,1) ${(wi * 0.03 + 0.05).toFixed(2)}s both`,
            }}
          />
        ))}
      </div>

      {/* Círculo que crea la curvatura */}
      <div
        style={{
          position: 'absolute',
          width: '260vw',
          height: '100vw',
          borderRadius: '50%',
          backgroundColor: '#0f0e0e',
          bottom: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
        }}
      />

      {/* Overlay para legibilidad */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(15,14,14,0.72) 0%, rgba(15,14,14,0.3) 55%, transparent 80%)',
          pointerEvents: 'none',
          zIndex: 3,
        }}
      />
    </div>
  )
}
