// constants/routes.ts

// Base route paths
export const ROUTES = {
  // Root
  ROOT: '/',

  // Auth group
  AUTH: {
    LOGIN: '/(auth)/login',
    SIGNUP: '/(auth)/signup',
    FORGOT_PASSWORD: '/(auth)/forgot-password',
  },

  // Tab group
  TABS: {
    HOME: '/(tabs)/home',
    SOCIAL: '/(tabs)/social',
    PROFILE: '/(tabs)/profile',
  },

  // Match routes
  MATCH: {
    CREATE: '/match/create',
    LIVE: (id: string) => `/match/${id}`,
    STATS: (id: string) => `/match/${id}/stats`,
    RECAP: (id: string) => `/match/${id}/recap`,
    HISTORY: (id: string) => `/match/history/${id}`,
  },

  // Social routes
  SOCIAL: {
    COMMUNITY: '/social/community/[id]',
    COMMUNITY_MEMBERS: '/social/community/[id]/members',
    COMMUNITY_SETTINGS: '/social/community/[id]/settings',
    POST: '/social/post/[id]',
    FRIENDS: '/social/friends',
    FRIEND_PROFILE: '/social/friends/[id]',
  },

  // Analytics routes
  ANALYTICS: {
    PLAYER: '/analytics/player/[id]',
    TEAM: '/analytics/team/[id]',
    LEADERBOARDS: '/analytics/leaderboards',
  },

  // Settings routes
  SETTINGS: {
    INDEX: '/settings',
    APPEARANCE: '/settings/appearance',
    NOTIFICATIONS: '/settings/notifications',
    PRIVACY: '/settings/privacy',
  },
} as const;

// Route builder functions for dynamic routes
export const AUTH_ROUTES = {
  login: () => ROUTES.AUTH.LOGIN,
  signup: () => ROUTES.AUTH.SIGNUP,
  forgotPassword: () => ROUTES.AUTH.FORGOT_PASSWORD,
} as const;

export const TAB_ROUTES = {
  home: () => ROUTES.TABS.HOME,
  social: () => ROUTES.TABS.SOCIAL,
  profile: () => ROUTES.TABS.PROFILE,
} as const;

export const MATCH_ROUTES = {
  create: () => ROUTES.MATCH.CREATE,
  live: (id: string) => `/match/${id}` as const,
  stats: (id: string) => `/match/${id}/stats` as const,
  recap: (id: string) => `/match/${id}/recap` as const,
  history: (id: string) => `/match/history/${id}` as const,
} as const;

export const SOCIAL_ROUTES = {
  community: (id: string) => `/social/community/${id}` as const,
  communityMembers: (id: string) => `/social/community/${id}/members` as const,
  communitySettings: (id: string) =>
    `/social/community/${id}/settings` as const,
  post: (id: string) => `/social/post/${id}` as const,
  friends: () => ROUTES.SOCIAL.FRIENDS,
  friendProfile: (id: string) => `/social/friends/${id}` as const,
} as const;

export const ANALYTICS_ROUTES = {
  player: (id: string) => `/analytics/player/${id}` as const,
  team: (id: string) => `/analytics/team/${id}` as const,
  leaderboards: () => ROUTES.ANALYTICS.LEADERBOARDS,
} as const;

export const SETTINGS_ROUTES = {
  index: () => ROUTES.SETTINGS.INDEX,
  appearance: () => ROUTES.SETTINGS.APPEARANCE,
  notifications: () => ROUTES.SETTINGS.NOTIFICATIONS,
  privacy: () => ROUTES.SETTINGS.PRIVACY,
} as const;

// Deep linking configuration
export const DEEP_LINKS = {
  // Match deep links
  MATCH_JOIN: (shortId: string) => `match/join/${shortId}` as const,
  MATCH_VIEW: (shortId: string) => `match/${shortId}` as const,

  // Social deep links
  PROFILE_SHARE: (username: string) => `profile/${username}` as const,
  COMMUNITY_INVITE: (id: string) => `community/join/${id}` as const,
  POST_SHARE: (id: string) => `post/${id}` as const,

  // Friend deep links
  FRIEND_REQUEST: (userId: string) => `friend/add/${userId}` as const,
} as const;

// Navigation helper functions
export const navigationHelpers = {
  // Check if a route requires authentication
  isAuthRequired: (route: string): boolean => {
    const publicRoutes: string[] = [
      ROUTES.AUTH.LOGIN,
      ROUTES.AUTH.SIGNUP,
      ROUTES.AUTH.FORGOT_PASSWORD,
    ];
    return !publicRoutes.includes(route);
  },

  // Check if a route is a tab route
  isTabRoute: (route: string): boolean => {
    const tabRoutes: string[] = Object.values(ROUTES.TABS);
    return tabRoutes.includes(route);
  },

  // Get the parent route
  getParentRoute: (route: string): string | null => {
    const segments = route.split('/').filter(Boolean);
    if (segments.length <= 1) return null;
    segments.pop();
    return '/' + segments.join('/');
  },

  // Build a route with query parameters
  withParams: (
    route: string,
    params: Record<string, string | number | boolean>
  ): string => {
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    return `${route}?${queryString}`;
  },

  // Extract ID from dynamic route
  extractId: (route: string): string | null => {
    const match = route.match(/\/([a-zA-Z0-9-]+)$/);
    return match ? match[1] : null;
  },

  // Replace dynamic segments in route
  replaceDynamicSegments: (
    route: string,
    params: Record<string, string>
  ): string => {
    let result = route;
    Object.entries(params).forEach(([key, value]) => {
      result = result.replace(`[${key}]`, value);
    });
    return result;
  },
};

