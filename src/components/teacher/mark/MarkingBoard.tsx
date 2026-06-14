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
