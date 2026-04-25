import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { FunctionsHttpError } from '@supabase/supabase-js'
import { PageHeader } from '@/components/shared/PageHeader'
import { AvatarPicker } from '@/components/shared/AvatarPicker'
import { InviteDialog } from '@/components/shared/InviteDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { GRADES, DISTRICTS, generateStudentPassword } from '@/lib/constants'
import { toast } from 'sonner'
import type { Student } from '@/types'

export default function StudentEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [form, setForm] = useState<Partial<Student>>({})

  useEffect(() => {
    supabase.from('students').select('*').eq('id', id!).single().then(({ data }) => {
      if (data) setForm(data)
      setLoading(false)
    })
  }, [id])

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const setMobile = (v: string) => {
    const cleaned = v.replace(/\D/g, '').substring(0, 10)
    setForm((f) => ({ ...f, mobile: cleaned }))
  }

  const handleResetPassword = async () => {
    const newPassword = generateStudentPassword()
    setResetting(true)
    try {
      const { data: refreshed } = await supabase.auth.refreshSession()
      const session = refreshed.session
      if (!session) { toast.error('Session expired. Please log in again.'); return }

      const { data, error } = await supabase.functions.invoke('reset-password', {
        body: { student_id: id, password: newPassword },
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (error) {
        let msg = 'Failed to reset password'
        if (error instanceof FunctionsHttpError) {
          try { const b = await error.context.json(); msg = b.error ?? b.message ?? msg } catch {}
        }
        toast.error(msg)
      } else if (data?.error) {
        toast.error(data.error)
      } else {
        setForm((f) => ({ ...f, login_password: newPassword }))
        toast.success(`Password reset to: ${newPassword}`)
      }
    } finally {
      setResetting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.mobile && form.mobile.length !== 10) {
      toast.error('Mobile number must be exactly 10 digits')
      setSaving(false)
      return
    }
    setSaving(true)
    const { error } = await supabase.from('students').update({
      mobile: form.mobile,
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
            <Label>Mobile Number *</Label>
            <Input 
              value={form.mobile ?? ''} 
              onChange={(e) => setMobile(e.target.value)} 
              required 
              className="rounded-xl" 
              maxLength={10}
            />
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

        <Separator />

        {/* Password section */}
        <div className="space-y-3">
          <Label>Login Password</Label>
          <div className="flex items-center gap-3 rounded-xl border bg-gray-50 px-4 py-3">
            <span className="flex-1 font-mono text-sm tracking-wide text-gray-700">
              {form.login_password ?? <span className="text-muted-foreground italic">No password saved</span>}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={resetting}
              onClick={handleResetPassword}
              className="rounded-lg text-orange-600 border-orange-200 hover:bg-orange-50 shrink-0"
            >
              {resetting ? 'Resetting...' : '🔄 Reset Password'}
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowInvite(true)}
            className="rounded-lg text-[#6C63FF] border-[#6C63FF]/30 hover:bg-[#6C63FF]/10"
          >
            💬 Send Invite
          </Button>
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

      <InviteDialog
        student={showInvite && form.id ? (form as Student) : null}
        onClose={() => setShowInvite(false)}
        onPasswordReset={(_, newPwd) => setForm((f) => ({ ...f, login_password: newPwd }))}
      />
    </div>
  )
}
