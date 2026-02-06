// =====================================================
// Recipe Card Component
// =====================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
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
  showFavoriteCount?: boolean;
}

export function RecipeCard({
  recipe,
  isFavorite,
  onPress,
  onFavoritePress,
  showFavoriteCount = false,
}: RecipeCardProps) {
  const { t } = useTranslation();
  const { getLocalizedField } = useLanguage();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const title = getLocalizedField(recipe as unknown as Record<string, unknown>, 'title');
  const firstTag = recipe.tags[0] || '';

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.pressableArea,
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
            {/* Favorite count badge */}
            {showFavoriteCount && (
              <View style={styles.favoriteCountContainer}>
                <Ionicons name="heart" size={12} color="#fff" />
                <Text style={styles.favoriteCountText}>
                  {recipe.favorites_count || 0}
                </Text>
              </View>
            )}
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

      {/* Heart button outside Pressable to handle touch independently */}
      <TouchableOpacity
        style={[
          styles.favoriteButton,
          { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
        ]}
        onPress={onFavoritePress}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={18}
          color={isFavorite ? colors.primary : colors.textMuted}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: Spacing.md,
    position: 'relative',
  },
  pressableArea: {
    flex: 1,
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
    ...StyleSheet.absoluteFillObject,
    borderRadius: BorderRadius.xl,
  },
  imageStyle: {
    borderRadius: BorderRadius.xl,
  },
  favoriteButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
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
  favoriteCountContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  favoriteCountText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    color: '#fff',
  },
});
