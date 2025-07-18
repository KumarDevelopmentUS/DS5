// services/match/enhancedMatchService.ts - ENHANCED FOR TRACKER
import { supabase } from '../database/databaseService';
import { ApiResponse } from '../../types/api';
import {
  TrackerMatchFormData,
  EnhancedMatchSettings,
} from '../../types/tracker';
import { Match } from '../../types/models';
import { MatchStatus, UserRole } from '../../types/enums';
import {
  createDefaultMatchSettings,
  createParticipantForDefaultPlayer,
  initializeLiveMatchData,
} from '../../utils/playerDefaults';
import { createErrorHandler } from '../../utils/errors';
import { sanitizeInput, validateMatchTitle } from '../../utils/validation';
import { MATCH_CONFIG } from '../../constants/config';

/**
 * Enhanced Match Service for Tracker System
 *
 * Handles match creation with full team/player name support
 * Creates default players in the database for complete match tracking
 */

// Enhanced create match data interface
export interface EnhancedCreateMatchData {
  title: string;
  description?: string;
  gameType?: string;
  location?: string;
  isPublic?: boolean;
  settings: EnhancedMatchSettings;
}

const handleError = createErrorHandler(
  'EnhancedMatchService',
  'match_operations'
);

/**
 * Enhanced Match Service Class
 */
