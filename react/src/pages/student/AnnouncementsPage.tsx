import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/skeleton'
import { format, isPast } from 'date-fns'
import type { Announcement } from '@/types'

export default function StudentAnnouncementsPage() {
  const { user } = useAuthStore()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const now = new Date()
    supabase
      .from('announcements')
      .select('*, announcement_assignments!inner(student_id)')
      .or(`announcement_assignments.student_id.eq.${user.id},announcement_assignments.student_id.is.null`)
      .or(`expire_date.is.null,expire_date.gt.${now.toISOString()}`)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setAnnouncements(data ?? []); setLoading(false) })
  }, [user])

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-4">Announcements</h1>
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground"><p className="text-4xl mb-2">📢</p><p>No announcements</p></div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-800">{a.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{a.message}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground">{format(new Date(a.created_at), 'PP')}</span>
                {a.expire_date && !isPast(new Date(a.expire_date)) && (
                  <span className="text-xs text-orange-500">· Expires {format(new Date(a.expire_date), 'PP')}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
