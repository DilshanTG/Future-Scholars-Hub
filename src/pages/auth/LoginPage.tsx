import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { UserRole } from '@/types'

export default function LoginPage() {
  const [role, setRole] = useState<UserRole>('student')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { signIn, loading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await signIn(identifier, password, role)
      navigate(`/${role}/dashboard`, { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      setError(msg.includes('Invalid') ? 'Invalid credentials. Please try again.' : msg)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F4FF] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#6C63FF] flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-[#6C63FF]/25">🎓</div>
          <h1 className="text-2xl font-bold text-gray-800">Future Scholars Hub</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to continue</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          {/* Role toggle */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
            {(['student', 'teacher'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => { setRole(r); setIdentifier(''); setError('') }}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  role === r ? 'bg-white shadow-sm text-[#6C63FF]' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {r === 'student' ? '🎒 Student' : '👨‍🏫 Teacher'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">{role === 'teacher' ? 'Username' : 'Mobile Number'}</Label>
              <Input
                type={role === 'student' ? 'tel' : 'text'}
                placeholder={role === 'teacher' ? 'Enter username' : 'Enter mobile number'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="h-11 rounded-xl border-gray-200 focus:border-[#6C63FF] focus:ring-[#6C63FF]/20"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Password</Label>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 rounded-xl border-gray-200 focus:border-[#6C63FF] focus:ring-[#6C63FF]/20"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11 rounded-xl bg-[#6C63FF] hover:bg-[#5a52d5] text-white font-semibold shadow-sm shadow-[#6C63FF]/20 mt-2" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {role === 'student' && (
            <p className="text-center text-xs text-gray-400 mt-4">
              Default password: <span className="font-semibold text-gray-500">student123</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
