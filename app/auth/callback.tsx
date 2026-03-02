// =====================================================
// Auth Callback Handler - Deep Link
// =====================================================

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts';
import { Colors } from '@/src/lib/constants';

export default function AuthCallback() {
  const router = useRouter();
  const { pendingPasswordReset, clearPasswordReset } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const doRedirect = async () => {
      // Clear the password reset flag since we're handling it
      if (pendingPasswordReset) {
        await clearPasswordReset();
      }
      
      // Always redirect to update password when coming from callback
      // The flag above indicates the user requested a password reset
      setRedirecting(true);
      router.replace('/update-password');
    };

    doRedirect();
  }, [pendingPasswordReset, clearPasswordReset, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.light.primary} />
      <Text style={styles.text}>Redirigiendo...</Text>
      <Text style={styles.subtext}>Cambiar contraseña</Text>
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
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  subtext: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
});
