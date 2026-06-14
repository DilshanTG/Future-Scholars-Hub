import { describe, it, expect } from 'vitest'
import { reorder, pushStroke, undoLast, redoLast } from '@/lib/pageOps'
import type { MarkPage, Stroke } from '@/types/marking'

function page(id: string): MarkPage {
  return { id, source: 'image', imageBlob: new Blob(), thumbUrl: '', width: 100, height: 100, rotation: 0, strokes: [], undone: [] }
}
const s = (c: string): Stroke => ({ points: [0, 0, 1, 1], color: c, width: 0.01, mode: 'pen' })

describe('pageOps', () => {
  it('reorders pages from index to index', () => {
    const pages = [page('a'), page('b'), page('c')]
    expect(reorder(pages, 0, 2).map((p) => p.id)).toEqual(['b', 'c', 'a'])
  })

  it('pushes a stroke and clears the redo stack', () => {
    const p = { ...page('a'), undone: [s('old')] }
    const next = pushStroke(p, s('new'))
    expect(next.strokes).toHaveLength(1)
    expect(next.undone).toHaveLength(0)
  })

  it('undo moves last stroke to the redo stack', () => {
    const p = { ...page('a'), strokes: [s('1'), s('2')] }
    const next = undoLast(p)
    expect(next.strokes.map((x) => x.color)).toEqual(['1'])
    expect(next.undone.map((x) => x.color)).toEqual(['2'])
  })

  it('redo moves last undone stroke back', () => {
    const p = { ...page('a'), strokes: [s('1')], undone: [s('2')] }
    const next = redoLast(p)
    expect(next.strokes.map((x) => x.color)).toEqual(['1', '2'])
    expect(next.undone).toHaveLength(0)
  })

  it('undo on empty strokes is a no-op', () => {
    const p = page('a')
    expect(undoLast(p)).toEqual(p)
  })
})
