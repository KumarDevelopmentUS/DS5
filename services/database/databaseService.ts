// services/database/databaseService.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/database.types';
import { API_CONFIG } from '../../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Supabase Database Service
 *
 * This service creates and exports a singleton instance of the Supabase client
 * that serves as the central point of connection to the backend for the entire application.
 *
 * Features:
 * - Type-safe database operations using generated Database types
 * - Optimized configuration for React Native environment
 * - Session persistence and automatic token refresh
 * - Real-time subscriptions support
 * - Proper error handling and retry logic
 */

// Validate required configuration
if (!API_CONFIG.SUPABASE_URL) {
  throw new Error('SUPABASE_URL is required but not provided in API_CONFIG');
}

if (!API_CONFIG.SUPABASE_ANON_KEY) {
  throw new Error(
    'SUPABASE_ANON_KEY is required but not provided in API_CONFIG'
  );
}

/**
 * Create a single, reusable Supabase client instance with full type safety
 *
 * Configuration optimized for React Native:
 * - Session persistence using AsyncStorage (when available)
 * - Automatic token refresh to maintain authentication
 * - Real-time features enabled for live match updates
 * - URL detection disabled (not needed for mobile apps)
 */
const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

export const supabase = createClient<Database>(
  API_CONFIG.SUPABASE_URL,
  API_CONFIG.SUPABASE_ANON_KEY,
  {
    auth: {
      // Session persistence configuration
      // Explicitly set AsyncStorage for Expo persistent login support
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Not needed for mobile apps
      ...(isNative ? { storage: AsyncStorage } : {}), // Only set storage on native

      // Storage configuration for React Native
      // Supabase will automatically use AsyncStorage when available

      // Flow type for auth flow
      flowType: 'pkce', // Recommended for mobile apps
    },

    // Real-time configuration for live features
    realtime: {
      params: {
        eventsPerSecond: 10, // Reasonable limit for mobile
      },
    },

    // Global configuration
    global: {
      headers: {
        'X-Client-Info': 'diestats-mobile-app',
      },
    },

    // Database configuration
    db: {
      schema: 'public', // Use public schema
    },
  }
);

/**
 * Database connection health check
 *
 * This function can be used to verify that the database connection is working
 * properly. It's useful for debugging connection issues or health monitoring.
 *
 * @returns Promise<boolean> - True if connection is healthy, false otherwise
 */
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    // Simple query to test connection
    const { error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .single();

    // If no error, connection is healthy
    return !error;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
};

/**
 * Get current database configuration info
 *
 * Useful for debugging and monitoring
 *
 * @returns Object containing non-sensitive configuration details
 */
export const getDatabaseInfo = () => {
  return {
    url: API_CONFIG.SUPABASE_URL,
    hasAnonKey: !!API_CONFIG.SUPABASE_ANON_KEY,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Database error handler utility
 *
 * Provides consistent error handling across the application
 *
 * @param error - The error from a Supabase operation
 * @param operation - Description of the operation that failed
 * @returns Formatted error object
 */
export const handleDatabaseError = (error: any, operation: string) => {
  const errorInfo = {
    message: error?.message || 'Unknown database error',
    code: error?.code || 'UNKNOWN_ERROR',
    operation,
    timestamp: new Date().toISOString(),
  };

  // Log error for debugging (only in development)
  if (__DEV__) {
    console.error(`Database Error [${operation}]:`, errorInfo);
  }

  return errorInfo;
};

/**
 * Type helper for Supabase table operations
 *
 * This provides better TypeScript support when working with specific tables
 */
export type SupabaseTable = keyof Database['public']['Tables'];

/**
 * Type helper for getting table row types
 */
export type TableRow<T extends SupabaseTable> =
  Database['public']['Tables'][T]['Row'];

/**
 * Type helper for getting table insert types
 */
export type TableInsert<T extends SupabaseTable> =
  Database['public']['Tables'][T]['Insert'];

/**
 * Type helper for getting table update types
 */
export type TableUpdate<T extends SupabaseTable> =
  Database['public']['Tables'][T]['Update'];

/**
 * Re-export commonly used types from database.types.ts for convenience
 */
export type { Database, Json } from '../../types/database.types';

// Export the configured client as the default export for convenience
export default supabase;
