import type { MarkPage, Stroke } from '@/types/marking'

export function reorder(pages: MarkPage[], from: number, to: number): MarkPage[] {
  const next = pages.slice()
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

export function pushStroke(page: MarkPage, stroke: Stroke): MarkPage {
  return { ...page, strokes: [...page.strokes, stroke], undone: [] }
}

export function undoLast(page: MarkPage): MarkPage {
  if (page.strokes.length === 0) return page
  const strokes = page.strokes.slice()
  const last = strokes.pop()!
  return { ...page, strokes, undone: [...page.undone, last] }
}

export function redoLast(page: MarkPage): MarkPage {
  if (page.undone.length === 0) return page
  const undone = page.undone.slice()
  const last = undone.pop()!
  return { ...page, strokes: [...page.strokes, last], undone }
}
