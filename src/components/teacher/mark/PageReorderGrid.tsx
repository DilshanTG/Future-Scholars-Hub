import { useEffect, useState } from 'react'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { RotateCw, Trash2, Pencil, ZoomIn } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import type { MarkPage } from '@/types/marking'

interface Props {
  pages: MarkPage[]
  onReorder: (from: number, to: number) => void
  onRotate: (id: string) => void
  onRemove: (id: string) => void
  onMark: (id: string) => void
}

export default function PageReorderGrid({ pages, onReorder, onRotate, onRemove, onMark }: Props) {
  const [viewPage, setViewPage] = useState<MarkPage | null>(null)
  const [viewUrl, setViewUrl] = useState<string | null>(null)

  // Build a full-resolution object URL for the lightbox; revoke when it changes/closes.
  useEffect(() => {
    if (!viewPage) {
      setViewUrl(null)
      return
    }
    const url = URL.createObjectURL(viewPage.imageBlob)
    setViewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [viewPage])

  const handleDragEnd = (r: DropResult) => {
    if (!r.destination) return
    onReorder(r.source.index, r.destination.index)
  }

  return (
    <>
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
                        <button onClick={() => setViewPage(p)} title="View"><ZoomIn className="h-4 w-4 hover:text-[#6C63FF]" /></button>
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

      <Dialog open={!!viewPage} onOpenChange={(open) => { if (!open) setViewPage(null) }}>
        <DialogContent className="max-w-[92vw] sm:max-w-3xl bg-black/95 border-none p-2">
          <DialogTitle className="sr-only">Page preview</DialogTitle>
          {viewUrl && (
            <img
              src={viewUrl}
              alt="page preview"
              className="mx-auto max-h-[82vh] max-w-full object-contain"
              style={{ transform: `rotate(${viewPage?.rotation ?? 0}deg)` }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
