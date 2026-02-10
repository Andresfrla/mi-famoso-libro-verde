// =====================================================
// Recipe Card Component with Skeleton Loading
// =====================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
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

// Shimmer component for loading state
function ShimmerOverlay({ isVisible, borderRadius }: { isVisible: boolean; borderRadius: number }) {
  const shimmerPosition = useSharedValue(0);
  const colorScheme = useColorScheme();
  
  React.useEffect(() => {
    if (isVisible) {
      shimmerPosition.value = withRepeat(
        withTiming(1, { duration: 1500 }),
        -1,
        false
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{
      translateY: interpolate(shimmerPosition.value, [0, 1], [-200, 200]),
    }],
  }));

  if (!isVisible) return null;

  return (
    <View style={[StyleSheet.absoluteFillObject, { borderRadius, overflow: 'hidden' }]}>
      <Animated.View
        style={[
          {
            width: '100%',
            height: '100%',
            backgroundColor: colorScheme === 'dark' ? '#2D4A2D' : '#E8F5E9',
            opacity: 0.5,
          },
          shimmerStyle,
        ]}
      />
    </View>
  );
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
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const title = getLocalizedField(recipe as unknown as Record<string, unknown>, 'title');
  const firstTag = recipe.tags[0] || '';
  const hasImage = recipe.image_url && recipe.image_url.trim() !== '';

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.pressableArea,
          pressed && styles.pressed,
        ]}
        onPress={onPress}
      >
        <View style={[styles.imageContainer, { backgroundColor: colors.surfaceSecondary }]}>
          {hasImage && !hasError ? (
            <>
              <Image
                source={{ uri: recipe.image_url || undefined }}
                style={styles.image}
                contentFit="cover"
                transition={500}
                onLoadStart={() => setIsLoading(true)}
                onLoadEnd={() => setIsLoading(false)}
                onError={() => {
                  setHasError(true);
                  setIsLoading(false);
                }}
                cachePolicy="memory-disk"
              />
              
              {/* Shimmer overlay while loading */}
              <ShimmerOverlay isVisible={isLoading} borderRadius={BorderRadius.xl} />
            </>
          ) : (
            <View style={styles.placeholderContainer}>
              <Ionicons name="image-outline" size={32} color={colors.textMuted} />
              <Text style={[styles.placeholderText, { color: colors.textMuted }]}>
                {t('common.imageNotAvailable')}
              </Text>
            </View>
          )}

          {/* Favorite count badge */}
          {showFavoriteCount && (
            <View style={styles.favoriteCountContainer}>
              <Ionicons name="heart" size={12} color="#fff" />
              <Text style={styles.favoriteCountText}>
                {recipe.favorites_count || 0}
              </Text>
            </View>
          )}
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
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  placeholderText: {
    fontSize: FontSizes.xs,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
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
