import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import type { Note } from '@/types'

export default function StudentNotesPage() {
  const { user } = useAuthStore()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [inactive, setInactive] = useState(false)

  useEffect(() => {
    if (!user) return
    async function load() {
      const { data: student } = await supabase.from('students').select('status').eq('id', user!.id).single()
      if (student?.status === 'inactive') { setInactive(true); setLoading(false); return }
      const { data } = await supabase
        .from('notes')
        .select('*, note_assignments!inner(student_id)')
        .eq('note_assignments.student_id', user!.id)
        .order('created_at', { ascending: false })
      setNotes(data ?? [])
      setLoading(false)
    }
    load()
  }, [user])

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-4">Study Notes</h1>
      {inactive && (
        <Alert variant="destructive" className="rounded-xl mb-4">
          <AlertDescription>Your account is inactive. Contact your teacher to access study materials.</AlertDescription>
        </Alert>
      )}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
      ) : !inactive && notes.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground"><p className="text-4xl mb-2">📝</p><p>No notes assigned yet</p></div>
      ) : !inactive ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {notes.map((n) => (
            <div key={n.id} className="bg-white rounded-2xl shadow-sm p-4 card-hover">
              <h3 className="font-semibold text-gray-800">{n.title}</h3>
              {n.details && <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{n.details}</p>}
              {n.link && (
                <a href={n.link} target="_blank" rel="noopener noreferrer" className="text-sm text-[#6C63FF] hover:underline mt-2 inline-block font-medium">
                  Open Note →
                </a>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
