import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
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
      const { data } = await supabase
        .from('recordings')
        .select('*, recording_assignments!inner(student_id)')
        .eq('recording_assignments.student_id', user!.id)
        .order('created_at', { ascending: false })
      setRecordings(data ?? [])
      setLoading(false)
    }
    load()
  }, [user])

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-4">Recordings</h1>
      {inactive && (
        <Alert variant="destructive" className="rounded-xl mb-4">
          <AlertDescription>Your account is inactive. Contact your teacher to access recordings.</AlertDescription>
        </Alert>
      )}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
      ) : !inactive && recordings.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground"><p className="text-4xl mb-2">🎥</p><p>No recordings assigned yet</p></div>
      ) : !inactive ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recordings.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl shadow-sm p-4 card-hover">
              <h3 className="font-semibold text-gray-800">{r.topic}</h3>
              {r.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.description}</p>}
              {r.meeting_password && (
                <div className="flex items-center gap-2 mt-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5">
                  <span className="text-xs text-amber-700 font-medium">🔐 Password:</span>
                  <span className="text-xs font-mono font-bold text-amber-800 flex-1">{r.meeting_password}</span>
                  <button
                    type="button"
                    onClick={() => { navigator.clipboard.writeText(r.meeting_password!); toast.success('Password copied!') }}
                    className="text-xs text-amber-600 hover:text-amber-800 border border-amber-300 rounded-lg px-2 py-0.5 hover:bg-amber-100 transition-colors shrink-0"
                  >
                    Copy
                  </button>
                </div>
              )}
              <Button asChild size="sm" className="mt-3 rounded-pill bg-[#6C63FF] hover:bg-[#5a52d5]">
                <a href={r.link} target="_blank" rel="noopener noreferrer">▶ Watch</a>
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
