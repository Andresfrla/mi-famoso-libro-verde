// =====================================================
// Recipe Card Skeleton Component with Vertical Shimmer
// =====================================================

import React, { useEffect } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { BorderRadius, Spacing, FontSizes } from '../lib/constants';

interface RecipeCardSkeletonProps {
  style?: any;
}

export function RecipeCardSkeleton({ style }: RecipeCardSkeletonProps) {
  const colorScheme = useColorScheme();
  const shimmerPosition = useSharedValue(0);

  useEffect(() => {
    shimmerPosition.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{
      translateY: interpolate(shimmerPosition.value, [0, 1], [-200, 200]),
    }],
  }));

  const baseColor = colorScheme === 'dark' ? '#1E3A1E' : '#F1F5F1';
  const shimmerColor = colorScheme === 'dark' ? '#2D4A2D' : '#E8F5E9';

  return (
    <View style={[styles.container, style]}>
      {/* Image skeleton */}
      <View style={[styles.imageContainer, { backgroundColor: baseColor }]}>
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: shimmerColor, opacity: 0.5 },
            shimmerStyle,
          ]}
        />
      </View>

      {/* Content skeleton */}
      <View style={styles.content}>
        {/* Title skeleton */}
        <View style={[styles.titleSkeleton, { backgroundColor: baseColor }]}>
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: shimmerColor, opacity: 0.5 },
              shimmerStyle,
            ]}
          />
        </View>
        
        {/* Tags skeleton */}
        <View style={styles.tagsContainer}>
          <View style={[styles.tagSkeleton, { backgroundColor: baseColor }]}>
            <Animated.View
              style={[
                StyleSheet.absoluteFillObject,
                { backgroundColor: shimmerColor, opacity: 0.5 },
                shimmerStyle,
              ]}
            />
          </View>
          <View style={[styles.tagSkeleton, { backgroundColor: baseColor }]}>
            <Animated.View
              style={[
                StyleSheet.absoluteFillObject,
                { backgroundColor: shimmerColor, opacity: 0.5 },
                shimmerStyle,
              ]}
            />
          </View>
        </View>
      </View>

      {/* Favorite button skeleton */}
      <View style={[styles.favoriteButtonSkeleton, { backgroundColor: baseColor }]}>
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: shimmerColor, opacity: 0.5 },
            shimmerStyle,
          ]}
        />
      </View>
    </View>
  );
}

// Grid of skeleton cards
export function RecipeCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.gridItem}>
          <RecipeCardSkeleton />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: Spacing.md,
    position: 'relative',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  gridItem: {
    width: '47%',
  },
  imageContainer: {
    aspectRatio: 1,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  content: {
    paddingHorizontal: Spacing.xs,
    paddingTop: Spacing.sm,
  },
  titleSkeleton: {
    height: FontSizes.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
    overflow: 'hidden',
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  tagSkeleton: {
    width: 60,
    height: 18,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  favoriteButtonSkeleton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
});
