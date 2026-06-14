import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { isPast } from 'date-fns'
import { Button } from '@/components/ui/button'
import { AnnouncementPopup } from '@/components/shared/AnnouncementPopup'
import { CountdownTimer } from '@/components/shared/CountdownTimer'
import { colomboFormat } from '@/lib/dates'
import { formatDuration } from '@/lib/constants'
import { getMarkStyle, pct } from '@/lib/markStyle'
import { CreditCard, UserCheck, ChevronRight, Sparkles, Heart, Star } from 'lucide-react'
import type { Class, Announcement, Mark } from '@/types'

export interface CuteDashboardData {
  userName: string
  userAvatar: string
  studentInfo: { status: 'active' | 'inactive'; payment_status: 'paid' | 'unpaid' }
  nextClass: Class | null
  classStatus: 'live' | 'upcoming' | 'ended' | null
  latestMark: Mark | null
  announcements: Announcement[]
}

interface CuteDashboardUIProps extends CuteDashboardData {
  onJoinClass?: (classId: string, zoomLink: string) => void
  marksLink?: string
  showAnnouncementPopup?: boolean
}

function CuteDeco() {
  return (
    <>
      <span className="absolute top-3 right-6 text-xl animate-sparkle pointer-events-none" style={{ animationDelay: '0s' }}>✨</span>
      <span className="absolute top-10 right-20 text-sm animate-float pointer-events-none" style={{ animationDelay: '0.5s' }}>💖</span>
      <span className="absolute bottom-4 right-10 text-lg animate-wiggle pointer-events-none" style={{ animationDelay: '1s' }}>🌸</span>
      <span className="absolute top-6 left-[45%] text-xs animate-sparkle pointer-events-none" style={{ animationDelay: '1.5s' }}>⭐</span>
      <span className="absolute -bottom-6 -left-6 w-36 h-36 rounded-full bg-white/20 pointer-events-none" />
      <span className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/15 pointer-events-none" />
      <span className="absolute bottom-2 left-4 text-[10px] animate-bounce-soft pointer-events-none opacity-70">🎀</span>
    </>
  )
}

function SectionHeader({ emoji, label, badge }: { emoji: string; label: string; badge?: ReactNode }) {
  return (
    <div className="px-5 pt-5 pb-3 flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center shadow-sm border border-pink-200/50">
        <span className="text-base leading-none">{emoji}</span>
      </div>
      <p className="text-xs font-cute font-semibold text-pink-400 uppercase tracking-widest">{label}</p>
      {badge}
    </div>
  )
}

