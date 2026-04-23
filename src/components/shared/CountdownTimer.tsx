import { useEffect, useState } from 'react'

interface CountdownTimerProps {
  targetDate: string | Date
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  })

  useEffect(() => {
    const target = new Date(targetDate).getTime()

    const update = () => {
      const now = new Date().getTime()
      const difference = target - now

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true })
        return
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        isPast: false,
      })
    }

    update() // initial call
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  if (timeLeft.isPast) {
    return (
      <div className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold shadow-sm border border-green-200">
        🎉 Class is happening now!
      </div>
    )
  }

  return (
    <div className="flex gap-2 mt-2">
      <TimeBox value={timeLeft.days} label="d" />
      <span className="text-gray-400 font-bold self-center -mt-3">:</span>
      <TimeBox value={timeLeft.hours} label="h" />
      <span className="text-gray-400 font-bold self-center -mt-3">:</span>
      <TimeBox value={timeLeft.minutes} label="m" />
      <span className="text-gray-400 font-bold self-center -mt-3">:</span>
      <TimeBox value={timeLeft.seconds} label="s" />
    </div>
  )
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center bg-indigo-50 border border-indigo-100 rounded-lg w-12 h-12 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 w-full h-1/2 bg-white/40" />
      <span className="text-lg font-bold text-[#6C63FF] leading-none z-10 font-mono">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-[10px] text-indigo-400 font-medium uppercase tracking-wider z-10 mt-0.5">
        {label}
      </span>
    </div>
  )
}
