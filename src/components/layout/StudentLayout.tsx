import { useState } from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, LogOut } from 'lucide-react'
import { Footer } from '@/components/layout/Footer'

const navLinks = [
  { to: '/student/dashboard', label: 'Dashboard', emoji: '🏠' },
  { to: '/student/classes', label: 'My Classes', emoji: '📅' },
  { to: '/student/notes', label: 'Notes', emoji: '📝' },
  { to: '/student/recordings', label: 'Recordings', emoji: '🎥' },
  { to: '/student/announcements', label: 'Announcements', emoji: '📢' },
  { to: '/student/payment', label: 'Payments', emoji: '💰' },
  { to: '/student/profile', label: 'Profile', emoji: '👤' },
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

export default function StudentLayout() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🎓</span>
            <span className="font-bold text-gray-800">Future Scholars Hub</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLinkItem key={link.to} {...link} />
            ))}
          </div>

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
                      <p className="text-xs text-muted-foreground">Student</p>
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

      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
