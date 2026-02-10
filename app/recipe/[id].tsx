// =====================================================
// Recipe Detail Screen
// =====================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Pressable,
  ImageBackground,
  Alert,
  Modal,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { LoadingState } from '@/src/components';
import { getRecipeById, deleteRecipe } from '@/src/services';
import { useAuth, useLanguage, useFavorites } from '@/src/contexts';
import { Recipe } from '@/src/types';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/src/lib/constants';

type TabType = 'ingredients' | 'instructions';

interface Timer {
  id: string;
  duration: number;
  remaining: number;
  isRunning: boolean;
  label: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { user } = useAuth();
  const { language, getLocalizedField } = useLanguage();
  const { isFavorite, toggleFavoriteGlobal } = useFavorites();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('ingredients');
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());

  // Cooking mode states
  const [cookingModeVisible, setCookingModeVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timers, setTimers] = useState<Timer[]>([]);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const loadRecipe = useCallback(async () => {
    if (!id) return;

    const { data } = await getRecipeById(id);
    if (data) {
      setRecipe(data);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    loadRecipe().finally(() => setLoading(false));
  }, [loadRecipe]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleFavoritePress = useCallback(async () => {
    if (!id) return;
    await toggleFavoriteGlobal(id);
  }, [id, toggleFavoriteGlobal]);

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

  // Extract time from step text
  const extractTimeFromStep = useCallback((step: string): number | null => {
    const patterns = [
      /(\d+)\s*(?:minutos?|mins?|min)/i,
      /(\d+)\s*(?:horas?|hrs?|h)/i,
    ];

    for (const pattern of patterns) {
      const match = step.match(pattern);
      if (match) {
        const value = parseInt(match[1], 10);
        if (pattern.toString().includes('hora')) {
          return value * 60;
        }
        return value;
      }
    }
    return null;
  }, []);

  // Timer functions
  const startTimer = useCallback((duration: number, label: string) => {
    const id = Date.now().toString();
    const newTimer: Timer = {
      id,
      duration: duration * 60,
      remaining: duration * 60,
      isRunning: true,
      label,
    };
    setTimers((prev) => [...prev, newTimer]);
  }, []);

  const toggleTimer = useCallback((timerId: string) => {
    setTimers((prev) =>
      prev.map((timer) =>
        timer.id === timerId ? { ...timer, isRunning: !timer.isRunning } : timer
      )
    );
  }, []);

  const removeTimer = useCallback((timerId: string) => {
    setTimers((prev) => prev.filter((timer) => timer.id !== timerId));
  }, []);

  // Update timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) =>
        prev.map((timer) => {
          if (timer.isRunning && timer.remaining > 0) {
            return { ...timer, remaining: timer.remaining - 1 };
          }
          return timer;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format time display
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Cooking mode functions
  const openCookingMode = useCallback(() => {
    setCurrentStep(0);
    setTimers([]);
    setCookingModeVisible(true);
  }, []);

  const closeCookingMode = useCallback(() => {
    setCookingModeVisible(false);
    setTimers([]);
  }, []);

  const goToNextStep = useCallback(() => {
    if (recipe && currentStep < (language === 'es' ? recipe.steps_es.length : recipe.steps_en.length) - 1) {
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: -SCREEN_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_WIDTH,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, recipe, language, slideAnim]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) {
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: SCREEN_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -SCREEN_WIDTH,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep, slideAnim]);

  // Pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50) {
          goToNextStep();
        } else if (gestureState.dx > 50) {
          goToPreviousStep();
        }
      },
    })
  ).current;

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
              <Ionicons name="chevron-back" size={24} color="#11181C" />
            </Pressable>
            <Text style={styles.headerTitle}>
              {t('recipe.title')}
            </Text>
            <View style={styles.headerRightPlaceholder} />
          </View>

          {/* Category Tag */}
          <View style={[styles.categoryTag, { backgroundColor: colors.primary }]}>
            <Text style={styles.categoryTagText}>{t(categoryKey)}</Text>
          </View>
          
          {/* Edit/Delete Buttons - Only for owner */}
          {recipe.user_id === user?.id && (
            <View style={styles.imageActionButtons}>
              <Pressable
                style={[styles.imageActionButton, { backgroundColor: 'rgba(255,255,255,0.95)' }]}
                onPress={handleEdit}
              >
                <Ionicons name="create-outline" size={22} color="#11181C" />
              </Pressable>
              <Pressable
                style={[styles.imageActionButton, { backgroundColor: 'rgba(255,255,255,0.95)' }]}
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={22} color="#E11D48" />
              </Pressable>
            </View>
          )}
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
                name={isFavorite(id) ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorite(id) ? colors.primary : colors.textMuted}
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
        </View>
      </ScrollView>

      {/* Start Cooking Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <Pressable
          style={[styles.startButton, { backgroundColor: colors.primary }]}
          onPress={openCookingMode}
        >
          <Ionicons name="play-circle" size={24} color="#1E293B" />
          <Text style={styles.startButtonText}>{t('recipe.startCooking')}</Text>
        </Pressable>
      </View>

      {/* Cooking Mode Modal */}
      <Modal
        visible={cookingModeVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeCookingMode}
      >
        <View style={[styles.cookingModeContainer, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.cookingModeHeader, { paddingTop: insets.top, backgroundColor: colors.surface }]}>
            <Pressable onPress={closeCookingMode} style={styles.cookingModeCloseButton}>
              <Ionicons name="close" size={28} color={colors.text} />
            </Pressable>
            <Text style={[styles.cookingModeTitle, { color: colors.text }]}>
              {recipe ? getLocalizedField(recipe as unknown as Record<string, unknown>, 'title') : ''}
            </Text>
            <Text style={[styles.stepCounter, { color: colors.primary }]}>
              {language === 'es' ? 'Paso' : 'Step'} {currentStep + 1} {language === 'es' ? 'de' : 'of'} {language === 'es' ? recipe?.steps_es.length : recipe?.steps_en.length}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  backgroundColor: colors.primary,
                  width: recipe
                    ? `${((currentStep + 1) / (language === 'es' ? recipe.steps_es.length : recipe.steps_en.length)) * 100}%`
                    : '0%',
                },
              ]}
            />
          </View>

          {/* Step Content */}
          <Animated.View
            style={[
              styles.stepContent,
              { transform: [{ translateX: slideAnim }] },
            ]}
            {...panResponder.panHandlers}
          >
            <ScrollView
              style={styles.stepScrollView}
              contentContainerStyle={styles.stepScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.stepNumberLarge, { color: colors.primary }]}>
                {currentStep + 1}
              </Text>
              <Text style={[styles.stepTextLarge, { color: colors.text }]}>
                {recipe ? (language === 'es' ? recipe.steps_es[currentStep] : recipe.steps_en[currentStep]) : ''}
              </Text>

              {/* Timer Button */}
              {recipe && (() => {
                const currentStepText = language === 'es' ? recipe.steps_es[currentStep] : recipe.steps_en[currentStep];
                const timeInMinutes = extractTimeFromStep(currentStepText);
                if (timeInMinutes) {
                  const existingTimer = timers.find(t => t.label === currentStepText.slice(0, 30));
                  if (existingTimer) {
                    return (
                      <View style={[styles.activeTimerContainer, { backgroundColor: colors.surface }]}>
                        <Ionicons name="timer" size={24} color={colors.primary} />
                        <Text style={[styles.timerText, { color: colors.text }]}>
                          {formatTime(existingTimer.remaining)}
                        </Text>
                        <Pressable
                          onPress={() => toggleTimer(existingTimer.id)}
                          style={styles.timerButton}
                        >
                          <Ionicons
                            name={existingTimer.isRunning ? 'pause' : 'play'}
                            size={20}
                            color={colors.primary}
                          />
                        </Pressable>
                        <Pressable
                          onPress={() => removeTimer(existingTimer.id)}
                          style={styles.timerButton}
                        >
                          <Ionicons name="close" size={20} color={colors.error} />
                        </Pressable>
                      </View>
                    );
                  }
                  return (
                    <Pressable
                      style={[styles.addTimerButton, { backgroundColor: colors.primary }]}
                      onPress={() => startTimer(timeInMinutes, currentStepText.slice(0, 30))}
                    >
                      <Ionicons name="timer-outline" size={20} color="#1E293B" />
                      <Text style={styles.addTimerButtonText}>
                        {language === 'es' ? 'Iniciar timer de' : 'Start timer for'} {timeInMinutes} {language === 'es' ? 'minutos' : 'minutes'}
                      </Text>
                    </Pressable>
                  );
                }
                return null;
              })()}
            </ScrollView>
          </Animated.View>

          {/* Navigation */}
          <View style={[styles.navigationContainer, { paddingBottom: insets.bottom + Spacing.md }]}>
            <Pressable
              style={[
                styles.navButton,
                { backgroundColor: colors.surface },
                currentStep === 0 && styles.navButtonDisabled,
              ]}
              onPress={goToPreviousStep}
              disabled={currentStep === 0}
            >
              <Ionicons name="chevron-back" size={32} color={currentStep === 0 ? colors.textMuted : colors.text} />
              <Text style={[styles.navButtonText, { color: currentStep === 0 ? colors.textMuted : colors.text }]}>
                {language === 'es' ? 'Anterior' : 'Previous'}
              </Text>
            </Pressable>

            <View style={styles.dotsContainer}>
              {recipe &&
                (language === 'es' ? recipe.steps_es : recipe.steps_en).map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      {
                        backgroundColor:
                          index === currentStep
                            ? colors.primary
                            : index < currentStep
                            ? colors.primary + '80'
                            : colors.border,
                      },
                    ]}
                  />
                ))}
            </View>

            <Pressable
              style={[
                styles.navButton,
                { backgroundColor: colors.surface },
                currentStep === (language === 'es' ? recipe?.steps_es.length : recipe?.steps_en.length) - 1 && styles.navButtonDisabled,
              ]}
              onPress={goToNextStep}
              disabled={currentStep === (language === 'es' ? recipe?.steps_es.length : recipe?.steps_en.length) - 1}
            >
              <Text style={[styles.navButtonText, { color: currentStep === (language === 'es' ? recipe?.steps_es.length : recipe?.steps_en.length) - 1 ? colors.textMuted : colors.text }]}>
                {language === 'es' ? 'Siguiente' : 'Next'}
              </Text>
              <Ionicons name="chevron-forward" size={32} color={currentStep === (language === 'es' ? recipe?.steps_es.length : recipe?.steps_en.length) - 1 ? colors.textMuted : colors.text} />
            </Pressable>
          </View>
        </View>
      </Modal>
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
  headerRightPlaceholder: {
    width: 40,
  },
  imageActionButtons: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  imageActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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

  // Cooking Mode Styles
  cookingModeContainer: {
    flex: 1,
  },
  cookingModeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  cookingModeCloseButton: {
    padding: Spacing.sm,
  },
  cookingModeTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Spacing.md,
  },
  stepCounter: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    minWidth: 80,
    textAlign: 'right',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  progressBar: {
    height: '100%',
  },
  stepContent: {
    flex: 1,
  },
  stepScrollView: {
    flex: 1,
  },
  stepScrollContent: {
    padding: Spacing.xl,
    alignItems: 'center',
    minHeight: '100%',
  },
  stepNumberLarge: {
    fontSize: 120,
    fontWeight: FontWeights.bold,
    opacity: 0.3,
    marginBottom: Spacing.lg,
  },
  stepTextLarge: {
    fontSize: FontSizes.xxl,
    lineHeight: 40,
    textAlign: 'center',
    fontWeight: FontWeights.medium,
    marginBottom: Spacing.xl,
  },
  activeTimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  timerText: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    fontVariant: ['tabular-nums'],
  },
  timerButton: {
    padding: Spacing.sm,
  },
  addTimerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  addTimerButtonText: {
    color: '#1E293B',
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    minWidth: 100,
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
