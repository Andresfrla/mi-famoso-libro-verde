// =====================================================
// Auth Screen (Login / Sign Up)
// =====================================================

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Pressable,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/src/contexts';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/src/lib/constants';

type AuthMode = 'login' | 'signup' | 'magic' | 'forgot';

export default function AuthScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { signIn, signUp, signInWithMagicLink, resetPassword, isConfigured } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleSubmit = useCallback(async () => {
    if (!email.trim()) {
      Alert.alert(t('common.error'), t('auth.emailRequired'));
      return;
    }

    if (mode !== 'magic' && mode !== 'forgot' && !password.trim()) {
      Alert.alert(t('common.error'), t('auth.passwordRequired'));
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      Alert.alert(t('common.error'), t('auth.passwordMismatch'));
      return;
    }

    setLoading(true);

    let result: { error: string | null };

    if (mode === 'login') {
      result = await signIn(email, password);
    } else if (mode === 'signup') {
      result = await signUp(email, password);
    } else if (mode === 'forgot') {
      result = await resetPassword(email);
    } else {
      result = await signInWithMagicLink(email);
    }

    setLoading(false);

    if (result.error) {
      Alert.alert(t('common.error'), result.error);
      return;
    }

    if (mode === 'magic') {
      Alert.alert(t('common.confirm'), t('auth.magicLinkSent'));
    } else if (mode === 'forgot') {
      Alert.alert(t('common.confirm'), t('auth.resetPasswordEmailSent'));
      setMode('login');
    } else {
      Alert.alert(
        t('common.confirm'),
        mode === 'login' ? t('auth.loginSuccess') : t('auth.signupSuccess'),
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  }, [email, password, confirmPassword, mode, signIn, signUp, signInWithMagicLink, t, router]);

  const handleContinueAsGuest = useCallback(() => {
    router.back();
  }, [router]);

  if (!isConfigured) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Pressable onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
        </View>
        <View style={styles.notConfigured}>
          <Ionicons name="warning-outline" size={64} color={colors.primary} />
          <Text style={[styles.notConfiguredTitle, { color: colors.text }]}>
            Supabase Not Configured
          </Text>
          <Text style={[styles.notConfiguredText, { color: colors.textSecondary }]}>
            Authentication requires Supabase to be configured. Please set up your
            environment variables.
          </Text>
          <Pressable
            style={[styles.guestButton, { backgroundColor: colors.primary }]}
            onPress={handleContinueAsGuest}
          >
            <Text style={styles.guestButtonText}>{t('auth.continueAsGuest')}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Pressable onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={[styles.logoContainer, { backgroundColor: `${colors.primary}15` }]}>
            <Ionicons name="book" size={48} color={colors.primary} />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            {t('common.appName')}
          </Text>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {mode === 'login' ? t('auth.login') : mode === 'signup' ? t('auth.signup') : mode === 'forgot' ? t('auth.forgotPassword') : t('auth.magicLink')}
          </Text>

          {/* Mode Tabs */}
          <View style={[styles.tabs, { backgroundColor: colors.surfaceSecondary }]}>
            <Pressable
              style={[
                styles.tab,
                mode === 'login' && [styles.tabActive, { backgroundColor: colors.surface }],
              ]}
              onPress={() => setMode('login')}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: mode === 'login' ? colors.text : colors.textMuted },
                ]}
              >
                {t('auth.login')}
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.tab,
                mode === 'signup' && [styles.tabActive, { backgroundColor: colors.surface }],
              ]}
              onPress={() => setMode('signup')}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: mode === 'signup' ? colors.text : colors.textMuted },
                ]}
              >
                {t('auth.signup')}
              </Text>
            </Pressable>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email */}
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                {t('auth.email')}
              </Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="email@example.com"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Password */}
            {mode !== 'magic' && mode !== 'forgot' && (
              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  {t('auth.password')}
                </Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="********"
                    placeholderTextColor={colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textMuted}
                    />
                  </Pressable>
                </View>
              </View>
            )}

            {/* Confirm Password */}
            {mode === 'signup' && (
              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  {t('auth.confirmPassword')}
                </Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="********"
                    placeholderTextColor={colors.textMuted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                  />
                </View>
              </View>
            )}

            {/* Forgot Password Link */}
            {mode === 'login' && (
              <Pressable style={styles.forgotPasswordButton} onPress={() => setMode('forgot')}>
                <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                  {t('auth.forgotPassword')}
                </Text>
              </Pressable>
            )}

            {/* Back to Login Link */}
            {mode === 'forgot' && (
              <Pressable style={styles.backToLoginButton} onPress={() => setMode('login')}>
                <Text style={[styles.backToLoginText, { color: colors.textSecondary }]}>
                  {t('auth.backToLogin')}
                </Text>
              </Pressable>
            )}

            {/* Submit Button */}
            <Pressable
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading
                  ? t('common.loading')
                  : mode === 'login'
                  ? t('auth.login')
                  : mode === 'signup'
                  ? t('auth.signup')
                  : mode === 'forgot'
                  ? t('auth.sendResetEmail')
                  : t('auth.magicLink')}
              </Text>
            </Pressable>

            {/* Magic Link Option */}
            {mode === 'login' && (
              <Pressable style={styles.magicLinkButton} onPress={() => setMode('magic')}>
                <Ionicons name="sparkles" size={20} color={colors.primary} />
                <Text style={[styles.magicLinkText, { color: colors.primary }]}>
                  {t('auth.magicLink')}
                </Text>
              </Pressable>
            )}

            {/* Switch Mode */}
            <View style={styles.switchMode}>
              <Text style={[styles.switchModeText, { color: colors.textSecondary }]}>
                {mode === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}
              </Text>
              <Pressable onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
                <Text style={[styles.switchModeLink, { color: colors.primary }]}>
                  {mode === 'login' ? t('auth.signup') : t('auth.login')}
                </Text>
              </Pressable>
            </View>

            {/* Continue as Guest */}
            <Pressable
              style={[styles.guestOutlineButton, { borderColor: colors.border }]}
              onPress={handleContinueAsGuest}
            >
              <Text style={[styles.guestOutlineText, { color: colors.textSecondary }]}>
                {t('auth.continueAsGuest')}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    alignItems: 'center',
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.lg,
    marginBottom: Spacing.xl,
  },
  tabs: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    padding: 4,
    marginBottom: Spacing.xl,
    alignSelf: 'stretch',
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  tabActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  form: {
    alignSelf: 'stretch',
  },
  field: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.lg,
  },
  submitButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  submitButtonText: {
    color: '#1E293B',
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
  magicLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  magicLinkText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  forgotPasswordText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
  },
  backToLoginButton: {
    alignSelf: 'center',
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  backToLoginText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
  },
  switchMode: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  switchModeText: {
    fontSize: FontSizes.md,
  },
  switchModeLink: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  guestOutlineButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  guestOutlineText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
  },
  notConfigured: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  notConfiguredTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  notConfiguredText: {
    fontSize: FontSizes.md,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  guestButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  guestButtonText: {
    color: '#1E293B',
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
});
