import { useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/skeleton'
import { MarksOutAnimation } from '@/components/shared/MarksOutAnimation'
import { getMarkStyle, pct } from '@/lib/markStyle'
import { colomboFormat } from '@/lib/dates'
import type { Mark } from '@/types'

const STORAGE_KEY = (id: string) => `fsh_marks_last_seen_${id}`

export default function StudentMarksPage() {
  const { user } = useAuthStore()
  const [marks, setMarks] = useState<Mark[]>([])
  const [loading, setLoading] = useState(true)
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from('marks')
      .select('*')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const list = data ?? []
        setMarks(list)
        setLoading(false)

        if (list.length === 0) return

        const lastSeen = localStorage.getItem(STORAGE_KEY(user.id))
        const latestCreated = list[0].created_at
        if (!lastSeen || new Date(latestCreated) > new Date(lastSeen)) {
          setShowAnimation(true)
        }
        localStorage.setItem(STORAGE_KEY(user.id), new Date().toISOString())
      })
  }, [user])

  const handleAnimationDone = useCallback(() => setShowAnimation(false), [])

  if (loading) return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
    </div>
  )

  return (
    <>
      {showAnimation && <MarksOutAnimation onDone={handleAnimationDone} />}

      <div className="max-w-2xl mx-auto">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-800">My Marks 🎯</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Keep pushing — every mark tells your story!</p>
        </div>

        {marks.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-5xl mb-3">📝</p>
            <p className="text-lg font-medium">No marks yet</p>
            <p className="text-sm mt-1">Your results will appear here once your teacher adds them.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {marks.map((m) => {
              const style = getMarkStyle(m.score, m.total)
              const percent = pct(m.score, m.total)
              return (
                <div
                  key={m.id}
                  className="group relative bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-default"
                >
                  {/* Gradient accent bar */}
                  <div className={`h-2 w-full bg-gradient-to-r ${style.gradient}`} />

                  {/* Glow on hover */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br ${style.gradient} pointer-events-none`} />

                  <div className="p-5 relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-base leading-snug">{m.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{colomboFormat(m.created_at, 'PP')}</p>

                        {/* Progress bar */}
                        <div className="mt-3 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${style.bar} transition-all duration-1000`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{percent}% complete</p>
                      </div>

                      {/* Score badge */}
                      <div className="shrink-0 text-center">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${style.gradient} flex flex-col items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                          <span className="text-white font-extrabold text-xl leading-none">{m.score}</span>
                          <span className="text-white/70 text-xs">/{m.total}</span>
                        </div>
                        <p className="text-lg mt-1">{style.emoji}</p>
                      </div>
                    </div>

                    {/* Motivational label */}
                    <div className="mt-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full border font-semibold ${style.badge}`}>
                        {style.emoji} {style.label}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
