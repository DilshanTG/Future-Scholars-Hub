CREATE TABLE IF NOT EXISTS marks (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id  UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  title       TEXT NOT NULL,
  score       NUMERIC NOT NULL,
  total       NUMERIC NOT NULL DEFAULT 100,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE marks ENABLE ROW LEVEL SECURITY;

-- Teachers: full access
CREATE POLICY "teachers_all_marks" ON marks
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM teacher_profiles WHERE id = auth.uid())
  );

-- Students: read own marks only
CREATE POLICY "students_read_own_marks" ON marks
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());
