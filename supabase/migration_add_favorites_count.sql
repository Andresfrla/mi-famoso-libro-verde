-- =====================================================
-- MIGRATION: Add favorites_count to existing database
-- =====================================================
-- Run this in Supabase SQL Editor if you already have the database

-- 1. Add favorites_count column to recipes table
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS favorites_count INTEGER DEFAULT 0;

-- 2. Create index for faster sorting by favorites
CREATE INDEX IF NOT EXISTS idx_recipes_favorites_count ON public.recipes(favorites_count DESC);

-- 3. Function to increment favorites_count (ignores RLS)
CREATE OR REPLACE FUNCTION public.increment_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.recipes
    SET favorites_count = favorites_count + 1
    WHERE id = NEW.recipe_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Function to decrement favorites_count (ignores RLS)
CREATE OR REPLACE FUNCTION public.decrement_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.recipes
    SET favorites_count = GREATEST(favorites_count - 1, 0)
    WHERE id = OLD.recipe_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger: Increment when favorite is added
DROP TRIGGER IF EXISTS trg_increment_favorites ON public.favorites;
CREATE TRIGGER trg_increment_favorites
    AFTER INSERT ON public.favorites
    FOR EACH ROW
    EXECUTE FUNCTION public.increment_favorites_count();

-- 6. Trigger: Decrement when favorite is removed
DROP TRIGGER IF EXISTS trg_decrement_favorites ON public.favorites;
CREATE TRIGGER trg_decrement_favorites
    AFTER DELETE ON public.favorites
    FOR EACH ROW
    EXECUTE FUNCTION public.decrement_favorites_count();

-- 7. Update policy to allow reading all recipes (for the counter to work)
DROP POLICY IF EXISTS "Public recipes are viewable by everyone" ON public.recipes;
CREATE POLICY "Public recipes are viewable by everyone"
    ON public.recipes
    FOR SELECT
    USING (true);

-- 8. Update existing recipes with current favorite count
UPDATE public.recipes r
SET favorites_count = COALESCE((
    SELECT COUNT(*)
    FROM public.favorites f
    WHERE f.recipe_id = r.id
), 0);

-- 9. Verify the migration
SELECT 'Migration complete!' as status;
SELECT title_es, favorites_count FROM public.recipes ORDER BY favorites_count DESC LIMIT 5;
