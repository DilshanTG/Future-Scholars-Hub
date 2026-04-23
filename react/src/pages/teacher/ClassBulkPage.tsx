import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { BulkClassEntry, Student } from '@/types'

const emptyEntry = (): BulkClassEntry => ({ topic: '', class_date: '', class_time: '', zoom_link: '', teacher_note: '' })

export default function ClassBulkPage() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState<BulkClassEntry[]>([emptyEntry()])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('students').select('*').eq('status', 'active').eq('archived', false).order('name').then(({ data }) => {
      setStudents(data ?? [])
      setLoading(false)
    })
  }, [])

  const updateEntry = (i: number, key: keyof BulkClassEntry, value: string) => {
    setEntries((prev) => prev.map((e, idx) => idx === i ? { ...e, [key]: value } : e))
  }

  const toggleStudent = (id: string) => {
    setSelectedStudents((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selectedStudents.size === students.length) setSelectedStudents(new Set())
    else setSelectedStudents(new Set(students.map((s) => s.id)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const classRows = entries.map((entry) => ({
      topic: entry.topic,
      class_date: `${entry.class_date}T${entry.class_time || '00:00'}:00`,
      zoom_link: entry.zoom_link || null,
      teacher_note: entry.teacher_note || null,
    }))

    const { data: created, error } = await supabase.from('classes').insert(classRows).select('id')
    if (error) { toast.error(error.message); setSaving(false); return }

    if (selectedStudents.size > 0 && created) {
      const assignments = created.flatMap((c: { id: string }) =>
        Array.from(selectedStudents).map((sid) => ({ class_id: c.id, student_id: sid }))
      )
      await supabase.from('class_assignments').insert(assignments)
    }

    toast.success(`${entries.length} class${entries.length > 1 ? 'es' : ''} created`)
    navigate('/teacher/classes')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title="Bulk Add Classes" backTo="/teacher/classes" />
      <form onSubmit={handleSubmit} className="space-y-4">
        {entries.map((entry, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-gray-700">Class {i + 1}</p>
              {entries.length > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => setEntries((prev) => prev.filter((_, idx) => idx !== i))} className="h-8 w-8 text-red-400 hover:text-red-600 rounded-lg">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs">Topic *</Label>
                <Input value={entry.topic} onChange={(e) => updateEntry(i, 'topic', e.target.value)} required className="rounded-xl" placeholder="Topic" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Date *</Label>
                <Input type="date" value={entry.class_date} onChange={(e) => updateEntry(i, 'class_date', e.target.value)} required className="rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Time</Label>
                <Input type="time" value={entry.class_time} onChange={(e) => updateEntry(i, 'class_time', e.target.value)} className="rounded-xl" />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs">Zoom Link</Label>
                <Input type="url" value={entry.zoom_link} onChange={(e) => updateEntry(i, 'zoom_link', e.target.value)} className="rounded-xl" placeholder="https://zoom.us/j/..." />
              </div>
            </div>
          </div>
        ))}

        <Button type="button" variant="outline" onClick={() => setEntries((prev) => [...prev, emptyEntry()])} className="w-full rounded-xl border-dashed gap-2">
          <Plus className="h-4 w-4" />Add Another Class
        </Button>

        {/* Student selection */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">Assign to Students (optional)</h3>
            <button type="button" onClick={selectAll} className="text-xs text-[#6C63FF] hover:underline">
              {selectedStudents.size === students.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          {loading ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-xl" />)}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-64 overflow-y-auto">
              {students.map((s) => (
                <label key={s.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer">
                  <Checkbox checked={selectedStudents.has(s.id)} onCheckedChange={() => toggleStudent(s.id)} />
                  <span className="text-sm">{s.avatar} {s.name}</span>
                </label>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">{selectedStudents.size} student{selectedStudents.size !== 1 ? 's' : ''} selected</p>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving} className="rounded-pill bg-[#6C63FF] hover:bg-[#5a52d5] flex-1">
            {saving ? 'Creating...' : `Create ${entries.length} Class${entries.length > 1 ? 'es' : ''}`}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/teacher/classes')} className="rounded-pill">Cancel</Button>
        </div>
      </form>
    </div>
  )
}
