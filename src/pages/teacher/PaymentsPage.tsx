import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { AvatarCircle } from '@/components/shared/AvatarCircle'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Search } from 'lucide-react'
import { MONTHS } from '@/lib/constants'
import { toast } from 'sonner'
import type { Student } from '@/types'

interface StudentPaymentRow extends Student {
  paymentStatus: 'paid' | 'unpaid'
  loadingPayment: boolean
}

export default function PaymentsPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.toLocaleString('default', { month: 'long' }))
  const [year, setYear] = useState(now.getFullYear().toString())
  const [rows, setRows] = useState<StudentPaymentRow[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [grades, setGrades] = useState<string[]>([])

  const years = Array.from({ length: 5 }, (_, i) => (now.getFullYear() - 2 + i).toString())

const fetchPayments = async () => {
    setLoading(true)
    const [{ data: students }, { data: payments }] = await Promise.all([
      supabase.from('students').select('*').eq('archived', false).order('name'),
      supabase.from('payments').select('*').eq('month', month).eq('year', parseInt(year)),
    ])
    const paymentMap = new Map((payments ?? []).map((p: { student_id: string; status: string }) => [p.student_id, p.status]))
    const enriched = (students ?? []).map((s) => ({
      ...s,
      paymentStatus: (paymentMap.get(s.id) ?? 'unpaid') as 'paid' | 'unpaid',
      loadingPayment: false,
    }))
    setRows(enriched)

    const distinctGrades = [...new Set((students ?? []).map((s) => s.grade))].sort()
    setGrades(distinctGrades)
    setLoading(false)
  }

  useEffect(() => { fetchPayments() }, [month, year])

  const paidCount = filtered.filter((r) => r.paymentStatus === 'paid').length
  const unpaidCount = filtered.filter((r) => r.paymentStatus === 'unpaid').length

  return (
    <div>
      <PageHeader title="Payments" subtitle={`${month} ${year}`} />

      {loading ? (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard emoji="💰" label="Collected" value={paidCount} color="#22C55E" />
          <StatCard emoji="⏳" label="Pending" value={unpaidCount} color="#F59E0B" />
        </div>
      )}

      {/* Period selectors */}
      <div className="flex flex-wrap gap-2 mb-3">
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-36 rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>{MONTHS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-28 rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>{years.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {/* Search + filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
        <Select value={gradeFilter} onValueChange={setGradeFilter}>
          <SelectTrigger className="w-32 rounded-xl"><SelectValue placeholder="Grade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            {grades.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32 rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-32 rounded-xl"><SelectValue placeholder="Payment" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground"><p className="text-4xl mb-2">💰</p><p>No students found</p></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Desktop */}
          <table className="w-full hidden md:table">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Student</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Grade</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <AvatarCircle emoji={r.avatar} size="sm" />
                      <div>
                        <p className="font-medium text-gray-800">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.mobile}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{r.grade}</Badge></td>
                  <td className="px-4 py-3">
                    <Badge className={r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                      {r.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={r.paymentStatus === 'paid'}
                        onCheckedChange={(checked) => togglePayment(r.id, checked ? 'paid' : 'unpaid')}
                        disabled={r.loadingPayment}
                      />
                      <Badge className={`text-xs ${r.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {r.paymentStatus}
                      </Badge>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile */}
          <div className="md:hidden divide-y">
            {filtered.map((r) => (
              <div key={r.id} className="p-4 flex items-center gap-3">
                <AvatarCircle emoji={r.avatar} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-800 truncate">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.grade} · {r.mobile}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch
                    checked={r.paymentStatus === 'paid'}
                    onCheckedChange={(checked) => togglePayment(r.id, checked ? 'paid' : 'unpaid')}
                    disabled={r.loadingPayment}
                  />
                  <Badge className={`text-xs ${r.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {r.paymentStatus}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
