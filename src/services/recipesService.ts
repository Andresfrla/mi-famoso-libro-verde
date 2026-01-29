// =====================================================
// Recipes Service - CRUD Operations
// =====================================================

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Recipe, RecipeFormData, RecipeFilters, ApiResponse, Category } from '../types';

// Demo data for when Supabase is not configured
const DEMO_RECIPES: Recipe[] = [
  {
    id: '1',
    user_id: null,
    title_es: 'Ensalada Verde Primavera',
    title_en: 'Spring Green Salad',
    description_es: 'Una ensalada fresca y nutritiva perfecta para los días de primavera.',
    description_en: 'A fresh and nutritious salad perfect for spring days.',
    ingredients_es: ['2 tazas de espinaca fresca', '1 aguacate maduro', '1/2 taza de semillas de calabaza'],
    ingredients_en: ['2 cups fresh spinach', '1 ripe avocado', '1/2 cup pumpkin seeds'],
    steps_es: ['Lavar y secar las hojas de espinaca', 'Cortar el aguacate en cubos', 'Mezclar todo'],
    steps_en: ['Wash and dry spinach leaves', 'Cut avocado into cubes', 'Mix everything'],
    image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
    tags: ['vegano', 'saludable', 'rápido'],
    prep_time_minutes: 15,
    servings: 2,
    difficulty: 'easy',
    category: 'lunch',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: null,
    title_es: 'Pasta al Pesto Cremoso',
    title_en: 'Creamy Pesto Pasta',
    description_es: 'Una deliciosa pasta con salsa de pesto casera.',
    description_en: 'A delicious pasta with homemade pesto sauce.',
    ingredients_es: ['400g de pasta penne', '2 tazas de hojas de albahaca', '1/2 taza de queso parmesano'],
    ingredients_en: ['400g penne pasta', '2 cups basil leaves', '1/2 cup parmesan cheese'],
    steps_es: ['Cocinar la pasta', 'Preparar el pesto', 'Mezclar y servir'],
    steps_en: ['Cook pasta', 'Prepare pesto', 'Mix and serve'],
    image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800',
    tags: ['italiano', 'pasta', 'vegetariano'],
    prep_time_minutes: 25,
    servings: 4,
    difficulty: 'medium',
    category: 'dinner',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: null,
    title_es: 'Tacos Veganos de Coliflor',
    title_en: 'Vegan Cauliflower Tacos',
    description_es: 'Tacos saludables con coliflor asada especiada.',
    description_en: 'Healthy tacos with spiced roasted cauliflower.',
    ingredients_es: ['1 coliflor mediana', '8 tortillas de maíz', '1 aguacate'],
    ingredients_en: ['1 medium cauliflower', '8 corn tortillas', '1 avocado'],
    steps_es: ['Asar la coliflor', 'Calentar las tortillas', 'Armar los tacos'],
    steps_en: ['Roast cauliflower', 'Warm tortillas', 'Assemble tacos'],
    image_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800',
    tags: ['vegano', 'mexicano', 'saludable'],
    prep_time_minutes: 35,
    servings: 4,
    difficulty: 'medium',
    category: 'dinner',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    user_id: null,
    title_es: 'Smoothie Bowl Verde',
    title_en: 'Green Smoothie Bowl',
    description_es: 'Un bowl nutritivo y refrescante para empezar el día.',
    description_en: 'A nutritious and refreshing bowl to start the day.',
    ingredients_es: ['1 plátano congelado', '1 taza de espinaca', '1/2 taza de leche de almendras'],
    ingredients_en: ['1 frozen banana', '1 cup spinach', '1/2 cup almond milk'],
    steps_es: ['Licuar todos los ingredientes', 'Verter en un bowl', 'Decorar con toppings'],
    steps_en: ['Blend all ingredients', 'Pour into bowl', 'Top with toppings'],
    image_url: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800',
    tags: ['desayuno', 'vegano', 'saludable'],
    prep_time_minutes: 10,
    servings: 1,
    difficulty: 'easy',
    category: 'breakfast',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    user_id: null,
    title_es: 'Toast de Aguacate con Huevo',
    title_en: 'Avocado Toast with Egg',
    description_es: 'El clásico desayuno moderno con aguacate cremoso.',
    description_en: 'The modern breakfast classic with creamy avocado.',
    ingredients_es: ['2 rebanadas de pan integral', '1 aguacate maduro', '2 huevos'],
    ingredients_en: ['2 slices whole grain bread', '1 ripe avocado', '2 eggs'],
    steps_es: ['Tostar el pan', 'Machacar el aguacate', 'Preparar los huevos'],
    steps_en: ['Toast bread', 'Mash avocado', 'Prepare eggs'],
    image_url: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800',
    tags: ['desayuno', 'rápido', 'saludable'],
    prep_time_minutes: 10,
    servings: 2,
    difficulty: 'easy',
    category: 'breakfast',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    user_id: null,
    title_es: 'Sopa de Lentejas Reconfortante',
    title_en: 'Comforting Lentil Soup',
    description_es: 'Una sopa caliente y nutritiva perfecta para los días fríos.',
    description_en: 'A warm and nutritious soup perfect for cold days.',
    ingredients_es: ['2 tazas de lentejas', '1 cebolla grande', '3 zanahorias'],
    ingredients_en: ['2 cups lentils', '1 large onion', '3 carrots'],
    steps_es: ['Saltear las verduras', 'Agregar lentejas y caldo', 'Cocinar hasta que estén tiernas'],
    steps_en: ['Sauté vegetables', 'Add lentils and broth', 'Cook until tender'],
    image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
    tags: ['sopa', 'vegano', 'proteína'],
    prep_time_minutes: 40,
    servings: 6,
    difficulty: 'easy',
    category: 'lunch',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// In-memory storage for demo mode
let demoFavorites: Set<string> = new Set(['2']); // Pesto Pasta is favorited by default

/**
 * Get all recipes with optional filtering
 */
export async function getRecipes(filters?: RecipeFilters): Promise<ApiResponse<Recipe[]>> {
  if (!isSupabaseConfigured()) {
    // Demo mode - filter in memory
    let filtered = [...DEMO_RECIPES];

    if (filters?.category && filters.category !== 'all') {
      filtered = filtered.filter((r) => r.category === filters.category);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title_es.toLowerCase().includes(searchLower) ||
          r.title_en.toLowerCase().includes(searchLower) ||
          r.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    if (filters?.difficulty) {
      filtered = filtered.filter((r) => r.difficulty === filters.difficulty);
    }

    return { data: filtered, error: null };
  }

  try {
    let query = supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    if (filters?.search) {
      query = query.or(
        `title_es.ilike.%${filters.search}%,title_en.ilike.%${filters.search}%`
      );
    }

    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }

    const { data, error } = await query;

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Recipe[], error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

/**
 * Get a single recipe by ID
 */
export async function getRecipeById(id: string): Promise<ApiResponse<Recipe>> {
  if (!isSupabaseConfigured()) {
    const recipe = DEMO_RECIPES.find((r) => r.id === id);
    if (recipe) {
      return { data: recipe, error: null };
    }
    return { data: null, error: 'Recipe not found' };
  }

  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Recipe, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

/**
 * Create a new recipe
 */
export async function createRecipe(
  formData: RecipeFormData,
  userId?: string
): Promise<ApiResponse<Recipe>> {
  if (!isSupabaseConfigured()) {
    const newRecipe: Recipe = {
      id: String(Date.now()),
      user_id: userId || null,
      ...formData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    DEMO_RECIPES.unshift(newRecipe);
    return { data: newRecipe, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('recipes')
      .insert({
        user_id: userId || null,
        ...formData,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Recipe, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

/**
 * Update an existing recipe
 */
export async function updateRecipe(
  id: string,
  formData: Partial<RecipeFormData>
): Promise<ApiResponse<Recipe>> {
  if (!isSupabaseConfigured()) {
    const index = DEMO_RECIPES.findIndex((r) => r.id === id);
    if (index !== -1) {
      DEMO_RECIPES[index] = {
        ...DEMO_RECIPES[index],
        ...formData,
        updated_at: new Date().toISOString(),
      };
      return { data: DEMO_RECIPES[index], error: null };
    }
    return { data: null, error: 'Recipe not found' };
  }

  try {
    const { data, error } = await supabase
      .from('recipes')
      .update(formData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Recipe, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

/**
 * Delete a recipe
 */
export async function deleteRecipe(id: string): Promise<ApiResponse<void>> {
  if (!isSupabaseConfigured()) {
    const index = DEMO_RECIPES.findIndex((r) => r.id === id);
    if (index !== -1) {
      DEMO_RECIPES.splice(index, 1);
      demoFavorites.delete(id);
      return { data: undefined, error: null };
    }
    return { data: null, error: 'Recipe not found' };
  }

  try {
    const { error } = await supabase.from('recipes').delete().eq('id', id);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: undefined, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

/**
 * Get user's favorite recipes
 */
export async function getFavorites(userId?: string): Promise<ApiResponse<Recipe[]>> {
  if (!isSupabaseConfigured()) {
    const favorites = DEMO_RECIPES.filter((r) => demoFavorites.has(r.id));
    return { data: favorites, error: null };
  }

  if (!userId) {
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('recipe_id, recipes(*)')
      .eq('user_id', userId);

    if (error) {
      return { data: null, error: error.message };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recipes = (data as any[])
      .map((f) => f.recipes as Recipe | null)
      .filter((r): r is Recipe => r !== null);

    return { data: recipes, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

/**
 * Check if a recipe is favorited by the user
 */
export async function isFavorite(
  recipeId: string,
  userId?: string
): Promise<ApiResponse<boolean>> {
  if (!isSupabaseConfigured()) {
    return { data: demoFavorites.has(recipeId), error: null };
  }

  if (!userId) {
    return { data: false, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('recipe_id', recipeId)
      .maybeSingle();

    if (error) {
      return { data: false, error: error.message };
    }

    return { data: !!data, error: null };
  } catch (err) {
    return { data: false, error: (err as Error).message };
  }
}

/**
 * Get favorite status for multiple recipes
 */
export async function getFavoriteIds(userId?: string): Promise<ApiResponse<Set<string>>> {
  if (!isSupabaseConfigured()) {
    return { data: new Set(demoFavorites), error: null };
  }

  if (!userId) {
    return { data: new Set(), error: null };
  }

  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('recipe_id')
      .eq('user_id', userId);

    if (error) {
      return { data: new Set(), error: error.message };
    }

    const ids = new Set(data.map((f: { recipe_id: string }) => f.recipe_id));
    return { data: ids, error: null };
  } catch (err) {
    return { data: new Set(), error: (err as Error).message };
  }
}

/**
 * Toggle favorite status for a recipe
 */
export async function toggleFavorite(
  recipeId: string,
  userId?: string
): Promise<ApiResponse<boolean>> {
  if (!isSupabaseConfigured()) {
    if (demoFavorites.has(recipeId)) {
      demoFavorites.delete(recipeId);
      return { data: false, error: null };
    } else {
      demoFavorites.add(recipeId);
      return { data: true, error: null };
    }
  }

  if (!userId) {
    return { data: false, error: 'User not authenticated' };
  }

  try {
    // Check if already favorited
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('recipe_id', recipeId)
      .maybeSingle();

    if (existing) {
      // Remove favorite
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('recipe_id', recipeId);

      if (error) {
        return { data: true, error: error.message };
      }

      return { data: false, error: null };
    } else {
      // Add favorite
      const { error } = await supabase.from('favorites').insert({
        user_id: userId,
        recipe_id: recipeId,
      });

      if (error) {
        return { data: false, error: error.message };
      }

      return { data: true, error: null };
    }
  } catch (err) {
    return { data: false, error: (err as Error).message };
  }
}

/**
 * Get recipes by category
 */
export async function getRecipesByCategory(
  category: Category
): Promise<ApiResponse<Recipe[]>> {
  return getRecipes({ category });
}

/**
 * Search recipes
 */
export async function searchRecipes(query: string): Promise<ApiResponse<Recipe[]>> {
  return getRecipes({ search: query });
}
