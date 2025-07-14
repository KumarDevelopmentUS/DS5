// hooks/analytics/usePlayerStats.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/useAuth';
import { PlayerStats, Achievement } from '../../types/models';
import { Tables } from '../../types/database.types';
import { supabase } from '../../services/database/databaseService';
import {
  calculateWinRate,
  calculateHitRate,
  calculateCatchRate,
} from '../../utils/calculations';

// Query keys for React Query
const QUERY_KEYS = {
  playerStats: (userId: string) => ['playerStats', userId] as const,
  playerAchievements: (userId: string) =>
    ['playerAchievements', userId] as const,
  playerRanking: (userId: string) => ['playerRanking', userId] as const,
} as const;

// Types for the hook's return value
export interface PlayerStatsData {
  stats: PlayerStats | null;
  achievements: Achievement[];
  ranking: {
    globalRank?: number;
    totalPlayers?: number;
    percentile?: number;
  };
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

// Helper function to safely parse achievement data from JSON
const parseAchievements = (achievementsJson: any): Achievement[] => {
  try {
    if (!achievementsJson) return [];

    let achievementData: any[];

    if (Array.isArray(achievementsJson)) {
      achievementData = achievementsJson;
    } else if (typeof achievementsJson === 'object') {
      achievementData = Object.values(achievementsJson);
    } else {
      return [];
    }

    // Transform and validate each achievement
    return achievementData
      .filter((item) => item != null && typeof item === 'object')
      .map((item) => {
        // Safely extract achievement properties with defaults
        const achievement: Achievement = {
          id: item.id || '',
          name: item.name || 'Unknown Achievement',
          description: item.description || '',
          icon: item.icon || '',
          tier: item.tier || 'bronze',
          progress: typeof item.progress === 'number' ? item.progress : 0,
          maxProgress:
            typeof item.maxProgress === 'number' ? item.maxProgress : 100,
          unlockedAt: item.unlockedAt ? new Date(item.unlockedAt) : undefined,
          category: item.category || 'special',
        };
        return achievement;
      })
      .filter((achievement) => achievement.id && achievement.name); // Only include valid achievements
  } catch (error) {
    console.warn('Failed to parse achievements:', error);
    return [];
  }
};

// Transform database row to PlayerStats model
const transformPlayerStats = (dbStats: Tables<'player_stats'>): PlayerStats => {
  // Parse achievements from JSONB using helper function
  const achievements = parseAchievements(dbStats.achievements);

  return {
    userId: dbStats.user_id,
    totalMatches: dbStats.total_matches || 0,
    totalWins: dbStats.total_wins || 0,
    totalLosses: dbStats.total_losses || 0,
    winRate:
      dbStats.win_rate ||
      calculateWinRate(dbStats.total_wins || 0, dbStats.total_matches || 0),
    totalThrows: dbStats.total_throws || 0,
    totalHits: dbStats.total_hits || 0,
    hitRate:
      dbStats.hit_rate ||
      calculateHitRate(dbStats.total_hits || 0, dbStats.total_throws || 0),
    totalCatches: dbStats.total_catches || 0,
    totalCatchAttempts: dbStats.total_catch_attempts || 0,
    catchRate:
      dbStats.catch_rate ||
      calculateCatchRate(
        dbStats.total_catches || 0,
        dbStats.total_catch_attempts || 0
      ),
    totalScore: dbStats.total_score || 0,
    avgScore: dbStats.avg_score || 0,
    totalSinks: dbStats.total_sinks || 0,
    totalGoals: dbStats.total_goals || 0,
    totalDinks: dbStats.total_dinks || 0,
    totalKnickers: dbStats.total_knickers || 0,
    longestStreak: dbStats.longest_streak || 0,
    totalOnFireCount: dbStats.total_on_fire_count || 0,
    totalOnFireLength: 0, // Not in database yet, calculate later
    totalMatchDuration: 0, // Not in database yet, calculate later
    avgMatchDuration: 0, // Not in database yet, calculate later
    favoriteArena: undefined, // Not in database yet
    nemesisPlayer: undefined, // Not in database yet
    bestPartner: undefined, // Not in database yet
    achievements,
    lastPlayed: dbStats.last_played ? new Date(dbStats.last_played) : undefined,
    updatedAt: new Date(dbStats.updated_at || Date.now()),
  };
};

// Fetch player stats from database
const fetchPlayerStats = async (
  userId: string
): Promise<PlayerStats | null> => {
  if (!userId) return null;

  const { data, error } = await supabase
    .from('player_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No stats found, return default stats
      return {
        userId,
        totalMatches: 0,
        totalWins: 0,
        totalLosses: 0,
        winRate: 0,
        totalThrows: 0,
        totalHits: 0,
        hitRate: 0,
        totalCatches: 0,
        totalCatchAttempts: 0,
        catchRate: 0,
        totalScore: 0,
        avgScore: 0,
        totalSinks: 0,
        totalGoals: 0,
        totalDinks: 0,
        totalKnickers: 0,
        longestStreak: 0,
        totalOnFireCount: 0,
        totalOnFireLength: 0,
        totalMatchDuration: 0,
        avgMatchDuration: 0,
        achievements: [],
        lastPlayed: undefined,
        updatedAt: new Date(),
      };
    }
    throw new Error(`Failed to fetch player stats: ${error.message}`);
  }

