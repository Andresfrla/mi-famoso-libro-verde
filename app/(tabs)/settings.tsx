// =====================================================
// Settings Screen
// =====================================================

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { SettingsItem } from '@/src/components';
import { useAuth, useLanguage, useMeasurementSystem } from '@/src/contexts';
import { Language, MeasurementSystem } from '@/src/types';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/src/lib/constants';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { user, signOut, isConfigured } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { measurementSystem, setMeasurementSystem } = useMeasurementSystem();

  const handleLanguageSelect = useCallback(
    async (lng: Language) => {
      await setLanguage(lng);
    },
    [setLanguage]
  );

  const handleMeasurementSelect = useCallback(
    async (system: MeasurementSystem) => {
      await setMeasurementSystem(system);
    },
    [setMeasurementSystem]
  );

  const handleLogout = useCallback(() => {
    Alert.alert(
      t('settings.logout'),
      t('settings.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.logout'),
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  }, [t, signOut]);

  const handleLogin = useCallback(() => {
    router.push('/auth');
  }, [router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('settings.title')}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('settings.account')}
        </Text>
        <View style={styles.section}>
          <SettingsItem
            icon="person-outline"
            label={t('settings.profileSettings')}
            onPress={() => {
              if (!user && isConfigured) {
                handleLogin();
              }
            }}
          />
        </View>

        {/* Language Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('settings.languageSelection')}
        </Text>
        <View style={styles.section}>
          <Pressable
            style={[
              styles.languageOption,
              { backgroundColor: colors.surface },
              language === 'en' && { borderColor: colors.primary, borderWidth: 2 },
            ]}
            onPress={() => handleLanguageSelect('en')}
          >
            <Text style={[styles.languageText, { color: colors.text }]}>
              English
            </Text>
            {language === 'en' && (
              <View style={[styles.radioSelected, { borderColor: colors.primary }]}>
                <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
              </View>
            )}
            {language !== 'en' && (
              <View style={[styles.radioUnselected, { borderColor: colors.border }]} />
            )}
          </Pressable>
          <Pressable
            style={[
              styles.languageOption,
              { backgroundColor: colors.surface },
              language === 'es' && { borderColor: colors.primary, borderWidth: 2 },
            ]}
            onPress={() => handleLanguageSelect('es')}
          >
            <Text style={[styles.languageText, { color: colors.text }]}>
              Spanish (Español)
            </Text>
            {language === 'es' && (
              <View style={[styles.radioSelected, { borderColor: colors.primary }]}>
                <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
              </View>
            )}
            {language !== 'es' && (
              <View style={[styles.radioUnselected, { borderColor: colors.border }]} />
            )}
          </Pressable>
        </View>

        {/* Measurement Units Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('settings.measurementUnits')}
        </Text>
        <View style={styles.section}>
          <Pressable
            style={[
              styles.languageOption,
              { backgroundColor: colors.surface },
              measurementSystem === 'metric' && { borderColor: colors.primary, borderWidth: 2 },
            ]}
            onPress={() => handleMeasurementSelect('metric')}
          >
            <Text style={[styles.languageText, { color: colors.text }]}>
              {t('settings.metric')}
            </Text>
            {measurementSystem === 'metric' ? (
              <View style={[styles.radioSelected, { borderColor: colors.primary }]}>
                <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
              </View>
            ) : (
              <View style={[styles.radioUnselected, { borderColor: colors.border }]} />
            )}
          </Pressable>
          <Pressable
            style={[
              styles.languageOption,
              { backgroundColor: colors.surface },
              measurementSystem === 'imperial' && { borderColor: colors.primary, borderWidth: 2 },
            ]}
            onPress={() => handleMeasurementSelect('imperial')}
          >
            <Text style={[styles.languageText, { color: colors.text }]}>
              {t('settings.imperial')}
            </Text>
            {measurementSystem === 'imperial' ? (
              <View style={[styles.radioSelected, { borderColor: colors.primary }]}>
                <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
              </View>
            ) : (
              <View style={[styles.radioUnselected, { borderColor: colors.border }]} />
            )}
          </Pressable>
        </View>

        {/* About Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('settings.about')}
        </Text>
        <View style={styles.section}>
          <SettingsItem
            icon="information-circle-outline"
            label={t('settings.aboutApp')}
            onPress={() => {}}
          />
          <SettingsItem
            icon="document-text-outline"
            label={t('settings.privacyPolicy')}
            onPress={() => {}}
          />
        </View>

        {/* Logout */}
        {user ? (
          <Pressable
            style={[styles.logoutButton, { borderColor: colors.error }]}
            onPress={handleLogout}
          >
            <Text style={[styles.logoutText, { color: colors.error }]}>
              {t('settings.logout')}
            </Text>
          </Pressable>
        ) : (
          isConfigured && (
            <Pressable
              style={[styles.loginButton, { backgroundColor: colors.primary }]}
              onPress={handleLogin}
            >
              <Text style={styles.loginText}>{t('auth.login')}</Text>
            </Pressable>
          )
        )}

        {/* Version */}
        <Text style={[styles.version, { color: colors.textMuted }]}>
          {t('settings.version')} 2.4.1 (102)
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    textAlign: 'center',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  section: {
    marginBottom: Spacing.sm,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  languageText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.medium,
  },
  radioSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  radioUnselected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  logoutButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  logoutText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
  },
  loginButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  loginText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: '#1E293B',
  },
  version: {
    textAlign: 'center',
    fontSize: FontSizes.sm,
    marginTop: Spacing.lg,
  },
});
