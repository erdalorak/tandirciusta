-- Supabase dashboard → SQL Editor'e yapıştırın ve çalıştırın
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';
