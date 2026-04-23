import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { UserRole } from '@/types'

export default function LoginPage() {
  const [role, setRole] = useState<UserRole>('teacher')
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
    <div className="min-h-screen gradient-welcome flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🎓</div>
            <h1 className="text-2xl font-bold text-gray-800">Future Scholars Hub</h1>
            <p className="text-muted-foreground text-sm mt-1">Sign in to your account</p>
          </div>

          {/* Role Toggle */}
          <div className="flex bg-gray-100 rounded-pill p-1 mb-6">
            <button
              type="button"
              onClick={() => { setRole('teacher'); setIdentifier(''); setError('') }}
              className={`flex-1 py-2 px-4 rounded-pill text-sm font-semibold transition-all duration-200 ${
                role === 'teacher'
                  ? 'bg-white shadow text-[#6C63FF]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              👨‍🏫 Teacher
            </button>
            <button
              type="button"
              onClick={() => { setRole('student'); setIdentifier(''); setError('') }}
              className={`flex-1 py-2 px-4 rounded-pill text-sm font-semibold transition-all duration-200 ${
                role === 'student'
                  ? 'bg-white shadow text-[#6C63FF]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🎒 Student
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">
                {role === 'teacher' ? 'Username' : 'Mobile Number'}
              </Label>
              <Input
                id="identifier"
                type={role === 'student' ? 'tel' : 'text'}
                placeholder={role === 'teacher' ? 'Enter your username' : 'Enter your mobile number'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            {error && (
              <Alert variant="destructive" className="rounded-xl">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full rounded-pill bg-[#6C63FF] hover:bg-[#5a52d5] text-white font-semibold py-2.5"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {role === 'student' && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              Default password is <span className="font-semibold">student123</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
