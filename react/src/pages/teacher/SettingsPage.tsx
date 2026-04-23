import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { PageHeader } from '@/components/shared/PageHeader'
import { AvatarCircle } from '@/components/shared/AvatarCircle'
import { AvatarPicker } from '@/components/shared/AvatarPicker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore()
  const [avatar, setAvatar] = useState(user?.avatar ?? '👨‍🏫')
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [savingPw, setSavingPw] = useState(false)

  const handleSaveAvatar = async () => {
    if (!user) return
    setSavingAvatar(true)
    const { error } = await supabase.from('teacher_profiles').update({ avatar }).eq('id', user.id)
    setSavingAvatar(false)
    if (error) toast.error(error.message)
    else { updateUser({ avatar }); toast.success('Avatar updated') }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPw !== confirmPw) { toast.error('Passwords do not match'); return }
    if (newPw.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setSavingPw(true)
    const { error } = await supabase.auth.updateUser({ password: newPw })
    setSavingPw(false)
    if (error) toast.error(error.message)
    else { toast.success('Password updated'); setCurrentPw(''); setNewPw(''); setConfirmPw('') }
  }

  return (
    <div className="max-w-xl mx-auto">
      <PageHeader title="Settings" />

      {/* Profile banner */}
      <div className="gradient-primary rounded-2xl p-6 text-white mb-4 flex items-center gap-4">
        <AvatarCircle emoji={avatar} size="xl" className="bg-white/20" />
        <div>
          <h2 className="text-xl font-bold">{user?.name}</h2>
          <p className="text-white/80 text-sm">Teacher</p>
        </div>
      </div>

      {/* Avatar */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
        <h3 className="font-semibold text-gray-800 mb-4">Choose Avatar</h3>
        <AvatarPicker value={avatar} onChange={setAvatar} />
        <Button onClick={handleSaveAvatar} disabled={savingAvatar} className="mt-4 rounded-pill bg-[#6C63FF] hover:bg-[#5a52d5] w-full">
          {savingAvatar ? 'Saving...' : 'Save Avatar'}
        </Button>
      </div>

      <Separator className="my-4" />

      {/* Password */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Change Password</h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Confirm New Password</Label>
            <Input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required className="rounded-xl" />
          </div>
          <Button type="submit" disabled={savingPw} className="w-full rounded-pill bg-[#6C63FF] hover:bg-[#5a52d5]">
            {savingPw ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </div>
    </div>
  )
}
