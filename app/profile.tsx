// =====================================================
// Profile Screen
// =====================================================

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Pressable,
  Alert,
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/src/contexts';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/src/lib/constants';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { user, updatePassword, deleteAccount } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
      <Stack.Screen options={{ title: t('settings.profileSettings') }} />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Email Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('settings.email')}
        </Text>
        <View style={[styles.emailCard, { backgroundColor: colors.surface }]}>
          <View style={styles.emailIconContainer}>
            <Ionicons name="mail-outline" size={24} color={colors.primary} />
          </View>
          <View style={styles.emailInfo}>
            <Text style={[styles.emailLabel, { color: colors.textMuted }]}>
              {t('auth.email')}
            </Text>
            <Text style={[styles.emailText, { color: colors.text }]}>
              {user?.email || t('common.loading')}
            </Text>
          </View>
        </View>

        {/* Change Password Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('settings.changePassword')}
        </Text>
        <View style={[styles.passwordCard, { backgroundColor: colors.surface }]}>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.background, 
              color: colors.text,
              borderColor: colors.border 
            }]}
            placeholder={t('settings.newPassword')}
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.background, 
              color: colors.text,
              borderColor: colors.border 
            }]}
            placeholder={t('settings.confirmNewPassword')}
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <Pressable
            style={[styles.changePasswordButton, { backgroundColor: colors.primary }]}
            onPress={handleChangePassword}
          >
            <Text style={styles.changePasswordButtonText}>
              {t('settings.changePassword')}
            </Text>
          </Pressable>
        </View>

        {/* Contact Support Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('settings.contactSupport')}
        </Text>
        <View style={[styles.contactCard, { backgroundColor: colors.surface }]}>
          <View style={styles.contactInfo}>
            <Ionicons name="help-circle-outline" size={24} color={colors.primary} />
            <Text style={[styles.contactText, { color: colors.text }]}>
              {t('settings.haveQuestions')}
            </Text>
          </View>
          <Text style={[styles.contactDescription, { color: colors.textMuted }]}>
            {t('settings.contactDescription')}
          </Text>
          <View style={[styles.emailContainer, { backgroundColor: colors.background }]}>
            <Ionicons name="mail-outline" size={20} color={colors.primary} style={styles.emailIcon} />
            <Text style={[styles.contactEmail, { color: colors.text }]}>
              andresfranla@gmail.com
            </Text>
          </View>
        </View>

        {/* Delete Account Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('common.delete')}
        </Text>
        <View style={[styles.deleteCard, { backgroundColor: colors.surface }]}>
          <View style={styles.deleteInfo}>
            <Ionicons name="warning-outline" size={24} color={colors.error} />
            <Text style={[styles.deleteText, { color: colors.text }]}>
              {t('settings.deleteAccount')}
            </Text>
          </View>
          <Text style={[styles.deleteDescription, { color: colors.textMuted }]}>
            {t('settings.deleteAccountConfirm')}
          </Text>
          <Pressable
            style={[styles.deleteButton, { borderColor: colors.error }]}
            onPress={handleDeleteAccount}
          >
            <Text style={[styles.deleteButtonText, { color: colors.error }]}>
              {t('settings.deleteAccount')}
            </Text>
          </Pressable>
        </View>
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
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  emailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  emailIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.xl,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  emailInfo: {
    flex: 1,
  },
  emailLabel: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.xs,
  },
  emailText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
  },
  passwordCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  input: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    fontSize: FontSizes.md,
    borderWidth: 1,
  },
  changePasswordButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  changePasswordButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: '#1E293B',
  },
  deleteCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  deleteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  deleteText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    marginLeft: Spacing.sm,
  },
  deleteDescription: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  deleteButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
  },
  contactCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  contactText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    marginLeft: Spacing.sm,
  },
  contactDescription: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  emailIcon: {
    marginRight: Spacing.sm,
  },
  contactEmail: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
  },
});
