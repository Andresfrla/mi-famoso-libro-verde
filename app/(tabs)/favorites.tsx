// =====================================================
// Favorites Screen
// =====================================================

import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
import { Ionicons } from '@expo/vector-icons';

import { FavoriteCard, EmptyState, LoadingState, LanguageToggle } from '@/src/components';
import { getFavorites } from '@/src/services';
import { useAuth } from '@/src/contexts';
import { Recipe } from '@/src/types';
import { Colors, Spacing, FontSizes, FontWeights } from '@/src/lib/constants';

export default function FavoritesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { user } = useAuth();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = useCallback(async () => {
    const { data } = await getFavorites(user?.id);
    if (data) {
      setRecipes(data);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadFavorites().finally(() => setLoading(false));
    }, [loadFavorites])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  }, [loadFavorites]);

  const handleRecipePress = useCallback(
    (recipe: Recipe) => {
      router.push(`/recipe/${recipe.id}`);
    },
    [router]
  );

  const handleBrowseRecipes = useCallback(() => {
    router.push('/');
  }, [router]);

  const renderRecipe = useCallback(
    ({ item }: { item: Recipe }) => (
      <FavoriteCard
        recipe={item}
        onPress={() => handleRecipePress(item)}
      />
    ),
    [handleRecipePress]
  );

  if (loading) {
    return <LoadingState />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('favorites.title')}
          </Text>
          <LanguageToggle />
        </View>
      </View>

      {/* Favorites List */}
      {recipes.length === 0 ? (
        <EmptyState
          icon="heart-outline"
          title={t('favorites.emptyTitle')}
          message={t('favorites.emptyMessage')}
          actionLabel={t('favorites.browseRecipes')}
          onAction={handleBrowseRecipes}
        />
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipe}
          keyExtractor={(item) => item.id}
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
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    textAlign: 'center',
  },
  listContent: {
    paddingTop: Spacing.md,
    paddingBottom: 120,
  },
});
