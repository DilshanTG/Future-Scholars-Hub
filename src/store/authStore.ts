import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { AuthUser, UserRole } from '@/types'

interface AuthState {
  user: AuthUser | null
  loading: boolean
  initialized: boolean
  signIn: (identifier: string, password: string, role: UserRole) => Promise<void>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
  updateUser: (updates: Partial<AuthUser>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      initialized: false,

      signIn: async (identifier, password, role) => {
        set({ loading: true })
        const email =
          role === 'student'
            ? `${identifier}@fsh.internal`
            : identifier.includes('@')
            ? identifier
            : `${identifier}@fsh.teacher`

        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          set({ loading: false })
          throw error
        }

        if (role === 'teacher') {
          const { data: profile } = await supabase
            .from('teacher_profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()
          set({
            user: {
              id: data.user.id,
              email,
              role: 'teacher',
              avatar: profile?.avatar ?? '👨‍🏫',
              name: profile?.username ?? '',
            },
            loading: false,
          })
        } else {
          const { data: student } = await supabase
            .from('students')
            .select('*')
            .eq('id', data.user.id)
            .single()
          set({
            user: {
              id: data.user.id,
              email,
              role: 'student',
              avatar: student?.avatar ?? '🎓',
              name: student?.name ?? '',
            },
            loading: false,
          })
        }
      },

      signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null })
      },

      initialize: async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          set({ initialized: true })
          return
        }

        const { data: teacher } = await supabase
          .from('teacher_profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()

        if (teacher) {
          set({
            user: {
              id: session.user.id,
              email: session.user.email!,
              role: 'teacher',
              avatar: teacher.avatar,
              name: teacher.username,
            },
            initialized: true,
          })
          return
        }

        const { data: student } = await supabase
          .from('students')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()

        if (student) {
          set({
            user: {
              id: session.user.id,
              email: session.user.email!,
              role: 'student',
              avatar: student.avatar,
              name: student.name,
            },
            initialized: true,
          })
        } else {
          set({ initialized: true })
        }
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    { name: 'fsh-auth' }
  )
)
