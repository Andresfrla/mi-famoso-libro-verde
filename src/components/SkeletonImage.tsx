// =====================================================
// Skeleton Image Component with Vertical Shimmer Effect
// =====================================================

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Image, ImageSource } from 'expo-image';
import { Colors, BorderRadius, FontSizes } from '../lib/constants';

interface SkeletonImageProps {
  source: ImageSource;
  style?: any;
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  transition?: number;
  borderRadius?: number;
}

export function SkeletonImage({
  source,
  style,
  contentFit = 'cover',
  transition = 500,
  borderRadius = BorderRadius.xl,
}: SkeletonImageProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const shimmerPosition = useSharedValue(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    shimmerPosition.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            shimmerPosition.value,
            [0, 1],
            [-200, 200]
          ),
        },
      ],
    };
  });

  // Verificar si hay una URL válida de imagen
  const hasValidSource = source && 
    ((typeof source === 'object' && 'uri' in source && source.uri) || 
     (typeof source === 'number'));

  if (!hasValidSource || hasError) {
    return (
      <View style={[styles.container, style, { borderRadius, backgroundColor: colors.surfaceSecondary }]}>
        <View style={styles.placeholderContainer}>
          <Text style={[styles.placeholderText, { color: colors.textMuted }]}>
            {t('common.imageNotAvailable')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style, { borderRadius }]}>
      <Image
        source={source}
        style={[styles.image, { borderRadius }]}
        contentFit={contentFit}
        transition={transition}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        cachePolicy="memory-disk"
      />
      
      {/* Shimmer overlay - shows while loading */}
      {isLoading && (
        <View style={[styles.shimmerContainer, { borderRadius }]}>
          <Animated.View
            style={[
              styles.shimmer,
              { backgroundColor: colors.surfaceSecondary },
              shimmerStyle,
            ]}
          />
        </View>
      )}
    </View>
  );
}

// Simple skeleton placeholder component for lists/grids
export function ImageSkeletonPlaceholder({
  style,
  borderRadius = BorderRadius.xl,
}: {
  style?: any;
  borderRadius?: number;
}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const shimmerPosition = useSharedValue(0);

  useEffect(() => {
    shimmerPosition.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            shimmerPosition.value,
            [0, 1],
            [-200, 200]
          ),
        },
      ],
    };
  });

  return (
    <View
      style={[
        styles.skeletonContainer,
        style,
        { backgroundColor: colors.surfaceSecondary, borderRadius },
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            backgroundColor: colorScheme === 'dark' ? '#2D4A2D' : '#E8F5E9',
          },
          shimmerStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  shimmerContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  skeletonContainer: {
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
    opacity: 0.5,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  placeholderText: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
    fontWeight: '500',
  },
});
