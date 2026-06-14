# Worksheet Marking Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a teacher dashboard page to bulk-upload student work (images + PDFs), reorder pages, mark them with a stylus/pen/mouse on a canvas, then export a flattened PDF that uploads to Supabase and attaches to the student.

**Architecture:** A new route `/teacher/students/:id/mark` hosts a session driven by a zustand store. Pages hold full-res image blobs (persisted to IndexedDB for crash safety) plus vector strokes stored in normalized 0–1 coordinates. Marking uses react-konva (cached image layer + live stroke layer). Export replays strokes onto full-res offscreen Konva stages, assembles a PDF with pdf-lib, uploads to Supabase Storage, and records a row that the student views in-app.

**Tech Stack:** React 19, TypeScript, Vite, zustand, react-router-dom v6, Supabase, react-konva/konva, pdfjs-dist, @hello-pangea/dnd, pdf-lib, idb-keyval. Tests: Vitest.

**Reference spec:** `docs/superpowers/specs/2026-06-14-worksheet-marking-design.md`

**Conventions observed in this codebase:**
- Supabase client: `import { supabase } from '@/lib/supabase'`
- IDs: `crypto.randomUUID()` (no uuid lib)
- Path alias: `@/*` → `./src/*`
- Storage upload pattern (see `src/pages/teacher/NoteAddPage.tsx`): `supabase.storage.from(bucket).upload(path, file)` → `getPublicUrl` → `supabase.from(table).insert(...)`
- Buttons: `<Button asChild className="rounded-pill ..."><Link to=...>…</Link></Button>`; accent color `#6C63FF`
- Toasts: `import { toast } from 'sonner'`

---

## Task 0: Project setup — Vitest + dependencies

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Install runtime dependencies**

```bash
npm install konva react-konva pdfjs-dist @hello-pangea/dnd pdf-lib idb-keyval
```

- [ ] **Step 2: Install test dependencies**

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: Add test script to package.json**

In `package.json` `"scripts"`, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

- [ ] **Step 5: Create `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 6: Add a smoke test to verify the runner works**

Create `src/test/smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest'

