import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { Copy, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { Class } from '@/types'

interface ClassInviteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentClass: Class | null
}

interface StudentAssigned {
  id: string
  name: string
  mobile: string
}

export function ClassInviteDialog({ open, onOpenChange, currentClass }: ClassInviteDialogProps) {
  const [students, setStudents] = useState<StudentAssigned[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open || !currentClass) return
    setLoading(true)

    async function loadStudents() {
      const { data } = await supabase
        .from('class_assignments')
        .select('students(id, name, mobile)')
        .eq('class_id', currentClass!.id)

      if (data) {
        // PostgREST returns an array of objects like { students: { id, name, mobile } }
        const parsed = data
          .map((row: any) => row.students)
          .filter(Boolean)
          .sort((a, b) => a.name.localeCompare(b.name))
        setStudents(parsed)
      }
      setLoading(false)
    }

    loadStudents()
  }, [open, currentClass])

  if (!currentClass) return null

  const dte = format(new Date(currentClass.class_date), 'PPP')
  const time = format(new Date(currentClass.class_date), 'p')
  const baseurl = window.location.origin

  const getMessage = (studentName?: string) => {
    const greeting = studentName ? `👋 *Hey ${studentName}!*` : `👋 *Hey there!*`
    return `${greeting}

Ready for class? Join your student portal here:
🔗 ${baseurl}/student/classes

📅 *Date:* ${dte}
⏰ *Time:* ${time}

--------------------------
*Instructions:*
1. Click the link above 👆
2. Log in to your dashboard
3. Click the bouncy "Join Class" button! 🚀

_See you there!_ ✨`
  }

  const handleCopyGeneral = () => {
    navigator.clipboard.writeText(getMessage())
    toast.success('General invite copied to clipboard! 📋')
  }

  const handleWhatsApp = (student: StudentAssigned) => {
    const text = encodeURIComponent(getMessage(student.name))
    // Remove any non-numeric characters from the mobile number just in case
    const phone = student.mobile.replace(/\D/g, '')
    // WhatsApp URL scheme
    const url = `https://wa.me/${phone}?text=${text}`
    window.open(url, '_blank')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] rounded-2xl overflow-hidden p-0 border-0 shadow-2xl">
        <div className="bg-gradient-to-br from-[#6C63FF] to-[#8B85FF] p-6 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-1/3 -translate-x-1/4" />
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-2xl font-bold font-caveat tracking-wide text-white">
              Send Invites 📢
            </DialogTitle>
            <p className="text-sm text-white/80 mt-1">
              {currentClass.topic}
            </p>
          </DialogHeader>
        </div>

        <div className="p-6">
          <Button
            onClick={handleCopyGeneral}
            variant="outline"
            className="w-full mb-6 rounded-xl border-[#6C63FF] text-[#6C63FF] hover:bg-[#6C63FF]/5 h-12 text-sm font-semibold"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy General Message (No Name)
          </Button>

          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider flex items-center gap-2">
            Assigned Students
            <span className="bg-gray-100 text-gray-500 py-0.5 px-2 rounded-full text-xs">
              {students.length}
            </span>
          </h3>

          <div className="h-[250px] pr-4 -mr-4 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No students assigned to this class yet.
              </div>
            ) : (
              <div className="space-y-2">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-[#6C63FF]/30 hover:bg-[#6C63FF]/5 transition-colors group"
                  >
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{student.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 font-mono">{student.mobile}</p>
                    </div>
                    <Button
                      onClick={() => handleWhatsApp(student)}
                      size="sm"
                      className="rounded-full bg-green-500 hover:bg-green-600 shadow-sm h-9 px-3 shrink-0"
                    >
                      <MessageCircle className="w-4 h-4 mr-1.5" />
                      Send
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
