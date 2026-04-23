import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'
import { GRADES } from '@/lib/constants'

interface StudentFilterProps {
  search: string
  grade: string
  status: string
  payment: string
  onSearchChange: (v: string) => void
  onGradeChange: (v: string) => void
  onStatusChange: (v: string) => void
  onPaymentChange: (v: string) => void
  showPaymentFilter?: boolean
}

export function StudentFilter({
  search, grade, status, payment,
  onSearchChange, onGradeChange, onStatusChange, onPaymentChange,
  showPaymentFilter = true,
}: StudentFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search students..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 rounded-xl"
        />
      </div>
      <Select value={grade} onValueChange={onGradeChange}>
        <SelectTrigger className="w-36 rounded-xl">
          <SelectValue placeholder="Grade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Grades</SelectItem>
          {GRADES.map((g) => (
            <SelectItem key={g} value={g}>{g}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-32 rounded-xl">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
      {showPaymentFilter && (
        <Select value={payment} onValueChange={onPaymentChange}>
          <SelectTrigger className="w-36 rounded-xl">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payment</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
