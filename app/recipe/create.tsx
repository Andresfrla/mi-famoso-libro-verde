// =====================================================
// Create Recipe Screen
// =====================================================

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Pressable,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { createRecipe } from '@/src/services';
import { useAuth, useLanguage } from '@/src/contexts';
import { RecipeFormData, Language, Difficulty, Category } from '@/src/types';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius, CATEGORIES, DIFFICULTIES, DEFAULTS } from '@/src/lib/constants';

type EditingLanguage = 'es' | 'en';

export default function CreateRecipeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { user } = useAuth();
  const { language } = useLanguage();

  const [editingLang, setEditingLang] = useState<EditingLanguage>(language);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<RecipeFormData>({
    title_es: '',
    title_en: '',
    description_es: '',
    description_en: '',
    ingredients_es: [''],
    ingredients_en: [''],
    steps_es: [''],
    steps_en: [''],
    image_url: '',
    tags: [],
    prep_time_minutes: DEFAULTS.PREP_TIME,
    servings: DEFAULTS.SERVINGS,
    difficulty: DEFAULTS.DIFFICULTY,
    category: DEFAULTS.CATEGORY,
  });

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const updateField = useCallback(
    <K extends keyof RecipeFormData>(key: K, value: RecipeFormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const addIngredient = useCallback(() => {
    const key = editingLang === 'es' ? 'ingredients_es' : 'ingredients_en';
    setFormData((prev) => ({
      ...prev,
      [key]: [...prev[key], ''],
    }));
  }, [editingLang]);

  const updateIngredient = useCallback(
    (index: number, value: string) => {
      const key = editingLang === 'es' ? 'ingredients_es' : 'ingredients_en';
      setFormData((prev) => ({
        ...prev,
        [key]: prev[key].map((item, i) => (i === index ? value : item)),
      }));
    },
    [editingLang]
  );

  const removeIngredient = useCallback(
    (index: number) => {
      const key = editingLang === 'es' ? 'ingredients_es' : 'ingredients_en';
      setFormData((prev) => ({
        ...prev,
        [key]: prev[key].filter((_, i) => i !== index),
      }));
    },
    [editingLang]
  );

  const addStep = useCallback(() => {
    const key = editingLang === 'es' ? 'steps_es' : 'steps_en';
    setFormData((prev) => ({
      ...prev,
      [key]: [...prev[key], ''],
    }));
  }, [editingLang]);

  const updateStep = useCallback(
    (index: number, value: string) => {
      const key = editingLang === 'es' ? 'steps_es' : 'steps_en';
      setFormData((prev) => ({
        ...prev,
        [key]: prev[key].map((item, i) => (i === index ? value : item)),
      }));
    },
    [editingLang]
  );

  const removeStep = useCallback(
    (index: number) => {
      const key = editingLang === 'es' ? 'steps_es' : 'steps_en';
      setFormData((prev) => ({
        ...prev,
        [key]: prev[key].filter((_, i) => i !== index),
      }));
    },
    [editingLang]
  );

  const validate = useCallback((): boolean => {
    if (!formData.title_es.trim() || !formData.title_en.trim()) {
      Alert.alert(t('common.error'), t('recipeForm.validation.titleRequired'));
      return false;
    }

    const hasIngredients =
      formData.ingredients_es.some((i) => i.trim()) ||
      formData.ingredients_en.some((i) => i.trim());

    if (!hasIngredients) {
      Alert.alert(t('common.error'), t('recipeForm.validation.ingredientRequired'));
      return false;
    }

    const hasSteps =
      formData.steps_es.some((s) => s.trim()) ||
      formData.steps_en.some((s) => s.trim());

    if (!hasSteps) {
      Alert.alert(t('common.error'), t('recipeForm.validation.stepRequired'));
      return false;
    }

    return true;
  }, [formData, t]);

  const handleSave = useCallback(async () => {
    if (!validate()) return;

    setSaving(true);

    // Clean up empty ingredients and steps
    const cleanedData: RecipeFormData = {
      ...formData,
      ingredients_es: formData.ingredients_es.filter((i) => i.trim()),
      ingredients_en: formData.ingredients_en.filter((i) => i.trim()),
      steps_es: formData.steps_es.filter((s) => s.trim()),
      steps_en: formData.steps_en.filter((s) => s.trim()),
    };

    const { data, error } = await createRecipe(cleanedData, user?.id);

    setSaving(false);

    if (error) {
      Alert.alert(t('common.error'), t('recipeForm.saveError'));
      return;
    }

    Alert.alert(t('common.confirm'), t('recipeForm.saveSuccess'), [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }, [formData, user?.id, validate, t, router]);

  const currentTitle = editingLang === 'es' ? formData.title_es : formData.title_en;
  const currentDescription = editingLang === 'es' ? formData.description_es : formData.description_en;
  const currentIngredients = editingLang === 'es' ? formData.ingredients_es : formData.ingredients_en;
  const currentSteps = editingLang === 'es' ? formData.steps_es : formData.steps_en;

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top, borderBottomColor: colors.border }]}>
          <Pressable onPress={handleClose} style={styles.headerButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('recipeForm.newRecipe')}
          </Text>
          <Pressable onPress={() => {}} style={styles.headerButton}>
            <Text style={[styles.draftText, { color: colors.primary }]}>
              {t('recipeForm.draft')}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Image Picker Placeholder */}
          <Pressable style={[styles.imagePicker, { backgroundColor: colors.surfaceSecondary }]}>
            <Ionicons name="camera-outline" size={32} color={colors.textMuted} />
            <Text style={[styles.imagePickerText, { color: colors.textMuted }]}>
              {t('recipeForm.changePhoto')}
            </Text>
          </Pressable>

          {/* Language Toggle */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>
              {t('recipeForm.editingLanguage')}
            </Text>
            <View style={[styles.langToggle, { backgroundColor: colors.surfaceSecondary }]}>
              <Pressable
                style={[
                  styles.langOption,
                  editingLang === 'es' && [styles.langOptionActive, { backgroundColor: colors.surface }],
                ]}
                onPress={() => setEditingLang('es')}
              >
                <Text
                  style={[
                    styles.langOptionText,
                    { color: editingLang === 'es' ? colors.text : colors.textMuted },
                  ]}
                >
                  Spanish (ES)
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.langOption,
                  editingLang === 'en' && [styles.langOptionActive, { backgroundColor: colors.surface }],
                ]}
                onPress={() => setEditingLang('en')}
              >
                <Text
                  style={[
                    styles.langOptionText,
                    { color: editingLang === 'en' ? colors.text : colors.textMuted },
                  ]}
                >
                  English (EN)
                </Text>
              </Pressable>
            </View>
          </View>

          {/* General Information */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('recipeForm.generalInfo')}
          </Text>

          {/* Title */}
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              {t('recipeForm.titleLabel')} ({editingLang.toUpperCase()})
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              placeholder={t('recipeForm.titlePlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={currentTitle}
              onChangeText={(v) => updateField(editingLang === 'es' ? 'title_es' : 'title_en', v)}
            />
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              {t('recipeForm.descriptionLabel')} ({editingLang.toUpperCase()})
            </Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              placeholder={t('recipeForm.descriptionPlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={currentDescription}
              onChangeText={(v) => updateField(editingLang === 'es' ? 'description_es' : 'description_en', v)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Prep Time and Servings */}
          <View style={styles.row}>
            <View style={[styles.field, styles.halfField]}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                {t('recipeForm.prepTimeLabel')}
              </Text>
              <View style={[styles.inputWithIcon, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="time-outline" size={20} color={colors.primary} />
                <TextInput
                  style={[styles.inputSmall, { color: colors.text }]}
                  value={String(formData.prep_time_minutes)}
                  onChangeText={(v) => updateField('prep_time_minutes', parseInt(v) || 0)}
                  keyboardType="number-pad"
                />
              </View>
            </View>
            <View style={[styles.field, styles.halfField]}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                {t('recipeForm.servingsLabel')}
              </Text>
              <View style={[styles.inputWithIcon, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="people-outline" size={20} color={colors.primary} />
                <TextInput
                  style={[styles.inputSmall, { color: colors.text }]}
                  value={String(formData.servings)}
                  onChangeText={(v) => updateField('servings', parseInt(v) || 1)}
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </View>

          {/* Save Button */}
          <Pressable
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
            disabled={saving}
          >
            <Ionicons name="bookmark" size={20} color="#1E293B" />
            <Text style={styles.saveButtonText}>
              {saving ? t('common.loading') : t('recipeForm.saveRecipe')}
            </Text>
          </Pressable>

          {/* Ingredients */}
          <View style={styles.listSection}>
            <View style={styles.listHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('recipeForm.ingredientsSection')}
              </Text>
            </View>

            {currentIngredients.map((ingredient, index) => (
              <View key={index} style={[styles.listItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="reorder-three" size={20} color={colors.textMuted} />
                <TextInput
                  style={[styles.listInput, { color: colors.text }]}
                  placeholder={t('recipeForm.ingredientPlaceholder')}
                  placeholderTextColor={colors.textMuted}
                  value={ingredient}
                  onChangeText={(v) => updateIngredient(index, v)}
                />
                <Pressable onPress={() => removeIngredient(index)}>
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </Pressable>
              </View>
            ))}

            <Pressable style={styles.addButton} onPress={addIngredient}>
              <Ionicons name="add-circle" size={24} color={colors.primary} />
              <Text style={[styles.addButtonText, { color: colors.primary }]}>
                {t('recipeForm.addIngredient')}
              </Text>
            </Pressable>
          </View>

          {/* Steps */}
          <View style={styles.listSection}>
            <View style={styles.listHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('recipeForm.stepsSection')}
              </Text>
              <Pressable style={styles.addStepButton} onPress={addStep}>
                <Ionicons name="add-circle" size={20} color={colors.primary} />
                <Text style={[styles.addStepText, { color: colors.primary }]}>
                  {t('recipeForm.step')}
                </Text>
              </Pressable>
            </View>

            {currentSteps.map((step, index) => (
              <View key={index} style={[styles.stepItem, { backgroundColor: colors.surface }]}>
                <View style={styles.stepHeader}>
                  <View style={[styles.stepBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.stepBadgeText}>
                      {t('recipeForm.step')} {index + 1}
                    </Text>
                  </View>
                  <Pressable onPress={() => removeStep(index)}>
                    <Ionicons name="close" size={20} color={colors.textMuted} />
                  </Pressable>
                </View>
                <TextInput
                  style={[styles.stepInput, { color: colors.text }]}
                  placeholder={t('recipeForm.stepPlaceholder')}
                  placeholderTextColor={colors.textMuted}
                  value={step}
                  onChangeText={(v) => updateStep(index, v)}
                  multiline
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
  draftText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 120,
  },
  imagePicker: {
    height: 180,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  imagePickerText: {
    marginTop: Spacing.sm,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    marginBottom: Spacing.md,
  },
  langToggle: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    padding: 4,
  },
  langOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  langOptionActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  langOptionText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
  },
  field: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    marginBottom: Spacing.xs,
  },
  input: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.lg,
  },
  textArea: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.lg,
    minHeight: 100,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfField: {
    flex: 1,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  inputSmall: {
    flex: 1,
    fontSize: FontSizes.lg,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    marginVertical: Spacing.lg,
  },
  saveButtonText: {
    color: '#1E293B',
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
  listSection: {
    marginBottom: Spacing.lg,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  listInput: {
    flex: 1,
    fontSize: FontSizes.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  addButtonText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  addStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  addStepText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  stepItem: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  stepBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  stepBadgeText: {
    color: '#1E293B',
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
  stepInput: {
    fontSize: FontSizes.md,
    lineHeight: 22,
  },
});
