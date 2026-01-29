// =====================================================
// Mi Famoso Libro Verde - Type Definitions
// =====================================================

export type Difficulty = 'easy' | 'medium' | 'hard';
export type Category = 'all' | 'breakfast' | 'lunch' | 'dinner' | 'dessert' | 'snack';
export type Language = 'es' | 'en';
export type MeasurementSystem = 'metric' | 'imperial';

export interface Recipe {
  id: string;
  user_id: string | null;
  title_es: string;
  title_en: string;
  description_es: string | null;
  description_en: string | null;
  ingredients_es: string[];
  ingredients_en: string[];
  steps_es: string[];
  steps_en: string[];
  image_url: string | null;
  tags: string[];
  prep_time_minutes: number;
  servings: number;
  difficulty: Difficulty;
  category: Category;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  recipe_id: string;
  created_at: string;
}

export interface RecipeWithFavorite extends Recipe {
  is_favorite: boolean;
}

export interface RecipeFormData {
  title_es: string;
  title_en: string;
  description_es: string;
  description_en: string;
  ingredients_es: string[];
  ingredients_en: string[];
  steps_es: string[];
  steps_en: string[];
  image_url: string;
  tags: string[];
  prep_time_minutes: number;
  servings: number;
  difficulty: Difficulty;
  category: Category;
}

export interface User {
  id: string;
  email: string | null;
  created_at: string;
}

// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      recipes: {
        Row: Recipe;
        Insert: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Recipe, 'id' | 'created_at' | 'updated_at'>>;
      };
      favorites: {
        Row: Favorite;
        Insert: Omit<Favorite, 'id' | 'created_at'>;
        Update: Partial<Omit<Favorite, 'id' | 'created_at'>>;
      };
    };
  };
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Filter types
export interface RecipeFilters {
  category?: Category;
  search?: string;
  difficulty?: Difficulty;
}
