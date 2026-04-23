import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/skeleton'
import { format, isPast } from 'date-fns'
import type { Announcement } from '@/types'

function noteRotation(id: string): string {
  const n = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
  const deg = ((n % 5) - 2) * 0.5
  return `rotate(${deg}deg)`
}

const NOTE_COLORS = [
  { bg: 'linear-gradient(180deg,#fffde7 0%,#fff9c4 100%)', border: 'rgba(253,230,138,0.8)' },
  { bg: 'linear-gradient(180deg,#f0fdf4 0%,#dcfce7 100%)', border: 'rgba(134,239,172,0.6)' },
  { bg: 'linear-gradient(180deg,#fdf4ff 0%,#fae8ff 100%)', border: 'rgba(216,180,254,0.6)' },
  { bg: 'linear-gradient(180deg,#fff7ed 0%,#ffedd5 100%)', border: 'rgba(253,186,116,0.6)' },
  { bg: 'linear-gradient(180deg,#f0f9ff 0%,#e0f2fe 100%)', border: 'rgba(125,211,252,0.6)' },
]

export default function StudentAnnouncementsPage() {
  const { user } = useAuthStore()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const now = new Date()
    supabase
      .from('announcements')
      .select('*')
      .or(`expire_date.is.null,expire_date.gt.${now.toISOString()}`)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setAnnouncements(data ?? []); setLoading(false) })
  }, [user])

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">Announcements</h1>

      {loading ? (
        <div className="columns-1 sm:columns-2 gap-4 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-sm w-full" />)}
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-2">📢</p>
          <p style={{ fontFamily: 'Caveat, cursive', fontSize: '22px' }}>No announcements yet</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 gap-6">
          {announcements.map((a, i) => {
            const color = NOTE_COLORS[i % NOTE_COLORS.length]
            return (
              <div
                key={a.id}
                className="break-inside-avoid mb-6 inline-block w-full"
                style={{ transform: noteRotation(a.id), transition: 'transform 0.2s' }}
              >
                {/* Tape */}
                <div className="flex justify-center -mb-3 relative z-10">
                  <div style={{
                    width: '56px', height: '22px', borderRadius: '3px',
                    background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,0,0,0.07)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                  }} />
                </div>

                {/* Note card */}
                <div style={{
                  background: color.bg,
                  border: `1px solid ${color.border}`,
                  borderRadius: '3px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.7)',
                  padding: '20px 20px 16px 52px',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {/* Red margin line */}
                  <div style={{
                    position: 'absolute', top: 0, bottom: 0, left: '40px',
                    width: '2px', background: 'rgba(239,68,68,0.3)',
                  }} />

                  {/* Ruled lines */}
                  <div style={{ position: 'absolute', inset: 0, paddingTop: '48px', pointerEvents: 'none' }}>
                    {Array.from({ length: 8 }).map((_, li) => (
                      <div key={li} style={{ height: '28px', borderBottom: '1px solid rgba(147,197,253,0.35)' }} />
                    ))}
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontFamily: 'Caveat, cursive',
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#1e293b',
                    lineHeight: 1.2,
                    marginBottom: '10px',
                    position: 'relative',
                  }}>
                    📌 {a.title}
                  </h3>

                  {/* Message */}
                  <p style={{
                    fontFamily: 'Caveat, cursive',
                    fontSize: '19px',
                    fontWeight: 500,
                    color: '#334155',
                    lineHeight: 1.65,
                    position: 'relative',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {a.message}
                  </p>

                  {/* Footer */}
                  <div style={{
                    marginTop: '14px',
                    paddingTop: '10px',
                    borderTop: '1px dashed rgba(147,197,253,0.4)',
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{ fontFamily: 'Caveat, cursive', fontSize: '14px', color: '#64748b' }}>
                      ✍️ {format(new Date(a.created_at), 'PP')}
                    </span>
                    {a.expire_date && !isPast(new Date(a.expire_date)) && (
                      <span style={{ fontFamily: 'Caveat, cursive', fontSize: '13px', color: '#f97316' }}>
                        expires {format(new Date(a.expire_date), 'PP')}
                      </span>
                    )}
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
