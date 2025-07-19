// hooks/match/useMatch.ts
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Match, Player, TeamScore, PlayerMatchStats, LiveMatchData, LivePlayerStats, MatchEvent } from '../../types/models';
import { MatchStatus, PlayType } from '../../types/enums';
import { ApiError, ApiResponse } from '../../types/api';
import { matchService, type SubmitPlayData } from '../../services/match/matchService';
import { realtimeService, type MatchSubscriptionCallbacks, type BroadcastPlayData } from '../../services/match/realtimeService';
import { useAuth } from '../auth/useAuth';
import { parseError, createErrorHandler } from '../../utils/errors';
import { calculateMVP } from '../../utils/calculations';

/**
 * useMatch Hook
 * 
 * Comprehensive hook for managing live match state, real-time updates, and player interactions.
 * Handles match data fetching, real-time subscriptions, play submission, and match control.
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface UseMatchOptions {
  // Whether to subscribe to real-time updates
  enableRealtime?: boolean;
  // Whether to load player statistics
  includeStats?: boolean;
  // Whether to track user presence
  trackPresence?: boolean;
  // Custom error handler
  onError?: (error: ApiError) => void;
}

export interface UseMatchState {
  // Core match data
  match: Match | null;
  participants: Player[];
  liveMatchData: LiveMatchData | null;
  currentScore: TeamScore;

  // Real-time state
  presentPlayers: string[];
  isConnected: boolean;
  connectionError: ApiError | null;

  // Loading states
  isLoading: boolean;
  isSubmittingPlay: boolean;
  isUpdatingMatch: boolean;

  // Error handling
  error: ApiError | null;
  lastUpdated: Date | null;

  // Player statistics
  playerStats: Record<string, LivePlayerStats>;
  mvpPlayer: Player | null;
}

export interface UseMatchActions {
  // Play submission
  submitPlay: (playData: SubmitPlayData) => Promise<boolean>;
  undoLastPlay: () => Promise<boolean>;

  // Match control
  startMatch: () => Promise<boolean>;
  pauseMatch: () => Promise<boolean>;
  resumeMatch: () => Promise<boolean>;
  endMatch: () => Promise<boolean>;

  // Player management
  kickPlayer: (playerId: string) => Promise<boolean>;
  changePlayerTeam: (playerId: string, newTeam: string) => Promise<boolean>;
  joinAsHost: (team: string, position: 1 | 2 | 3 | 4) => Promise<boolean>;

  // Real-time management
  reconnect: () => Promise<void>;
  disconnect: () => void;

  // Data refresh
  refreshMatch: () => Promise<void>;
  refreshStats: () => Promise<void>;

  // Utility
  getPlayerByTeam: (team: string) => Player[];
  isUserParticipant: () => boolean;
  canUserControl: () => boolean;
  getTeamScore: (team: string) => number;
}

export interface UseMatchReturn extends UseMatchState, UseMatchActions {}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

export const useMatch = (
  matchId: string,
  options: UseMatchOptions = {}
): UseMatchReturn => {
  const {
    enableRealtime = true,
    includeStats = true,
    trackPresence = true,
    onError,
  } = options;

  // Dependencies
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  // Error handler
  const handleError = createErrorHandler('useMatch', 'match_operations');

  // Refs for cleanup
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const mountedRef = useRef(true);

  // ============================================
  // STATE MANAGEMENT
  // ============================================

  // Core match state
  const [participants, setParticipants] = useState<Player[]>([]);
  const [liveMatchData, setLiveMatchData] = useState<LiveMatchData | null>(null);
  const [currentScore, setCurrentScore] = useState<TeamScore>({
    team1: 0,
    team2: 0,
  });
  const [playerStats, setPlayerStats] = useState<
    Record<string, LivePlayerStats>
  >({});
  const [mvpPlayer, setMvpPlayer] = useState<Player | null>(null);

  // Real-time state
  const [presentPlayers, setPresentPlayers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<ApiError | null>(null);

  // Loading states
  const [isSubmittingPlay, setIsSubmittingPlay] = useState(false);
  const [isUpdatingMatch, setIsUpdatingMatch] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // ============================================
  // QUERIES AND MUTATIONS
  // ============================================

  // Main match query
  const {
    data: match,
    isLoading,
    error: queryError,
    refetch: refetchMatch,
  } = useQuery<Match, Error>({
    queryKey: ['match', matchId, 'details'],
    queryFn: async () => {
      console.log('[useMatch] Fetching match:', matchId);
      const result = await matchService.getMatch(matchId, true, includeStats);
      console.log('[useMatch] Match fetch result:', { success: result.success, hasData: !!result.data, error: result.error });
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || 'Failed to fetch match');
      }
      return result.data;
    },
    enabled: !!matchId,
    refetchInterval: enableRealtime ? false : 30000, // Refetch every 30s if not using realtime
    staleTime: 30000, // Consider data stale after 30 seconds
  });

  // Live match data query
  const { data: liveData, refetch: refetchLiveData } = useQuery<LiveMatchData | null, Error>({
    queryKey: ['match', matchId, 'live-data'],
    queryFn: async () => {
      const result = await matchService.getLiveMatchData(matchId);
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch live match data');
      }
      return result.data;
    },
    enabled: !!matchId,
    refetchInterval: enableRealtime ? false : 5000, // Refetch every 5s if not using realtime
    staleTime: 5000, // Consider data stale after 5 seconds
  });

  // Play submission mutation
  const submitPlayMutation = useMutation({
    mutationFn: async (playData: SubmitPlayData) => {
      const result = await matchService.submitPlay(matchId, playData);
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || 'Failed to submit play');
      }
      return result.data;
    },
    onSuccess: (success) => {
      if (success) {
        // Refresh live match data to get updated stats
        refetchLiveData();
        
        // Refresh stats if enabled
        if (includeStats) {
          refreshStats();
        }

        // Update last updated timestamp
        setLastUpdated(new Date());
      }
    },
    onError: (error) => {
      const parsedError = handleError(error, { action: 'submitPlay', matchId });

      // Call custom error handler if provided
      onError?.(parsedError);
    },
  });

  // Match status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (status: MatchStatus) => {
      const result = await matchService.updateMatchStatus(matchId, status);
      if (!result.success || !result.data) {
        throw new Error(
          result.error?.message || 'Failed to update match status'
        );
      }
      return result.data;
    },
    onSuccess: (updatedMatch) => {
      // Update the match data in the query cache, preserving participants
      queryClient.setQueryData(['match', matchId, 'details'], (oldMatch: Match | undefined) => {
        if (oldMatch) {
          return {
            ...updatedMatch,
            participants: oldMatch.participants || updatedMatch.participants || [],
            currentScore: oldMatch.currentScore || updatedMatch.currentScore || { team1: 0, team2: 0 }
          };
        }
        return updatedMatch;
      });
    },
    onError: (error) => {
      const parsedError = handleError(error, {
        action: 'updateStatus',
        matchId,
      });
      onError?.(parsedError);
    },
  });

  // Host join mutation
  const hostJoinMutation = useMutation({
    mutationFn: async ({ team, position }: { team: string; position: 1 | 2 | 3 | 4 }) => {
      if (!user?.id) {
        throw new Error('Must be logged in to join as host');
      }
      const result = await matchService.joinAsHost(matchId, user.id, team, position);
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || 'Failed to join as host');
      }
      return result.data;
    },
    onSuccess: () => {
      // Refresh match data to get updated participants
      refetchMatch();
      refetchLiveData();
    },
    onError: (error) => {
      const parsedError = handleError(error, {
        action: 'joinAsHost',
        matchId,
      });
      onError?.(parsedError);
    },
  });

  // ============================================
  // REAL-TIME SUBSCRIPTION
  // ============================================

  // Memoize callbacks to prevent unnecessary re-subscriptions
  const realtimeCallbacks = useMemo<MatchSubscriptionCallbacks>(() => ({
    onMatchUpdate: (updates: Partial<Match>) => {
      console.log('Realtime match update received:', updates);
      // Update match data in query cache
      queryClient.setQueryData(
        ['match', matchId, 'details'],
        (oldMatch: Match | undefined) =>
          oldMatch ? { ...oldMatch, ...updates } : oldMatch
      );
      setLastUpdated(new Date());
    },

    onStatusChange: (status: MatchStatus) => {
      // Update match status
      queryClient.setQueryData(
        ['match', matchId, 'details'],
        (oldMatch: Match | undefined) =>
          oldMatch ? { ...oldMatch, status } : oldMatch
      );
    },

    onPlayerJoin: (player: Player) => {
      setParticipants((prev) => {
        const exists = prev.some((p) => p.userId === player.userId);
        return exists ? prev : [...prev, player];
      });
    },

    onPlayerLeave: (playerId: string) => {
      setParticipants((prev) =>
        prev.filter((p) => p.userId !== playerId)
      );
      setPresentPlayers((prev) => prev.filter((id) => id !== playerId));
    },

    onNewEvent: (event: MatchEvent) => {
      console.log('Realtime new event received:', event);
      // Update score if applicable
      if (event.eventData.points && event.team) {
        setCurrentScore((prev) => ({
          ...prev,
          [event.team!]:
            (prev[event.team!] || 0) + event.eventData.points!,
        }));
      }

      setLastUpdated(new Date());
    },

    onScoreUpdate: (score: TeamScore) => {
      setCurrentScore(score);
      setLastUpdated(new Date());
    },

    onPresenceSync: (presentUserIds: string[]) => {
      if (trackPresence) {
        setPresentPlayers(presentUserIds);
      }
    },

    onError: (error: ApiError) => {
      setConnectionError(error);
      setIsConnected(false);
      onError?.(error);
    },

    onReconnect: () => {
      setConnectionError(null);
      setIsConnected(true);

      // Refresh data after reconnection
      queryClient.invalidateQueries({ queryKey: ['match', matchId] });
    },
  }), [matchId, trackPresence, onError, queryClient]);

  useEffect(() => {
    if (!enableRealtime || !matchId || !user?.id || !profile) {
      return;
    }

    const setupRealtimeSubscription = async () => {
      try {
        setConnectionError(null);

        // Get user's team for presence tracking - use match data directly to avoid circular dependency
        const userParticipant = match?.participants?.find((p) => p.userId === user.id);

        const unsubscribe = await realtimeService.subscribeToMatch(
          matchId,
          realtimeCallbacks,
          user.id,
          {
            username: profile.username,
            avatarUrl: profile.avatarUrl,
            team: userParticipant?.team,
          }
        );

        unsubscribeRef.current = unsubscribe;
        setIsConnected(true);
      } catch (error) {
        const parsedError = handleError(error, {
          action: 'setupRealtime',
          matchId,
        });
        setConnectionError(parsedError);
        setIsConnected(false);
        onError?.(parsedError);
      }
    };

    setupRealtimeSubscription();

    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      setIsConnected(false);
    };
  }, [enableRealtime, matchId, user?.id, profile?.id, realtimeCallbacks]); // Removed match?.participants to avoid circular dependency

  // ============================================
  // DATA SYNCHRONIZATION
  // ============================================

  // Update local state when match data changes
  useEffect(() => {
    if (match) {
      setParticipants(match.participants || []);
      setCurrentScore(match.currentScore || { team1: 0, team2: 0 });
    }
  }, [match]);

  // Update events when events data changes
  useEffect(() => {
    if (liveData) {
      setLiveMatchData(liveData);
    }
  }, [liveData]);

  // Calculate player stats and current score when live match data changes
  useEffect(() => {
    if (liveMatchData?.livePlayerStats && includeStats) {
      const newStats: Record<string, LivePlayerStats> = {};
      
      // Convert position-based stats to user-based stats
      Object.entries(liveMatchData.livePlayerStats).forEach(([position, stats]) => {
        // Find the user ID for this position
        const userId = Object.entries(liveMatchData.playerMap).find(
          ([uid, pos]) => pos === position
        )?.[0];
        
        if (userId) {
          newStats[userId] = stats;
        }
      });
      
      setPlayerStats(newStats);

      // Calculate current score from live player stats
      let team1Score = 0;
      let team2Score = 0;
      
      Object.entries(liveMatchData.livePlayerStats).forEach(([position, stats]) => {
        const positionNum = parseInt(position);
        const team = positionNum <= 2 ? 'team1' : 'team2';
        const score = stats.score || 0;
        
        if (team === 'team1') {
          team1Score += score;
        } else {
          team2Score += score;
        }
      });
      
      setCurrentScore({ team1: team1Score, team2: team2Score });

      // Calculate MVP from participants
      const playersWithStats = participants
        .map((p) => ({
          ...p,
          stats: newStats[p.userId],
        }))
        .filter((p): p is Player & { stats: LivePlayerStats } => !!p.stats);

      if (playersWithStats.length > 0) {
        const mvp = calculateMVP(playersWithStats);
        setMvpPlayer(mvp);
      }
    }
  }, [liveMatchData, participants, matchId, includeStats]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // ============================================
  // ACTION IMPLEMENTATIONS
  // ============================================

  const undoLastPlay = useCallback(async (): Promise<boolean> => {
    // TODO: Implement undo functionality
    // This would require storing play history and having an undo API
    console.warn('Undo functionality not yet implemented');
    return false;
  }, []);

  const startMatch = useCallback(async (): Promise<boolean> => {
    setIsUpdatingMatch(true);
    try {
      await updateStatusMutation.mutateAsync(MatchStatus.ACTIVE);
      return true;
    } catch {
      return false;
    } finally {
      setIsUpdatingMatch(false);
    }
  }, [updateStatusMutation]);

  const pauseMatch = useCallback(async (): Promise<boolean> => {
    setIsUpdatingMatch(true);
    try {
      await updateStatusMutation.mutateAsync(MatchStatus.PAUSED);
      return true;
    } catch {
      return false;
    } finally {
      setIsUpdatingMatch(false);
    }
  }, [updateStatusMutation]);

  const resumeMatch = useCallback(async (): Promise<boolean> => {
    setIsUpdatingMatch(true);
    try {
      await updateStatusMutation.mutateAsync(MatchStatus.ACTIVE);
      return true;
    } catch {
      return false;
    } finally {
      setIsUpdatingMatch(false);
    }
  }, [updateStatusMutation]);

  const endMatch = useCallback(async (): Promise<boolean> => {
    setIsUpdatingMatch(true);
    try {
      await updateStatusMutation.mutateAsync(MatchStatus.COMPLETED);
      return true;
    } catch {
      return false;
    } finally {
      setIsUpdatingMatch(false);
    }
  }, [updateStatusMutation]);

  const submitPlay = useCallback(
    async (playData: SubmitPlayData): Promise<boolean> => {
      if (!user?.id) {
        const error = 'Must be logged in to submit plays';
        onError?.({ code: 'AUTH_REQUIRED', message: error });
        return false;
      }

      if (!match || match.status !== MatchStatus.ACTIVE) {
        const error = 'Cannot submit plays to an inactive match';
        onError?.({ code: 'INVALID_STATE', message: error });
        return false;
      }

      setIsSubmittingPlay(true);

      try {
        await submitPlayMutation.mutateAsync(playData);
        return true;
      } catch (error) {
        return false;
      } finally {
        setIsSubmittingPlay(false);
      }
    },
    [user?.id, match, submitPlayMutation, onError]
  );

  const kickPlayer = useCallback(
    async (playerId: string): Promise<boolean> => {
      if (!user?.id || !match) return false;

      try {
        const result = await matchService.kickPlayer(
          matchId,
          playerId,
          user.id
        );
        if (result.success) {
          setParticipants((prev) => prev.filter((p) => p.userId !== playerId));
          return true;
        }
        return false;
      } catch (error) {
        handleError(error, { action: 'kickPlayer', playerId });
        return false;
      }
    },
    [user?.id, match, matchId, handleError]
  );

  const changePlayerTeam = useCallback(
    async (playerId: string, newTeam: string): Promise<boolean> => {
      if (!user?.id) return false;

      try {
        const result = await matchService.changePlayerTeam(
          matchId,
          playerId,
          newTeam,
          user.id
        );
        if (result.success) {
          setParticipants((prev) =>
            prev.map((p) =>
              p.userId === playerId ? { ...p, team: newTeam } : p
            )
          );
          return true;
        }
        return false;
      } catch (error) {
        handleError(error, { action: 'changePlayerTeam', playerId, newTeam });
        return false;
      }
    },
    [user?.id, matchId, handleError]
  );

  const reconnect = useCallback(async (): Promise<void> => {
    if (enableRealtime && unsubscribeRef.current) {
      // Disconnect and reconnect
      unsubscribeRef.current();
      unsubscribeRef.current = null;
      setIsConnected(false);

      // The useEffect will handle reconnection
    }
  }, [enableRealtime]);

  const disconnect = useCallback((): void => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const refreshMatch = useCallback(async (): Promise<void> => {
    await refetchMatch();
    queryClient.invalidateQueries({ queryKey: ['match', matchId] });
  }, [refetchMatch, queryClient, matchId]);

  const refreshStats = useCallback(async (): Promise<void> => {
    if (includeStats) {
      queryClient.invalidateQueries({ queryKey: ['match', matchId, 'stats'] });
    }
  }, [includeStats, queryClient, matchId]);

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  const getPlayerByTeam = useCallback(
    (team: string): Player[] => {
      return participants.filter((p) => p.team === team);
    },
    [participants]
  );

  const isUserParticipant = useCallback((): boolean => {
    return !!user?.id && participants.some((p) => p.userId === user.id);
  }, [user?.id, participants]);

  const canUserControl = useCallback((): boolean => {
    return (
      !!user?.id &&
      (match?.creatorId === user.id ||
        participants.some((p) => p.userId === user.id && p.role === 'admin'))
    );
  }, [user?.id, match?.creatorId, participants]);

  const getTeamScore = useCallback(
    (team: string): number => {
      return currentScore[team] || 0;
    },
    [currentScore]
  );

  const joinAsHost = useCallback(
    async (team: string, position: 1 | 2 | 3 | 4): Promise<boolean> => {
      try {
        console.log(`[useMatch] joinAsHost called:`, { team, position });
        await hostJoinMutation.mutateAsync({ team, position });
        console.log(`[useMatch] joinAsHost successful`);
        return true;
      } catch (error) {
        console.error(`[useMatch] joinAsHost failed:`, error);
        return false;
      }
    },
    [hostJoinMutation]
  );

  // ============================================
  // RETURN HOOK INTERFACE
  // ============================================

  return {
    // State
    match: match || null,
    participants,
    liveMatchData, // Changed from 'events' to 'liveMatchData'
    currentScore,
    presentPlayers,
    isConnected,
    connectionError,
    isLoading,
    isSubmittingPlay,
    isUpdatingMatch,
    error: queryError ? parseError(queryError) : null,
    lastUpdated,
    playerStats,
    mvpPlayer,

    // Actions
    submitPlay,
    undoLastPlay,
    startMatch,
    pauseMatch,
    resumeMatch,
    endMatch,
    kickPlayer,
    changePlayerTeam,
    joinAsHost,
    reconnect,
    disconnect,
    refreshMatch,
    refreshStats,

    // Utility
    getPlayerByTeam,
    isUserParticipant,
    canUserControl,
    getTeamScore,
  };
};

export default useMatch;