describe('test runner', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 7: Run the smoke test**

Run: `npm test`
Expected: PASS, 1 test passed.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/test/setup.ts src/test/smoke.test.ts
git commit -m "chore: add vitest + worksheet-marking dependencies"
```

---

## Task 1: Supabase schema + storage bucket

**Files:**
- Create: `docs/superpowers/sql/marked_worksheets.sql` (documentation of the migration applied via Supabase dashboard/CLI)

This task is run against Supabase (SQL editor or CLI), not the app. Save the SQL for the record.

- [ ] **Step 1: Create the SQL file**

Create `docs/superpowers/sql/marked_worksheets.sql`:

```sql
-- Table: one marked worksheet PDF per student
create table if not exists marked_worksheets (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  title text,
  file_url text not null,
  page_count int,
  created_at timestamptz default now()
);

create index if not exists marked_worksheets_student_id_idx
  on marked_worksheets (student_id);
```

- [ ] **Step 2: Apply the table**

Run the SQL above in the Supabase SQL editor.

- [ ] **Step 3: Create the storage bucket**

In Supabase Storage, create a **public** bucket named `marked-worksheets` (matching the existing `note-files` bucket's public setting). If using policies, mirror the `note-files` bucket policies.

- [ ] **Step 4: Commit the SQL record**

```bash
git add docs/superpowers/sql/marked_worksheets.sql
git commit -m "feat: marked_worksheets table + bucket (sql record)"
```

---

## Task 2: Types + stroke coordinate utilities

**Files:**
- Create: `src/types/marking.ts`
- Create: `src/lib/strokeGeometry.ts`
- Test: `src/lib/strokeGeometry.test.ts`

Strokes are stored normalized to 0–1 so they render identically on a small editing canvas and a full-res export canvas. These pure functions convert between normalized and pixel space.

- [ ] **Step 1: Create the types**

Create `src/types/marking.ts`:

```ts
export type ToolMode = 'pen' | 'eraser'

export interface Stroke {
  /** Flat array of normalized points: [x0,y0,x1,y1,…], each in 0..1 */
  points: number[]
  color: string
  /** Stroke width normalized to page width (0..1) */
  width: number
  mode: ToolMode
}

export interface MarkPage {
  id: string
  source: 'image' | 'pdf'
  imageBlob: Blob
  thumbUrl: string
  /** natural pixel dimensions of the source image */
  width: number
  height: number
  rotation: 0 | 90 | 180 | 270
  strokes: Stroke[]
  undone: Stroke[]
}

export interface MarkedWorksheetRow {
  id: string
  student_id: string
  title: string | null
  file_url: string
  page_count: number | null
  created_at: string
}
```

- [ ] **Step 2: Write the failing test**

Create `src/lib/strokeGeometry.test.ts`:

```ts
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
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- strokeGeometry`
Expected: FAIL — cannot find module `@/lib/strokeGeometry`.

- [ ] **Step 4: Implement `src/lib/strokeGeometry.ts`**

```ts
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
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- strokeGeometry`
Expected: PASS, 3 tests.

- [ ] **Step 6: Commit**

```bash
git add src/types/marking.ts src/lib/strokeGeometry.ts src/lib/strokeGeometry.test.ts
git commit -m "feat: marking types + stroke geometry utils"
```

---

## Task 3: Page-order and undo/redo pure logic

**Files:**
- Create: `src/lib/pageOps.ts`
- Test: `src/lib/pageOps.test.ts`

Pure array transforms used by the store. Kept separate so they're trivially testable.

- [ ] **Step 1: Write the failing test**

Create `src/lib/pageOps.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- pageOps`
Expected: FAIL — cannot find module `@/lib/pageOps`.

- [ ] **Step 3: Implement `src/lib/pageOps.ts`**

```ts
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- pageOps`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/pageOps.ts src/lib/pageOps.test.ts
git commit -m "feat: page reorder + undo/redo pure logic"
```

---

## Task 4: File ingestion (images + PDF rasterization)

**Files:**
- Create: `src/lib/pdfjs.ts` (worker config)
- Create: `src/lib/ingestFiles.ts`

Converts dropped `File`s into `MarkPage`s. Images load directly; PDFs render each page to a JPEG blob via pdf.js. No unit test (relies on browser canvas/pdf APIs); verified manually in Task 6+.

- [ ] **Step 1: Configure the pdf.js worker — `src/lib/pdfjs.ts`**

```ts
import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

export { pdfjsLib }
```

- [ ] **Step 2: Implement `src/lib/ingestFiles.ts`**

```ts
import type { MarkPage } from '@/types/marking'
import { pdfjsLib } from '@/lib/pdfjs'

/** Max display dimension for thumbnails. */
const THUMB_MAX = 240

async function bitmapDims(blob: Blob): Promise<{ width: number; height: number }> {
  const bmp = await createImageBitmap(blob)
  const dims = { width: bmp.width, height: bmp.height }
  bmp.close()
  return dims
}

async function makeThumb(blob: Blob): Promise<string> {
  const bmp = await createImageBitmap(blob)
  const scale = Math.min(1, THUMB_MAX / Math.max(bmp.width, bmp.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bmp.width * scale)
  canvas.height = Math.round(bmp.height * scale)
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height)
  bmp.close()
  const thumb = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.7))
  return URL.createObjectURL(thumb)
}

function newPage(blob: Blob, source: MarkPage['source'], width: number, height: number, thumbUrl: string): MarkPage {
  return { id: crypto.randomUUID(), source, imageBlob: blob, thumbUrl, width, height, rotation: 0, strokes: [], undone: [] }
}

async function imageToPage(file: File): Promise<MarkPage> {
  const { width, height } = await bitmapDims(file)
  const thumbUrl = await makeThumb(file)
  return newPage(file, 'image', width, height, thumbUrl)
}

async function pdfToPages(file: File): Promise<MarkPage[]> {
  const buf = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise
  const pages: MarkPage[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const pageObj = await pdf.getPage(i)
    const viewport = pageObj.getViewport({ scale: 2 }) // 2x for crisp marking
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    await pageObj.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise
    const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.9))
    const thumbUrl = await makeThumb(blob)
    pages.push(newPage(blob, 'pdf', canvas.width, canvas.height, thumbUrl))
  }
  return pages
}

/** Convert dropped files into MarkPages. Unsupported files are skipped. */
export async function ingestFiles(files: File[]): Promise<MarkPage[]> {
  const out: MarkPage[] = []
  for (const file of files) {
    if (file.type === 'application/pdf') {
      out.push(...(await pdfToPages(file)))
    } else if (file.type.startsWith('image/')) {
      out.push(await imageToPage(file))
    }
  }
  return out
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc -p tsconfig.app.json --noEmit`
Expected: no errors in the new files.

- [ ] **Step 4: Commit**

```bash
git add src/lib/pdfjs.ts src/lib/ingestFiles.ts
git commit -m "feat: file ingestion for images + pdf rasterization"
```

---

## Task 5: IndexedDB autosave persistence

**Files:**
- Create: `src/lib/markPersistence.ts`
- Test: `src/lib/markPersistence.test.ts`

Serializes a session (pages minus the live objectURL thumbs, which are rebuilt on load) to IndexedDB via idb-keyval. Strokes/order are plain JSON; blobs are stored directly (IndexedDB supports Blob).

- [ ] **Step 1: Write the failing test (mock idb-keyval)**

Create `src/lib/markPersistence.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- markPersistence`
Expected: FAIL — cannot find module `@/lib/markPersistence`.

- [ ] **Step 3: Implement `src/lib/markPersistence.ts`**

```ts
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- markPersistence`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/markPersistence.ts src/lib/markPersistence.test.ts
git commit -m "feat: indexeddb session autosave"
```

---

## Task 6: The zustand store

**Files:**
- Create: `src/store/markStore.ts`
- Test: `src/store/markStore.test.ts`

Wires the pure logic + persistence + ingestion into a single session store. `generatePdf` is added in Task 9 (stubbed here to keep the store compiling).

- [ ] **Step 1: Write the failing test**

Create `src/store/markStore.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- markStore`
Expected: FAIL — cannot find module `@/store/markStore`.

- [ ] **Step 3: Implement `src/store/markStore.ts`**

```ts
import { create } from 'zustand'
import type { MarkPage, Stroke, ToolMode } from '@/types/marking'
import { reorder, pushStroke, undoLast, redoLast } from '@/lib/pageOps'
import { ingestFiles } from '@/lib/ingestFiles'
import { saveSession, loadSession, clearSession } from '@/lib/markPersistence'

interface MarkState {
  studentId: string
  pages: MarkPage[]
  activePageId: string | null
  tool: { color: string; width: number; mode: ToolMode }
  status: 'idle' | 'saving' | 'generating'
  initSession: (studentId: string) => Promise<boolean> // returns true if a saved session was resumed
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

export const useMarkStore = create<MarkState>((set, get) => ({
  studentId: '',
  pages: [],
  activePageId: null,
  tool: { color: '#e11d48', width: 4, mode: 'pen' },
  status: 'idle',

  initSession: async (studentId) => {
    const saved = await loadSession(studentId)
    if (saved) {
      set({ studentId, pages: saved, activePageId: saved[0]?.id ?? null })
      return true
    }
    set({ studentId, pages: [], activePageId: null })
    return false
  },

  startFresh: async (studentId) => {
    await clearSession(studentId)
    set({ studentId, pages: [], activePageId: null })
  },

  addFiles: async (files) => {
    const added = await ingestFiles(files)
    set((s) => ({ pages: [...s.pages, ...added], activePageId: s.activePageId ?? added[0]?.id ?? null }))
    persist(get)
  },

  removePage: (id) => {
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
    const { studentId } = get()
    if (studentId) await clearSession(studentId)
    set({ pages: [], activePageId: null, studentId: '' })
  },
}))
```

Note: autosave is debounced at the call site in Task 7 via a subscription; the inline `persist` calls above keep the store coherent in tests and as a fallback. To avoid double-writes, the debounced subscription is the single source in the UI (Task 7 step) — the inline writes are cheap fire-and-forget and idempotent.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- markStore`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/store/markStore.ts src/store/markStore.test.ts
git commit -m "feat: worksheet marking zustand store"
```

---

## Task 7: Route, page shell, upload + reorder grid

**Files:**
- Create: `src/pages/teacher/MarkWorksheetPage.tsx`
- Create: `src/components/teacher/mark/PageUploadDropzone.tsx`
- Create: `src/components/teacher/mark/PageReorderGrid.tsx`
- Modify: `src/router/index.tsx` (add route + import)
- Modify: `src/pages/teacher/StudentViewPage.tsx` (add launch button)

- [ ] **Step 1: Create `PageUploadDropzone.tsx`**

```tsx
import { useRef } from 'react'
import { Upload } from 'lucide-react'

export default function PageUploadDropzone({ onFiles }: { onFiles: (files: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        onFiles(Array.from(e.dataTransfer.files))
      }}
      onClick={() => inputRef.current?.click()}
      className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 p-8 text-center cursor-pointer hover:border-[#6C63FF] transition-colors"
    >
      <Upload className="h-6 w-6 text-gray-400" />
      <p className="text-sm text-gray-600">Drop images or PDFs here, or click to choose</p>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          onFiles(Array.from(e.target.files ?? []))
          if (inputRef.current) inputRef.current.value = ''
        }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Create `PageReorderGrid.tsx`**

```tsx
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { RotateCw, Trash2, Pencil } from 'lucide-react'
import type { MarkPage } from '@/types/marking'

interface Props {
  pages: MarkPage[]
  onReorder: (from: number, to: number) => void
  onRotate: (id: string) => void
  onRemove: (id: string) => void
  onMark: (id: string) => void
}

export default function PageReorderGrid({ pages, onReorder, onRotate, onRemove, onMark }: Props) {
  const handleDragEnd = (r: DropResult) => {
    if (!r.destination) return
    onReorder(r.source.index, r.destination.index)
  }
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="pages" direction="horizontal">
        {(dp) => (
          <div ref={dp.innerRef} {...dp.droppableProps} className="flex flex-wrap gap-3">
            {pages.map((p, i) => (
              <Draggable key={p.id} draggableId={p.id} index={i}>
                {(dr) => (
                  <div
                    ref={dr.innerRef}
                    {...dr.draggableProps}
                    {...dr.dragHandleProps}
                    className="relative w-32 rounded-lg border bg-white shadow-sm overflow-hidden"
                  >
                    <div className="absolute left-1 top-1 z-10 rounded-full bg-black/60 px-2 text-xs text-white">{i + 1}</div>
                    <img
                      src={p.thumbUrl}
                      alt={`page ${i + 1}`}
                      className="h-40 w-full object-contain bg-gray-50"
                      style={{ transform: `rotate(${p.rotation}deg)` }}
                    />
                    <div className="flex justify-around border-t p-1 text-gray-500">
                      <button onClick={() => onMark(p.id)} title="Mark"><Pencil className="h-4 w-4 hover:text-[#6C63FF]" /></button>
                      <button onClick={() => onRotate(p.id)} title="Rotate"><RotateCw className="h-4 w-4 hover:text-[#6C63FF]" /></button>
                      <button onClick={() => onRemove(p.id)} title="Remove"><Trash2 className="h-4 w-4 hover:text-red-500" /></button>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {dp.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}
```

- [ ] **Step 3: Create `MarkWorksheetPage.tsx` (shell — Pages step; Mark step added in Task 8, PDF button wired in Task 9)**

```tsx
import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMarkStore } from '@/store/markStore'
import { saveSession } from '@/lib/markPersistence'
import PageUploadDropzone from '@/components/teacher/mark/PageUploadDropzone'
import PageReorderGrid from '@/components/teacher/mark/PageReorderGrid'

type Step = 'pages' | 'mark'

export default function MarkWorksheetPage() {
  const { id } = useParams<{ id: string }>()
  const { pages, addFiles, reorderPages, rotatePage, removePage, setActivePage, initSession, startFresh, studentId } = useMarkStore()
  const [step, setStep] = useState<Step>('pages')
  const [resumePrompt, setResumePrompt] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Session init + resume prompt
  useEffect(() => {
    if (!id) return
    initSession(id).then((resumed) => setResumePrompt(resumed))
  }, [id, initSession])

  // Debounced autosave on page changes (single source of truth for persistence)
  useEffect(() => {
    if (!studentId) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => { void saveSession(studentId, pages) }, 800)
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [pages, studentId])

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return
    toast.promise(addFiles(files), { loading: 'Processing files…', success: 'Pages added', error: 'Some files could not be read' })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="rounded-pill">
          <Link to={`/teacher/students/${id}`}><ArrowLeft className="h-4 w-4" /> Back</Link>
        </Button>
        <h1 className="text-lg font-semibold">Mark Worksheet</h1>
      </div>

      {resumePrompt && (
        <div className="flex items-center justify-between rounded-lg border bg-amber-50 px-4 py-2 text-sm">
          <span>Resumed a saved session ({pages.length} pages).</span>
          <Button size="sm" variant="outline" className="rounded-pill" onClick={() => { void startFresh(id!); setResumePrompt(false) }}>
            Start fresh
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        <Button size="sm" variant={step === 'pages' ? 'default' : 'outline'} className="rounded-pill" onClick={() => setStep('pages')}>Pages</Button>
        <Button size="sm" variant={step === 'mark' ? 'default' : 'outline'} className="rounded-pill" disabled={pages.length === 0} onClick={() => setStep('mark')}>Mark</Button>
      </div>

      {step === 'pages' && (
        <div className="space-y-4">
          <PageUploadDropzone onFiles={handleFiles} />
          <PageReorderGrid
            pages={pages}
            onReorder={reorderPages}
            onRotate={rotatePage}
            onRemove={removePage}
            onMark={(pid) => { setActivePage(pid); setStep('mark') }}
          />
        </div>
      )}

      {step === 'mark' && <div className="text-sm text-gray-500">Marking board added in next task.</div>}
    </div>
  )
}
```

- [ ] **Step 4: Add the route in `src/router/index.tsx`**

Add the import near the other teacher imports:

```tsx
import MarkWorksheetPage from '@/pages/teacher/MarkWorksheetPage'
```

Add the route inside the `/teacher` `children` array, after the `students/:id/marks` route:

```tsx
{ path: 'students/:id/mark', element: <MarkWorksheetPage /> },
```

- [ ] **Step 5: Add the launch button in `src/pages/teacher/StudentViewPage.tsx`**

Next to the existing `+ Assign Class` / `+ Assign Note` buttons (around line 137), add:

```tsx
<Button asChild size="sm" className="rounded-pill bg-[#6C63FF] hover:bg-[#5a52d5]">
  <Link to={`/teacher/students/${id}/mark`}>Mark Worksheet</Link>
</Button>
```

- [ ] **Step 6: Typecheck + run dev server**

Run: `npx tsc -p tsconfig.app.json --noEmit` (expect no errors)
Run: `npm run dev`, open a student, click **Mark Worksheet**, drop a few images and a PDF.
Expected: thumbnails appear, drag reorders them, rotate/remove work, refresh shows the "Resumed a saved session" banner.

- [ ] **Step 7: Commit**

```bash
git add src/pages/teacher/MarkWorksheetPage.tsx src/components/teacher/mark/ src/router/index.tsx src/pages/teacher/StudentViewPage.tsx
git commit -m "feat: mark worksheet page with upload + reorder grid"
```

---

## Task 8: Marking board (react-konva canvas + pen controls)

**Files:**
- Create: `src/components/teacher/mark/MarkCanvas.tsx`
- Create: `src/components/teacher/mark/PenControls.tsx`
- Create: `src/components/teacher/mark/MarkingBoard.tsx`
- Modify: `src/pages/teacher/MarkWorksheetPage.tsx` (render MarkingBoard in the `mark` step)

- [ ] **Step 1: Create `MarkCanvas.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Image as KonvaImage, Line } from 'react-konva'
import type Konva from 'konva'
import type { MarkPage, Stroke, ToolMode } from '@/types/marking'
import { normalizePoint, normalizeWidth, denormalizeStroke } from '@/lib/strokeGeometry'

const MAX_DISPLAY = 1100

interface Props {
  page: MarkPage
  tool: { color: string; width: number; mode: ToolMode }
  onCommitStroke: (stroke: Stroke) => void
}

export default function MarkCanvas({ page, tool, onCommitStroke }: Props) {
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [live, setLive] = useState<number[] | null>(null) // in-progress pixel points
  const drawing = useRef(false)
  const livePressureWidth = useRef(tool.width)

  // rotation-aware display size
  const rotated = page.rotation === 90 || page.rotation === 270
  const naturalW = rotated ? page.height : page.width
  const naturalH = rotated ? page.width : page.height
  const scale = Math.min(1, MAX_DISPLAY / Math.max(naturalW, naturalH))
  const dispW = Math.round(naturalW * scale)
  const dispH = Math.round(naturalH * scale)

  useEffect(() => {
    const url = URL.createObjectURL(page.imageBlob)
    const image = new window.Image()
    image.onload = () => setImg(image)
    image.src = url
    return () => URL.revokeObjectURL(url)
  }, [page.imageBlob])

  const handleDown = (e: Konva.KonvaEventObject<PointerEvent>) => {
    drawing.current = true
    const pos = e.target.getStage()!.getPointerPosition()!
    const pressure = e.evt.pressure && e.evt.pressure > 0 ? e.evt.pressure : 0.5
    livePressureWidth.current = tool.width * (0.5 + pressure)
    setLive([pos.x, pos.y])
  }

  const handleMove = (e: Konva.KonvaEventObject<PointerEvent>) => {
    if (!drawing.current) return
    const pos = e.target.getStage()!.getPointerPosition()!
    setLive((prev) => (prev ? [...prev, pos.x, pos.y] : [pos.x, pos.y]))
  }

  const handleUp = () => {
    if (!drawing.current || !live) { drawing.current = false; return }
    drawing.current = false
    // normalize pixel points (against display size) → 0..1
    const norm: number[] = []
    for (let i = 0; i < live.length; i += 2) {
      const [nx, ny] = normalizePoint(live[i], live[i + 1], dispW, dispH)
      norm.push(nx, ny)
    }
    onCommitStroke({
      points: norm,
      color: tool.color,
      width: normalizeWidth(livePressureWidth.current, dispW),
      mode: tool.mode,
    })
    setLive(null)
  }

  return (
    <div style={{ touchAction: 'none', width: dispW, height: dispH }} className="mx-auto border rounded-lg overflow-hidden bg-white">
      <Stage
        width={dispW}
        height={dispH}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerLeave={handleUp}
      >
        <Layer listening={false}>
          {img && (
            <KonvaImage
              image={img}
              width={page.width * scale}
              height={page.height * scale}
              rotation={page.rotation}
              offsetX={page.rotation === 180 || page.rotation === 90 ? page.width * scale : 0}
              offsetY={page.rotation === 180 || page.rotation === 270 ? page.height * scale : 0}
              x={page.rotation === 90 ? dispW : page.rotation === 180 ? dispW : 0}
              y={page.rotation === 270 ? dispH : page.rotation === 180 ? dispH : 0}
            />
          )}
        </Layer>
        <Layer>
          {page.strokes.map((s, i) => {
            const d = denormalizeStroke(s, dispW, dispH)
            return (
              <Line
                key={i}
                points={d.points}
                stroke={d.color}
                strokeWidth={d.width}
                tension={0.4}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={s.mode === 'eraser' ? 'destination-out' : 'source-over'}
              />
            )
          })}
          {live && (
            <Line
              points={live}
              stroke={tool.color}
              strokeWidth={livePressureWidth.current}
              tension={0.4}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={tool.mode === 'eraser' ? 'destination-out' : 'source-over'}
            />
          )}
        </Layer>
      </Stage>
    </div>
  )
}
```

Note on rotation: the image-layer offset/position math above renders the bitmap upright for each 90° step. If a rotation step looks off during manual verification (Step 5), the simplest robust fallback is to bake rotation into the blob at rotate-time instead; keep this in mind but prefer the Konva transform first.

- [ ] **Step 2: Create `PenControls.tsx`**

```tsx
import { Undo2, Redo2, Pen, Eraser } from 'lucide-react'
import type { ToolMode } from '@/types/marking'

const COLORS = ['#e11d48', '#2563eb', '#16a34a', '#000000']
const WIDTHS = [2, 4, 8]

interface Props {
  tool: { color: string; width: number; mode: ToolMode }
  onChange: (patch: Partial<Props['tool']>) => void
  onUndo: () => void
  onRedo: () => void
}

export default function PenControls({ tool, onChange, onUndo, onRedo }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-white p-2">
      <div className="flex gap-1">
        <button onClick={() => onChange({ mode: 'pen' })} className={`rounded-md p-1.5 ${tool.mode === 'pen' ? 'bg-[#6C63FF] text-white' : 'text-gray-600'}`}><Pen className="h-4 w-4" /></button>
        <button onClick={() => onChange({ mode: 'eraser' })} className={`rounded-md p-1.5 ${tool.mode === 'eraser' ? 'bg-[#6C63FF] text-white' : 'text-gray-600'}`}><Eraser className="h-4 w-4" /></button>
      </div>
      <div className="flex gap-1">
        {COLORS.map((c) => (
          <button key={c} onClick={() => onChange({ color: c, mode: 'pen' })} style={{ background: c }} className={`h-6 w-6 rounded-full border-2 ${tool.color === c && tool.mode === 'pen' ? 'border-[#6C63FF]' : 'border-transparent'}`} />
        ))}
      </div>
      <div className="flex items-center gap-1">
        {WIDTHS.map((w) => (
          <button key={w} onClick={() => onChange({ width: w })} className={`flex h-7 w-7 items-center justify-center rounded-md ${tool.width === w ? 'bg-gray-200' : ''}`}>
            <span className="rounded-full bg-black" style={{ width: w + 2, height: w + 2 }} />
          </button>
        ))}
      </div>
      <div className="ml-auto flex gap-1">
        <button onClick={onUndo} className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100"><Undo2 className="h-4 w-4" /></button>
        <button onClick={onRedo} className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100"><Redo2 className="h-4 w-4" /></button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `MarkingBoard.tsx`**

```tsx
import { Button } from '@/components/ui/button'
import { useMarkStore } from '@/store/markStore'
import MarkCanvas from './MarkCanvas'
import PenControls from './PenControls'

export default function MarkingBoard() {
  const { pages, activePageId, tool, setTool, setActivePage, addStroke, undo, redo } = useMarkStore()
  const active = pages.find((p) => p.id === activePageId) ?? pages[0]
  if (!active) return <p className="text-sm text-gray-500">Add pages first.</p>

  const idx = pages.findIndex((p) => p.id === active.id)
  return (
    <div className="space-y-3">
      <PenControls tool={tool} onChange={setTool} onUndo={() => undo(active.id)} onRedo={() => redo(active.id)} />
      <MarkCanvas page={active} tool={tool} onCommitStroke={(s) => addStroke(active.id, s)} />
      <div className="flex items-center justify-center gap-2">
        {pages.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setActivePage(p.id)}
            className={`h-12 w-9 overflow-hidden rounded border-2 ${p.id === active.id ? 'border-[#6C63FF]' : 'border-transparent'}`}
          >
            <img src={p.thumbUrl} alt={`page ${i + 1}`} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-gray-500">Page {idx + 1} of {pages.length}</p>
    </div>
  )
}
```

- [ ] **Step 4: Render `MarkingBoard` in `MarkWorksheetPage.tsx`**

Add the import:

```tsx
import MarkingBoard from '@/components/teacher/mark/MarkingBoard'
```

Replace the placeholder line:

```tsx
{step === 'mark' && <div className="text-sm text-gray-500">Marking board added in next task.</div>}
```

with:

```tsx
{step === 'mark' && <MarkingBoard />}
```

- [ ] **Step 5: Typecheck + manual verification**

Run: `npx tsc -p tsconfig.app.json --noEmit` (expect no errors)
Run: `npm run dev`. Upload an image, switch to **Mark**, draw with the mouse (and pen/touch if on iPad). Verify: smooth lines, color/thickness switch, undo/redo, eraser removes ink, page-strip switches pages, each page keeps its own strokes. Confirm a rotated page renders upright.

- [ ] **Step 6: Commit**

```bash
git add src/components/teacher/mark/MarkCanvas.tsx src/components/teacher/mark/PenControls.tsx src/components/teacher/mark/MarkingBoard.tsx src/pages/teacher/MarkWorksheetPage.tsx
git commit -m "feat: react-konva marking board with pen controls"
```

---

## Task 9: PDF generation, upload, and download

**Files:**
- Create: `src/lib/buildPdf.ts`
- Test: `src/lib/buildPdf.test.ts` (tests the pure page-ordering helper only)
- Create: `src/lib/exportWorksheet.ts`
- Modify: `src/pages/teacher/MarkWorksheetPage.tsx` (Generate PDF button + handler)

The order-mapping logic is unit-tested; the canvas rendering + pdf-lib embedding is verified manually.

- [ ] **Step 1: Write the failing test for page ordering**

Create `src/lib/buildPdf.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- buildPdf`
Expected: FAIL — cannot find module `@/lib/buildPdf`.

- [ ] **Step 3: Implement `src/lib/buildPdf.ts`**

```ts
import Konva from 'konva'
import { PDFDocument } from 'pdf-lib'
import type { MarkPage } from '@/types/marking'
import { denormalizeStroke } from '@/lib/strokeGeometry'

/** Pages render into the PDF in exactly their current grid order. */
export function renderOrder(pages: MarkPage[]): MarkPage[] {
  return pages.slice()
}

function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const image = new window.Image()
    image.onload = () => { URL.revokeObjectURL(url); resolve(image) }
    image.onerror = (e) => { URL.revokeObjectURL(url); reject(e) }
    image.src = url
  })
}

