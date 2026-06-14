import { set, get, del } from 'idb-keyval'
import type { MarkPage } from '@/types/marking'

export function sessionKey(studentId: string): string {
  return `mark-session:${studentId}`
}

/** Persisted shape: everything except the transient objectURL thumb. */
type PersistedPage = Omit<MarkPage, 'thumbUrl'>

export async function saveSession(studentId: string, pages: MarkPage[]): Promise<void> {
  const persisted: PersistedPage[] = pages.map(({ thumbUrl: _drop, ...rest }) => rest)
  await set(sessionKey(studentId), persisted)
}

export async function loadSession(studentId: string): Promise<MarkPage[] | null> {
  const persisted = (await get(sessionKey(studentId))) as PersistedPage[] | undefined
  if (!persisted || persisted.length === 0) return null
  return persisted.map((p) => ({ ...p, thumbUrl: '' }))
}

export async function clearSession(studentId: string): Promise<void> {
  await del(sessionKey(studentId))
}