  return transformPlayerStats(data);
};

// Fetch player's global ranking
const fetchPlayerRanking = async (userId: string) => {
  if (!userId)
    return {
      globalRank: undefined,
      totalPlayers: undefined,
      percentile: undefined,
    };

  try {
    // Get total number of players with stats
    const { count: totalPlayers } = await supabase
      .from('player_stats')
      .select('*', { count: 'exact', head: true })
      .gt('total_matches', 0);

    // Get current player's win rate for ranking
    const { data: currentPlayerStats } = await supabase
      .from('player_stats')
      .select('win_rate, total_matches')
      .eq('user_id', userId)
      .single();

    if (!currentPlayerStats || !currentPlayerStats.win_rate) {
      return {
        globalRank: undefined,
        totalPlayers: totalPlayers || 0,
        percentile: undefined,
      };
    }

    // Get count of players with better win rate (minimum 5 matches played)
    const { count: betterPlayers } = await supabase
      .from('player_stats')
      .select('*', { count: 'exact', head: true })
      .gt('win_rate', currentPlayerStats.win_rate)
      .gte('total_matches', 5);

    const globalRank = (betterPlayers || 0) + 1;
    const percentile = totalPlayers
      ? Math.round(((totalPlayers - globalRank + 1) / totalPlayers) * 100)
      : undefined;

    return {
      globalRank,
      totalPlayers: totalPlayers || 0,
      percentile,
    };
  } catch (error) {
    console.warn('Failed to fetch player ranking:', error);
    return {
      globalRank: undefined,
      totalPlayers: undefined,
      percentile: undefined,
    };
  }
};

/**
 * Hook for fetching and managing a player's comprehensive statistics
 * Provides stats, achievements, and ranking information
 */
export const usePlayerStats = (userId?: string): PlayerStatsData => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Use provided userId or fall back to current user
  const targetUserId = userId || user?.id;

  // Query for player stats
  const {
    data: stats,
    isLoading: isStatsLoading,
    isError: isStatsError,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: QUERY_KEYS.playerStats(targetUserId || ''),
    queryFn: () => fetchPlayerStats(targetUserId!),
    enabled: !!targetUserId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    retry: (failureCount, error) => {
      // Don't retry on permission errors
      if (error?.message?.includes('permission')) return false;
      return failureCount < 2;
    },
  });

  // Query for player ranking
  const {
    data: ranking,
    isLoading: isRankingLoading,
    isError: isRankingError,
  } = useQuery({
    queryKey: QUERY_KEYS.playerRanking(targetUserId || ''),
    queryFn: () => fetchPlayerRanking(targetUserId!),
    enabled: !!targetUserId && !!stats && stats.totalMatches > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes (rankings change less frequently)
    gcTime: 60 * 60 * 1000, // 1 hour
  });

  // Extract achievements from stats (they're stored together in the database)
  const achievements = stats?.achievements || [];

  // Combined loading and error states
  const isLoading = isStatsLoading;
  const isError = isStatsError || isRankingError;
  const error = statsError as Error | null;

  // Refetch function for manual refresh
  const refetch = () => {
    refetchStats();
    if (targetUserId) {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.playerRanking(targetUserId),
      });
    }
  };

  return {
    stats: stats || null,
    achievements,
    ranking: ranking || {
      globalRank: undefined,
      totalPlayers: undefined,
      percentile: undefined,
    },
    isLoading,
    isError,
    error,
    refetch,
  };
};

/**
 * Hook for fetching multiple players' stats (for leaderboards, comparisons, etc.)
 */
export const useMultiplePlayerStats = (userIds: string[]) => {
  return useQuery({
    queryKey: ['multiplePlayerStats', userIds.sort().join(',')],
    queryFn: async () => {
      if (userIds.length === 0) return [];

      const { data, error } = await supabase
        .from('player_stats')
        .select('*')
        .in('user_id', userIds);

      if (error) {
        throw new Error(
          `Failed to fetch multiple player stats: ${error.message}`
        );
      }

      return data.map(transformPlayerStats);
    },
    enabled: userIds.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

/**
 * Hook to invalidate player stats cache (useful after match completion)
 */
export const useInvalidatePlayerStats = () => {
  const queryClient = useQueryClient();

  return (userId?: string) => {
    if (userId) {
      // Invalidate specific user's stats
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.playerStats(userId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.playerRanking(userId),
      });
    } else {
      // Invalidate all player stats
      queryClient.invalidateQueries({
        queryKey: ['playerStats'],
      });
      queryClient.invalidateQueries({
        queryKey: ['playerRanking'],
      });
    }
  };
};
