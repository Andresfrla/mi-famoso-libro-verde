// =====================================================
// Language Toggle Component
// =====================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useColorScheme,
} from 'react-native';
import { useLanguage } from '../contexts';
import { Language } from '../types';
import { Colors, BorderRadius, Spacing, FontSizes, FontWeights } from '../lib/constants';

interface LanguageToggleProps {
  size?: 'small' | 'medium';
}

export function LanguageToggle({ size = 'medium' }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const isSmall = size === 'small';
  const containerHeight = isSmall ? 32 : 36;
  const containerWidth = isSmall ? 80 : 96;

  const handlePress = async (lng: Language) => {
    if (lng !== language) {
      await setLanguage(lng);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          height: containerHeight,
          width: containerWidth,
          backgroundColor: `${colors.primary}10`,
        },
      ]}
    >
      <Pressable
        style={[
          styles.option,
          language === 'es' && [styles.optionSelected, { backgroundColor: colors.surface }],
        ]}
        onPress={() => handlePress('es')}
      >
        <Text
          style={[
            styles.optionText,
            { fontSize: isSmall ? FontSizes.xs : FontSizes.sm },
            {
              color: language === 'es' ? colors.primary : colors.textMuted,
              fontWeight: language === 'es' ? FontWeights.bold : FontWeights.medium,
            },
          ]}
        >
          ES
        </Text>
      </Pressable>
      <Pressable
        style={[
          styles.option,
          language === 'en' && [styles.optionSelected, { backgroundColor: colors.surface }],
        ]}
        onPress={() => handlePress('en')}
      >
        <Text
          style={[
            styles.optionText,
            { fontSize: isSmall ? FontSizes.xs : FontSizes.sm },
            {
              color: language === 'en' ? colors.primary : colors.textMuted,
              fontWeight: language === 'en' ? FontWeights.bold : FontWeights.medium,
            },
          ]}
        >
          EN
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    padding: 4,
  },
  option: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  optionSelected: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionText: {
    textTransform: 'uppercase',
  },
});