/** Render one page (full-res image + strokes) to a JPEG blob via an offscreen Konva stage. */
async function renderPageJpeg(page: MarkPage): Promise<Blob> {
  const img = await loadImage(page.imageBlob)
  const rotated = page.rotation === 90 || page.rotation === 270
  const w = rotated ? page.height : page.width
  const h = rotated ? page.width : page.height

  const container = document.createElement('div')
  const stage = new Konva.Stage({ container, width: w, height: h })

  const imgLayer = new Konva.Layer({ listening: false })
  imgLayer.add(new Konva.Image({
    image: img,
    width: page.width,
    height: page.height,
    rotation: page.rotation,
    x: page.rotation === 90 ? w : page.rotation === 180 ? w : 0,
    y: page.rotation === 270 ? h : page.rotation === 180 ? h : 0,
  }))
  stage.add(imgLayer)

  const strokeLayer = new Konva.Layer()
  for (const s of page.strokes) {
    const d = denormalizeStroke(s, w, h)
    strokeLayer.add(new Konva.Line({
      points: d.points,
      stroke: d.color,
      strokeWidth: d.width,
      tension: 0.4,
      lineCap: 'round',
      lineJoin: 'round',
      globalCompositeOperation: s.mode === 'eraser' ? 'destination-out' : 'source-over',
    }))
  }
  stage.add(strokeLayer)

  const blob = await stage.toBlob({ mimeType: 'image/jpeg', quality: 0.85 }) as Blob
  stage.destroy()
  return blob
}

