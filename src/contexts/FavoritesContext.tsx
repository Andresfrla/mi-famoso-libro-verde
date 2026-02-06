// =====================================================
// Favorites Context - Global favorite state
// =====================================================

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { getFavoriteIds, toggleFavorite } from '@/src/services';
import { useAuth } from './AuthContext';

interface FavoritesContextType {
  favoriteIds: Set<string>;
  favoritesCount: Record<string, number>;
  toggleFavoriteGlobal: (recipeId: string) => Promise<void>;
  isFavorite: (recipeId: string) => boolean;
  getCount: (recipeId: string) => number;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favoritesCount, setFavoritesCount] = useState<Record<string, number>>({});

  // Load favorites on mount and when user changes
  const refreshFavorites = useCallback(async () => {
    const { data } = await getFavoriteIds(user?.id);
    if (data) {
      setFavoriteIds(data);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  const toggleFavoriteGlobal = useCallback(async (recipeId: string) => {
    const { data: isFav } = await toggleFavorite(recipeId, user?.id);
    
    // Update favoriteIds
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isFav) {
        next.add(recipeId);
      } else {
        next.delete(recipeId);
      }
      return next;
    });
    
    // Update favoritesCount
    setFavoritesCount((prev) => {
      const currentCount = prev[recipeId] || 0;
      return {
        ...prev,
        [recipeId]: isFav ? currentCount + 1 : Math.max(0, currentCount - 1),
      };
    });
  }, [user?.id]);

  const isFavorite = useCallback((recipeId: string) => {
    return favoriteIds.has(recipeId);
  }, [favoriteIds]);

  const getCount = useCallback((recipeId: string) => {
    return favoritesCount[recipeId] || 0;
  }, [favoritesCount]);

  const value: FavoritesContextType = {
    favoriteIds,
    favoritesCount,
    toggleFavoriteGlobal,
    isFavorite,
    getCount,
    refreshFavorites,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextType {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
