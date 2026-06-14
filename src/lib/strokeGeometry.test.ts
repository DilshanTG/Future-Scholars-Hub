import { describe, it, expect } from 'vitest'
import {
  normalizePoint,
  denormalizeStroke,
  normalizeWidth,
  denormalizeWidth,
} from '@/lib/strokeGeometry'
import type { Stroke } from '@/types/marking'

describe('strokeGeometry', () => {
  it('normalizes a pixel point against display size', () => {
    expect(normalizePoint(50, 25, 100, 50)).toEqual([0.5, 0.5])
  })

  it('round-trips a stroke from normalized to pixel space', () => {
    const stroke: Stroke = { points: [0.5, 0.5, 1, 1], color: '#f00', width: 0.01, mode: 'pen' }
    const pixel = denormalizeStroke(stroke, 200, 100)
    expect(pixel.points).toEqual([100, 50, 200, 100])
  })

  it('normalizes and denormalizes width against page width', () => {
    expect(normalizeWidth(8, 800)).toBe(0.01)
    expect(denormalizeWidth(0.01, 800)).toBe(8)
  })
})
