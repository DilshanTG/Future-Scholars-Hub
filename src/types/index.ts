export type UserRole = 'teacher' | 'student'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  avatar: string
  name: string
}

export interface TeacherProfile {
  id: string
  username: string
  avatar: string
  created_at: string
}

export interface Student {
  id: string
  mobile: string
  name: string
  grade: string
  gender: 'Male' | 'Female' | 'Other'
  district: string
  description: string | null
  status: 'active' | 'inactive'
  archived: boolean
  avatar: string
  teacher_note: string | null
  login_password: string | null
  created_at: string
  payment_status?: 'paid' | 'unpaid'
}

export interface Class {
  id: string
  topic: string
  class_date: string
  zoom_link: string | null
  teacher_note: string | null
  created_at: string
  assigned_count?: number
}

export interface Payment {
  id: string
  student_id: string
  month: string
  year: number
  status: 'paid' | 'unpaid'
  updated_at: string
}

export interface Note {
  id: string
  title: string
  link: string | null
  file_url: string | null
  details: string | null
  created_at: string
  assigned_count?: number
}

export interface Recording {
  id: string
  topic: string
  link: string
  description: string | null
  created_at: string
  assigned_count?: number
}

export interface Announcement {
  id: string
  title: string
  message: string
  expire_date: string | null
  created_at: string
  is_all?: boolean
  specific_count?: number
}

export interface Mark {
  id: string
  student_id: string
  title: string
  score: number
  total: number
  created_at: string
}

export interface BulkClassEntry {
  topic: string
  class_date: string
  class_time: string
  zoom_link: string
  teacher_note: string
}
