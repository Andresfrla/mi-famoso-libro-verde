// =====================================================
// Explore Screen - Browse by Category/Difficulty
// =====================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  useColorScheme,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  RecipeCard,
  SearchBar,
  EmptyState,
  LoadingState,
} from '@/src/components';
import { getRecipes, getFavoriteIds, toggleFavorite } from '@/src/services';
import { useAuth } from '@/src/contexts';
import { Recipe, Difficulty } from '@/src/types';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius, DIFFICULTIES } from '@/src/lib/constants';

export default function ExploreScreen() {
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
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);

  const loadRecipes = useCallback(async () => {
    const { data } = await getRecipes({
      difficulty: selectedDifficulty || undefined,
      search: searchQuery || undefined,
    });

    if (data) {
      setRecipes(data);
    }
  }, [selectedDifficulty, searchQuery]);

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
        <Text style={[styles.title, { color: colors.text }]}>
          {t('navigation.explore')}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Difficulty Filter */}
      <View style={styles.filterContainer}>
        <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>
          {t('recipeForm.difficultyLabel')}:
        </Text>
        <View style={styles.filterPills}>
          {DIFFICULTIES.map((diff) => {
            const isSelected = selectedDifficulty === diff.value;
            return (
              <Pressable
                key={diff.value}
                style={[
                  styles.filterPill,
                  isSelected
                    ? { backgroundColor: colors.primary }
                    : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
                ]}
                onPress={() =>
                  setSelectedDifficulty(isSelected ? null : diff.value)
                }
              >
                <Text
                  style={[
                    styles.filterPillText,
                    { color: isSelected ? '#1E293B' : colors.textSecondary },
                  ]}
                >
                  {t(diff.labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Recipe Grid */}
      {recipes.length === 0 ? (
        <EmptyState
          icon="compass-outline"
          title={t('common.noResults')}
          message={t('home.emptyMessage')}
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
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
  },
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  filterContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  filterLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    marginBottom: Spacing.sm,
  },
  filterPills: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  filterPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  filterPillText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
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
