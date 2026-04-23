import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import type { Class } from '@/types'

export default function StudentClassesPage() {
  const { user } = useAuthStore()
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('classes')
      .select('*, class_assignments!inner(student_id)')
      .eq('class_assignments.student_id', user.id)
      .order('class_date', { ascending: false })
      .then(({ data }) => { setClasses(data ?? []); setLoading(false) })
  }, [user])

  const now = new Date()
  const upcoming = classes.filter((c) => new Date(c.class_date) >= now)
  const past = classes.filter((c) => new Date(c.class_date) < now)

  const ClassCard = ({ c }: { c: Class }) => (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex items-start justify-between gap-3">
      <div className="border-l-4 border-[#6C63FF] pl-3 flex-1">
        <p className="font-medium text-gray-800">{c.topic}</p>
        <p className="text-sm text-muted-foreground">{format(new Date(c.class_date), 'PPp')}</p>
        {c.teacher_note && <p className="text-xs text-muted-foreground mt-1 italic">{c.teacher_note}</p>}
      </div>
      {c.zoom_link && (
        <Button asChild size="sm" className="rounded-pill bg-[#6C63FF] hover:bg-[#5a52d5] shrink-0">
          <a href={c.zoom_link} target="_blank" rel="noopener noreferrer">Join</a>
        </Button>
      )}
    </div>
  )

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
