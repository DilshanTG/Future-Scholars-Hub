-- Move the remaining note (title has a trailing space) into Papers.
UPDATE notes SET category = 'paper'
WHERE category = 'note'
  AND trim(lower(title)) = lower('Unit Test - Financial Statements');

DO $$
DECLARE r RECORD;
BEGIN
  RAISE NOTICE '--- papers now ---';
  FOR r IN SELECT title FROM notes WHERE category = 'paper' ORDER BY title LOOP
    RAISE NOTICE 'PAPER: %', r.title;
  END LOOP;
END $$;
