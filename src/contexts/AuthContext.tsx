// =====================================================
// Authentication Context
// =====================================================

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

interface AuthContextType {
  user: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  pendingPasswordReset: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  deleteAccount: () => Promise<{ error: string | null }>;
  clearPasswordReset: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Generate callback URL dynamically based on environment
const getRedirectUrl = (
  type: "callback" | "reset-password" | "magic-link" = "callback",
) => {
  // Build explicit deep link that points to a dedicated path in the app
  const path =
    type === "reset-password" ? "reset-password" :
    type === "magic-link" ? "magic-link" : "callback";
  const base = __DEV__ ? `exp://login` : `milibroverde://login`;
  // Include the path for both dev and production so navigation can pick the screen
  const url = `${base}/${path}`;
  console.log("Generated redirect URL:", url);
  return url;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfigured] = useState(isSupabaseConfigured());
  const [pendingPasswordReset, setPendingPasswordReset] = useState(false);
  const [appOpenedWithDeepLink, setAppOpenedWithDeepLink] = useState(false);

  // Check for pending password reset and deep links on mount
  useEffect(() => {
    const checkPasswordReset = async () => {
      try {
        const resetRequested = await AsyncStorage.getItem(
          "passwordResetRequested",
        );
        const resetEmail = await AsyncStorage.getItem("passwordResetEmail");

        console.log("Stored reset flag:", resetRequested, "email:", resetEmail);

        if (resetRequested === "true") {
          setPendingPasswordReset(true);
        }

        // Also check for deep link URL
        const url = await Linking.getInitialURL();
        console.log("Initial URL check:", url);

        // If URL contains token and a recovery-type, it's a password reset
        if (url) {
          const tokenPresent = /token=/.test(url);
          // tolerate different type values for recovery flows
          const typeMatch = /type=(recovery|password-reset)/.test(url);
          if (tokenPresent && typeMatch) {
            console.log("App opened with password reset deep link!");
            setAppOpenedWithDeepLink(true);
            setPendingPasswordReset(true);
          }
        }
      } catch (e) {
        console.error("Error checking password reset:", e);
      }
    };
    checkPasswordReset();
  }, []);

  const clearPasswordReset = useCallback(async () => {
    await AsyncStorage.removeItem("passwordResetRequested");
    await AsyncStorage.removeItem("passwordResetEmail");
    setPendingPasswordReset(false);
  }, []);

  // Handle deep links for password reset - listen for URL events
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      console.log("Deep link received:", event.url);

      // Check if it's a recovery/magic recovery link
      const url = event.url;
      if (
        url.includes("token") &&
        (url.includes("type=recovery") || url.includes("type=password-reset"))
      ) {
        console.log("Recovery link detected via event!");
        setPendingPasswordReset(true);
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Check initial URL
    Linking.getInitialURL().then((url) => {
      console.log("Initial URL in effect:", url);
      if (url && url.includes("token") && url.includes("recovery")) {
        setPendingPasswordReset(true);
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isConfigured]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!isConfigured) {
        return { error: "Supabase is not configured" };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error: error?.message ?? null };
    },
    [isConfigured],
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      if (!isConfigured) {
        return { error: "Supabase is not configured" };
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getRedirectUrl(),
        },
      });

      return { error: error?.message ?? null };
    },
    [isConfigured],
  );

  const signInWithMagicLink = useCallback(
    async (email: string) => {
      if (!isConfigured) {
        return { error: "Supabase is not configured" };
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: getRedirectUrl("magic-link"),
        },
      });

      return { error: error?.message ?? null };
    },
    [isConfigured],
  );

  const resetPassword = useCallback(
    async (email: string) => {
      if (!isConfigured) {
        return { error: "Supabase is not configured" };
      }

      // Save flag to indicate password reset was requested
      await AsyncStorage.setItem("passwordResetRequested", "true");
      await AsyncStorage.setItem("passwordResetEmail", email);

      // Use dynamic URL generated by the app for the reset screen
      const redirectUrl = getRedirectUrl("reset-password");

      console.log("Reset password redirect to:", redirectUrl);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      return { error: error?.message ?? null };
    },
    [isConfigured],
  );

  const signOut = useCallback(async () => {
    if (!isConfigured) return;
    await supabase.auth.signOut();
  }, [isConfigured]);

  const updatePassword = useCallback(
    async (newPassword: string) => {
      if (!isConfigured) {
        return { error: "Supabase is not configured" };
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      return { error: error?.message ?? null };
    },
    [isConfigured],
  );

  const deleteAccount = useCallback(async () => {
    if (!isConfigured) {
      return { error: "Supabase is not configured" };
    }

    const { error } = await supabase.rpc("delete_user");

    return { error: error?.message ?? null };
  }, [isConfigured]);

  const value: AuthContextType = {
    user,
    session,
    loading,
    isConfigured,
    pendingPasswordReset,
    signIn,
    signUp,
    signInWithMagicLink,
    resetPassword,
    signOut,
    updatePassword,
    deleteAccount,
    clearPasswordReset,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
