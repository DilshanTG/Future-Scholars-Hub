import { Card, CardContent } from '@/components/ui/card'

interface StatCardProps {
  emoji: string
  label: string
  value: number | string
  color?: string
}

export function StatCard({ emoji, label, value, color = '#6C63FF' }: StatCardProps) {
  return (
    <Card className="card-hover rounded-2xl border-0 shadow-card transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold mt-1" style={{ color }}>{value}</p>
          </div>
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: color + '18' }}
          >
            {emoji}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
