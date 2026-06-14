import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { AvatarPicker } from '@/components/shared/AvatarPicker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { KeyRound, Smile } from 'lucide-react'

export default function StudentProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [avatar, setAvatar] = useState(user?.avatar ?? '🎓')
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [savingPw, setSavingPw] = useState(false)

  const handleSaveAvatar = async () => {
    if (!user) return
    setSavingAvatar(true)
    const { error } = await supabase.from('students').update({ avatar }).eq('id', user.id)
    setSavingAvatar(false)
    if (error) toast.error(error.message)
    else { updateUser({ avatar }); toast.success('Avatar updated!') }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPw !== confirmPw) { toast.error('Passwords do not match'); return }
    if (newPw.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setSavingPw(true)
    const { error } = await supabase.auth.updateUser({ password: newPw })
    setSavingPw(false)
    if (error) toast.error(error.message)
    else { toast.success('Password updated!'); setNewPw(''); setConfirmPw('') }
  }

  return (
    <div>
      {/* Profile header */}
      <div className="gradient-welcome rounded-3xl p-5 text-white mb-5 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        <div className="relative flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 ring-2 ring-white/30 flex items-center justify-center text-4xl">{avatar}</div>
          <div>
            <h1 className="text-xl font-bold">{user?.name}</h1>
            <p className="text-white/70 text-sm">Student Profile</p>
          </div>
        </div>
      </div>

      {/* Avatar section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-[#6C63FF]/10 flex items-center justify-center">
            <Smile className="w-3.5 h-3.5 text-[#6C63FF]" />
          </div>
          <h2 className="font-bold text-gray-800 text-sm">Choose Avatar</h2>
        </div>
        <AvatarPicker value={avatar} onChange={setAvatar} />
        <Button onClick={handleSaveAvatar} disabled={savingAvatar} className="mt-4 w-full h-11 rounded-xl bg-[#6C63FF] hover:bg-[#5a52d5]">
          {savingAvatar ? 'Saving...' : 'Save Avatar'}
        </Button>
      </div>

      {/* Password section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-[#6C63FF]/10 flex items-center justify-center">
            <KeyRound className="w-3.5 h-3.5 text-[#6C63FF]" />
          </div>
          <h2 className="font-bold text-gray-800 text-sm">Change Password</h2>
        </div>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">New Password</Label>
            <Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} required className="h-11 rounded-xl" placeholder="Min 6 characters" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">Confirm Password</Label>
            <Input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required className="h-11 rounded-xl" />
          </div>
          <Button type="submit" disabled={savingPw} className="w-full h-11 rounded-xl bg-[#6C63FF] hover:bg-[#5a52d5]">
            {savingPw ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </div>
    </div>
  )
}
