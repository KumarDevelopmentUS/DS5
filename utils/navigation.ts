// utils/navigation.ts

import {
  MATCH_ROUTES,
  SOCIAL_ROUTES,
  ANALYTICS_ROUTES,
  DEEP_LINKS,
  routeValidation,
} from '../constants/routes';
import { APP_CONFIG } from '../constants/config';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ParsedDeepLink {
  scheme: string;
  host?: string;
  path: string;
  params: Record<string, string>;
  routeName: string;
  isValid: boolean;
}

export interface ShareLinkOptions {
  title?: string;
  description?: string;
  imageUrl?: string;
  includeUniversalLink?: boolean;
  includeDeepLink?: boolean;
}

export type ShareableResourceType =
  | 'match'
  | 'profile'
  | 'post'
  | 'community'
  | 'friend_request';

export interface NavigationParams {
  [key: string]: string | number | boolean | undefined;
}

interface RouteConfig {
  pathBuilder: (id: string, subRoute?: string) => string;
  validator: (id: string) => boolean;
  defaultTitle: string;
  defaultDescription: string;
  deepLinkBuilder: (id: string) => string;
}

// ============================================
// CONFIGURATION OBJECTS (DRY Implementation)
// ============================================

/**
 * Centralized route parsing configuration
 */
const ROUTE_PARSERS: Record<
  string,
  (segments: string[]) => { routeName: string; isValid: boolean }
> = {
  match: (segments) => parseGenericRoute(segments, MATCH_ROUTE_CONFIG),
  profile: (segments) => parseGenericRoute(segments, PROFILE_ROUTE_CONFIG),
  post: (segments) => parseGenericRoute(segments, POST_ROUTE_CONFIG),
  community: (segments) => parseGenericRoute(segments, COMMUNITY_ROUTE_CONFIG),
  friend: (segments) => parseGenericRoute(segments, FRIEND_ROUTE_CONFIG),
};

/**
 * Route configuration objects
 */
const MATCH_ROUTE_CONFIG: RouteConfig = {
  pathBuilder: (id: string, subRoute?: string) => {
    switch (subRoute) {
      case 'stats':
        return MATCH_ROUTES.stats(id);
      case 'recap':
        return MATCH_ROUTES.recap(id);
      case 'history':
        return MATCH_ROUTES.history(id);
      default:
        return MATCH_ROUTES.live(id);
    }
  },
  validator: routeValidation.isValidMatchId,
  defaultTitle: 'Join my DieStats match!',
  defaultDescription: 'Come watch or join this match on DieStats',
  deepLinkBuilder: DEEP_LINKS.MATCH_VIEW,
};

const PROFILE_ROUTE_CONFIG: RouteConfig = {
  pathBuilder: (id: string) => ANALYTICS_ROUTES.player(id),
  validator: routeValidation.isValidUsername,
  defaultTitle: 'Check out this DieStats profile!',
  defaultDescription: 'View stats and achievements on DieStats',
  deepLinkBuilder: DEEP_LINKS.PROFILE_SHARE,
};

const POST_ROUTE_CONFIG: RouteConfig = {
  pathBuilder: (id: string) => SOCIAL_ROUTES.post(id),
  validator: routeValidation.isValidUUID,
  defaultTitle: 'Check out this DieStats post!',
  defaultDescription: "See what's happening in the DieStats community",
  deepLinkBuilder: DEEP_LINKS.POST_SHARE,
};

const COMMUNITY_ROUTE_CONFIG: RouteConfig = {
  pathBuilder: (id: string) => SOCIAL_ROUTES.community(id),
  validator: routeValidation.isValidUUID,
  defaultTitle: 'Join our DieStats community!',
  defaultDescription: 'Join the community and connect with other players',
  deepLinkBuilder: DEEP_LINKS.COMMUNITY_INVITE,
};

const FRIEND_ROUTE_CONFIG: RouteConfig = {
  pathBuilder: (id: string) => SOCIAL_ROUTES.friendProfile(id),
  validator: routeValidation.isValidUUID,
  defaultTitle: 'Add me as a friend on DieStats!',
  defaultDescription: 'Connect with me and track our games together',
  deepLinkBuilder: DEEP_LINKS.FRIEND_REQUEST,
};

// ============================================
// UTILITY HELPERS (DRY Implementation)
// ============================================

/**
 * Generic URL construction helper
 */
