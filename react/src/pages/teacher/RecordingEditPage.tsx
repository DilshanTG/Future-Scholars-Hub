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

export default function RecordingEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ topic: '', link: '', description: '' })

  useEffect(() => {
    supabase.from('recordings').select('*').eq('id', id!).single().then(({ data }) => {
      if (data) setForm({ topic: data.topic ?? '', link: data.link ?? '', description: data.description ?? '' })
      setLoading(false)
    })
  }, [id])

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('recordings').update({ topic: form.topic, link: form.link, description: form.description || null }).eq('id', id!)
    setSaving(false)
    if (error) toast.error(error.message)
    else { toast.success('Recording updated'); navigate('/teacher/recordings') }
  }

  if (loading) return <div className="max-w-xl mx-auto space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-64 rounded-2xl" /></div>

  return (
    <div className="max-w-xl mx-auto">
      <PageHeader title="Edit Recording" backTo="/teacher/recordings" />
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <div className="space-y-2">
          <Label>Topic *</Label>
          <Input value={form.topic} onChange={(e) => set('topic', e.target.value)} required className="rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label>Video Link *</Label>
          <Input type="url" value={form.link} onChange={(e) => set('link', e.target.value)} required className="rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} className="rounded-xl" rows={3} />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={saving} className="rounded-pill bg-[#6C63FF] hover:bg-[#5a52d5] flex-1">{saving ? 'Saving...' : 'Save Changes'}</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/teacher/recordings')} className="rounded-pill">Cancel</Button>
        </div>
      </form>
    </div>
  )
}
