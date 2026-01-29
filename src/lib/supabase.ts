// =====================================================
// Supabase Client Configuration
// =====================================================

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Environment variables - Replace these with your Supabase project credentials
// You can also use expo-constants or a .env file with expo-dotenv
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

if (!SUPABASE_URL || SUPABASE_URL === 'YOUR_SUPABASE_URL') {
  console.warn(
    '⚠️ Supabase URL not configured. Please set EXPO_PUBLIC_SUPABASE_URL in your environment.'
  );
}

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn(
    '⚠️ Supabase Anon Key not configured. Please set EXPO_PUBLIC_SUPABASE_ANON_KEY in your environment.'
  );
}

// Create Supabase client without strict typing
// Type safety is handled in the service layer with our own types
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return (
    SUPABASE_URL !== 'YOUR_SUPABASE_URL' &&
    SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY' &&
    !!SUPABASE_URL &&
    !!SUPABASE_ANON_KEY
  );
};
