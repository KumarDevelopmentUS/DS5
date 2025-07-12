// components/forms/AuthForm/AuthForm.types.ts

import { SignInData, SignUpData } from '../../../services/auth/authService';

/**
 * Defines the mode of the authentication form.
 * 'login' - Renders email and password fields.
 * 'signup' - Renders first name, email, username, password, confirm password, and optional school fields.
 */
export type AuthFormType = 'login' | 'signup';

/**
 * Defines the data structure submitted by the form.
 * For login: email and password
 * For signup: includes all required fields including nickname (derived from firstName) and optional school
 */
export type AuthFormData = SignInData | SignUpData;

/**
 * Props for the AuthForm component.
 */
export interface AuthFormProps {
  /** Specifies whether the form is for 'login' or 'signup'. */
  formType: AuthFormType;
  /** The function to call when the form is submitted with valid data. */
  onSubmit: (data: AuthFormData) => Promise<void>;
  /** Indicates if the form is in a loading state (e.g., during submission). */
  loading: boolean;
  /** A general error message from the server to display on the form. */
  serverError?: string | null;
  /** A function to handle navigation to the alternate auth screen (e.g., from login to signup). */
  onNavigate: () => void;
  /** An optional function to handle navigation to the 'forgot password' screen. */
  onForgotPassword?: () => void;
}
