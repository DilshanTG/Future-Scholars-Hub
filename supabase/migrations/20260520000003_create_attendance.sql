CREATE TABLE IF NOT EXISTS public.attendance (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id    UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  student_id  UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  joined_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (class_id, student_id)
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teacher_read_attendance" ON public.attendance
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM teacher_profiles WHERE id = auth.uid()));

CREATE POLICY "student_insert_attendance" ON public.attendance
  FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "student_read_attendance" ON public.attendance
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());
