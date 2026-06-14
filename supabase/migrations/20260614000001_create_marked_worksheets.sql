-- Marked worksheets: one graded PDF per student, produced by the marking tool.

CREATE TABLE IF NOT EXISTS marked_worksheets (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id  UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  title       TEXT,
  file_url    TEXT NOT NULL,
  page_count  INT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS marked_worksheets_student_id_idx
  ON marked_worksheets (student_id);

ALTER TABLE marked_worksheets ENABLE ROW LEVEL SECURITY;

-- Teachers: full access (USING is reused as WITH CHECK for inserts)
CREATE POLICY "teachers_all_marked_worksheets" ON marked_worksheets
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM teacher_profiles WHERE id = auth.uid())
  );

-- Students: read own marked worksheets only
CREATE POLICY "students_read_own_marked_worksheets" ON marked_worksheets
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

-- Public storage bucket for the generated PDFs (mirrors note-files).
INSERT INTO storage.buckets (id, name, public)
VALUES ('marked-worksheets', 'marked-worksheets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: teachers upload/manage; anyone can read (public bucket).
DROP POLICY IF EXISTS "teachers_manage_marked_worksheets_objects" ON storage.objects;
CREATE POLICY "teachers_manage_marked_worksheets_objects" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'marked-worksheets'
    AND EXISTS (SELECT 1 FROM teacher_profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    bucket_id = 'marked-worksheets'
    AND EXISTS (SELECT 1 FROM teacher_profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "public_read_marked_worksheets_objects" ON storage.objects;
CREATE POLICY "public_read_marked_worksheets_objects" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'marked-worksheets');
