import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'

interface Props {
  onDone: () => void
}

export function MarksOutAnimation({ onDone }: Props) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Triple burst confetti
    const fire = (opts: confetti.Options) => confetti({ ...opts, disableForReducedMotion: true })
    fire({ particleCount: 80, spread: 70, origin: { x: 0.5, y: 0.5 }, colors: ['#6C63FF','#f9a8d4','#86efac','#fde68a','#93c5fd','#fb7185'] })
    setTimeout(() => {
      fire({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0, y: 0.6 } })
      fire({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1, y: 0.6 } })
    }, 200)
    setTimeout(() => {
      fire({ particleCount: 40, spread: 100, origin: { x: 0.5, y: 0.3 }, gravity: 0.5 })
    }, 500)

    const timer = setTimeout(() => { setVisible(false); onDone() }, 3200)
    return () => clearTimeout(timer)
  }, [onDone])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center cursor-pointer"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={() => { setVisible(false); onDone() }}
    >
      <div className="text-center select-none animate-bounce-in">
        <div className="text-7xl mb-4" style={{ animation: 'pop 0.5s cubic-bezier(0.175,0.885,0.32,1.275)' }}>
          🎉
        </div>
        <h1
          className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-lg mb-3"
          style={{ animation: 'slideUp 0.6s ease-out 0.1s both' }}
        >
          Marks Are Out!
        </h1>
        <p
          className="text-white/80 text-lg"
          style={{ animation: 'slideUp 0.6s ease-out 0.3s both' }}
        >
          Check your results below ✨
        </p>
        <p className="text-white/50 text-sm mt-6">tap anywhere to dismiss</p>
      </div>

      <style>{`
        @keyframes pop {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUp {
          0% { transform: translateY(24px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
