// utils/validation.ts

import {
  SECURITY_CONFIG,
  STORAGE_CONFIG,
  SOCIAL_CONFIG,
  MATCH_CONFIG,
} from '../constants/config';

// Validation result interface for consistent return types
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  details?: string[];
}

// Email validation regex - RFC 5322 compliant but practical
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Username validation regex - alphanumeric, underscores, hyphens
const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

// Room code regex - uses pattern from config
const ROOM_CODE_REGEX = MATCH_CONFIG.SHORT_ID_PATTERN;

/**
 * Validates email format
 * @param email - The email string to validate
 * @returns ValidationResult with isValid flag and optional error message
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      error: 'Email is required',
    };
  }

  const trimmedEmail = email.trim().toLowerCase();

  if (trimmedEmail.length === 0) {
    return {
      isValid: false,
      error: 'Email cannot be empty',
    };
  }

  if (trimmedEmail.length > 254) {
    return {
      isValid: false,
      error: 'Email is too long (maximum 254 characters)',
    };
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address',
    };
  }

  return { isValid: true };
};

/**
 * Validates password strength based on security requirements
 * @param password - The password string to validate
 * @returns ValidationResult with detailed validation information
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      error: 'Password is required',
    };
  }

  const errors: string[] = [];

  // Minimum length check (from config)
  if (password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
    errors.push(
      `Password must be at least ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters long`
    );
  }

  // Maximum length check (reasonable upper limit)
  if (password.length > 128) {
    errors.push('Password is too long (maximum 128 characters)');
  }

  // Uppercase letter requirement (from config)
  if (SECURITY_CONFIG.PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Lowercase letter requirement (from config)
  if (SECURITY_CONFIG.PASSWORD_REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Number requirement (from config)
  if (SECURITY_CONFIG.PASSWORD_REQUIRE_NUMBER && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Special character requirement (from config)
  if (
    SECURITY_CONFIG.PASSWORD_REQUIRE_SPECIAL &&
    !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  ) {
    errors.push('Password must contain at least one special character');
  }

  // Common password checks
  const commonPasswords = [
    'password',
    '123456',
    '123456789',
    'qwerty',
    'abc123',
    'password123',
    'admin',
    'letmein',
    'welcome',
    'monkey',
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common, please choose a different one');
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      error: 'Password does not meet security requirements',
      details: errors,
    };
  }

  return { isValid: true };
};

/**
 * Removes potentially harmful characters from user input
 * @param text - The input text to sanitize
 * @param options - Sanitization options
 * @returns Sanitized text string
 */
export const sanitizeInput = (
  text: string,
  options: {
    allowHTML?: boolean;
    maxLength?: number;
    trimWhitespace?: boolean;
    removeLineBreaks?: boolean;
  } = {}
): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  let sanitized = text;

  // Trim whitespace if enabled (default: true)
  if (options.trimWhitespace !== false) {
    sanitized = sanitized.trim();
  }

  // Remove HTML tags unless explicitly allowed
  if (!options.allowHTML) {
    // Remove HTML tags but preserve content
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // Decode common HTML entities
    sanitized = sanitized
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/');
  }

  // Remove line breaks if specified
  if (options.removeLineBreaks) {
    sanitized = sanitized.replace(/[\r\n]/g, ' ');
  }

  // Remove null bytes and other potentially dangerous characters
  sanitized = sanitized.replace(/\0/g, '');

  // Truncate to max length if specified
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }

  return sanitized;
};

/**
 * Validates username format and requirements
 * @param username - The username to validate
 * @returns ValidationResult with validation information
 */
