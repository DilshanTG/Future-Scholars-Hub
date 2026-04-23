import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/shared/PageHeader'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { Note } from '@/types'

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()

  const fetchNotes = async () => {
    setLoading(true)
    const { data } = await supabase.from('notes').select('*, note_assignments(count)').order('created_at', { ascending: false })
    setNotes((data ?? []).map((n) => ({ ...n, assigned_count: n.note_assignments?.[0]?.count ?? 0 })))
    setLoading(false)
  }

  useEffect(() => { fetchNotes() }, [])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    const { error } = await supabase.from('notes').delete().eq('id', deleteId)
    setDeleting(false); setDeleteId(null)
    if (error) toast.error('Failed to delete note')
    else { toast.success('Note deleted'); fetchNotes() }
  }

  return (
    <div>
      <PageHeader
        title="Notes"
        action={<Button asChild className="rounded-pill bg-[#6C63FF] hover:bg-[#5a52d5]"><Link to="/teacher/notes/add"><Plus className="h-4 w-4 mr-1" />Add Note</Link></Button>}
      />
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
      ) : notes.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground"><p className="text-4xl mb-2">📝</p><p>No notes yet</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {notes.map((n) => (
            <div key={n.id} className="bg-white rounded-2xl shadow-sm p-4 card-hover">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">{n.title}</h3>
                  {n.details && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{n.details}</p>}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {n.file_url && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">📎 File attached</span>}
                    {n.link && <a href={n.link} target="_blank" rel="noopener noreferrer" className="text-xs text-[#6C63FF] hover:underline">🔗 Link</a>}
                    <Badge variant="outline" className="text-xs">{n.assigned_count} students</Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg shrink-0"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem onClick={() => navigate(`/teacher/notes/${n.id}/edit`)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/teacher/notes/${n.id}/assign`)}>Assign Students</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(n.id)}>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} title="Delete Note" description="This will delete the note and remove all student assignments." onConfirm={handleDelete} loading={deleting} />
    </div>
  )
}
