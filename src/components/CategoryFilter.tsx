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
import { CATEGORIES, Colors, BorderRadius, Spacing, FontSizes, FontWeights } from '../lib/constants';

interface CategoryFilterProps {
  selected: Category;
  onSelect: (category: Category) => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map((category) => {
        const isSelected = selected === category.value;
        return (
          <Pressable
            key={category.value}
            style={[
              styles.pill,
              isSelected
                ? { backgroundColor: colors.primary }
                : {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1,
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
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  pillText: {
    fontSize: FontSizes.sm,
  },
});
