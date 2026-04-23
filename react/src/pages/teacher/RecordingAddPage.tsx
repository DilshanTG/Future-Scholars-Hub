import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export default function RecordingAddPage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ topic: '', link: '', description: '' })
  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('recordings').insert({ topic: form.topic, link: form.link, description: form.description || null })
    setSaving(false)
    if (error) toast.error(error.message)
    else { toast.success('Recording added'); navigate('/teacher/recordings') }
  }

  return (
    <div className="max-w-xl mx-auto">
      <PageHeader title="Add Recording" backTo="/teacher/recordings" />
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <div className="space-y-2">
          <Label>Topic *</Label>
          <Input value={form.topic} onChange={(e) => set('topic', e.target.value)} required className="rounded-xl" placeholder="Recording topic" />
        </div>
        <div className="space-y-2">
          <Label>Video Link *</Label>
          <Input type="url" value={form.link} onChange={(e) => set('link', e.target.value)} required className="rounded-xl" placeholder="https://youtube.com/..." />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} className="rounded-xl" rows={3} />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={saving} className="rounded-pill bg-[#6C63FF] hover:bg-[#5a52d5] flex-1">{saving ? 'Saving...' : 'Add Recording'}</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/teacher/recordings')} className="rounded-pill">Cancel</Button>
        </div>
      </form>
    </div>
  )
}
