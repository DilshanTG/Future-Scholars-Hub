export type ClassStatus = 'upcoming' | 'live' | 'ended'

export function getClassStatus(classDate: string, durationMinutes: number): ClassStatus {
  const now = Date.now()
  const start = new Date(classDate).getTime()
  const end = start + durationMinutes * 60_000
  if (now < start) return 'upcoming'
  if (now <= end) return 'live'
  return 'ended'
}
