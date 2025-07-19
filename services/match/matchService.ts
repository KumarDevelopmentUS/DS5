// services/match/matchService.ts
import {
  MATCH_SETTINGS,
  PLAY_TYPES,
  SCORING,
  SPECIAL_MECHANICS,
} from '../../constants/game';
import { ApiResponse, PaginationParams, ErrorCodes, SearchFilters } from '../../types/api';
import { MATCH_CONFIG } from '../../constants/config';

import {
  MatchStatus,
  PlayType,
  SortDirection,
  UserRole,
} from '../../types/enums';
import {
  EventData,
  Match,
  MatchEvent,
  PaginatedResponse,
  Player,
  PlayerMatchStats,
  TeamScore,
  MatchFormData,
  LiveMatchData,
} from '../../types/models';
import {
  isOnFire,
  calculateMVPScore,
  calculateMVP,
  calculateWinRate,
  calculateHitRate,
  calculateCatchRate,
  calculateAverageScore,
  calculateEfficiency,
  isComeback,
  calculatePerformanceRating,
} from '../../utils/calculations';
import { createErrorHandler } from '../../utils/errors';
import { cacheDataWithTTL, getCachedDataWithTTL } from '../../utils/storage';
import { sanitizeInput, validateMatchTitle } from '../../utils/validation';
import type { TableInsert, TableRow } from '../database/databaseService';
import { supabase } from '../database/databaseService';
import { initializeLiveMatchData, updateThrowingPlayerStats, updateDefensivePlayerStats, updateFifaStats } from '../../utils/playerDefaults';

/**
 * Match Service
 *
 * Encapsulates all business logic for creating, managing, and retrieving match data.
 * Handles interactions with 'matches', 'match_participants', and 'match_events' tables.
 *
 * Key Features:
 * - Match creation with unique room code generation
 * - Real-time play submission and scoring
 * - Match history with advanced filtering
 * - Player statistics tracking
 * - Team management
 * - Match state transitions
 */

// Type definitions for service methods
export interface CreateMatchData {
  title: string;
  description?: string;
  gameType?: string;
  location?: string;
  scoreLimit?: number;
  winByTwo?: boolean;
  sinkPoints?: 3 | 5;
  isPublic?: boolean;
  teamNames?: { team1: string; team2: string };
  playerNames?: { player1: string; player2: string; player3: string; player4: string };
}

export interface SubmitPlayData {
  playerId: string;
  eventType: PlayType;
  team: string;
  defenderIds?: string[];
  defenseType?: PlayType;
  fifa?: {
    kickType: 'good_kick' | 'bad_kick';
  };
  redemption?: {
    targetPlayerId?: string;
    success?: boolean;
  };
}

