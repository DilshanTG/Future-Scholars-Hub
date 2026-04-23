import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types'

export function useRequireAuth(role: UserRole) {
  const { user, initialized } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!initialized) return
    if (!user) {
      navigate('/', { replace: true })
    } else if (user.role !== role) {
      navigate(`/${user.role}/dashboard`, { replace: true })
    }
  }, [user, initialized, navigate, role])

  return { user, initialized }
}
