# Worksheet Marking Workflow — Design

**Date:** 2026-06-14
**Status:** Approved (design), pending implementation plan

## Problem

The teacher grades student work through a manual, multi-step flow: students send photos/PDFs via WhatsApp → transfer to iPad → reorder pages → open in an editor → mark answers → export PDF → send back via WhatsApp. Too many manual steps and devices. We want a single dashboard inside the existing React app that handles upload → reorder → mark → export.

## Goals

- Bulk-upload student images and PDFs in one place.
- Reorder/arrange pages into the correct sequence via a draggable grid.
- Mark each page directly with a stylus/pen/mouse on a canvas (smooth lines, undo/redo, color/thickness).
- One-click "Generate PDF": flatten strokes onto correctly-ordered full-res pages, bundle into an optimized PDF, upload to the backend, attach to the student, and download a local copy.
- Keep performance high with high-resolution images.
- Never lose in-progress work on refresh/crash.

## Decisions (from brainstorming)

| Question | Decision |
|---|---|
| Session persistence | **Hybrid** — local autosave to IndexedDB; no server upload of working images |
| Input file types | **Images + PDFs** (PDFs rasterized to page images via pdf.js) |
| Marking device | **Both** — unified Pointer Events for pen/touch/mouse |
| Output integration | **Linked to student** — launched from a student page |
| Final PDF destination | **Upload to Supabase + student views it in-app**, plus local download |
| Canvas approach | **B — Konva / react-konva** (scene-graph, room to add shapes/text later) |

## New Dependencies

- `konva` + `react-konva` — marking canvas (layers, free-draw, transforms)
- `pdfjs-dist` — rasterize incoming PDFs to page images
- `@hello-pangea/dnd` — draggable reorder grid
- `pdf-lib` — assemble the final PDF (embeds JPEGs at full res, compress/optimize)
- `idb-keyval` — tiny IndexedDB wrapper for autosave

## Routing & Entry Point

Nested under existing student routes:

```
/teacher/students/:id/mark   → MarkWorksheetPage
```

Add a **"Mark Worksheet"** action button on `src/pages/teacher/StudentViewPage.tsx`, alongside the existing assign-class / assign-note actions. `:id` scopes the session and is where the finished PDF attaches.

## Component Tree

```
MarkWorksheetPage (route container; owns session lifecycle)
├── MarkToolbar              ← step switcher (Pages | Mark), Generate-PDF button, save status
├── PageUploadDropzone       ← drag/drop + file picker; images & PDFs
│     └── (pdf.js worker rasterizes PDFs → page images)
├── PageReorderGrid          ← @hello-pangea/dnd grid of thumbnails
│     └── PageThumbCard      ← thumbnail, page #, delete, rotate, "mark" affordance
└── MarkingBoard             ← shown when a page is selected
      ├── MarkCanvas         ← react-konva Stage: Image layer + Stroke layer
      ├── PenControls        ← color swatches, thickness, pen/eraser, undo/redo
      └── PageStrip          ← horizontal mini-nav to jump between pages
```

Two logical steps share one session: **Pages** (upload + arrange) and **Mark** (per-page canvas). The toolbar toggles them; data is shared so switching never loses work.

## State Management

A dedicated zustand store (`src/store/markStore.ts`), matching the `authStore` pattern. Vector strokes live in the store — not React state — so high-frequency pen updates don't re-render the tree.

```ts
interface MarkPage {
  id: string                 // uuid
  source: 'image' | 'pdf'
  imageBlob: Blob            // full-res original (persisted in IndexedDB)
  thumbUrl: string           // small objectURL for the grid
  width: number; height: number   // natural pixel dims
  rotation: 0 | 90 | 180 | 270
  strokes: Stroke[]
  undone: Stroke[]           // redo stack
}

interface Stroke {
  points: number[]           // normalized [x0,y0,x1,y1,…] in 0–1 space
  color: string
  width: number              // normalized to page width
  mode: 'pen' | 'eraser'
}

interface MarkState {
  studentId: string
  pages: MarkPage[]
  activePageId: string | null
  tool: { color: string; width: number; mode: 'pen' | 'eraser' }
  status: 'idle' | 'saving' | 'generating'
  // actions
  addFiles(files: File[]): Promise<void>
  removePage(id: string): void
  reorderPages(from: number, to: number): void
  rotatePage(id: string): void
  setActivePage(id: string | null): void
  addStroke(pageId: string, stroke: Stroke): void
  undo(pageId: string): void
  redo(pageId: string): void
  clearSession(): void
  generatePdf(): Promise<void>
}
```

