import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Play, Copy } from 'lucide-react'
import type { Recording } from '@/types'

export default function StudentRecordingsPage() {
  const { user } = useAuthStore()
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [loading, setLoading] = useState(true)
  const [inactive, setInactive] = useState(false)

  useEffect(() => {
    if (!user) return
    async function load() {
      const { data: student } = await supabase.from('students').select('status').eq('id', user!.id).single()
      if (student?.status === 'inactive') { setInactive(true); setLoading(false); return }
      const { data } = await supabase.from('recordings').select('*, recording_assignments!inner(student_id)')
        .eq('recording_assignments.student_id', user!.id).order('created_at', { ascending: false })
      setRecordings(data ?? [])
      setLoading(false)
    }
    load()
  }, [user])

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Recordings 🎥</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your class recordings</p>
      </div>

      {inactive && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3 mb-4">
          Your account is inactive. Contact your teacher to access recordings.
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
      ) : !inactive && recordings.length === 0 ? (
        <div className="text-center py-16"><p className="text-4xl mb-2">🎥</p><p className="text-muted-foreground">No recordings assigned yet</p></div>
      ) : !inactive ? (
        <div className="space-y-3">
          {recordings.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex">
                <div className="w-16 shrink-0 bg-gradient-to-b from-[#6C63FF] to-indigo-500 flex items-center justify-center">
                  <Play className="w-6 h-6 text-white" fill="white" />
                </div>
                <div className="flex-1 min-w-0 p-4">
                  <h3 className="font-bold text-gray-800">{r.topic}</h3>
                  {r.description && <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{r.description}</p>}
                  {r.meeting_password && (
                    <div className="flex items-center gap-2 mt-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5">
                      <span className="text-xs text-amber-700 font-medium shrink-0">🔐 Password:</span>
                      <span className="text-xs font-mono font-bold text-amber-800 flex-1 truncate">{r.meeting_password}</span>
                      <button onClick={() => { navigator.clipboard.writeText(r.meeting_password!); toast.success('Copied!') }}
                        className="shrink-0 p-1 rounded-lg hover:bg-amber-100 text-amber-600 transition-colors">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <a href={r.link} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold bg-[#6C63FF] text-white px-3 py-1.5 rounded-xl hover:bg-[#5a52d5] transition-colors">
                    <Play className="w-3 h-3" />Watch Recording
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
