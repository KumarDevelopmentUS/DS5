// components/social/Friends/UserSearchResults.tsx
import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ViewStyle,
  ListRenderItem,
} from 'react-native';
import { User } from '../../../types/models';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { MESSAGES } from '../../../constants/messages';
import UserSearchCard from './UserSearchCard';
import { EmptyState } from '../../Layout/LoadingStates/EmptyState';
import { Spinner } from '../../Layout/LoadingStates/Spinner';

interface UserSearchResultsProps {
  searchResults: (User & {
    mutualFriends?: number;
    mutualFriendsList?: any[];
  })[];
  searchQuery: string;
  onUserPress?: (user: User) => void;
  onAddFriend?: (userId: string) => void;
  onViewMutuals?: (userId: string) => void;
  isLoading?: boolean;
  isSearching?: boolean;
  style?: ViewStyle;
  pendingRequestIds?: Set<string>;
}

const UserSearchResults: React.FC<UserSearchResultsProps> = ({
  searchResults,
  searchQuery,
  onUserPress,
  onAddFriend,
  onViewMutuals,
  isLoading = false,
  isSearching = false,
  style,
  pendingRequestIds = new Set(),
}) => {
  const handleUserPress = (user: User) => {
    if (onUserPress) {
      onUserPress(user);
    }
  };

  const handleAddFriend = (userId: string) => {
    if (onAddFriend) {
      onAddFriend(userId);
    }
  };

  const handleViewMutuals = (userId: string) => {
    if (onViewMutuals) {
      onViewMutuals(userId);
    }
  };

  const renderUser: ListRenderItem<User> = ({ item }) => (
    <UserSearchCard
      user={item}
      onPress={() => handleUserPress(item)}
      onAddFriend={() => handleAddFriend(item.id)}
      onViewMutuals={() => handleViewMutuals(item.id)}
      showAddButton={true}
      isFriendRequestPending={pendingRequestIds.has(item.id)}
    />
  );

  const renderHeader = () => {
    if (!searchQuery.trim()) return null;

    return (
      <View style={styles.header}>
        <Text style={styles.searchHeader}>
          Search Results for "{searchQuery}"
        </Text>

        {searchResults.length > 0 && (
          <Text style={styles.resultsCount}>
            {searchResults.length} user{searchResults.length !== 1 ? 's' : ''}{' '}
            found
          </Text>
        )}
      </View>
    );
  };

  const renderEmptyState = () => {
    if (isSearching) {
      return (
        <View style={styles.loadingContainer}>
          <Spinner size="large" />
          <Text style={styles.loadingText}>Searching users...</Text>
        </View>
      );
    }

    if (!searchQuery.trim()) {
      return (
        <EmptyState
          icon={<Text style={{ fontSize: 48 }}>🔍</Text>}
          title="Search for Friends"
          message="Enter a username, nickname, or school to find people"
          style={styles.emptyState}
        />
      );
    }

    if (searchQuery.length < 2) {
      return (
        <EmptyState
          icon={<Text style={{ fontSize: 48 }}>⌨️</Text>}
          title="Keep Typing"
          message="Enter at least 2 characters to search"
          style={styles.emptyState}
        />
      );
    }

    return (
      <EmptyState
        icon={<Text style={{ fontSize: 48 }}>🔍</Text>}
        title={MESSAGES.EMPTY_STATES.NO_SEARCH_RESULTS}
        message={`No users found for "${searchQuery}"`}
        style={styles.emptyState}
      />
    );
  };

  const renderSearchTips = () => {
    if (searchQuery.trim() || searchResults.length > 0) return null;

    return (
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Search Tips:</Text>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>Search by username or nickname</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>Search by school or organization</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>Only public profiles will appear</Text>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (searchResults.length === 0 || !searchQuery.trim()) {
      return renderSearchTips();
    }

    return (
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Can't find who you're looking for? They might have a private profile.
        </Text>
      </View>
    );
  };

  if (isLoading && searchResults.length === 0) {
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
        data={searchResults}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
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
  searchHeader: {
    fontSize: TYPOGRAPHY.sizes.title3,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.light.text,
    marginBottom: SPACING.xs,
  },
  resultsCount: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    color: COLORS.light.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
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
  tipsContainer: {
    backgroundColor: COLORS.light.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  tipsTitle: {
    fontSize: TYPOGRAPHY.sizes.callout,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.light.text,
    marginBottom: SPACING.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  tipBullet: {
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.light.primary,
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.light.textSecondary,
    lineHeight: TYPOGRAPHY.lineHeights.normal * TYPOGRAPHY.sizes.body,
  },
  footer: {
    backgroundColor: COLORS.light.fillTertiary,
    borderRadius: 12,
    padding: SPACING.md,
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  footerText: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    color: COLORS.light.textSecondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeights.normal * TYPOGRAPHY.sizes.footnote,
  },
});

export default UserSearchResults;
