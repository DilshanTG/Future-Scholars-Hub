import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/shared/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import type { Announcement } from '@/types'

export default function AnnouncementsHistoryPage() {
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('announcements')
      .select('*, announcement_assignments(student_id)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setItems((data ?? []).map((a) => ({
          ...a,
          is_all: (a.announcement_assignments ?? []).some((aa: { student_id: string | null }) => aa.student_id === null),
        })))
        setLoading(false)
      })
  }, [])

  const now = new Date()

  return (
    <div>
      <PageHeader title="Announcement History" backTo="/teacher/announcements" />
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground"><p className="text-4xl mb-2">📋</p><p>No announcements</p></div>
      ) : (
        <div className="space-y-3">
          {items.map((a) => {
            const expired = a.expire_date ? new Date(a.expire_date) < now : false
            return (
              <div key={a.id} className={`bg-white rounded-2xl shadow-sm p-4 ${expired ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-gray-800">{a.title}</h3>
                      <Badge className={a.is_all ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}>
                        {a.is_all ? 'All' : 'Specific'}
                      </Badge>
                      {expired && <Badge className="bg-gray-100 text-gray-500">Expired</Badge>}
                      {a.expire_date && !expired && (
                        <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                          Expires {format(new Date(a.expire_date), 'PP')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{a.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">{format(new Date(a.created_at), 'PPp')}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
