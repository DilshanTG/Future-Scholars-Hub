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
