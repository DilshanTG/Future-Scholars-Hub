import type { Stroke } from '@/types/marking'

/** Convert a pixel coordinate to a normalized [x, y] pair (0..1). */
export function normalizePoint(x: number, y: number, w: number, h: number): [number, number] {
  return [x / w, y / h]
}

/** Convert a normalized stroke width to pixels for a given page width. */
export function denormalizeWidth(width: number, pageWidth: number): number {
  return width * pageWidth
}

/** Convert a pixel stroke width to normalized (against page width). */
export function normalizeWidth(widthPx: number, pageWidth: number): number {
  return widthPx / pageWidth
}

/** Convert a normalized stroke to pixel-space points + width for a target size. */
export function denormalizeStroke(stroke: Stroke, w: number, h: number): { points: number[]; width: number; color: string; mode: Stroke['mode'] } {
  const points: number[] = []
  for (let i = 0; i < stroke.points.length; i += 2) {
    points.push(stroke.points[i] * w, stroke.points[i + 1] * h)
  }
  return { points, width: denormalizeWidth(stroke.width, w), color: stroke.color, mode: stroke.mode }
}
