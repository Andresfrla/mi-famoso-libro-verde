// =====================================================
// Skeleton Image Component (sin animaciones)
// =====================================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
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
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
      
      {/* Simple loading indicator */}
      {isLoading && (
        <View style={[styles.loadingContainer, { borderRadius, backgroundColor: colors.surfaceSecondary }]}>
          <ActivityIndicator color={colors.primary} />
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

  return (
    <View
      style={[
        styles.skeletonContainer,
        style,
        { backgroundColor: colors.surfaceSecondary, borderRadius },
      ]}
    >
      <ActivityIndicator color={colors.primary} />
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
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonContainer: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
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
