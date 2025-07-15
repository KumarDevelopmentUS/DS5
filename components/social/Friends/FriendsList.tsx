// components/social/Friends/FriendsList.tsx
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  RefreshControl,
  ViewStyle,
  ListRenderItem,
} from 'react-native';
import { Friend } from '../../../types/models';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { MESSAGES } from '../../../constants/messages';
import { useDebounce } from '../../../hooks/ui/useDebounce';
import FriendCard from './FriendCard';
import { EmptyState } from '../../Layout/LoadingStates/EmptyState';
import { Spinner } from '../../Layout/LoadingStates/Spinner';
// TODO: Update import path once Icon component is available
// import Icon from '../../common/Icon';

interface FriendsListProps {
  friends: (Friend & {
    mutualFriends?: number;
    mutualFriendsList?: any[];
  })[];
  onFriendPress?: (friend: Friend) => void;
  onRemoveFriend?: (friendId: string) => void;
  onViewMutuals?: (friendId: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  isRefreshing?: boolean;
  showSearch?: boolean;
  style?: ViewStyle;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateIcon?: string;
}

const FriendsList: React.FC<FriendsListProps> = ({
  friends,
  onFriendPress,
  onRemoveFriend,
  onViewMutuals,
  onRefresh,
  isLoading = false,
  isRefreshing = false,
  showSearch = true,
  style,
  emptyStateTitle = MESSAGES.EMPTY_STATES.NO_FRIENDS,
  emptyStateDescription = 'Add friends to see them here',
  emptyStateIcon = 'users',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Filter friends based on search query
  const filteredFriends = useMemo(() => {
    if (!debouncedSearch.trim()) {
      return friends;
    }

    const query = debouncedSearch.toLowerCase();
    return friends.filter((friend) => {
      const username = friend.username.toLowerCase();
      const nickname = friend.nickname?.toLowerCase() || '';
      const school = friend.school?.toLowerCase() || '';

      return (
        username.includes(query) ||
        nickname.includes(query) ||
        school.includes(query)
      );
    });
  }, [friends, debouncedSearch]);

  // Sort friends by online status and then alphabetically
  const sortedFriends = useMemo(() => {
    return [...filteredFriends].sort((a, b) => {
      // Online friends first
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;

      // Then by display name
      const aName = a.nickname || a.username;
      const bName = b.nickname || b.username;
      return aName.localeCompare(bName);
    });
  }, [filteredFriends]);

  const handleFriendPress = (friend: Friend) => {
    if (onFriendPress) {
      onFriendPress(friend);
    }
  };

  const handleRemoveFriend = (friendId: string) => {
    if (onRemoveFriend) {
      onRemoveFriend(friendId);
    }
  };

  const handleViewMutuals = (friendId: string) => {
    if (onViewMutuals) {
      onViewMutuals(friendId);
    }
  };

  const renderFriend: ListRenderItem<Friend> = ({ item }) => (
    <FriendCard
      friend={item}
      onPress={() => handleFriendPress(item)}
      onRemove={() => handleRemoveFriend(item.id)}
      onViewMutuals={() => handleViewMutuals(item.id)}
      showActions={true}
    />
  );

  const renderSearchBar = () => {
    if (!showSearch) return null;

    return (
      <View style={styles.searchContainer}>
        {/* TODO: Add Icon component when available */}
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search friends..."
          placeholderTextColor={COLORS.light.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {renderSearchBar()}

      {friends.length > 0 && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {sortedFriends.length} of {friends.length} friends
          </Text>
          {debouncedSearch && (
            <Text style={styles.searchResultsText}>
              {sortedFriends.length} results for "{debouncedSearch}"
            </Text>
          )}
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Spinner size="large" />
          <Text style={styles.loadingText}>Loading friends...</Text>
        </View>
      );
    }

    // Show different empty states based on context
    if (debouncedSearch && friends.length > 0) {
      return (
        <EmptyState
          icon={<Text style={{ fontSize: 48 }}>🔍</Text>}
          title="No results found"
          message={`No friends found for "${debouncedSearch}"`}
          style={styles.emptyState}
        />
      );
    }

    return (
      <EmptyState
        icon={<Text style={{ fontSize: 48 }}>👥</Text>}
        title={emptyStateTitle}
        message={emptyStateDescription}
        style={styles.emptyState}
      />
    );
  };

  if (isLoading && friends.length === 0) {
    return (
      <View style={[styles.container, style]}>
        {renderHeader()}
        {renderEmptyState()}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <FlatList
        data={sortedFriends}
        renderItem={renderFriend}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.light.primary}
            />
          ) : undefined
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light.surface,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  searchIcon: {
    marginRight: SPACING.sm,
    fontSize: 20,
    color: COLORS.light.textSecondary,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.light.text,
    padding: 0,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsText: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    color: COLORS.light.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  searchResultsText: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    color: COLORS.light.textTertiary,
  },
  listContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.light.textSecondary,
    marginTop: SPACING.md,
  },
  emptyState: {
    paddingVertical: SPACING.xl,
  },
});

export default FriendsList;
