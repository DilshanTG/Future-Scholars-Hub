import { Link } from 'react-router-dom'
import { CuteDashboardUI } from '@/components/student/CuteDashboardUI'
import { ArrowLeft, Sparkles } from 'lucide-react'
import type { Announcement, Class, Mark } from '@/types'

const mockClass: Class = {
  id: 'preview-class',
  topic: 'Algebra — Quadratic Equations',
  class_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  zoom_link: 'https://zoom.us/j/preview',
  teacher_note: null,
  duration_minutes: 90,
  archived: false,
  created_at: new Date().toISOString(),
}

const mockMark: Mark = {
  id: 'preview-mark',
  student_id: 'preview',
  title: 'Term Test — Mathematics',
  score: 42,
  total: 50,
  created_at: new Date().toISOString(),
}

const mockAnnouncements: Announcement[] = [
  {
    id: 'a1',
    title: 'Extra revision class this Friday!',
    message: 'We\'ll cover past paper questions together. Bring your notes and a positive attitude~',
    expire_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'a2',
    title: 'New notes uploaded',
    message: 'Chapter 5 notes are ready in the Notes section. Happy studying! 📖',
    expire_date: null,
    created_at: new Date().toISOString(),
  },
]

export default function StudentDashboardPreviewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF0F6] via-[#F8E8FF] to-[#FFF5FA]">
      {/* Preview banner */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between gap-3">
          <Link
            to="/student/dashboard"
            className="flex items-center gap-2 text-sm font-cute font-medium text-pink-400 hover:text-pink-500 transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Current
          </Link>
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 text-pink-400 shrink-0 animate-sparkle" />
            <p className="font-cute font-semibold text-pink-500 text-sm truncate">
              Cute Dashboard Preview
            </p>
            <span className="shrink-0 text-[10px] font-cute font-bold uppercase tracking-wider bg-gradient-to-r from-pink-400 to-purple-400 text-white px-2 py-0.5 rounded-full">
              Demo
            </span>
          </div>
          <div className="w-14 shrink-0" />
        </div>
      </div>

      {/* Phone-style frame on desktop */}
      <div className="max-w-3xl mx-auto px-5 py-6">
        <div className="hidden sm:flex items-center justify-center gap-2 mb-5">
          <span className="text-lg animate-wiggle">🌸</span>
          <p className="font-handwriting text-pink-400 text-xl">girl mode activated~</p>
          <span className="text-lg animate-wiggle" style={{ animationDelay: '0.5s' }}>💖</span>
        </div>

        <div className="sm:rounded-[2.5rem] sm:border-[3px] sm:border-pink-200/60 sm:shadow-cute sm:bg-white/40 sm:backdrop-blur-sm sm:p-6">
          <CuteDashboardUI
            userName="Sakura Tanaka"
            userAvatar="🌸"
            studentInfo={{ status: 'active', payment_status: 'paid' }}
            nextClass={mockClass}
            classStatus="upcoming"
            latestMark={mockMark}
            announcements={mockAnnouncements}
            showAnnouncementPopup={false}
            marksLink="#"
            onJoinClass={() => window.alert('Preview mode — join button is decorative only! 💖')}
          />
        </div>

        <p className="text-center text-xs text-pink-300/70 mt-6 font-cute">
          This is a static preview with sample data · no login required
        </p>
      </div>
    </div>
  )
}