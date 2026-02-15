-- Add background styling columns to featured_sections
ALTER TABLE featured_sections ADD COLUMN IF NOT EXISTS bg_color text;
ALTER TABLE featured_sections ADD COLUMN IF NOT EXISTS bg_image text;
ALTER TABLE featured_sections ADD COLUMN IF NOT EXISTS bg_gradient text;
