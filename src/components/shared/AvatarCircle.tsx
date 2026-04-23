import { cn } from '@/lib/utils'

interface AvatarCircleProps {
  emoji: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  sm: 'w-8 h-8 text-lg',
  md: 'w-10 h-10 text-xl',
  lg: 'w-14 h-14 text-3xl',
  xl: 'w-20 h-20 text-5xl',
}

export function AvatarCircle({ emoji, size = 'md', className }: AvatarCircleProps) {
  return (
    <div
      className={cn(
        'rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0',
        sizeMap[size],
        className
      )}
    >
      {emoji}
    </div>
  )
}
