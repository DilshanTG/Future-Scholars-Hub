import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/shared/PageHeader'
import { AvatarPicker } from '@/components/shared/AvatarPicker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { GRADES, DISTRICTS } from '@/lib/constants'
import { toast } from 'sonner'
import type { Student } from '@/types'

export default function StudentEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Partial<Student>>({})

  useEffect(() => {
    supabase.from('students').select('*').eq('id', id!).single().then(({ data }) => {
      if (data) setForm(data)
      setLoading(false)
    })
  }, [id])

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('students').update({
      name: form.name,
      grade: form.grade,
      gender: form.gender,
      district: form.district,
      description: form.description,
      teacher_note: form.teacher_note,
      avatar: form.avatar,
      status: form.status,
    }).eq('id', id!)
    setSaving(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Student updated')
      navigate(`/teacher/students/${id}`)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Edit Student" backTo={`/teacher/students/${id}`} />

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input value={form.name ?? ''} onChange={(e) => set('name', e.target.value)} required className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Mobile</Label>
            <Input value={form.mobile ?? ''} disabled className="rounded-xl bg-gray-50" />
          </div>
          <div className="space-y-2">
            <Label>Grade *</Label>
            <Select value={form.grade ?? ''} onValueChange={(v) => set('grade', v)}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>{GRADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select value={form.gender ?? ''} onValueChange={(v) => set('gender', v)}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>District</Label>
            <Select value={form.district ?? ''} onValueChange={(v) => set('district', v)}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>{DISTRICTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status ?? 'active'} onValueChange={(v) => set('status', v)}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} className="rounded-xl" rows={2} />
        </div>
        <div className="space-y-2">
          <Label>Teacher Note</Label>
          <Textarea value={form.teacher_note ?? ''} onChange={(e) => set('teacher_note', e.target.value)} className="rounded-xl bg-yellow-50" rows={2} />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Avatar — current: {form.avatar}</Label>
          <AvatarPicker value={form.avatar ?? ''} onChange={(v) => set('avatar', v)} />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={saving} className="rounded-pill bg-[#6C63FF] hover:bg-[#5a52d5] flex-1">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(`/teacher/students/${id}`)} className="rounded-pill">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
