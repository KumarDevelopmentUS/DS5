// app/(tabs)/social.tsx
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  RefreshControl,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Layout Components
import { Screen } from '../../components/Layout/Screen';
import {
  EmptyState,
  NoCommunitiesEmptyState,
  NoFriendsEmptyState,
  Spinner,
} from '../../components/Layout/LoadingStates';

// Core Components
import { Button } from '../../components/core/Button';
import { Card } from '../../components/core/Card';
import { Badge } from '../../components/core/Badge';

// Social Components
import { CommunityCard } from '../../components/social/community';
import FriendCard from '../../components/social/Friends/FriendCard';
import { Feed } from '../../components/social/Feed';

// Hooks
import { useAuth } from '../../hooks/auth/useAuth';
import { useTheme } from '../../hooks/ui/useTheme';
import { useFriends } from '../../hooks/social/useFriends';
import { useDebounce } from '../../hooks/ui/useDebounce';

// Services
// import { PostService } from '../../services/social/postService'; // Commented out as it's a TODO

// Constants
import { SPACING, TYPOGRAPHY, BORDERS } from '../../constants/theme';
import { SOCIAL_ROUTES } from '../../constants/routes';

// Types
import { Community, Post, Friend } from '../../types/models';
import { FeedItem } from '../../hooks/social/useCombinedFeed';
import { supabase } from '../../services/database/databaseService';

// Helper to map Supabase community data to our Community type
const mapSupabaseToCommunity = (data: any): Community => ({
  id: data.id,
  name: data.name,
  description: data.description,
  avatarUrl: data.avatar_url,
  bannerUrl: data.banner_url,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  creatorId: data.creator_id,
  isPrivate: data.is_private,
  canJoin: data.can_join,
  school: data.school,
  settings: data.settings,
  // Handle member count which can be an object or a direct value
  memberCount: Array.isArray(data.member_count)
    ? (data.member_count[0]?.count ?? 0)
    : (data.member_count?.count ?? 0),
});

// Tab types for sub-navigation
type SocialTab = 'communities' | 'friends' | 'trending';

/**
 * Social Screen - Main social hub with sub-tabs
 */
