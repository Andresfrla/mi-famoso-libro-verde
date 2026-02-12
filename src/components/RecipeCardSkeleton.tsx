// =====================================================
// Recipe Card Skeleton Component (sin animaciones)
// =====================================================

import React from 'react';
import { View, StyleSheet, useColorScheme, ActivityIndicator } from 'react-native';
import { BorderRadius, Spacing, FontSizes } from '../lib/constants';

interface RecipeCardSkeletonProps {
  style?: any;
}

export function RecipeCardSkeleton({ style }: RecipeCardSkeletonProps) {
  const colorScheme = useColorScheme();
  const baseColor = colorScheme === 'dark' ? '#1E3A1E' : '#F1F5F1';

  return (
    <View style={[styles.container, style]}>
      {/* Image skeleton */}
      <View style={[styles.imageContainer, { backgroundColor: baseColor }]}>
        <ActivityIndicator color="#22C55E" />
      </View>

      {/* Content skeleton */}
      <View style={styles.content}>
        {/* Title skeleton */}
        <View style={[styles.titleSkeleton, { backgroundColor: baseColor }]} />
        
        {/* Tags skeleton */}
        <View style={styles.tagsContainer}>
          <View style={[styles.tagSkeleton, { backgroundColor: baseColor }]} />
          <View style={[styles.tagSkeleton, { backgroundColor: baseColor }]} />
        </View>
      </View>

      {/* Favorite button skeleton */}
      <View style={[styles.favoriteButtonSkeleton, { backgroundColor: baseColor }]} />
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: Spacing.xs,
    paddingTop: Spacing.sm,
  },
  titleSkeleton: {
    height: FontSizes.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
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
  },
  favoriteButtonSkeleton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});
