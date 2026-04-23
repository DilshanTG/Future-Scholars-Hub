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
import type { Recording } from '@/types'

export default function RecordingsPage() {
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()

  const fetchRecordings = async () => {
    setLoading(true)
    const { data } = await supabase.from('recordings').select('*, recording_assignments(count)').order('created_at', { ascending: false })
    setRecordings((data ?? []).map((r) => ({ ...r, assigned_count: r.recording_assignments?.[0]?.count ?? 0 })))
    setLoading(false)
  }

  useEffect(() => { fetchRecordings() }, [])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    const { error } = await supabase.from('recordings').delete().eq('id', deleteId)
    setDeleting(false); setDeleteId(null)
    if (error) toast.error('Failed to delete recording')
    else { toast.success('Recording deleted'); fetchRecordings() }
  }

  return (
    <div>
      <PageHeader
        title="Recordings"
        action={<Button asChild className="rounded-pill bg-[#6C63FF] hover:bg-[#5a52d5]"><Link to="/teacher/recordings/add"><Plus className="h-4 w-4 mr-1" />Add Recording</Link></Button>}
      />
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
      ) : recordings.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground"><p className="text-4xl mb-2">🎥</p><p>No recordings yet</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recordings.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl shadow-sm p-4 card-hover">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">{r.topic}</h3>
                  {r.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.description}</p>}
                  <a href={r.link} target="_blank" rel="noopener noreferrer" className="text-xs text-[#6C63FF] hover:underline mt-1 inline-block">Watch →</a>
                  <div className="mt-2"><Badge variant="outline" className="text-xs">{r.assigned_count} students</Badge></div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg shrink-0"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem onClick={() => navigate(`/teacher/recordings/${r.id}/edit`)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/teacher/recordings/${r.id}/assign`)}>Assign Students</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(r.id)}>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} title="Delete Recording" description="This will delete the recording and remove all student assignments." onConfirm={handleDelete} loading={deleting} />
    </div>
  )
}
