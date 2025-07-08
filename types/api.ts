// types/api.ts

/**
 * API Types for DieStats Application
 *
 * This file defines standardized types for all API communications.
 * Every service that fetches data should use these types to ensure
 * consistency across the application.
 */

// ============================================
// CORE API RESPONSE TYPES
// ============================================

/**
 * Standard API Response Wrapper
 * Every API call returns data wrapped in this structure
 *
 * @example
 * const response: ApiResponse<User> = await authService.getCurrentUser();
 * if (response.success) {
 *   console.log(response.data); // User object
 * }
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  message?: string;
  timestamp: string;
  requestId?: string;
}

/**
 * Standard Error Structure
 * Consistent error format across all API endpoints
 */
export interface ApiError {
  code: string; // e.g., "AUTH_FAILED", "NOT_FOUND"
  message: string; // Human-readable error message
  details?: any; // Additional error context
  statusCode?: number; // HTTP status code
  field?: string; // For validation errors, which field failed
  retryable?: boolean; // Whether the client should retry
}

// ============================================
// PAGINATION TYPES
// ============================================

/**
 * Paginated Response for Lists
 * Used for endpoints that return multiple items (matches, posts, etc.)
 *
 * @example
 * const matches: PaginatedResponse<Match> = await matchService.getMatches({ page: 1 });
 * console.log(matches.items);     // Array of matches
 * console.log(matches.hasMore);   // Whether more pages exist
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
  hasMore: boolean;
  totalCount?: number;
}

/**
 * Pagination Metadata
 * Information about the current page and how to fetch more
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalPages?: number;
  cursor?: string; // For cursor-based pagination
  nextCursor?: string; // Cursor for next page
  prevCursor?: string; // Cursor for previous page
}

/**
 * Pagination Request Parameters
 * Standard way to request paginated data
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// REQUEST TYPES
// ============================================

/**
 * Standard Query Parameters
 * Common parameters for filtering and searching
 */
export interface QueryParams extends PaginationParams {
  search?: string;
  filters?: Record<string, any>;
  include?: string[]; // Relations to include
  fields?: string[]; // Specific fields to return
}

/**
 * Batch Request
 * For operations that affect multiple items
 */
export interface BatchRequest<T> {
  ids: string[];
  operation: 'update' | 'delete';
  data?: Partial<T>;
}

/**
 * Batch Response
 * Results of batch operations
 */
export interface BatchResponse {
  successful: string[];
  failed: Array<{
    id: string;
    error: ApiError;
  }>;
  totalProcessed: number;
}

// ============================================
// REAL-TIME/SUBSCRIPTION TYPES
// ============================================

/**
 * Real-time Event
 * Structure for real-time updates via Supabase
 */
export interface RealtimeEvent<T> {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: T;
  oldRecord?: T;
  timestamp: string;
}

/**
 * Subscription Response
 * Wrapper for real-time subscription data
 */
export interface SubscriptionResponse<T> {
  channel: string;
  event: RealtimeEvent<T>;
}

// ============================================
// FILE UPLOAD TYPES
// ============================================

/**
 * File Upload Response
 * Standard response when uploading files
 */
export interface FileUploadResponse {
  url: string;
  publicUrl: string;
  path: string;
  size: number;
  mimeType: string;
  metadata?: Record<string, any>;
}

/**
 * File Upload Progress
 * Track upload progress for UI feedback
 */
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// ============================================
// AUTHENTICATION TYPES
// ============================================

/**
 * Auth Response
 * Standard response for authentication operations
 */
export interface AuthResponse {
  user: any; // Will be replaced with User type from models.ts
  session: Session | null;
  error: ApiError | null;
}

/**
 * Session Information
 */
export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: number;
  user: any; // Will be replaced with User type
}

// ============================================
// LOADING STATES
// ============================================

/**
 * Async State
 * Represents the state of an async operation
 * Useful for managing loading states in components
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  lastFetch?: string;
}

/**
 * Mutation State
 * For operations that modify data (create, update, delete)
 */
export interface MutationState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  variables?: any; // The input that triggered the mutation
}

// ============================================
// VALIDATION TYPES
// ============================================

/**
 * Validation Error
 * Detailed validation errors from the server
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

/**
 * Validation Response
 * Response when validation fails
 */
export interface ValidationResponse {
  valid: boolean;
  errors: ValidationError[];
}

// ============================================
// SEARCH/FILTER TYPES
// ============================================

/**
 * Search Request
 * Standard search parameters
 */
export interface SearchRequest {
  query: string;
  filters?: SearchFilters;
  pagination?: PaginationParams;
}

/**
 * Search Filters
 * Common filters for search operations
 */
export interface SearchFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  categories?: string[];
  tags?: string[];
  status?: string[];
  [key: string]: any; // Allow custom filters
}

/**
 * Search Response
 * Results from a search operation
 */
export interface SearchResponse<T> extends PaginatedResponse<T> {
  query: string;
  suggestions?: string[];
  facets?: Record<string, number>; // e.g., { "category": { "sports": 10, "gaming": 5 } }
}

// ============================================
// COMMON ERROR CODES
// ============================================

/**
 * Standard Error Codes
 * Use these constants for consistent error handling
 */
export const ErrorCodes = {
  // Authentication
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_INVALID: 'AUTH_INVALID',
  AUTH_EXPIRED: 'AUTH_EXPIRED',

  // Authorization
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  FORBIDDEN: 'FORBIDDEN',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',

  // Validation
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_INPUT: 'INVALID_INPUT',

  // Rate limiting
  RATE_LIMITED: 'RATE_LIMITED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',

  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',

  // Network
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
} as const;

// ============================================
// HELPER TYPES
// ============================================

/**
 * Extract data type from ApiResponse
 * Useful for type inference
 *
 * @example
 * type UserData = ApiResponseData<ApiResponse<User>>; // User
 */
export type ApiResponseData<T> = T extends ApiResponse<infer U> ? U : never;

/**
 * Make all properties optional except the ones specified
 * Useful for update operations
 */
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

/**
 * Response status type
 */
export type ResponseStatus = 'idle' | 'loading' | 'success' | 'error';

// ============================================
// SUPABASE SPECIFIC TYPES
// ============================================

/**
 * Supabase Query Response
 * Matches Supabase's response structure
 */
export interface SupabaseResponse<T> {
  data: T | null;
  error: any | null;
  count?: number;
  status: number;
  statusText: string;
}

/**
 * Supabase Realtime Payload
 */
export interface SupabaseRealtimePayload<T> {
  commit_timestamp: string;
  errors: any[] | null;
  new: T;
  old: T | null;
  schema: string;
  table: string;
  type: 'INSERT' | 'UPDATE' | 'DELETE';
}
