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
  validateName,
} from '../../../utils/validation';
import { Input } from '../../core/Input';
import { Button } from '../../core/Button';
import { SchoolPicker } from '../SchoolPicker';
import { School } from '../../../constants/data/schools';

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
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  const isLogin = formType === 'login';

  const { values, errors, handleChange, handleSubmit } = useForm({
    initialValues: {
      firstName: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
    validators: {
      firstName: isLogin ? undefined : validateName,
      email: validateEmail,
      username: isLogin ? undefined : validateUsername,
      password: validatePassword,
      confirmPassword: (value) => {
        if (isLogin) return { isValid: true };
        if (value !== values.password) {
          return { isValid: false, error: 'Passwords do not match' };
        }
        return { isValid: true };
      },
    },
    onSubmit: async (data) => {
      const submissionData: AuthFormData = isLogin
        ? { email: data.email, password: data.password }
        : {
            email: data.email,
            username: data.username,
            password: data.password,
            nickname: data.firstName, // Use firstName as initial nickname
            school: selectedSchool?.value || undefined, // Extract school ID or set as undefined
          };
      await onSubmit(submissionData);
    },
  });

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const handleSchoolSelect = (school: School | null) => {
    setSelectedSchool(school);
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
            label="First Name"
            value={values.firstName}
            onChangeText={(text: string) => handleChange('firstName', text)}
            error={errors.firstName}
            autoCapitalize="words"
            placeholder="Enter your first name"
          />
        </View>
      )}

      {!isLogin && (
        <View style={styles.inputContainer}>
          <Input
            label="Username"
            value={values.username}
            onChangeText={(text: string) => handleChange('username', text)}
            error={errors.username}
            autoCapitalize="none"
            placeholder="Choose a username"
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
          placeholder="Enter your email"
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
          placeholder="Enter your password"
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
            placeholder="Confirm your password"
          />
        </View>
      )}

      {!isLogin && (
        <View style={styles.inputContainer}>
          <SchoolPicker
            label="School (Optional)"
            value={selectedSchool}
            onSelect={handleSchoolSelect}
            placeholder="Select your school..."
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
          <Text>{isLogin ? 'Log In' : 'Sign Up'}</Text>
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
