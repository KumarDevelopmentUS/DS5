import React from 'react';
import { useRouter } from 'expo-router';
import { AuthForm, AuthFormData } from '../../components/forms/AuthForm';
import { useAuth } from '../../hooks/auth/useAuth';
import { Screen } from '../../components/Layout/Screen';
import { SignUpData } from '../../services/auth/authService';

/**
 * Signup Screen
 */
const SignupScreen = () => {
  const { signUp, loading, error, clearError } = useAuth();
  const router = useRouter();

  const handleSignup = async (data: AuthFormData) => {
    clearError();

    // Type guard: Check if 'username' exists in the data object.
    // This assures TypeScript that we have the correct data structure for signing up.
    if ('username' in data) {
      const result = await signUp(data as SignUpData);

      if (result.success) {
        router.replace('/(tabs)/home');
      }
    } else {
      // This case should ideally not be reachable in the signup flow,
      // but it's good practice to handle it.
      console.error('Signup form submitted without a username.');
    }
  };

  const navigateToLogin = () => {
    // Navigate back to 'login' within the current (auth) stack
    router.push('/login');
  };

  return (
    <Screen
      preset="scroll"
      style={{ paddingHorizontal: 24, justifyContent: 'center' }}
    >
      <AuthForm
        formType="signup"
        onSubmit={handleSignup}
        loading={loading}
        serverError={error}
        onNavigate={navigateToLogin}
      />
    </Screen>
  );
};

export default SignupScreen;