export const validateUsername = (username: string): ValidationResult => {
  if (!username || typeof username !== 'string') {
    return {
      isValid: false,
      error: 'Username is required',
    };
  }

  const trimmedUsername = username.trim();

  // Length checks (from config)
  if (trimmedUsername.length < SOCIAL_CONFIG.USERNAME_MIN_LENGTH) {
    return {
      isValid: false,
      error: `Username must be at least ${SOCIAL_CONFIG.USERNAME_MIN_LENGTH} characters long`,
    };
  }

  if (trimmedUsername.length > SOCIAL_CONFIG.USERNAME_MAX_LENGTH) {
    return {
      isValid: false,
      error: `Username must be no more than ${SOCIAL_CONFIG.USERNAME_MAX_LENGTH} characters long`,
    };
  }

  // Format validation
  if (!USERNAME_REGEX.test(trimmedUsername)) {
    return {
      isValid: false,
      error:
        'Username can only contain letters, numbers, underscores, and hyphens',
    };
  }

  // Reserved usernames
  const reservedUsernames = [
    'admin',
    'root',
    'moderator',
    'support',
    'help',
    'api',
    'www',
    'mail',
    'ftp',
    'localhost',
    'diestats',
  ];

  if (reservedUsernames.includes(trimmedUsername.toLowerCase())) {
    return {
      isValid: false,
      error: 'This username is reserved and cannot be used',
    };
  }

  return { isValid: true };
};

/**
 * Validates room code format (L-NNNNNN)
 * @param roomCode - The room code to validate
 * @returns ValidationResult with validation information
 */
export const validateRoomCode = (roomCode: string): ValidationResult => {
  if (!roomCode || typeof roomCode !== 'string') {
    return {
      isValid: false,
      error: 'Room code is required',
    };
  }

  const trimmedCode = roomCode.trim().toUpperCase();

  if (!ROOM_CODE_REGEX.test(trimmedCode)) {
    return {
      isValid: false,
      error: 'Room code must be in format: Letter-6digits (e.g., A-123456)',
    };
  }

  return { isValid: true };
};

/**
 * Validates match title
 * @param title - The match title to validate
 * @returns ValidationResult with validation information
 */
export const validateMatchTitle = (title: string): ValidationResult => {
  if (!title || typeof title !== 'string') {
    return {
      isValid: false,
      error: 'Match title is required',
    };
  }

  const sanitizedTitle = sanitizeInput(title, { maxLength: 100 });

  if (sanitizedTitle.length < 3) {
    return {
      isValid: false,
      error: 'Match title must be at least 3 characters long',
    };
  }

  if (sanitizedTitle.length > 100) {
    return {
      isValid: false,
      error: 'Match title must be no more than 100 characters long',
    };
  }

  return { isValid: true };
};

/**
 * Validates community name
 * @param name - The community name to validate
 * @returns ValidationResult with validation information
 */
export const validateCommunityName = (name: string): ValidationResult => {
  if (!name || typeof name !== 'string') {
    return {
      isValid: false,
      error: 'Community name is required',
    };
  }

  const sanitizedName = sanitizeInput(name, {
    maxLength: SOCIAL_CONFIG.MAX_COMMUNITY_NAME_LENGTH,
  });

  if (sanitizedName.length < 3) {
    return {
      isValid: false,
      error: 'Community name must be at least 3 characters long',
    };
  }

  if (sanitizedName.length > SOCIAL_CONFIG.MAX_COMMUNITY_NAME_LENGTH) {
    return {
      isValid: false,
      error: `Community name must be no more than ${SOCIAL_CONFIG.MAX_COMMUNITY_NAME_LENGTH} characters long`,
    };
  }

  return { isValid: true };
};

/**
 * Validates post content
 * @param content - The post content to validate
 * @returns ValidationResult with validation information
 */
export const validatePostContent = (content: string): ValidationResult => {
  if (!content || typeof content !== 'string') {
    return {
      isValid: false,
      error: 'Post content is required',
    };
  }

  const sanitizedContent = sanitizeInput(content, {
    maxLength: SOCIAL_CONFIG.MAX_POST_LENGTH,
    trimWhitespace: true,
  });

  if (sanitizedContent.length < 1) {
    return {
      isValid: false,
      error: 'Post content cannot be empty',
    };
  }

  if (sanitizedContent.length > SOCIAL_CONFIG.MAX_POST_LENGTH) {
    return {
      isValid: false,
      error: `Post content must be no more than ${SOCIAL_CONFIG.MAX_POST_LENGTH} characters long`,
    };
  }

  return { isValid: true };
};