**Rationale:**
- **Strokes normalized 0–1** → resolution-independent. Same data renders crisp on the small editing canvas and on the full-res export canvas — no re-scaling math, no quality loss.
- **`undone` stack per page** → undo/redo are array moves.
- Konva draws strokes from the active page's `strokes`; an in-progress stroke is local `useRef` state, committed to the store on pointer-up (no store thrash mid-drag).

**Autosave:** a debounced (~800 ms) store subscription writes the session to IndexedDB via `idb-keyval` under key `mark-session:{studentId}`. Image blobs persist once; only stroke/order metadata rewrites on change. On mount, if a saved session exists → offer "Resume". This is the refresh-safety guarantee, no backend cost.

## Canvas & Performance (react-konva)

Core rule: **never repaint the heavy image while drawing.**

- **Two Konva layers** in one `Stage`:
  - Layer 1 — single `Konva.Image` of the page. `listening={false}`, never touched during drawing → Konva caches it and skips it on stroke redraws.
  - Layer 2 — strokes (`Konva.Line` with `tension={0.4}`, `lineCap`/`lineJoin="round"`). Only this layer redraws per pointer move.
- **Display downscale:** Stage renders at a capped display size (fit-to-viewport, ~1200px max), not the photo's native resolution. Full-res only exists in the stored blob, used once at export.
- **Unified Pointer Events** (`onPointerDown/Move/Up`) cover pen, touch, mouse in one path. Use `evt.pressure` to modulate `Stroke.width` for Apple Pencil. Set `touch-action: none` on the Stage container for palm/scroll rejection.
- **rAF batching:** accumulate points and `layer.batchDraw()` once per frame, not per event.
- **Eraser:** `globalCompositeOperation="destination-out"` strokes on the stroke layer — no pixel hit-testing.

## Generate PDF

On click (`status → 'generating'`), for each page **in grid order**:
1. Create an offscreen `Konva.Stage` at full native resolution (the blob's real dims, accounting for rotation).
2. Draw the full-res image + replay that page's strokes (denormalized to full-res). One render, off-DOM.
3. `stage.toBlob({ mimeType: 'image/jpeg', quality: 0.85 })` → compressed page image.
4. `pdf-lib`: embed each JPEG on its own correctly-sized page.

Then upload + record, mirroring `NoteAddPage`:

```
supabase.storage.from('marked-worksheets').upload(path, pdfBytes)
→ getPublicUrl
→ supabase.from('marked_worksheets').insert({ student_id, file_url, page_count, title })
```

Then `triggerDownload(pdfBytes)` (local copy for WhatsApp) and clear the IndexedDB session. Heavy work runs page-by-page with a progress indicator so the UI never locks.

## Supabase Schema (new)

Storage bucket `marked-worksheets` (public, like `note-files`).

```sql
create table marked_worksheets (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  title text,
  file_url text not null,
  page_count int,
  created_at timestamptz default now()
);
```

No join table — one student per worksheet (launched from their page). Student side: a **"Marked Work"** list (on dashboard or notes area) reading `marked_worksheets where student_id = me`, opening `file_url` — same UX as notes.

## Error Handling

- **Upload failure:** toast + keep the local session intact (don't clear IndexedDB until upload confirms) so the teacher can retry — same defensive pattern as note upload.
- **Corrupt image / PDF page:** skip the bad page with a toast, continue the rest.
- **Large sessions:** cap pixel dimensions on embed; warn if total output > ~25 MB.

## Testing

Unit-test the pure logic where correctness bugs hide:
- stroke normalize/denormalize round-trip
- page reorder
- undo/redo stack transitions
- PDF page ordering (grid order → PDF order)

Canvas rendering stays manual/visual.

## Out of Scope (YAGNI)

- Text/shape annotations (Konva leaves room to add later).
- WhatsApp send integration (teacher sends manually; PDF also downloads).
- Server-side image storage of working pages (local autosave only).
- Multi-teacher collaboration on a session.
