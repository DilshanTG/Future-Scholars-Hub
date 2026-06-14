import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, Link2 } from 'lucide-react'
import type { Note, NoteCategory } from '@/types'

export default function StudentNotesPage() {
  const { user } = useAuthStore()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [inactive, setInactive] = useState(false)
  const [tab, setTab] = useState<NoteCategory>('note')

  const visible = notes.filter((n) => (n.category ?? 'note') === tab)

  useEffect(() => {
    if (!user) return
    async function load() {
      const { data: student } = await supabase.from('students').select('status').eq('id', user!.id).single()
      if (student?.status === 'inactive') { setInactive(true); setLoading(false); return }
      const { data } = await supabase.from('notes').select('*, note_assignments!inner(student_id)')
        .eq('note_assignments.student_id', user!.id).order('created_at', { ascending: false })
      setNotes(data ?? [])
      setLoading(false)
    }
    load()
  }, [user])

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Notes & Papers 📝</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your assigned study materials</p>
      </div>

      {!inactive && (
        <Tabs value={tab} onValueChange={(v) => setTab(v as NoteCategory)} className="mb-4">
          <TabsList className="rounded-pill">
            <TabsTrigger value="note" className="rounded-pill">Notes</TabsTrigger>
            <TabsTrigger value="paper" className="rounded-pill">Papers</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {inactive && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3 mb-4">
          Your account is inactive. Contact your teacher to access study materials.
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
      ) : !inactive && visible.length === 0 ? (
        <div className="text-center py-16"><p className="text-4xl mb-2">📝</p><p className="text-muted-foreground">No {tab === 'paper' ? 'papers' : 'notes'} assigned yet</p></div>
      ) : !inactive ? (
        <div className="space-y-3">
          {visible.map((n) => (
            <div key={n.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#6C63FF]/10 flex items-center justify-center shrink-0 text-lg">📄</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800">{n.title}</h3>
                  {n.details && <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{n.details}</p>}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {n.file_url && (
                      <a href={n.file_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#6C63FF] text-white px-3 py-1.5 rounded-xl hover:bg-[#5a52d5] transition-colors">
                        <Download className="w-3 h-3" />Download
                      </a>
                    )}
                    {n.link && (
                      <a href={n.link} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold border border-[#6C63FF] text-[#6C63FF] px-3 py-1.5 rounded-xl hover:bg-purple-50 transition-colors">
                        <Link2 className="w-3 h-3" />Open Link
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
