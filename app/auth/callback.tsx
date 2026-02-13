// =====================================================
// Auth Callback Handler - Deep Link
// =====================================================

import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/src/contexts';
import { Colors } from '@/src/lib/constants';
import { supabase } from '@/src/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    // Handle magic link authentication
    const handleAuthCallback = async () => {
      try {
        // Check if this is a password reset
        if (params.type === 'recovery') {
          // Redirect to update password screen
          router.replace('/update-password');
          return;
        }

        // Check if this is a magic link (OTP)
        if (params.type === 'magiclink' || params.type === 'magic-link') {
          // Magic link already authenticates the user, just redirect
          router.replace('/(tabs)');
          return;
        }

        // If we have a code in the URL, exchange it for a session
        if (params.code) {
          const { error } = await supabase.auth.exchangeCodeForSession(params.code as string);
          if (error) {
            console.error('Error exchanging code for session:', error);
          }
        }
      } catch (err) {
        console.error('Error in auth callback:', err);
      }
    };

    handleAuthCallback();
  }, [params, router]);

  useEffect(() => {
    // If this is a recovery, we already redirected above
    if (params.type === 'recovery') {
      return;
    }

    // If user is authenticated, redirect to home
    if (user) {
      router.replace('/(tabs)');
    } else {
      // If not authenticated, go back to auth screen
      setTimeout(() => {
        router.replace('/auth');
      }, 2000);
    }
  }, [user, router, params.type]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.light.primary} />
      <Text style={styles.text}>Verificando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
});
