import { BOY_AVATARS, GIRL_AVATARS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface AvatarPickerProps {
  value: string
  onChange: (emoji: string) => void
}

export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Boys</p>
        <div className="flex flex-wrap gap-1.5">
          {BOY_AVATARS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onChange(emoji)}
              className={cn(
                'w-10 h-10 text-xl rounded-xl flex items-center justify-center transition-all duration-150 hover:bg-gray-100',
                value === emoji ? 'ring-2 ring-[#6C63FF] bg-purple-50 scale-110' : 'bg-gray-50'
              )}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Girls</p>
        <div className="flex flex-wrap gap-1.5">
          {GIRL_AVATARS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onChange(emoji)}
              className={cn(
                'w-10 h-10 text-xl rounded-xl flex items-center justify-center transition-all duration-150 hover:bg-gray-100',
                value === emoji ? 'ring-2 ring-[#6C63FF] bg-purple-50 scale-110' : 'bg-gray-50'
              )}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
