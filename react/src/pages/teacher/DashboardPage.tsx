import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { StatCard } from '@/components/shared/StatCard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface Stats {
  totalStudents: number
  activeStudents: number
  totalClasses: number
}

export default function TeacherDashboard() {
  const [stats, setStats] = useState<Stats>({ totalStudents: 0, activeStudents: 0, totalClasses: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const [{ count: total }, { count: active }, { count: classes }] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('classes').select('*', { count: 'exact', head: true }),
      ])
      setStats({
        totalStudents: total ?? 0,
        activeStudents: active ?? 0,
        totalClasses: classes ?? 0,
      })
      setLoading(false)
    }
    fetchStats()
  }, [])

  return (
    <div>
      {/* Welcome banner */}
      <div className="gradient-primary rounded-2xl p-6 mb-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back! 👋</h1>
        <p className="text-white/80 mt-1">Here's what's happening with your students today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))
        ) : (
          <>
            <StatCard emoji="👨‍🎓" label="Total Students" value={stats.totalStudents} color="#6C63FF" />
            <StatCard emoji="✅" label="Active Learners" value={stats.activeStudents} color="#4CAF50" />
            <StatCard emoji="📅" label="Total Classes" value={stats.totalClasses} color="#FF6584" />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="rounded-pill bg-[#6C63FF] hover:bg-[#5a52d5]">
            <Link to="/teacher/students/add">+ Add Student</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-pill">
            <Link to="/teacher/classes/add">+ Add Class</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-pill">
            <Link to="/teacher/classes/bulk">Bulk Classes</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-pill">
            <Link to="/teacher/announcements/add">+ Announcement</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
