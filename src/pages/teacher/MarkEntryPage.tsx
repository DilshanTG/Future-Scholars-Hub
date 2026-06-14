import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/shared/PageHeader'
import { AvatarCircle } from '@/components/shared/AvatarCircle'
import { Skeleton } from '@/components/ui/skeleton'
import type { Student } from '@/types'

export default function MarkEntryPage() {
  const [students, setStudents] = useState<Student[] | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase
      .from('students')
      .select('*')
      .eq('archived', false)
      .order('name')
      .then(({ data }) => setStudents((data as Student[]) ?? []))
  }, [])

  const filtered = (students ?? []).filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.mobile.includes(search),
  )

  return (
    <div className="space-y-4">
      <PageHeader title="Mark Worksheet" subtitle="Pick a student to start marking their work" />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or mobile…"
          className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-[#6C63FF] focus:outline-none"
        />
      </div>

      {!students ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">No students found</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => (
            <Link
              key={s.id}
              to={`/teacher/students/${s.id}/mark`}
              className="flex items-center gap-3 rounded-xl border bg-white p-3 hover:border-[#6C63FF]"
            >
              <AvatarCircle emoji={s.avatar} size="sm" />
              <div className="flex-1">
                <p className="font-medium text-gray-800">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.grade}</p>
              </div>
              <span className="flex items-center gap-1 rounded-pill bg-[#6C63FF] px-3 py-1 text-xs font-medium text-white">
                <Pencil className="h-3.5 w-3.5" /> Mark
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
