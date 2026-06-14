-- Notes can be either study "notes" or "papers".
ALTER TABLE notes ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'note';

DO $$ BEGIN
  ALTER TABLE notes ADD CONSTRAINT notes_category_check CHECK (category IN ('note', 'paper'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
