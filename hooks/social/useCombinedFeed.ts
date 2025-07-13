// hooks/social/useCombinedFeed.ts
import { useEffect, useState, useCallback } from 'react';
import { useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
import { useAuth } from '../auth/useAuth';
import { supabase } from '../../services/database/databaseService';
import { User } from '../../types/models';

// ============================================
// TYPE DEFINITIONS
// ============================================

export type FeedItemType = 'post' | 'match_result' | 'friend_activity';

export interface BaseFeedItem {
  id: string;
  type: FeedItemType;
  timestamp: Date;
  userId: string;
  user?: User;
}

export interface PostFeedItem extends BaseFeedItem {
  type: 'post';
  data: {
    postId: string;
    content: string;
    communityId: string;
    communityName?: string;
    createdAt: Date;
  };
}

export interface MatchResultFeedItem extends BaseFeedItem {
  type: 'match_result';
  data: {
    matchId: string;
    title: string;
    gameType: string;
    playerCount: number;
    endedAt?: Date;
  };
}

export interface FriendActivityFeedItem extends BaseFeedItem {
  type: 'friend_activity';
  data: {
    action: 'joined_match' | 'became_friends' | 'created_match';
    targetUserName?: string;
    matchTitle?: string;
  };
}

export type FeedItem =
  | PostFeedItem
  | MatchResultFeedItem
  | FriendActivityFeedItem;

export interface UseCombinedFeedOptions {
  pageSize?: number;
  includeMatchResults?: boolean;
  includeFriendActivities?: boolean;
  communityIds?: string[];
}

export interface UseCombinedFeedResult {
  feedItems: FeedItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  refresh: () => void;
}

interface QueryResult {
  items: FeedItem[];
  nextCursor: number | null;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Transforms database profile to User model
 */
const transformProfile = (profile: any): User => {
  return {
    id: profile.id,
    username: profile.username,
    nickname: profile.nickname,
    avatarUrl: profile.avatar_url,
    school: profile.school,
    createdAt: new Date(profile.created_at || Date.now()),
    updatedAt: new Date(profile.updated_at || Date.now()),
    isPublic: profile.is_public ?? true,
    settings: profile.settings || {},
  };
};

/**
 * Fetches posts from user's communities and friends
 */
const fetchPosts = async (
  userId: string,
  limit: number,
  offset: number,
  communityIds?: string[]
): Promise<PostFeedItem[]> => {
  try {
    // Build the query
    let query = supabase
      .from('posts')
      .select(
        `
        *,
        author:profiles!posts_author_id_fkey(*),
        community:communities!posts_community_id_fkey(id, name)
      `
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by communities if specified
    if (communityIds && communityIds.length > 0) {
      query = query.in('community_id', communityIds);
    } else {
      // Otherwise, get posts from user's communities
      const { data: userCommunities } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', userId);

      if (userCommunities && userCommunities.length > 0) {
        const ids = userCommunities.map((c) => c.community_id);
        query = query.in('community_id', ids);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map((post) => ({
      id: `post_${post.id}`,
      type: 'post' as const,
      timestamp: new Date(post.created_at || Date.now()),
      userId: post.author_id,
      user: post.author ? transformProfile(post.author) : undefined,
      data: {
        postId: post.id,
        content: post.content,
        communityId: post.community_id ?? '',
        communityName: post.community?.name,
        createdAt: new Date(post.created_at || Date.now()),
      },
    }));
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

/**
 * Fetches recent match results for friends
 */
const fetchMatchResults = async (
  userId: string,
  limit: number,
  offset: number
): Promise<MatchResultFeedItem[]> => {
  try {
    // Get user's friends
    const { data: friends } = await supabase
      .from('friends')
      .select('friend_id')
      .eq('user_id', userId)
      .eq('status', 'accepted');

    if (!friends || friends.length === 0) return [];

    const friendIds = friends.map((f) => f.friend_id);
    // Also include the user's own matches
    friendIds.push(userId);

    // Get recent completed matches from friends and self
    const { data: matches, error } = await supabase
      .from('matches')
      .select(
        `
        *,
        creator:profiles!matches_creator_id_fkey(*),
        participants:match_participants(user_id, team)
      `
      )
      .in('creator_id', friendIds)
      .eq('status', 'completed')
      .order('ended_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return (matches || []).map((match) => ({
      id: `match_${match.id}`,
      type: 'match_result' as const,
      timestamp: new Date(match.ended_at || match.created_at || Date.now()),
      userId: match.creator_id,
      user: match.creator ? transformProfile(match.creator) : undefined,
      data: {
        matchId: match.id,
        title: match.title,
        gameType: match.game_type,
        playerCount: match.participants?.length || 0,
        endedAt: match.ended_at ? new Date(match.ended_at) : undefined,
      },
    }));
  } catch (error) {
    console.error('Error fetching match results:', error);
    return [];
  }
};

/**
 * Fetches friend activities (recent friendships, matches created)
 */
const fetchFriendActivities = async (
  userId: string,
  limit: number,
  offset: number
): Promise<FriendActivityFeedItem[]> => {
  try {
    const activities: FriendActivityFeedItem[] = [];

    // Fetch recent friendships
    const { data: recentFriends, error: friendsError } = await supabase
      .from('friends')
      .select(
        `
        *,
        user:profiles!friends_user_id_fkey(*),
        friend:profiles!friends_friend_id_fkey(*)
      `
      )
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false })
      .range(offset, Math.min(offset + 5, offset + limit - 1)); // Limit friend activities

    if (friendsError) throw friendsError;

    if (recentFriends) {
      recentFriends.forEach((friendship) => {
        const isUserInitiator = friendship.user_id === userId;
        const otherUser = isUserInitiator ? friendship.friend : friendship.user;
        const activityUser = isUserInitiator
          ? friendship.user
          : friendship.friend;

        activities.push({
          id: `friend_${friendship.user_id}_${friendship.friend_id}_${friendship.created_at}`,
          type: 'friend_activity' as const,
          timestamp: new Date(friendship.created_at || Date.now()),
          userId: activityUser.id,
          user: transformProfile(activityUser),
          data: {
            action: 'became_friends' as const,
            targetUserName: otherUser?.username,
          },
        });
      });
    }

    // Fetch recently created matches by friends
    const { data: friends } = await supabase
      .from('friends')
      .select('friend_id')
      .eq('user_id', userId)
      .eq('status', 'accepted');

    if (friends && friends.length > 0) {
      const friendIds = friends.map((f) => f.friend_id);

      const { data: recentMatches } = await supabase
        .from('matches')
        .select(
          `
          *,
          creator:profiles!matches_creator_id_fkey(*)
        `
        )
        .in('creator_id', friendIds)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .range(0, 4); // Limit to 5 recent match creations

      if (recentMatches) {
        recentMatches.forEach((match) => {
          activities.push({
            id: `match_created_${match.id}`,
            type: 'friend_activity' as const,
            timestamp: new Date(match.created_at || Date.now()),
            userId: match.creator_id,
            user: match.creator ? transformProfile(match.creator) : undefined,
            data: {
              action: 'created_match' as const,
              matchTitle: match.title,
            },
          });
        });
      }
    }

    // Sort activities by timestamp and return requested slice
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching friend activities:', error);
    return [];
  }
};

/**
 * Merges and sorts feed items by timestamp
 */
const mergeFeedItems = (items: FeedItem[][]): FeedItem[] => {
  return items
    .flat()
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// ============================================
// MAIN HOOK
// ============================================

export const useCombinedFeed = (
  options: UseCombinedFeedOptions = {}
): UseCombinedFeedResult => {
  const {
    pageSize = 20,
    includeMatchResults = true,
    includeFriendActivities = true,
    communityIds,
  } = options;

  const { user } = useAuth();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);

  // Use infinite query for pagination
  const {
    data,
    isLoading,
    isFetchingNextPage,
    error,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery<QueryResult, Error>({
    queryKey: ['combinedFeed', user?.id, options],
    queryFn: async ({ pageParam = 0 }) => {
      if (!user?.id) return { items: [], nextCursor: null };

      const offset = pageParam as number;
      const promises: Promise<FeedItem[]>[] = [];

      // Fetch posts (always included)
      promises.push(fetchPosts(user.id, pageSize, offset, communityIds));

      // Conditionally fetch other content types
      if (includeMatchResults) {
        promises.push(
          fetchMatchResults(user.id, Math.floor(pageSize / 2), offset)
        );
      }

      if (includeFriendActivities) {
        promises.push(
          fetchFriendActivities(user.id, Math.floor(pageSize / 3), offset)
        );
      }

      // Execute all fetches in parallel
      const results = await Promise.all(promises);

      // Merge and sort items
      const mergedItems = mergeFeedItems(results);

      // Take only pageSize items
      const pageItems = mergedItems.slice(0, pageSize);

      return {
        items: pageItems,
        nextCursor: pageItems.length === pageSize ? offset + pageSize : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!user?.id,
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    initialPageParam: 0,
  });

  // Update feedItems when data changes
  useEffect(() => {
    if (data?.pages) {
      const allItems = data.pages.flatMap((page) => page.items);
      setFeedItems(allItems);
    }
  }, [data]);

  // Refresh function
  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    feedItems,
    isLoading,
    isLoadingMore: isFetchingNextPage,
    error: error as Error | null,
    hasNextPage: hasNextPage ?? false,
    fetchNextPage: () => fetchNextPage(),
    refresh,
  };
};

// ============================================
// EXPORT ADDITIONAL UTILITIES
// ============================================

/**
 * Formats a feed item for display
 */
export const formatFeedItem = (item: FeedItem): string => {
  switch (item.type) {
    case 'post':
      return `${item.user?.username || 'Someone'} posted in ${item.data.communityName || 'a community'}`;

    case 'match_result':
      return `${item.user?.username || 'Someone'} completed a match: ${item.data.title}`;

    case 'friend_activity':
      switch (item.data.action) {
        case 'became_friends':
          return `${item.user?.username || 'Someone'} became friends with ${item.data.targetUserName}`;
        case 'created_match':
          return `${item.user?.username || 'Someone'} created a match: ${item.data.matchTitle}`;
        case 'joined_match':
          return `${item.user?.username || 'Someone'} joined a match`;
        default:
          return `${item.user?.username || 'Someone'} was active`;
      }

    default:
      return 'Activity';
  }
};

/**
 * Get feed item icon based on type
 */
export const getFeedItemIcon = (item: FeedItem): string => {
  switch (item.type) {
    case 'post':
      return 'chatbubble-outline';
    case 'match_result':
      return 'trophy-outline';
    case 'friend_activity':
      return 'people-outline';
    default:
      return 'ellipse-outline';
  }
};
