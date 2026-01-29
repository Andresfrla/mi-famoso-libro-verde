// =====================================================
// Recipe Card Component
// =====================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  useColorScheme,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Recipe } from '../types';
import { useLanguage } from '../contexts';
import { Colors, BorderRadius, Spacing, FontSizes, FontWeights } from '../lib/constants';

interface RecipeCardProps {
  recipe: Recipe;
  isFavorite: boolean;
  onPress: () => void;
  onFavoritePress: () => void;
}

export function RecipeCard({
  recipe,
  isFavorite,
  onPress,
  onFavoritePress,
}: RecipeCardProps) {
  const { t } = useTranslation();
  const { getLocalizedField } = useLanguage();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const title = getLocalizedField(recipe as unknown as Record<string, unknown>, 'title');
  const firstTag = recipe.tags[0] || '';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <ImageBackground
          source={{ uri: recipe.image_url || 'https://via.placeholder.com/300x300?text=Recipe' }}
          style={styles.image}
          imageStyle={styles.imageStyle}
        >
          <Pressable
            style={[
              styles.favoriteButton,
              { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onFavoritePress();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite ? colors.primary : colors.textMuted}
            />
          </Pressable>
        </ImageBackground>
      </View>

      <View style={styles.content}>
        <Text
          style={[styles.title, { color: colors.text }]}
          numberOfLines={2}
        >
          {title}
        </Text>
        <View style={styles.tagsContainer}>
          <View style={[styles.tag, { backgroundColor: `${colors.primary}15` }]}>
            <Text style={[styles.tagText, { color: colors.primary }]}>
              {recipe.prep_time_minutes} {t('recipe.minutes')}
            </Text>
          </View>
          {firstTag && (
            <View style={[styles.tag, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.tagText, { color: colors.textSecondary }]}>
                {firstTag}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: Spacing.md,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  imageContainer: {
    aspectRatio: 1,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  imageStyle: {
    borderRadius: BorderRadius.xl,
  },
  favoriteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    margin: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    paddingHorizontal: Spacing.xs,
    paddingTop: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  tagText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
