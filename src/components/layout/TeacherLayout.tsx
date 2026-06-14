import { useState } from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { LayoutDashboard, GraduationCap, CalendarDays, Wallet, FileText, PlayCircle, Megaphone, Settings, LogOut, Menu, PenLine } from 'lucide-react'
import { Footer } from '@/components/layout/Footer'

const navLinks = [
  { to: '/teacher/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/teacher/students', label: 'Students', Icon: GraduationCap },
  { to: '/teacher/mark', label: 'Mark Worksheet', Icon: PenLine },
  { to: '/teacher/classes', label: 'Classes', Icon: CalendarDays },
  { to: '/teacher/payments', label: 'Payments', Icon: Wallet },
  { to: '/teacher/notes', label: 'Notes', Icon: FileText },
  { to: '/teacher/recordings', label: 'Recordings', Icon: PlayCircle },
  { to: '/teacher/announcements', label: 'Announcements', Icon: Megaphone },
  { to: '/teacher/settings', label: 'Settings', Icon: Settings },
]

function SidebarContent({ onNavClick, onSignOut, userName, userAvatar }: { onNavClick?: () => void; onSignOut: () => void; userName?: string; userAvatar?: string }) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-6 py-6 border-b border-gray-100">
        <Link to="/teacher/dashboard" onClick={onNavClick} className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#6C63FF] flex items-center justify-center text-2xl shadow-sm">🎓</div>
          <p className="font-bold text-gray-800 text-base leading-tight">Future Scholars Hub</p>
        </Link>
      </div>
      <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
        {navLinks.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-150 ${
                isActive ? 'bg-[#6C63FF] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon className="w-5 h-5 shrink-0" />{label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-100 space-y-1">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl">
          <div className="w-10 h-10 rounded-xl bg-[#6C63FF]/10 flex items-center justify-center text-xl shrink-0">{userAvatar}</div>
          <div className="min-w-0">
            <p className="text-base font-semibold text-gray-800 truncate">{userName}</p>
            <p className="text-sm text-gray-400">Teacher</p>
          </div>
        </div>
        <button onClick={onSignOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-500 hover:bg-red-50 transition-colors">
          <LogOut className="w-5 h-5 shrink-0" />Sign Out
        </button>
      </div>
    </div>
  )
}

export default function TeacherLayout() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex lg:w-72 shrink-0 flex-col fixed inset-y-0 left-0 border-r border-gray-100 shadow-sm z-30">
        <SidebarContent onSignOut={handleSignOut} userName={user?.name} userAvatar={user?.avatar} />
      </aside>

      <div className="flex-1 flex flex-col min-h-screen lg:ml-72">
        <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#6C63FF] flex items-center justify-center text-sm">🎓</div>
            <span className="font-bold text-gray-800 text-sm">Future Scholars Hub</span>
          </div>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 border-r">
              <SidebarContent onNavClick={() => setMobileOpen(false)} onSignOut={handleSignOut} userName={user?.name} userAvatar={user?.avatar} />
            </SheetContent>
          </Sheet>
        </header>
        <main className="flex-1 px-5 lg:px-10 py-6 w-full">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}
