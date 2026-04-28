import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { getMarkStyle, pct } from '@/lib/markStyle'
import { colomboFormat } from '@/lib/dates'
import { useConfetti } from '@/hooks/useConfetti'
import { toast } from 'sonner'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import type { Mark } from '@/types'

export default function StudentMarksPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { fire: fireConfetti } = useConfetti()

  const [studentName, setStudentName] = useState('')
  const [marks, setMarks] = useState<Mark[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Add form
  const [form, setForm] = useState({ title: '', score: '', total: '100' })

  // Inline edit
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ title: '', score: '', total: '' })

  useEffect(() => {
    async function load() {
      const [{ data: s }, { data: m }] = await Promise.all([
        supabase.from('students').select('name').eq('id', id!).single(),
        supabase.from('marks').select('*').eq('student_id', id!).order('created_at', { ascending: false }),
      ])
      setStudentName(s?.name ?? '')
      setMarks(m ?? [])
      setLoading(false)
    }
    load()
  }, [id])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const score = parseFloat(form.score)
    const total = parseFloat(form.total)
    if (isNaN(score) || isNaN(total) || total <= 0) {
      toast.error('Enter valid score and total')
      return
    }
    if (score > total) { toast.error('Score cannot exceed total'); return }
    setSaving(true)
    const { data, error } = await supabase.from('marks')
      .insert({ student_id: id, title: form.title.trim(), score, total })
      .select('*').single()
    setSaving(false)
    if (error) { toast.error(error.message); return }
    setMarks((prev) => [data, ...prev])
    setForm({ title: '', score: '', total: '100' })
    fireConfetti()
    toast.success('Mark added!')
  }

  const startEdit = (m: Mark) => {
    setEditId(m.id)
    setEditForm({ title: m.title, score: String(m.score), total: String(m.total) })
  }

  const saveEdit = async (m: Mark) => {
    const score = parseFloat(editForm.score)
    const total = parseFloat(editForm.total)
    if (isNaN(score) || isNaN(total) || total <= 0 || score > total) {
      toast.error('Invalid values'); return
    }
    const { error } = await supabase.from('marks')
      .update({ title: editForm.title.trim(), score, total })
      .eq('id', m.id)
    if (error) { toast.error(error.message); return }
    setMarks((prev) => prev.map((x) => x.id === m.id ? { ...x, title: editForm.title.trim(), score, total } : x))
    setEditId(null)
    toast.success('Updated')
  }

  const deleteMark = async (markId: string) => {
    const { error } = await supabase.from('marks').delete().eq('id', markId)
    if (error) { toast.error(error.message); return }
    setMarks((prev) => prev.filter((m) => m.id !== markId))
    toast.success('Deleted')
  }

  if (loading) return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title={`Marks — ${studentName}`} backTo={`/teacher/students/${id}`} />

      {/* Add form */}
      <form onSubmit={handleAdd} className="bg-white rounded-2xl shadow-sm p-5 mb-5 space-y-4">
        <h3 className="font-semibold text-gray-700">Add New Mark</h3>
        <div className="space-y-2">
          <Label>Test / Subject Title *</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
            className="rounded-xl"
            placeholder="e.g. Mathematics — Chapter 5"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Score *</Label>
            <Input
              type="number" min="0" step="0.5"
              value={form.score}
              onChange={(e) => setForm((f) => ({ ...f, score: e.target.value }))}
              required className="rounded-xl" placeholder="85"
            />
          </div>
          <div className="space-y-2">
            <Label>Out of *</Label>
            <Input
              type="number" min="1" step="0.5"
              value={form.total}
              onChange={(e) => setForm((f) => ({ ...f, total: e.target.value }))}
              required className="rounded-xl" placeholder="100"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={saving} className="rounded-pill bg-[#6C63FF] hover:bg-[#5a52d5] flex-1">
            {saving ? 'Adding...' : '+ Add Mark'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(`/teacher/students/${id}`)} className="rounded-pill">
            Back
          </Button>
        </div>
      </form>

      {/* Marks list */}
      {marks.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-2">📝</p>
          <p>No marks added yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {marks.map((m) => {
            const style = getMarkStyle(m.score, m.total)
            const percent = pct(m.score, m.total)
            const isEditing = editId === m.id
            return (
              <div key={m.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Color bar top */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${style.gradient}`} />
                <div className="p-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <Input
                        value={editForm.title}
                        onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                        className="rounded-xl font-medium"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input type="number" value={editForm.score} onChange={(e) => setEditForm((f) => ({ ...f, score: e.target.value }))} className="rounded-xl" placeholder="Score" />
                        <Input type="number" value={editForm.total} onChange={(e) => setEditForm((f) => ({ ...f, total: e.target.value }))} className="rounded-xl" placeholder="Total" />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveEdit(m)} className="rounded-lg bg-green-500 hover:bg-green-600 gap-1"><Check className="w-3.5 h-3.5" />Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditId(null)} className="rounded-lg gap-1"><X className="w-3.5 h-3.5" />Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{m.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{colomboFormat(m.created_at, 'PPp')}</p>
                        {/* Progress bar */}
                        <div className="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div className={`h-full rounded-full ${style.bar} transition-all duration-700`} style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="text-right">
                          <span className="text-xl font-bold text-gray-800">{m.score}</span>
                          <span className="text-sm text-muted-foreground">/{m.total}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${style.badge}`}>
                          {style.emoji} {percent}% · {style.label}
                        </span>
                        <div className="flex gap-1 mt-1">
                          <button onClick={() => startEdit(m)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteMark(m.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
