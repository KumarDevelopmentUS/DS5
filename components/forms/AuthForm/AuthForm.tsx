// components/forms/AuthForm/AuthForm.tsx

import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AuthFormProps, AuthFormData } from './AuthForm.types';
import { createStyles } from './AuthForm.styles';
import { useForm } from '../../../hooks/ui/useForm';
import { useTheme } from '../../../hooks/ui/useTheme';
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from '../../../utils/validation';
// Assuming core components exist as per the roadmap
// import { Input } from '../../core/Input';
// import { Button } from '../../core/Button';

// --- Mock Components (Remove these when you have the real ones) ---
const Input = ({ label, error, ...props }: any) => (
  <View>
    <Text>{label}</Text>
    {/* A real Input would handle its own props like value, onChangeText, etc. */}
    {error && <Text style={{ color: 'red' }}>{error}</Text>}
  </View>
);
const Button = ({ children, loading, ...props }: any) => (
  <TouchableOpacity {...props}>
    <Text>{loading ? 'Loading...' : children}</Text>
  </TouchableOpacity>
);
// --- End Mock Components ---

export const AuthForm: React.FC<AuthFormProps> = ({
  formType,
  onSubmit,
  loading,
  serverError,
  onNavigate,
  onForgotPassword,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isLogin = formType === 'login';

  const { values, errors, handleChange, handleSubmit } = useForm({
    initialValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
    validators: {
      email: validateEmail,
      // Only validate username in signup mode
      username: isLogin ? undefined : validateUsername,
      password: validatePassword,
      // Custom validator for confirmPassword
      confirmPassword: (value) => {
        if (isLogin) return { isValid: true }; // Don't validate on login
        if (value !== values.password) {
          return { isValid: false, error: 'Passwords do not match' };
        }
        return { isValid: true };
      },
    },
    onSubmit: (data) => {
      const submissionData: AuthFormData = isLogin
        ? { email: data.email, password: data.password }
        : {
            email: data.email,
            username: data.username,
            password: data.password,
          };
      onSubmit(submissionData);
    },
  });

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isLogin ? 'Welcome Back!' : 'Create Account'}
      </Text>
      <Text style={styles.subtitle}>
        {isLogin
          ? 'Log in to continue your journey.'
          : 'Sign up to get started.'}
      </Text>

      {!isLogin && (
        <View style={styles.inputContainer}>
          <Input
            label="Username"
            value={values.username}
            onChangeText={(text: string) => handleChange('username', text)}
            error={errors.username}
            autoCapitalize="none"
            // leftIcon={{ type: 'feather', name: 'user' }}
          />
        </View>
      )}

      <View style={styles.inputContainer}>
        <Input
          label="Email"
          value={values.email}
          onChangeText={(text: string) => handleChange('email', text)}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          // leftIcon={{ type: 'feather', name: 'mail' }}
        />
      </View>

      <View style={styles.inputContainer}>
        <Input
          label="Password"
          value={values.password}
          onChangeText={(text: string) => handleChange('password', text)}
          error={errors.password}
          secureTextEntry={!isPasswordVisible}
          autoCapitalize="none"
          // leftIcon={{ type: 'feather', name: 'lock' }}
          // rightIcon={{
          //   type: 'feather',
          //   name: isPasswordVisible ? 'eye-off' : 'eye',
          //   onPress: togglePasswordVisibility,
          // }}
        />
      </View>

      {!isLogin && (
        <View style={styles.inputContainer}>
          <Input
            label="Confirm Password"
            value={values.confirmPassword}
            onChangeText={(text: string) =>
              handleChange('confirmPassword', text)
            }
            error={errors.confirmPassword}
            secureTextEntry={!isPasswordVisible}
            autoCapitalize="none"
            // leftIcon={{ type: 'feather', name: 'lock' }}
          />
        </View>
      )}

      {serverError && (
        <View style={styles.errorContainer}>
          <Text style={styles.serverErrorText}>{serverError}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button onPress={handleSubmit} loading={loading}>
          {isLogin ? 'Log In' : 'Sign Up'}
        </Button>
      </View>

      <View style={styles.linksContainer}>
        <TouchableOpacity style={styles.linkButton} onPress={onNavigate}>
          <Text style={styles.linkText}>
            {isLogin
              ? "Don't have an account? Sign Up"
              : 'Already have an account? Log In'}
          </Text>
        </TouchableOpacity>

        {isLogin && onForgotPassword && (
          <TouchableOpacity
            style={[styles.linkButton, styles.forgotPasswordButton]}
            onPress={onForgotPassword}
          >
            <Text style={styles.linkText}>Forgot Password?</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
