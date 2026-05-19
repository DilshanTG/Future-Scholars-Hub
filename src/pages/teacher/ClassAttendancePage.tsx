import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/shared/PageHeader'
import { AvatarCircle } from '@/components/shared/AvatarCircle'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { colomboFormat } from '@/lib/dates'
import type { Attendance } from '@/types'

interface ClassInfo {
  topic: string
  class_date: string
  assigned_count: number
}

export default function ClassAttendancePage() {
  const { id } = useParams<{ id: string }>()
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: cls }, { data: att }] = await Promise.all([
        supabase
          .from('classes')
          .select('topic, class_date, class_assignments(count)')
          .eq('id', id!)
          .single(),
        supabase
          .from('attendance')
          .select('id, joined_at, students(name, avatar, grade)')
          .eq('class_id', id!)
          .order('joined_at'),
      ])

      if (cls) {
        setClassInfo({
          topic: cls.topic,
          class_date: cls.class_date,
          assigned_count: cls.class_assignments?.[0]?.count ?? 0,
        })
      }
      setAttendance((att ?? []) as unknown as Attendance[])
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-24 rounded-2xl" />
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-2xl" />)}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Attendance"
        backTo="/teacher/classes"
        subtitle={classInfo?.topic}
      />

      {classInfo && (
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{colomboFormat(classInfo.class_date, 'PPp')}</p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-[#6C63FF]/10 text-[#6C63FF] border-[#6C63FF]/20">
              {attendance.length} joined
            </Badge>
            <Badge variant="outline">
              {classInfo.assigned_count} assigned
            </Badge>
          </div>
        </div>
      )}

      {attendance.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-2">🪑</p>
          <p>No students have joined yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {attendance.map((a, i) => (
            <div key={a.id} className={`flex items-center gap-3 px-4 py-3 ${i !== 0 ? 'border-t' : ''}`}>
              <span className="text-xs text-muted-foreground w-6 text-right shrink-0">{i + 1}</span>
              <AvatarCircle emoji={a.students?.avatar ?? '🎓'} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm">{a.students?.name ?? 'Unknown'}</p>
                <p className="text-xs text-muted-foreground">{a.students?.grade}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground">{colomboFormat(a.joined_at, 'p')}</p>
                <p className="text-xs text-green-600 font-medium">✓ Joined</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
