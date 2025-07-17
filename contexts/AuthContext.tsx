// contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import {
  authService,
  type SignUpData,
  type SignInData,
  type ResetPasswordData,
  type AuthServiceResponse,
  type AuthUser,
  type UserProfile,
} from '../services/auth/authService';

/**
 * Authentication Context
 *
 * This context provides authentication state and methods to the entire component tree.
 * It acts as a single source of truth for auth status and eliminates prop drilling.
 *
 * Features:
 * - Real-time auth state monitoring
 * - Automatic session management
 * - Loading states for auth operations
 * - Error handling and user feedback
 * - Profile data integration
 * - Convenient auth methods
 */

// Auth context state interface
export interface AuthContextState {
  // Auth state
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;

  // Loading states
  loading: boolean;
  initializing: boolean;

  // Error state
  error: string | null;

  // Auth methods
  signUp: (
    data: SignUpData
  ) => Promise<AuthServiceResponse<{ user: AuthUser; profile: UserProfile }>>;
  signIn: (
    data: SignInData
  ) => Promise<AuthServiceResponse<{ user: AuthUser; session: Session }>>;
  signOut: () => Promise<AuthServiceResponse<null>>;
  resetPassword: (
    data: ResetPasswordData
  ) => Promise<AuthServiceResponse<null>>;

  // Utility methods
  refreshSession: () => Promise<void>;
  clearError: () => void;
  checkUsernameAvailability: (username: string) => Promise<boolean>;
}

// Create the context with default values
const AuthContext = createContext<AuthContextState | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 *
 * This component wraps the entire app and provides auth state to all child components.
 * It automatically listens for auth state changes and updates the context accordingly.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Core auth state
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Derived state
  const isAuthenticated = !!user && !!session;

  /**
   * Initialize auth state on app startup
   */
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Get current session
        const currentSession = await authService.getCurrentSession();

        if (isMounted) {
          if (currentSession) {
            setSession(currentSession);
            setUser(currentSession.user);
            // Profile will be loaded by the auth state change listener
          }
          setInitializing(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setInitializing(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Set up auth state change listener
   */
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);

        setSession(session);
        setUser(session?.user ?? null);

        // Load user profile when signed in
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setProfile(null);
        }

        // Set initializing to false after first auth state change
        if (initializing) {
          setInitializing(false);
        }
      }
    );

    return unsubscribe;
  }, [initializing]);

  /**
   * Load user profile from database
   */
  const loadUserProfile = async (userId: string) => {
    try {
      // Import supabase here to avoid circular dependencies
      const { supabase } = await import('../services/database/databaseService');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        return;
      }

      if (data) {
        const profileData: UserProfile = {
          id: data.id,
          username: data.username,
          nickname: data.nickname || undefined, // Convert null to undefined
          avatarUrl: data.avatar_url || undefined, // Convert null to undefined
          school: data.school || undefined, // Convert null to undefined
          isPublic: data.is_public || true,
          createdAt: data.created_at || '',
          updatedAt: data.updated_at || '',
        };

        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  /**
   * Sign up a new user
   */
  const handleSignUp = async (
    data: SignUpData
  ): Promise<AuthServiceResponse<{ user: AuthUser; profile: UserProfile }>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await authService.signUp(data);

      if (!result.success) {
        setError(result.error);
      }

      return result;
    } catch (error: any) {
      const errorMessage =
        error.message || 'An unexpected error occurred during sign up';
      setError(errorMessage);
      return {
        data: null,
        error: errorMessage,
        success: false,
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign in an existing user
   */
  const handleSignIn = async (
    data: SignInData
  ): Promise<AuthServiceResponse<{ user: AuthUser; session: Session }>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await authService.signIn(data);

      if (!result.success) {
        setError(result.error);
      }

      return result;
    } catch (error: any) {
      const errorMessage =
        error.message || 'An unexpected error occurred during sign in';
      setError(errorMessage);
      return {
        data: null,
        error: errorMessage,
        success: false,
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign out the current user
   */
  const handleSignOut = async (): Promise<AuthServiceResponse<null>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await authService.signOut();

      if (!result.success) {
        setError(result.error);
      } else {
        // Clear local state immediately
        setUser(null);
        setSession(null);
        setProfile(null);
      }

      return result;
    } catch (error: any) {
      const errorMessage =
        error.message || 'An unexpected error occurred during sign out';
      setError(errorMessage);
      return {
        data: null,
        error: errorMessage,
        success: false,
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset user password
   */
  const handleResetPassword = async (
    data: ResetPasswordData
  ): Promise<AuthServiceResponse<null>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await authService.resetPassword(data);

      if (!result.success) {
        setError(result.error);
      }

      return result;
    } catch (error: any) {
      const errorMessage =
        error.message || 'An unexpected error occurred during password reset';
      setError(errorMessage);
      return {
        data: null,
        error: errorMessage,
        success: false,
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh the current session
   */
  const handleRefreshSession = async (): Promise<void> => {
    try {
      const result = await authService.refreshSession();

      if (result.success && result.data) {
        setSession(result.data);
        setUser(result.data.user);
      } else {
        console.error('Failed to refresh session:', result.error);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  /**
   * Clear error state
   */
  const clearError = (): void => {
    setError(null);
  };

  /**
   * Check if username is available
   */
  const checkUsernameAvailability = async (
    username: string
  ): Promise<boolean> => {
    try {
      return await authService.isUsernameAvailable(username);
    } catch (error) {
      console.error('Error checking username availability:', error);
      return false;
    }
  };

  // Context value
  const contextValue: AuthContextState = {
    // Auth state
    user,
    session,
    profile,
    isAuthenticated,

    // Loading states
    loading,
    initializing,

    // Error state
    error,

    // Auth methods
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,

    // Utility methods
    refreshSession: handleRefreshSession,
    clearError,
    checkUsernameAvailability,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

/**
 * Custom hook to use the AuthContext
 *
 * This hook provides a convenient way to access the auth context and
 * ensures it's used within an AuthProvider.
 *
 * @returns AuthContextState - The current auth context state and methods
 * @throws Error if used outside of AuthProvider
 */
export const useAuthContext = (): AuthContextState => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
};

// Export the context for advanced use cases
export { AuthContext };

// Default export for convenience
export default AuthProvider;
