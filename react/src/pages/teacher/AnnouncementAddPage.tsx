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
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import type { Student } from '@/types'

export default function AnnouncementAddPage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [sendTo, setSendTo] = useState<'all' | 'specific'>('all')
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [form, setForm] = useState({ title: '', message: '', expire_date: '' })
  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  useEffect(() => {
    supabase.from('students').select('*').eq('status', 'active').eq('archived', false).order('name').then(({ data }) => {
      setStudents(data ?? [])
      setLoadingStudents(false)
    })
  }, [])

  const toggle = (id: string) => setSelectedStudents((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sendTo === 'specific' && selectedStudents.size === 0) {
      toast.error('Select at least one student')
      return
    }
    setSaving(true)

    const { data: ann, error } = await supabase.from('announcements').insert({
      title: form.title,
      message: form.message,
      expire_date: form.expire_date || null,
    }).select('id').single()

    if (error) { toast.error(error.message); setSaving(false); return }

    if (sendTo === 'all') {
      await supabase.from('announcement_assignments').insert({ announcement_id: ann.id, student_id: null })
    } else {
      const rows = Array.from(selectedStudents).map((sid) => ({ announcement_id: ann.id, student_id: sid }))
      await supabase.from('announcement_assignments').insert(rows)
    }

    toast.success('Announcement sent')
    navigate('/teacher/announcements')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="New Announcement" backTo="/teacher/announcements" />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input value={form.title} onChange={(e) => set('title', e.target.value)} required className="rounded-xl" placeholder="Announcement title" />
          </div>
          <div className="space-y-2">
            <Label>Message *</Label>
            <Textarea value={form.message} onChange={(e) => set('message', e.target.value)} required className="rounded-xl" rows={4} placeholder="Announcement content..." />
          </div>
          <div className="space-y-2">
            <Label>Expiry Date (optional)</Label>
            <Input type="date" value={form.expire_date} onChange={(e) => set('expire_date', e.target.value)} className="rounded-xl" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-3">Send To</h3>
          <div className="flex gap-3 mb-4">
            <button
              type="button"
              onClick={() => setSendTo('all')}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium border transition-all ${sendTo === 'all' ? 'bg-[#6C63FF] text-white border-[#6C63FF]' : 'border-gray-200 text-gray-600 hover:border-[#6C63FF]'}`}
            >
              All Students
            </button>
            <button
              type="button"
              onClick={() => setSendTo('specific')}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium border transition-all ${sendTo === 'specific' ? 'bg-[#6C63FF] text-white border-[#6C63FF]' : 'border-gray-200 text-gray-600 hover:border-[#6C63FF]'}`}
            >
              Specific Students
            </button>
          </div>

          {sendTo === 'specific' && (
            loadingStudents ? (
              <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-xl" />)}</div>
            ) : (
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {students.map((s) => (
                  <label key={s.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer">
                    <Checkbox checked={selectedStudents.has(s.id)} onCheckedChange={() => toggle(s.id)} />
                    <AvatarCircle emoji={s.avatar} size="sm" />
                    <span className="text-sm text-gray-800">{s.name}</span>
                  </label>
                ))}
              </div>
            )
          )}
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving} className="rounded-pill bg-[#6C63FF] hover:bg-[#5a52d5] flex-1">{saving ? 'Sending...' : 'Send Announcement'}</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/teacher/announcements')} className="rounded-pill">Cancel</Button>
        </div>
      </form>
    </div>
  )
}
