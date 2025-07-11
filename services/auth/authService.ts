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

// --- Type definitions are unchanged ---
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

export class AuthService {
  /**
   * Sign up a new user. The user's profile is now created automatically
   * by the database trigger we created in the Supabase dashboard.
   */
  static async signUp(
    signUpData: SignUpData
  ): Promise<AuthServiceResponse<{ user: AuthUser }>> {
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

      // No second step is needed. The trigger handled it.
      const user: AuthUser = {
        id: authData.user.id,
        email: authData.user.email!,
        emailConfirmed: authData.user.email_confirmed_at !== null,
        lastSignIn: authData.user.last_sign_in_at || null,
        createdAt: authData.user.created_at,
      };

      return {
        data: { user },
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
