// contexts/MatchContext.tsx

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import { Match, Player } from '../types/models';
import { MatchStatus } from '../types/enums';
import { ApiError } from '../types/api';
import { cacheDataWithTTL, getCachedDataWithTTL } from '../utils/storage';
import { parseError, logError, createErrorHandler } from '../utils/errors';
// import { supabase } from '../services/database/databaseService'; // Will be available in Phase 2

// ============================================
// TYPES AND INTERFACES
// ============================================

export interface MatchInvite {
  id: string;
  matchId: string;
  match: Match;
  inviterId: string;
  inviterUsername: string;
  invitedAt: Date;
  expiresAt?: Date;
  message?: string;
}

export interface MatchState {
  activeMatches: Match[];
  matchInvites: MatchInvite[];
  loading: boolean;
  error: ApiError | null;
  lastFetch: string | null;
  refreshing: boolean;
}

export interface MatchContextValue {
  // State
  activeMatches: Match[];
  matchInvites: MatchInvite[];
  loading: boolean;
  error: ApiError | null;
  refreshing: boolean;

  // Actions
  refreshMatches: () => Promise<void>;
  acceptInvite: (inviteId: string) => Promise<boolean>;
  declineInvite: (inviteId: string) => Promise<boolean>;
  joinMatch: (roomCode: string) => Promise<Match | null>;
  leaveMatch: (matchId: string) => Promise<boolean>;

  // Utility
  getActiveMatch: (matchId: string) => Match | undefined;
  getMatchInvite: (inviteId: string) => MatchInvite | undefined;
  hasActiveMatches: () => boolean;
  hasPendingInvites: () => boolean;
}

// Action types for reducer
type MatchAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: ApiError | null }
  | { type: 'SET_ACTIVE_MATCHES'; payload: Match[] }
  | { type: 'SET_MATCH_INVITES'; payload: MatchInvite[] }
  | { type: 'ADD_ACTIVE_MATCH'; payload: Match }
  | {
      type: 'UPDATE_MATCH';
      payload: { matchId: string; updates: Partial<Match> };
    }
  | { type: 'REMOVE_ACTIVE_MATCH'; payload: string }
  | { type: 'ADD_MATCH_INVITE'; payload: MatchInvite }
  | { type: 'REMOVE_MATCH_INVITE'; payload: string }
  | { type: 'SET_LAST_FETCH'; payload: string };

// Storage keys
const STORAGE_KEYS = {
  ACTIVE_MATCHES: 'active_matches_cache',
  MATCH_INVITES: 'match_invites_cache',
  LAST_FETCH: 'matches_last_fetch',
} as const;

// Cache TTL (3 minutes for active data)
const CACHE_TTL = 3 * 60 * 1000;

// ============================================
// REDUCER
// ============================================

const matchReducer = (state: MatchState, action: MatchAction): MatchState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'SET_REFRESHING':
      return {
        ...state,
        refreshing: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
        refreshing: false,
      };

    case 'SET_ACTIVE_MATCHES':
      return {
        ...state,
        activeMatches: action.payload,
        loading: false,
        refreshing: false,
        error: null,
      };

    case 'SET_MATCH_INVITES':
      return {
        ...state,
        matchInvites: action.payload,
        loading: false,
        refreshing: false,
        error: null,
      };

    case 'ADD_ACTIVE_MATCH': {
      // Prevent duplicates
      const exists = state.activeMatches.some(
        (m) => m.id === action.payload.id
      );
      if (exists) {
        return state;
      }

      return {
        ...state,
        activeMatches: [...state.activeMatches, action.payload],
      };
    }

    case 'UPDATE_MATCH': {
      const { matchId, updates } = action.payload;
      const activeMatches = state.activeMatches.map((match) =>
        match.id === matchId ? { ...match, ...updates } : match
      );

      return {
        ...state,
        activeMatches,
      };
    }

    case 'REMOVE_ACTIVE_MATCH': {
      const activeMatches = state.activeMatches.filter(
        (match) => match.id !== action.payload
      );

      return {
        ...state,
        activeMatches,
      };
    }

    case 'ADD_MATCH_INVITE': {
      // Prevent duplicates
      const exists = state.matchInvites.some((i) => i.id === action.payload.id);
      if (exists) {
        return state;
      }

      return {
        ...state,
        matchInvites: [action.payload, ...state.matchInvites],
      };
    }

    case 'REMOVE_MATCH_INVITE': {
      const matchInvites = state.matchInvites.filter(
        (invite) => invite.id !== action.payload
      );

      return {
        ...state,
        matchInvites,
      };
    }

    case 'SET_LAST_FETCH':
      return {
        ...state,
        lastFetch: action.payload,
      };

    default:
      return state;
  }
};

// ============================================
// INITIAL STATE
// ============================================

const initialState: MatchState = {
  activeMatches: [],
  matchInvites: [],
  loading: false,
  error: null,
  lastFetch: null,
  refreshing: false,
};

// ============================================
// CONTEXT CREATION
// ============================================

const MatchContext = createContext<MatchContextValue | null>(null);

