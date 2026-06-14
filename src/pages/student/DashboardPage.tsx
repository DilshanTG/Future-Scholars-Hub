import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { AnnouncementPopup } from '@/components/shared/AnnouncementPopup'
import { CountdownTimer } from '@/components/shared/CountdownTimer'
import { isPast } from 'date-fns'
import { colomboFormat, colomboMonth, colomboYear } from '@/lib/dates'
import { formatDuration } from '@/lib/constants'
import { getMarkStyle, pct } from '@/lib/markStyle'
import { getClassStatus } from '@/lib/classStatus'
import { Link } from 'react-router-dom'
import { CalendarDays, CreditCard, UserCheck, ChevronRight, Megaphone } from 'lucide-react'
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

  const classStatus = nextClass ? getClassStatus(nextClass.class_date, nextClass.duration_minutes ?? 60) : null

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 rounded-3xl" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-28 rounded-2xl" /><Skeleton className="h-28 rounded-2xl" />
        </div>
        <div className="lg:grid lg:grid-cols-2 lg:gap-5 space-y-4 lg:space-y-0">
          <Skeleton className="h-44 rounded-2xl" /><Skeleton className="h-44 rounded-2xl" />
        </div>
        <Skeleton className="h-36 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <AnnouncementPopup announcements={announcements} />

      {/* ── Welcome banner ── */}
      <div className="gradient-welcome rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-10 right-4 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
        <div className="relative flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-5xl ring-2 ring-white/30 shrink-0">
            {user?.avatar}
          </div>
          <div className="min-w-0">
            <p className="text-white/65 text-sm font-medium">{colomboFormat(new Date(), 'EEEE, MMMM d')}</p>
            <h1 className="text-2xl font-bold truncate mt-0.5">Hi, {user?.name}! 👋</h1>
            <p className="text-white/75 text-sm mt-1">Ready to learn today?</p>
          </div>
        </div>
      </div>

      {/* ── Status cards ── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${studentInfo?.status === 'active' ? 'bg-green-100' : 'bg-gray-100'}`}>
            <UserCheck className={`w-5 h-5 ${studentInfo?.status === 'active' ? 'text-green-600' : 'text-gray-400'}`} />
          </div>
          <p className="text-sm text-muted-foreground font-medium">Account</p>
          <p className={`font-bold text-base mt-0.5 capitalize ${studentInfo?.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
            {studentInfo?.status ?? 'Active'}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${studentInfo?.payment_status === 'paid' ? 'bg-green-100' : 'bg-red-100'}`}>
            <CreditCard className={`w-5 h-5 ${studentInfo?.payment_status === 'paid' ? 'text-green-600' : 'text-red-500'}`} />
          </div>
          <p className="text-sm text-muted-foreground font-medium">This Month</p>
          <p className={`font-bold text-base mt-0.5 ${studentInfo?.payment_status === 'paid' ? 'text-green-600' : 'text-red-500'}`}>
            {studentInfo?.payment_status === 'paid' ? 'Paid ✓' : 'Unpaid'}
          </p>
        </div>
      </div>

      {/* ── Two-column on desktop ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Next class */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#6C63FF]/10 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-[#6C63FF]" />
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Next Class</p>
            {classStatus === 'live' && (
              <span className="ml-auto flex items-center gap-1 text-xs font-bold text-red-500">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />LIVE NOW
              </span>
            )}
          </div>
          {nextClass ? (
            <div className="px-5 pb-5 space-y-3">
              <div className="flex gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-1 self-stretch rounded-full bg-[#6C63FF] shrink-0" />
                <div className="min-w-0">
                  <p className="font-bold text-gray-800">{nextClass.topic}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {colomboFormat(nextClass.class_date, 'PPp')} · {formatDuration(nextClass.duration_minutes ?? 60)}
                  </p>
                  {classStatus === 'upcoming' && <div className="mt-2"><CountdownTimer targetDate={nextClass.class_date} /></div>}
                </div>
              </div>
              {classStatus === 'live' && nextClass.zoom_link && (
                <Button onClick={() => handleJoin(nextClass.id, nextClass.zoom_link!)} className="w-full rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold h-11">
                  🔴 Join Class Now
                </Button>
              )}
            </div>
          ) : (
            <div className="px-5 pb-6 flex flex-col items-center text-center">
              <p className="text-4xl mb-2">📅</p>
              <p className="text-sm font-medium text-gray-500">No upcoming classes</p>
              <p className="text-xs text-muted-foreground mt-0.5">Check back later</p>
            </div>
          )}
        </div>

        {/* Latest result */}
        {latestMark ? (() => {
          const style = getMarkStyle(latestMark.score, latestMark.total)
          const percent = pct(latestMark.score, latestMark.total)
          return (
            <Link to="/student/marks" className="block group">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full">
                <div className="px-5 pt-5 pb-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                    <span className="text-base leading-none">🎯</span>
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Latest Result</p>
                  <ChevronRight className="w-4 h-4 text-gray-300 ml-auto group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="mx-5 mb-5 flex rounded-xl overflow-hidden border border-gray-100">
                  <div className={`bg-gradient-to-b ${style.gradient} w-[72px] shrink-0 flex flex-col items-center justify-center gap-1`}>
                    <span className="text-white font-black text-3xl leading-none">{style.label}</span>
                    <span className="text-white/80 text-xs font-semibold">{percent}%</span>
                  </div>
                  <div className="flex-1 min-w-0 px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-gray-800 truncate">{latestMark.title}</p>
                      <div className="shrink-0 leading-none">
                        <span className="font-black text-gray-800 text-lg">{latestMark.score}</span>
                        <span className="text-sm text-muted-foreground"> /{latestMark.total}</span>
                      </div>
                    </div>
                    <div className="mt-2.5 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className={`h-full rounded-full ${style.bar} transition-all duration-700`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )
        })() : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 pt-5 pb-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <span className="text-base leading-none">🎯</span>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Latest Result</p>
            </div>
            <div className="px-5 pb-6 flex flex-col items-center text-center">
              <p className="text-4xl mb-2">🎯</p>
              <p className="text-sm font-medium text-gray-500">No results yet</p>
              <p className="text-xs text-muted-foreground mt-0.5">Your marks will appear here</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Announcements ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 pt-5 pb-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <Megaphone className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Announcements</p>
          {announcements.length > 0 && (
            <span className="ml-auto w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
              {announcements.length}
            </span>
          )}
        </div>
        {announcements.length === 0 ? (
          <div className="px-5 pb-6 flex flex-col items-center text-center">
            <p className="text-4xl mb-2">📢</p>
            <p className="text-sm font-medium text-gray-500">No announcements</p>
            <p className="text-xs text-muted-foreground mt-0.5">You're all caught up!</p>
          </div>
        ) : (
          <div className="px-5 pb-5 grid grid-cols-1 lg:grid-cols-2 gap-2">
            {announcements.map((a) => (
              <div key={a.id} className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <p className="font-semibold text-sm text-gray-800">{a.title}</p>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{a.message}</p>
                {a.expire_date && !isPast(new Date(a.expire_date)) && (
                  <p className="text-xs text-blue-400 mt-2 font-medium">Expires {colomboFormat(a.expire_date, 'PP')}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}