const buildUrls = (
  deepLinkPath: string
): { deepLink: string; universalLink: string } => ({
  deepLink: `${APP_CONFIG.DEEP_LINK_PREFIX}${deepLinkPath}`,
  universalLink: `${APP_CONFIG.UNIVERSAL_LINK_DOMAIN}/${deepLinkPath}`,
});

/**
 * Generic route parsing logic
 */
const parseGenericRoute = (
  segments: string[],
  config: RouteConfig
): { routeName: string; isValid: boolean } => {
  if (segments.length === 0) return { routeName: '', isValid: false };

  const [actionOrId, id, ...rest] = segments;

  // Handle action-based routes (join, add, etc.)
  if ((actionOrId === 'join' || actionOrId === 'add') && id) {
    return {
      routeName: config.pathBuilder(id),
      isValid: config.validator(id),
    };
  }

  // Handle direct ID routes
  if (actionOrId) {
    const subRoute = rest[0];
    return {
      routeName: config.pathBuilder(actionOrId, subRoute),
      isValid: config.validator(actionOrId),
    };
  }

  return { routeName: '', isValid: false };
};

/**
 * Generic share data builder
 */
const buildShareData = (
  config: RouteConfig,
  id: string,
  options: ShareLinkOptions,
  shareUrl: string
): {
  shareText: string;
  shareData: ShareLinkOptions & { url: string };
} => {
  const finalTitle = options.title || config.defaultTitle;
  const finalDescription = options.description || config.defaultDescription;

  return {
    shareText: `${finalTitle}\n\n${finalDescription}\n\n${shareUrl}`,
    shareData: {
      title: finalTitle,
      description: finalDescription,
      url: shareUrl,
      imageUrl: options.imageUrl,
    },
  };
};

/**
 * Safe URL parsing with error handling
 */
const safeUrlParse = (
  url: string,
  fallback: ParsedDeepLink
): ParsedDeepLink => {
  try {
    const urlObj = new URL(url);
    const scheme = urlObj.protocol.replace(':', '');
    const host = urlObj.host || undefined;
    const path = urlObj.pathname;

    // Extract query parameters
    const params: Record<string, string> = {};
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    // Determine if it's a valid deep link for our app
    const isValidScheme = scheme === 'diestats' || host === 'diestats.app';

    if (!isValidScheme) {
      return { ...fallback, scheme, host, path, params };
    }

    // Parse the route and determine the destination
    const routeInfo = parseRouteFromPath(path);

    return {
      scheme,
      host,
      path,
      params,
      routeName: routeInfo.routeName,
      isValid: routeInfo.isValid,
    };
  } catch (error) {
    console.error('Failed to parse deep link:', error);
    return fallback;
  }
};

// ============================================
// CORE NAVIGATION FUNCTIONS
// ============================================

/**
 * Creates a full path to a specific match screen
 */
export const generateMatchRoute = (
  matchId: string,
  screen?: 'stats' | 'recap' | 'history'
): string => {
  if (!routeValidation.isValidMatchId(matchId)) {
    console.warn(`Invalid match ID format: ${matchId}`);
  }

  return MATCH_ROUTE_CONFIG.pathBuilder(matchId, screen);
};

/**
 * Parses a deep link URL and extracts route information
 */
export const parseDeepLink = (url: string): ParsedDeepLink => {
  const defaultResult: ParsedDeepLink = {
    scheme: '',
    path: '',
    params: {},
    routeName: '',
    isValid: false,
  };

  return safeUrlParse(url, defaultResult);
};

/**
 * Creates shareable URLs for different resource types
 */
export const createShareLink = (
  type: ShareableResourceType,
  id: string,
  options: ShareLinkOptions = {}
): {
  deepLink: string;
  universalLink: string;
  shareText: string;
  shareData: ShareLinkOptions & { url: string };
} => {
  const { includeUniversalLink = true, includeDeepLink = true } = options;

  // Get configuration for the resource type
  const configMap = {
    match: MATCH_ROUTE_CONFIG,
    profile: PROFILE_ROUTE_CONFIG,
    post: POST_ROUTE_CONFIG,
    community: COMMUNITY_ROUTE_CONFIG,
    friend_request: FRIEND_ROUTE_CONFIG,
  };

  const config = configMap[type];
  if (!config) {
    throw new Error(`Unsupported share type: ${type}`);
  }

  // Generate URLs
  const deepLinkPath = config.deepLinkBuilder(id);
  const { deepLink, universalLink } = buildUrls(deepLinkPath);

  // Determine share URL preference
  const shareUrl = includeUniversalLink ? universalLink : deepLink;

  // Build share data
  const { shareText, shareData } = buildShareData(
    config,
    id,
    options,
    shareUrl
  );

  return {
    deepLink: includeDeepLink ? deepLink : '',
    universalLink: includeUniversalLink ? universalLink : '',
    shareText,
    shareData,
  };
};

