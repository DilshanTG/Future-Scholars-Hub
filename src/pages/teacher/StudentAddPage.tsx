import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { FunctionsHttpError } from '@supabase/supabase-js'
import { PageHeader } from '@/components/shared/PageHeader'
import { AvatarPicker } from '@/components/shared/AvatarPicker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { GRADES, DISTRICTS, getRandomAvatar, generateStudentPassword } from '@/lib/constants'
import { useConfetti } from '@/hooks/useConfetti'
import { toast } from 'sonner'

export default function StudentAddPage() {
  const navigate = useNavigate()
  const { fire: fireConfetti } = useConfetti()
  const [saving, setSaving] = useState(false)
  const [password] = useState(() => generateStudentPassword())
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({
    name: '', mobile: '', grade: '', gender: 'Male' as 'Male' | 'Female' | 'Other',
    district: '', description: '', teacher_note: '',
    avatar: getRandomAvatar('Male'),
  })

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const setMobile = (v: string) => {
    const cleaned = v.replace(/\D/g, '').substring(0, 10)
    setForm((f) => ({ ...f, mobile: cleaned }))
  }

  const handleGenderChange = (v: string) => {
    setForm((f) => ({ ...f, gender: v as 'Male' | 'Female' | 'Other', avatar: getRandomAvatar(v) }))
  }

  const copyPassword = () => {
    navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.mobile.length !== 10) {
      toast.error('Mobile number must be exactly 10 digits')
      setSaving(false)
      return
    }
    setSaving(true)

    // Force-refresh so we always send a non-expired access token
    const { data: refreshed } = await supabase.auth.refreshSession()
    const session = refreshed.session
    if (!session) {
      toast.error('Session expired. Please log in again.')
      setSaving(false)
      return
    }

    const { data, error } = await supabase.functions.invoke('create-student', {
      body: {
        mobile: form.mobile,
        name: form.name,
        grade: form.grade,
        gender: form.gender,
        district: form.district,
        description: form.description || null,
        teacher_note: form.teacher_note || null,
        avatar: form.avatar,
        password,
      },
      headers: { Authorization: `Bearer ${session.access_token}` },
    })

    setSaving(false)
    if (error) {
      let message = 'Failed to add student'
      if (error instanceof FunctionsHttpError) {
        try {
          const body = await error.context.json()
          message = body.error ?? body.message ?? message
        } catch {}
      } else {
        message = error.message
      }
      toast.error(message)
    } else if (data?.error) {
      toast.error(data.error)
    } else {
      fireConfetti()
      toast.success('Student added successfully')
      navigate('/teacher/students')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Add Student" backTo="/teacher/students" />

      {/* Auto-generated password card */}
      <div className="mb-4 rounded-2xl border-2 border-purple-200 bg-purple-50 p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-purple-500 uppercase tracking-wide mb-1">Auto-generated Password</p>
          <p className="text-2xl font-bold text-purple-700 tracking-wide">{password}</p>
          <p className="text-xs text-purple-400 mt-1">Share this with the student — they log in with their mobile number.</p>
        </div>
        <button
          type="button"
          onClick={copyPassword}
          className="shrink-0 rounded-xl border border-purple-300 bg-white px-3 py-2 text-sm font-medium text-purple-600 hover:bg-purple-100 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} required className="rounded-xl" placeholder="Student name" />
          </div>
          <div className="space-y-2">
            <Label>Mobile Number *</Label>
            <Input
              value={form.mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
              className="rounded-xl"
              placeholder="07XXXXXXXX"
              type="tel"
              maxLength={10}
            />
            <p className="text-[10px] text-muted-foreground px-1">Exactly 10 digits required (e.g. 0771234567)</p>
          </div>
          <div className="space-y-2">
            <Label>Grade *</Label>
            <Select value={form.grade} onValueChange={(v) => set('grade', v)} required>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select grade" /></SelectTrigger>
              <SelectContent>
                {GRADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Gender *</Label>
            <Select value={form.gender} onValueChange={handleGenderChange}>
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
            <Select value={form.district} onValueChange={(v) => set('district', v)}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select district" /></SelectTrigger>
              <SelectContent>
                {DISTRICTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} className="rounded-xl" rows={2} placeholder="Optional notes about the student" />
        </div>

        <div className="space-y-2">
          <Label>Teacher Note</Label>
          <Textarea value={form.teacher_note} onChange={(e) => set('teacher_note', e.target.value)} className="rounded-xl bg-yellow-50" rows={2} placeholder="Private note (visible only to teacher)" />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Avatar <span className="text-sm font-normal text-muted-foreground">— current: {form.avatar}</span></Label>
          <AvatarPicker value={form.avatar} onChange={(v) => set('avatar', v)} />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={saving} className="rounded-pill bg-[#6C63FF] hover:bg-[#5a52d5] flex-1">
            {saving ? 'Saving...' : 'Add Student'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/teacher/students')} className="rounded-pill">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