/**
 * Build a single PDF from the ordered pages. Reports progress (0..1).
 * Bad pages are skipped (onSkip called) so one corrupt page can't abort the export.
 */
export async function buildPdf(
  pages: MarkPage[],
  onProgress?: (done: number, total: number) => void,
  onSkip?: (pageId: string) => void,
): Promise<Uint8Array> {
  const ordered = renderOrder(pages)
  const pdf = await PDFDocument.create()
  let done = 0
  for (const page of ordered) {
    try {
      const jpeg = await renderPageJpeg(page)
      const bytes = new Uint8Array(await jpeg.arrayBuffer())
      const embedded = await pdf.embedJpg(bytes)
      const pdfPage = pdf.addPage([embedded.width, embedded.height])
      pdfPage.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height })
    } catch {
      onSkip?.(page.id)
    }
    onProgress?.(++done, ordered.length)
  }
  return pdf.save()
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- buildPdf`
Expected: PASS, 2 tests.

- [ ] **Step 5: Implement `src/lib/exportWorksheet.ts` (upload + record + download)**

```ts
import { supabase } from '@/lib/supabase'
import { buildPdf } from '@/lib/buildPdf'
import type { MarkPage } from '@/types/marking'

function triggerDownload(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

interface ExportResult { uploaded: boolean; skipped: string[] }

/**
 * Build the PDF, upload to Supabase, record the row, and download locally.
 * Throws on upload/db failure so the caller can keep the local session for retry.
 */
export async function exportWorksheet(
  studentId: string,
  pages: MarkPage[],
  title: string,
  onProgress?: (done: number, total: number) => void,
): Promise<ExportResult> {
  const skipped: string[] = []
  const bytes = await buildPdf(pages, onProgress, (id) => skipped.push(id))

  const path = `${crypto.randomUUID()}.pdf`
  const { error: uploadError } = await supabase.storage
    .from('marked-worksheets')
    .upload(path, new Blob([bytes], { type: 'application/pdf' }))
  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage.from('marked-worksheets').getPublicUrl(path)

  const { error: dbError } = await supabase.from('marked_worksheets').insert({
    student_id: studentId,
    title,
    file_url: publicUrl,
    page_count: pages.length,
  })
  if (dbError) throw dbError

  triggerDownload(bytes, `${title || 'worksheet'}.pdf`)
  return { uploaded: true, skipped }
}
```

- [ ] **Step 6: Wire the Generate PDF button in `MarkWorksheetPage.tsx`**

Add imports:

```tsx
import { exportWorksheet } from '@/lib/exportWorksheet'
import { clearSession } from '@/lib/markPersistence'
```

Add local state near the other `useState` calls:

```tsx
const [generating, setGenerating] = useState(false)
```

Add the handler inside the component:

```tsx
const handleGenerate = async () => {
  if (!id || pages.length === 0) return
  setGenerating(true)
  try {
    const title = `Marked Worksheet ${new Date().toLocaleDateString()}`
    const { skipped } = await exportWorksheet(id, pages, title)
    if (skipped.length) toast.warning(`${skipped.length} page(s) could not be rendered and were skipped`)
    await clearSession(id)
    useMarkStore.getState().endSession()
    toast.success('PDF generated, uploaded, and downloaded')
  } catch (e) {
    toast.error('Upload failed — your work is saved, please retry: ' + (e as Error).message)
  } finally {
    setGenerating(false)
  }
}
```

Add the button in the header row (next to the `<h1>`):

```tsx
<Button
  size="sm"
  className="ml-auto rounded-pill bg-[#6C63FF] hover:bg-[#5a52d5]"
  disabled={pages.length === 0 || generating}
  onClick={handleGenerate}
>
  {generating ? 'Generating…' : 'Generate PDF'}
</Button>
```

- [ ] **Step 7: Typecheck + manual end-to-end verification**

Run: `npx tsc -p tsconfig.app.json --noEmit` (expect no errors)
Run: `npm run dev`. Upload images + a PDF, reorder, mark several pages, click **Generate PDF**. Verify: a PDF downloads with pages in grid order and ink baked in at full resolution; a row appears in Supabase `marked_worksheets`; the file is in the `marked-worksheets` bucket; the session clears afterward.

- [ ] **Step 8: Commit**

```bash
git add src/lib/buildPdf.ts src/lib/buildPdf.test.ts src/lib/exportWorksheet.ts src/pages/teacher/MarkWorksheetPage.tsx
git commit -m "feat: generate, upload, and download marked worksheet pdf"
```

---

## Task 10: Student-side "Marked Work" view

**Files:**
- Create: `src/pages/student/MarkedWorkPage.tsx`
- Modify: `src/router/index.tsx` (route + import)
- Modify: `src/components/layout/StudentLayout.tsx` (nav link)

Lets the student see and open their marked worksheets, mirroring the notes UX.

- [ ] **Step 1: Create `MarkedWorkPage.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { FileText } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Skeleton } from '@/components/ui/skeleton'
import type { MarkedWorksheetRow } from '@/types/marking'