// ============================================
// ROUTE PARSING (DRY Implementation)
// ============================================

/**
 * Parses a URL path and determines the destination route
 */
const parseRouteFromPath = (
  path: string
): { routeName: string; isValid: boolean } => {
  const segments = path.split('/').filter(Boolean);

  if (segments.length === 0) {
    return { routeName: '/(tabs)/home', isValid: true };
  }

  const [firstSegment, ...restSegments] = segments;
  const parser = ROUTE_PARSERS[firstSegment];

  return parser ? parser(restSegments) : { routeName: '', isValid: false };
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Builds a URL with query parameters
 */
export const buildUrlWithParams = (
  baseUrl: string,
  params: NavigationParams
): string => {
  const url = new URL(baseUrl, 'https://example.com');

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  return baseUrl.includes('://') ? url.toString() : url.pathname + url.search;
};

/**
 * Extracts parameters from a URL
 */
export const extractUrlParams = (url: string): NavigationParams => {
  try {
    const urlObj = new URL(url);
    const params: NavigationParams = {};

    urlObj.searchParams.forEach((value, key) => {
      // Parse value types
      if (value === 'true') {
        params[key] = true;
      } else if (value === 'false') {
        params[key] = false;
      } else if (/^\d+$/.test(value)) {
        params[key] = parseInt(value, 10);
      } else if (/^\d+\.\d+$/.test(value)) {
        params[key] = parseFloat(value);
      } else {
        params[key] = value;
      }
    });

    return params;
  } catch (error) {
    console.error('Failed to extract URL parameters:', error);
    return {};
  }
};

/**
 * Validates if a URL is a valid deep link for the app
 */
export const isValidDeepLink = (url: string): boolean => {
  const parsed = parseDeepLink(url);
  return parsed.isValid;
};

/**
 * Creates a match join link with room code
 */
export const createMatchInviteLink = (
  roomCode: string,
  includeInviteMessage: boolean = true
): {
  deepLink: string;
  universalLink: string;
  shareText: string;
  roomCode: string;
} => {
  const deepLinkPath = DEEP_LINKS.MATCH_JOIN(roomCode);
  const { deepLink, universalLink } = buildUrls(deepLinkPath);

  let shareText = `Join my DieStats match!\nRoom Code: ${roomCode}\n\n${universalLink}`;

  if (includeInviteMessage) {
    shareText =
      `🎲 You're invited to join my DieStats match!\n\n` +
      `Room Code: ${roomCode}\n` +
      `Tap the link to join: ${universalLink}\n\n` +
      `Or open DieStats and enter the room code manually.`;
  }

  return {
    deepLink,
    universalLink,
    shareText,
    roomCode,
  };
};

/**
 * Resolves a route with dynamic parameters
 */
export const resolveRoute = (
  routeTemplate: string,
  params: Record<string, string>
): string => {
  let resolvedRoute = routeTemplate;

  Object.entries(params).forEach(([key, value]) => {
    resolvedRoute = resolvedRoute.replace(
      `[${key}]`,
      encodeURIComponent(value)
    );
  });

  return resolvedRoute;
};

/**
 * Gets the root route for a given path
 */
export const getRootRoute = (path: string): string => {
  const segments = path.split('/').filter(Boolean);

  if (segments.length === 0) return 'home';

  const firstSegment = segments[0];

  // Handle grouped routes
  if (firstSegment === '(tabs)' || firstSegment === '(auth)') {
    return segments[1] || firstSegment;
  }

  return firstSegment;
};

/**
 * Checks if a route requires authentication
 */
export const requiresAuth = (route: string): boolean => {
  const publicRoutes = [
    '/(auth)/login',
    '/(auth)/signup',
    '/(auth)/forgot-password',
  ];

  return !publicRoutes.some((publicRoute) => route.startsWith(publicRoute));
};
