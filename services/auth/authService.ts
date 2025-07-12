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
  avatarUrl?: string;
  school?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export class AuthService {
  /**
   * Get current session
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
   * Refresh session
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
   * Check if username is available
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
   * Reset password
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
   * Sign up a new user with proper error handling and manual profile creation
   */
  /**
   * Sign up a new user - relies ONLY on database trigger for profile creation
   */
  static async signUp(
    signUpData: SignUpData
  ): Promise<AuthServiceResponse<{ user: AuthUser; profile: UserProfile }>> {
    try {
      const { email, password, username, nickname, school } = signUpData;

      console.log('🚀 Starting signup process for:', {
        email,
        username,
        nickname,
        school,
      });

      // 1. Create the auth user with metadata (trigger will handle everything)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username.toLowerCase(),
            nickname: nickname || username,
            school: school || null,
          },
        },
      });

      if (authError) {
        console.error('❌ Auth signup error:', authError);
        if (authError.message.includes('User already registered')) {
          return {
            data: null,
            error: 'An account with this email already exists.',
            success: false,
          };
        }
        if (authError.message.includes('Database error')) {
          return {
            data: null,
            error: 'There was a database issue. Please try again later.',
            success: false,
          };
        }
        return { data: null, error: authError.message, success: false };
      }

      if (!authData.user) {
        console.error('❌ No user returned from auth signup');
        return { data: null, error: 'User creation failed', success: false };
      }

      console.log('✅ Auth user created successfully:', authData.user.id);
      console.log('⏳ Waiting for trigger to create profile...');

      // 2. Wait for the trigger to create the profile (with retries)
      let profileData = null;
      let attempts = 0;
      const maxAttempts = 8;

      while (!profileData && attempts < maxAttempts) {
        attempts++;
        console.log(`🔍 Profile fetch attempt ${attempts}/${maxAttempts}`);

        // Wait before each attempt
        await new Promise((resolve) => setTimeout(resolve, attempts * 200));

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (!error && data) {
          profileData = data;
          console.log('✅ Profile found:', data);
          break;
        } else if (error && error.code !== 'PGRST116') {
          // PGRST116 = no rows found, other errors are more serious
          console.error(`❌ Profile fetch error (attempt ${attempts}):`, error);
        }
      }

      if (!profileData) {
        console.error(
          '❌ Profile was not created by trigger after all attempts'
        );
        return {
          data: null,
          error: 'Failed to create user profile. Please try again.',
          success: false,
        };
      }

      console.log(
        '🎉 Profile created successfully by trigger:',
        profileData.username
      );

      // 3. Create return objects
      const user: AuthUser = {
        id: authData.user.id,
        email: authData.user.email!,
        emailConfirmed: authData.user.email_confirmed_at !== null,
        lastSignIn: authData.user.last_sign_in_at || null,
        createdAt: authData.user.created_at,
      };

      const profile: UserProfile = {
        id: profileData.id,
        username: profileData.username, // Use the actual username created by trigger
        nickname: profileData.nickname || '',
        avatarUrl: profileData.avatar_url || '',
        school: profileData.school || '',
        isPublic: profileData.is_public ?? true,
        createdAt: profileData.created_at || new Date().toISOString(),
        updatedAt: profileData.updated_at || new Date().toISOString(),
      };

      console.log(
        '🎉 Signup completed successfully! Final username:',
        profile.username
      );

      return {
        data: { user, profile },
        error: null,
        success: true,
      };
    } catch (error: any) {
      console.error('💥 Unexpected error during signup:', error);
      const errorInfo = handleDatabaseError(error, 'signUp');
      return {
        data: null,
        error: `Database error saving new user: ${errorInfo.message}`,
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