/**
 * Validates file upload constraints
 * @param file - File object or file info
 * @param type - Type of file upload ('avatar', 'image', 'video', 'document')
 * @returns ValidationResult with validation information
 */
export const validateFileUpload = (
  file: { size: number; type: string; name?: string },
  type: 'avatar' | 'image' | 'video' | 'document'
): ValidationResult => {
  if (!file) {
    return {
      isValid: false,
      error: 'File is required',
    };
  }

  // File size limits (from config)
  const maxSizes = {
    avatar: STORAGE_CONFIG.MAX_FILE_SIZE.AVATAR,
    image: STORAGE_CONFIG.MAX_FILE_SIZE.IMAGE,
    video: STORAGE_CONFIG.MAX_FILE_SIZE.VIDEO,
    document: STORAGE_CONFIG.MAX_FILE_SIZE.DOCUMENT,
  };

  // Allowed file types (from config)
  const allowedTypes = {
    avatar: STORAGE_CONFIG.ALLOWED_FILE_TYPES.AVATAR,
    image: STORAGE_CONFIG.ALLOWED_FILE_TYPES.IMAGE,
    video: STORAGE_CONFIG.ALLOWED_FILE_TYPES.VIDEO,
    document: STORAGE_CONFIG.ALLOWED_FILE_TYPES.DOCUMENT,
  };

  // Check file size
  if (file.size > maxSizes[type]) {
    const maxSizeMB = Math.round(maxSizes[type] / (1024 * 1024));
    return {
      isValid: false,
      error: `File size exceeds the ${maxSizeMB}MB limit for ${type} uploads`,
    };
  }

  // Check file type
  if (!allowedTypes[type].includes(file.type)) {
    return {
      isValid: false,
      error: `File type '${file.type}' is not allowed for ${type} uploads`,
    };
  }

  return { isValid: true };
};

/**
 * Validates score value
 * @param score - The score to validate
 * @returns ValidationResult with validation information
 */
export const validateScore = (score: number): ValidationResult => {
  if (typeof score !== 'number' || isNaN(score)) {
    return {
      isValid: false,
      error: 'Score must be a valid number',
    };
  }

  if (score < 0) {
    return {
      isValid: false,
      error: 'Score cannot be negative',
    };
  }

  if (score > 999) {
    return {
      isValid: false,
      error: 'Score cannot exceed 999',
    };
  }

  if (!Number.isInteger(score)) {
    return {
      isValid: false,
      error: 'Score must be a whole number',
    };
  }

  return { isValid: true };
};

/**
 * Validates that a string contains no profanity
 * @param text - The text to check
 * @returns ValidationResult with validation information
 */
export const validateProfanity = (text: string): ValidationResult => {
  if (!text || typeof text !== 'string') {
    return { isValid: true };
  }

  // Basic profanity filter - in production, use a more sophisticated service
  const profanityWords = [
    // Add common profanity words here - keeping this minimal for example
    'spam',
    'scam',
    'fake',
    'cheat',
    'hack',
  ];

  const lowerText = text.toLowerCase();
  const foundProfanity = profanityWords.find((word) =>
    lowerText.includes(word)
  );

  if (foundProfanity) {
    return {
      isValid: false,
      error: 'Content contains inappropriate language',
    };
  }

  return { isValid: true };
};

/**
 * Validates form data using multiple validation functions
 * @param data - Object containing form data
 * @param validators - Object mapping field names to validation functions
 * @returns Object with validation results for each field
 */
export const validateForm = <T extends Record<string, any>>(
  data: T,
  validators: Record<keyof T, (value: any) => ValidationResult>
): Record<keyof T, ValidationResult> => {
  const results = {} as Record<keyof T, ValidationResult>;

  for (const [field, validator] of Object.entries(validators)) {
    const fieldKey = field as keyof T;
    results[fieldKey] = validator(data[fieldKey]);
  }

  return results;
};

/**
 * Checks if all validation results are valid
 * @param results - Validation results object
 * @returns True if all validations passed
 */
export const isFormValid = (
  results: Record<string, ValidationResult>
): boolean => {
  return Object.values(results).every((result) => result.isValid);
};
