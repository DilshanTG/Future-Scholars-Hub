import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { colomboMonth, colomboYear } from '@/lib/dates'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/shared/PageHeader'
import { StudentFilter } from '@/components/shared/StudentFilter'
import { AvatarCircle } from '@/components/shared/AvatarCircle'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Plus, Archive, ArchiveRestore, Send } from 'lucide-react'
import { toast } from 'sonner'
import { InviteDialog } from '@/components/shared/InviteDialog'
import type { Student } from '@/types'

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [grade, setGrade] = useState('all')
  const [status, setStatus] = useState('all')
  const [payment, setPayment] = useState('all')
  const [showArchived, setShowArchived] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [inviteStudent, setInviteStudent] = useState<Student | null>(null)
  const navigate = useNavigate()

  const fetchStudents = async () => {
    setLoading(true)
    const month = colomboMonth()
    const year = colomboYear()

    const { data } = await supabase
      .from('students')
      .select(`*, payments!left(status, month, year)`)
      .order('name')

    const enriched = (data ?? []).map((s) => {
      const currentPayment = (s.payments ?? []).find(
        (p: { month: string; year: number; status: string }) => p.month === month && p.year === year
      )
      return { ...s, payment_status: currentPayment?.status ?? 'unpaid', payments: undefined }
    })
    setStudents(enriched)
    setLoading(false)
  }

  useEffect(() => { fetchStudents() }, [])

  const filtered = students.filter((s) => {
    if (!showArchived && s.archived) return false
    if (showArchived && !s.archived) return false
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.mobile.includes(search)
    const matchGrade = grade === 'all' || s.grade === grade
    const matchStatus = status === 'all' || s.status === status
    const matchPayment = payment === 'all' || s.payment_status === payment
    return matchSearch && matchGrade && matchStatus && matchPayment
  })

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    const { error } = await supabase.from('students').delete().eq('id', deleteId)
    setDeleting(false)
    setDeleteId(null)
    if (error) toast.error('Failed to delete student')
    else { toast.success('Student deleted'); fetchStudents() }
  }

  const handleArchive = async (id: string, archive: boolean) => {
    const { error } = await supabase.from('students').update({ archived: archive }).eq('id', id)
    if (error) toast.error('Failed to update')
    else {
      toast.success(archive ? 'Student archived' : 'Student restored')
      fetchStudents()
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    const { error } = await supabase.from('students').update({ status: newStatus }).eq('id', id)
    if (error) toast.error('Failed to update status')
    else {
      toast.success(`Student marked ${newStatus}`)
      fetchStudents()
    }
  }

  const handlePasswordReset = (studentId: string, newPassword: string) => {
    setStudents((prev) => prev.map((s) => s.id === studentId ? { ...s, login_password: newPassword } : s))
  }

  const archivedCount = students.filter((s) => s.archived).length

  return (
    <div>
      <PageHeader
        title={showArchived ? 'Archived Students' : 'Students'}
        subtitle={`${filtered.length} student${filtered.length !== 1 ? 's' : ''}`}
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setShowArchived(!showArchived); setSearch(''); setGrade('all'); setStatus('all'); setPayment('all') }}
              className="rounded-pill gap-1.5"
            >
              {showArchived ? <><ArchiveRestore className="h-3.5 w-3.5" />Active Students</> : <><Archive className="h-3.5 w-3.5" />Archived {archivedCount > 0 && `(${archivedCount})`}</>}
            </Button>
            {!showArchived && (
              <Button asChild className="rounded-pill bg-[#6C63FF] hover:bg-[#5a52d5]">
                <Link to="/teacher/students/add"><Plus className="h-4 w-4 mr-1" />Add Student</Link>
              </Button>
            )}
          </div>
        }
      />

      {!showArchived && (
        <StudentFilter
          search={search} grade={grade} status={status} payment={payment}
          onSearchChange={setSearch} onGradeChange={setGrade}
          onStatusChange={setStatus} onPaymentChange={setPayment}
        />
      )}
      {showArchived && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search archived students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 rounded-xl border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
          />
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-2">{showArchived ? '📦' : '🔍'}</p>
          <p>{showArchived ? 'No archived students' : 'No students found'}</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Student</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Grade</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Mobile</th>
                  {!showArchived && <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Status</th>}
                  {!showArchived && <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Payment</th>}
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <AvatarCircle emoji={s.avatar} size="sm" />
                        <span className="font-medium text-gray-800">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{s.grade}</Badge></td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{s.mobile}</td>
                    {!showArchived && (
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleStatus(s.id, s.status)}
                          className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                            s.status === 'active'
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {s.status}
                        </button>
                      </td>
                    )}
                    {!showArchived && (
                      <td className="px-4 py-3">
                        <Badge className={s.payment_status === 'paid' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-red-100 text-red-600 hover:bg-red-100'}>
                          {s.payment_status}
                        </Badge>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        {!showArchived && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setInviteStudent(s)}
                            className="rounded-lg text-[#6C63FF] border-[#6C63FF]/30 hover:bg-[#6C63FF]/10 h-8 px-2.5"
                          >
                            <Send className="w-3.5 h-3.5 mr-1.5" />Invite
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                          {!showArchived && <>
                            <DropdownMenuItem onClick={() => navigate(`/teacher/students/${s.id}`)}>View</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/teacher/students/${s.id}/edit`)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/teacher/students/${s.id}/assign-class`)}>Assign Class</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/teacher/students/${s.id}/assign-note`)}>Assign Note</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(s.id, s.status)}
                              className={s.status === 'active' ? 'text-orange-600' : 'text-green-600'}
                            >
                              {s.status === 'active' ? 'Mark Inactive' : 'Mark Active'}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-gray-500" onClick={() => handleArchive(s.id, true)}>
                              <Archive className="h-4 w-4 mr-2" />Archive
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>}
                          {showArchived && (
                            <DropdownMenuItem className="text-green-600" onClick={() => handleArchive(s.id, false)}>
                              <ArchiveRestore className="h-4 w-4 mr-2" />Restore Student
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(s.id)}>Delete Permanently</DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <AvatarCircle emoji={s.avatar} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.mobile} · {s.grade}</p>
                  {!showArchived && (
                    <div className="flex gap-1.5 mt-1">
                      <button
                        onClick={() => handleToggleStatus(s.id, s.status)}
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {s.status}
                      </button>
                      <Badge className={`text-xs ${s.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {s.payment_status}
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!showArchived && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setInviteStudent(s)}
                      className="h-8 w-8 rounded-lg text-[#6C63FF] border-[#6C63FF]/30 hover:bg-[#6C63FF]/10"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      {!showArchived && <>
                        <DropdownMenuItem onClick={() => navigate(`/teacher/students/${s.id}`)}>View</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/teacher/students/${s.id}/edit`)}>Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleToggleStatus(s.id, s.status)} className={s.status === 'active' ? 'text-orange-600' : 'text-green-600'}>
                          {s.status === 'active' ? 'Mark Inactive' : 'Mark Active'}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-gray-500" onClick={() => handleArchive(s.id, true)}>
                          <Archive className="h-4 w-4 mr-2" />Archive
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>}
                      {showArchived && (
                        <DropdownMenuItem className="text-green-600" onClick={() => handleArchive(s.id, false)}>
                          <ArchiveRestore className="h-4 w-4 mr-2" />Restore
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(s.id)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <InviteDialog
        student={inviteStudent}
        onClose={() => setInviteStudent(null)}
        onPasswordReset={handlePasswordReset}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Student Permanently"
        description="This will permanently delete the student and all their data. This cannot be undone."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
