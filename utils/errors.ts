// utils/errors.ts

import { ApiError } from '../types/api';
import { ErrorCodes } from '../types/api';
import { DEV_CONFIG } from '../constants/config';
import * as Sentry from '@sentry/react-native';

// ============================================
// ERROR TYPE DEFINITIONS
// ============================================

export interface ParsedError {
  message: string;
  code: string; // Make this required with fallback
  statusCode?: number;
  details?: any;
  retryable: boolean;
  userFriendly: boolean;
}

export interface ErrorContext {
  userId?: string;
  action?: string;
  component?: string;
  additionalData?: Record<string, any>;
  timestamp: string;
  sessionId?: string;
  // Add index signature to make it compatible with Sentry context
  [key: string]: unknown;
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

// ============================================
// ERROR PARSING UTILITIES
// ============================================

/**
 * Extracts a user-friendly error message from complex error objects
 * Handles errors from Supabase, network requests, and other sources
 * @param error - The error object to parse
 * @returns ParsedError with standardized structure
 */
export const parseError = (error: any): ParsedError => {
  // Default error structure
  const defaultError: ParsedError = {
    message: 'An unexpected error occurred. Please try again.',
    code: ErrorCodes.INTERNAL_ERROR,
    retryable: true,
    userFriendly: true,
  };

  // Handle null/undefined errors
  if (!error) {
    return defaultError;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      message: error,
      code: 'STRING_ERROR',
      retryable: false,
      userFriendly: true,
    };
  }

  // Handle ApiError format (our standard error format)
  if (isApiError(error)) {
    return {
      message: error.message || defaultError.message,
      code: error.code || defaultError.code,
      statusCode: error.statusCode,
      details: error.details,
      retryable: error.retryable ?? true,
      userFriendly: true,
    };
  }

  // Handle Supabase errors
  if (isSupabaseError(error)) {
    return parseSupabaseError(error);
  }

  // Handle network/fetch errors
  if (isNetworkError(error)) {
    return parseNetworkError(error);
  }

  // Handle JavaScript Error objects
  if (error instanceof Error) {
    return {
      message: getUserFriendlyMessage(error.message) || defaultError.message,
      code: error.name || 'JAVASCRIPT_ERROR',
      details: error.stack,
      retryable: isRetryableError(error),
      userFriendly: true,
    };
  }

  // Handle response errors (from fetch, axios, etc.)
  if (isResponseError(error)) {
    return parseResponseError(error);
  }

  // Fallback for unknown error types
  if (DEV_CONFIG.ENABLE_LOGS) {
    console.warn('Unknown error type:', error);
  }

  return {
    ...defaultError,
    details: error,
  };
};

/**
 * Checks if an error is due to network connectivity issues
 * @param error - The error to check
 * @returns True if the error is network-related
 */
export const isNetworkError = (error: any): boolean => {
  if (!error) return false;

  // Check error message patterns
  const networkErrorPatterns = [
    /network/i,
    /offline/i,
    /connection/i,
    /timeout/i,
    /unreachable/i,
    /failed to fetch/i,
    /net::/i,
    /ERR_NETWORK/i,
    /ERR_INTERNET_DISCONNECTED/i,
  ];

  const errorMessage = getErrorMessage(error);

  if (networkErrorPatterns.some((pattern) => pattern.test(errorMessage))) {
    return true;
  }

  // Check error codes
  const networkCodes = ['NETWORK_ERROR', 'TIMEOUT', 'CONNECTION_FAILED'];
  if (error.code && networkCodes.includes(error.code)) {
    return true;
  }

  // Check HTTP status codes that indicate network issues
  const networkStatusCodes = [0, 408, 503, 504, 522, 523, 524];
  if (error.status && networkStatusCodes.includes(error.status)) {
    return true;
  }

  return false;
};

/**
 * Logs errors to monitoring service (Sentry) with context
 * @param error - The error to log
 * @param context - Additional context about the error
 * @param severity - The severity level of the error
 */
