import { describe, it, expect, vi, beforeEach } from 'vitest'

const store = new Map<string, unknown>()
vi.mock('idb-keyval', () => ({
  set: vi.fn(async (k: string, v: unknown) => { store.set(k, v) }),
  get: vi.fn(async (k: string) => store.get(k)),
  del: vi.fn(async (k: string) => { store.delete(k) }),
}))

import { saveSession, loadSession, clearSession, sessionKey } from '@/lib/markPersistence'
import type { MarkPage } from '@/types/marking'

function page(id: string): MarkPage {
  return { id, source: 'image', imageBlob: new Blob(['x']), thumbUrl: 'blob:live', width: 10, height: 10, rotation: 0, strokes: [], undone: [] }
}

describe('markPersistence', () => {
  beforeEach(() => store.clear())

  it('namespaces the key by student', () => {
    expect(sessionKey('stu-1')).toBe('mark-session:stu-1')
  })

  it('saves and loads pages, dropping the transient thumbUrl', async () => {
    await saveSession('stu-1', [page('a')])
    const loaded = await loadSession('stu-1')
    expect(loaded).toHaveLength(1)
    expect(loaded![0].id).toBe('a')
    expect(loaded![0].thumbUrl).toBe('') // rebuilt by caller
  })

  it('clears a session', async () => {
    await saveSession('stu-1', [page('a')])
    await clearSession('stu-1')
    expect(await loadSession('stu-1')).toBeNull()
  })
})
