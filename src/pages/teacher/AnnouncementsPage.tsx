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
import { colomboFormat } from '@/lib/dates'
import { toast } from 'sonner'
import type { Announcement } from '@/types'

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()

  const fetchAnnouncements = async () => {
    setLoading(true)
    const now = new Date().toISOString()

    // Fetch active announcements (not expired)
    const { data: anns, error } = await supabase
      .from('announcements')
      .select('*')
      .or(`expire_date.is.null,expire_date.gt.${now}`)
      .order('created_at', { ascending: false })

    if (error) { toast.error('Failed to load'); setLoading(false); return }
    if (!anns || anns.length === 0) { setItems([]); setLoading(false); return }

    // Fetch assignments separately to determine all-vs-specific
    const { data: assignments } = await supabase
      .from('announcement_assignments')
      .select('announcement_id, student_id')
      .in('announcement_id', anns.map((a) => a.id))

    const assignmentMap = new Map<string, boolean>()
    for (const row of (assignments ?? [])) {
      if (row.student_id === null) assignmentMap.set(row.announcement_id, true)
      else if (!assignmentMap.has(row.announcement_id)) assignmentMap.set(row.announcement_id, false)
    }

    setItems(anns.map((a) => ({ ...a, is_all: assignmentMap.get(a.id) ?? false })))
    setLoading(false)
  }

  useEffect(() => { fetchAnnouncements() }, [])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    const { error } = await supabase.from('announcements').delete().eq('id', deleteId)
    setDeleting(false); setDeleteId(null)
    if (error) toast.error('Failed to delete')
    else { toast.success('Announcement deleted'); fetchAnnouncements() }
  }

  return (
    <div>
      <PageHeader
        title="Announcements"
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline" className="rounded-pill"><Link to="/teacher/announcements/history">History</Link></Button>
            <Button asChild className="rounded-pill bg-[#6C63FF] hover:bg-[#5a52d5]">
              <Link to="/teacher/announcements/add"><Plus className="h-4 w-4 mr-1" />Add</Link>
            </Button>
          </div>
        }
      />
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-2">📢</p>
          <p>No active announcements</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-gray-800">{a.title}</h3>
                    <Badge className={a.is_all ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' : 'bg-purple-100 text-purple-700 hover:bg-purple-100'}>
                      {a.is_all ? '👥 All Students' : '🎯 Specific'}
                    </Badge>
                    {a.expire_date && (
                      <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                        Expires {colomboFormat(a.expire_date, 'PP')}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{a.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">{colomboFormat(a.created_at, 'PP')}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg shrink-0"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem onClick={() => navigate(`/teacher/announcements/${a.id}/edit`)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(a.id)}>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} title="Delete Announcement" description="This will permanently delete the announcement." onConfirm={handleDelete} loading={deleting} />
    </div>
  )
}
