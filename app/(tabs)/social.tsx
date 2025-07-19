// app/(tabs)/social.tsx
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native';

// Layout Components - CHANGED: Using SimpleScreen instead of Screen
import {
  EmptyState,
  NoCommunitiesEmptyState,
  NoFriendsEmptyState,
  Spinner,
} from '../../components/Layout/LoadingStates';
import { SimpleScreen } from '../../components/Layout/Screen/SimpleScreen';

// Core Components
import { Badge } from '../../components/core/Badge';
import { Button } from '../../components/core/Button';
import { Card } from '../../components/core/Card';

// Social Components
import { CommunityCard } from '../../components/social/community';
import { Feed } from '../../components/social/Feed';
import FriendCard from '../../components/social/Friends/FriendCard';

// Hooks
import { useAuth } from '../../hooks/auth/useAuth';
import { useFriends } from '../../hooks/social/useFriends';
import { useDebounce } from '../../hooks/ui/useDebounce';
import { useTheme } from '../../hooks/ui/useTheme';

// Services
// import { PostService } from '../../services/social/postService'; // Commented out as it's a TODO

// Constants
import { SOCIAL_ROUTES } from '../../constants/routes';
import { BORDERS, SPACING, TYPOGRAPHY } from '../../constants/theme';

// Types
import { FeedItem } from '../../hooks/social/useCombinedFeed';
import { supabase } from '../../services/database/databaseService';
import { Community, Friend, Post } from '../../types/models';

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
  const { user, profile, isAuthenticated, isGuest } = useAuth();
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

  // Handle authentication actions
  const handleSignIn = () => {
    router.push('/(auth)/login');
  };

  const handleSignUp = () => {
    router.push('/(auth)/signup');
  };

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
    router.push('/social/community/create' as any);
  };

  const handleViewAllFriends = () => {
    router.push(SOCIAL_ROUTES.friends() as any);
  };

  const handleFindFriends = () => {
    router.push('/social/friends/find' as any);
  };

  // Render segmented control with Apple-like styling (matching profile screen)
  const renderSegmentedControl = () => (
    <View style={[styles.segmentedControl, { backgroundColor: colors.fill }]}>
      {[
        { key: 'communities', label: 'Communities' },
        { key: 'friends', label: 'Friends' },
        { key: 'trending', label: 'Trending' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.segmentTab,
            activeTab === tab.key && { backgroundColor: colors.background },
          ]}
          onPress={() => setActiveTab(tab.key as SocialTab)}
        >
          <View style={styles.segmentContent}>
            <Ionicons
              name={
                tab.key === 'communities' ? 'people-outline' :
                tab.key === 'friends' ? 'person-outline' :
                'trending-up-outline'
              }
              size={16}
              color={
                activeTab === tab.key ? colors.primary : colors.textSecondary
              }
              style={styles.segmentIcon}
            />
            <Text
              style={[
                styles.segmentLabel,
                {
                  color:
                    activeTab === tab.key ? colors.primary : colors.textSecondary,
                },
              ]}
            >
              {tab.label}
            </Text>
            {tab.key === 'friends' && pendingCount > 0 && (
              <Badge
                variant="count"
                count={pendingCount}
                size="small"
                color="error"
                style={styles.segmentBadge}
              />
            )}
          </View>
        </TouchableOpacity>
      ))}
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
        autoCapitalize="none"
        autoCorrect={false}
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
          icon={<Ionicons name="people-outline" size={48} color={colors.textSecondary} />}
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
          icon={<Ionicons name="construct-outline" size={48} color={colors.textSecondary} />}
        />
      );
    }

    if (noSearchResults) {
      return (
        <EmptyState
          title="No posts found"
          message={`No posts match "${debouncedSearch}"`}
          icon={<Ionicons name="search-outline" size={48} color={colors.textSecondary} />}
        />
      );
    }

    // Transform posts to FeedItem format
    const feedItems: FeedItem[] = posts
      .filter((post) => post.author && post.community) // Also ensure community exists
      .map((post: Post) => ({
        id: post.id,
        type: 'post',
        timestamp: post.createdAt,
        user: post.author,
        userId: post.author!.id,
        data: {
          postId: post.id,
          content: post.content,
          communityId: post.community!.id, // Add the required communityId
          communityName: post.community?.name,
          createdAt: post.createdAt, // Add the required createdAt
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
    if (!isAuthenticated) {
      return (
        <View style={styles.guestContent}>
          <View style={styles.guestIconContainer}>
            <Ionicons name="people-outline" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.guestTitle, { color: colors.text }]}>
            Welcome to Social
          </Text>
          <Text style={[styles.guestMessage, { color: colors.textSecondary }]}>
            Connect with your peers and join communities.
          </Text>
          <View style={styles.guestButtons}>
            <Button
              variant="primary"
              size="large"
              onPress={handleSignIn}
              icon={<Ionicons name="log-in" size={20} color="#FFFFFF" />}
              style={styles.guestButton}
            >
              Sign In
            </Button>
            <Button
              variant="outline"
              size="large"
              onPress={handleSignUp}
              icon={<Ionicons name="person-add" size={20} color="#000000" />}
              style={styles.guestButton}
            >
              Sign Up
            </Button>
          </View>
        </View>
      );
    }

    switch (activeTab) {
      case 'communities':
        return (
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          >
            {renderSearchBar()}
            {renderCommunitiesContent()}
          </ScrollView>
        );

      case 'friends':
        return (
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          >
            {renderSearchBar()}
            {renderFriendsContent()}
          </ScrollView>
        );

      case 'trending':
        return (
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          >
            {renderSearchBar()}
            {renderTrendingContent()}
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <SimpleScreen
      showHeader={false}
      style={{ backgroundColor: colors.background }}
    >
      {isAuthenticated && renderSegmentedControl()}
      {renderContent()}
    </SimpleScreen>
  );
};

// Styles
const styles = StyleSheet.create({


  // Search bar - Apple-like design
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
    borderRadius: BORDERS.xl,
    backgroundColor: 'rgba(142, 142, 147, 0.12)',
    borderWidth: 0,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginLeft: SPACING.sm,
    paddingVertical: SPACING.xs,
    lineHeight: TYPOGRAPHY.sizes.body * 1.4,
  },

  // Content - Consistent spacing
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
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.title3,
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    lineHeight: TYPOGRAPHY.sizes.title3 * 1.2,
  },
  viewAllText: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: '#007AFF',
  },

  // Action buttons - Consistent styling
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingTop: SPACING.md,
  },
  actionButton: {
    flex: 1,
  },

  // Communities - Apple-like card styling
  communityList: {
    gap: SPACING.sm,
  },
  communityCard: {
    marginBottom: SPACING.xs,
    borderRadius: BORDERS.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // Friends - Apple-like card styling
  requestsCard: {
    marginTop: SPACING.md,
    borderRadius: BORDERS.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  requestsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  requestsInfo: {
    flex: 1,
  },
  requestsTitle: {
    fontSize: TYPOGRAPHY.sizes.callout,
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    marginBottom: SPACING.xxs,
    lineHeight: TYPOGRAPHY.sizes.callout * 1.3,
  },
  requestsCount: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    lineHeight: TYPOGRAPHY.sizes.footnote * 1.4,
    opacity: 0.7,
  },
  friendsList: {
    gap: SPACING.sm,
  },
  friendCard: {
    marginBottom: SPACING.xs,
    borderRadius: BORDERS.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // Guest content - Apple-like design
  guestContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xxl,
  },
  guestIconContainer: {
    marginBottom: SPACING.xl,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestTitle: {
    fontSize: TYPOGRAPHY.sizes.title1,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    marginBottom: SPACING.md,
    lineHeight: TYPOGRAPHY.sizes.title1 * 1.2,
    textAlign: 'center',
  },
  guestMessage: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: TYPOGRAPHY.sizes.body * 1.4,
    opacity: 0.6,
  },
  guestButtons: {
    width: '100%',
    gap: SPACING.sm,
  },
  guestButton: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },

  // Segmented Control - Apple-like design (matching profile screen)
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: BORDERS.lg,
    padding: SPACING.xxs,
    marginBottom: SPACING.lg,
    marginHorizontal: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  segmentTab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDERS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentIcon: {
    marginRight: SPACING.xs,
  },
  segmentLabel: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    lineHeight: TYPOGRAPHY.sizes.footnote * 1.3,
  },
  segmentBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
  },
});

export default SocialScreen;
