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
    console.log('Login attempt started');
    setLoading(true);
    setServerError(null);

    try {
      const response = await authService.signIn(data);
      console.log('Login response:', response);

      if (response.success && response.data) {
        console.log('Login successful, waiting for navigation...');
        // Add a timeout to see if navigation happens
        setTimeout(() => {
          console.log('Navigation should have happened by now');
        }, 2000);
      } else {
        console.log('Login failed:', response.error);
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
    // Navigate to 'signup' within the current (auth) stack
    router.push('/signup');
  };

  const handleForgotPassword = () => {
    // Navigate to 'password-recovery' within the current (auth) stack
    router.push('/forgotpassword');
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
          <View style={styles.logoContainer}>{/* Placeholder for logo */}</View>
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
  },
});
