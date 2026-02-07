// =====================================================
// Settings Screen
// =====================================================

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Pressable,
  Alert,
  Modal,
  TextInput,
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
  const { user, signOut, isConfigured, updatePassword, deleteAccount } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { measurementSystem, setMeasurementSystem } = useMeasurementSystem();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  const handleChangePassword = useCallback(async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert(t('common.error'), t('auth.passwordMismatch'));
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(t('common.error'), t('auth.passwordRequired'));
      return;
    }

    const { error } = await updatePassword(newPassword);
    if (error) {
      Alert.alert(t('common.error'), t('settings.passwordChangeError'));
    } else {
      Alert.alert(t('common.success'), t('settings.passwordChanged'));
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [newPassword, confirmPassword, updatePassword, t]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      t('settings.deleteAccount'),
      t('settings.deleteAccountConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteAccount();
            if (error) {
              Alert.alert(t('common.error'), t('settings.accountDeleteError'));
            } else {
              Alert.alert(t('common.success'), t('settings.accountDeleted'));
            }
          },
        },
      ]
    );
  }, [t, deleteAccount]);

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
          {user && (
            <View style={[styles.emailContainer, { backgroundColor: colors.surface }]}>
              <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
              <Text style={[styles.emailText, { color: colors.text }]}>
                {user.email}
              </Text>
            </View>
          )}
          <SettingsItem
            icon="person-outline"
            label={t('settings.profileSettings')}
            onPress={() => {
              if (!user && isConfigured) {
                handleLogin();
              }
            }}
          />
          {user && (
            <>
              <SettingsItem
                icon="lock-closed-outline"
                label={t('settings.changePassword')}
                onPress={() => setShowPasswordModal(true)}
              />
              <SettingsItem
                icon="trash-outline"
                label={t('settings.deleteAccount')}
                onPress={handleDeleteAccount}
                destructive
              />
            </>
          )}
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

      {/* Change Password Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPasswordModal}
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t('settings.changePassword')}
              </Text>
              <Pressable onPress={() => setShowPasswordModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
              placeholder={t('settings.newPassword')}
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
              placeholder={t('settings.confirmNewPassword')}
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <Pressable
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleChangePassword}
            >
              <Text style={styles.saveButtonText}>{t('common.save')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  emailText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl * 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
  },
  input: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    fontSize: FontSizes.md,
  },
  saveButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  saveButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: '#1E293B',
  },
});
