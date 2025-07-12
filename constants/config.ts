// constants/config.ts

// API Configuration
export const API_CONFIG = {
  // Supabase configuration
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',

  // API timeouts (in milliseconds)
  TIMEOUT: 30000, // 30 seconds
  UPLOAD_TIMEOUT: 300000, // 5 minutes for file uploads

  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second base delay

  // API versioning
  API_VERSION: 'v1',

  // Real-time configuration
  REALTIME: {
    HEARTBEAT_INTERVAL: 30000, // 30 seconds
    RECONNECT_INTERVAL: 5000, // 5 seconds
    MAX_RECONNECT_ATTEMPTS: 5,
  },
};

// Storage Configuration
export const STORAGE_CONFIG = {
  // Bucket names
  BUCKETS: {
    AVATARS: 'avatars',
    MATCH_MEDIA: 'match-media',
    COMMUNITY_MEDIA: 'community-media',
    POST_ATTACHMENTS: 'post-attachments',
  },

  // File size limits (in bytes)
  MAX_FILE_SIZE: {
    AVATAR: 5 * 1024 * 1024, // 5MB
    IMAGE: 10 * 1024 * 1024, // 10MB
    VIDEO: 100 * 1024 * 1024, // 100MB
    DOCUMENT: 25 * 1024 * 1024, // 25MB
  },

  // Allowed file types (optimized for mobile uploads)
  ALLOWED_FILE_TYPES: {
    AVATAR: [
      'image/jpeg', // Standard JPEG
      'image/jpg', // Alternative JPEG
      'image/png', // PNG files
      'image/heic', // iOS 11+ default format
      'image/heif', // High Efficiency Image Format
      'image/webp', // Android camera format
    ],
    IMAGE: [
      'image/jpeg', // Standard JPEG
      'image/jpg', // Alternative JPEG
      'image/png', // PNG files
      'image/heic', // iOS 11+ default format
      'image/heif', // High Efficiency Image Format
      'image/webp', // Android camera format
      'image/gif', // Animated GIFs
      'image/bmp', // Bitmap (some Android devices)
    ],
    VIDEO: [
      'video/mp4', // Standard format (both iOS & Android)
      'video/quicktime', // iOS .mov files
      'video/x-m4v', // Apple video format
      'video/3gpp', // 3GP format (some Android devices)
      'video/3gpp2', // 3GP2 format
      'video/mpeg', // MPEG format
      'video/webm', // WebM format (some Android devices)
    ],
    DOCUMENT: [
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    ],
  },

  // Image compression settings
  IMAGE_COMPRESSION: {
    QUALITY: 0.8,
    MAX_WIDTH: 1920,
    MAX_HEIGHT: 1080,
    THUMBNAIL_SIZE: 200,
    // HEIC/HEIF conversion settings
    CONVERT_HEIC_TO_JPEG: true, // Convert iOS HEIC files to JPEG for compatibility
    HEIC_CONVERSION_QUALITY: 0.9, // Higher quality for HEIC conversion
  },

  // Storage URLs
  PUBLIC_URL: `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`,
};

// Pagination Configuration
export const PAGINATION_CONFIG = {
  // Default page sizes
  DEFAULT_PAGE_SIZE: 20,

  // Page size options
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],

  // Maximum allowed page size
  MAX_PAGE_SIZE: 100,

  // Specific page sizes for different contexts
  FEED_PAGE_SIZE: 20,
  COMMENTS_PAGE_SIZE: 10,
  MATCHES_PAGE_SIZE: 15,
  LEADERBOARD_PAGE_SIZE: 50,
  SEARCH_RESULTS_PAGE_SIZE: 25,

  // Infinite scroll
  INFINITE_SCROLL_THRESHOLD: 0.8, // Load more when 80% scrolled
};

// App Configuration
export const APP_CONFIG = {
  // App metadata
  NAME: 'DieStats', // Hardcoded since it won't change
  VERSION: '1.0.0', // Update this manually when releasing
  ENVIRONMENT: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development', // This should vary

  // Feature flags
  FEATURES: {
    OFFLINE_MODE: true,
    PUSH_NOTIFICATIONS: true,
    ANALYTICS: true,
    SOCIAL_FEATURES: true,
    EXPORT_DATA: true,
    CAMERA_UPLOAD: true,
  },

  // Deep linking
  DEEP_LINK_PREFIX: 'diestats://',
  UNIVERSAL_LINK_DOMAIN: 'https://diestats.app',

  // Cache configuration
  CACHE: {
    ENABLED: true,
    DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
    USER_DATA_TTL: 10 * 60 * 1000, // 10 minutes
    STATIC_DATA_TTL: 60 * 60 * 1000, // 1 hour
  },
};

// Match Configuration
export const MATCH_CONFIG = {
  // Match settings
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 20,
  DEFAULT_SCORE_LIMIT: 21,
  DEFAULT_TIME_LIMIT: null, // No time limit by default

  // ShortID configuration (Letter-6digits format)
  SHORT_ID_FORMAT: 'L-NNNNNN', // L = Letter, N = Number
  SHORT_ID_PATTERN: /^[A-Z]-\d{6}$/,
  SHORT_ID_LETTERS: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',

  // Match expiry
  ACTIVE_MATCH_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours for active matches

  // Match states
  IDLE_TIMEOUT: 30 * 60 * 1000, // 30 minutes of inactivity

  // Scoring
  SCORE_TYPES: ['points', 'rounds', 'time'],
  DEFAULT_SCORE_TYPE: 'points',
};

