import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

export default function AnnouncementAddPage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', message: '', expire_date: '' })
  const [sendTo, setSendTo] = useState<'all' | 'specific'>('all')

  const [students, setStudents] = useState<Student[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [availableGrades, setAvailableGrades] = useState<string[]>([])
  const [gradeFilter, setGradeFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loadingStudents, setLoadingStudents] = useState(true)

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  useEffect(() => {
    supabase.from('students').select('*').eq('status', 'active').eq('archived', false).order('name').then(({ data }) => {
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
    if (sendTo === 'specific' && selected.size === 0) { toast.error('Select at least one student'); return }
    setSaving(true)

    const { data: ann, error } = await supabase.from('announcements')
      .insert({ title: form.title, message: form.message, expire_date: form.expire_date || null })
      .select('id').single()

    if (error) { toast.error(error.message); setSaving(false); return }

    if (sendTo === 'all') {
      await supabase.from('announcement_assignments').insert({ announcement_id: ann.id, student_id: null })
    } else {
      await supabase.from('announcement_assignments').insert(
        Array.from(selected).map((sid) => ({ announcement_id: ann.id, student_id: sid }))
      )
    }

    toast.success(sendTo === 'all' ? 'Sent to all students' : `Sent to ${selected.size} student${selected.size > 1 ? 's' : ''}`)
    navigate('/teacher/announcements')
  }

  const allFilteredSelected = filtered.length > 0 && filtered.every((s) => selected.has(s.id))

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="New Announcement" backTo="/teacher/announcements" />
      <form onSubmit={handleSubmit} className="space-y-4">

        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-700">Announcement Details</h3>
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input value={form.title} onChange={(e) => set('title', e.target.value)} required className="rounded-xl" placeholder="Announcement title" />
          </div>
          <div className="space-y-2">
            <Label>Message *</Label>
            <Textarea value={form.message} onChange={(e) => set('message', e.target.value)} required className="rounded-xl" rows={4} placeholder="Announcement content..." />
          </div>
          <div className="space-y-2">
            <Label>Expiry Date <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input type="date" value={form.expire_date} onChange={(e) => set('expire_date', e.target.value)} className="rounded-xl" />
          </div>
        </div>

        {/* Audience */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-700">Send To</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {sendTo === 'all' ? 'All active students' : selected.size > 0 ? `${selected.size} selected` : 'Choose specific students'}
              </p>
            </div>
            {sendTo === 'specific' && filtered.length > 0 && (
              <button type="button" onClick={selectAll} className="text-xs text-[#6C63FF] hover:underline font-medium">
                {allFilteredSelected ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>

          {/* Toggle */}
          <div className="flex gap-2 mb-4">
            {(['all', 'specific'] as const).map((opt) => (
              <button key={opt} type="button" onClick={() => setSendTo(opt)}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium border transition-all ${sendTo === opt ? 'bg-[#6C63FF] text-white border-[#6C63FF]' : 'border-gray-200 text-gray-600 hover:border-[#6C63FF]'}`}>
                {opt === 'all' ? '👥 All Students' : '🎯 Specific Students'}
              </button>
            ))}
          </div>

          {sendTo === 'specific' && (
            <>
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
                <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
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
            </>
          )}
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving} className="rounded-pill bg-[#6C63FF] hover:bg-[#5a52d5] flex-1">
            {saving ? 'Sending...' : sendTo === 'all' ? 'Send to All Students' : `Send to ${selected.size} Student${selected.size !== 1 ? 's' : ''}`}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/teacher/announcements')} className="rounded-pill">Cancel</Button>
        </div>
      </form>
    </div>
  )
}