export class EnhancedMatchService {
  /**
   * Creates a match with enhanced settings and default players
   */
  static async createMatch(
    data: EnhancedCreateMatchData,
    creatorId: string
  ): Promise<ApiResponse<Match>> {
    try {
      console.log('Creating enhanced match:', data);

      // Validate input
      const titleValidation = validateMatchTitle(data.title);
      if (!titleValidation.isValid) {
        return {
          data: null,
          error: {
            code: 'VALIDATION_FAILED',
            message: titleValidation.error!,
          },
          success: false,
          timestamp: new Date().toISOString(),
        };
      }

      // Generate unique room code
      const roomCode = await this.generateUniqueRoomCode();

      // Prepare match data for database
      const matchData = {
        title: sanitizeInput(data.title),
        description: data.description
          ? sanitizeInput(data.description, { maxLength: 500 })
          : null,
        creator_id: creatorId,
        room_code: roomCode,
        game_type: data.gameType || 'die_stats',
        location: data.location || null,
        is_public: data.isPublic ?? true,
        status: 'pending' as MatchStatus,
        settings: data.settings as any, // Store enhanced settings as JSONB
      };

      console.log('Prepared match data for database:', matchData);

      // Create match in database
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert(matchData)
        .select()
        .single();

      if (matchError || !match) {
        console.error('Match creation error:', matchError);
        throw matchError || new Error('Failed to create match');
      }

      console.log('Match created in database:', match.id);

      // Add creator as first participant
      const creatorParticipant = {
        match_id: match.id,
        user_id: creatorId,
        team: 'team1',
        role: 'player' as UserRole,
        is_active: true,
      };

      // Insert creator
      const { error: creatorError } = await supabase
        .from('match_participants')
        .insert([creatorParticipant]);

      if (creatorError) {
        console.error('Creator participant error:', creatorError);
        // Rollback match creation
        await supabase.from('matches').delete().eq('id', match.id);
        throw creatorError;
      }

      console.log('Creator added as participant successfully');

      // Initialize live match data
      const participants = [creatorParticipant];
      const liveMatchData = initializeLiveMatchData(match, participants);

      // Update match with live match data
      const { error: liveDataError } = await supabase
        .from('matches')
        .update({ live_match_data: liveMatchData as any })
        .eq('id', match.id);

      if (liveDataError) {
        console.error('Live match data initialization error:', liveDataError);
        // Rollback match creation
        await supabase.from('matches').delete().eq('id', match.id);
        await supabase.from('match_participants').delete().eq('match_id', match.id);
        throw liveDataError;
      }

      console.log('Live match data initialized successfully');

      // Transform to Match type
      const transformedMatch: Match = this.transformMatch(match);

      return {
        data: transformedMatch,
        error: null,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'createEnhancedMatch',
        data,
        creatorId,
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
   * Creates a match for guest users (temporary, not saved to database)
   */
  static async createGuestMatch(
    data: EnhancedCreateMatchData
  ): Promise<ApiResponse<Match>> {
    try {
      console.log('Creating guest match:', data);

      // Validate input
      const titleValidation = validateMatchTitle(data.title);
      if (!titleValidation.isValid) {
        return {
          data: null,
          error: {
            code: 'VALIDATION_FAILED',
            message: titleValidation.error!,
          },
          success: false,
          timestamp: new Date().toISOString(),
        };
      }

      // Generate unique room code
      const roomCode = await this.generateUniqueRoomCode();

      // Create a temporary match object (not saved to database)
      const tempMatch = {
        id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: sanitizeInput(data.title),
        description: data.description
          ? sanitizeInput(data.description, { maxLength: 500 })
          : null,
        creator_id: null, // No creator for guest matches
        room_code: roomCode,
        game_type: data.gameType || 'die_stats',
        location: data.location || null,
        is_public: data.isPublic ?? true,
        status: 'pending' as MatchStatus,
        settings: data.settings as any,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        started_at: null,
        ended_at: null,
        live_match_data: null, // Will be initialized when match starts
      };

      console.log('Guest match created (temporary):', tempMatch.id);

      // Transform to Match type
      const transformedMatch: Match = this.transformMatch(tempMatch);

      return {
        data: transformedMatch,
        error: null,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'createGuestMatch',
        data,
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
   * Updates match settings including team/player names
   */
  static async updateMatchSettings(
    matchId: string,
    settings: Partial<EnhancedMatchSettings>,
    userId: string
  ): Promise<ApiResponse<Match>> {
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
            code: 'PERMISSION_DENIED',
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
            code: 'VALIDATION_FAILED',
            message: 'Cannot update settings after match has started',
          },
          success: false,
          timestamp: new Date().toISOString(),
        };
      }

      // Merge settings
      const currentSettings = (match.settings as any) as EnhancedMatchSettings || {};
      const updatedSettings: EnhancedMatchSettings = {
        ...currentSettings,
        ...settings,
      };

      // Update match
      const { data: updatedMatch, error: updateError } = await supabase
        .from('matches')
        .update({ settings: updatedSettings as any })
        .eq('id', matchId)
        .select()
        .single();

      if (updateError || !updatedMatch) {
        throw updateError || new Error('Failed to update settings');
      }

      return {
        data: this.transformMatch(updatedMatch),
        error: null,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'updateEnhancedMatchSettings',
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
   * Generates a unique room code
   */
  private static async generateUniqueRoomCode(): Promise<string> {
    const maxAttempts = 10;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Generate code in format LNNNNN (1 letter + 5 digits)
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
  private static transformMatch(dbMatch: any): Match {
    return {
      id: dbMatch.id,
      roomCode: dbMatch.room_code,
      title: dbMatch.title,
      description: dbMatch.description || undefined,
      creatorId: dbMatch.creator_id,
      status: dbMatch.status as MatchStatus,
      gameType: dbMatch.game_type,
      settings: dbMatch.settings as EnhancedMatchSettings,
      location: dbMatch.location || undefined,
      startedAt: dbMatch.started_at ? new Date(dbMatch.started_at) : undefined,
      endedAt: dbMatch.ended_at ? new Date(dbMatch.ended_at) : undefined,
      createdAt: new Date(dbMatch.created_at!),
      isPublic: dbMatch.is_public || false,
    };
  }

  /**
   * Adds a real user to a specific position (replaces default player slot)
   */
  static async replaceDefaultPlayer(
    matchId: string,
    position: 1 | 2 | 3 | 4,
    newUserId: string,
    requesterId: string
  ): Promise<ApiResponse<null>> {
    try {
      // Verify requester can make this change
      const { data: match } = await supabase
        .from('matches')
        .select('creator_id, status')
        .eq('id', matchId)
        .single();

      if (!match) {
        throw new Error('Match not found');
      }

      if (match.creator_id !== requesterId) {
        return {
          data: null,
          error: {
            code: 'PERMISSION_DENIED',
            message: 'Only the match creator can add players',
          },
          success: false,
          timestamp: new Date().toISOString(),
        };
      }

      // Check if position is already taken
      const { data: participants } = await supabase
        .from('match_participants')
        .select('user_id, team')
        .eq('match_id', matchId);

      if (!participants) {
        throw new Error('Failed to fetch participants');
      }

      // Determine which team this position belongs to
      const team = position <= 2 ? 'team1' : 'team2';
      
      // Check if there's already a player in this team position
      const teamParticipants = participants.filter(p => p.team === team);
      const positionInTeam = position <= 2 ? position - 1 : position - 3; // Convert to 0-based index
      
      if (positionInTeam < teamParticipants.length) {
        return {
          data: null,
          error: {
            code: 'POSITION_OCCUPIED',
            message: `Position ${position} is already occupied`,
          },
          success: false,
          timestamp: new Date().toISOString(),
        };
      }

      // Add new real player
      const { error: insertError } = await supabase
        .from('match_participants')
        .insert([
          {
            match_id: matchId,
            user_id: newUserId,
            team,
            role: 'player' as UserRole,
            is_active: true,
          },
        ]);

      if (insertError) {
        throw insertError;
      }

      return {
        data: null,
        error: null,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'replaceDefaultPlayer',
        matchId,
        position,
        newUserId,
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
export const enhancedMatchService = EnhancedMatchService;

// Export individual methods for easier importing
export const { createMatch, updateMatchSettings, replaceDefaultPlayer } =
  EnhancedMatchService;

// Default export
export default EnhancedMatchService;
