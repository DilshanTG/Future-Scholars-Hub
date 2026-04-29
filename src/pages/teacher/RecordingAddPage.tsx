import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConfetti } from '@/hooks/useConfetti'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/shared/PageHeader'
import { AvatarCircle } from '@/components/shared/AvatarCircle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import type { Student } from '@/types'

export default function RecordingAddPage() {
  const navigate = useNavigate()
  const { fire: fireConfetti } = useConfetti()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ topic: '', link: '', description: '', meeting_password: '' })

  const [students, setStudents] = useState<Student[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [availableGrades, setAvailableGrades] = useState<string[]>([])
  const [gradeFilter, setGradeFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loadingStudents, setLoadingStudents] = useState(true)

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  useEffect(() => {
    supabase.from('students').select('*').eq('archived', false).order('name').then(({ data }) => {
      setStudents(data ?? [])
      setAvailableGrades([...new Set((data ?? []).map((s) => s.grade))].sort())
      setLoadingStudents(false)
    })
  }, [])

  const filtered = students.filter((s) => {
    const matchGrade = gradeFilter === 'all' || s.grade === gradeFilter
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.mobile.includes(search)
    return matchGrade && matchSearch
  })

  const toggle = (id: string) =>
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })

  const selectAll = () => {
    const ids = filtered.map((s) => s.id)
    const allSel = ids.every((id) => selected.has(id))
    setSelected((prev) => { const next = new Set(prev); ids.forEach((id) => allSel ? next.delete(id) : next.add(id)); return next })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { data: rec, error } = await supabase.from('recordings')
      .insert({ topic: form.topic, link: form.link, description: form.description || null, meeting_password: form.meeting_password || null })
      .select('id').single()

    if (error) { toast.error(error.message); setSaving(false); return }

    if (selected.size > 0) {
      await supabase.from('recording_assignments').insert(
        Array.from(selected).map((student_id) => ({ recording_id: rec.id, student_id }))
      )
    }

    fireConfetti()
    toast.success(`Recording added${selected.size > 0 ? ` and assigned to ${selected.size} student${selected.size > 1 ? 's' : ''}` : ''}`)
    navigate('/teacher/recordings')
  }

  const allFilteredSelected = filtered.length > 0 && filtered.every((s) => selected.has(s.id))

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Add Recording" backTo="/teacher/recordings" />
      <form onSubmit={handleSubmit} className="space-y-4">

        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-700">Recording Details</h3>
          <div className="space-y-2">
            <Label>Topic *</Label>
            <Input value={form.topic} onChange={(e) => set('topic', e.target.value)} required className="rounded-xl" placeholder="Recording topic" />
          </div>
          <div className="space-y-2">
            <Label>Video Link *</Label>
            <Input type="url" value={form.link} onChange={(e) => set('link', e.target.value)} required className="rounded-xl" placeholder="https://youtube.com/..." />
          </div>
          <div className="space-y-2">
            <Label>Meeting Password <span className="text-muted-foreground font-normal text-xs">(optional)</span></Label>
            <Input value={form.meeting_password} onChange={(e) => set('meeting_password', e.target.value)} className="rounded-xl" placeholder="e.g. 123456" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} className="rounded-xl" rows={3} />
          </div>
        </div>

        {/* Student assignment */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-700">Assign Students</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selected.size > 0 ? `${selected.size} selected` : 'Optional — can assign later'}
              </p>
            </div>
            {filtered.length > 0 && (
              <button type="button" onClick={selectAll} className="text-xs text-[#6C63FF] hover:underline font-medium">
                {allFilteredSelected ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>
          <div className="flex gap-2 mb-3">
            <input type="text" placeholder="Search by name or mobile..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="flex-1 h-9 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30" />
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-32 rounded-xl h-9 text-sm"><SelectValue placeholder="Grade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {availableGrades.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {loadingStudents ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-11 rounded-xl" />)}</div>
          ) : (
            <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
              {filtered.map((s) => (
                <label key={s.id} className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${selected.has(s.id) ? 'bg-purple-50 border border-[#6C63FF]/20' : 'hover:bg-gray-50'}`}>
                  <Checkbox checked={selected.has(s.id)} onCheckedChange={() => toggle(s.id)} />
                  <AvatarCircle emoji={s.avatar} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800 truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.mobile}</p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">{s.grade}</Badge>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving} className="rounded-pill bg-[#6C63FF] hover:bg-[#5a52d5] flex-1">
            {saving ? 'Saving...' : selected.size > 0 ? `Add & Assign ${selected.size} Student${selected.size > 1 ? 's' : ''}` : 'Add Recording'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/teacher/recordings')} className="rounded-pill">Cancel</Button>
        </div>
      </form>
    </div>
  )
}
