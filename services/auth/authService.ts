// services/auth/authService.ts
import { supabase, handleDatabaseError } from '../database/databaseService';
import type {
  AuthError,
  AuthResponse,
  User,
  Session,
  SignUpWithPasswordCredentials,
  SignInWithPasswordCredentials,
} from '@supabase/supabase-js';
import type { TableInsert, Database, Json } from '../database/databaseService';

// --- Type definitions ---
export interface SignUpData {
  email: string;
  password: string;
  username: string;
  nickname?: string;
  school?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface UpdatePasswordData {
  password: string;
}

export interface AuthServiceResponse<T = any> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  emailConfirmed: boolean;
  lastSignIn: string | null;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  username: string;
  nickname?: string;
  email: string;
  avatarUrl?: string;
  school?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export class AuthService {
  /**
   * Get current session - ADDED THIS METHOD
   */
  static async getCurrentSession(): Promise<Session | null> {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting current session:', error);
        return null;
      }
      return session;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  /**
   * Refresh session - ADDED THIS METHOD
   */
  static async refreshSession(): Promise<AuthServiceResponse<Session>> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        return { data: null, error: error.message, success: false };
      }
      return { data: data.session, error: null, success: true };
    } catch (error: any) {
      const errorInfo = handleDatabaseError(error, 'refreshSession');
      return { data: null, error: errorInfo.message, success: false };
    }
  }

  /**
   * Check if username is available - ADDED THIS METHOD
   */
  static async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username.toLowerCase())
        .single();

      if (error && error.code === 'PGRST116') {
        // No rows returned, username is available
        return true;
      }

      // If we found a row, username is taken
      return false;
    } catch (error) {
      console.error('Error checking username availability:', error);
      return false;
    }
  }

  /**
   * Reset password - ADDED THIS METHOD
   */
  static async resetPassword(
    resetData: ResetPasswordData
  ): Promise<AuthServiceResponse<null>> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        resetData.email
      );
      if (error) {
        return { data: null, error: error.message, success: false };
      }
      return { data: null, error: null, success: true };
    } catch (error: any) {
      const errorInfo = handleDatabaseError(error, 'resetPassword');
      return { data: null, error: errorInfo.message, success: false };
    }
  }

  /**
   * Sign up a new user. The user's profile is now created automatically
   * by the database trigger we created in the Supabase dashboard.
   */
  static async signUp(
    signUpData: SignUpData
  ): Promise<AuthServiceResponse<{ user: AuthUser; profile: UserProfile }>> {
    try {
      const { email, password, username, nickname, school } = signUpData;

      // The database trigger will use the metadata in 'options.data'
      // to populate the new profile row.
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            nickname: nickname || null,
            school: school || null,
          },
        },
      });

      if (authError) {
        return { data: null, error: authError.message, success: false };
      }
      if (!authData.user) {
        return { data: null, error: 'User creation failed', success: false };
      }

      // Create the user object
      const user: AuthUser = {
        id: authData.user.id,
        email: authData.user.email!,
        emailConfirmed: authData.user.email_confirmed_at !== null,
        lastSignIn: authData.user.last_sign_in_at || null,
        createdAt: authData.user.created_at,
      };

      // Create a mock profile (the real one will be created by the trigger)
      const profile: UserProfile = {
        id: authData.user.id,
        username: username,
        nickname: nickname || '',
        email: email,
        avatarUrl: '',
        school: school || '',
        isPublic: true,
        createdAt: authData.user.created_at,
        updatedAt: authData.user.created_at,
      };

      return {
        data: { user, profile },
        error: null,
        success: true,
      };
    } catch (error: any) {
      const errorInfo = handleDatabaseError(error, 'signUp');
      return {
        data: null,
        error: errorInfo.message,
        success: false,
      };
    }
  }

  /**
   * Sign in an existing user with email and password
   */
  static async signIn(
    signInData: SignInData
  ): Promise<AuthServiceResponse<{ user: AuthUser; session: Session }>> {
    try {
      const { email, password } = signInData;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        return { data: null, error: error.message, success: false };
      }
      if (!data.user || !data.session) {
        return { data: null, error: 'Login failed', success: false };
      }
      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email!,
        emailConfirmed: data.user.email_confirmed_at !== null,
        lastSignIn: data.user.last_sign_in_at || null,
        createdAt: data.user.created_at,
      };
      return {
        data: { user, session: data.session },
        error: null,
        success: true,
      };
    } catch (error: any) {
      const errorInfo = handleDatabaseError(error, 'signIn');
      return { data: null, error: errorInfo.message, success: false };
    }
  }

  /**
   * Sign out the current user
   */
  static async signOut(): Promise<AuthServiceResponse<null>> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { data: null, error: error.message, success: false };
      }
      return { data: null, error: null, success: true };
    } catch (error: any) {
      const errorInfo = handleDatabaseError(error, 'signOut');
      return { data: null, error: errorInfo.message, success: false };
    }
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(
    callback: (event: string, session: Session | null) => void
  ) {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(callback);

    // Return unsubscribe function
    return () => subscription.unsubscribe();
  }
}

export const authService = AuthService;
