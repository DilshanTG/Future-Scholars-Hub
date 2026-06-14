import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { CountdownTimer } from '@/components/shared/CountdownTimer'
import { colomboFormat } from '@/lib/dates'
import { getClassStatus } from '@/lib/classStatus'
import { formatDuration } from '@/lib/constants'
import { CalendarDays, Clock } from 'lucide-react'
import type { Class } from '@/types'

export default function StudentClassesPage() {
  const { user } = useAuthStore()
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [, setTick] = useState(0)

  useEffect(() => {
    if (!user) return
    supabase.from('classes').select('*, class_assignments!inner(student_id)')
      .eq('class_assignments.student_id', user.id)
      .order('class_date', { ascending: false })
      .then(({ data }) => { setClasses(data ?? []); setLoading(false) })
  }, [user])

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  const handleJoin = async (classId: string, zoomLink: string) => {
    if (user) await supabase.from('attendance').upsert({ class_id: classId, student_id: user.id }, { onConflict: 'class_id,student_id' })
    window.open(zoomLink, '_blank')
  }

  const upcoming = classes.filter(c => getClassStatus(c.class_date, c.duration_minutes ?? 60) !== 'ended')
  const past = classes.filter(c => getClassStatus(c.class_date, c.duration_minutes ?? 60) === 'ended')

  const ClassCard = ({ c }: { c: Class }) => {
    const status = getClassStatus(c.class_date, c.duration_minutes ?? 60)
    return (
      <div className={`bg-white rounded-2xl border overflow-hidden transition-all duration-200 ${status === 'live' ? 'border-red-200 shadow-md shadow-red-100' : 'border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5'}`}>
        {status === 'live' && <div className="h-1 bg-gradient-to-r from-red-400 to-rose-400" />}
        {status === 'upcoming' && <div className="h-1 bg-gradient-to-r from-[#6C63FF] to-indigo-400" />}
        {status === 'ended' && <div className="h-1 bg-gray-200" />}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-800 truncate">{c.topic}</h3>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarDays className="w-3 h-3" />{colomboFormat(c.class_date, 'PPp')}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />{formatDuration(c.duration_minutes ?? 60)}
                </span>
              </div>
              {c.teacher_note && <p className="text-xs text-muted-foreground mt-1.5 italic bg-gray-50 rounded-lg px-2.5 py-1.5">{c.teacher_note}</p>}
            </div>
            {status === 'ended' && (
              <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full shrink-0">Ended</span>
            )}
            {status === 'live' && (
              <span className="flex items-center gap-1 text-xs font-bold text-red-500 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />LIVE
              </span>
            )}
          </div>

          {status === 'upcoming' && (
            <div className="mt-3">
              <CountdownTimer targetDate={c.class_date} />
            </div>
          )}
          {status === 'live' && c.zoom_link && (
            <Button size="sm" onClick={() => handleJoin(c.id, c.zoom_link!)} className="mt-3 w-full rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold">
              🔴 Join Class Now
            </Button>
          )}
          {status === 'upcoming' && !c.zoom_link && (
            <p className="mt-2 text-xs text-gray-400 italic">Join link not added yet</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-800">My Classes</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{classes.length} class{classes.length !== 1 ? 'es' : ''} assigned</p>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
      ) : (
        <Tabs defaultValue="upcoming">
          <TabsList className="mb-4 bg-white border border-gray-100 shadow-sm rounded-xl p-1 w-full">
            <TabsTrigger value="upcoming" className="flex-1 rounded-lg text-sm">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past" className="flex-1 rounded-lg text-sm">Past ({past.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming">
            {upcoming.length === 0 ? (
              <div className="text-center py-16"><p className="text-4xl mb-2">📅</p><p className="text-muted-foreground">No upcoming classes</p></div>
            ) : (
              <div className="space-y-3">{upcoming.map(c => <ClassCard key={c.id} c={c} />)}</div>
            )}
          </TabsContent>
          <TabsContent value="past">
            {past.length === 0 ? (
              <div className="text-center py-16"><p className="text-4xl mb-2">🗓️</p><p className="text-muted-foreground">No past classes</p></div>
            ) : (
              <div className="space-y-3 opacity-75">{past.map(c => <ClassCard key={c.id} c={c} />)}</div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
