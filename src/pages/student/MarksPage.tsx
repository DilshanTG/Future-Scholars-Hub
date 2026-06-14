import { useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/skeleton'
import { MarksOutAnimation } from '@/components/shared/MarksOutAnimation'
import { getMarkStyle, pct } from '@/lib/markStyle'
import { colomboFormat } from '@/lib/dates'
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import type { Mark } from '@/types'

const STORAGE_KEY = (id: string) => `fsh_marks_last_seen_${id}`
const PAGE_SIZE = 12

export default function StudentMarksPage() {
  const { user } = useAuthStore()
  const [marks, setMarks] = useState<Mark[]>([])
  const [loading, setLoading] = useState(true)
  const [showAnimation, setShowAnimation] = useState(false)
  const [page, setPage] = useState(1)

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

  const totalPages = Math.max(1, Math.ceil(marks.length / PAGE_SIZE))
  const pageMarks = marks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Group current page's marks by month
  const grouped: { month: string; items: Mark[] }[] = []
  for (const m of pageMarks) {
    const month = colomboFormat(m.created_at, 'MMMM yyyy')
    const last = grouped[grouped.length - 1]
    if (last && last.month === month) {
      last.items.push(m)
    } else {
      grouped.push({ month, items: [m] })
    }
  }

  const goTo = (p: number) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
    </div>
  )

  return (
    <>
      {showAnimation && <MarksOutAnimation onDone={handleAnimationDone} />}

      <div>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Marks 🎯</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {marks.length} result{marks.length !== 1 ? 's' : ''}
            </p>
          </div>
          {totalPages > 1 && (
            <p className="text-xs text-muted-foreground pb-0.5">
              Page {page} of {totalPages}
            </p>
          )}
        </div>

        {marks.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-5xl mb-3">📝</p>
            <p className="text-lg font-medium">No marks yet</p>
            <p className="text-sm mt-1">Your results will appear here once your teacher adds them.</p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {grouped.map(({ month, items }) => (
                <div key={month}>
                  {/* Month header */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{month}</span>
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-muted-foreground">{items.length} test{items.length !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Cards */}
                  <div className="space-y-2.5">
                    {items.map((m) => {
                      const style = getMarkStyle(m.score, m.total)
                      const percent = pct(m.score, m.total)
                      return (
                        <div
                          key={m.id}
                          className="group flex bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default"
                        >
                          {/* Grade panel */}
                          <div className={`bg-gradient-to-b ${style.gradient} w-[68px] shrink-0 flex flex-col items-center justify-center gap-1`}>
                            <span className="text-white font-black text-3xl leading-none">{style.label}</span>
                            <span className="text-white/80 text-xs font-semibold">{percent}%</span>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 px-4 py-3.5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="font-bold text-gray-800 text-[15px] leading-snug truncate">{m.title}</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">{colomboFormat(m.created_at, 'PP')}</p>
                                {m.file_url && (
                                  <a href={m.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-[#6C63FF] mt-1 hover:underline">
                                    <FileText className="w-3.5 h-3.5" /> View marked PDF
                                  </a>
                                )}
                              </div>
                              <div className="shrink-0 text-right leading-none mt-0.5">
                                <span className="text-xl font-black text-gray-800">{m.score}</span>
                                <span className="text-xs text-muted-foreground font-medium"> /{m.total}</span>
                              </div>
                            </div>

                            {/* Progress bar */}
                            <div className="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${style.bar} transition-all duration-700`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => goTo(page - 1)}
                  disabled={page === 1}
                  className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => goTo(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${
                      p === page
                        ? 'bg-[#6C63FF] text-white shadow-sm'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => goTo(page + 1)}
                  disabled={page === totalPages}
                  className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
