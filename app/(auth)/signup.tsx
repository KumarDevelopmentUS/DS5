import React from 'react';
import { useRouter } from 'expo-router';
import { AuthForm, AuthFormData } from '../../components/forms/AuthForm';
import { useAuth } from '../../hooks/auth/useAuth';
import { SimpleScreen } from '../../components/Layout/Screen/SimpleScreen';
import { SignUpData } from '../../services/auth/authService';

/**
 * Signup Screen
 */
const SignupScreen = () => {
  const { signUp, loading, error, clearError } = useAuth();
  const router = useRouter();

  const handleSignup = async (data: AuthFormData) => {
    try {
      console.log('Starting signup process with data:', data);
      clearError();

      // Type guard: Check if this is signup data (has username and nickname)
      if ('username' in data && 'nickname' in data) {
        console.log('Valid signup data detected, calling signUp...');
        const result = await signUp(data as SignUpData);

        console.log('SignUp result:', result);

        if (result.success) {
          console.log('Signup successful, redirecting to home...');
          router.replace('/(tabs)/home');
        } else {
          console.log('Signup failed:', result.error || 'Unknown error');
          // The error should be handled by the useAuth hook and displayed in the form
        }
      } else {
        // This case should ideally not be reachable in the signup flow,
        // but it's good practice to handle it.
        console.error('Signup form submitted without required signup fields.');
      }
    } catch (err) {
      console.error('Unexpected error during signup:', err);
    }
  };

  const navigateToLogin = () => {
    // Navigate back to 'login' within the current (auth) stack
    router.push('/login');
  };

  return (
    <SimpleScreen
      showHeader={false}
      contentStyle={{ paddingHorizontal: 24, justifyContent: 'center' }}
    >
      <AuthForm
        formType="signup"
        onSubmit={handleSignup}
        loading={loading}
        serverError={error}
        onNavigate={navigateToLogin}
      />
    </SimpleScreen>
  );
};

export default SignupScreen;