export interface MatchHistoryFilters extends SearchFilters {
  status?: MatchStatus[];
  gameType?: string[];
  location?: string;
  minDate?: Date;
  maxDate?: Date;
  wonOnly?: boolean;
  withStats?: boolean;
  query?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface JoinMatchData {
  userId: string;
  team?: string;
  role?: UserRole;
}

export interface MatchServiceResponse<T = any> extends ApiResponse<T> {
  cached?: boolean;
}

// Cache configuration
const CACHE_CONFIG = {
  MATCH_DETAILS: 5 * 60 * 1000, // 5 minutes
  MATCH_HISTORY: 10 * 60 * 1000, // 10 minutes
  MATCH_STATS: 3 * 60 * 1000, // 3 minutes
} as const;

// Error handler for this service
const handleError = createErrorHandler('MatchService', 'match_operations');

/**
 * Match Service Class
 *
 * Provides all match-related operations
 */
export class MatchService {
  /**
   * Creates a new match with unique room code
   *
   * @param data - Match creation data
   * @param creatorId - ID of the user creating the match
   * @returns Created match or error
   */
  static async createMatch(
    data: CreateMatchData,
    creatorId: string
  ): Promise<MatchServiceResponse<Match>> {
    try {
      // Validate input
      const titleValidation = validateMatchTitle(data.title);
      if (!titleValidation.isValid) {
        return {
          data: null,
          error: {
            code: ErrorCodes.VALIDATION_FAILED,
            message: titleValidation.error!,
          },
          success: false,
          timestamp: new Date().toISOString(),
        };
      }

      // Generate unique room code
      const roomCode = await this.generateUniqueRoomCode();

      // Prepare match data
      const matchData: TableInsert<'matches'> = {
        title: sanitizeInput(data.title),
        description: data.description
          ? sanitizeInput(data.description, { maxLength: 500 })
          : null,
        creator_id: creatorId,
        room_code: roomCode,
        game_type: data.gameType || 'standard',
        location: data.location || null,
        is_public:
          data.isPublic ?? MATCH_SETTINGS.DEFAULT_VISIBILITY === 'public',
        status: 'pending',
        settings: {
          scoreLimit: data.scoreLimit || MATCH_SETTINGS.DEFAULT_SCORE_LIMIT,
          winByTwo: data.winByTwo ?? MATCH_SETTINGS.DEFAULT_WIN_BY_TWO,
          sinkPoints: data.sinkPoints || MATCH_SETTINGS.DEFAULT_SINK_POINTS,
          teamNames: data.teamNames || { team1: 'Team 1', team2: 'Team 2' },
          playerNames: data.playerNames || { player1: 'Player 1', player2: 'Player 2', player3: 'Player 3', player4: 'Player 4' },
          trackAdvancedStats: MATCH_SETTINGS.TRACK_ADVANCED_STATS,
          enableSpectators: MATCH_SETTINGS.ENABLE_SPECTATORS,
        },
      };

      // Create match in database
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert([matchData])
        .select()
        .single();

      if (matchError || !match) {
        throw matchError || new Error('Failed to create match');
      }

      // Don't automatically add creator as participant - they can join manually later
      console.log('Match created successfully. Creator can join manually.');

      // Transform to Match type
      const transformedMatch: Match = this.transformMatch(match);

      return {
        data: transformedMatch,
        error: null,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, { action: 'createMatch', data });
      return {
        data: null,
        error: parsedError,
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Submits a play/event to a match using the new live match data structure
   *
   * @param matchId - ID of the match
   * @param playData - Play submission data
   * @returns Success status
   */
  static async submitPlay(
    matchId: string,
    playData: SubmitPlayData
  ): Promise<MatchServiceResponse<boolean>> {
    try {
      // Verify match exists and is active
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (matchError || !match) {
        throw new Error('Match not found');
      }

      if (match.status !== 'active') {
        return {
          data: null,
          error: {
            code: ErrorCodes.VALIDATION_FAILED,
            message: 'Cannot submit plays to an inactive match',
          },
          success: false,
          timestamp: new Date().toISOString(),
        };
      }

      // Get current live match data or initialize it
      let liveMatchData: LiveMatchData = (match.live_match_data as unknown) as LiveMatchData;
      
      if (!liveMatchData) {
        // Initialize live match data if it doesn't exist
        const { data: participants } = await supabase
          .from('match_participants')
          .select('user_id, team, role')
          .eq('match_id', matchId);

        if (!participants) {
          throw new Error('No participants found');
        }

        liveMatchData = initializeLiveMatchData(match, participants);
      }

      // Calculate points based on play type
      let points = this.calculatePoints(
        playData.eventType,
        playData.defenseType,
        match.settings as any
      );

      // Get player position from playerMap or handle default players
      let playerPosition = liveMatchData.playerMap[playData.playerId];
      let positionNumber: string;
      
      if (!playerPosition) {
        // Handle default players - check if it's a default player ID
        if (playData.playerId.startsWith('default_')) {
          // Extract position from default player ID (e.g., "default_temp_3" -> "3")
          const match = playData.playerId.match(/default_.*_(\d+)/);
          if (match) {
            positionNumber = match[1];
            playerPosition = `default_${positionNumber}`;
          } else {
            throw new Error('Invalid default player ID format');
          }
        } else {
          throw new Error('Player not found in match');
        }
      } else {
        // Extract position number from slot ID (e.g., "default_4" -> "4")
        positionNumber = playerPosition.replace('default_', '');
      }

      // Update throwing player statistics
      liveMatchData = updateThrowingPlayerStats(
        liveMatchData,
        positionNumber,
        playData.eventType,
        points
      );

      // Update defensive player statistics if there was defense
      if (playData.defenderIds && playData.defenderIds.length > 0 && playData.defenseType) {
        for (const defenderId of playData.defenderIds) {
          const defenderPosition = liveMatchData.playerMap[defenderId];
          if (defenderPosition) {
            const defenderPositionNumber = defenderPosition.replace('default_', '');
            liveMatchData = updateDefensivePlayerStats(
              liveMatchData,
              defenderPositionNumber,
              playData.defenseType!
            );
          }
        }
      }

      // Handle FIFA Save mechanics according to rulebook
      if (playData.fifa) {
        // Update FIFA statistics for the thrower
        const isSuccess = playData.fifa.kickType === 'good_kick';
        liveMatchData = updateFifaStats(
          liveMatchData,
          positionNumber,
          playData.fifa.kickType,
          isSuccess
        );

        // Check FIFA Save conditions according to rulebook
        const isBadThrow = ['short', 'long', 'side', 'height'].includes(playData.eventType);
        const hasFifaAction = playData.fifa.kickType === 'good_kick' || playData.fifa.kickType === 'bad_kick';
        const hasSuccessfulDefense = playData.defenseType && ['catch', 'catch_plus_aura'].includes(playData.defenseType);
        const hasDefenderSelected = playData.defenderIds && playData.defenderIds.length > 0;

        // All FIFA Save conditions must be met for 1 point to defending team
        if (isBadThrow && hasFifaAction && hasSuccessfulDefense && hasDefenderSelected && playData.defenderIds) {
          // Award 1 point to the defending team (not the thrower)
          for (const defenderId of playData.defenderIds) {
            const defenderPosition = liveMatchData.playerMap[defenderId];
            if (defenderPosition) {
              const defenderPositionNumber = defenderPosition.replace('default_', '');
              const defenderStats = liveMatchData.livePlayerStats[defenderPositionNumber];
              if (defenderStats) {
                defenderStats.score += 1; // FIFA Save point to defender
                defenderStats.fifaSuccess += 1; // Track FIFA save success
              }
            }
          }
        }
      }

      // Handle Self Sink mechanics according to rulebook
      if (playData.eventType === PlayType.SELF_SINK) {
        // Self Sink: Opposing team automatically wins
        const throwerTeam = playData.team;
        const opponentTeam = throwerTeam === 'team1' ? 'team2' : 'team1';
        
        // Set opponent team score to game score limit to trigger immediate win
        const gameScoreLimit = liveMatchData.matchSetup.gameScoreLimit;
        
        // Find all players on the opponent team and set their scores to win
        Object.entries(liveMatchData.livePlayerStats).forEach(([position, stats]) => {
          const positionNum = parseInt(position);
          const playerTeam = positionNum <= 2 ? 'team1' : 'team2';
          
          if (playerTeam === opponentTeam) {
            stats.score = gameScoreLimit; // Set to win condition
          }
        });
        
        // Set match status to ended
        liveMatchData.status = 'ended';
      }

      // Handle Redemption mechanics according to rulebook
      if (playData.redemption && playData.redemption.success) {
        // Redemption Success: Negates current throw points AND removes 1 point from opponent
        // First, negate the current throw points (set points to 0)
        const originalPoints = points;
        points = 0;
        
        // Remove 1 point from the opponent team
        const throwerTeam = playData.team;
        const opponentTeam = throwerTeam === 'team1' ? 'team2' : 'team1';
        
        // Find all players on the opponent team and remove 1 point from each
        Object.entries(liveMatchData.livePlayerStats).forEach(([position, stats]) => {
          const positionNum = parseInt(position);
          const playerTeam = positionNum <= 2 ? 'team1' : 'team2';
          
          if (playerTeam === opponentTeam && stats.score > 0) {
            stats.score = Math.max(0, stats.score - 1); // Remove 1 point, but don't go below 0
          }
        });
      }

      // Add play to recent plays (keep only the most recent)
      const newPlay = {
        playerId: playData.playerId,
        eventType: playData.eventType,
        team: playData.team,
        points,
        timestamp: new Date().toISOString(),
        fifa: playData.fifa,
        redemption: playData.redemption,
      };
      
      liveMatchData.recentPlays = [newPlay];

      // Update the match with new live match data
      const { error: updateError } = await supabase
        .from('matches')
        .update({ live_match_data: liveMatchData as any })
        .eq('id', matchId);

      if (updateError) {
        throw updateError;
      }

      // Clear match cache after play submission
      await this.clearMatchCache(matchId);

      return {
        data: true,
        error: null,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'submitPlay',
        matchId,
        playData,
      });
      return {
        data: null,
        error: parsedError,
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Retrieves match history for a user with filtering and pagination
   *
   * @param userId - ID of the user
   * @param filters - Optional filters
   * @param pagination - Pagination parameters
   * @returns Paginated match history
   */
  static async getMatchHistory(
    userId: string,
    filters?: MatchHistoryFilters,
    pagination?: PaginationParams
  ): Promise<MatchServiceResponse<PaginatedResponse<Match>>> {
    try {
      // Check cache first
      const cacheKey = `match_history:${userId}:${JSON.stringify(filters)}:${JSON.stringify(pagination)}`;
      const cachedData =
        await getCachedDataWithTTL<PaginatedResponse<Match>>(cacheKey);

      if (cachedData) {
        return {
          data: cachedData,
          error: null,
          success: true,
          cached: true,
          timestamp: new Date().toISOString(),
        };
      }

      // Build query
      let query = supabase
        .from('match_participants')
        .select(
          `
          match_id,
          matches!inner (
            id,
            room_code,
            title,
            description,
            creator_id,
            status,
            game_type,
            settings,
            location,
            started_at,
            ended_at,
            created_at,
            is_public
          )
        `,
          { count: 'exact' }
        )
        .eq('user_id', userId);

      // Apply filters
      if (filters) {
        if (filters.status?.length) {
          query = query.in('matches.status', filters.status);
        }

        if (filters.gameType?.length) {
          query = query.in('matches.game_type', filters.gameType);
        }

        if (filters.location) {
          query = query.ilike('matches.location', `%${filters.location}%`);
        }

        if (filters.minDate) {
          query = query.gte(
            'matches.created_at',
            filters.minDate.toISOString()
          );
        }

        if (filters.maxDate) {
          query = query.lte(
            'matches.created_at',
            filters.maxDate.toISOString()
          );
        }

        if (filters.query) {
          query = query.or(
            `matches.title.ilike.%${filters.query}%,matches.description.ilike.%${filters.query}%`
          );
        }
      }

      // Apply sorting
      const sortBy = filters?.sortBy || 'created_at';
      const sortOrder = filters?.sortDirection || SortDirection.DESC;
      query = query.order(`matches.${sortBy}`, {
        ascending: sortOrder === 'asc',
      });

      // Apply pagination
      const page = pagination?.page || 1;
      const limit = pagination?.pageSize || 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to);

      // Execute query
      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      // Transform results
      const matches: Match[] = (data || []).map((row: any) =>
        this.transformMatch(row.matches)
      );

      // Filter for won matches if requested
      let filteredMatches = matches;
      if (filters?.wonOnly) {
        // This would require fetching match results - simplified for now
        // In production, this would be a more complex query
        filteredMatches = matches.filter((m) => m.status === 'completed');
      }

      // Build response
      const response: PaginatedResponse<Match> = {
        items: filteredMatches,
        pagination: {
          page,
          pageSize: limit,
          totalCount: count || 0,
        },
        hasMore: (count || 0) > to + 1,
      };

      // Cache the response
      await cacheDataWithTTL(cacheKey, response, CACHE_CONFIG.MATCH_HISTORY);

      return {
        data: response,
        error: null,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'getMatchHistory',
        userId,
        filters,
      });
      return {
        data: null,
        error: parsedError,
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Gets match details by ID
   *
   * @param matchId - Match ID
   * @param includeParticipants - Whether to include participant details
   * @param includeStats - Whether to include match statistics
   * @returns Match details or error
   */
  static async getMatch(
    matchId: string,
    includeParticipants: boolean = true,
    includeStats: boolean = false
  ): Promise<MatchServiceResponse<Match>> {
    try {
      // Check cache
      const cacheKey = `match:${matchId}:${includeParticipants}:${includeStats}`;
      const cachedMatch = await getCachedDataWithTTL<Match>(cacheKey);

      if (cachedMatch) {
        return {
          data: cachedMatch,
          error: null,
          success: true,
          cached: true,
          timestamp: new Date().toISOString(),
        };
      }

      // Fetch match
      let query = supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      const { data: match, error } = await query;

      if (error || !match) {
        throw error || new Error('Match not found');
      }

      // Transform base match
      let transformedMatch = this.transformMatch(match);

      // Fetch participants if requested
      if (includeParticipants) {
        const participants = await this.getMatchParticipants(matchId);
        transformedMatch.participants = participants;
      }

      // Calculate current score if match is active
      if (match.status === 'active' || match.status === 'completed') {
        const score = await this.calculateMatchScore(matchId);
        transformedMatch.currentScore = score;
      }

      // Cache the result
      await cacheDataWithTTL(
        cacheKey,
        transformedMatch,
        CACHE_CONFIG.MATCH_DETAILS
      );

      return {
        data: transformedMatch,
        error: null,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, { action: 'getMatch', matchId });
      return {
        data: null,
        error: parsedError,
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Joins a match by room code
   *
   * @param roomCode - Match room code
   * @param joinData - Join data including user info
   * @returns Joined match or error
   */
  static async joinMatchByCode(
    roomCode: string,
    joinData: JoinMatchData
  ): Promise<MatchServiceResponse<Match>> {
    try {
      // Find match by room code
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('room_code', roomCode.toUpperCase())
        .single();

      if (matchError || !match) {
        return {
          data: null,
          error: {
            code: ErrorCodes.NOT_FOUND,
            message: 'Invalid room code',
          },
          success: false,
          timestamp: new Date().toISOString(),
        };
      }

      // Check if match is joinable
      if (!match.status || !['pending', 'active'].includes(match.status)) {
        return {
          data: null,
          error: {
            code: ErrorCodes.VALIDATION_FAILED,
            message: 'This match is no longer accepting players',
          },
          success: false,
          timestamp: new Date().toISOString(),
        };
      }

      // Check if user is already in match
      const { data: existingParticipant } = await supabase
        .from('match_participants')
        .select('*')
        .eq('match_id', match.id)
        .eq('user_id', joinData.userId)
        .single();

      if (existingParticipant) {
        // User is already in match, just return it
        const fullMatch = await this.getMatch(match.id);
        return fullMatch;
      }

      // Determine team assignment
      const team = joinData.team || (await this.getBalancedTeam(match.id));

      // Add participant
      const participantData: TableInsert<'match_participants'> = {
        match_id: match.id,
        user_id: joinData.userId,
        team,
        role: joinData.role || 'player',
        is_active: true,
      };

      const { error: joinError } = await supabase
        .from('match_participants')
        .insert([participantData]);

      if (joinError) {
        throw joinError;
      }

      // Clear cache and return updated match
      await this.clearMatchCache(match.id);
      return this.getMatch(match.id);
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'joinMatchByCode',
        roomCode,
      });
      return {
        data: null,
        error: parsedError,
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Allows the host to manually join a specific player slot
   *
   * @param matchId - The match ID
   * @param userId - The user ID (host)
   * @param team - The team to join
   * @param position - The position (1-4) to join
   * @returns Success status
   */
  static async joinAsHost(
    matchId: string,
    userId: string,
    team: string,
    position: 1 | 2 | 3 | 4
  ): Promise<MatchServiceResponse<boolean>> {
    try {
      console.log(`[joinAsHost] Starting join process:`, { matchId, userId, team, position });
      
      // Verify the match exists and user is the creator
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('creator_id')
        .eq('id', matchId)
        .single();

      if (matchError || !match) {
        console.error(`[joinAsHost] Match not found:`, { matchId, error: matchError });
        return {
          data: null,
          error: {
            code: ErrorCodes.NOT_FOUND,
            message: 'Match not found',
          },
          success: false,
          timestamp: new Date().toISOString(),
        };
      }

      if (match.creator_id !== userId) {
        console.error(`[joinAsHost] User is not creator:`, { userId, creatorId: match.creator_id });
        return {
          data: null,
          error: {
            code: ErrorCodes.FORBIDDEN,
            message: 'Only the match creator can join as host',
          },
          success: false,
          timestamp: new Date().toISOString(),
        };
      }

      // Check if user is already in match
      const { data: existingParticipant } = await supabase
        .from('match_participants')
        .select('*')
        .eq('match_id', matchId)
        .eq('user_id', userId)
        .single();

      if (existingParticipant) {
        // Update existing participant to new team
        const { error: updateError } = await supabase
          .from('match_participants')
          .update({ team })
          .eq('match_id', matchId)
          .eq('user_id', userId);

        if (updateError) {
          throw updateError;
        }
      } else {
        // Add new participant
        const participantData: TableInsert<'match_participants'> = {
          match_id: matchId,
          user_id: userId,
          team,
          role: 'player',
          is_active: true,
        };

        const { error: joinError } = await supabase
          .from('match_participants')
          .insert([participantData]);

        if (joinError) {
          throw joinError;
        }
      }

      // Update live match data to store position information
      const { data: currentLiveData } = await supabase
        .from('matches')
        .select('live_match_data')
        .eq('id', matchId)
        .single();

      let liveMatchData = currentLiveData?.live_match_data as any;
      if (!liveMatchData) {
        liveMatchData = {
          livePlayerStats: {},
          liveTeamPenalties: {},
          matchSetup: {
            arena: 'Unknown Arena',
            gameScoreLimit: 11,
            sinkPoints: 3,
            winByTwo: true,
            title: 'Match',
            teamNames: {
              team1: 'Team 1',
              team2: 'Team 2',
            },
            playerNames: {
              player1: 'Player 1',
              player2: 'Player 2',
              player3: 'Player 3',
              player4: 'Player 4',
            },
          },
          participants: [],
          playerMap: {},
          recentPlays: [],
          roomCode: '',
          status: 'waiting',
        };
      }

      // Ensure matchSetup and participants exist
      if (!liveMatchData.matchSetup) {
        console.log(`[joinAsHost] Creating new matchSetup`);
        liveMatchData.matchSetup = {
          arena: 'Unknown Arena',
          gameScoreLimit: 11,
          sinkPoints: 3,
          winByTwo: true,
          title: 'Match',
          teamNames: {
            team1: 'Team 1',
            team2: 'Team 2',
          },
          playerNames: {
            player1: 'Player 1',
            player2: 'Player 2',
            player3: 'Player 3',
            player4: 'Player 4',
          },
        };
      }

      // Ensure participants array exists at root level
      if (!liveMatchData.participants) {
        console.log(`[joinAsHost] Creating new participants array`);
        liveMatchData.participants = [];
      }

      // Ensure playerMap exists at root level
      if (!liveMatchData.playerMap) {
        console.log(`[joinAsHost] Creating new playerMap`);
        liveMatchData.playerMap = {};
      }

      console.log(`[joinAsHost] Live match data structure:`, {
        hasMatchSetup: !!liveMatchData.matchSetup,
        hasParticipants: !!liveMatchData.participants,
        hasPlayerMap: !!liveMatchData.playerMap,
        participantCount: liveMatchData.participants.length,
        playerMapKeys: Object.keys(liveMatchData.playerMap)
      });

      // Map position to slot ID and ensure proper team assignment
      const slotId = `default_${position}`;
      
      // Determine correct team based on position
      const correctTeam = position <= 2 ? 'team1' : 'team2';
      
      // Update or add participant in live match data
      const existingParticipantIndex = liveMatchData.participants.findIndex(
        (p: any) => p.userId === userId
      );

      // Get user profile to get display name
      const { data: profile } = await supabase
        .from('profiles')
        .select('nickname, username')
        .eq('id', userId)
        .single();
      
      const displayName = profile?.nickname || profile?.username || `Player ${position}`;
      
      if (existingParticipantIndex >= 0) {
        // Update existing participant
        liveMatchData.participants[existingParticipantIndex] = {
          ...liveMatchData.participants[existingParticipantIndex],
          id: slotId,
          team: correctTeam, // Use correct team based on position
          displayName: displayName,
        };
      } else {
        // Add new participant
        const newParticipant = {
          id: slotId,
          userId: userId,
          displayName: displayName,
          team: correctTeam, // Use correct team based on position
          isRegistered: true,
        };
        liveMatchData.participants.push(newParticipant);
      }

      // Update player map
      liveMatchData.playerMap[userId] = slotId;

      // Update player name in matchSetup if available
      if (liveMatchData.matchSetup?.playerNames) {
        const playerKey = `player${position}` as keyof typeof liveMatchData.matchSetup.playerNames;
        if (playerKey in liveMatchData.matchSetup.playerNames) {
          liveMatchData.matchSetup.playerNames[playerKey] = displayName;
        }
      }

      // Update player name in livePlayerStats
      if (liveMatchData.livePlayerStats && liveMatchData.livePlayerStats[position.toString()]) {
        liveMatchData.livePlayerStats[position.toString()].name = displayName;
      }

      console.log(`[joinAsHost] Updated player map:`, {
        userId,
        slotId,
        playerMap: liveMatchData.playerMap,
        allParticipants: liveMatchData.participants
      });

      // Save updated live match data
      const { error: liveDataError } = await supabase
        .from('matches')
        .update({ live_match_data: liveMatchData as any })
        .eq('id', matchId);

      if (liveDataError) {
        throw liveDataError;
      }

      // Clear cache
      await this.clearMatchCache(matchId);

      console.log(`[joinAsHost] Successfully joined as host:`, { 
        matchId, 
        userId, 
        position, 
        slotId, 
        correctTeam,
        participantCount: liveMatchData.participants.length 
      });

      return {
        data: true,
        error: null,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'joinAsHost',
        matchId,
        userId,
        team,
        position,
      });
      return {
        data: null,
        error: parsedError,
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Updates match status
   *
   * @param matchId - Match ID
   * @param status - New status
   * @returns Updated match or error
   */
  static async updateMatchStatus(
    matchId: string,
    status: MatchStatus
  ): Promise<MatchServiceResponse<Match>> {
    try {
      const updateData: any = { status };

      // Add timestamps based on status
      if (status === 'active') {
        updateData.started_at = new Date().toISOString();
      } else if (status === 'completed' || status === 'abandoned') {
        updateData.ended_at = new Date().toISOString();
      }

      // Get current live match data to update its status
      const { data: currentLiveData } = await supabase
        .from('matches')
        .select('live_match_data')
        .eq('id', matchId)
        .single();

      let liveMatchData = currentLiveData?.live_match_data as any;
      if (liveMatchData) {
        // Update the status in live match data
        liveMatchData.status = status;
        
        // Update live match data in database
        const { error: liveDataError } = await supabase
          .from('matches')
          .update({ live_match_data: liveMatchData as any })
          .eq('id', matchId);

        if (liveDataError) {
          console.error('Failed to update live match data status:', liveDataError);
          // Continue with main status update even if live data update fails
        }
      }

      const { data: match, error } = await supabase
        .from('matches')
        .update(updateData)
        .eq('id', matchId)
        .select()
        .single();

      if (error || !match) {
        throw error || new Error('Failed to update match status');
      }

      // Clear cache
      await this.clearMatchCache(matchId);

      return {
        data: this.transformMatch(match),
        error: null,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'updateMatchStatus',
        matchId,
        status,
      });
      return {
        data: null,
        error: parsedError,
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Leaves a match
   *
   * @param matchId - Match ID
   * @param userId - User ID
   * @returns Success status
   */
  static async leaveMatch(
    matchId: string,
    userId: string
  ): Promise<MatchServiceResponse<null>> {
    try {
      const { error } = await supabase
        .from('match_participants')
        .update({ is_active: false })
        .eq('match_id', matchId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      // Clear cache
      await this.clearMatchCache(matchId);

      return {
        data: null,
        error: null,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'leaveMatch',
        matchId,
        userId,
      });
      return {
        data: null,
        error: parsedError,
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Gets player match statistics
   *
   * @param matchId - Match ID
   * @param playerId - Player ID
   * @returns Player statistics for the match
   */
  static async getPlayerMatchStats(
    matchId: string,
    playerId: string
  ): Promise<MatchServiceResponse<PlayerMatchStats>> {
    try {
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('live_match_data')
        .eq('id', matchId)
        .single();

      if (matchError || !match) {
        throw matchError || new Error('Match not found');
      }

      const liveMatchData = (match.live_match_data as unknown) as LiveMatchData;

      if (!liveMatchData) {
        return {
          data: null,
          error: {
            code: ErrorCodes.NOT_FOUND,
            message: 'Live match data not found for this match',
          },
          success: false,
          timestamp: new Date().toISOString(),
        };
      }

             // Find player position from playerMap
       const playerPosition = liveMatchData.playerMap[playerId];
       if (!playerPosition) {
         return {
           data: null,
           error: {
             code: ErrorCodes.NOT_FOUND,
             message: 'Player not found in this match',
           },
           success: false,
           timestamp: new Date().toISOString(),
         };
       }

       const playerStats = liveMatchData.livePlayerStats[playerPosition];

      // Calculate catch attempts from available stats
      const catchAttempts = playerStats.catches + playerStats.drop + playerStats.miss + playerStats.twoHands + playerStats.body;

      // Apply calculation functions from utils/calculations.ts
      const performanceMetrics = {
        hitRate: calculateHitRate(playerStats.hits, playerStats.throws),
        catchRate: calculateCatchRate(playerStats.catches, catchAttempts),
        efficiency: calculateEfficiency(playerStats.score, playerStats.throws),
        mvpScore: calculateMVPScore({
          ...playerStats,
          catchAttempts,
          sinks: playerStats.sink,
          goals: playerStats.goal,
          dinks: playerStats.dink,
          knickers: playerStats.knicker,
          currentStreak: playerStats.hitStreak,
          longestStreak: playerStats.hitStreak,
          onFireCount: playerStats.onFireCount,
          blunders: playerStats.blunders,
          fifaAttempts: playerStats.fifaAttempts,
          fifaSuccess: playerStats.fifaSuccess,
        } as PlayerMatchStats),
        performanceRating: calculatePerformanceRating({
          ...playerStats,
          catchAttempts,
          sinks: playerStats.sink,
          goals: playerStats.goal,
          dinks: playerStats.dink,
          knickers: playerStats.knicker,
          currentStreak: playerStats.hitStreak,
          longestStreak: playerStats.hitStreak,
          onFireCount: playerStats.onFireCount,
          blunders: playerStats.blunders,
          fifaAttempts: playerStats.fifaAttempts,
          fifaSuccess: playerStats.fifaSuccess,
        } as PlayerMatchStats),
      };

      return {
        data: {
          ...playerStats,
          catchAttempts,
          sinks: playerStats.sink,
          goals: playerStats.goal,
          dinks: playerStats.dink,
          knickers: playerStats.knicker,
          currentStreak: playerStats.hitStreak,
          longestStreak: playerStats.hitStreak,
          onFireCount: playerStats.onFireCount,
          blunders: playerStats.blunders,
          fifaAttempts: playerStats.fifaAttempts,
          fifaSuccess: playerStats.fifaSuccess,
          ...performanceMetrics,
        } as PlayerMatchStats,
        error: null,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'getPlayerMatchStats',
        matchId,
        playerId,
      });
      return {
        data: null,
        error: parsedError,
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Gets all events for a match
   *
   * @param matchId - Match ID
   * @param filters - Optional filters
   * @returns Array of match events
   */
  static async getMatchEvents(
    matchId: string,
    filters?: {
      team?: string;
      playerId?: string;
      eventTypes?: PlayType[];
      limit?: number;
    }
  ): Promise<MatchServiceResponse<MatchEvent[]>> {
    try {
      let query = supabase
        .from('match_events')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      // Apply filters
      if (filters?.team) {
        query = query.eq('team', filters.team);
      }
      if (filters?.playerId) {
        query = query.eq('player_id', filters.playerId);
      }
      if (filters?.eventTypes?.length) {
        query = query.in('event_type', filters.eventTypes);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const events: MatchEvent[] = (data || []).map((event: any) => ({
        id: event.id,
        matchId: event.match_id,
        playerId: event.player_id,
        eventType: event.event_type as PlayType,
        eventData: event.event_data as EventData,
        team: event.team,
        timestamp: new Date(event.created_at),
      }));

      return {
        data: events,
        error: null,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'getMatchEvents',
        matchId,
        filters,
      });
      return {
        data: null,
        error: parsedError,
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Deletes a match (creator only)
   *
   * @param matchId - Match ID
   * @param userId - User ID requesting deletion
   * @returns Success status
   */
  static async deleteMatch(
    matchId: string,
    userId: string
  ): Promise<MatchServiceResponse<null>> {
    try {
      // Verify user is creator
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('creator_id, status')
        .eq('id', matchId)
        .single();

      if (matchError || !match) {
        throw new Error('Match not found');
      }

      if (match.creator_id !== userId) {
        return {
          data: null,
          error: {
            code: ErrorCodes.PERMISSION_DENIED,
            message: 'Only the match creator can delete this match',
          },
          success: false,
          timestamp: new Date().toISOString(),
        };
      }

      if (match.status === 'active') {
        return {
          data: null,
          error: {
            code: ErrorCodes.VALIDATION_FAILED,
            message: 'Cannot delete an active match',
          },
          success: false,
          timestamp: new Date().toISOString(),
        };
      }

      // Delete match (cascade will handle related records)
      const { error: deleteError } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId);

      if (deleteError) {
        throw deleteError;
      }

      // Clear cache
      await this.clearMatchCache(matchId);

      return {
        data: null,
        error: null,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'deleteMatch',
        matchId,
        userId,
      });
      return {
        data: null,
        error: parsedError,
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Updates match settings
   *
   * @param matchId - Match ID
   * @param settings - New settings
   * @param userId - User ID requesting update
   * @returns Updated match or error
   */
  static async updateMatchSettings(
    matchId: string,
    settings: Partial<Match['settings']>,
    userId: string
  ): Promise<MatchServiceResponse<Match>> {
    try {
      // Verify user is creator
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('creator_id, settings, status')
        .eq('id', matchId)
        .single();

      if (matchError || !match) {
        throw new Error('Match not found');
      }

      if (match.creator_id !== userId) {
        return {
          data: null,
          error: {
            code: ErrorCodes.PERMISSION_DENIED,
            message: 'Only the match creator can update settings',
          },
          success: false,
          timestamp: new Date().toISOString(),
        };
      }

      if (match.status !== 'pending') {
        return {
          data: null,
          error: {
            code: ErrorCodes.VALIDATION_FAILED,
            message: 'Cannot update settings after match has started',
          },
          success: false,
          timestamp: new Date().toISOString(),
        };
      }

      // Merge settings
      const updatedSettings = {
        ...(match.settings as any),
        ...settings,
      };

      // Update match
      const { data: updatedMatch, error: updateError } = await supabase
        .from('matches')
        .update({ settings: updatedSettings })
        .eq('id', matchId)
        .select()
        .single();

      if (updateError || !updatedMatch) {
        throw updateError || new Error('Failed to update settings');
      }

      // Clear cache
      await this.clearMatchCache(matchId);

      return {
        data: this.transformMatch(updatedMatch),
        error: null,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'updateMatchSettings',
        matchId,
        settings,
      });
      return {
        data: null,
        error: parsedError,
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Kicks a player from a match (creator only)
   *
   * @param matchId - Match ID
   * @param playerIdToKick - Player ID to kick
   * @param kickerId - User ID requesting the kick
   * @returns Success status
   */
  static async kickPlayer(
    matchId: string,
    playerIdToKick: string,
    kickerId: string
  ): Promise<MatchServiceResponse<null>> {
    try {
      // Verify kicker is creator
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('creator_id, status')
        .eq('id', matchId)
        .single();

      if (matchError || !match) {
        throw new Error('Match not found');
      }

      if (match.creator_id !== kickerId) {
        return {
          data: null,
          error: {
            code: ErrorCodes.PERMISSION_DENIED,
            message: 'Only the match creator can kick players',
          },
          success: false,
          timestamp: new Date().toISOString(),
        };
      }

      if (match.status !== 'pending') {
        return {
          data: null,
          error: {
            code: ErrorCodes.VALIDATION_FAILED,
            message: 'Cannot kick players after match has started',
          },
          success: false,
          timestamp: new Date().toISOString(),
        };
      }

      // Remove player
      const { error: kickError } = await supabase
        .from('match_participants')
        .delete()
        .eq('match_id', matchId)
        .eq('user_id', playerIdToKick);

      if (kickError) {
        throw kickError;
      }

      // Clear cache
      await this.clearMatchCache(matchId);

      return {
        data: null,
        error: null,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'kickPlayer',
        matchId,
        playerIdToKick,
      });
      return {
        data: null,
        error: parsedError,
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Changes a player's team
   *
   * @param matchId - Match ID
   * @param playerId - Player ID
   * @param newTeam - New team assignment
   * @param requesterId - User ID requesting the change
   * @returns Success status
   */
  static async changePlayerTeam(
    matchId: string,
    playerId: string,
    newTeam: string,
    requesterId: string
  ): Promise<MatchServiceResponse<null>> {
    try {
      // Verify requester is creator or the player themselves
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('creator_id, status')
        .eq('id', matchId)
        .single();

      if (matchError || !match) {
        throw new Error('Match not found');
      }

      if (match.creator_id !== requesterId && playerId !== requesterId) {
        return {
          data: null,
          error: {
            code: ErrorCodes.PERMISSION_DENIED,
            message: 'Only the match creator or the player can change teams',
          },
          success: false,
          timestamp: new Date().toISOString(),
        };
      }

      if (match.status !== 'pending') {
        return {
          data: null,
          error: {
            code: ErrorCodes.VALIDATION_FAILED,
            message: 'Cannot change teams after match has started',
          },
          success: false,
          timestamp: new Date().toISOString(),
        };
      }

      // Update team
      const { error: updateError } = await supabase
        .from('match_participants')
        .update({ team: newTeam })
        .eq('match_id', matchId)
        .eq('user_id', playerId);

      if (updateError) {
        throw updateError;
      }

      // Clear cache
      await this.clearMatchCache(matchId);

      return {
        data: null,
        error: null,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'changePlayerTeam',
        matchId,
        playerId,
        newTeam,
      });
      return {
        data: null,
        error: parsedError,
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Generates a unique room code
   */
  private static async generateUniqueRoomCode(): Promise<string> {
    const maxAttempts = 10;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Generate code in format LNNNNN (1 letter + 5 digits, no dash)
      const letter = MATCH_CONFIG.SHORT_ID_LETTERS.charAt(
        Math.floor(Math.random() * MATCH_CONFIG.SHORT_ID_LETTERS.length)
      );
      const numbers = Math.floor(Math.random() * 100000)
        .toString()
        .padStart(5, '0');
      const code = `${letter}${numbers}`;

      // Check if code exists
      const { data } = await supabase
        .from('matches')
        .select('room_code')
        .eq('room_code', code)
        .single();

      if (!data) {
        return code;
      }
    }

    throw new Error('Failed to generate unique room code');
  }

  /**
   * Transforms database match to Match type
   */
  private static transformMatch(dbMatch: TableRow<'matches'>): Match {
    return {
      id: dbMatch.id,
      roomCode: dbMatch.room_code,
      title: dbMatch.title,
      description: dbMatch.description || undefined,
      creatorId: dbMatch.creator_id,
      status: dbMatch.status as MatchStatus,
      gameType: dbMatch.game_type,
      settings: dbMatch.settings as any,
      location: dbMatch.location || undefined,
      startedAt: dbMatch.started_at ? new Date(dbMatch.started_at) : undefined,
      endedAt: dbMatch.ended_at ? new Date(dbMatch.ended_at) : undefined,
      createdAt: new Date(dbMatch.created_at!),
      isPublic: dbMatch.is_public || false,
    };
  }

  /**
   * Gets match participants with user details
   */
  private static async getMatchParticipants(
    matchId: string
  ): Promise<Player[]> {
    const { data, error } = await supabase
      .from('match_participants')
      .select(
        `
        *,
        profiles:user_id (
          id,
          username,
          nickname,
          avatar_url
        )
      `
      )
      .eq('match_id', matchId)
      .eq('is_active', true);

    if (error || !data) {
      return [];
    }

    return data.map((participant: any) => ({
      userId: participant.user_id,
      username: participant.profiles?.username || 'Unknown',
      nickname: participant.profiles?.nickname,
      avatarUrl: participant.profiles?.avatar_url,
      team: participant.team,
      role: participant.role as UserRole,
      isActive: participant.is_active,
      joinedAt: new Date(participant.joined_at),
    }));
  }

  /**
   * Calculates current match score
   */
  private static async calculateMatchScore(
    matchId: string
  ): Promise<TeamScore> {
    const { data: match } = await supabase
      .from('matches')
      .select('live_match_data')
      .eq('id', matchId)
      .single();

    if (!match) {
      return { team1: 0, team2: 0 };
    }

    const liveMatchData = (match.live_match_data as unknown) as LiveMatchData;

    // Calculate team scores from player scores
     let team1Score = 0;
     let team2Score = 0;

     // Sum up scores for each team
     Object.values(liveMatchData.livePlayerStats).forEach((playerStats, index) => {
       const position = (index + 1).toString();
       const team = parseInt(position) <= 2 ? 'team1' : 'team2';
       if (team === 'team1') {
         team1Score += playerStats.score;
       } else {
         team2Score += playerStats.score;
       }
     });

     return {
       team1: team1Score,
       team2: team2Score,
     };
  }

  /**
   * Calculates points for a play
   */
  private static calculatePoints(
    playType: PlayType,
    defenseType?: PlayType,
    settings?: any
  ): number {
    // If defense was successful, no points
    if (defenseType && ['catch', 'catch_plus_aura'].includes(defenseType)) {
      return 0;
    }

    // Calculate base points
    switch (playType) {
      case PlayType.HIT:
      case PlayType.KNICKER:
        return 1;
      case PlayType.GOAL:
      case PlayType.DINK:
        return 2;
      case PlayType.SINK:
        return settings?.sinkPoints || MATCH_SETTINGS.DEFAULT_SINK_POINTS;
      case PlayType.FIFA_SAVE:
        return 1;
      default:
        return 0;
    }
  }

  /**
   * Gets player's current streak info
   */
  private static async getPlayerStreak(
    matchId: string,
    playerId: string
  ): Promise<{ currentStreak: number; longestStreak: number }> {
    const { data: match } = await supabase
      .from('matches')
      .select('live_match_data')
      .eq('id', matchId)
      .single();

    if (!match) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    const liveMatchData = (match.live_match_data as unknown) as LiveMatchData;
    const playerPosition = liveMatchData.playerMap[playerId];
    
    if (!playerPosition) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    const playerStats = liveMatchData.livePlayerStats[playerPosition];
    if (!playerStats) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    return {
      currentStreak: playerStats.hitStreak,
      longestStreak: playerStats.onFireCount > 0 ? 3 : playerStats.hitStreak,
    };
  }

  /**
   * Determines balanced team assignment
   */
  private static async getBalancedTeam(matchId: string): Promise<string> {
    const { data: participants } = await supabase
      .from('match_participants')
      .select('team')
      .eq('match_id', matchId)
      .eq('is_active', true);

    if (!participants || participants.length === 0) {
      return 'team1';
    }

    const teamCounts = participants.reduce(
      (acc, p) => {
        if (p.team) {
          acc[p.team] = (acc[p.team] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    return (teamCounts.team1 || 0) <= (teamCounts.team2 || 0)
      ? 'team1'
      : 'team2';
  }

  /**
   * Clears match-related cache entries
   */
  private static async clearMatchCache(matchId: string): Promise<void> {
    const cacheKeys = [
      `match:${matchId}:true:true`,
      `match:${matchId}:true:false`,
      `match:${matchId}:false:true`,
      `match:${matchId}:false:false`,
    ];

    await Promise.all(
      cacheKeys.map((key) => cacheDataWithTTL(key, null, 0)) // Set TTL to 0 to clear
    );
  }

  /**
   * Gets active matches for a user
   */
  static async getActiveMatches(
    userId: string
  ): Promise<MatchServiceResponse<Match[]>> {
    try {
      const { data, error } = await supabase
        .from('match_participants')
        .select(
          `
          match_id,
          matches!inner (*)
        `
        )
        .eq('user_id', userId)
        .eq('is_active', true)
        .in('matches.status', ['pending', 'active']);

      if (error) {
        throw error;
      }

      const matches = (data || []).map((row: any) =>
        this.transformMatch(row.matches)
      );

      return {
        data: matches,
        error: null,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'getActiveMatches',
        userId,
      });
      return {
        data: null,
        error: parsedError,
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Gets match invites for a user
   * Note: This would require an invites table - simplified for now
   */
  static async getMatchInvites(
    userId: string
  ): Promise<MatchServiceResponse<any[]>> {
    // Placeholder - would query match_invites table
    return {
      data: [],
      error: null,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Gets live match data for a match
   *
   * @param matchId - ID of the match
   * @returns Live match data or null
   */
  static async getLiveMatchData(
    matchId: string
  ): Promise<MatchServiceResponse<LiveMatchData | null>> {
    try {
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('live_match_data')
        .eq('id', matchId)
        .single();

      if (matchError || !match) {
        return {
          data: null,
          error: {
            code: ErrorCodes.NOT_FOUND,
            message: 'Match not found',
          },
          success: false,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        data: (match.live_match_data as unknown) as LiveMatchData || null,
        error: null,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'getLiveMatchData',
        matchId,
      });
      return {
        data: null,
        error: parsedError,
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// Export singleton methods for convenience
export const matchService = MatchService;

// Export individual methods for easier importing
export const {
  createMatch,
  submitPlay,
  getMatchHistory,
  getMatch,
  joinMatchByCode,
  updateMatchStatus,
  leaveMatch,
  getPlayerMatchStats,
  getMatchEvents,
  deleteMatch,
  updateMatchSettings,
  kickPlayer,
  changePlayerTeam,
  getActiveMatches,
  getMatchInvites,
  getLiveMatchData,
} = MatchService;

// Default export
export default MatchService;
