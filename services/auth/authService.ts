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

/**
 * Authentication Service
 *
 * This service encapsulates all authentication-related logic and acts as an abstraction
 * layer over the Supabase auth client. It handles user registration, login, logout,
 * password recovery, and profile management.
 *
 * Key Features:
 * - User registration with automatic profile creation
 * - Secure login/logout functionality
 * - Password recovery and reset
 * - Session management
 * - Profile synchronization
 * - Comprehensive error handling
 */

// Type definitions for auth service
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
  nickname: string | null;
  email: string;
  avatarUrl: string | null;
  school: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Authentication Service Class
 *
 * Provides a clean interface for all authentication operations
 */
export class AuthService {
  /**
   * Sign up a new user with email and password
   *
   * This method:
   * 1. Creates a new auth user in Supabase Auth
   * 2. Creates a corresponding profile in the public profiles table
   * 3. Handles any errors that occur during the process
   *
   * @param signUpData - User registration data
   * @returns Promise with user data or error
   */
  static async signUp(
    signUpData: SignUpData
  ): Promise<AuthServiceResponse<{ user: AuthUser; profile: UserProfile }>> {
    try {
      const { email, password, username, nickname, school } = signUpData;

      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username, // Store username in auth metadata for easy access
            nickname: nickname || null,
            school: school || null,
          },
        },
      });

      if (authError) {
        return {
          data: null,
          error: authError.message,
          success: false,
        };
      }

      if (!authData.user) {
        return {
          data: null,
          error: 'User creation failed - no user returned',
          success: false,
        };
      }

      // Step 2: Create profile in profiles table
      const profileData: TableInsert<'profiles'> = {
        id: authData.user.id,
        username,
        nickname: nickname || null,
        school: school || null,
        avatar_url: null,
        is_public: true, // Default to public profile
        settings: {
          theme: 'system',
          notifications: {
            match_invites: true,
            friend_requests: true,
            community_posts: true,
            achievements: true,
          },
          privacy: {
            show_online_status: true,
            show_match_history: true,
            allow_friend_requests: true,
          },
        },
      };

      const { data: profileResult, error: profileError } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (profileError) {
        // If profile creation fails, we should clean up the auth user
        // Note: In a production app, you might want to handle this differently
        console.error('Profile creation failed:', profileError);

        return {
          data: null,
          error: `Profile creation failed: ${profileError.message}`,
          success: false,
        };
      }

      // Step 3: Return combined user and profile data
      const user: AuthUser = {
        id: authData.user.id,
        email: authData.user.email!,
        emailConfirmed: authData.user.email_confirmed_at !== null,
        lastSignIn: authData.user.last_sign_in_at || null,
        createdAt: authData.user.created_at,
      };

      const profile: UserProfile = {
        id: profileResult.id,
        username: profileResult.username,
        nickname: profileResult.nickname,
        email: authData.user.email!,
        avatarUrl: profileResult.avatar_url,
        school: profileResult.school,
        isPublic: profileResult.is_public || true,
        createdAt: profileResult.created_at!,
        updatedAt: profileResult.updated_at!,
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
   *
   * @param signInData - User login credentials
   * @returns Promise with session data or error
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
        return {
          data: null,
          error: error.message,
          success: false,
        };
      }

      if (!data.user || !data.session) {
        return {
          data: null,
          error: 'Login failed - invalid response',
          success: false,
        };
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
      return {
        data: null,
        error: errorInfo.message,
        success: false,
      };
    }
  }

  /**
   * Sign out the current user
   *
   * Clears the user session from the device and signs out from Supabase
   *
   * @returns Promise with success status
   */
  static async signOut(): Promise<AuthServiceResponse<null>> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false,
        };
      }

      return {
        data: null,
        error: null,
        success: true,
      };
    } catch (error: any) {
      const errorInfo = handleDatabaseError(error, 'signOut');
      return {
        data: null,
        error: errorInfo.message,
        success: false,
      };
    }
  }

  /**
   * Send password reset email
   *
   * Initiates the password recovery flow by sending a reset email
   *
   * @param resetData - Email for password reset
   * @returns Promise with success status
   */
  static async resetPassword(
    resetData: ResetPasswordData
  ): Promise<AuthServiceResponse<null>> {
    try {
      const { email } = resetData;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'diestats://reset-password', // Deep link for mobile app
      });

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false,
        };
      }

      return {
        data: null,
        error: null,
        success: true,
      };
    } catch (error: any) {
      const errorInfo = handleDatabaseError(error, 'resetPassword');
      return {
        data: null,
        error: errorInfo.message,
        success: false,
      };
    }
  }

  /**
   * Update user password
   *
   * Updates the password for the currently authenticated user
   *
   * @param updateData - New password data
   * @returns Promise with success status
   */
  static async updatePassword(
    updateData: UpdatePasswordData
  ): Promise<AuthServiceResponse<null>> {
    try {
      const { password } = updateData;

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false,
        };
      }

      return {
        data: null,
        error: null,
        success: true,
      };
    } catch (error: any) {
      const errorInfo = handleDatabaseError(error, 'updatePassword');
      return {
        data: null,
        error: errorInfo.message,
        success: false,
      };
    }
  }

  /**
   * Get current user session
   *
   * Retrieves the current session if the user is authenticated
   *
   * @returns Promise with session data or null
   */
  static async getCurrentSession(): Promise<Session | null> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  /**
   * Get current user
   *
   * Retrieves the current authenticated user
   *
   * @returns Promise with user data or null
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Check if username is available
   *
   * Validates that a username is not already taken
   *
   * @param username - Username to check
   * @returns Promise with availability status
   */
  static async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .limit(1);

      if (error) {
        console.error('Error checking username availability:', error);
        return false;
      }

      return data.length === 0;
    } catch (error) {
      console.error('Error checking username availability:', error);
      return false;
    }
  }

  /**
   * Listen to auth state changes
   *
   * Sets up a listener for authentication state changes
   *
   * @param callback - Function to call when auth state changes
   * @returns Unsubscribe function
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

  /**
   * Refresh the current session
   *
   * Manually refreshes the user's session token
   *
   * @returns Promise with refreshed session or error
   */
  static async refreshSession(): Promise<AuthServiceResponse<Session>> {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false,
        };
      }

      if (!data.session) {
        return {
          data: null,
          error: 'Session refresh failed',
          success: false,
        };
      }

      return {
        data: data.session,
        error: null,
        success: true,
      };
    } catch (error: any) {
      const errorInfo = handleDatabaseError(error, 'refreshSession');
      return {
        data: null,
        error: errorInfo.message,
        success: false,
      };
    }
  }
}

// Export singleton methods for convenience
export const authService = AuthService;

// Export individual methods for easier importing
export const {
  signUp,
  signIn,
  signOut,
  resetPassword,
  updatePassword,
  getCurrentSession,
  getCurrentUser,
  isUsernameAvailable,
  onAuthStateChange,
  refreshSession,
} = AuthService;