const SocialScreen = () => {
  const { user, profile } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  // State management
  const [activeTab, setActiveTab] = useState<SocialTab>('communities');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Friends hook for friend data and counts
  const {
    friends,
    incomingRequests,
    friendCount,
    pendingCount,
    refresh: refreshFriends,
  } = useFriends();

  // Fetch communities
  const {
    data: communitiesResponse,
    isLoading: isLoadingCommunities,
    refetch: refetchCommunities,
  } = useQuery({
    queryKey: ['communities', 'list', user?.id],
    queryFn: async () => {
      // Fetch user's communities
      const { data: memberData } = await supabase
        .from('community_members')
        .select(
          'community:communities(*, member_count:community_members(count))'
        )
        .eq('user_id', user?.id || '');

      const userCommunities =
        memberData?.map((item) => mapSupabaseToCommunity(item.community)) || [];

      // Fetch trending communities (most members)
      const { data: trendingData } = await supabase
        .from('communities')
        .select('*, member_count:community_members(count)')
        .order('member_count', {
          referencedTable: 'community_members',
          ascending: false,
        })
        .limit(10);

      return {
        userCommunities,
        trendingCommunities: trendingData?.map(mapSupabaseToCommunity) || [],
      };
    },
    enabled: !!user,
  });

  // --- TODO: Trending Posts Feature ---
  // const {
  //   data: trendingPosts,
  //   isLoading: isLoadingPosts,
  //   refetch: refetchPosts,
  // } = useQuery({
  //   queryKey: ['posts', 'trending'],
  //   queryFn: async () => {
  //     const response = await PostService.getTrending({
  //       page: 1,
  //       pageSize: 20,
  //     });
  //     return response.data?.items || [];
  //   },
  // });
  const trendingPosts: Post[] = []; // Default to empty array
  const isLoadingPosts = false; // Default to false
  const refetchPosts = () => Promise.resolve(); // Mock refetch function

  // Combined refresh function
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchCommunities(),
        // refetchPosts(), // Don't refetch posts since it's a TODO
        refreshFriends(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchCommunities, refreshFriends]);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!debouncedSearch) {
      return {
        communities: communitiesResponse?.userCommunities || [],
        friends: friends.slice(0, 5), // Show top 5 friends
        posts: trendingPosts,
      };
    }

    const query = debouncedSearch.toLowerCase();

    return {
      communities: (communitiesResponse?.userCommunities || []).filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query)
      ),
      friends: friends.filter(
        (f) =>
          f.username.toLowerCase().includes(query) ||
          f.nickname?.toLowerCase().includes(query)
      ),
      posts: (trendingPosts || []).filter(
        (
          p: Post // Explicitly type 'p' as Post
        ) =>
          p.title?.toLowerCase().includes(query) ||
          p.content.toLowerCase().includes(query)
      ),
    };
  }, [debouncedSearch, communitiesResponse, friends, trendingPosts]);

  // Navigation handlers
  const handleCommunityPress = (community: Community) => {
    router.push(SOCIAL_ROUTES.community(community.id) as any);
  };

  const handleFriendPress = (friend: Friend) => {
    router.push(SOCIAL_ROUTES.friendProfile(friend.id) as any);
  };

  const handlePostPress = (post: Post) => {
    router.push(SOCIAL_ROUTES.post(post.id) as any);
  };

  const handleCreateCommunity = () => {
    router.push('/social/community/create');
  };

  const handleViewAllFriends = () => {
    router.push(SOCIAL_ROUTES.friends() as any);
  };

  const handleFindFriends = () => {
    router.push('/social/friends/find');
  };

  // Render tab buttons
  const renderTabButtons = () => (
    <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
      <Pressable
        style={[
          styles.tabButton,
          activeTab === 'communities' && styles.activeTab,
          activeTab === 'communities' && { borderBottomColor: colors.primary },
        ]}
        onPress={() => setActiveTab('communities')}
      >
        <Ionicons
          name="people"
          size={20}
          color={
            activeTab === 'communities' ? colors.primary : colors.textSecondary
          }
        />
        <Text
          style={[
            styles.tabText,
            {
              color:
                activeTab === 'communities'
                  ? colors.primary
                  : colors.textSecondary,
            },
          ]}
        >
          Communities
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.tabButton,
          activeTab === 'friends' && styles.activeTab,
          activeTab === 'friends' && { borderBottomColor: colors.primary },
        ]}
        onPress={() => setActiveTab('friends')}
      >
        <View style={styles.tabIconContainer}>
          <Ionicons
            name="person-add"
            size={20}
            color={
              activeTab === 'friends' ? colors.primary : colors.textSecondary
            }
          />
          {pendingCount > 0 && (
            <Badge
              variant="count"
              count={pendingCount}
              size="small"
              color="error"
              position="absolute"
              style={styles.tabBadge}
            />
          )}
        </View>
        <Text
          style={[
            styles.tabText,
            {
              color:
                activeTab === 'friends' ? colors.primary : colors.textSecondary,
            },
          ]}
        >
          Friends
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.tabButton,
          activeTab === 'trending' && styles.activeTab,
          activeTab === 'trending' && { borderBottomColor: colors.primary },
        ]}
        onPress={() => setActiveTab('trending')}
      >
        <Ionicons
          name="trending-up"
          size={20}
          color={
            activeTab === 'trending' ? colors.primary : colors.textSecondary
          }
        />
        <Text
          style={[
            styles.tabText,
            {
              color:
                activeTab === 'trending'
                  ? colors.primary
                  : colors.textSecondary,
            },
          ]}
        >
          Trending
        </Text>
      </Pressable>
    </View>
  );

  // Render search bar
  const renderSearchBar = () => (
    <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
      <Ionicons name="search" size={20} color={colors.textSecondary} />
      <TextInput
        style={[styles.searchInput, { color: colors.text }]}
        placeholder={`Search ${activeTab}...`}
        placeholderTextColor={colors.textSecondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
        returnKeyType="search"
      />
      {searchQuery.length > 0 && (
        <Pressable onPress={() => setSearchQuery('')}>
          <Ionicons
            name="close-circle"
            size={20}
            color={colors.textSecondary}
          />
        </Pressable>
      )}
    </View>
  );

  // Render communities tab content
  const renderCommunitiesContent = () => {
    if (isLoadingCommunities) {
      return (
        <View style={styles.loadingContainer}>
          <Spinner size="large" />
        </View>
      );
    }

    const communities = filteredData.communities;
    const hasSearchResults = debouncedSearch && communities.length > 0;
    const noSearchResults = debouncedSearch && communities.length === 0;

    if (communities.length === 0 && !debouncedSearch) {
      return (
        <NoCommunitiesEmptyState
          onJoinCommunity={handleCreateCommunity}
          testID="communities-empty-state"
        />
      );
    }

    if (noSearchResults) {
      return (
        <EmptyState
          title="No communities found"
          message={`No communities match "${debouncedSearch}"`}
          icon={<Text style={{ fontSize: 48 }}> community</Text>}
        />
      );
    }

    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <Button
            variant="primary"
            size="medium"
            onPress={handleCreateCommunity}
            icon={
              <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
            }
            fullWidth
          >
            Create Community
          </Button>
        </View>

        {/* User's communities */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {hasSearchResults ? 'Search Results' : 'Your Communities'}
          </Text>
          <View style={styles.communityList}>
            {communities.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                onPress={() => handleCommunityPress(community)}
                style={styles.communityCard}
              />
            ))}
          </View>
        </View>

        {/* Trending communities */}
        {!debouncedSearch && communitiesResponse?.trendingCommunities && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Trending Communities
            </Text>
            <View style={styles.communityList}>
              {communitiesResponse.trendingCommunities
                .slice(0, 5)
                .map((community) => (
                  <CommunityCard
                    key={community.id}
                    community={community}
                    variant="compact"
                    onPress={() => handleCommunityPress(community)}
                    onJoinPress={() => handleCommunityPress(community)}
                    style={styles.communityCard}
                  />
                ))}
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  // Render friends tab content
  const renderFriendsContent = () => {
    if (!friends && !incomingRequests) {
      return (
        <View style={styles.loadingContainer}>
          <Spinner size="large" />
        </View>
      );
    }

    const friendsList = filteredData.friends;
    const hasSearchResults = debouncedSearch && friendsList.length > 0;
    const noSearchResults = debouncedSearch && friendsList.length === 0;

    if (friends.length === 0 && !debouncedSearch) {
      return (
        <NoFriendsEmptyState
          onInviteFriends={handleFindFriends}
          testID="friends-empty-state"
        />
      );
    }

    if (noSearchResults) {
      return (
        <EmptyState
          title="No friends found"
          message={`No friends match "${debouncedSearch}"`}
          icon={<Text style={{ fontSize: 48 }}> uh oh!</Text>}
        />
      );
    }

    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <Button
            variant="primary"
            size="medium"
            onPress={handleFindFriends}
            icon={
              <Ionicons name="person-add-outline" size={20} color="#FFFFFF" />
            }
            style={styles.actionButton}
          >
            Find Friends
          </Button>
          <Button
            variant="outline"
            size="medium"
            onPress={handleViewAllFriends}
            style={styles.actionButton}
          >
            Manage Friends
          </Button>
        </View>

        {/* Friend requests */}
        {pendingCount > 0 && !debouncedSearch && (
          <Card
            padding="md"
            style={styles.requestsCard}
            pressable
            onPress={handleViewAllFriends}
          >
            <View style={styles.requestsContent}>
              <View style={styles.requestsInfo}>
                <Text style={[styles.requestsTitle, { color: colors.text }]}>
                  Friend Requests
                </Text>
                <Text
                  style={[
                    styles.requestsCount,
                    { color: colors.textSecondary },
                  ]}
                >
                  {pendingCount} pending{' '}
                  {pendingCount === 1 ? 'request' : 'requests'}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={colors.textSecondary}
              />
            </View>
          </Card>
        )}

        {/* Friends list */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {hasSearchResults ? 'Search Results' : `Friends (${friendCount})`}
            </Text>
            {!debouncedSearch && friendCount > 5 && (
              <Pressable onPress={handleViewAllFriends}>
                <Text style={[styles.viewAllText, { color: colors.primary }]}>
                  View All
                </Text>
              </Pressable>
            )}
          </View>
          <View style={styles.friendsList}>
            {friendsList.map((friend) => (
              <FriendCard
                key={friend.id}
                friend={friend}
                onPress={() => handleFriendPress(friend)}
                showActions={false}
                style={styles.friendCard}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    );
  };

  // Render trending tab content
  const renderTrendingContent = () => {
    if (isLoadingPosts) {
      return (
        <View style={styles.loadingContainer}>
          <Spinner size="large" />
        </View>
      );
    }

    const posts = filteredData.posts;
    const noSearchResults = debouncedSearch && posts.length === 0;

    if (posts.length === 0 && !debouncedSearch) {
      return (
        <EmptyState
          title="No trending posts"
          message="This feature is coming soon!"
          icon={<Text style={{ fontSize: 48 }}>🚧</Text>}
        />
      );
    }

    if (noSearchResults) {
      return (
        <EmptyState
          title="No posts found"
          message={`No posts match "${debouncedSearch}"`}
          icon={<Text style={{ fontSize: 48 }}>trending</Text>}
        />
      );
    }

    // Transform posts to FeedItem format
    const feedItems: FeedItem[] = posts.map((post: Post) => ({
      id: post.id,
      type: 'post',
      timestamp: post.createdAt,
      user: post.author,
      data: {
        postId: post.id,
        title: post.title,
        content: post.content,
        communityName: post.community?.name,
        voteCount: post.voteCount,
        commentCount: post.commentCount,
      },
    }));

    return (
      <Feed
        items={feedItems}
        loading={false}
        onRefresh={handleRefresh}
        onItemPress={(item) => {
          if (item.type === 'post' && item.data.postId) {
            handlePostPress({ id: item.data.postId } as Post);
          }
        }}
        emptyMessage="No trending posts at the moment"
      />
    );
  };

  // Main content renderer
  const renderContent = () => {
    switch (activeTab) {
      case 'communities':
        return renderCommunitiesContent();
      case 'friends':
        return renderFriendsContent();
      case 'trending':
        return renderTrendingContent();
      default:
        return null;
    }
  };

  return (
    <Screen
      header={{
        title: 'Social',
        subtitle: profile?.username,
      }}
      style={{ backgroundColor: colors.background }}
      testID="social-screen"
    >
      {renderTabButtons()}
      {renderSearchBar()}
      {renderContent()}
    </Screen>
  );
};
// Styles
const styles = StyleSheet.create({
  // Tab navigation
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    // Dynamic color applied in component
  },
  tabIconContainer: {
    position: 'relative',
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
  },
  tabText: {
    fontSize: TYPOGRAPHY.sizes.callout,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    marginLeft: SPACING.xs,
  },

  // Search bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    borderRadius: BORDERS.md,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginLeft: SPACING.sm,
    paddingVertical: SPACING.xs,
  },

  // Content
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  section: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.headline,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  viewAllText: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },

  // Action buttons
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  actionButton: {
    flex: 1,
  },

  // Communities
  communityList: {
    gap: SPACING.sm,
  },
  communityCard: {
    marginBottom: SPACING.xs,
  },

  // Friends
  requestsCard: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  requestsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  requestsInfo: {
    flex: 1,
  },
  requestsTitle: {
    fontSize: TYPOGRAPHY.sizes.callout,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    marginBottom: SPACING.xxs,
  },
  requestsCount: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  friendsList: {
    gap: SPACING.sm,
  },
  friendCard: {
    marginBottom: SPACING.xs,
  },
});
export default SocialScreen;
