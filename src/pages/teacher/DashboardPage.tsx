import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/skeleton'
import { GraduationCap, CalendarDays, UserCheck, Plus, Calendar, Megaphone, Layers } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

interface Stats { totalStudents: number; activeStudents: number; totalClasses: number }

const quickActions = [
  { to: '/teacher/students/add', label: 'Add Student', Icon: Plus, color: 'bg-[#6C63FF] text-white', desc: 'Enroll a new student' },
  { to: '/teacher/classes/add', label: 'Add Class', Icon: Calendar, color: 'bg-blue-500 text-white', desc: 'Schedule a class' },
  { to: '/teacher/classes/bulk', label: 'Bulk Classes', Icon: Layers, color: 'bg-indigo-500 text-white', desc: 'Add multiple classes' },
  { to: '/teacher/announcements/add', label: 'Announce', Icon: Megaphone, color: 'bg-pink-500 text-white', desc: 'Post an announcement' },
]

export default function TeacherDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<Stats>({ totalStudents: 0, activeStudents: 0, totalClasses: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const [{ count: total }, { count: active }, { count: classes }] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('classes').select('*', { count: 'exact', head: true }),
      ])
      setStats({ totalStudents: total ?? 0, activeStudents: active ?? 0, totalClasses: classes ?? 0 })
      setLoading(false)
    }
    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="gradient-primary rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="relative">
          <p className="text-white/70 text-sm font-medium">Welcome back 👋</p>
          <h1 className="text-2xl font-bold mt-0.5">{user?.name ?? 'Teacher'}</h1>
          <p className="text-white/70 text-sm mt-1">Here's what's happening with your students today.</p>
        </div>
      </div>

      {/* Stats */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Overview</p>
        <div className="grid grid-cols-3 gap-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
          ) : (
            <>
              {[
                { label: 'Total Students', value: stats.totalStudents, Icon: GraduationCap, color: 'bg-[#6C63FF]/10 text-[#6C63FF]' },
                { label: 'Active', value: stats.activeStudents, Icon: UserCheck, color: 'bg-green-100 text-green-600' },
                { label: 'Classes', value: stats.totalClasses, Icon: CalendarDays, color: 'bg-blue-100 text-blue-600' },
              ].map(({ label, value, Icon, color }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                    <Icon className="w-[18px] h-[18px]" />
                  </div>
                  <p className="text-2xl font-black text-gray-800">{value}</p>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">{label}</p>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map(({ to, label, Icon, color, desc }) => (
            <Link key={to} to={to} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color} shadow-sm`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="font-bold text-gray-800 text-sm">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
