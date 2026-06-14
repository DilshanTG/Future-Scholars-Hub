export interface MarkStyle {
  label: string
  gradient: string
  badge: string
  bar: string
}

export function getMarkStyle(score: number, total: number): MarkStyle {
  const p = total > 0 ? (score / total) * 100 : 0
  if (p >= 75) return {
    label: 'A',
    gradient: 'from-emerald-400 to-green-500',
    badge: 'bg-green-100 text-green-800 border-green-200',
    bar: 'bg-gradient-to-r from-emerald-400 to-green-500',
  }
  if (p >= 65) return {
    label: 'B',
    gradient: 'from-blue-400 to-indigo-400',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    bar: 'bg-gradient-to-r from-blue-400 to-indigo-400',
  }
  if (p >= 55) return {
    label: 'C',
    gradient: 'from-violet-500 to-purple-500',
    badge: 'bg-violet-100 text-violet-800 border-violet-200',
    bar: 'bg-gradient-to-r from-violet-500 to-purple-500',
  }
  if (p >= 40) return {
    label: 'S',
    gradient: 'from-orange-400 to-orange-500',
    badge: 'bg-orange-100 text-orange-800 border-orange-200',
    bar: 'bg-gradient-to-r from-orange-400 to-orange-500',
  }
  return {
    label: 'F',
    gradient: 'from-red-400 to-rose-400',
    badge: 'bg-red-100 text-red-700 border-red-200',
    bar: 'bg-gradient-to-r from-red-400 to-rose-400',
  }
}

export function pct(score: number, total: number) {
  return total > 0 ? Math.round((score / total) * 100) : 0
}
