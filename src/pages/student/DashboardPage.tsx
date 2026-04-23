import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AnnouncementPopup } from '@/components/shared/AnnouncementPopup'
import { CountdownTimer } from '@/components/shared/CountdownTimer'
import { format, isPast } from 'date-fns'
import type { Class, Announcement } from '@/types'

interface StudentInfo {
  status: 'active' | 'inactive'
  payment_status: 'paid' | 'unpaid'
}

export default function StudentDashboard() {
  const { user } = useAuthStore()
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null)
  const [nextClass, setNextClass] = useState<Class | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!user) return
      const now = new Date()
      const month = now.toLocaleString('default', { month: 'long' })
      const year = now.getFullYear()

      const [{ data: student }, { data: classes }, { data: anns }, { data: payment }] = await Promise.all([
        supabase.from('students').select('status').eq('id', user.id).single(),
        supabase.from('classes')
          .select('*, class_assignments!inner(student_id)')
          .eq('class_assignments.student_id', user.id)
          .gt('class_date', now.toISOString())
          .order('class_date')
          .limit(1),
        supabase.from('announcements')
          .select('*')
          .or(`expire_date.is.null,expire_date.gt.${now.toISOString()}`)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase.from('payments').select('status').eq('student_id', user.id).eq('month', month).eq('year', year).maybeSingle(),
      ])

      setStudentInfo({ status: student?.status ?? 'active', payment_status: payment?.status ?? 'unpaid' })
      setNextClass(classes?.[0] ?? null)
      setAnnouncements(anns ?? [])
      setLoading(false)
    }
    load()
  }, [user])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-2xl" />
        <div className="grid grid-cols-2 gap-4"><Skeleton className="h-20 rounded-2xl" /><Skeleton className="h-20 rounded-2xl" /></div>
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    )
  }



  return (
    <div className="space-y-4">
      {/* Announcement popup — shows for new/unread announcements */}
      <AnnouncementPopup announcements={announcements} />

      {/* Welcome banner */}
      <div className="gradient-welcome rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{user?.avatar}</span>
          <div>
            <h1 className="text-xl font-bold">Welcome, {user?.name}! 👋</h1>
            <p className="text-white/80 text-sm">Keep learning and growing</p>
          </div>
        </div>
      </div>



      {/* Status cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground uppercase">Account</p>
          <Badge className={`mt-2 ${studentInfo?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            {studentInfo?.status ?? 'active'}
          </Badge>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground uppercase">This Month</p>
          <Badge className={`mt-2 ${studentInfo?.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            {studentInfo?.payment_status === 'paid' ? '✅ Paid' : '⚠️ Unpaid'}
          </Badge>
        </div>
      </div>

      {/* Next class */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h2 className="font-semibold text-gray-800 mb-3">Next Class</h2>
        {nextClass ? (
          <div className="border-l-4 border-[#6C63FF] pl-4">
            <p className="font-medium text-gray-800">{nextClass.topic}</p>
            <p className="text-sm text-muted-foreground">{format(new Date(nextClass.class_date), 'PPp')}</p>
            <div className="mt-3 mb-2">
              <CountdownTimer targetDate={nextClass.class_date} />
            </div>
            {nextClass.zoom_link && (
              <Button asChild size="sm" className="mt-2 rounded-pill bg-[#6C63FF] hover:bg-[#5a52d5]">
                <a href={nextClass.zoom_link} target="_blank" rel="noopener noreferrer">Join Class</a>
              </Button>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No upcoming classes scheduled</p>
        )}
      </div>

      {/* Announcements */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h2 className="font-semibold text-gray-800 mb-3">Announcements</h2>
        {announcements.length === 0 ? (
          <p className="text-sm text-muted-foreground">No announcements</p>
        ) : (
          <div className="space-y-2">
            {announcements.map((a) => (
              <div key={a.id} className="bg-blue-50 rounded-xl p-3">
                <p className="font-medium text-sm text-blue-900">{a.title}</p>
                <p className="text-xs text-blue-700 mt-0.5">{a.message}</p>
                {a.expire_date && !isPast(new Date(a.expire_date)) && (
                  <p className="text-xs text-blue-500 mt-1">Expires: {format(new Date(a.expire_date), 'PP')}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
