// services/analytics/statsService.ts
import {
  calculateCatchRate,
  calculateHitRate,
  calculateWinRate,
} from '../../utils/calculations';
import {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from '../../types/api';
import { LeaderboardEntry, PlayerStats, User } from '../../types/models';
import { createErrorHandler } from '../../utils/errors';
import { supabase } from '../database/databaseService';

/**
 * Stats Service
 *
 * Provides functions to fetch and process complex statistical data for players,
 * teams, and communities. It often involves aggregating data from multiple tables.
 * Consumed by analytics screens and profile stats displays.
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface StatsServiceResponse<T = any> extends ApiResponse<T> {}

// FIX: Use camelCase properties from the PlayerStats model in models.ts
export type LeaderboardCategory =
  | 'winRate'
  | 'totalWins'
  | 'hitRate'
  | 'totalScore';

const handleError = createErrorHandler('StatsService', 'analytics_operations');

// ============================================
// SERVICE CLASS
// ============================================

export class StatsService {
  /**
   * Fetches the aggregated statistics for a single player.
   * @param userId - The ID of the user whose stats to retrieve.
   * @returns The player's aggregated statistics.
   */
  static async getPlayerStats(
    userId: string
  ): Promise<StatsServiceResponse<PlayerStats>> {
    try {
      const { data, error } = await supabase
        .from('player_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      if (!data) {
        // Return a default/empty stats object if none exists for the user
        return {
          success: true,
          data: this.getDefaultPlayerStats(userId),
          error: null,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: this.transformPlayerStats(data),
        error: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'getPlayerStats',
        userId,
      });
      return {
        success: false,
        error: parsedError,
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Retrieves leaderboard data for a specific category with pagination.
   * @param category - The statistical category for the leaderboard.
   * @param pagination - Pagination parameters.
   * @returns A paginated list of leaderboard entries.
   */
  static async getLeaderboard(
    category: LeaderboardCategory,
    pagination: PaginationParams
  ): Promise<StatsServiceResponse<PaginatedResponse<LeaderboardEntry>>> {
    const { page = 1, pageSize = 20, sortOrder = 'desc' } = pagination;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Map model properties (camelCase) to database columns (snake_case) for sorting
    const categoryToColumnMap = {
      winRate: 'win_rate',
      totalWins: 'total_wins',
      hitRate: 'hit_rate',
      totalScore: 'total_score',
    };
    const sortColumn = categoryToColumnMap[category];

    try {
      const {
        data: leaderboardData,
        error,
        count,
      } = await supabase
        .from('player_stats')
        .select(
          `
            user_id,
            total_wins,
            total_losses,
            win_rate,
            total_hits,
            total_throws,
            hit_rate,
            total_score,
            profile:profiles (
              username,
              avatar_url
            )
          `,
          { count: 'exact' }
        )
        .not('profile', 'is', null) // Ensure user profile exists
        .order(sortColumn, { ascending: sortOrder === 'asc' })
        .range(from, to);

      if (error) throw error;

      return {
        success: true,
        data: {
          items: leaderboardData.map((d: any, index: number) =>
            this.transformLeaderboardEntry(d, from + index + 1)
          ),
          // FIX: Moved totalCount to the root of the PaginatedResponse object
          totalCount: count ?? 0,
          pagination: {
            page,
            pageSize,
          },
          hasMore: (count ?? 0) > to + 1,
        },
        error: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'getLeaderboard',
        category,
      });
      return {
        success: false,
        error: parsedError,
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  /**
   * Creates a default PlayerStats object for a new user.
   * @param userId - The ID of the user.
   * @returns A default PlayerStats object.
   */
  private static getDefaultPlayerStats(userId: string): PlayerStats {
    return {
      userId: userId,
      totalMatches: 0,
      totalWins: 0,
      totalLosses: 0,
      winRate: 0,
      avgScore: 0,
      totalScore: 0,
      totalHits: 0,
      totalThrows: 0,
      hitRate: 0,
      totalCatches: 0,
      totalCatchAttempts: 0,
      catchRate: 0,
      totalSinks: 0,
      totalKnickers: 0,
      totalDinks: 0,
      totalGoals: 0,
      longestStreak: 0,
      totalOnFireCount: 0,
      totalOnFireLength: 0,
      avgMatchDuration: 0,
      totalMatchDuration: 0,
      achievements: [],
      lastPlayed: undefined,
      updatedAt: new Date(),
    };
  }

  /**
   * Transforms a raw database row into a structured PlayerStats object.
   * @param dbStats - The raw player_stats row from Supabase.
   * @returns A structured PlayerStats object.
   */
  private static transformPlayerStats(dbStats: any): PlayerStats {
    return {
      userId: dbStats.user_id,
      totalMatches: dbStats.total_matches,
      totalWins: dbStats.total_wins,
      totalLosses: dbStats.total_losses,
      winRate: calculateWinRate(dbStats.total_wins, dbStats.total_matches),
      hitRate: calculateHitRate(dbStats.total_hits, dbStats.total_throws),
      catchRate: calculateCatchRate(
        dbStats.total_catches,
        dbStats.total_catch_attempts
      ),
      totalScore: dbStats.total_score,
      avgScore: dbStats.avg_score,
      totalThrows: dbStats.total_throws,
      totalHits: dbStats.total_hits,
      totalCatches: dbStats.total_catches,
      totalCatchAttempts: dbStats.total_catch_attempts,
      totalSinks: dbStats.total_sinks,
      totalKnickers: dbStats.total_knickers,
      totalDinks: dbStats.total_dinks,
      totalGoals: dbStats.total_goals,
      longestStreak: dbStats.longest_streak,
      totalOnFireCount: dbStats.total_on_fire_count,
      totalOnFireLength: 0, // Placeholder
      totalMatchDuration: 0, // Placeholder
      avgMatchDuration: 0, // Placeholder
      achievements: Array.isArray(dbStats.achievements)
        ? dbStats.achievements
        : [],
      lastPlayed: dbStats.last_played
        ? new Date(dbStats.last_played)
        : undefined,
      updatedAt: new Date(dbStats.updated_at),
    };
  }

  /**
   * Transforms a raw database row into a structured LeaderboardEntry object.
   * @param dbEntry - The raw data from the leaderboard query.
   * @param rank - The rank of the player in the leaderboard.
   * @returns A structured LeaderboardEntry object.
   */
  private static transformLeaderboardEntry(
    dbEntry: any,
    rank: number
  ): LeaderboardEntry {
    // FIX: Create a full User object to satisfy the LeaderboardEntry type
    const user: User = {
      id: dbEntry.user_id,
      username: dbEntry.profile?.username || 'Unknown',
      avatarUrl: dbEntry.profile?.avatar_url,
      // Add missing properties with default values
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: true,
      settings: {
        notifications: {
          matchInvites: true,
          friendRequests: true,
          communityPosts: true,
          matchUpdates: true,
          achievements: true,
          pushEnabled: true,
        },
      },
    };

    return {
      rank,
      user,
      value:
        dbEntry.win_rate ??
        dbEntry.total_wins ??
        dbEntry.hit_rate ??
        dbEntry.total_score ??
        0,
    };
  }
}

// ============================================
// EXPORTED INSTANCE
// ============================================

export const statsService = {
  getPlayerStats: StatsService.getPlayerStats,
  getLeaderboard: StatsService.getLeaderboard,
};
