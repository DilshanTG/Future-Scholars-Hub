import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export default function NoteEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', link: '', details: '' })

  useEffect(() => {
    supabase.from('notes').select('*').eq('id', id!).single().then(({ data }) => {
      if (data) setForm({ title: data.title ?? '', link: data.link ?? '', details: data.details ?? '' })
      setLoading(false)
    })
  }, [id])

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('notes').update({ title: form.title, link: form.link || null, details: form.details || null }).eq('id', id!)
    setSaving(false)
    if (error) toast.error(error.message)
    else { toast.success('Note updated'); navigate('/teacher/notes') }
  }

  if (loading) return <div className="max-w-xl mx-auto space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-64 rounded-2xl" /></div>

  return (
    <div className="max-w-xl mx-auto">
      <PageHeader title="Edit Note" backTo="/teacher/notes" />
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <div className="space-y-2">
          <Label>Title *</Label>
          <Input value={form.title} onChange={(e) => set('title', e.target.value)} required className="rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label>Link</Label>
          <Input type="url" value={form.link} onChange={(e) => set('link', e.target.value)} className="rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label>Details</Label>
          <Textarea value={form.details} onChange={(e) => set('details', e.target.value)} className="rounded-xl" rows={4} />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={saving} className="rounded-pill bg-[#6C63FF] hover:bg-[#5a52d5] flex-1">{saving ? 'Saving...' : 'Save Changes'}</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/teacher/notes')} className="rounded-pill">Cancel</Button>
        </div>
      </form>
    </div>
  )
}
