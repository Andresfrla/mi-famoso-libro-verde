// =====================================================
// Recipe Detail Screen
// =====================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Pressable,
  ImageBackground,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { LoadingState } from '@/src/components';
import { getRecipeById, toggleFavorite, isFavorite, deleteRecipe } from '@/src/services';
import { useAuth, useLanguage } from '@/src/contexts';
import { Recipe } from '@/src/types';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/src/lib/constants';

type TabType = 'ingredients' | 'instructions';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { user } = useAuth();
  const { language, getLocalizedField } = useLanguage();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorite, setFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('ingredients');
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());

  const loadRecipe = useCallback(async () => {
    if (!id) return;

    const { data } = await getRecipeById(id);
    if (data) {
      setRecipe(data);
    }

    const { data: isFav } = await isFavorite(id, user?.id);
    setFavorite(isFav || false);
  }, [id, user?.id]);

  useEffect(() => {
    setLoading(true);
    loadRecipe().finally(() => setLoading(false));
  }, [loadRecipe]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleFavoritePress = useCallback(async () => {
    if (!id) return;
    const { data: isFav } = await toggleFavorite(id, user?.id);
    setFavorite(isFav || false);
  }, [id, user?.id]);

  const handleEdit = useCallback(() => {
    if (!id) return;
    router.push(`/recipe/edit/${id}`);
  }, [id, router]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      t('common.delete'),
      t('recipe.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            const { error } = await deleteRecipe(id);
            if (!error) {
              router.back();
            } else {
              Alert.alert(t('common.error'), t('recipe.deleteError'));
            }
          },
        },
      ]
    );
  }, [id, t, router]);

  const toggleIngredient = useCallback((index: number) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  if (loading || !recipe) {
    return <LoadingState />;
  }

  const title = getLocalizedField(recipe as unknown as Record<string, unknown>, 'title');
  const otherTitle = language === 'es' ? recipe.title_en : recipe.title_es;
  const description = getLocalizedField(recipe as unknown as Record<string, unknown>, 'description');
  const ingredients = language === 'es' ? recipe.ingredients_es : recipe.ingredients_en;
  const otherIngredients = language === 'es' ? recipe.ingredients_en : recipe.ingredients_es;
  const steps = language === 'es' ? recipe.steps_es : recipe.steps_en;
  const difficultyKey = `difficulty.${recipe.difficulty}`;
  const categoryKey = `categories.${recipe.category}`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <ImageBackground
          source={{ uri: recipe.image_url || 'https://via.placeholder.com/400x300' }}
          style={styles.heroImage}
        >
          {/* Header Overlay */}
          <View style={[styles.headerOverlay, { paddingTop: insets.top }]}>
            <Pressable
              style={[styles.headerButton, { backgroundColor: 'rgba(255,255,255,0.9)' }]}
              onPress={handleBack}
            >
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </Pressable>
            <Text style={styles.headerTitle}>
              {t('recipe.title')}
            </Text>
            <Pressable
              style={[styles.headerButton, { backgroundColor: 'rgba(255,255,255,0.9)' }]}
              onPress={handleEdit}
            >
              <Ionicons name="globe-outline" size={24} color={colors.text} />
            </Pressable>
          </View>

          {/* Category Tag */}
          <View style={[styles.categoryTag, { backgroundColor: colors.primary }]}>
            <Text style={styles.categoryTagText}>{t(categoryKey)}</Text>
          </View>
        </ImageBackground>

        {/* Content */}
        <View style={styles.content}>
          {/* Title and Favorite */}
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
              <Text style={[styles.subtitle, { color: colors.primary }]}>{otherTitle}</Text>
            </View>
            <Pressable
              style={[styles.favoriteButton, { backgroundColor: `${colors.primary}15` }]}
              onPress={handleFavoritePress}
            >
              <Ionicons
                name={favorite ? 'heart' : 'heart-outline'}
                size={24}
                color={favorite ? colors.primary : colors.textMuted}
              />
            </Pressable>
          </View>

          {/* Meta Info */}
          <View style={styles.metaRow}>
            <View style={[styles.metaItem, { backgroundColor: colors.surface }]}>
              <Ionicons name="time-outline" size={18} color={colors.primary} />
              <Text style={[styles.metaText, { color: colors.text }]}>
                {recipe.prep_time_minutes} {t('recipe.minutes')}
              </Text>
            </View>
            <View style={[styles.metaItem, { backgroundColor: colors.surface }]}>
              <Ionicons name="bar-chart-outline" size={18} color={colors.primary} />
              <Text style={[styles.metaText, { color: colors.text }]}>
                {t(difficultyKey)}
              </Text>
            </View>
            <View style={[styles.metaItem, { backgroundColor: colors.surface }]}>
              <Ionicons name="people-outline" size={18} color={colors.primary} />
              <Text style={[styles.metaText, { color: colors.text }]}>
                {recipe.servings} {t('recipe.servings')}
              </Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
            <Pressable
              style={[
                styles.tab,
                activeTab === 'ingredients' && [styles.tabActive, { borderBottomColor: colors.primary }],
              ]}
              onPress={() => setActiveTab('ingredients')}
            >
              <Text
                style={[
                  styles.tabTitle,
                  { color: activeTab === 'ingredients' ? colors.text : colors.textMuted },
                ]}
              >
                {t('recipe.ingredients')}
              </Text>
              <Text
                style={[
                  styles.tabSubtitle,
                  { color: activeTab === 'ingredients' ? colors.primary : colors.textMuted },
                ]}
              >
                {language === 'es' ? 'INGREDIENTES' : 'INGREDIENTS'}
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.tab,
                activeTab === 'instructions' && [styles.tabActive, { borderBottomColor: colors.primary }],
              ]}
              onPress={() => setActiveTab('instructions')}
            >
              <Text
                style={[
                  styles.tabTitle,
                  { color: activeTab === 'instructions' ? colors.text : colors.textMuted },
                ]}
              >
                {t('recipe.instructions')}
              </Text>
              <Text
                style={[
                  styles.tabSubtitle,
                  { color: activeTab === 'instructions' ? colors.primary : colors.textMuted },
                ]}
              >
                {language === 'es' ? 'INSTRUCCIONES' : 'INSTRUCTIONS'}
              </Text>
            </Pressable>
          </View>

          {/* Tab Content */}
          {activeTab === 'ingredients' ? (
            <View style={styles.tabContent}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {t('recipe.ingredientsList')}
                </Text>
                <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
                  {recipe.servings} {t('recipe.servings').toUpperCase()}
                </Text>
              </View>

              {ingredients.map((ingredient, index) => (
                <Pressable
                  key={index}
                  style={[styles.ingredientItem, { backgroundColor: colors.surface }]}
                  onPress={() => toggleIngredient(index)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      { borderColor: colors.primary },
                      checkedIngredients.has(index) && { backgroundColor: colors.primary },
                    ]}
                  >
                    {checkedIngredients.has(index) && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                  <View style={styles.ingredientText}>
                    <Text
                      style={[
                        styles.ingredientMain,
                        { color: colors.text },
                        checkedIngredients.has(index) && styles.ingredientChecked,
                      ]}
                    >
                      {ingredient}
                    </Text>
                    {otherIngredients[index] && (
                      <Text style={[styles.ingredientSecondary, { color: colors.primary }]}>
                        {otherIngredients[index]}
                      </Text>
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.tabContent}>
              {steps.map((step, index) => (
                <View key={index} style={[styles.stepItem, { backgroundColor: colors.surface }]}>
                  <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={[styles.stepText, { color: colors.text }]}>{step}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Delete Button (only for owner) */}
          {recipe.user_id === user?.id && (
            <Pressable
              style={[styles.deleteButton, { borderColor: colors.error }]}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
              <Text style={[styles.deleteButtonText, { color: colors.error }]}>
                {t('common.delete')}
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      {/* Start Cooking Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <Pressable style={[styles.startButton, { backgroundColor: colors.primary }]}>
          <Ionicons name="play-circle" size={24} color="#1E293B" />
          <Text style={styles.startButtonText}>{t('recipe.startCooking')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroImage: {
    height: 300,
    justifyContent: 'space-between',
  },
  headerOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    margin: Spacing.md,
  },
  categoryTagText: {
    color: '#1E293B',
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: 120,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  titleContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
  },
  subtitle: {
    fontSize: FontSizes.lg,
    marginTop: Spacing.xs,
  },
  favoriteButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  metaText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {},
  tabTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
  },
  tabSubtitle: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    marginTop: 2,
  },
  tabContent: {
    marginTop: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
  },
  sectionSubtitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  ingredientText: {
    flex: 1,
  },
  ingredientMain: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
  },
  ingredientSecondary: {
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  ingredientChecked: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  stepItem: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  stepNumberText: {
    color: '#1E293B',
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
  },
  stepText: {
    flex: 1,
    fontSize: FontSizes.md,
    lineHeight: 24,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  deleteButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    backgroundColor: 'transparent',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  startButtonText: {
    color: '#1E293B',
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
});
