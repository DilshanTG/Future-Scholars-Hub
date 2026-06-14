import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/lib/markPersistence', () => ({
  saveSession: vi.fn(async () => {}),
  loadSession: vi.fn(async () => null),
  clearSession: vi.fn(async () => {}),
  sessionKey: (id: string) => `mark-session:${id}`,
}))

import { useMarkStore } from '@/store/markStore'
import type { MarkPage, Stroke } from '@/types/marking'

function page(id: string): MarkPage {
  return { id, source: 'image', imageBlob: new Blob(), thumbUrl: '', width: 100, height: 100, rotation: 0, strokes: [], undone: [] }
}
const stroke: Stroke = { points: [0, 0, 1, 1], color: '#f00', width: 0.01, mode: 'pen' }

describe('markStore', () => {
  beforeEach(() => {
    useMarkStore.setState({ studentId: 'stu-1', pages: [page('a'), page('b')], activePageId: 'a', status: 'idle' })
  })

  it('reorders pages', () => {
    useMarkStore.getState().reorderPages(0, 1)
    expect(useMarkStore.getState().pages.map((p) => p.id)).toEqual(['b', 'a'])
  })

  it('removes a page', () => {
    useMarkStore.getState().removePage('a')
    expect(useMarkStore.getState().pages.map((p) => p.id)).toEqual(['b'])
  })

  it('rotates a page through 90° increments', () => {
    useMarkStore.getState().rotatePage('a')
    expect(useMarkStore.getState().pages.find((p) => p.id === 'a')!.rotation).toBe(90)
  })

  it('adds a stroke to the targeted page', () => {
    useMarkStore.getState().addStroke('a', stroke)
    expect(useMarkStore.getState().pages.find((p) => p.id === 'a')!.strokes).toHaveLength(1)
  })

  it('undoes and redoes on a page', () => {
    const st = useMarkStore.getState()
    st.addStroke('a', stroke)
    st.undo('a')
    expect(useMarkStore.getState().pages.find((p) => p.id === 'a')!.strokes).toHaveLength(0)
    st.redo('a')
    expect(useMarkStore.getState().pages.find((p) => p.id === 'a')!.strokes).toHaveLength(1)
  })
})
