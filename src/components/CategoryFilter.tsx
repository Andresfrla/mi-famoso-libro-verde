// =====================================================
// Category Filter Pills Component
// =====================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Category } from '../types';
import { CATEGORIES, Colors, Spacing, FontSizes, FontWeights } from '../lib/constants';

interface CategoryFilterProps {
  selected: Category;
  onSelect: (category: Category) => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={styles.wrapper}>
        <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
        decelerationRate="fast"
        snapToInterval={PILL_HEIGHT + Spacing.sm}
      >
        {CATEGORIES.map((category) => {
          const isSelected = selected === category.value;

          return (
            <Pressable
              key={category.value}
              style={[
                styles.pill,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
              onPress={() => onSelect(category.value)}
            >
              <Text
                style={[
                  styles.pillText,
                  {
                    color: isSelected ? '#1E293B' : colors.textSecondary,
                    fontWeight: isSelected ? FontWeights.bold : FontWeights.medium,
                  },
                ]}
              >
                {t(category.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const PILL_HEIGHT = 36;
const WRAPPER_HEIGHT = PILL_HEIGHT + Spacing.md * 2;

const styles = StyleSheet.create({
  wrapper: {
    height: WRAPPER_HEIGHT,
  },
  container: {
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  pill: {
    height: PILL_HEIGHT,
    paddingHorizontal: Spacing.lg,
    borderRadius: PILL_HEIGHT / 2,
    marginRight: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  pillText: {
    fontSize: FontSizes.sm,
    lineHeight: FontSizes.sm + 2,
  },
});
