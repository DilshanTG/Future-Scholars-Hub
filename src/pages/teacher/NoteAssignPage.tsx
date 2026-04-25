import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { colomboMonth, colomboYear } from '@/lib/dates'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/shared/PageHeader'
import { StudentFilter } from '@/components/shared/StudentFilter'
import { AvatarCircle } from '@/components/shared/AvatarCircle'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import type { Student } from '@/types'

export default function NoteAssignPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [students, setStudents] = useState<Student[]>([])
  const [assigned, setAssigned] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [grade, setGrade] = useState('all')
  const [status, setStatus] = useState('all')
  const [payment, setPayment] = useState('all')

  useEffect(() => {
    async function load() {
      const month = colomboMonth()
      const year = colomboYear()
      const [{ data: sts }, { data: existing }] = await Promise.all([
        supabase.from('students').select('*, payments!left(status, month, year)').eq('archived', false).order('name'),
        supabase.from('note_assignments').select('student_id').eq('note_id', id!),
      ])
      const enriched = (sts ?? []).map((s) => {
        const p = (s.payments ?? []).find((p: { month: string; year: number }) => p.month === month && p.year === year)
        return { ...s, payment_status: p?.status ?? 'unpaid', payments: undefined }
      })
      setStudents(enriched)
      setAssigned(new Set((existing ?? []).map((e: { student_id: string }) => e.student_id)))
      setLoading(false)
    }
    load()
  }, [id])

  const filtered = students.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.mobile.includes(search)
    const matchGrade = grade === 'all' || s.grade === grade
    const matchStatus = status === 'all' || s.status === status
    const matchPayment = payment === 'all' || s.payment_status === payment
    return matchSearch && matchGrade && matchStatus && matchPayment
  })

  const toggle = (sid: string) => setAssigned((prev) => { const next = new Set(prev); if (next.has(sid)) next.delete(sid); else next.add(sid); return next })

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('note_assignments').delete().eq('note_id', id!)
    if (assigned.size > 0) {
      const rows = Array.from(assigned).map((student_id) => ({ note_id: id!, student_id }))
      const { error } = await supabase.from('note_assignments').insert(rows)
      if (error) { toast.error(error.message); setSaving(false); return }
    }
    toast.success('Assignments updated')
    navigate('/teacher/notes')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Assign Note to Students" backTo="/teacher/notes" />
      <StudentFilter search={search} grade={grade} status={status} payment={payment} onSearchChange={setSearch} onGradeChange={setGrade} onStatusChange={setStatus} onPaymentChange={setPayment} />
      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-2 space-y-1 mb-4">
          {filtered.map((s) => (
            <label key={s.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer">
              <Checkbox checked={assigned.has(s.id)} onCheckedChange={() => toggle(s.id)} />
              <AvatarCircle emoji={s.avatar} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-800">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.grade}</p>
              </div>
              <Badge className={`text-xs ${s.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{s.payment_status}</Badge>
            </label>
          ))}
        </div>
      )}
      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving} className="rounded-pill bg-[#6C63FF] hover:bg-[#5a52d5] flex-1">{saving ? 'Saving...' : `Save (${assigned.size} assigned)`}</Button>
        <Button variant="outline" onClick={() => navigate('/teacher/notes')} className="rounded-pill">Cancel</Button>
      </div>
    </div>
  )
}
