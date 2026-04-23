-- ============================================================
-- FUTURE SCHOLARS HUB — Supabase Schema
-- Run this in your Supabase SQL Editor (project > SQL Editor)
-- ============================================================

create extension if not exists "uuid-ossp";

-- Teacher profiles (extends Supabase auth.users)
create table public.teacher_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  avatar text default '👨‍🏫',
  created_at timestamptz default now()
);

-- Students (also linked to auth.users — mobile@fsh.internal is their email)
create table public.students (
  id uuid references auth.users(id) on delete cascade primary key,
  mobile text unique not null,
  name text not null,
  grade text not null,
  gender text not null check (gender in ('Male', 'Female', 'Other')),
  district text not null default '',
  description text,
  status text default 'active' check (status in ('active', 'inactive')),
  avatar text default '🎓',
  teacher_note text,
  created_at timestamptz default now()
);

-- Classes
create table public.classes (
  id uuid default uuid_generate_v4() primary key,
  topic text not null,
  class_date timestamptz not null,
  zoom_link text,
  teacher_note text,
  created_at timestamptz default now()
);

-- Class assignments (M2M)
create table public.class_assignments (
  class_id uuid references public.classes(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  primary key (class_id, student_id)
);

-- Payments (unique per student per month+year)
create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  month text not null,
  year integer not null,
  status text default 'unpaid' check (status in ('paid', 'unpaid')),
  updated_at timestamptz default now(),
  unique (student_id, month, year)
);

-- Notes
create table public.notes (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  link text,
  details text,
  created_at timestamptz default now()
);

-- Note assignments (M2M)
create table public.note_assignments (
  note_id uuid references public.notes(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  primary key (note_id, student_id)
);

-- Recordings
create table public.recordings (
  id uuid default uuid_generate_v4() primary key,
  topic text not null,
  link text not null,
  description text,
  created_at timestamptz default now()
);

-- Recording assignments (M2M)
create table public.recording_assignments (
  recording_id uuid references public.recordings(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  primary key (recording_id, student_id)
);

-- Announcements
create table public.announcements (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  message text not null,
  expire_date timestamptz,
  created_at timestamptz default now()
);

-- Announcement assignments (student_id = NULL means broadcast to ALL students)
create table public.announcement_assignments (
  id uuid default uuid_generate_v4() primary key,
  announcement_id uuid references public.announcements(id) on delete cascade not null,
  student_id uuid references public.students(id) on delete cascade,
  unique (announcement_id, student_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.teacher_profiles enable row level security;
alter table public.students enable row level security;
alter table public.classes enable row level security;
alter table public.class_assignments enable row level security;
alter table public.payments enable row level security;
alter table public.notes enable row level security;
alter table public.note_assignments enable row level security;
alter table public.recordings enable row level security;
alter table public.recording_assignments enable row level security;
alter table public.announcements enable row level security;
alter table public.announcement_assignments enable row level security;

-- Helper: is the current user a teacher?
create or replace function public.is_teacher()
returns boolean as $$
  select exists (
    select 1 from public.teacher_profiles where id = auth.uid()
  );
$$ language sql security definer;

-- Teacher profiles
create policy "teachers_read_own" on public.teacher_profiles for select using (auth.uid() = id);
create policy "teachers_update_own" on public.teacher_profiles for update using (auth.uid() = id);

-- Students
create policy "teacher_full_students" on public.students for all using (public.is_teacher());
create policy "student_read_own" on public.students for select using (auth.uid() = id);
create policy "student_update_own" on public.students for update using (auth.uid() = id);

-- Classes
create policy "teacher_full_classes" on public.classes for all using (public.is_teacher());
create policy "student_read_assigned_classes" on public.classes for select using (
  exists (select 1 from public.class_assignments where class_id = classes.id and student_id = auth.uid())
);

-- Class assignments
create policy "teacher_full_class_assignments" on public.class_assignments for all using (public.is_teacher());
create policy "student_read_own_class_assignments" on public.class_assignments for select using (student_id = auth.uid());

-- Payments
create policy "teacher_full_payments" on public.payments for all using (public.is_teacher());
create policy "student_read_own_payments" on public.payments for select using (student_id = auth.uid());

-- Notes
create policy "teacher_full_notes" on public.notes for all using (public.is_teacher());
create policy "student_read_assigned_notes" on public.notes for select using (
  exists (select 1 from public.note_assignments where note_id = notes.id and student_id = auth.uid())
);

-- Note assignments
create policy "teacher_full_note_assignments" on public.note_assignments for all using (public.is_teacher());
create policy "student_read_own_note_assignments" on public.note_assignments for select using (student_id = auth.uid());

-- Recordings
create policy "teacher_full_recordings" on public.recordings for all using (public.is_teacher());
create policy "student_read_assigned_recordings" on public.recordings for select using (
  exists (select 1 from public.recording_assignments where recording_id = recordings.id and student_id = auth.uid())
);

-- Recording assignments
create policy "teacher_full_recording_assignments" on public.recording_assignments for all using (public.is_teacher());
create policy "student_read_own_recording_assignments" on public.recording_assignments for select using (student_id = auth.uid());

-- Announcements
create policy "teacher_full_announcements" on public.announcements for all using (public.is_teacher());
create policy "student_read_announcements" on public.announcements for select using (
  exists (
    select 1 from public.announcement_assignments aa
    where aa.announcement_id = announcements.id
      and (aa.student_id = auth.uid() or aa.student_id is null)
  )
);

-- Announcement assignments
create policy "teacher_full_announcement_assignments" on public.announcement_assignments for all using (public.is_teacher());
create policy "student_read_own_announcement_assignments" on public.announcement_assignments
  for select using (student_id = auth.uid() or student_id is null);

-- ============================================================
-- SEED: Create the teacher account
-- Run this AFTER creating a user in Supabase Auth dashboard:
--   Email: admin@fsh.teacher  Password: your-password
-- Then replace the UUID below with that user's actual UUID.
-- ============================================================

-- INSERT INTO public.teacher_profiles (id, username, avatar)
-- VALUES ('<your-auth-user-uuid>', 'admin', '👨‍🏫');

-- ============================================================
-- NOTE: Students are created via the "Add Student" form in the
-- app, which calls supabase.auth.admin.createUser().
-- This requires the service_role key — you MUST create a
-- Supabase Edge Function for this (see README or plan notes).
-- Until then, you can manually create student auth users in
-- the Supabase dashboard with email = mobile@fsh.internal
-- and insert a matching row in the students table.
-- ============================================================
