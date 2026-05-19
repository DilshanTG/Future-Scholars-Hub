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
import type { Class } from '@/types'

export default function StudentClassesPage() {
  const { user } = useAuthStore()
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [, setTick] = useState(0)

  useEffect(() => {
    if (!user) return
    supabase
      .from('classes')
      .select('*, class_assignments!inner(student_id)')
      .eq('class_assignments.student_id', user.id)
      .order('class_date', { ascending: false })
      .then(({ data }) => { setClasses(data ?? []); setLoading(false) })
  }, [user])

  // Re-evaluate status every 30 s so live/ended states update automatically
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

  const upcoming = classes.filter((c) => getClassStatus(c.class_date, c.duration_minutes ?? 60) !== 'ended')
  const past = classes.filter((c) => getClassStatus(c.class_date, c.duration_minutes ?? 60) === 'ended')

  const ClassCard = ({ c }: { c: Class }) => {
    const status = getClassStatus(c.class_date, c.duration_minutes ?? 60)
    return (
      <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="border-l-4 border-[#6C63FF] pl-3 flex-1">
          <p className="font-medium text-gray-800">{c.topic}</p>
          <p className="text-sm text-muted-foreground">{colomboFormat(c.class_date, 'PPp')} · {formatDuration(c.duration_minutes ?? 60)}</p>
          {c.teacher_note && <p className="text-xs text-muted-foreground mt-1 italic">{c.teacher_note}</p>}
          {status === 'upcoming' && (
            <div className="mt-3 mb-1">
              <CountdownTimer targetDate={c.class_date} />
            </div>
          )}
          {status === 'live' && (
            <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-red-600">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Class is Live Now!
            </span>
          )}
        </div>
        {status === 'ended' && (
          <div className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-bold border border-gray-200 self-start sm:self-center">
            Ended
          </div>
        )}
        {status === 'upcoming' && !c.zoom_link && (
          <div className="px-3 py-1 bg-gray-50 text-gray-400 rounded-full text-xs border self-start sm:self-center">
            No link yet
          </div>
        )}
        {status === 'live' && c.zoom_link && (
          <Button
            size="sm"
            onClick={() => handleJoin(c.id, c.zoom_link!)}
            className="rounded-pill bg-red-500 hover:bg-red-600 text-white shrink-0 self-start sm:self-center animate-pulse"
          >
            🔴 Join Now
          </Button>
        )}
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-4">My Classes</h1>
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
      ) : (
        <Tabs defaultValue="upcoming">
          <TabsList className="mb-4">
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming">
            {upcoming.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground"><p className="text-4xl mb-2">📅</p><p>No upcoming classes</p></div>
            ) : (
              <div className="space-y-3">{upcoming.map((c) => <ClassCard key={c.id} c={c} />)}</div>
            )}
          </TabsContent>
          <TabsContent value="past">
            {past.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground"><p className="text-4xl mb-2">🗓️</p><p>No past classes</p></div>
            ) : (
              <div className="space-y-3 opacity-70">{past.map((c) => <ClassCard key={c.id} c={c} />)}</div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
