import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { colomboFormat } from '@/lib/dates'
import { toast } from 'sonner'
import type { Class } from '@/types'

export default function StudentAssignClassPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [classes, setClasses] = useState<Class[]>([])
  const [assigned, setAssigned] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const [{ data: cls }, { data: existing }] = await Promise.all([
        supabase.from('classes').select('*').order('class_date', { ascending: false }),
        supabase.from('class_assignments').select('class_id').eq('student_id', id!),
      ])
      setClasses(cls ?? [])
      setAssigned(new Set((existing ?? []).map((e: { class_id: string }) => e.class_id)))
      setLoading(false)
    }
    load()
  }, [id])

  const toggle = (classId: string) => {
    setAssigned((prev) => {
      const next = new Set(prev)
      if (next.has(classId)) next.delete(classId)
      else next.add(classId)
      return next
    })
  }

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('class_assignments').delete().eq('student_id', id!)
    if (assigned.size > 0) {
      const rows = Array.from(assigned).map((class_id) => ({ class_id, student_id: id! }))
      const { error } = await supabase.from('class_assignments').insert(rows)
      if (error) { toast.error(error.message); setSaving(false); return }
    }
    toast.success('Classes updated')
    navigate(`/teacher/students/${id}`)
  }

  if (loading) return <div className="max-w-2xl mx-auto space-y-3"><Skeleton className="h-10 w-48" /><Skeleton className="h-64 rounded-2xl" /></div>

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Assign Classes" backTo={`/teacher/students/${id}`} />
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-2 mb-4">
        {classes.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No classes available</p>
        ) : (
          classes.map((c) => (
            <label key={c.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer">
              <Checkbox checked={assigned.has(c.id)} onCheckedChange={() => toggle(c.id)} />
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-800">{c.topic}</p>
                <p className="text-xs text-muted-foreground">{colomboFormat(c.class_date, 'PPp')}</p>
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
