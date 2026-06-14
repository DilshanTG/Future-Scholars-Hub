import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/skeleton'
import { CuteDashboardUI } from '@/components/student/CuteDashboardUI'
import { colomboMonth, colomboYear } from '@/lib/dates'
import { getClassStatus } from '@/lib/classStatus'
import { Sparkles } from 'lucide-react'
import type { Class, Announcement, Mark } from '@/types'

interface StudentInfo {
  status: 'active' | 'inactive'
  payment_status: 'paid' | 'unpaid'
}

export default function StudentDashboardV2Page() {
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

  if (loading || !studentInfo) {
    return (
      <div className="space-y-4 cute-sparkle-bg -mx-1 px-1">
        <Skeleton className="h-32 rounded-[2rem] bg-pink-100/60" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-28 rounded-3xl bg-pink-50" />
          <Skeleton className="h-28 rounded-3xl bg-pink-50" />
        </div>
        <div className="lg:grid lg:grid-cols-2 lg:gap-5 space-y-4 lg:space-y-0">
          <Skeleton className="h-44 rounded-3xl bg-pink-50" />
          <Skeleton className="h-44 rounded-3xl bg-pink-50" />
        </div>
        <Skeleton className="h-36 rounded-3xl bg-pink-50" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-pink-100 bg-pink-50/60 px-4 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
          <p className="text-xs font-cute font-semibold text-pink-500 truncate">Dashboard v2 — development preview</p>
        </div>
        <Link
          to="/student/dashboard"
          className="text-xs font-cute font-medium text-pink-400 hover:text-pink-600 whitespace-nowrap transition-colors"
        >
          ← Back to current
        </Link>
      </div>

      <CuteDashboardUI
        userName={user?.name ?? 'sweetie'}
        userAvatar={user?.avatar ?? '🌸'}
        studentInfo={studentInfo}
        nextClass={nextClass}
        classStatus={classStatus}
        latestMark={latestMark}
        announcements={announcements}
        onJoinClass={handleJoin}
      />
    </div>
  )
}