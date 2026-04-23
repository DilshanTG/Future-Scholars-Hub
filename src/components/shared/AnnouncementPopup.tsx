import { useEffect, useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import type { Announcement } from '@/types'

interface AnnouncementPopupProps {
  announcements: Announcement[]
}

const STORAGE_KEY = 'fsh_dismissed_announcements'

function getDismissed(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}

function saveDismissed(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

// Slight random rotation for each note — deterministic from id
function noteRotation(id: string): string {
  const n = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
  const deg = ((n % 7) - 3) * 0.6  // -1.8 to +1.8 degrees
  return `rotate(${deg}deg)`
}

export function AnnouncementPopup({ announcements }: AnnouncementPopupProps) {
  const [visible, setVisible] = useState(false)
  const [index, setIndex] = useState(0)
  const [undismissed, setUndismissed] = useState<Announcement[]>([])

  useEffect(() => {
    if (announcements.length === 0) return
    const dismissed = getDismissed()
    const fresh = announcements.filter((a) => !dismissed.includes(a.id))
    if (fresh.length > 0) {
      setUndismissed(fresh)
      setIndex(0)
      setVisible(true)
    }
  }, [announcements])

  if (!visible || undismissed.length === 0) return null

  const current = undismissed[index]

  const dismissCurrent = () => {
    const dismissed = getDismissed()
    saveDismissed([...dismissed, current.id])
    const remaining = undismissed.filter((a) => a.id !== current.id)
    if (remaining.length === 0) {
      setVisible(false)
    } else {
      setUndismissed(remaining)
      setIndex(Math.min(index, remaining.length - 1))
    }
  }

  const dismissAll = () => {
    const dismissed = getDismissed()
    saveDismissed([...dismissed, ...undismissed.map((a) => a.id)])
    setVisible(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}>

      {/* Stacked cards behind (visual depth) */}
      {undismissed.length > 1 && (
        <>
          {undismissed.length > 2 && (
            <div className="absolute w-80 sm:w-96"
              style={{ transform: `rotate(3.5deg) translateY(8px)`, background: '#fde68a', borderRadius: '4px', height: '200px', boxShadow: '2px 4px 12px rgba(0,0,0,0.15)' }} />
          )}
          <div className="absolute w-80 sm:w-96"
            style={{ transform: `rotate(-2deg) translateY(4px)`, background: '#fef3c7', borderRadius: '4px', height: '200px', boxShadow: '2px 4px 12px rgba(0,0,0,0.15)' }} />
        </>
      )}

      {/* Main note card */}
      <div
        className="relative w-80 sm:w-96"
        style={{
          transform: noteRotation(current.id),
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Tape strip at top */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 rounded-sm z-10"
          style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />

        {/* Paper */}
        <div className="relative rounded-sm overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #fffde7 0%, #fff9c4 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.8)',
          }}>

          {/* Red margin line */}
          <div className="absolute top-0 bottom-0 left-10"
            style={{ width: '2px', background: 'rgba(239,68,68,0.35)' }} />

          {/* Horizontal ruled lines */}
          <div className="absolute inset-0 pointer-events-none" style={{ paddingTop: '48px' }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ height: '32px', borderBottom: '1px solid rgba(147,197,253,0.4)' }} />
            ))}
          </div>

          {/* Content */}
          <div className="relative px-5 pt-5 pb-6" style={{ paddingLeft: '52px' }}>

            {/* Header row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📌</span>
                {undismissed.length > 1 && (
                  <span style={{ fontFamily: 'Caveat, cursive', fontSize: '13px', color: '#92400e', opacity: 0.7 }}>
                    {index + 1} of {undismissed.length}
                  </span>
                )}
              </div>
              <button onClick={dismissAll} className="text-gray-400 hover:text-gray-600 transition-colors -mt-1 -mr-2">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Title */}
            <h2 style={{
              fontFamily: 'Caveat, cursive',
              fontSize: '26px',
              fontWeight: 700,
              color: '#1e293b',
              lineHeight: '1.2',
              marginBottom: '12px',
              letterSpacing: '0.3px',
            }}>
              {current.title}
            </h2>

            {/* Message body */}
            <p style={{
              fontFamily: 'Caveat, cursive',
              fontSize: '20px',
              fontWeight: 500,
              color: '#334155',
              lineHeight: '1.7',
              letterSpacing: '0.2px',
              minHeight: '80px',
            }}>
              {current.message}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between mt-5 pt-3"
              style={{ borderTop: '1px dashed rgba(147,197,253,0.5)' }}>
              <span style={{ fontFamily: 'Caveat, cursive', fontSize: '15px', color: '#64748b' }}>
                ✍️ {format(new Date(current.created_at), 'PP')}
                {current.expire_date && (
                  <span style={{ color: '#f97316', marginLeft: '8px' }}>
                    · expires {format(new Date(current.expire_date), 'PP')}
                  </span>
                )}
              </span>

              {/* Navigation */}
              {undismissed.length > 1 && (
                <div className="flex items-center gap-1">
                  <button onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}
                    className="p-1 rounded hover:bg-yellow-200 disabled:opacity-30 transition-colors">
                    <ChevronLeft className="h-4 w-4 text-amber-700" />
                  </button>
                  <button onClick={() => setIndex((i) => Math.min(undismissed.length - 1, i + 1))} disabled={index === undismissed.length - 1}
                    className="p-1 rounded hover:bg-yellow-200 disabled:opacity-30 transition-colors">
                    <ChevronRight className="h-4 w-4 text-amber-700" />
                  </button>
                </div>
              )}
            </div>

            {/* Got it button */}
            <button
              onClick={dismissCurrent}
              style={{
                fontFamily: 'Caveat, cursive',
                fontSize: '20px',
                fontWeight: 700,
                marginTop: '16px',
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #6C63FF, #8B85FF)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(108,99,255,0.4)',
                letterSpacing: '0.5px',
              }}
            >
              Got it! 👍
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
