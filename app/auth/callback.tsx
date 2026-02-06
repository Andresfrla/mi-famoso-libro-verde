// =====================================================
// Auth Callback Handler - Deep Link
// =====================================================

import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts';
import { Colors } from '@/src/lib/constants';

export default function AuthCallback() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // If user is authenticated, redirect to home
    if (user) {
      router.replace('/(tabs)');
    } else {
      // If not authenticated, go back to auth screen
      setTimeout(() => {
        router.replace('/auth');
      }, 2000);
    }
  }, [user, router]);

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
