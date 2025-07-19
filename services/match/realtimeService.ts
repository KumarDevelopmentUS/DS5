// services/match/realtimeService.ts
import { RealtimeChannel, RealtimePostgresChangesPayload, RealtimePresenceState } from '@supabase/supabase-js';
import { ApiError } from '../../types/api';
import { MatchStatus, PlayType } from '../../types/enums';
import { EventData, Match, MatchEvent, Player, TeamScore } from '../../types/models';
import { createErrorHandler, logError } from '../../utils/errors';
import { supabase } from '../database/databaseService';

/**
 * Realtime Service
 * 
 * Manages real-time subscriptions and broadcasting for live match features.
 * Handles database change subscriptions, presence tracking, and event broadcasting.
 */

// Type definitions for realtime service
export interface MatchSubscriptionCallbacks {
  onMatchUpdate?: (match: Partial<Match>) => void;
  onPlayerJoin?: (player: Player) => void;
  onPlayerLeave?: (playerId: string) => void;
  onNewEvent?: (event: MatchEvent) => void;
  onScoreUpdate?: (score: TeamScore) => void;
  onStatusChange?: (status: MatchStatus) => void;
  onPresenceSync?: (presentPlayers: string[]) => void;
  onError?: (error: ApiError) => void;
  onReconnect?: () => void;
}

export interface BroadcastPlayData {
  playerId: string;
  eventType: PlayType;
  eventData: EventData;
  team: string;
  timestamp: Date;
}

export interface PresenceData {
  userId: string;
  username: string;
  avatarUrl?: string;
  team?: string;
  joinedAt: string;
}

export interface ChatMessage {
  id: string;
  matchId: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  team?: string;
}

// Singleton class to manage all realtime connections
class RealtimeServiceClass {
  private channels: Map<string, RealtimeChannel> = new Map();
  private presenceData: Map<string, PresenceData[]> = new Map();
  private reconnectTimeouts: Map<string, NodeJS.Timeout | number> = new Map();
  private subscriptionCounts: Map<string, number> = new Map(); // Track subscription count per match
  private errorHandler = createErrorHandler(
    'RealtimeService',
    'realtime_operations'
  );

  /**
   * Subscribes to a specific match channel for real-time updates
   *
   * @param matchId - The match ID to subscribe to
   * @param callbacks - Callback functions for different events
   * @param userId - Current user ID for presence tracking
   * @param userData - User data for presence
   * @returns Unsubscribe function
   */
  async subscribeToMatch(
    matchId: string,
    callbacks: MatchSubscriptionCallbacks,
    userId?: string,
    userData?: { username: string; avatarUrl?: string; team?: string }
  ): Promise<() => void> {
    try {
      // Check if already subscribed to this match
      const currentCount = this.subscriptionCounts.get(matchId) || 0;
      if (currentCount > 0) {
        // Already subscribed, just increment count and return existing unsubscribe
        this.subscriptionCounts.set(matchId, currentCount + 1);
        
        // Return a no-op unsubscribe for this specific subscription
        return () => {
          const newCount = this.subscriptionCounts.get(matchId) || 0;
          if (newCount > 1) {
            this.subscriptionCounts.set(matchId, newCount - 1);
          } else {
            // Last subscription, actually unsubscribe
            this.subscriptionCounts.delete(matchId);
            this.unsubscribeFromMatch(matchId);
          }
        };
      }

      // Clean up any existing subscription
      await this.unsubscribeFromMatch(matchId);

      // Create channel name
      const channelName = `match:${matchId}`;

      // Create new channel
      const channel = supabase.channel(channelName, {
        config: {
          broadcast: {
            self: false, // Don't receive own broadcasts
          },
          presence: {
            key: userId || 'anonymous',
          },
        },
      });

      // Store channel reference
      this.channels.set(matchId, channel);
      this.subscriptionCounts.set(matchId, 1);

      // Subscribe to database changes for matches table
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log('Match change received:', payload);
          this.handleMatchChange(payload, callbacks);
        }
      );

