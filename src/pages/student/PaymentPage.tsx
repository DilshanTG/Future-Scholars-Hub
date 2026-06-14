import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle2, XCircle } from 'lucide-react'
import type { Payment } from '@/types'

export default function StudentPaymentPage() {
  const { user } = useAuthStore()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase.from('payments').select('*').eq('student_id', user.id)
      .order('year', { ascending: false }).order('month')
      .then(({ data }) => { setPayments(data ?? []); setLoading(false) })
  }, [user])

  const paidCount = payments.filter(p => p.status === 'paid').length
  const unpaidCount = payments.filter(p => p.status === 'unpaid').length

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Payments 💰</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your payment history</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-[18px] h-[18px] text-green-600" />
          </div>
          <p className="text-xs text-muted-foreground font-medium">Paid Months</p>
          <p className="text-2xl font-black text-green-600 mt-0.5">{paidCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center mb-3">
            <XCircle className="w-[18px] h-[18px] text-red-500" />
          </div>
          <p className="text-xs text-muted-foreground font-medium">Unpaid Months</p>
          <p className="text-2xl font-black text-red-500 mt-0.5">{unpaidCount}</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
      ) : payments.length === 0 ? (
        <div className="text-center py-16"><p className="text-4xl mb-2">💰</p><p className="text-muted-foreground">No payment records</p></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3.5">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{p.month}</p>
                  <p className="text-xs text-muted-foreground">{p.year}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                  p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                }`}>
                  {p.status === 'paid' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {p.status === 'paid' ? 'Paid' : 'Unpaid'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
