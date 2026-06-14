import { describe, it, expect } from 'vitest'
import { renderOrder } from '@/lib/buildPdf'
import type { MarkPage } from '@/types/marking'

function page(id: string): MarkPage {
  return { id, source: 'image', imageBlob: new Blob(), thumbUrl: '', width: 10, height: 10, rotation: 0, strokes: [], undone: [] }
}

describe('renderOrder', () => {
  it('preserves grid order as PDF order', () => {
    const pages = [page('a'), page('b'), page('c')]
    expect(renderOrder(pages).map((p) => p.id)).toEqual(['a', 'b', 'c'])
  })

  it('returns a copy, not the original array', () => {
    const pages = [page('a')]
    expect(renderOrder(pages)).not.toBe(pages)
  })
})
