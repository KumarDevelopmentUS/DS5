import React from 'react';
import { useRouter } from 'expo-router';
import { AuthForm } from '../../components/forms/AuthForm';
import { useAuth } from '../../hooks/auth/useAuth';
import { AuthFormData } from '../../components/forms/AuthForm';
import { Screen } from '../../components/Layout/Screen';

/**
 * Login Screen
 *
 * This screen provides the user interface for existing users to sign in to their
 * DieStats account. It utilizes the reusable AuthForm component to handle the
 * form logic and presentation.
 */
const LoginScreen = () => {
  const { signIn, loading, error, clearError } = useAuth();
  const router = useRouter();

  /**
   * Handles the submission of the login form.
   *
   * @param data - The login credentials (email and password).
   */
  const handleLogin = async (data: AuthFormData) => {
    // Clear any previous errors before a new attempt
    clearError();
    const result = await signIn(data);

    if (result.success) {
      // Navigate to the main app screen on successful login
      router.replace('../(tabs)/home');
    }
    // If there's an error, it will be automatically set in the AuthContext
    // and displayed by the AuthForm component.
  };

  /**
   * Navigates to the signup screen.
   */
  const navigateToSignup = () => {
    router.push('../(auth)/signup');
  };

  /**
   * Navigates to the password recovery screen.
   */
  const navigateToForgotPassword = () => {
    router.push('../(auth)/password-recovery');
  };

  return (
    <Screen
      preset="scroll"
      style={{ paddingHorizontal: 24, justifyContent: 'center' }}
    >
      <AuthForm
        formType="login"
        onSubmit={handleLogin}
        loading={loading}
        serverError={error}
        onNavigate={navigateToSignup}
        onForgotPassword={navigateToForgotPassword}
      />
    </Screen>
  );
};

export default LoginScreen;
