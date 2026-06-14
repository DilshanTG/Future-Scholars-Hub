import { create } from 'zustand'
import type { MarkPage, Stroke, ToolMode } from '@/types/marking'
import { reorder, pushStroke, undoLast, redoLast } from '@/lib/pageOps'
import { ingestFiles, makeThumb } from '@/lib/ingestFiles'
import { saveSession, loadSession, clearSession } from '@/lib/markPersistence'

interface MarkState {
  studentId: string
  pages: MarkPage[]
  activePageId: string | null
  tool: { color: string; width: number; mode: ToolMode }
  status: 'idle' | 'saving' | 'generating'
  initSession: (studentId: string) => Promise<boolean>
  startFresh: (studentId: string) => Promise<void>
  addFiles: (files: File[]) => Promise<void>
  removePage: (id: string) => void
  reorderPages: (from: number, to: number) => void
  rotatePage: (id: string) => void
  setActivePage: (id: string | null) => void
  setTool: (patch: Partial<MarkState['tool']>) => void
  addStroke: (pageId: string, stroke: Stroke) => void
  undo: (pageId: string) => void
  redo: (pageId: string) => void
  endSession: () => Promise<void>
}

const ROTATIONS: MarkPage['rotation'][] = [0, 90, 180, 270]

function persist(get: () => MarkState) {
  const { studentId, pages } = get()
  if (studentId) void saveSession(studentId, pages)
}

function mapPage(pages: MarkPage[], id: string, fn: (p: MarkPage) => MarkPage): MarkPage[] {
  return pages.map((p) => (p.id === id ? fn(p) : p))
}

/** Release the object-URL thumbnails held by the given pages. */
function revokeThumbs(pages: MarkPage[]) {
  for (const p of pages) {
    if (p.thumbUrl) URL.revokeObjectURL(p.thumbUrl)
  }
}

export const useMarkStore = create<MarkState>((set, get) => ({
  studentId: '',
  pages: [],
  activePageId: null,
  tool: { color: '#e11d48', width: 4, mode: 'pen' },
  status: 'idle',

  initSession: async (studentId) => {
    revokeThumbs(get().pages)
    const saved = await loadSession(studentId)
    if (saved) {
      // Persisted pages have no thumbUrl (it's a transient object URL); rebuild them.
      const withThumbs = await Promise.all(
        saved.map(async (p) => ({ ...p, thumbUrl: await makeThumb(p.imageBlob) })),
      )
      set({ studentId, pages: withThumbs, activePageId: withThumbs[0]?.id ?? null })
      return true
    }
    set({ studentId, pages: [], activePageId: null })
    return false
  },

  startFresh: async (studentId) => {
    revokeThumbs(get().pages)
    await clearSession(studentId)
    set({ studentId, pages: [], activePageId: null })
  },

  addFiles: async (files) => {
    const added = await ingestFiles(files)
    set((s) => ({ pages: [...s.pages, ...added], activePageId: s.activePageId ?? added[0]?.id ?? null }))
    persist(get)
  },

  removePage: (id) => {
    const removed = get().pages.find((p) => p.id === id)
    if (removed?.thumbUrl) URL.revokeObjectURL(removed.thumbUrl)
    set((s) => {
      const pages = s.pages.filter((p) => p.id !== id)
      const activePageId = s.activePageId === id ? pages[0]?.id ?? null : s.activePageId
      return { pages, activePageId }
    })
    persist(get)
  },

  reorderPages: (from, to) => {
    set((s) => ({ pages: reorder(s.pages, from, to) }))
    persist(get)
  },

  rotatePage: (id) => {
    set((s) => ({
      pages: mapPage(s.pages, id, (p) => ({ ...p, rotation: ROTATIONS[(ROTATIONS.indexOf(p.rotation) + 1) % 4] })),
    }))
    persist(get)
  },

  setActivePage: (id) => set({ activePageId: id }),

  setTool: (patch) => set((s) => ({ tool: { ...s.tool, ...patch } })),

  addStroke: (pageId, stroke) => {
    set((s) => ({ pages: mapPage(s.pages, pageId, (p) => pushStroke(p, stroke)) }))
    persist(get)
  },

  undo: (pageId) => {
    set((s) => ({ pages: mapPage(s.pages, pageId, undoLast) }))
    persist(get)
  },

  redo: (pageId) => {
    set((s) => ({ pages: mapPage(s.pages, pageId, redoLast) }))
    persist(get)
  },

  endSession: async () => {
    const { studentId, pages } = get()
    revokeThumbs(pages)
    if (studentId) await clearSession(studentId)
    set({ pages: [], activePageId: null, studentId: '' })
  },
}))
