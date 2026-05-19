import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AnnouncementPopup } from '@/components/shared/AnnouncementPopup'
import { CountdownTimer } from '@/components/shared/CountdownTimer'
import { isPast } from 'date-fns'
import { colomboFormat, colomboMonth, colomboYear } from '@/lib/dates'
import { getMarkStyle, pct } from '@/lib/markStyle'
import { getClassStatus } from '@/lib/classStatus'
import { Link } from 'react-router-dom'
import type { Class, Announcement, Mark } from '@/types'

interface StudentInfo {
  status: 'active' | 'inactive'
  payment_status: 'paid' | 'unpaid'
}

export default function StudentDashboard() {
  const { user } = useAuthStore()
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null)
  const [nextClass, setNextClass] = useState<Class | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [latestMark, setLatestMark] = useState<Mark | null>(null)
  const [loading, setLoading] = useState(true)
  const [, setTick] = useState(0)

  useEffect(() => {
    async function load() {
      if (!user) return
      const now = new Date()
      const month = colomboMonth()
      const year = colomboYear()

      const [{ data: student }, { data: classes }, { data: anns }, { data: payment }, { data: mark }] = await Promise.all([
        supabase.from('students').select('status').eq('id', user.id).single(),
        supabase.from('classes')
          .select('*, class_assignments!inner(student_id)')
          .eq('class_assignments.student_id', user.id)
          .gte('class_date', new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString())
          .order('class_date')
          .limit(5),
        supabase.from('announcements')
          .select('*')
          .or(`expire_date.is.null,expire_date.gt.${now.toISOString()}`)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase.from('payments').select('status').eq('student_id', user.id).eq('month', month).eq('year', year).maybeSingle(),
        supabase.from('marks').select('*').eq('student_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      ])

      setStudentInfo({ status: student?.status ?? 'active', payment_status: payment?.status ?? 'unpaid' })
      // Pick the first class that isn't ended (could be upcoming or live)
      const active = (classes ?? []).find((c) => getClassStatus(c.class_date, c.duration_minutes ?? 60) !== 'ended')
      setNextClass(active ?? null)
      setAnnouncements(anns ?? [])
      setLatestMark(mark ?? null)
      setLoading(false)
    }
    load()
  }, [user])

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  const handleJoin = async (classId: string, zoomLink: string) => {
    if (user) {
      await supabase.from('attendance').upsert(
        { class_id: classId, student_id: user.id },
        { onConflict: 'class_id,student_id' }
      )
    }
    window.open(zoomLink, '_blank')
  }

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

      {/* Latest mark */}
      {latestMark && (() => {
        const style = getMarkStyle(latestMark.score, latestMark.total)
        const percent = pct(latestMark.score, latestMark.total)
        return (
          <Link to="/student/marks" className="block">
            <div className={`rounded-2xl overflow-hidden shadow-sm bg-gradient-to-r ${style.gradient} hover:shadow-md transition-shadow`}>
              <div className="p-4 flex items-center gap-4">
                <div className="text-4xl">{style.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white/70 uppercase tracking-wide">Latest Result</p>
                  <p className="font-bold text-white truncate">{latestMark.title}</p>
                  <div className="mt-1.5 h-1.5 rounded-full bg-white/30 overflow-hidden">
                    <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${percent}%` }} />
                  </div>
                </div>
                <div className="text-center shrink-0">
                  <p className="text-2xl font-extrabold text-white">{latestMark.score}</p>
                  <p className="text-white/70 text-xs">/{latestMark.total}</p>
                  <p className="text-white font-semibold text-sm">{percent}%</p>
                </div>
              </div>
            </div>
          </Link>
        )
      })()}

      {/* Next class */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h2 className="font-semibold text-gray-800 mb-3">Next Class</h2>
        {nextClass ? (() => {
          const status = getClassStatus(nextClass.class_date, nextClass.duration_minutes ?? 60)
          return (
            <div className="border-l-4 border-[#6C63FF] pl-4">
              <p className="font-medium text-gray-800">{nextClass.topic}</p>
              <p className="text-sm text-muted-foreground">{colomboFormat(nextClass.class_date, 'PPp')} · {nextClass.duration_minutes ?? 60} min</p>
              {status === 'upcoming' && (
                <div className="mt-3 mb-2">
                  <CountdownTimer targetDate={nextClass.class_date} />
                </div>
              )}
              {status === 'live' && (
                <span className="inline-flex items-center gap-1.5 mt-2 mb-2 text-xs font-semibold text-red-600">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Class is Live Now!
                </span>
              )}
              {status === 'live' && nextClass.zoom_link && (
                <div className="mt-1">
                  <Button size="sm" onClick={() => handleJoin(nextClass.id, nextClass.zoom_link!)} className="rounded-pill bg-red-500 hover:bg-red-600 text-white">
                    🔴 Join Now
                  </Button>
                </div>
              )}
            </div>
          )
        })() : (
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
                  <p className="text-xs text-blue-500 mt-1">Expires: {colomboFormat(a.expire_date, 'PP')}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
