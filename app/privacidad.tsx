// =====================================================
// Privacy Policy Screen
// =====================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/src/lib/constants';

export default function PrivacyPolicyScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const PolicySection = ({ icon, title, text }: { icon: string; title: string; text: string }) => (
    <View style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon as any} size={24} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {title}
        </Text>
      </View>
      <Text style={[styles.sectionText, { color: colors.text }]}>
        {text}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: t('settings.privacyPolicy') }} />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Fecha de actualización */}
        <Text style={[styles.lastUpdated, { color: colors.textMuted }]}>
          {t('privacy.lastUpdated')}: 2025
        </Text>

        {/* Introducción */}
        <PolicySection
          icon="shield-checkmark-outline"
          title={t('privacy.introTitle')}
          text={t('privacy.introText')}
        />

        {/* Información recopilada */}
        <PolicySection
          icon="document-text-outline"
          title={t('privacy.infoTitle')}
          text={t('privacy.infoText')}
        />

        {/* Uso de la información */}
        <PolicySection
          icon="cog-outline"
          title={t('privacy.useTitle')}
          text={t('privacy.useText')}
        />

        {/* Compartir información */}
        <PolicySection
          icon="share-outline"
          title={t('privacy.shareTitle')}
          text={t('privacy.shareText')}
        />

        {/* Seguridad */}
        <PolicySection
          icon="lock-closed-outline"
          title={t('privacy.securityTitle')}
          text={t('privacy.securityText')}
        />

        {/* Derechos */}
        <PolicySection
          icon="person-outline"
          title={t('privacy.rightsTitle')}
          text={t('privacy.rightsText')}
        />

        {/* Contacto */}
        <PolicySection
          icon="mail-outline"
          title={t('privacy.contactTitle')}
          text={t('privacy.contactText')}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: 120,
  },
  lastUpdated: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  sectionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    marginLeft: Spacing.sm,
  },
  sectionText: {
    fontSize: FontSizes.md,
    lineHeight: 24,
  },
});
