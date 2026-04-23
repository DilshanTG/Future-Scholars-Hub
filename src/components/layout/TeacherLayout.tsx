import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, LogOut } from 'lucide-react'

const navLinks = [
  { to: '/teacher/dashboard', label: 'Dashboard', emoji: '📊' },
  { to: '/teacher/students', label: 'Students', emoji: '👨‍🎓' },
  { to: '/teacher/classes', label: 'Classes', emoji: '📅' },
  { to: '/teacher/payments', label: 'Payments', emoji: '💰' },
  { to: '/teacher/notes', label: 'Notes', emoji: '📝' },
  { to: '/teacher/recordings', label: 'Recordings', emoji: '🎥' },
  { to: '/teacher/announcements', label: 'Announcements', emoji: '📢' },
  { to: '/teacher/settings', label: 'Settings', emoji: '⚙️' },
]

function NavLinkItem({ to, label, emoji, onClick }: { to: string; label: string; emoji: string; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'bg-[#6C63FF] text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </NavLink>
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
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <span className="font-bold text-gray-800">Future Scholars Hub</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLinkItem key={link.to} {...link} />
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <span className="text-xl">{user?.avatar}</span>
              <span className="font-medium">{user?.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="hidden sm:flex gap-1 text-gray-500 hover:text-red-500"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Logout</span>
            </Button>

            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 pb-4 mb-4 border-b">
                    <span className="text-3xl">{user?.avatar}</span>
                    <div>
                      <p className="font-semibold text-gray-800">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">Teacher</p>
                    </div>
                  </div>
                  <nav className="flex flex-col gap-1 flex-1">
                    {navLinks.map((link) => (
                      <NavLinkItem key={link.to} {...link} onClick={() => setMobileOpen(false)} />
                    ))}
                  </nav>
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="mt-4 text-red-500 hover:text-red-600 hover:bg-red-50 justify-start gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
