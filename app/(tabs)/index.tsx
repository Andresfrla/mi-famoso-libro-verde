// =====================================================
// Home Screen - Recipe List
// =====================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  RecipeCard,
  SearchBar,
  CategoryFilter,
  EmptyState,
  LoadingState,
  FAB,
  LanguageToggle,
} from '@/src/components';
import { getRecipes, getFavoriteIds, toggleFavorite } from '@/src/services';
import { useAuth } from '@/src/contexts';
import { Recipe, Category } from '@/src/types';
import { Colors, Spacing, FontSizes, FontWeights } from '@/src/lib/constants';

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { user } = useAuth();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');

  const loadRecipes = useCallback(async () => {
    const { data, error } = await getRecipes({
      category: selectedCategory,
      search: searchQuery || undefined,
    });

    if (data) {
      setRecipes(data);
    }
  }, [selectedCategory, searchQuery]);

  const loadFavorites = useCallback(async () => {
    const { data } = await getFavoriteIds(user?.id);
    if (data) {
      setFavoriteIds(data);
    }
  }, [user?.id]);

  const loadData = useCallback(async () => {
    await Promise.all([loadRecipes(), loadFavorites()]);
  }, [loadRecipes, loadFavorites]);

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleFavoritePress = useCallback(
    async (recipeId: string) => {
      const { data: isFav } = await toggleFavorite(recipeId, user?.id);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isFav) {
          next.add(recipeId);
        } else {
          next.delete(recipeId);
        }
        return next;
      });
    },
    [user?.id]
  );

  const handleRecipePress = useCallback(
    (recipe: Recipe) => {
      router.push(`/recipe/${recipe.id}`);
    },
    [router]
  );

  const handleAddRecipe = useCallback(() => {
    router.push('/recipe/create');
  }, [router]);

  const renderRecipe = useCallback(
    ({ item, index }: { item: Recipe; index: number }) => (
      <View style={[styles.cardWrapper, index % 2 === 0 ? styles.cardLeft : styles.cardRight]}>
        <RecipeCard
          recipe={item}
          isFavorite={favoriteIds.has(item.id)}
          onPress={() => handleRecipePress(item)}
          onFavoritePress={() => handleFavoritePress(item.id)}
        />
      </View>
    ),
    [favoriteIds, handleRecipePress, handleFavoritePress]
  );

  if (loading) {
    return <LoadingState />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.headerRow}>
          <View style={[styles.logoContainer, { backgroundColor: `${colors.primary}15` }]}>
            <Ionicons name="book" size={24} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('common.appName')}
          </Text>
          <LanguageToggle />
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Filter */}
      <CategoryFilter
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Recipe Grid */}
      {recipes.length === 0 ? (
        <EmptyState
          icon="restaurant-outline"
          title={t('home.emptyTitle')}
          message={t('home.emptyMessage')}
          actionLabel={t('home.addRecipe')}
          onAction={handleAddRecipe}
        />
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipe}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}

      {/* FAB */}
      <FAB icon="add" onPress={handleAddRecipe} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    marginLeft: Spacing.sm,
  },
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 120,
  },
  cardWrapper: {
    flex: 1,
    maxWidth: '50%',
  },
  cardLeft: {
    paddingRight: Spacing.sm,
  },
  cardRight: {
    paddingLeft: Spacing.sm,
  },
});
