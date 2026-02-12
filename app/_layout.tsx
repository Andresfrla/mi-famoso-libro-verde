// =====================================================
// Root Layout - App Providers Setup
// =====================================================

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';


import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, LanguageProvider, MeasurementProvider, FavoritesProvider } from '@/src/contexts';
import '@/src/i18n';
import { Colors } from '@/src/lib/constants';

// Custom green theme
const GreenLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.primary,
    background: Colors.light.background,
    card: Colors.light.surface,
    text: Colors.light.text,
    border: Colors.light.border,
  },
};

const GreenDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.primary,
    background: Colors.dark.background,
    card: Colors.dark.surface,
    text: Colors.dark.text,
    border: Colors.dark.border,
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? GreenDarkTheme : GreenLightTheme;

  return (
    <AuthProvider>
      <FavoritesProvider>
        <LanguageProvider>
          <MeasurementProvider>
            <ThemeProvider value={theme}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="recipe/[id]"
                  options={{
                    headerShown: false,
                    presentation: 'card',
                  }}
                />
                <Stack.Screen
                  name="recipe/create"
                  options={{
                    headerShown: false,
                    presentation: 'modal',
                  }}
                />
                <Stack.Screen
                  name="recipe/edit/[id]"
                  options={{
                    headerShown: false,
                    presentation: 'modal',
                  }}
                />
                <Stack.Screen
                  name="auth"
                  options={{
                    headerShown: false,
                    presentation: 'modal',
                  }}
                />
                <Stack.Screen
                  name="acerca"
                  options={{
                    headerShown: true,
                    presentation: 'card',
                  }}
                />
                <Stack.Screen
                  name="profile"
                  options={{
                    headerShown: true,
                    presentation: 'card',
                  }}
                />
                <Stack.Screen
                  name="privacidad"
                  options={{
                    headerShown: true,
                    presentation: 'card',
                  }}
                />
              </Stack>
              <StatusBar style="auto" />
            </ThemeProvider>
          </MeasurementProvider>
        </LanguageProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}
