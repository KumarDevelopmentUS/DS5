// hooks/social/useFriends.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/useAuth';
import { FriendService } from '../../services/social/friendService';
import { Friend, User } from '../../types/models';
import { ApiResponse } from '../../types/api';
import { createErrorHandler } from '../../utils/errors';
import { supabase } from '../../services/database/databaseService';

const handleError = createErrorHandler('useFriends', 'friends_hook');

interface FriendWithProfile extends Friend {
  profile?: User;
}

interface UseFriendsOptions {
  enableRealtime?: boolean;
}

export const useFriends = ({
  enableRealtime = true,
}: UseFriendsOptions = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all friend relationships
  const {
    data: friendsResponse,
    isLoading: isLoadingFriends,
    error: friendsError,
    refetch: refetchFriends,
  } = useQuery({
    queryKey: ['friends', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      try {
        // Get all friend relationships where user is either sender or recipient
        const { data: relationships, error } = await supabase
          .from('friends')
          .select(
            `
            *,
            friend:friend_id(id, username, nickname, avatar_url, school),
            user:user_id(id, username, nickname, avatar_url, school)
          `
          )
          .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

        if (error) throw error;

        // Transform relationships into Friend objects
        const friendsList: Friend[] = (relationships || []).map((rel: any) => {
          const isSender = rel.user_id === user.id;
          const friendProfile = isSender ? rel.friend : rel.user;

          return {
            id: friendProfile.id,
            username: friendProfile.username,
            nickname: friendProfile.nickname,
            avatarUrl: friendProfile.avatar_url,
            school: friendProfile.school,
            status: rel.status,
            friendSince:
              rel.status === 'accepted' ? new Date(rel.created_at) : undefined,
          };
        });

        // Separate by status
        const accepted = friendsList.filter((f) => f.status === 'accepted');
        const pending = friendsList.filter((f) => f.status === 'pending');
        const blocked = friendsList.filter((f) => f.status === 'blocked');

        return {
          friends: accepted,
          pending,
          blocked,
        };
      } catch (error) {
        const parsedError = handleError(error, {
          action: 'fetchFriends',
          userId: user.id,
        });
        throw parsedError;
      }
    },
    enabled: !!user?.id,
  });

  const friends = friendsResponse?.friends || [];
  const pendingRequests = friendsResponse?.pending || [];
  const blockedUsers = friendsResponse?.blocked || [];

  // Separate incoming and outgoing requests
  const incomingRequests = useMemo(() => {
    if (!user?.id) return [];

    return pendingRequests.filter((request) => {
      // Check if this is an incoming request
      // We need to query the original relationship to determine direction
      return true; // This would need additional logic to determine direction
    });
  }, [pendingRequests, user?.id]);

  const outgoingRequests = useMemo(() => {
    if (!user?.id) return [];

    return pendingRequests.filter((request) => {
      // Check if this is an outgoing request
      return true; // This would need additional logic to determine direction
    });
  }, [pendingRequests, user?.id]);

  // Search users
  const {
    data: searchResults,
    isLoading: isSearching,
    refetch: searchUsers,
  } = useQuery({
    queryKey: ['userSearch', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .or(`username.ilike.%${searchQuery}%,nickname.ilike.%${searchQuery}%`)
          .neq('id', user?.id || '')
          .limit(20);

        if (error) throw error;

        // Transform to User objects and filter out existing friends
        const users: User[] = (data || []).map((profile: any) => ({
          id: profile.id,
          username: profile.username,
          nickname: profile.nickname,
          avatarUrl: profile.avatar_url,
          school: profile.school,
          isPublic: profile.is_public,
          createdAt: new Date(profile.created_at),
          updatedAt: new Date(profile.updated_at),
          settings: profile.settings || {},
        }));

        // Filter out existing friends and pending requests
        const friendIds = new Set([
          ...friends.map((f) => f.id),
          ...pendingRequests.map((f) => f.id),
          ...blockedUsers.map((f) => f.id),
        ]);

        return users.filter((u) => !friendIds.has(u.id));
      } catch (error) {
        const parsedError = handleError(error, {
          action: 'searchUsers',
          query: searchQuery,
        });
        throw parsedError;
      }
    },
    enabled: searchQuery.length >= 2,
  });

  // Send friend request mutation
  const sendRequestMutation = useMutation({
    mutationFn: (recipientId: string) =>
      FriendService.sendFriendRequest(user?.id || '', recipientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends', user?.id] });
      // Clear search to refresh results
      if (searchQuery) {
        queryClient.invalidateQueries({
          queryKey: ['userSearch', searchQuery],
        });
      }
    },
  });

  // Accept friend request mutation
  const acceptRequestMutation = useMutation({
    mutationFn: (requesterId: string) =>
      FriendService.acceptFriendRequest(user?.id || '', requesterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends', user?.id] });
    },
  });

  // Decline friend request mutation
  const declineRequestMutation = useMutation({
    mutationFn: (requesterId: string) =>
      FriendService.declineFriendRequest(user?.id || '', requesterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends', user?.id] });
    },
  });

  // Remove friend mutation
  const removeFriendMutation = useMutation({
    mutationFn: (friendId: string) =>
      FriendService.removeFriend(user?.id || '', friendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends', user?.id] });
    },
  });

  // Block user mutation
  const blockUserMutation = useMutation({
    mutationFn: async (targetId: string) => {
      // First remove any existing relationship
      await FriendService.removeFriend(user?.id || '', targetId);

      // Then create a blocked relationship
      const { error } = await supabase.from('friends').insert({
        user_id: user?.id || '',
        friend_id: targetId,
        status: 'blocked',
      });

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends', user?.id] });
    },
  });

  // Unblock user mutation
  const unblockUserMutation = useMutation({
    mutationFn: async (targetId: string) => {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('user_id', user?.id || '')
        .eq('friend_id', targetId)
        .eq('status', 'blocked');

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends', user?.id] });
    },
  });

  // Real-time subscriptions
  useEffect(() => {
    if (!enableRealtime || !user?.id) return;

    // Subscribe to friend relationship changes
    const friendsChannel = supabase
      .channel(`friends:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friends',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          refetchFriends();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friends',
          filter: `friend_id=eq.${user.id}`,
        },
        () => {
          refetchFriends();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(friendsChannel);
    };
  }, [user?.id, enableRealtime, refetchFriends]);

  // Helper functions
  const searchForUsers = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    queryClient.removeQueries({ queryKey: ['userSearch'] });
  }, [queryClient]);

  const refresh = useCallback(async () => {
    await refetchFriends();
    if (searchQuery) {
      await searchUsers();
    }
  }, [refetchFriends, searchUsers, searchQuery]);

  return {
    // Data
    friends,
    incomingRequests,
    outgoingRequests,
    blockedUsers,
    searchResults: searchResults || [],

    // Loading states
    isLoading: isLoadingFriends,
    isSearching,

    // Error states
    error: friendsError,

    // Search
    searchQuery,
    searchForUsers,
    clearSearch,

    // Mutations
    sendRequest: sendRequestMutation.mutate,
    acceptRequest: acceptRequestMutation.mutate,
    declineRequest: declineRequestMutation.mutate,
    removeFriend: removeFriendMutation.mutate,
    blockUser: blockUserMutation.mutate,
    unblockUser: unblockUserMutation.mutate,

    // Mutation states
    isSending: sendRequestMutation.isPending,
    isAccepting: acceptRequestMutation.isPending,
    isDeclining: declineRequestMutation.isPending,
    isRemoving: removeFriendMutation.isPending,
    isBlocking: blockUserMutation.isPending,
    isUnblocking: unblockUserMutation.isPending,

    // Counts
    friendCount: friends.length,
    pendingCount: incomingRequests.length,

    // Refresh
    refresh,
  };
};
