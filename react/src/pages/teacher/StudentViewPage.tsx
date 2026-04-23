import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/shared/PageHeader'
import { AvatarCircle } from '@/components/shared/AvatarCircle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { toast } from 'sonner'
import type { Student, Class, Note, Recording } from '@/types'

export default function StudentViewPage() {
  const { id } = useParams<{ id: string }>()
  const [student, setStudent] = useState<Student | null>(null)
  const [classes, setClasses] = useState<Class[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingStatus, setTogglingStatus] = useState(false)

  useEffect(() => {
    async function load() {
      const [{ data: s }, { data: cls }, { data: nts }, { data: rec }] = await Promise.all([
        supabase.from('students').select('*').eq('id', id!).single(),
        supabase.from('classes').select('*, class_assignments!inner(student_id)').eq('class_assignments.student_id', id!).order('class_date', { ascending: false }),
        supabase.from('notes').select('*, note_assignments!inner(student_id)').eq('note_assignments.student_id', id!).order('created_at', { ascending: false }),
        supabase.from('recordings').select('*, recording_assignments!inner(student_id)').eq('recording_assignments.student_id', id!).order('created_at', { ascending: false }),
      ])
      setStudent(s)
      setClasses(cls ?? [])
      setNotes(nts ?? [])
      setRecordings(rec ?? [])
      setLoading(false)
    }
    load()
  }, [id])

  const toggleStatus = async () => {
    if (!student) return
    setTogglingStatus(true)
    const newStatus = student.status === 'active' ? 'inactive' : 'active'
    const { error } = await supabase.from('students').update({ status: newStatus }).eq('id', id!)
    setTogglingStatus(false)
    if (error) {
      toast.error('Failed to update status')
    } else {
      setStudent((s) => s ? { ...s, status: newStatus } : s)
      toast.success(`Student marked as ${newStatus}`)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  if (!student) return <p className="text-center py-16 text-muted-foreground">Student not found</p>

  const isActive = student.status === 'active'

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Student Profile"
        backTo="/teacher/students"
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleStatus}
              disabled={togglingStatus}
              className={`rounded-pill text-sm font-medium ${
                isActive
                  ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
                  : 'border-green-200 text-green-600 hover:bg-green-50'
              }`}
            >
              {togglingStatus ? '...' : isActive ? '⏸ Make Inactive' : '▶ Make Active'}
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-pill">
              <Link to={`/teacher/students/${id}/edit`}>Edit</Link>
            </Button>
          </div>
        }
      />

      {/* Profile card */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
        <div className="flex items-center gap-4 mb-4">
          <AvatarCircle emoji={student.avatar} size="xl" />
          <div>
            <h2 className="text-xl font-bold text-gray-800">{student.name}</h2>
            <p className="text-muted-foreground text-sm">{student.mobile} · {student.grade} · {student.gender}</p>
            {student.district && <p className="text-muted-foreground text-sm">{student.district}</p>}
            <div className="flex gap-2 mt-2">
              <Badge
                className={`cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                }`}
                onClick={toggleStatus}
              >
                {isActive ? '✅ Active' : '⏸ Inactive'} — click to toggle
              </Badge>
            </div>
          </div>
        </div>
        {student.description && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Description</p>
            <p className="text-sm text-gray-700">{student.description}</p>
          </div>
        )}
        {student.teacher_note && (
          <div className="bg-yellow-50 rounded-xl p-3">
            <p className="text-xs font-semibold text-yellow-700 uppercase mb-1">Teacher Note</p>
            <p className="text-sm text-yellow-800">{student.teacher_note}</p>
          </div>
        )}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button asChild size="sm" className="rounded-pill bg-[#6C63FF] hover:bg-[#5a52d5]">
            <Link to={`/teacher/students/${id}/assign-class`}>+ Assign Class</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-pill">
            <Link to={`/teacher/students/${id}/assign-note`}>+ Assign Note</Link>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <Tabs defaultValue="classes">
          <TabsList className="mb-4">
            <TabsTrigger value="classes">Classes ({classes.length})</TabsTrigger>
            <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
            <TabsTrigger value="recordings">Recordings ({recordings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="classes">
            {classes.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No classes assigned</p>
            ) : (
              <div className="space-y-2">
                {classes.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{c.topic}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(c.class_date), 'PPp')}</p>
                    </div>
                    {c.zoom_link && (
                      <Button asChild size="sm" variant="outline" className="rounded-pill text-xs">
                        <a href={c.zoom_link} target="_blank" rel="noopener noreferrer">Join</a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="notes">
            {notes.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No notes assigned</p>
            ) : (
              <div className="space-y-2">
                {notes.map((n) => (
                  <div key={n.id} className="p-3 rounded-xl bg-gray-50">
                    <p className="font-medium text-gray-800 text-sm">{n.title}</p>
                    {n.details && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.details}</p>}
                    {n.link && (
                      <a href={n.link} target="_blank" rel="noopener noreferrer" className="text-xs text-[#6C63FF] hover:underline mt-1 inline-block">
                        Open link →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recordings">
            {recordings.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No recordings assigned</p>
            ) : (
              <div className="space-y-2">
                {recordings.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{r.topic}</p>
                      {r.description && <p className="text-xs text-muted-foreground line-clamp-1">{r.description}</p>}
                    </div>
                    <Button asChild size="sm" variant="outline" className="rounded-pill text-xs">
                      <a href={r.link} target="_blank" rel="noopener noreferrer">Watch</a>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