      // Subscribe to match_events table changes
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'match_events',
          filter: `match_id=eq.${matchId}`,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log('Match event received:', payload);
          this.handleMatchEventInsert(payload, callbacks);
        }
      );

      // Subscribe to match_participants table changes
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_participants',
          filter: `match_id=eq.${matchId}`,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log('Participant change received:', payload);
          this.handleParticipantChange(payload, callbacks);
        }
      );

      // Subscribe to broadcast events (for real-time play updates)
      channel.on('broadcast', { event: 'play' }, ({ payload }) => {
        if (callbacks.onNewEvent && payload) {
          const event: MatchEvent = {
            id: payload.id || `temp_${Date.now()}`,
            matchId: payload.matchId,
            playerId: payload.playerId,
            eventType: payload.eventType,
            eventData: payload.eventData,
            team: payload.team,
            timestamp: new Date(payload.timestamp),
          };
          callbacks.onNewEvent(event);
        }
      });

      // Subscribe to score updates
      channel.on('broadcast', { event: 'score_update' }, ({ payload }) => {
        if (callbacks.onScoreUpdate && payload) {
          callbacks.onScoreUpdate(payload as TeamScore);
        }
      });

      // Handle presence if user is authenticated
      if (userId && userData) {
        // Track presence
        channel.on('presence', { event: 'sync' }, () => {
          const state =
            channel.presenceState() as RealtimePresenceState<PresenceData>;
          this.handlePresenceSync(matchId, state, callbacks);
        });

        channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
          this.handlePresenceJoin(matchId, key, newPresences, callbacks);
        });

        channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          this.handlePresenceLeave(matchId, key, leftPresences, callbacks);
        });
      }

      // Subscribe to the channel
      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track user presence if authenticated
          if (userId && userData) {
            const presenceData: PresenceData = {
              userId,
              username: userData.username,
              avatarUrl: userData.avatarUrl,
              team: userData.team,
              joinedAt: new Date().toISOString(),
            };
            await channel.track(presenceData);
          }
        } else if (status === 'CHANNEL_ERROR') {
          callbacks.onError?.({
            code: 'CHANNEL_ERROR',
            message: 'Failed to connect to match channel',
          });
          this.scheduleReconnect(matchId, callbacks, userId, userData);
        } else if (status === 'TIMED_OUT') {
          callbacks.onError?.({
            code: 'TIMEOUT',
            message: 'Connection timed out',
          });
          this.scheduleReconnect(matchId, callbacks, userId, userData);
        }
      });

      // Return unsubscribe function
      return () => {
        this.unsubscribeFromMatch(matchId);
      };
    } catch (error) {
      const parsedError = this.errorHandler(error, {
        action: 'subscribeToMatch',
        matchId,
      });
      callbacks.onError?.(parsedError);
      throw parsedError;
    }
  }

  /**
   * Broadcasts a play event to all subscribed clients
   *
   * @param matchId - The match ID
   * @param play - Play data to broadcast
   * @returns Success status
   */
  async broadcastPlay(
    matchId: string,
    play: BroadcastPlayData
  ): Promise<boolean> {
    try {
      const channel = this.channels.get(matchId);
      if (!channel) {
        throw new Error('Not subscribed to match channel');
      }

      await channel.send({
        type: 'broadcast',
        event: 'play',
        payload: {
          id: `play_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          matchId,
          ...play,
          timestamp: play.timestamp.toISOString(),
        },
      });

      return true;
    } catch (error) {
      this.errorHandler(error, {
        action: 'broadcastPlay',
        matchId,
        play,
      });
      return false;
    }
  }

  /**
   * Broadcasts a score update to all subscribed clients
   *
   * @param matchId - The match ID
   * @param score - Updated score
   * @returns Success status
   */
  async broadcastScoreUpdate(
    matchId: string,
    score: TeamScore
  ): Promise<boolean> {
    try {
      const channel = this.channels.get(matchId);
      if (!channel) {
        throw new Error('Not subscribed to match channel');
      }

      await channel.send({
        type: 'broadcast',
        event: 'score_update',
        payload: score,
      });

      return true;
    } catch (error) {
      this.errorHandler(error, {
        action: 'broadcastScoreUpdate',
        matchId,
        score,
      });
      return false;
    }
  }

  /**
   * Gets current presence state for a match
   *
   * @param matchId - The match ID
   * @returns Array of present users
   */
  getPresence(matchId: string): PresenceData[] {
    return this.presenceData.get(matchId) || [];
  }

  /**
   * Unsubscribes from a match channel
   *
   * @param matchId - The match ID
   */
  async unsubscribeFromMatch(matchId: string): Promise<void> {
    try {
      // Clear any reconnect timeout
      const timeout = this.reconnectTimeouts.get(matchId);
      if (timeout) {
        clearTimeout(timeout);
        this.reconnectTimeouts.delete(matchId);
      }

      // Get and unsubscribe from channel
      const channel = this.channels.get(matchId);
      if (channel) {
        await channel.unsubscribe();
        this.channels.delete(matchId);
      }

      // Clear presence data and subscription count
      this.presenceData.delete(matchId);
      this.subscriptionCounts.delete(matchId);
    } catch (error) {
      logError(error, {
        action: 'unsubscribeFromMatch',
        matchId,
      });
    }
  }

  /**
   * Unsubscribes from all active channels
   */
  async unsubscribeAll(): Promise<void> {
    const unsubscribePromises = Array.from(this.channels.keys()).map(
      (matchId) => this.unsubscribeFromMatch(matchId)
    );
    await Promise.all(unsubscribePromises);
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private handleMatchChange(
    payload: RealtimePostgresChangesPayload<any>,
    callbacks: MatchSubscriptionCallbacks
  ) {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (eventType === 'UPDATE' && newRecord) {
      // Handle status change
      if (oldRecord?.status !== newRecord.status) {
        callbacks.onStatusChange?.(newRecord.status as MatchStatus);
      }

      // Handle general match update
      callbacks.onMatchUpdate?.(newRecord);
    }
  }

  private handleMatchEventInsert(
    payload: RealtimePostgresChangesPayload<any>,
    callbacks: MatchSubscriptionCallbacks
  ) {
    const { new: newEvent } = payload;

    if (newEvent && callbacks.onNewEvent) {
      const event: MatchEvent = {
        id: newEvent.id,
        matchId: newEvent.match_id,
        playerId: newEvent.player_id,
        eventType: newEvent.event_type as PlayType,
        eventData: newEvent.event_data as EventData,
        team: newEvent.team,
        timestamp: new Date(newEvent.created_at),
      };
      callbacks.onNewEvent(event);
    }
  }

  private handleParticipantChange(
    payload: RealtimePostgresChangesPayload<any>,
    callbacks: MatchSubscriptionCallbacks
  ) {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (eventType === 'INSERT' && newRecord) {
      // Player joined
      this.fetchPlayerDetails(newRecord.user_id).then((player) => {
        if (player) {
          callbacks.onPlayerJoin?.(player);
        }
      });
    } else if (eventType === 'DELETE' && oldRecord) {
      // Player left
      callbacks.onPlayerLeave?.(oldRecord.user_id);
    } else if (eventType === 'UPDATE' && newRecord) {
      // Check if player became inactive
      if (oldRecord?.is_active && !newRecord.is_active) {
        callbacks.onPlayerLeave?.(newRecord.user_id);
      }
    }
  }

  private handlePresenceSync(
    matchId: string,
    state: RealtimePresenceState<PresenceData>,
    callbacks: MatchSubscriptionCallbacks
  ) {
    const presenceList: PresenceData[] = [];
    const userIds: string[] = [];

    Object.entries(state).forEach(([key, presences]) => {
      if (presences && presences.length > 0) {
        const presence = presences[0] as PresenceData;
        presenceList.push(presence);
        userIds.push(presence.userId);
      }
    });

    this.presenceData.set(matchId, presenceList);
    callbacks.onPresenceSync?.(userIds);
  }

  private handlePresenceJoin(
    matchId: string,
    key: string,
    newPresences: any[],
    callbacks: MatchSubscriptionCallbacks
  ) {
    if (newPresences.length > 0) {
      const presence = newPresences[0] as PresenceData;
      const currentPresence = this.presenceData.get(matchId) || [];
      this.presenceData.set(matchId, [...currentPresence, presence]);
    }
  }

  private handlePresenceLeave(
    matchId: string,
    key: string,
    leftPresences: any[],
    callbacks: MatchSubscriptionCallbacks
  ) {
    if (leftPresences.length > 0) {
      const leftPresence = leftPresences[0] as PresenceData;
      const currentPresence = this.presenceData.get(matchId) || [];
      this.presenceData.set(
        matchId,
        currentPresence.filter((p) => p.userId !== leftPresence.userId)
      );
    }
  }

  private async fetchPlayerDetails(userId: string): Promise<Player | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, nickname, avatar_url')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        userId: data.id,
        username: data.username,
        nickname: data.nickname ?? undefined,
        avatarUrl: data.avatar_url ?? undefined,
        team: undefined,
        role: 'player' as any,
        isActive: true,
        joinedAt: new Date(),
      };
    } catch (error) {
      logError(error, {
        action: 'fetchPlayerDetails',
        userId,
      });
      return null;
    }
  }

  private scheduleReconnect(
    matchId: string,
    callbacks: MatchSubscriptionCallbacks,
    userId?: string,
    userData?: any
  ) {
    // Clear any existing timeout
    const existingTimeout = this.reconnectTimeouts.get(matchId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Schedule reconnect after 5 seconds
    const timeout = setTimeout(async () => {
      try {
        await this.subscribeToMatch(matchId, callbacks, userId, userData);
        callbacks.onReconnect?.();
      } catch (error) {
        // Schedule another reconnect
        this.scheduleReconnect(matchId, callbacks, userId, userData);
      }
    }, 5000);

    this.reconnectTimeouts.set(matchId, timeout);
  }

  /**
   * Checks if currently subscribed to a match
   *
   * @param matchId - The match ID
   * @returns Whether subscribed
   */
  isSubscribed(matchId: string): boolean {
    return this.channels.has(matchId);
  }

  /**
   * Gets all active subscriptions
   *
   * @returns Array of match IDs
   */
  getActiveSubscriptions(): string[] {
    return Array.from(this.channels.keys());
  }

  /**
   * Get subscription statistics for debugging
   */
  getSubscriptionStats(): { matchId: string; count: number }[] {
    return Array.from(this.subscriptionCounts.entries()).map(([matchId, count]) => ({
      matchId,
      count,
    }));
  }

  /**
   * Get total active subscriptions count
   */
  getTotalSubscriptions(): number {
    return this.channels.size;
  }
}

// Export singleton instance
export const realtimeService = new RealtimeServiceClass();

// Export class for testing purposes
export { RealtimeServiceClass };

// Default export
export default realtimeService;
