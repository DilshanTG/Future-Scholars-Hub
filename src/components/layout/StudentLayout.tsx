import { useEffect, useState } from 'react'
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import {
  Home, CalendarDays, Trophy, BookOpen, Grid2X2,
  PlayCircle, Bell, Wallet, User, LogOut,
} from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/layout/Footer'

const allNav = [
  { to: '/student/dashboard', label: 'Home', Icon: Home },
  { to: '/student/classes', label: 'Classes', Icon: CalendarDays },
  { to: '/student/marks', label: 'Marks', Icon: Trophy },
  { to: '/student/notes', label: 'Notes', Icon: BookOpen },
  { to: '/student/recordings', label: 'Recordings', Icon: PlayCircle },
  { to: '/student/announcements', label: 'Announcements', Icon: Bell },
  { to: '/student/payment', label: 'Payments', Icon: Wallet },
  { to: '/student/profile', label: 'Profile', Icon: User },
]

const bottomMain = allNav.slice(0, 4)
const bottomMore = allNav.slice(4)

function SidebarContent({ onNavClick, onSignOut, userAvatar, userName }: {
  onNavClick?: () => void; onSignOut: () => void; userAvatar?: string; userName?: string
}) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-6 py-6 border-b border-gray-100">
        <Link to="/student/dashboard" onClick={onNavClick} className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#6C63FF] flex items-center justify-center text-2xl shadow-sm">🎓</div>
          <p className="font-bold text-gray-800 text-base leading-tight">Future Scholars Hub</p>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
        {allNav.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-[#6C63FF] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-1">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl">
          <div className="w-10 h-10 rounded-xl bg-[#6C63FF]/10 flex items-center justify-center text-xl shrink-0">
            {userAvatar}
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold text-gray-800 truncate">{userName}</p>
            <p className="text-sm text-gray-400">Student</p>
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />Sign Out
        </button>
      </div>
    </div>
  )
}

export default function StudentLayout() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [status, setStatus] = useState<'active' | 'inactive' | 'loading'>('loading')
  const [moreOpen, setMoreOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from('students').select('status').eq('id', user.id).single()
      .then(({ data }) => setStatus(data?.status ?? 'active'))
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  const isMoreActive = bottomMore.some(({ to }) => location.pathname.startsWith(to))

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F4FF]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#6C63FF] flex items-center justify-center text-3xl shadow-lg">🎓</div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-[#6C63FF]/60 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (status === 'inactive') {
    return (
      <div className="min-h-screen bg-[#F5F4FF] flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white rounded-3xl shadow-sm border border-red-100 p-8 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Account Inactive</h1>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Your account is currently inactive. Please contact your teacher to reactivate.
          </p>
          <Button onClick={handleSignOut} className="w-full bg-[#6C63FF] hover:bg-[#5a52d5] rounded-xl h-11">
            <LogOut className="h-4 w-4 mr-2" />Sign Out
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F4FF] flex">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex lg:w-72 shrink-0 flex-col fixed inset-y-0 left-0 border-r border-gray-100 shadow-sm z-30">
        <SidebarContent onSignOut={handleSignOut} userAvatar={user?.avatar} userName={user?.name} />
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-72">

        {/* Mobile top header */}
        <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
          <div className="px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#6C63FF] flex items-center justify-center text-sm">🎓</div>
              <span className="font-bold text-gray-800 text-sm">Future Scholars Hub</span>
            </div>
            <button
              onClick={() => navigate('/student/profile')}
              className="w-9 h-9 rounded-full bg-[#6C63FF]/10 hover:bg-[#6C63FF]/20 transition-colors flex items-center justify-center text-lg"
            >
              {user?.avatar}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-5 lg:px-10 py-6 pb-24 lg:pb-10 w-full">
          <Outlet />
        </main>

        <div className="hidden lg:block">
          <Footer />
        </div>

        {/* ── Mobile bottom nav ── */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-100">
          <div className="flex items-center justify-around h-16 px-2">
            {bottomMain.map(({ to, label, Icon }) => (
              <NavLink key={to} to={to} className="flex flex-col items-center gap-0.5 px-3 py-1 flex-1">
                {({ isActive }) => (
                  <>
                    <div className={`w-10 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${isActive ? 'bg-[#6C63FF]/10' : ''}`}>
                      <Icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-[#6C63FF]' : 'text-gray-400'}`} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <span className={`text-[10px] font-semibold transition-colors duration-200 ${isActive ? 'text-[#6C63FF]' : 'text-gray-400'}`}>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
            <button onClick={() => setMoreOpen(true)} className="flex flex-col items-center gap-0.5 px-3 py-1 flex-1">
              <div className={`w-10 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${isMoreActive ? 'bg-[#6C63FF]/10' : ''}`}>
                <Grid2X2 className={`w-5 h-5 transition-colors duration-200 ${isMoreActive ? 'text-[#6C63FF]' : 'text-gray-400'}`} strokeWidth={isMoreActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-semibold transition-colors duration-200 ${isMoreActive ? 'text-[#6C63FF]' : 'text-gray-400'}`}>More</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile "More" sheet */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl px-5 pb-10">
          <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-6 mt-1" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">More</p>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {bottomMore.map(({ to, label, Icon }) => (
              <button key={to} onClick={() => { navigate(to); setMoreOpen(false) }} className="flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 rounded-2xl bg-[#6C63FF]/8 flex items-center justify-center transition-transform group-active:scale-95">
                  <Icon className="w-6 h-6 text-[#6C63FF]" />
                </div>
                <span className="text-xs font-medium text-gray-600 text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => { setMoreOpen(false); handleSignOut() }}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-2xl bg-red-50 hover:bg-red-100 text-red-500 font-semibold text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />Sign Out
          </button>
        </SheetContent>
      </Sheet>
    </div>
  )
}