// ============================================
// PROVIDER COMPONENT
// ============================================

export const MatchProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(matchReducer, initialState);

  // Error handler for this component
  const handleError = createErrorHandler('MatchContext', 'match_management');

  // ============================================
  // CACHE MANAGEMENT
  // ============================================

  // Load cached data on mount
  useEffect(() => {
    const loadCachedData = async () => {
      try {
        const [cachedMatches, cachedInvites] = await Promise.all([
          getCachedDataWithTTL<Match[]>(STORAGE_KEYS.ACTIVE_MATCHES),
          getCachedDataWithTTL<MatchInvite[]>(STORAGE_KEYS.MATCH_INVITES),
        ]);

        if (cachedMatches && Array.isArray(cachedMatches)) {
          dispatch({ type: 'SET_ACTIVE_MATCHES', payload: cachedMatches });
        }

        if (cachedInvites && Array.isArray(cachedInvites)) {
          dispatch({ type: 'SET_MATCH_INVITES', payload: cachedInvites });
        }
      } catch (error) {
        handleError(error, { action: 'load_cached_match_data' });
      }
    };

    loadCachedData();
  }, []);

  // Cache data whenever it changes
  useEffect(() => {
    if (state.activeMatches.length > 0) {
      cacheDataWithTTL(
        STORAGE_KEYS.ACTIVE_MATCHES,
        state.activeMatches,
        CACHE_TTL
      ).catch((error) => {
        handleError(error, { action: 'cache_active_matches' });
      });
    }
  }, [state.activeMatches]);

  useEffect(() => {
    if (state.matchInvites.length > 0) {
      cacheDataWithTTL(
        STORAGE_KEYS.MATCH_INVITES,
        state.matchInvites,
        CACHE_TTL
      ).catch((error) => {
        handleError(error, { action: 'cache_match_invites' });
      });
    }
  }, [state.matchInvites]);

  // ============================================
  // REAL-TIME SUBSCRIPTIONS
  // ============================================

  useEffect(() => {
    // TODO: Set up real-time subscriptions when realtimeService is available
    // This will listen for:
    // - New match invites
    // - Match status changes
    // - Player joins/leaves
    // - Match updates

    /*
    const setupRealtimeSubscriptions = async () => {
      try {
        // Subscribe to match invites for current user
        const inviteSubscription = await realtimeService.subscribeToUserInvites(
          currentUserId,
          {
            onInviteReceived: (invite) => {
              dispatch({ type: 'ADD_MATCH_INVITE', payload: invite });
            },
            onInviteRevoked: (inviteId) => {
              dispatch({ type: 'REMOVE_MATCH_INVITE', payload: inviteId });
            },
          }
        );

        // Subscribe to active matches updates
        const matchSubscription = await realtimeService.subscribeToUserMatches(
          currentUserId,
          {
            onMatchUpdated: (matchId, updates) => {
              dispatch({ type: 'UPDATE_MATCH', payload: { matchId, updates } });
            },
            onMatchCompleted: (matchId) => {
              dispatch({ type: 'REMOVE_ACTIVE_MATCH', payload: matchId });
            },
          }
        );

        return () => {
          inviteSubscription.unsubscribe();
          matchSubscription.unsubscribe();
        };
      } catch (error) {
        handleError(error, { action: 'setup_realtime_subscriptions' });
      }
    };

    const cleanup = setupRealtimeSubscriptions();
    return () => cleanup?.then(fn => fn?.());
    */

    // Placeholder return for now
    return () => {};
  }, [handleError]);

  // ============================================
  // MATCH ACTIONS
  // ============================================

  const refreshMatches = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_REFRESHING', payload: true });

      // TODO: Replace with actual service calls when matchService is available
      /*
      const [activeMatchesResult, invitesResult] = await Promise.all([
        matchService.getActiveMatches(),
        matchService.getMatchInvites(),
      ]);

      if (activeMatchesResult.success && activeMatchesResult.data) {
        dispatch({ type: 'SET_ACTIVE_MATCHES', payload: activeMatchesResult.data });
      }

      if (invitesResult.success && invitesResult.data) {
        dispatch({ type: 'SET_MATCH_INVITES', payload: invitesResult.data });
      }
      */

      // For now, just simulate loading
      await new Promise((resolve) => setTimeout(resolve, 1000));

      dispatch({ type: 'SET_REFRESHING', payload: false });
      dispatch({ type: 'SET_LAST_FETCH', payload: new Date().toISOString() });
    } catch (error) {
      const parsedError = handleError(error, { action: 'refresh_matches' });
      dispatch({ type: 'SET_ERROR', payload: parsedError });
    }
  }, [handleError]);

  const acceptInvite = useCallback(
    async (inviteId: string): Promise<boolean> => {
      try {
        const invite = state.matchInvites.find((i) => i.id === inviteId);
        if (!invite) {
          throw new Error('Invite not found');
        }

        // Optimistic update - remove invite and add to active matches
        dispatch({ type: 'REMOVE_MATCH_INVITE', payload: inviteId });

        // Update match status and add to active matches
        const updatedMatch: Match = {
          ...invite.match,
          status: MatchStatus.ACTIVE,
        };
        dispatch({ type: 'ADD_ACTIVE_MATCH', payload: updatedMatch });

        // TODO: Call actual service when available
        /*
      const result = await matchService.acceptInvite(inviteId);
      
      if (!result.success) {
        // Revert optimistic update
        dispatch({ type: 'ADD_MATCH_INVITE', payload: invite });
        dispatch({ type: 'REMOVE_ACTIVE_MATCH', payload: invite.matchId });
        throw new Error(result.error || 'Failed to accept invite');
      }
      */

        return true;
      } catch (error) {
        handleError(error, {
          action: 'accept_invite',
          inviteId,
        });
        return false;
      }
    },
    [state.matchInvites, handleError]
  );

  const declineInvite = useCallback(
    async (inviteId: string): Promise<boolean> => {
      try {
        const invite = state.matchInvites.find((i) => i.id === inviteId);
        if (!invite) {
          throw new Error('Invite not found');
        }

        // Optimistic update
        dispatch({ type: 'REMOVE_MATCH_INVITE', payload: inviteId });

        // TODO: Call actual service when available
        /*
      const result = await matchService.declineInvite(inviteId);
      
      if (!result.success) {
        // Revert optimistic update
        dispatch({ type: 'ADD_MATCH_INVITE', payload: invite });
        throw new Error(result.error || 'Failed to decline invite');
      }
      */

        return true;
      } catch (error) {
        handleError(error, {
          action: 'decline_invite',
          inviteId,
        });
        return false;
      }
    },
    [state.matchInvites, handleError]
  );

  const joinMatch = useCallback(
    async (roomCode: string): Promise<Match | null> => {
      try {
        // TODO: Call actual service when available
        /*
      const result = await matchService.joinMatchByCode(roomCode);
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to join match');
      }

      const match = result.data;
      dispatch({ type: 'ADD_ACTIVE_MATCH', payload: match });
      return match;
      */

        // Placeholder implementation
        console.log('Joining match with code:', roomCode);
        return null;
      } catch (error) {
        handleError(error, {
          action: 'join_match',
          roomCode,
        });
        return null;
      }
    },
    [handleError]
  );

  const leaveMatch = useCallback(
    async (matchId: string): Promise<boolean> => {
      try {
        const match = state.activeMatches.find((m) => m.id === matchId);
        if (!match) {
          throw new Error('Match not found');
        }

        // Optimistic update
        dispatch({ type: 'REMOVE_ACTIVE_MATCH', payload: matchId });

        // TODO: Call actual service when available
        /*
      const result = await matchService.leaveMatch(matchId);
      
      if (!result.success) {
        // Revert optimistic update
        dispatch({ type: 'ADD_ACTIVE_MATCH', payload: match });
        throw new Error(result.error || 'Failed to leave match');
      }
      */

        return true;
      } catch (error) {
        handleError(error, {
          action: 'leave_match',
          matchId,
        });
        return false;
      }
    },
    [state.activeMatches, handleError]
  );

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  const getActiveMatch = useCallback(
    (matchId: string): Match | undefined => {
      return state.activeMatches.find((match) => match.id === matchId);
    },
    [state.activeMatches]
  );

  const getMatchInvite = useCallback(
    (inviteId: string): MatchInvite | undefined => {
      return state.matchInvites.find((invite) => invite.id === inviteId);
    },
    [state.matchInvites]
  );

  const hasActiveMatches = useCallback((): boolean => {
    return state.activeMatches.length > 0;
  }, [state.activeMatches]);

  const hasPendingInvites = useCallback((): boolean => {
    return state.matchInvites.length > 0;
  }, [state.matchInvites]);

  // ============================================
  // AUTO-REFRESH SETUP
  // ============================================

  useEffect(() => {
    // Auto-refresh every 30 seconds when app is active
    const interval = setInterval(() => {
      if (!state.loading && !state.refreshing) {
        refreshMatches();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [state.loading, state.refreshing, refreshMatches]);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const contextValue: MatchContextValue = {
    // State
    activeMatches: state.activeMatches,
    matchInvites: state.matchInvites,
    loading: state.loading,
    error: state.error,
    refreshing: state.refreshing,

    // Actions
    refreshMatches,
    acceptInvite,
    declineInvite,
    joinMatch,
    leaveMatch,

    // Utility
    getActiveMatch,
    getMatchInvite,
    hasActiveMatches,
    hasPendingInvites,
  };

  return (
    <MatchContext.Provider value={contextValue}>
      {children}
    </MatchContext.Provider>
  );
};

// ============================================
// HOOK FOR CONSUMING CONTEXT
// ============================================

export const useMatches = (): MatchContextValue => {
  const context = useContext(MatchContext);

  if (!context) {
    throw new Error('useMatches must be used within a MatchProvider');
  }

  return context;
};

// ============================================
// EXPORT DEFAULT
// ============================================

export default MatchProvider;