// Route validation
export const routeValidation = {
  // Validate match ShortID format (Letter-6digits: A-123456)
  isValidMatchShortId: (shortId: string): boolean => {
    return /^[A-Z]-\d{6}$/.test(shortId);
  },

  // Validate UUID format (for internal use)
  isValidUUID: (id: string): boolean => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      id
    );
  },

  // Validate username format
  isValidUsername: (username: string): boolean => {
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
  },

  // Generic ID validation (accepts both UUID and ShortID)
  isValidMatchId: (id: string): boolean => {
    return (
      routeValidation.isValidUUID(id) || routeValidation.isValidMatchShortId(id)
    );
  },
};

// Navigation type helpers for TypeScript
export type RouteKeys = keyof typeof ROUTES;
export type AuthRouteKeys = keyof typeof ROUTES.AUTH;
export type TabRouteKeys = keyof typeof ROUTES.TABS;
export type MatchRouteKeys = keyof typeof ROUTES.MATCH;
export type SocialRouteKeys = keyof typeof ROUTES.SOCIAL;
export type AnalyticsRouteKeys = keyof typeof ROUTES.ANALYTICS;
export type SettingsRouteKeys = keyof typeof ROUTES.SETTINGS;

// Route parameter types
export interface RouteParams {
  match: {
    id: string;
  };
  social: {
    communityId: string;
    postId: string;
    userId: string;
  };
  analytics: {
    playerId: string;
    teamId: string;
  };
}

// Breadcrumb generation
export const generateBreadcrumbs = (
  currentRoute: string
): Array<{ label: string; route: string }> => {
  const breadcrumbs: Array<{ label: string; route: string }> = [];

  // Add home
  breadcrumbs.push({ label: 'Home', route: ROUTES.TABS.HOME });

  // Parse current route and build breadcrumbs
  if (currentRoute.includes('/match/')) {
    breadcrumbs.push({ label: 'Matches', route: ROUTES.TABS.HOME });
    if (currentRoute.includes('/stats')) {
      breadcrumbs.push({
        label: 'Match Details',
        route: currentRoute.replace('/stats', ''),
      });
      breadcrumbs.push({ label: 'Statistics', route: currentRoute });
    } else if (currentRoute.includes('/recap')) {
      breadcrumbs.push({
        label: 'Match Details',
        route: currentRoute.replace('/recap', ''),
      });
      breadcrumbs.push({ label: 'Recap', route: currentRoute });
    }
  } else if (currentRoute.includes('/social/')) {
    breadcrumbs.push({ label: 'Social', route: ROUTES.TABS.SOCIAL });
    if (currentRoute.includes('/community/')) {
      breadcrumbs.push({ label: 'Communities', route: ROUTES.TABS.SOCIAL });
      if (currentRoute.includes('/members')) {
        breadcrumbs.push({
          label: 'Community',
          route: currentRoute.replace('/members', ''),
        });
        breadcrumbs.push({ label: 'Members', route: currentRoute });
      }
    }
  } else if (currentRoute.includes('/settings')) {
    breadcrumbs.push({ label: 'Settings', route: ROUTES.SETTINGS.INDEX });
    if (currentRoute !== ROUTES.SETTINGS.INDEX) {
      const settingType = currentRoute.split('/').pop();
      breadcrumbs.push({
        label: settingType
          ? settingType.charAt(0).toUpperCase() + settingType.slice(1)
          : '',
        route: currentRoute,
      });
    }
  }

  return breadcrumbs;
};

// Export all route builders as a single object for convenience
export const ROUTE_BUILDERS = {
  auth: AUTH_ROUTES,
  tabs: TAB_ROUTES,
  match: MATCH_ROUTES,
  social: SOCIAL_ROUTES,
  analytics: ANALYTICS_ROUTES,
  settings: SETTINGS_ROUTES,
} as const;

// Common navigation actions
export const navigationActions = {
  // Navigate to home
  goHome: () => ROUTES.TABS.HOME,

  // Navigate to login
  goToLogin: () => ROUTES.AUTH.LOGIN,

  // Navigate to match creation
  createMatch: () => ROUTES.MATCH.CREATE,

  // Navigate to a specific match
  viewMatch: (matchId: string) => MATCH_ROUTES.live(matchId),

  // Navigate to user profile
  viewProfile: (userId?: string) =>
    userId ? ANALYTICS_ROUTES.player(userId) : ROUTES.TABS.PROFILE,

  // Navigate to community
  viewCommunity: (communityId: string) => SOCIAL_ROUTES.community(communityId),

  // Navigate to settings
  openSettings: () => ROUTES.SETTINGS.INDEX,
};
