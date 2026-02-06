-- =====================================================
-- Mi Famoso Libro Verde - Database Schema (FIXED)
-- =====================================================
-- Run this in your Supabase SQL Editor

-- Enable UUID extension (usually enabled by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- RECIPES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Bilingual content
    title_es TEXT NOT NULL,
    title_en TEXT NOT NULL,
    description_es TEXT,
    description_en TEXT,
    ingredients_es JSONB DEFAULT '[]'::jsonb,
    ingredients_en JSONB DEFAULT '[]'::jsonb,
    steps_es JSONB DEFAULT '[]'::jsonb,
    steps_en JSONB DEFAULT '[]'::jsonb,

    -- Metadata
    image_url TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    prep_time_minutes INTEGER DEFAULT 0,
    servings INTEGER DEFAULT 4,
    difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    category TEXT DEFAULT 'all' CHECK (category IN ('all', 'breakfast', 'lunch', 'dinner', 'dessert', 'snack')),

    -- Stats (NEW: counter for favorites)
    favorites_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON public.recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_category ON public.recipes(category);
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON public.recipes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_favorites_count ON public.recipes(favorites_count DESC);

-- Full text search index for both languages
CREATE INDEX IF NOT EXISTS idx_recipes_title_es ON public.recipes USING gin(to_tsvector('spanish', title_es));
CREATE INDEX IF NOT EXISTS idx_recipes_title_en ON public.recipes USING gin(to_tsvector('english', title_en));

-- =====================================================
-- FAVORITES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure a user can only favorite a recipe once
    CONSTRAINT unique_user_recipe UNIQUE(user_id, recipe_id)
);

-- Index for faster favorite lookups
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_recipe_id ON public.favorites(recipe_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on recipes table
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read all recipes
CREATE POLICY "Public recipes are viewable by everyone"
    ON public.recipes
    FOR SELECT
    USING (true);

-- Policy: Authenticated users can insert recipes
CREATE POLICY "Users can create recipes"
    ON public.recipes
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Users can only update their own recipes
CREATE POLICY "Users can update their own recipes"
    ON public.recipes
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own recipes
CREATE POLICY "Users can delete their own recipes"
    ON public.recipes
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Enable RLS on favorites table
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own favorites
CREATE POLICY "Users can view their own favorites"
    ON public.favorites
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy: Users can add their own favorites
CREATE POLICY "Users can add favorites"
    ON public.favorites
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can remove their own favorites
CREATE POLICY "Users can delete their own favorites"
    ON public.favorites
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.recipes;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.recipes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Function to increment favorites_count
CREATE OR REPLACE FUNCTION public.increment_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.recipes
    SET favorites_count = favorites_count + 1
    WHERE id = NEW.recipe_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement favorites_count
CREATE OR REPLACE FUNCTION public.decrement_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.recipes
    SET favorites_count = GREATEST(favorites_count - 1, 0)
    WHERE id = OLD.recipe_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Increment counter when favorite is added
DROP TRIGGER IF EXISTS trg_increment_favorites ON public.favorites;
CREATE TRIGGER trg_increment_favorites
    AFTER INSERT ON public.favorites
    FOR EACH ROW
    EXECUTE FUNCTION public.increment_favorites_count();

-- Trigger: Decrement counter when favorite is removed
DROP TRIGGER IF EXISTS trg_decrement_favorites ON public.favorites;
CREATE TRIGGER trg_decrement_favorites
    AFTER DELETE ON public.favorites
    FOR EACH ROW
    EXECUTE FUNCTION public.decrement_favorites_count();

-- =====================================================
-- MIGRATION: Update existing recipes with current count (if any)
-- =====================================================

-- Update favorites_count for existing recipes
UPDATE public.recipes r
SET favorites_count = (
    SELECT COUNT(*)
    FROM public.favorites f
    WHERE f.recipe_id = r.id
);
