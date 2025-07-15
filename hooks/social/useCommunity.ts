// hooks/social/useCommunity.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/useAuth';
import { CommunityService } from '../../services/social/communityService';
import { PostService } from '../../services/social/postService';
import {
  Community,
  Post,
  User,
  PaginatedResponse,
  PaginationParams,
} from '../../types/models';
import { ApiResponse } from '../../types/api';
import { UserRole } from '../../types/enums';
import { createErrorHandler } from '../../utils/errors';
import { supabase } from '../../services/database/databaseService';

const handleError = createErrorHandler('useCommunity', 'community_hook');

interface UseCommunityOptions {
  communityId: string;
  enableRealtime?: boolean;
}

interface CommunityMember {
  user: User;
  role: UserRole;
  joinedAt: Date;
}

export const useCommunity = ({
  communityId,
  enableRealtime = true,
}: UseCommunityOptions) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [postsPage, setPostsPage] = useState(1);
  const [membersPage, setMembersPage] = useState(1);

  // Fetch community details
  const {
    data: communityResponse,
    isLoading: isLoadingCommunity,
    error: communityError,
    refetch: refetchCommunity,
  } = useQuery({
    queryKey: ['community', communityId],
    queryFn: () => CommunityService.getCommunity(communityId, user?.id),
    enabled: !!communityId,
  });

  const community = communityResponse?.data || null;

  // Fetch user's membership status
  const {
    data: membershipResponse,
    isLoading: isLoadingMembership,
    refetch: refetchMembership,
  } = useQuery({
    queryKey: ['communityMembership', communityId, user?.id],
    queryFn: () =>
      CommunityService.getCommunityMembership(user?.id || '', communityId),
    enabled: !!user && !!communityId,
  });

  const membership = membershipResponse?.data || null;

  // Fetch community posts
  const {
    data: postsResponse,
    isLoading: isLoadingPosts,
    error: postsError,
    refetch: refetchPosts,
  } = useQuery({
    queryKey: ['communityPosts', communityId, postsPage],
    queryFn: () =>
      PostService.getPostsByCommunity(communityId, {
        page: postsPage,
        pageSize: 20,
      }),
    enabled: !!communityId,
  });

  const posts = postsResponse?.data || null;

  // Fetch community members
  const {
    data: membersResponse,
    isLoading: isLoadingMembers,
    error: membersError,
    refetch: refetchMembers,
  } = useQuery({
    queryKey: ['communityMembers', communityId, membersPage],
    queryFn: async () => {
      try {
        const { data, error, count } = await supabase
          .from('community_members')
          .select(
            `
            user_id,
            role,
            joined_at,
            user:profiles(*)
          `,
            { count: 'exact' }
          )
          .eq('community_id', communityId)
          .order('joined_at', { ascending: false })
          .range((membersPage - 1) * 20, membersPage * 20 - 1);

        if (error) throw error;

        const members: CommunityMember[] = (data || []).map((member: any) => ({
          user: {
            id: member.user.id,
            username: member.user.username,
            nickname: member.user.nickname,
            avatarUrl: member.user.avatar_url,
            school: member.user.school,
            isPublic: member.user.is_public,
            createdAt: new Date(member.user.created_at),
            updatedAt: new Date(member.user.updated_at),
            settings: member.user.settings || {},
          },
          role: member.role as UserRole,
          joinedAt: new Date(member.joined_at),
        }));

        const response: ApiResponse<PaginatedResponse<CommunityMember>> = {
          success: true,
          data: {
            items: members,
            pagination: {
              page: membersPage,
              pageSize: 20,
              totalPages: Math.ceil((count || 0) / 20),
            },
            hasMore: (count || 0) > membersPage * 20,
            totalCount: count || 0,
          },
          error: null,
          timestamp: new Date().toISOString(),
        };

        return response;
      } catch (error) {
        const parsedError = handleError(error, {
          action: 'fetchMembers',
          communityId,
        });
        return {
          success: false,
          data: null,
          error: parsedError,
          timestamp: new Date().toISOString(),
        };
      }
    },
    enabled: !!communityId,
  });

  const members = membersResponse?.data || null;

  // Join community mutation
  const joinCommunityMutation = useMutation({
    mutationFn: () =>
      CommunityService.addCommunityMember(communityId, user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['communityMembership', communityId],
      });
      queryClient.invalidateQueries({ queryKey: ['community', communityId] });
      queryClient.invalidateQueries({
        queryKey: ['communityMembers', communityId],
      });
    },
  });

  // Leave community mutation
  const leaveCommunityMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', user?.id || '');

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['communityMembership', communityId],
      });
      queryClient.invalidateQueries({ queryKey: ['community', communityId] });
      queryClient.invalidateQueries({
        queryKey: ['communityMembers', communityId],
      });
    },
  });

  // Update community mutation
  const updateCommunityMutation = useMutation({
    mutationFn: (
      data: Parameters<typeof CommunityService.updateCommunity>[2]
    ) => {
      // The user's full profile is available in the 'membership' object.
      // If the user can edit, they must be a member, so 'membership.user' will exist.
      if (!membership?.user) {
        throw new Error(
          'Authenticated user profile not found or user is not a member.'
        );
      }
      return CommunityService.updateCommunity(
        membership.user,
        communityId,
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', communityId] });
    },
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: (
      postData: Omit<
        Parameters<typeof PostService.createPost>[0],
        'communityId' | 'authorId'
      >
    ) =>
      PostService.createPost({
        ...postData,
        communityId,
        authorId: user?.id || '',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['communityPosts', communityId],
      });
    },
  });

  // Real-time subscriptions
  useEffect(() => {
    if (!enableRealtime || !communityId) return;

    // Subscribe to community updates
    const communityChannel = supabase
      .channel(`community:${communityId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'communities',
          filter: `id=eq.${communityId}`,
        },
        () => {
          refetchCommunity();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `community_id=eq.${communityId}`,
        },
        () => {
          refetchPosts();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_members',
          filter: `community_id=eq.${communityId}`,
        },
        () => {
          refetchMembers();
          refetchMembership();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(communityChannel);
    };
  }, [
    communityId,
    enableRealtime,
    refetchCommunity,
    refetchPosts,
    refetchMembers,
    refetchMembership,
  ]);

  // Computed permissions
  const permissions = useMemo(
    () => ({
      canEdit:
        membership?.role === UserRole.ADMIN ||
        membership?.role === UserRole.MODERATOR,
      canDelete: membership?.role === UserRole.ADMIN,
      canManageMembers:
        membership?.role === UserRole.ADMIN ||
        membership?.role === UserRole.MODERATOR,
      canCreatePost: !!membership,
      canJoin: !membership && community?.canJoin,
      canLeave: !!membership && membership.role !== UserRole.ADMIN,
    }),
    [membership, community]
  );

  // Helper functions
  const loadMorePosts = useCallback(() => {
    if (posts?.hasMore) {
      setPostsPage((prev) => prev + 1);
    }
  }, [posts?.hasMore]);

  const loadMoreMembers = useCallback(() => {
    if (members?.hasMore) {
      setMembersPage((prev) => prev + 1);
    }
  }, [members?.hasMore]);

  const refreshCommunity = useCallback(async () => {
    await Promise.all([
      refetchCommunity(),
      refetchPosts(),
      refetchMembers(),
      refetchMembership(),
    ]);
  }, [refetchCommunity, refetchPosts, refetchMembers, refetchMembership]);

  return {
    // Data
    community,
    posts: posts?.items || [],
    members: members?.items || [],
    membership,

    // Loading states
    isLoading: isLoadingCommunity || isLoadingMembership,
    isLoadingPosts,
    isLoadingMembers,

    // Error states
    error: communityError || postsError || membersError,

    // Pagination
    hasMorePosts: posts?.hasMore || false,
    hasMoreMembers: members?.hasMore || false,
    loadMorePosts,
    loadMoreMembers,

    // Mutations
    joinCommunity: joinCommunityMutation.mutate,
    leaveCommunity: leaveCommunityMutation.mutate,
    updateCommunity: updateCommunityMutation.mutate,
    createPost: createPostMutation.mutate,

    // Mutation states
    isJoining: joinCommunityMutation.isPending,
    isLeaving: leaveCommunityMutation.isPending,
    isUpdating: updateCommunityMutation.isPending,
    isCreatingPost: createPostMutation.isPending,

    // Permissions
    permissions,

    // Refresh
    refresh: refreshCommunity,
  };
};
