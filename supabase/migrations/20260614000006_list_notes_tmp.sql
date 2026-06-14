-- (temporary, inspection-only) list all notes so we can find exact titles.
DO $$
DECLARE r RECORD;
BEGIN
  RAISE NOTICE '--- all notes ---';
  FOR r IN SELECT title, category FROM notes ORDER BY category, title LOOP
    RAISE NOTICE 'ROW [%]: %', r.category, r.title;
  END LOOP;
END $$;
