import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { generateStudentPassword } from '@/lib/constants'
import { FunctionsHttpError } from '@supabase/supabase-js'
import { toast } from 'sonner'
import type { Student } from '@/types'

interface Props {
  student: Student | null
  onClose: () => void
  onPasswordReset?: (studentId: string, newPassword: string) => void
}

function buildMessage(name: string, mobile: string, password: string) {
  return `🌟 *Hi ${name}!* 🌟

Welcome to the *FutureScholarHub* family! Are you ready to start your learning adventure? 🎒✨

Here is your *Secret Key* to enter the portal:

📱 *Your User Name:*  ${mobile}
🔑 *Your Password:*  ${password}

✨ *Quick Tips:* ✨

🤫 *Keep it safe:* Keep your password a secret!
💻 *Explore:* Log in and discover the magic!
🚀 *Aim High:* Reach for the stars!

Happy Learning, *Little Genius!* 🌈

— *Future Scholar Hub* 🛡️`
}

function toWhatsAppNumber(mobile: string) {
  // Sri Lanka: 07XXXXXXXX → +947XXXXXXXX
  if (mobile.startsWith('0')) return `94${mobile.slice(1)}`
  return mobile
}

export function InviteDialog({ student, onClose, onPasswordReset }: Props) {
  const [resetting, setResetting] = useState(false)
  const [password, setPassword] = useState<string | null>(student?.login_password ?? null)
  const [copied, setCopied] = useState(false)

  if (!student) return null

  const message = password
    ? buildMessage(student.name, student.mobile, password)
    : null

  const handleReset = async () => {
    setResetting(true)
    const newPassword = generateStudentPassword()

    try {
      const { data: refreshed } = await supabase.auth.refreshSession()
      const session = refreshed.session
      if (!session) { toast.error('Session expired. Please log in again.'); setResetting(false); return }

      const { data, error } = await supabase.functions.invoke('reset-password', {
        body: { student_id: student.id, password: newPassword },
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (error) {
        let msg = 'Failed to reset password'
        if (error instanceof FunctionsHttpError) {
          try { const b = await error.context.json(); msg = b.error ?? b.message ?? msg } catch {}
        }
        toast.error(msg)
      } else if (data?.error) {
        toast.error(data.error)
      } else {
        setPassword(newPassword)
        onPasswordReset?.(student.id, newPassword)
        toast.success('Password reset successfully')
      }
    } finally {
      setResetting(false)
    }
  }

  const handleCopy = () => {
    if (!message) return
    navigator.clipboard.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWhatsApp = () => {
    if (!message) return
    const number = toWhatsAppNumber(student.mobile)
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <Dialog open={!!student} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Invite — {student.name}</DialogTitle>
        </DialogHeader>

        {!password ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
            No password saved yet. Click <strong>Reset Password</strong> to generate one.
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-3 text-xs leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto border">
            {message}
          </div>
        )}

        <div className="flex gap-2 flex-wrap pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={resetting}
            className="rounded-lg text-orange-600 border-orange-200 hover:bg-orange-50"
          >
            {resetting ? 'Resetting...' : '🔄 Reset Password'}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleCopy}
            disabled={!message}
            className="rounded-lg bg-[#6C63FF] hover:bg-[#5a52d5]"
          >
            {copied ? '✓ Copied!' : '📋 Copy'}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleWhatsApp}
            disabled={!message}
            className="rounded-lg bg-green-500 hover:bg-green-600 text-white"
          >
            💬 WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
