// services/match/enhancedMatchService.ts
import { supabase } from '../database/databaseService';
import { ApiResponse } from '../../types/api';
import { TrackerMatchFormData, EnhancedMatchSettings } from '../../types/tracker';
import { Match } from '../../types/models';
import { MatchStatus, UserRole } from '../../types/enums';
import type { MatchConfig } from '../../types/models';
import { createDefaultMatchSettings, createParticipantForDefaultPlayer, initializeLiveMatchData } from '../../utils/playerDefaults';
import { createErrorHandler } from '../../utils/errors';
import { sanitizeInput, validateMatchTitle } from '../../utils/validation';
import { MATCH_CONFIG } from '../../constants/config';

/**
 * Enhanced Match Service
 * 
 * Handles match creation, joining, and real-time updates for the tracker system.
 * Manages both database records and live match data synchronization.
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
   * Test function to verify database connectivity and table structure
   */
  static async testDatabaseConnection(): Promise<ApiResponse<{ tables: string[]; user: any }>> {
    try {
      console.log('Testing database connection...');
      console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
      
      // Test basic connection
      const { data: user, error: userError } = await supabase.auth.getUser();
      
      console.log('Auth test result:', { user: !!user, error: userError });
      
      if (userError) {
        throw userError;
      }

      // Test matches table access
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('id')
        .limit(1);

      if (matchesError) {
        throw matchesError;
      }

      // Test match_participants table access
      const { data: participants, error: participantsError } = await supabase
        .from('match_participants')
        .select('match_id')
        .limit(1);

      if (participantsError) {
        throw participantsError;
      }

      return {
        data: {
          tables: ['matches', 'match_participants'],
          user: user.user,
        },
        error: null,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'testDatabaseConnection',
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
   * Creates a match with enhanced settings and default players
   */
  static async createMatch(
    data: EnhancedCreateMatchData,
    creatorId: string
  ): Promise<ApiResponse<Match>> {
    try {
      console.log('Creating enhanced match:', data);
      console.log('Creator ID:', creatorId);
      console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);

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

      // Don't automatically add creator as participant - they can join manually later
      console.log('Match created successfully. Creator can join manually.');

      console.log('Match created successfully');

      // Initialize live match data with empty participants (creator will join manually)
      const participants: any[] = [];
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

  /**
   * Get match by room code
   */
  static async getMatchByRoomCode(roomCode: string): Promise<ApiResponse<Match>> {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          participants:match_participants(
            *,
            profile:profiles(*)
          )
        `)
        .eq('room_code', roomCode)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        return {
          data: null,
          error: {
            message: 'Match not found',
            code: 'MATCH_NOT_FOUND',
          },
          success: false,
          timestamp: new Date().toISOString(),
        };
      }

      // Transform participants to Player format
      const participants = data.participants?.map((participant: any) => ({
        userId: participant.user_id || '',
        username: participant.profile?.username || participant.display_name || 'Unknown Player',
        nickname: participant.profile?.nickname,
        avatarUrl: participant.profile?.avatar_url,
        team: participant.team || '1',
        role: UserRole.PLAYER,
        isActive: true,
        joinedAt: new Date(participant.created_at || Date.now()),
      })) || [];

      const transformedMatch: Match = {
        id: data.id,
        title: data.title || '',
        description: data.description || undefined,
        creatorId: data.creator_id,
        roomCode: data.room_code,
        gameType: data.game_type,
        location: data.location || undefined,
        isPublic: data.is_public || false,
        status: (data.status as MatchStatus) || MatchStatus.PENDING,
        settings: data.settings as MatchConfig,
        createdAt: data.created_at ? new Date(data.created_at) : new Date(),
        endedAt: data.ended_at ? new Date(data.ended_at) : undefined,
        participants,
      };

      return {
        data: transformedMatch,
        error: null,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'getMatchByRoomCode',
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
   * Refresh match data and update player names
   * This is called when players link their accounts to update the UI
   */
  static async refreshMatchData(matchId: string): Promise<ApiResponse<Match>> {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          participants:match_participants(
            *,
            profile:profiles(*)
          )
        `)
        .eq('id', matchId)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        return {
          data: null,
          error: {
            message: 'Match not found',
            code: 'MATCH_NOT_FOUND',
          },
          success: false,
          timestamp: new Date().toISOString(),
        };
      }

      // Transform participants to Player format
      const participants = data.participants?.map((participant: any) => ({
        userId: participant.user_id || '',
        username: participant.profile?.username || participant.display_name || 'Unknown Player',
        nickname: participant.profile?.nickname,
        avatarUrl: participant.profile?.avatar_url,
        team: participant.team || '1',
        role: UserRole.PLAYER,
        isActive: true,
        joinedAt: new Date(participant.created_at || Date.now()),
      })) || [];

      const transformedMatch: Match = {
        id: data.id,
        title: data.title || '',
        description: data.description || undefined,
        creatorId: data.creator_id,
        roomCode: data.room_code,
        gameType: data.game_type,
        location: data.location || undefined,
        isPublic: data.is_public || false,
        status: (data.status as MatchStatus) || MatchStatus.PENDING,
        settings: data.settings as MatchConfig,
        createdAt: data.created_at ? new Date(data.created_at) : new Date(),
        endedAt: data.ended_at ? new Date(data.ended_at) : undefined,
        participants,
      };

      return {
        data: transformedMatch,
        error: null,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'refreshMatchData',
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

  /**
   * Simple join match - just send user info to host's tracker
   */
  static async joinMatchSimple(
    matchId: string,
    userId: string,
    displayName: string,
    avatarUrl?: string,
    position?: string
  ): Promise<ApiResponse<{ participant: any }>> {
    try {
      console.log('Simple join match:', { matchId, userId, displayName, position });

      // Check if user is already a participant
      const { data: existingParticipant, error: checkError } = await supabase
        .from('match_participants')
        .select('*')
        .eq('match_id', matchId)
        .eq('user_id', userId)
        .single();

      if (existingParticipant) {
        console.log('User already joined this match');
        return {
          data: { participant: existingParticipant },
          error: null,
          success: true,
          timestamp: new Date().toISOString(),
        };
      }

      // Determine the slot and team based on position
      let slotId: string;
      let team: string;
      
      if (position) {
        // Map position to slot ID
        const positionMap: { [key: string]: string } = {
          'default_1': 'default_1',
          'default_2': 'default_2', 
          'default_3': 'default_3',
          'default_4': 'default_4',
        };
        slotId = positionMap[position];
        team = slotId === 'default_1' || slotId === 'default_2' ? 'team1' : 'team2';
      } else {
        // Find an available slot
        const { data: allParticipants, error: participantsError } = await supabase
          .from('match_participants')
          .select('*')
          .eq('match_id', matchId);

        if (participantsError) {
          throw participantsError;
        }

        const takenSlots = allParticipants?.map(p => p.user_id) || [];
        const availableSlots = ['default_1', 'default_2', 'default_3', 'default_4'].filter(
          slot => !takenSlots.includes(slot)
        );

        if (availableSlots.length === 0) {
          throw new Error('No available player slots');
        }
        
        slotId = availableSlots[0];
        team = slotId === 'default_1' || slotId === 'default_2' ? 'team1' : 'team2';
      }

      // Check if the specific slot is already taken
      const { data: slotTaken, error: slotCheckError } = await supabase
        .from('match_participants')
        .select('*')
        .eq('match_id', matchId)
        .eq('slot_id', slotId)
        .single();

      if (slotTaken) {
        throw new Error(`Position ${slotId} is already taken`);
      }

      // Create participant record in match_participants table
      const participantData = {
        match_id: matchId,
        user_id: userId,
        slot_id: slotId,
        team: team,
        display_name: displayName,
        avatar_url: avatarUrl,
        role: 'player' as any,
        is_active: true,
        joined_at: new Date().toISOString(),
      };

      const { data: newParticipant, error: insertError } = await supabase
        .from('match_participants')
        .insert(participantData)
        .select('*')
        .single();

      if (insertError) {
        throw insertError;
      }

      // Update live match data to include the new participant
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('live_match_data')
        .eq('id', matchId)
        .single();

      if (matchError || !match) {
        throw new Error('Match not found');
      }

      let liveMatchData = match.live_match_data as any;
      if (!liveMatchData) {
        liveMatchData = {
          livePlayerStats: {},
          liveTeamPenalties: {},
          matchSetup: {
            participants: [],
            playerMap: {},
          },
          recentPlays: [],
          currentScore: { team1: 0, team2: 0 },
        };
      }

      // Add participant to live match data
      const liveParticipant = {
        id: slotId,
        userId: userId,
        displayName: displayName,
        avatarUrl: avatarUrl,
        team: team,
        isRegistered: true,
      };

      liveMatchData.matchSetup.participants.push(liveParticipant);
      liveMatchData.matchSetup.playerMap[userId] = slotId;

      // Update match with new live match data
      const { error: updateError } = await supabase
        .from('matches')
        .update({ live_match_data: liveMatchData as any })
        .eq('id', matchId);

      if (updateError) {
        throw updateError;
      }

      console.log('User joined match successfully:', newParticipant);

      // Broadcast the join event to all connected clients
      try {
        const { realtimeService } = await import('./realtimeService');
        await realtimeService.broadcastPlay(matchId, {
          playerId: userId,
          eventType: 'join' as any,
                                  eventData: {
              // displayName: displayName, // Removed as it's not part of EventData type
              // team: team, // Removed as it's not part of EventData type
              // slotId: slotId, // Removed as it's not part of EventData type
            },
          team: team,
          timestamp: new Date(),
        });
      } catch (broadcastError) {
        console.warn('Failed to broadcast join event:', broadcastError);
        // Don't fail the join if broadcast fails
      }

      return {
        data: { participant: newParticipant },
        error: null,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'joinMatchSimple',
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
   * Link a player to a user account
   */
  static async linkPlayerToUser(
    matchId: string,
    playerId: string,
    userId: string,
    displayName: string
  ): Promise<ApiResponse<{ participant: any }>> {
    try {
      // First, check if the player slot is available
      const { data: existingParticipant, error: checkError } = await supabase
        .from('match_participants')
        .select('*')
        .eq('id', playerId)
        .eq('match_id', matchId)
        .single();

      if (checkError) {
        throw checkError;
      }

      if (!existingParticipant) {
        return {
          data: null,
          error: {
            message: 'Player slot not found',
            code: 'PLAYER_NOT_FOUND',
          },
          success: false,
          timestamp: new Date().toISOString(),
        };
      }

      if (existingParticipant.user_id) {
        return {
          data: null,
          error: {
            message: 'Player slot is already linked to another user',
            code: 'SLOT_ALREADY_LINKED',
          },
          success: false,
          timestamp: new Date().toISOString(),
        };
      }

      // Update the participant with user information
      const { data: updatedParticipant, error: updateError } = await supabase
        .from('match_participants')
        .update({
          user_id: userId,
          display_name: displayName,
          linked_at: new Date().toISOString(),
        })
        .eq('id', playerId)
        .eq('match_id', matchId)
        .select('*')
        .single();

      if (updateError) {
        throw updateError;
      }

      return {
        data: { participant: updatedParticipant },
        error: null,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'linkPlayerToUser',
        matchId,
        playerId,
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
   * Get match by ID
   */
  static async getMatchById(matchId: string): Promise<ApiResponse<Match>> {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          participants:match_participants(
            *,
            profile:profiles(*)
          )
        `)
        .eq('id', matchId)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        return {
          data: null,
          error: {
            message: 'Match not found',
            code: 'MATCH_NOT_FOUND',
          },
          success: false,
          timestamp: new Date().toISOString(),
        };
      }

      // Transform participants to Player format
      const participants = data.participants?.map((participant: any) => ({
        userId: participant.user_id || '',
        username: participant.profile?.username || participant.display_name || 'Unknown Player',
        nickname: participant.profile?.nickname,
        avatarUrl: participant.profile?.avatar_url,
        team: participant.team || '1',
        role: UserRole.PLAYER,
        isActive: true,
        joinedAt: new Date(participant.created_at || Date.now()),
      })) || [];

      const transformedMatch: Match = {
        id: data.id,
        title: data.title || '',
        description: data.description || undefined,
        creatorId: data.creator_id,
        roomCode: data.room_code,
        gameType: data.game_type,
        location: data.location || undefined,
        isPublic: data.is_public || false,
        status: (data.status as MatchStatus) || MatchStatus.PENDING,
        settings: data.settings as MatchConfig,
        createdAt: data.created_at ? new Date(data.created_at) : new Date(),
        endedAt: data.ended_at ? new Date(data.ended_at) : undefined,
        participants,
      };

      return {
        data: transformedMatch,
        error: null,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'getMatchById',
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
export const enhancedMatchService = EnhancedMatchService;

// Export individual methods for easier importing
export const { createMatch, updateMatchSettings, replaceDefaultPlayer } =
  EnhancedMatchService;

// Default export
export default EnhancedMatchService;
