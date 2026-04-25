import confetti from 'canvas-confetti'

const COLORS = ['#6C63FF', '#a78bfa', '#f9a8d4', '#86efac', '#fde68a', '#93c5fd', '#fb7185', '#34d399']

export function useConfetti() {
  const fire = () => {
    // Main burst
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { x: 0.5, y: 0.55 },
      colors: COLORS,
      scalar: 1.1,
      gravity: 1.2,
      drift: 0,
      ticks: 200,
    })
    // Side bursts for a fuller feel
    setTimeout(() => {
      confetti({ particleCount: 30, angle: 60, spread: 50, origin: { x: 0, y: 0.6 }, colors: COLORS, scalar: 0.9, ticks: 180 })
      confetti({ particleCount: 30, angle: 120, spread: 50, origin: { x: 1, y: 0.6 }, colors: COLORS, scalar: 0.9, ticks: 180 })
    }, 80)
  }

  return { fire }
}
