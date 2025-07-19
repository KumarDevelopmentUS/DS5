// services/database/databaseService.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/database.types';
import { API_CONFIG } from '../../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Database Service
 * 
 * Centralized Supabase client configuration with type safety and React Native optimization.
 * Provides database connection, real-time subscriptions, and error handling utilities.
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
 * Supabase Client Configuration
 * 
 * Optimized for React Native with session persistence, real-time features, and type safety.
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
 * Database Connection Health Check
 * 
 * Verifies database connectivity for debugging and health monitoring.
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
 * Database Configuration Info
 * 
 * Returns non-sensitive configuration details for debugging and monitoring.
 */
export const getDatabaseInfo = () => {
  return {
    url: API_CONFIG.SUPABASE_URL,
    hasAnonKey: !!API_CONFIG.SUPABASE_ANON_KEY,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Database Error Handler
 * 
 * Provides consistent error handling and logging across database operations.
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