export const logError = (
  error: any,
  context: Partial<ErrorContext> = {},
  severity: ErrorSeverity = 'medium'
): void => {
  // Skip logging in development if logs are disabled
  if (!DEV_CONFIG.ENABLE_LOGS && __DEV__) {
    return;
  }

  const parsedError = parseError(error);

  // Create full context
  const fullContext: ErrorContext = {
    timestamp: new Date().toISOString(),
    ...context,
  };

  // Log to console in development
  if (__DEV__) {
    const logMethod = severity === 'critical' ? console.error : console.warn;
    logMethod('Error logged:', {
      message: parsedError.message,
      code: parsedError.code,
      context: fullContext,
      severity,
    });
  }

  // Send to Sentry
  try {
    // Set additional context
    Sentry.setContext('error_details', {
      code: parsedError.code,
      statusCode: parsedError.statusCode,
      retryable: parsedError.retryable,
      userFriendly: parsedError.userFriendly,
    });

    Sentry.setContext('app_context', fullContext);

    // Set tags individually (only if values are defined)
    if (context.component) {
      Sentry.setTag('component', context.component);
    }
    if (context.action) {
      Sentry.setTag('action', context.action);
    }
    if (context.userId) {
      Sentry.setTag('userId', context.userId);
    }

    // Set severity level
    const sentryLevel = mapSeverityToSentryLevel(severity);

    // Capture the error
    if (error instanceof Error) {
      Sentry.captureException(error, {
        level: sentryLevel,
        extra: {
          parsedError,
          context: fullContext,
        },
      });
    } else {
      Sentry.captureMessage(parsedError.message, {
        level: sentryLevel,
        extra: {
          originalError: error,
          parsedError,
          context: fullContext,
        },
      });
    }
  } catch (sentryError) {
    // Fallback logging if Sentry fails
    console.error('Failed to log error to Sentry:', sentryError);
    console.error('Original error:', error);
  }
};

// ============================================
// ERROR TYPE CHECKERS
// ============================================

/**
 * Checks if an error matches our ApiError interface
 */
const isApiError = (error: any): error is ApiError => {
  return (
    error &&
    typeof error === 'object' &&
    typeof error.message === 'string' &&
    (error.code === undefined || typeof error.code === 'string')
  );
};

/**
 * Checks if an error is from Supabase
 */
const isSupabaseError = (error: any): boolean => {
  return (
    error &&
    (error.error_description ||
      error.details ||
      error.hint ||
      (error.message && error.code))
  );
};

/**
 * Checks if an error is a response error (from HTTP requests)
 */
const isResponseError = (error: any): boolean => {
  return error && (error.response || error.status || error.statusText);
};

// ============================================
// SPECIALIZED ERROR PARSERS
// ============================================

/**
 * Parses Supabase-specific errors
 */
const parseSupabaseError = (error: any): ParsedError => {
  let message = error.message || 'Database operation failed';
  let code = error.code || 'SUPABASE_ERROR';
  let retryable = true;

  // Handle specific Supabase error codes
  if (error.code) {
    switch (error.code) {
      case '23505': // Unique constraint violation
        message =
          'This information already exists. Please use different values.';
        retryable = false;
        break;
      case '23503': // Foreign key violation
        message = 'Invalid reference. Please check your input.';
        retryable = false;
        break;
      case '42501': // Insufficient privileges
        message = 'You do not have permission to perform this action.';
        retryable = false;
        code = ErrorCodes.PERMISSION_DENIED;
        break;
      case 'PGRST116': // No rows returned
        message = 'The requested item was not found.';
        retryable = false;
        code = ErrorCodes.NOT_FOUND;
        break;
    }
  }

  // Handle auth errors
  if (error.error_description) {
    message = getUserFriendlyAuthMessage(error.error_description);
    retryable = false;
    code = 'AUTH_ERROR';
  }

  return {
    message,
    code,
    statusCode: error.status,
    details: error.details || error.hint,
    retryable,
    userFriendly: true,
  };
};

/**
 * Parses network/fetch errors
 */
const parseNetworkError = (error: any): ParsedError => {
  let message = 'Unable to connect. Please check your internet connection.';
  let retryable = true;

  if (error.message?.includes('timeout')) {
    message = 'Request timed out. Please try again.';
  } else if (error.message?.includes('offline')) {
    message =
      'You appear to be offline. Please check your internet connection.';
  }

  return {
    message,
    code: ErrorCodes.NETWORK_ERROR,
    details: error.message,
    retryable,
    userFriendly: true,
  };
};

/**
 * Parses HTTP response errors
 */