export default function MarkedWorkPage() {
  const { user } = useAuthStore()
  const [rows, setRows] = useState<MarkedWorksheetRow[] | null>(null)

  useEffect(() => {
    if (!user) return
    supabase
      .from('marked_worksheets')
      .select('*')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setRows((data as MarkedWorksheetRow[]) ?? []))
  }, [user])

  if (!rows) return <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>

  return (
    <div className="space-y-3">
      <h1 className="text-lg font-semibold">Marked Work</h1>
      {rows.length === 0 && <p className="py-8 text-center text-muted-foreground">No marked worksheets yet</p>}
      {rows.map((r) => (
        <a key={r.id} href={r.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border bg-white p-3 hover:border-[#6C63FF]">
          <FileText className="h-5 w-5 text-[#6C63FF]" />
          <div className="flex-1">
            <p className="text-sm font-medium">{r.title ?? 'Marked Worksheet'}</p>
            <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()} · {r.page_count ?? '?'} pages</p>
          </div>
        </a>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Add the route in `src/router/index.tsx`**

Add the import:

```tsx
import MarkedWorkPage from '@/pages/student/MarkedWorkPage'
```

Add inside the `/student` `children` array (after `marks` or `notes`):

```tsx
{ path: 'marked-work', element: <MarkedWorkPage /> },
```

- [ ] **Step 3: Add the nav link in `src/components/layout/StudentLayout.tsx`**

Find the existing student nav items (the array/list of links to `/student/notes`, `/student/recordings`, etc.) and add an entry following the exact same shape used there, for example:

```tsx
{ to: '/student/marked-work', label: 'Marked Work', icon: FileText },
```

Ensure `FileText` is imported from `lucide-react` at the top of the file (add it to the existing import if not present).

- [ ] **Step 4: Typecheck + manual verification**

Run: `npx tsc -p tsconfig.app.json --noEmit` (expect no errors)
Run: `npm run dev`, log in as the student whose worksheet you generated in Task 9, open **Marked Work**, confirm the worksheet is listed and opens the PDF.

- [ ] **Step 5: Commit**

```bash
git add src/pages/student/MarkedWorkPage.tsx src/router/index.tsx src/components/layout/StudentLayout.tsx
git commit -m "feat: student marked work view"
```

---

## Final Verification

- [ ] Run the full test suite: `npm test` — expected: all tests pass (strokeGeometry, pageOps, markPersistence, markStore, buildPdf, smoke).
- [ ] Run typecheck: `npx tsc -p tsconfig.app.json --noEmit` — expected: no errors.
- [ ] Run lint: `npm run lint` — expected: no new errors in added files.
- [ ] Full manual run-through: upload images + PDF → reorder → mark with pen/eraser/colors → undo/redo → Generate PDF → verify download, Supabase row, bucket file, and student-side visibility.

---

## Self-Review Notes

**Spec coverage:**
- Bulk upload + drag sort → Tasks 4, 7 (ingestFiles, PageUploadDropzone, PageReorderGrid w/ @hello-pangea/dnd). ✓
- Canvas marking, smooth lines, undo/redo, color/thickness → Tasks 3, 8 (pageOps, MarkCanvas/PenControls, Konva tension lines). ✓
- Pen/touch/mouse unified + pressure → Task 8 (Pointer Events + `evt.pressure`, `touch-action: none`). ✓
- Generate PDF flatten + optimize + download → Task 9 (buildPdf offscreen full-res Konva + pdf-lib JPEG embed + triggerDownload). ✓
- Upload to Supabase + attach to student → Tasks 1, 9 (bucket/table, exportWorksheet). ✓
- Student views it → Task 10. ✓
- Local autosave / resume → Tasks 5, 6, 7 (markPersistence, store, debounced subscription + resume prompt). ✓
- Performance on high-res images → Task 8 (display downscale, cached non-listening image layer, live-stroke-only layer) + Task 9 (full-res only at export). ✓

**Type consistency:** `Stroke`, `MarkPage`, `ToolMode`, `MarkedWorksheetRow` defined once in `src/types/marking.ts` and reused everywhere. Store action names (`addStroke`, `undo`, `redo`, `reorderPages`, `rotatePage`, `removePage`, `setActivePage`, `setTool`, `endSession`, `initSession`, `startFresh`) are consistent between `markStore.ts` and its consumers. `denormalizeStroke`/`normalizePoint`/`normalizeWidth` signatures match between definition (Task 2) and uses (Tasks 8, 9).

**Placeholder scan:** No TBD/TODO; every code step shows complete code. The one deferred detail (StudentLayout nav item shape) instructs following the existing pattern in that file rather than guessing its exact prop names — intentional, since that file's nav structure isn't quoted here.
