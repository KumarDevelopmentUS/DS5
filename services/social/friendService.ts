// services/social/friendService.ts

import { ApiResponse, ErrorCodes } from '../../types/api';
import { Friend, User } from '../../types/models';
import { createErrorHandler } from '../../utils/errors';
import type { TableInsert } from '../database/databaseService';
import { supabase } from '../database/databaseService';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface FriendRequestData {
  recipientId: string;
  message?: string;
}

export interface FriendResponse {
  friends: Friend[];
  pending: Friend[];
  blocked: User[];
}

export interface FriendServiceResponse<T = any> extends ApiResponse<T> {}

const handleError = createErrorHandler('FriendService', 'friend_operations');

// ============================================
// SERVICE CLASS
// ============================================

export class FriendService {
  /**
   * Sends a friend request to another user.
   * @param senderId - The ID of the user sending the request.
   * @param recipientId - The ID of the user receiving the request.
   * @returns A success or error response.
   */
  static async sendFriendRequest(
    senderId: string,
    recipientId: string
  ): Promise<FriendServiceResponse<null>> {
    if (senderId === recipientId) {
      return {
        success: false,
        error: {
          code: ErrorCodes.INVALID_INPUT,
          message: 'You cannot send a friend request to yourself.',
        },
        data: null,
        timestamp: new Date().toISOString(),
      };
    }

    try {
      // Check if a friendship or pending request already exists
      const { data: existing, error: existingError } = await supabase
        .from('friends')
        .select('status')
        .or(
          `(user_id.eq.${senderId},friend_id.eq.${recipientId}),(user_id.eq.${recipientId},friend_id.eq.${senderId})`
        )
        .single();

      if (existing) {
        if (existing.status === 'accepted') {
          return {
            success: false,
            error: {
              code: ErrorCodes.ALREADY_EXISTS,
              message: 'You are already friends with this user.',
            },
            data: null,
            timestamp: new Date().toISOString(),
          };
        }
        if (existing.status === 'pending') {
          return {
            success: false,
            error: {
              code: ErrorCodes.ALREADY_EXISTS,
              message: 'A friend request is already pending.',
            },
            data: null,
            timestamp: new Date().toISOString(),
          };
        }
      }

      const requestData: TableInsert<'friends'> = {
        user_id: senderId,
        friend_id: recipientId,
        status: 'pending',
      };

      const { error } = await supabase.from('friends').insert(requestData);

      if (error) throw error;

      return {
        success: true,
        data: null,
        error: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'sendFriendRequest',
        senderId,
        recipientId,
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
   * Accepts a friend request.
   * @param userId - The ID of the user accepting the request.
   * @param requesterId - The ID of the user who sent the request.
   * @returns A success or error response.
   */
  static async acceptFriendRequest(
    userId: string,
    requesterId: string
  ): Promise<FriendServiceResponse<null>> {
    try {
      const { error } = await supabase
        .from('friends')
        .update({ status: 'accepted' })
        .eq('user_id', requesterId)
        .eq('friend_id', userId)
        .eq('status', 'pending');

      if (error) throw error;

      return {
        success: true,
        data: null,
        error: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'acceptFriendRequest',
        userId,
        requesterId,
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
   * Declines a friend request.
   * @param userId - The ID of the user declining the request.
   * @param requesterId - The ID of the user who sent the request.
   * @returns A success or error response.
   */
  static async declineFriendRequest(
    userId: string,
    requesterId: string
  ): Promise<FriendServiceResponse<null>> {
    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('user_id', requesterId)
        .eq('friend_id', userId)
        .eq('status', 'pending');

      if (error) throw error;

      return {
        success: true,
        data: null,
        error: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'declineFriendRequest',
        userId,
        requesterId,
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
   * Removes a friend.
   * @param userId - The ID of the user initiating the removal.
   * @param friendId - The ID of the friend to remove.
   * @returns A success or error response.
   */
  static async removeFriend(
    userId: string,
    friendId: string
  ): Promise<FriendServiceResponse<null>> {
    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .or(
          `(user_id.eq.${userId},friend_id.eq.${friendId}),(user_id.eq.${friendId},friend_id.eq.${userId})`
        )
        .eq('status', 'accepted');

      if (error) throw error;

      return {
        success: true,
        data: null,
        error: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'removeFriend',
        userId,
        friendId,
      });
      return {
        success: false,
        error: parsedError,
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export const friendService = {
  sendFriendRequest: FriendService.sendFriendRequest,
  acceptFriendRequest: FriendService.acceptFriendRequest,
  declineFriendRequest: FriendService.declineFriendRequest,
  removeFriend: FriendService.removeFriend,
};
