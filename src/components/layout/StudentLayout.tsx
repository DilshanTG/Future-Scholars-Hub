import { useEffect, useState } from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
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
  const [status, setStatus] = useState<'active' | 'inactive' | 'loading'>('loading')

  useEffect(() => {
    if (!user) return
    supabase
      .from('students')
      .select('status')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setStatus(data?.status ?? 'active')
      })
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="animate-pulse text-[#6C63FF] text-lg font-medium font-caveat">Loading...</div>
      </div>
    )
  }

  if (status === 'inactive') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-soft p-8 text-center border border-red-100">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Account Inactive</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Your student account is currently inactive. You cannot access the dashboard or class materials. Please contact your teacher to reactivate your account.
          </p>
          <Button onClick={handleSignOut} className="w-full bg-[#6C63FF] hover:bg-[#5a52d5] rounded-xl h-12 text-base shadow-md hover:shadow-lg transition-all">
            <LogOut className="h-5 w-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    )
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
