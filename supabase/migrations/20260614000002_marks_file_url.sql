-- Fold marked worksheets into the marks table: a mark can now carry a PDF.
ALTER TABLE marks ADD COLUMN IF NOT EXISTS file_url TEXT;

-- The standalone marked_worksheets table is replaced by marks.file_url.
-- (The marked-worksheets storage bucket is kept and reused for the PDFs.)
DROP TABLE IF EXISTS marked_worksheets;