const parseResponseError = (error: any): ParsedError => {
  const status = error.response?.status || error.status;
  const statusText = error.response?.statusText || error.statusText;
  const data = error.response?.data;

  let message = 'Server error occurred. Please try again.';
  let code: string = ErrorCodes.INTERNAL_ERROR; // Fixed: Changed from specific type to string
  let retryable = true;

  // Handle specific HTTP status codes
  switch (status) {
    case 400:
      message = 'Invalid request. Please check your input.';
      code = ErrorCodes.INVALID_INPUT;
      retryable = false;
      break;
    case 401:
      message = 'Authentication required. Please log in again.';
      code = ErrorCodes.AUTH_REQUIRED;
      retryable = false;
      break;
    case 403:
      message = 'You do not have permission to perform this action.';
      code = ErrorCodes.FORBIDDEN;
      retryable = false;
      break;
    case 404:
      message = 'The requested item was not found.';
      code = ErrorCodes.NOT_FOUND;
      retryable = false;
      break;
    case 429:
      message = 'Too many requests. Please wait a moment and try again.';
      code = ErrorCodes.RATE_LIMITED;
      retryable = true;
      break;
    case 500:
    case 502:
    case 503:
    case 504:
      message = 'Server is temporarily unavailable. Please try again later.';
      code = ErrorCodes.SERVICE_UNAVAILABLE;
      retryable = true;
      break;
  }

  // Use server-provided error message if available
  if (data?.message) {
    message = data.message;
  } else if (data?.error) {
    message = data.error;
  }

  return {
    message,
    code,
    statusCode: status,
    details: { statusText, data },
    retryable,
    userFriendly: true,
  };
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Extracts error message from various error formats
 */
const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  if (error?.error_description) return error.error_description;
  return '';
};

/**
 * Converts technical error messages to user-friendly ones
 */
const getUserFriendlyMessage = (message: string): string => {
  const messageMappings: Record<string, string> = {
    'fetch failed': 'Unable to connect to the server',
    'network error': 'Network connection failed',
    timeout: 'Request timed out',
    unauthorized: 'Please log in to continue',
    forbidden: 'You do not have permission for this action',
    'not found': 'The requested item was not found',
    'internal server error': 'Server error occurred',
    'service unavailable': 'Service is temporarily unavailable',
  };

  const lowerMessage = message.toLowerCase();

  for (const [technical, friendly] of Object.entries(messageMappings)) {
    if (lowerMessage.includes(technical)) {
      return friendly;
    }
  }

  return message;
};

/**
 * Converts auth error descriptions to user-friendly messages
 */
const getUserFriendlyAuthMessage = (description: string): string => {
  const authMappings: Record<string, string> = {
    invalid_grant: 'Invalid email or password',
    user_not_found: 'No account found with this email',
    invalid_credentials: 'Invalid email or password',
    email_not_confirmed: 'Please verify your email address',
    signup_disabled: 'Account registration is currently disabled',
    weak_password: 'Password is too weak. Please choose a stronger password',
    email_already_registered: 'An account with this email already exists',
  };

  return authMappings[description] || description;
};

/**
 * Determines if an error is retryable based on its characteristics
 */
const isRetryableError = (error: Error): boolean => {
  const nonRetryablePatterns = [
    /unauthorized/i,
    /forbidden/i,
    /not found/i,
    /invalid/i,
    /bad request/i,
  ];

  return !nonRetryablePatterns.some((pattern) => pattern.test(error.message));
};

/**
 * Maps our severity levels to Sentry severity levels
 */
const mapSeverityToSentryLevel = (
  severity: ErrorSeverity
): Sentry.SeverityLevel => {
  switch (severity) {
    case 'low':
      return 'info';
    case 'medium':
      return 'warning';
    case 'high':
      return 'error';
    case 'critical':
      return 'fatal';
    default:
      return 'error';
  }
};

// ============================================
// UTILITY FUNCTIONS FOR COMPONENTS
// ============================================

/**
 * Creates a standardized error handler for components
 * @param componentName - Name of the component for context
 * @param action - The action that caused the error
 * @returns Error handler function
 */
export const createErrorHandler = (componentName: string, action: string) => {
  return (error: any, additionalContext: Record<string, any> = {}) => {
    logError(error, {
      component: componentName,
      action,
      additionalData: additionalContext,
    });

    return parseError(error);
  };
};

/**
 * Wraps async functions with error handling
 * @param fn - The async function to wrap
 * @param context - Error context
 * @returns Wrapped function that handles errors
 */
export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context: Partial<ErrorContext>
) => {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error, context);
      return null;
    }
  };
};

/**
 * Retries a function with exponential backoff
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries
 * @param initialDelay - Initial delay in milliseconds
 * @returns Promise that resolves when successful or all retries exhausted
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if error is not retryable
      const parsedError = parseError(error);
      if (!parsedError.retryable || attempt === maxRetries) {
        throw error;
      }

      // Wait before next attempt with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};
