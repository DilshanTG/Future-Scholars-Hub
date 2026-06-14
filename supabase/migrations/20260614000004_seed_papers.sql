-- Seed initial paper entries (unassigned; teacher assigns/attaches files later).
INSERT INTO notes (title, category)
SELECT v.title, 'paper'
FROM (VALUES
  ('Revision paper 1'),
  ('Unit Test - Financial Statements'),
  ('Revision 2 - Accounting Equation'),
  ('Revision Paper 3')
) AS v(title)
WHERE NOT EXISTS (
  SELECT 1 FROM notes n WHERE n.title = v.title AND n.category = 'paper'
);
