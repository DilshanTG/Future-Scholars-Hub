import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/shared/PageHeader'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ClassInviteDialog } from '@/components/teacher/ClassInviteDialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Plus, Send } from 'lucide-react'
import { colomboFormat } from '@/lib/dates'
import { toast } from 'sonner'
import type { Class } from '@/types'

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [inviteClass, setInviteClass] = useState<Class | null>(null)
  const navigate = useNavigate()

  const fetchClasses = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('classes')
      .select('*, class_assignments(count)')
      .order('class_date', { ascending: false })

    setClasses((data ?? []).map((c) => ({
      ...c,
      assigned_count: c.class_assignments?.[0]?.count ?? 0,
    })))
    setLoading(false)
  }

  useEffect(() => { fetchClasses() }, [])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    const { error } = await supabase.from('classes').delete().eq('id', deleteId)
    setDeleting(false)
    setDeleteId(null)
    if (error) toast.error('Failed to delete class')
    else { toast.success('Class deleted'); fetchClasses() }
  }

  return (
    <div>
      <PageHeader
        title="Classes"
        subtitle={`${classes.length} total`}
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline" className="rounded-pill">
              <Link to="/teacher/classes/bulk">Bulk Add</Link>
            </Button>
            <Button asChild className="rounded-pill bg-[#6C63FF] hover:bg-[#5a52d5]">
              <Link to="/teacher/classes/add"><Plus className="h-4 w-4 mr-1" />Add Class</Link>
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : classes.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground"><p className="text-4xl mb-2">📅</p><p>No classes yet</p></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <table className="w-full hidden md:table">
            <thead className="bg-gray-50/80 border-b">
              <tr>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Topic</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Date & Time</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Students</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Zoom</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {classes.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors duration-200">
                  <td className="px-4 py-3 font-medium text-gray-800">{c.topic}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{colomboFormat(c.class_date, 'PPp')}</td>
                  <td className="px-4 py-3"><Badge variant="outline">{c.assigned_count} students</Badge></td>
                  <td className="px-4 py-3">
                    {c.zoom_link ? (
                      <a href={c.zoom_link} target="_blank" rel="noopener noreferrer" className="text-[#6C63FF] text-sm hover:underline">Link</a>
                    ) : <span className="text-muted-foreground text-sm">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInviteClass(c)}
                        className="rounded-lg text-[#6C63FF] border-[#6C63FF]/30 hover:bg-[#6C63FF]/10 h-8 px-2.5"
                      >
                        <Send className="w-3.5 h-3.5 mr-1.5" />
                        Invites
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem onClick={() => navigate(`/teacher/classes/${c.id}/edit`)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/teacher/classes/${c.id}/assign`)}>Assign Students</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(c.id)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile */}
          <div className="md:hidden divide-y">
            {classes.map((c) => (
              <div key={c.id} className="p-4 flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-800">{c.topic}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{colomboFormat(c.class_date, 'PPp')}</p>
                  <Badge variant="outline" className="text-xs mt-1">{c.assigned_count} students</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setInviteClass(c)}
                    className="rounded-lg text-[#6C63FF] border-[#6C63FF]/30 hover:bg-[#6C63FF]/10 h-8 w-8"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem onClick={() => navigate(`/teacher/classes/${c.id}/edit`)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/teacher/classes/${c.id}/assign`)}>Assign Students</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(c.id)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Class"
        description="This will delete the class and remove all student assignments."
        onConfirm={handleDelete}
        loading={deleting}
      />

      <ClassInviteDialog
        open={!!inviteClass}
        onOpenChange={(o) => !o && setInviteClass(null)}
        currentClass={inviteClass}
      />
    </div>
  )
}
