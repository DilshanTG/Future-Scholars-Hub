import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import type { Note } from '@/types'

export default function StudentAssignNotePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [notes, setNotes] = useState<Note[]>([])
  const [assigned, setAssigned] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const [{ data: nts }, { data: existing }] = await Promise.all([
        supabase.from('notes').select('*').order('created_at', { ascending: false }),
        supabase.from('note_assignments').select('note_id').eq('student_id', id!),
      ])
      setNotes(nts ?? [])
      setAssigned(new Set((existing ?? []).map((e: { note_id: string }) => e.note_id)))
      setLoading(false)
    }
    load()
  }, [id])

  const toggle = (noteId: string) => {
    setAssigned((prev) => {
      const next = new Set(prev)
      if (next.has(noteId)) next.delete(noteId)
      else next.add(noteId)
      return next
    })
  }

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('note_assignments').delete().eq('student_id', id!)
    if (assigned.size > 0) {
      const rows = Array.from(assigned).map((note_id) => ({ note_id, student_id: id! }))
      const { error } = await supabase.from('note_assignments').insert(rows)
      if (error) { toast.error(error.message); setSaving(false); return }
    }
    toast.success('Notes updated')
    navigate(`/teacher/students/${id}`)
  }

  if (loading) return <div className="max-w-2xl mx-auto space-y-3"><Skeleton className="h-10 w-48" /><Skeleton className="h-64 rounded-2xl" /></div>

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Assign Notes" backTo={`/teacher/students/${id}`} />
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-2 mb-4">
        {notes.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No notes available</p>
        ) : (
          notes.map((n) => (
            <label key={n.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer">
              <Checkbox checked={assigned.has(n.id)} onCheckedChange={() => toggle(n.id)} />
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-800">{n.title}</p>
                {n.details && <p className="text-xs text-muted-foreground line-clamp-1">{n.details}</p>}
              </div>
            </label>
          ))
        )}
      </div>
      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving} className="rounded-pill bg-[#6C63FF] hover:bg-[#5a52d5] flex-1">
          {saving ? 'Saving...' : `Save (${assigned.size} selected)`}
        </Button>
        <Button variant="outline" onClick={() => navigate(`/teacher/students/${id}`)} className="rounded-pill">Cancel</Button>
      </div>
    </div>
  )
}
