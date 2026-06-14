-- Undo the wrongly-inserted placeholder papers from 20260614000004
-- (only the empty ones with no file/link/details and no assignments).
DELETE FROM notes n
WHERE n.category = 'paper'
  AND n.file_url IS NULL AND n.link IS NULL AND n.details IS NULL
  AND lower(n.title) IN (
    lower('Revision paper 1'), lower('Unit Test - Financial Statements'),
    lower('Revision 2 - Accounting Equation'), lower('Revision Paper 3')
  )
  AND NOT EXISTS (SELECT 1 FROM note_assignments a WHERE a.note_id = n.id);

-- Move the REAL existing notes into the Papers category.
UPDATE notes SET category = 'paper'
WHERE category = 'note'
  AND lower(title) IN (
    lower('Revision paper 1'), lower('Unit Test - Financial Statements'),
    lower('Revision 2 - Accounting Equation'), lower('Revision Paper 3')
  );

-- Report final paper titles to the push output for verification.
DO $$
DECLARE r RECORD;
BEGIN
  RAISE NOTICE '--- papers after fix ---';
  FOR r IN SELECT title FROM notes WHERE category = 'paper' ORDER BY title LOOP
    RAISE NOTICE 'PAPER: %', r.title;
  END LOOP;
END $$;
