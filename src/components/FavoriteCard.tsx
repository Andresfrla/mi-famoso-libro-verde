// =====================================================
// Favorite Card Component (Horizontal Layout) with Skeleton
// =====================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
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

interface FavoriteCardProps {
  recipe: Recipe;
  onPress: () => void;
  onRemove?: () => void;
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

export function FavoriteCard({ recipe, onPress, onRemove }: FavoriteCardProps) {
  const { t } = useTranslation();
  const { getLocalizedField } = useLanguage();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const title = getLocalizedField(recipe as unknown as Record<string, unknown>, 'title');
  const difficultyKey = `difficulty.${recipe.difficulty}`;
  const hasImage = recipe.image_url && recipe.image_url.trim() !== '';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: colors.surface },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.metaContainer}>
          <Ionicons name="time-outline" size={14} color={colors.primary} />
          <Text style={[styles.metaText, { color: colors.primary }]}>
            {recipe.prep_time_minutes} {t('recipe.minutes')}
          </Text>
          <Text style={[styles.metaDot, { color: colors.textMuted }]}>•</Text>
          <Text style={[styles.metaText, { color: colors.primary }]}>
            {t(difficultyKey)}
          </Text>
        </View>
        <View style={[styles.savedBadge, { backgroundColor: `${colors.primary}15` }]}>
          <Ionicons name="heart" size={12} color={colors.primary} />
          <Text style={[styles.savedText, { color: colors.primary }]}>
            {t('favorites.saved')}
          </Text>
        </View>
      </View>
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
            <ShimmerOverlay isVisible={isLoading} borderRadius={BorderRadius.lg} />
          </>
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons name="image-outline" size={24} color={colors.textMuted} />
            <Text style={[styles.placeholderText, { color: colors.textMuted }]}>
              {t('common.imageNotAvailable')}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  content: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    marginBottom: Spacing.xs,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  metaText: {
    fontSize: FontSizes.sm,
    marginLeft: Spacing.xs,
  },
  metaDot: {
    marginHorizontal: Spacing.xs,
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  savedText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.lg,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  placeholderText: {
    fontSize: FontSizes.xs,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
});
