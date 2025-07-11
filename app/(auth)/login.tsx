// app/(auth)/login.tsx

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AuthForm } from '../../components/forms/AuthForm';
import { authService } from '../../services/auth/authService';
import { SPACING } from '../../constants/theme';
import { useTheme } from '../../hooks/ui/useTheme';
import { useKeyboard } from '../../hooks/ui/useKeyboard';
import type { SignInData } from '../../services/auth/authService';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { keyboardHeight } = useKeyboard();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleLogin = async (data: SignInData) => {
    setLoading(true);
    setServerError(null);

    try {
      const response = await authService.signIn(data);

      if (response.success && response.data) {
        // On successful login, the onAuthStateChanged listener in AuthContext
        // will automatically update the state and trigger navigation.
        // No manual refresh or navigation is needed here.
      } else {
        setServerError(response.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToSignup = () => {
    router.push('../(auth)/signup');
  };

  const handleForgotPassword = () => {
    router.push('../(auth)/password-recovery');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              keyboardHeight > 0 ? keyboardHeight + SPACING.md : SPACING.xl,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Logo or App Name could go here */}
          <View style={styles.logoContainer}>{/* Placeholder for logo */}</View>

          {/* Auth Form */}
          <AuthForm
            formType="login"
            onSubmit={handleLogin}
            loading={loading}
            serverError={serverError}
            onNavigate={handleNavigateToSignup}
            onForgotPassword={handleForgotPassword}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
    // Add logo styles here when assets are available
  },
});
