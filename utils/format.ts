// utils/format.ts

/**
 * Converts a date into a relative time string like "2 hours ago" or "in 5 minutes"
 * @param date - The date to format
 * @param baseDate - Optional base date to compare against (defaults to now)
 * @returns Formatted relative time string
 */
export const formatRelativeTime = (date: Date, baseDate?: Date): string => {
  const now = baseDate || new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const absDiff = Math.abs(diffInSeconds);

  // Define time intervals in seconds
  const intervals = {
    year: 31536000, // 365 * 24 * 60 * 60
    month: 2592000, // 30 * 24 * 60 * 60
    week: 604800, // 7 * 24 * 60 * 60
    day: 86400, // 24 * 60 * 60
    hour: 3600, // 60 * 60
    minute: 60,
    second: 1,
  };

  // Handle "just now" case
  if (absDiff < 30) {
    return 'just now';
  }

  // Find the appropriate interval
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const intervalCount = Math.floor(absDiff / secondsInUnit);

    if (intervalCount >= 1) {
      const plural = intervalCount > 1 ? 's' : '';
      const timeString = `${intervalCount} ${unit}${plural}`;

      // Return past or future format
      return diffInSeconds > 0 ? `${timeString} ago` : `in ${timeString}`;
    }
  }

  return 'just now';
};

/**
 * Truncates long player names for display in compact UIs
 * @param name - The player name to format
 * @param maxLength - Maximum length before truncation (default: 12)
 * @param ellipsis - String to append when truncated (default: '...')
 * @returns Formatted player name
 */
export const formatPlayerName = (
  name: string,
  maxLength: number = 12,
  ellipsis: string = '...'
): string => {
  if (!name || typeof name !== 'string') {
    return 'Unknown Player';
  }

  const trimmedName = name.trim();

  if (trimmedName.length <= maxLength) {
    return trimmedName;
  }

  // Truncate and add ellipsis
  return trimmedName.substring(0, maxLength - ellipsis.length) + ellipsis;
};

/**
 * Returns the correct singular or plural word form based on a count
 * @param count - The count to determine plurality
 * @param singular - The singular form of the word
 * @param plural - The plural form of the word (optional, defaults to singular + 's')
 * @returns The appropriate word form
 */
export const pluralize = (
  count: number,
  singular: string,
  plural?: string
): string => {
  if (count === 1) {
    return singular;
  }

  return plural || `${singular}s`;
};

/**
 * Formats a number with appropriate separators and decimal places
 * @param num - The number to format
 * @param decimals - Number of decimal places (default: 0)
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted number string
 */
export const formatNumber = (
  num: number,
  decimals: number = 0,
  locale: string = 'en-US'
): string => {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0';
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

/**
 * Formats a percentage with proper decimal places
 * @param value - The decimal value (e.g., 0.754 for 75.4%)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string with % symbol
 */
export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0.0%';
  }

  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Formats a duration in seconds into a human-readable string
 * @param seconds - Duration in seconds
 * @param showSeconds - Whether to include seconds in the output (default: true)
 * @returns Formatted duration string (e.g., "2h 30m 15s", "1m 45s", "30s")
 */
export const formatDuration = (
  seconds: number,
  showSeconds: boolean = true
): string => {
  if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
    return '0s';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }

  if (showSeconds && (remainingSeconds > 0 || parts.length === 0)) {
    parts.push(`${remainingSeconds}s`);
  }

  return parts.join(' ');
};

/**
 * Formats a score in the format "TeamA vs TeamB" or just the score numbers
 * @param scoreA - Score for team A
 * @param scoreB - Score for team B
 * @param teamAName - Optional name for team A
 * @param teamBName - Optional name for team B
 * @returns Formatted score string
 */
export const formatScore = (
  scoreA: number,
  scoreB: number,
  teamAName?: string,
  teamBName?: string
): string => {
  const scoreString = `${scoreA} - ${scoreB}`;

  if (teamAName && teamBName) {
    return `${teamAName} ${scoreString} ${teamBName}`;
  }

  return scoreString;
};

/**
 * Formats a date into a localized short date string
 * @param date - The date to format
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted date string (e.g., "12/31/2023", "31/12/2023")
 */
export const formatDate = (date: Date, locale: string = 'en-US'): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(date);
};

/**
 * Formats a date and time into a localized string
 * @param date - The date to format
 * @param locale - Locale for formatting (default: 'en-US')
 * @param includeSeconds - Whether to include seconds (default: false)
 * @returns Formatted date and time string
 */
export const formatDateTime = (
  date: Date,
  locale: string = 'en-US',
  includeSeconds: boolean = false
): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    ...(includeSeconds && { second: '2-digit' }),
  }).format(date);
};

/**
 * Capitalizes the first letter of a string
 * @param str - The string to capitalize
 * @returns String with first letter capitalized
 */
export const capitalize = (str: string): string => {
  if (!str || typeof str !== 'string') {
    return '';
  }

  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Formats a player's achievement tier with appropriate styling
 * @param tier - The achievement tier (Bronze, Silver, Gold, Diamond, Master)
 * @returns Formatted tier string
 */
export const formatAchievementTier = (tier: string): string => {
  if (!tier || typeof tier !== 'string') {
    return 'None';
  }

  return capitalize(tier);
};

/**
 * Truncates text with word boundaries preserved when possible
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @param ellipsis - String to append when truncated (default: '...')
 * @returns Truncated text
 */
export const truncateText = (
  text: string,
  maxLength: number,
  ellipsis: string = '...'
): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  if (text.length <= maxLength) {
    return text;
  }

  // Try to break at word boundary
  const truncated = text.substring(0, maxLength - ellipsis.length);
  const lastSpaceIndex = truncated.lastIndexOf(' ');

  // If we found a space and it's not too close to the beginning, break there
  if (lastSpaceIndex > maxLength * 0.6) {
    return truncated.substring(0, lastSpaceIndex) + ellipsis;
  }

  // Otherwise, hard truncate
  return truncated + ellipsis;
};
