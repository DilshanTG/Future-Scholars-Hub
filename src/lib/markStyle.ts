export interface MarkStyle {
  label: string
  gradient: string
  badge: string
  bar: string
  emoji: string
}

export function getMarkStyle(score: number, total: number): MarkStyle {
  const p = total > 0 ? (score / total) * 100 : 0
  if (p >= 90) return {
    label: 'On Fire!', emoji: '🔥',
    gradient: 'from-orange-400 to-red-400',
    badge: 'bg-orange-100 text-orange-800 border-orange-200',
    bar: 'bg-gradient-to-r from-orange-400 to-red-400',
  }
  if (p >= 75) return {
    label: 'Outstanding!', emoji: '🏆',
    gradient: 'from-amber-400 to-yellow-300',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    bar: 'bg-gradient-to-r from-amber-400 to-yellow-300',
  }
  if (p >= 55) return {
    label: 'Excellent!', emoji: '⭐',
    gradient: 'from-emerald-400 to-green-300',
    badge: 'bg-green-100 text-green-800 border-green-200',
    bar: 'bg-gradient-to-r from-emerald-400 to-green-300',
  }
  if (p >= 30) return {
    label: 'Keep Going!', emoji: '💪',
    gradient: 'from-blue-400 to-indigo-300',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    bar: 'bg-gradient-to-r from-blue-400 to-indigo-300',
  }
  return {
    label: 'Try Harder!', emoji: '😔',
    gradient: 'from-slate-400 to-gray-300',
    badge: 'bg-gray-100 text-gray-600 border-gray-200',
    bar: 'bg-gradient-to-r from-slate-400 to-gray-300',
  }
}

export function pct(score: number, total: number) {
  return total > 0 ? Math.round((score / total) * 100) : 0
}
