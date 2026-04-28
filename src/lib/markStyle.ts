export interface MarkStyle {
  label: string
  gradient: string
  badge: string
  bar: string
  emoji: string
}

export function getMarkStyle(score: number, total: number): MarkStyle {
  const pct = total > 0 ? (score / total) * 100 : 0
  if (pct >= 90) return {
    label: 'Outstanding!', emoji: '🏆',
    gradient: 'from-amber-400 to-yellow-300',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    bar: 'bg-gradient-to-r from-amber-400 to-yellow-300',
  }
  if (pct >= 75) return {
    label: 'Excellent!', emoji: '⭐',
    gradient: 'from-emerald-400 to-green-300',
    badge: 'bg-green-100 text-green-800 border-green-200',
    bar: 'bg-gradient-to-r from-emerald-400 to-green-300',
  }
  if (pct >= 60) return {
    label: 'Good Job!', emoji: '👍',
    gradient: 'from-blue-400 to-indigo-300',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    bar: 'bg-gradient-to-r from-blue-400 to-indigo-300',
  }
  if (pct >= 40) return {
    label: 'Keep Going!', emoji: '💪',
    gradient: 'from-violet-400 to-purple-300',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    bar: 'bg-gradient-to-r from-violet-400 to-purple-300',
  }
  return {
    label: "Don't Give Up!", emoji: '🔥',
    gradient: 'from-rose-400 to-red-300',
    badge: 'bg-red-100 text-red-800 border-red-200',
    bar: 'bg-gradient-to-r from-rose-400 to-red-300',
  }
}

export function pct(score: number, total: number) {
  return total > 0 ? Math.round((score / total) * 100) : 0
}
