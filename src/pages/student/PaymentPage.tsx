import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { Payment } from '@/types'

export default function StudentPaymentPage() {
  const { user } = useAuthStore()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('payments')
      .select('*')
      .eq('student_id', user.id)
      .order('year', { ascending: false })
      .order('month')
      .then(({ data }) => { setPayments(data ?? []); setLoading(false) })
  }, [user])

  const paidCount = payments.filter((p) => p.status === 'paid').length

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-4">Payment History</h1>
      <div className="bg-gradient-to-r from-[#6C63FF] to-[#8B85FF] rounded-2xl p-4 text-white mb-4">
        <p className="text-sm text-white/80">Total Paid</p>
        <p className="text-3xl font-bold">{paidCount} <span className="text-lg font-normal">months</span></p>
      </div>
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
      ) : payments.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground"><p className="text-4xl mb-2">💰</p><p>No payment records</p></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="divide-y">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-medium text-gray-800">{p.month}</p>
                  <p className="text-xs text-muted-foreground">{p.year}</p>
                </div>
                <Badge className={p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}>
                  {p.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