export function CuteDashboardUI({
  userName,
  userAvatar,
  studentInfo,
  nextClass,
  classStatus,
  latestMark,
  announcements,
  onJoinClass,
  marksLink = '/student/marks',
  showAnnouncementPopup = true,
}: CuteDashboardUIProps) {
  const firstName = userName.split(' ')[0] ?? 'sweetie'

  return (
    <div className="space-y-5 cute-sparkle-bg -mx-1 px-1 pb-2">
      {showAnnouncementPopup && <AnnouncementPopup announcements={announcements} />}

      <div className="gradient-cute rounded-[2rem] p-6 text-white relative overflow-hidden shadow-cute">
        <CuteDeco />
        <div className="relative flex items-center gap-5">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-[1.4rem] bg-white/25 flex items-center justify-center text-5xl ring-[3px] ring-white/40 shadow-lg backdrop-blur-sm animate-float">
              {userAvatar}
            </div>
            <span className="absolute -top-2 -right-2 text-lg animate-wiggle">💕</span>
          </div>
          <div className="min-w-0">
            <p className="text-white/75 text-sm font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {colomboFormat(new Date(), 'EEEE, MMMM d')}
            </p>
            <h1 className="font-cute text-2xl font-bold truncate mt-1 drop-shadow-sm">
              Hi {firstName}! <span className="inline-block animate-wiggle">🌷</span>
            </h1>
            <p className="font-handwriting text-white/90 text-xl mt-0.5 leading-tight">
              you&apos;re doing amazing, keep shining ✨
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card-cute-hover p-4">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-3 ${
            studentInfo.status === 'active'
              ? 'bg-gradient-to-br from-emerald-100 to-green-50 border border-emerald-200/60'
              : 'bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200/60'
          }`}>
            <UserCheck className={`w-5 h-5 ${studentInfo.status === 'active' ? 'text-emerald-500' : 'text-gray-400'}`} />
          </div>
          <p className="text-xs font-cute text-pink-300 uppercase tracking-wide">Account</p>
          <p className={`font-cute font-bold text-base mt-0.5 capitalize flex items-center gap-1 ${
            studentInfo.status === 'active' ? 'text-emerald-500' : 'text-gray-400'
          }`}>
            {studentInfo.status === 'active' ? (
              <>Active <Heart className="w-3.5 h-3.5 fill-pink-300 text-pink-300" /></>
            ) : (
              studentInfo.status
            )}
          </p>
        </div>

        <div className="card-cute-hover p-4">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-3 ${
            studentInfo.payment_status === 'paid'
              ? 'bg-gradient-to-br from-pink-100 to-rose-50 border border-pink-200/60'
              : 'bg-gradient-to-br from-orange-100 to-amber-50 border border-orange-200/60'
          }`}>
            <CreditCard className={`w-5 h-5 ${studentInfo.payment_status === 'paid' ? 'text-pink-500' : 'text-orange-400'}`} />
          </div>
          <p className="text-xs font-cute text-pink-300 uppercase tracking-wide">This Month</p>
          <p className={`font-cute font-bold text-base mt-0.5 flex items-center gap-1 ${
            studentInfo.payment_status === 'paid' ? 'text-pink-500' : 'text-orange-400'
          }`}>
            {studentInfo.payment_status === 'paid' ? (
              <>Paid <Star className="w-3.5 h-3.5 fill-yellow-300 text-yellow-400" /></>
            ) : (
              <>Unpaid 💫</>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card-cute overflow-hidden">
          <SectionHeader
            emoji="📚"
            label="Next Class"
            badge={classStatus === 'live' ? (
              <span className="ml-auto flex items-center gap-1.5 text-xs font-cute font-bold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                LIVE NOW
              </span>
            ) : undefined}
          />
          {nextClass ? (
            <div className="px-5 pb-5 space-y-3">
              <div className="flex gap-3 p-4 rounded-2xl bg-gradient-to-r from-purple-50/80 via-pink-50/80 to-rose-50/80 border border-pink-100">
                <div className="w-1.5 self-stretch rounded-full bg-gradient-to-b from-pink-300 to-purple-400 shrink-0" />
                <div className="min-w-0">
                  <p className="font-cute font-semibold text-gray-700">{nextClass.topic}</p>
                  <p className="text-sm text-pink-400/80 mt-1 font-medium">
                    {colomboFormat(nextClass.class_date, 'PPp')} · {formatDuration(nextClass.duration_minutes ?? 60)}
                  </p>
                  {classStatus === 'upcoming' && (
                    <div className="mt-2.5">
                      <CountdownTimer targetDate={nextClass.class_date} />
                    </div>
                  )}
                </div>
              </div>
              {classStatus === 'live' && nextClass.zoom_link && (
                <Button
                  onClick={() => onJoinClass?.(nextClass.id, nextClass.zoom_link!)}
                  className="w-full rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-cute font-bold h-12 shadow-cute border-0"
                >
                  <span className="animate-pulse-soft mr-1">🔴</span> Join Class Now 💖
                </Button>
              )}
            </div>
          ) : (
            <div className="px-5 pb-7 flex flex-col items-center text-center">
              <p className="text-5xl mb-3 animate-float">📅</p>
              <p className="font-cute font-semibold text-pink-400">No classes yet~</p>
              <p className="text-xs text-pink-300/70 mt-1 font-handwriting text-base">take a little break, you deserve it 🍵</p>
            </div>
          )}
        </div>

        {latestMark ? (() => {
          const style = getMarkStyle(latestMark.score, latestMark.total)
          const percent = pct(latestMark.score, latestMark.total)
          return (
            <Link to={marksLink} className="block group">
              <div className="card-cute-hover overflow-hidden h-full">
                <SectionHeader
                  emoji="🎯"
                  label="Latest Result"
                  badge={<ChevronRight className="w-4 h-4 text-pink-300 ml-auto group-hover:translate-x-1 transition-transform" />}
                />
                <div className="mx-5 mb-5 flex rounded-2xl overflow-hidden border-2 border-pink-100">
                  <div className={`bg-gradient-to-b ${style.gradient} w-[72px] shrink-0 flex flex-col items-center justify-center gap-1 py-3`}>
                    <span className="text-white font-black text-3xl leading-none font-cute">{style.label}</span>
                    <span className="text-white/85 text-xs font-semibold">{percent}%</span>
                  </div>
                  <div className="flex-1 min-w-0 px-4 py-3 bg-gradient-to-br from-white to-pink-50/30">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-cute font-semibold text-gray-700 truncate">{latestMark.title}</p>
                      <div className="shrink-0 leading-none">
                        <span className="font-black text-pink-500 text-lg font-cute">{latestMark.score}</span>
                        <span className="text-sm text-pink-300"> /{latestMark.total}</span>
                      </div>
                    </div>
                    <div className="mt-2.5 h-2.5 rounded-full bg-pink-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${style.bar} transition-all duration-700`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-pink-300 mt-2 font-cute">tap to see all marks →</p>
                  </div>
                </div>
              </div>
            </Link>
          )
        })() : (
          <div className="card-cute overflow-hidden">
            <SectionHeader emoji="🎯" label="Latest Result" />
            <div className="px-5 pb-7 flex flex-col items-center text-center">
              <p className="text-5xl mb-3 animate-bounce-soft">🎯</p>
              <p className="font-cute font-semibold text-pink-400">No results yet~</p>
              <p className="text-xs text-pink-300/70 mt-1 font-handwriting text-base">your amazing scores will show up here ✨</p>
            </div>
          </div>
        )}
      </div>

      <div className="card-cute overflow-hidden">
        <SectionHeader
          emoji="📢"
          label="Announcements"
          badge={announcements.length > 0 ? (
            <span className="ml-auto w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 text-white text-xs font-cute font-bold flex items-center justify-center shadow-sm animate-bounce-soft">
              {announcements.length}
            </span>
          ) : undefined}
        />
        {announcements.length === 0 ? (
          <div className="px-5 pb-7 flex flex-col items-center text-center">
            <p className="text-5xl mb-3 animate-float">📢</p>
            <p className="font-cute font-semibold text-pink-400">All caught up!</p>
            <p className="text-xs text-pink-300/70 mt-1 font-handwriting text-base">nothing new — you&apos;re on top of things 🎀</p>
          </div>
        ) : (
          <div className="px-5 pb-5 grid grid-cols-1 lg:grid-cols-2 gap-3">
            {announcements.map((a, i) => (
              <div
                key={a.id}
                className="rounded-2xl border-2 border-pink-100 bg-gradient-to-br from-pink-50/80 to-purple-50/50 p-4 transition-transform hover:scale-[1.02] duration-200"
              >
                <div className="flex items-start gap-2">
                  <span className="text-sm shrink-0 mt-0.5">{['💌', '🌟', '💫', '🎀', '✨'][i % 5]}</span>
                  <div className="min-w-0">
                    <p className="font-cute font-semibold text-sm text-gray-700">{a.title}</p>
                    <p className="text-sm text-pink-400/80 mt-1 leading-relaxed">{a.message}</p>
                    {a.expire_date && !isPast(new Date(a.expire_date)) && (
                      <p className="text-xs text-purple-400 mt-2 font-medium">
                        expires {colomboFormat(a.expire_date, 'PP')} 🌸
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}