// Social Configuration
export const SOCIAL_CONFIG = {
  // Community settings
  MAX_COMMUNITY_NAME_LENGTH: 50,
  MAX_COMMUNITY_DESCRIPTION_LENGTH: 500,
  MIN_COMMUNITY_MEMBERS: 1,
  MAX_COMMUNITY_MEMBERS: 10000,

  // Post settings
  MAX_POST_LENGTH: 1000,
  MAX_COMMENT_LENGTH: 500,
  MAX_POST_ATTACHMENTS: 10,

  // Friend system
  MAX_FRIENDS: 5000,
  MAX_PENDING_REQUESTS: 100,

  // User profile
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  BIO_MAX_LENGTH: 160,
};

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  // Tracking settings
  ENABLED: process.env.EXPO_PUBLIC_ENVIRONMENT === 'production',

  // Event batching
  BATCH_SIZE: 10,
  BATCH_INTERVAL: 30000, // 30 seconds

  // Session tracking
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes

  // Performance monitoring
  PERFORMANCE_SAMPLING_RATE: 0.1, // 10% of sessions
};

// Notification Configuration
export const NOTIFICATION_CONFIG = {
  // Push notification settings
  EXPO_PUSH_TOKEN_ENDPOINT: 'https://exp.host/--/api/v2/push/send',

  // In-app notification settings
  MAX_IN_APP_NOTIFICATIONS: 50,
  NOTIFICATION_DISPLAY_DURATION: 5000, // 5 seconds

  // Notification categories
  CATEGORIES: {
    MATCH: {
      INVITE: 'match_invite',
      START: 'match_start',
      END: 'match_end',
      UPDATE: 'match_update',
    },
    SOCIAL: {
      FRIEND_REQUEST: 'friend_request',
      POST_LIKE: 'post_like',
      POST_COMMENT: 'post_comment',
      MENTION: 'mention',
    },
    ACHIEVEMENT: {
      UNLOCKED: 'achievement_unlocked',
      PROGRESS: 'achievement_progress',
    },
  },
};

// Security Configuration
export const SECURITY_CONFIG = {
  // Password requirements
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBER: true,
  PASSWORD_REQUIRE_SPECIAL: false,

  // Session management
  SESSION_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 days
  REFRESH_TOKEN_THRESHOLD: 60 * 60 * 1000, // Refresh if expires in 1 hour

  // Rate limiting
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes

  // Content moderation
  PROFANITY_CHECK: true,
  MAX_REPORT_REASONS_LENGTH: 500,
};

// Error Monitoring Configuration (Sentry) - FIXED!
export const ERROR_MONITORING_CONFIG = {
  // Sentry configuration
  SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN || '',

  // Error reporting settings - CHANGED: Now enabled in development too!
  ENABLED: true, // Always enabled
  ENABLE_IN_DEV: true, // Enabled in development for testing

  // Sample rates
  TRACES_SAMPLE_RATE:
    process.env.EXPO_PUBLIC_ENVIRONMENT === 'production' ? 0.1 : 1.0,
  PROFILES_SAMPLE_RATE:
    process.env.EXPO_PUBLIC_ENVIRONMENT === 'production' ? 0.1 : 1.0,

  // Session configuration
  AUTO_SESSION_TRACKING: true,
  ENABLE_NATIVE_CRASHES: true,

  // Performance monitoring
  ENABLE_AUTO_PERFORMANCE_TRACING: true,
  ENABLE_USER_INTERACTION_TRACING: true,

  // Debug settings
  DEBUG: process.env.EXPO_PUBLIC_ENVIRONMENT !== 'production',

  // Additional context
  ENVIRONMENT: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development',
  RELEASE: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
} as const;

// Development Configuration
export const DEV_CONFIG = {
  // Development tools
  ENABLE_LOGS: process.env.EXPO_PUBLIC_ENVIRONMENT !== 'production',
  LOG_LEVEL:
    process.env.EXPO_PUBLIC_ENVIRONMENT === 'production' ? 'error' : 'debug',

  // Mock data
  USE_MOCK_DATA: false,
  MOCK_DELAY: 1000, // 1 second delay for mock requests

  // Developer options
  SHOW_PERFORMANCE_MONITOR: __DEV__,
  ENABLE_NETWORK_INSPECTOR: __DEV__,
};

// Validate required configuration
const validateConfig = () => {
  const errors: string[] = [];

  if (!API_CONFIG.SUPABASE_URL) {
    errors.push('EXPO_PUBLIC_SUPABASE_URL is required');
  }

  if (!API_CONFIG.SUPABASE_ANON_KEY) {
    errors.push('EXPO_PUBLIC_SUPABASE_ANON_KEY is required');
  }

  // Add Sentry DSN validation
  if (ERROR_MONITORING_CONFIG.ENABLED && !ERROR_MONITORING_CONFIG.SENTRY_DSN) {
    console.warn('EXPO_PUBLIC_SENTRY_DSN is missing - Sentry will not work');
  }

  if (errors.length > 0) {
    console.error('Configuration errors:', errors);
    if (process.env.EXPO_PUBLIC_ENVIRONMENT === 'production') {
      throw new Error('Missing required configuration');
    }
  }
};

// Run validation
validateConfig();

// Export all configs as a single object for convenience
export const CONFIG = {
  API: API_CONFIG,
  STORAGE: STORAGE_CONFIG,
  PAGINATION: PAGINATION_CONFIG,
  APP: APP_CONFIG,
  MATCH: MATCH_CONFIG,
  SOCIAL: SOCIAL_CONFIG,
  ANALYTICS: ANALYTICS_CONFIG,
  NOTIFICATION: NOTIFICATION_CONFIG,
  SECURITY: SECURITY_CONFIG,
  DEV: DEV_CONFIG,
  ERROR_MONITORING: ERROR_MONITORING_CONFIG,
} as const;
