import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import LoginPage from '@/pages/auth/LoginPage'
import TeacherLayout from '@/components/layout/TeacherLayout'
import StudentLayout from '@/components/layout/StudentLayout'

// Teacher pages
import TeacherDashboard from '@/pages/teacher/DashboardPage'
import StudentsPage from '@/pages/teacher/StudentsPage'
import StudentAddPage from '@/pages/teacher/StudentAddPage'
import StudentEditPage from '@/pages/teacher/StudentEditPage'
import StudentViewPage from '@/pages/teacher/StudentViewPage'
import StudentAssignClassPage from '@/pages/teacher/StudentAssignClassPage'
import StudentAssignNotePage from '@/pages/teacher/StudentAssignNotePage'
import ClassesPage from '@/pages/teacher/ClassesPage'
import ClassAddPage from '@/pages/teacher/ClassAddPage'
import ClassEditPage from '@/pages/teacher/ClassEditPage'
import ClassBulkPage from '@/pages/teacher/ClassBulkPage'
import ClassAssignPage from '@/pages/teacher/ClassAssignPage'
import PaymentsPage from '@/pages/teacher/PaymentsPage'
import NotesPage from '@/pages/teacher/NotesPage'
import NoteAddPage from '@/pages/teacher/NoteAddPage'
import NoteEditPage from '@/pages/teacher/NoteEditPage'
import NoteAssignPage from '@/pages/teacher/NoteAssignPage'
import RecordingsPage from '@/pages/teacher/RecordingsPage'
import RecordingAddPage from '@/pages/teacher/RecordingAddPage'
import RecordingEditPage from '@/pages/teacher/RecordingEditPage'
import RecordingAssignPage from '@/pages/teacher/RecordingAssignPage'
import AnnouncementsPage from '@/pages/teacher/AnnouncementsPage'
import AnnouncementEditPage from '@/pages/teacher/AnnouncementEditPage'
import AnnouncementAddPage from '@/pages/teacher/AnnouncementAddPage'
import AnnouncementsHistoryPage from '@/pages/teacher/AnnouncementsHistoryPage'
import StudentMarksPage from '@/pages/teacher/StudentMarksPage'
import SettingsPage from '@/pages/teacher/SettingsPage'

// Student pages
import StudentDashboard from '@/pages/student/DashboardPage'
import StudentClassesPage from '@/pages/student/ClassesPage'
import StudentNotesPage from '@/pages/student/NotesPage'
import StudentRecordingsPage from '@/pages/student/RecordingsPage'
import StudentAnnouncementsPage from '@/pages/student/AnnouncementsPage'
import StudentPaymentPage from '@/pages/student/PaymentPage'
import StudentProfilePage from '@/pages/student/ProfilePage'
import StudentMarksPage from '@/pages/student/MarksPage'

function RequireTeacher({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore()
  if (!initialized) return <div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-spin">🌀</div></div>
  if (!user) return <Navigate to="/" replace />
  if (user.role !== 'teacher') return <Navigate to="/student/dashboard" replace />
  return <>{children}</>
}

function RequireStudent({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore()
  if (!initialized) return <div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-spin">🌀</div></div>
  if (!user) return <Navigate to="/" replace />
  if (user.role !== 'student') return <Navigate to="/teacher/dashboard" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore()
  if (!initialized) return <div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-spin">🌀</div></div>
  if (user) return <Navigate to={`/${user.role}/dashboard`} replace />
  return <>{children}</>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicRoute><LoginPage /></PublicRoute>,
  },
  {
    path: '/teacher',
    element: <RequireTeacher><TeacherLayout /></RequireTeacher>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <TeacherDashboard /> },
      { path: 'students', element: <StudentsPage /> },
      { path: 'students/add', element: <StudentAddPage /> },
      { path: 'students/:id', element: <StudentViewPage /> },
      { path: 'students/:id/edit', element: <StudentEditPage /> },
      { path: 'students/:id/assign-class', element: <StudentAssignClassPage /> },
      { path: 'students/:id/assign-note', element: <StudentAssignNotePage /> },
      { path: 'students/:id/marks', element: <StudentMarksPage /> },
      { path: 'classes', element: <ClassesPage /> },
      { path: 'classes/add', element: <ClassAddPage /> },
      { path: 'classes/bulk', element: <ClassBulkPage /> },
      { path: 'classes/:id/edit', element: <ClassEditPage /> },
      { path: 'classes/:id/assign', element: <ClassAssignPage /> },
      { path: 'payments', element: <PaymentsPage /> },
      { path: 'notes', element: <NotesPage /> },
      { path: 'notes/add', element: <NoteAddPage /> },
      { path: 'notes/:id/edit', element: <NoteEditPage /> },
      { path: 'notes/:id/assign', element: <NoteAssignPage /> },
      { path: 'recordings', element: <RecordingsPage /> },
      { path: 'recordings/add', element: <RecordingAddPage /> },
      { path: 'recordings/:id/edit', element: <RecordingEditPage /> },
      { path: 'recordings/:id/assign', element: <RecordingAssignPage /> },
      { path: 'announcements', element: <AnnouncementsPage /> },
      { path: 'announcements/add', element: <AnnouncementAddPage /> },
      { path: 'announcements/:id/edit', element: <AnnouncementEditPage /> },
      { path: 'announcements/history', element: <AnnouncementsHistoryPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  {
    path: '/student',
    element: <RequireStudent><StudentLayout /></RequireStudent>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <StudentDashboard /> },
      { path: 'classes', element: <StudentClassesPage /> },
      { path: 'notes', element: <StudentNotesPage /> },
      { path: 'recordings', element: <StudentRecordingsPage /> },
      { path: 'announcements', element: <StudentAnnouncementsPage /> },
      { path: 'payment', element: <StudentPaymentPage /> },
      { path: 'profile', element: <StudentProfilePage /> },
      { path: 'marks', element: <StudentMarksPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
