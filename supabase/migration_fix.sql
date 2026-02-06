-- =====================================================
-- PASO 1: Crear la columna favorites_count
-- =====================================================

-- Primero verificamos si existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'recipes' 
        AND column_name = 'favorites_count'
    ) THEN
        ALTER TABLE public.recipes ADD COLUMN favorites_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Columna favorites_count creada';
    ELSE
        RAISE NOTICE 'La columna ya existe';
    END IF;
END $$;

-- =====================================================
-- PASO 2: Actualizar recetas existentes con el conteo actual
-- =====================================================

UPDATE public.recipes r
SET favorites_count = COALESCE((
    SELECT COUNT(*)
    FROM public.favorites f
    WHERE f.recipe_id = r.id
), 0);

-- =====================================================
-- PASO 3: Crear índice para ordenamiento rápido
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_recipes_favorites_count 
ON public.recipes(favorites_count DESC);

-- =====================================================
-- PASO 4: Crear función para incrementar (ignora RLS)
-- =====================================================

CREATE OR REPLACE FUNCTION public.increment_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.recipes
    SET favorites_count = favorites_count + 1
    WHERE id = NEW.recipe_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PASO 5: Crear función para decrementar (ignora RLS)
-- =====================================================

CREATE OR REPLACE FUNCTION public.decrement_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.recipes
    SET favorites_count = GREATEST(favorites_count - 1, 0)
    WHERE id = OLD.recipe_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PASO 6: Crear triggers
-- =====================================================

-- Eliminar triggers si existen
DROP TRIGGER IF EXISTS trg_increment_favorites ON public.favorites;
DROP TRIGGER IF EXISTS trg_decrement_favorites ON public.favorites;

-- Crear trigger para incrementar
CREATE TRIGGER trg_increment_favorites
    AFTER INSERT ON public.favorites
    FOR EACH ROW
    EXECUTE FUNCTION public.increment_favorites_count();

-- Crear trigger para decrementar
CREATE TRIGGER trg_decrement_favorites
    AFTER DELETE ON public.favorites
    FOR EACH ROW
    EXECUTE FUNCTION public.decrement_favorites_count();

-- =====================================================
-- PASO 7: Verificar que todo funciona
-- =====================================================

SELECT '✅ Migración completada!' as status;

-- Ver las recetas con sus contadores
SELECT 
    title_es, 
    favorites_count 
FROM public.recipes 
ORDER BY favorites_count DESC 
LIMIT 10;
