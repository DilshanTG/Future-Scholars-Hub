import { useEffect, useState } from 'react'
import { FileText } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Skeleton } from '@/components/ui/skeleton'
import type { MarkedWorksheetRow } from '@/types/marking'

export default function MarkedWorkPage() {
  const { user } = useAuthStore()
  const [rows, setRows] = useState<MarkedWorksheetRow[] | null>(null)

  useEffect(() => {
    if (!user) return
    supabase
      .from('marked_worksheets')
      .select('*')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setRows((data as MarkedWorksheetRow[]) ?? []))
  }, [user])

  if (!rows) return <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>

  return (
    <div className="space-y-3">
      <h1 className="text-lg font-semibold">Marked Work</h1>
      {rows.length === 0 && <p className="py-8 text-center text-muted-foreground">No marked worksheets yet</p>}
      {rows.map((r) => (
        <a key={r.id} href={r.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border bg-white p-3 hover:border-[#6C63FF]">
          <FileText className="h-5 w-5 text-[#6C63FF]" />
          <div className="flex-1">
            <p className="text-sm font-medium">{r.title ?? 'Marked Worksheet'}</p>
            <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()} · {r.page_count ?? '?'} pages</p>
          </div>
        </a>
      ))}
    </div>
  )
}
