// components/social/Friends/BlockedUsersList.tsx
import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ViewStyle,
  ListRenderItem,
  Alert,
} from 'react-native';
import { User } from '../../../types/models';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { MESSAGES } from '../../../constants/messages';
import BlockedUserCard from './BlockedUserCard';
import { EmptyState } from '../../Layout/LoadingStates/EmptyState';
import { Spinner } from '../../Layout/LoadingStates/Spinner';

interface BlockedUsersListProps {
  blockedUsers: (User & {
    blockedAt?: Date;
  })[];
  onUserPress?: (user: User) => void;
  onUnblockUser?: (userId: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  isRefreshing?: boolean;
  style?: ViewStyle;
}

const BlockedUsersList: React.FC<BlockedUsersListProps> = ({
  blockedUsers,
  onUserPress,
  onUnblockUser,
  onRefresh,
  isLoading = false,
  isRefreshing = false,
  style,
}) => {
  const handleUserPress = (user: User) => {
    if (onUserPress) {
      onUserPress(user);
    }
  };

  const handleUnblockUser = (userId: string, username: string) => {
    Alert.alert(
      'Unblock User',
      `Are you sure you want to unblock ${username}? They will be able to send you friend requests and see your public content again.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Unblock',
          style: 'destructive',
          onPress: () => {
            if (onUnblockUser) {
              onUnblockUser(userId);
            }
          },
        },
      ]
    );
  };

  const renderUser: ListRenderItem<User> = ({ item }) => (
    <BlockedUserCard
      user={item}
      onPress={() => handleUserPress(item)}
      onUnblock={() => handleUnblockUser(item.id, item.username)}
      showUnblockButton={true}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Blocked Users</Text>

      {blockedUsers.length > 0 && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            {blockedUsers.length} blocked user
            {blockedUsers.length !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.descriptionText}>
            Blocked users can't send you friend requests or see your content
          </Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Spinner size="large" />
          <Text style={styles.loadingText}>Loading blocked users...</Text>
        </View>
      );
    }

    return (
      <EmptyState
        icon={<Text style={{ fontSize: 48 }}>🚫</Text>}
        title="No Blocked Users"
        message="You haven't blocked anyone yet. Blocked users won't be able to interact with you."
        style={styles.emptyState}
      />
    );
  };

  const renderFooter = () => {
    if (blockedUsers.length === 0) return null;

    return (
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Unblocking a user will allow them to send you friend requests and see
          your public content again.
        </Text>
      </View>
    );
  };

  if (isLoading && blockedUsers.length === 0) {
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
        data={blockedUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
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
  title: {
    fontSize: TYPOGRAPHY.sizes.title2,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.light.text,
    marginBottom: SPACING.md,
  },
  infoContainer: {
    backgroundColor: COLORS.light.surface,
    borderRadius: 12,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.light.error,
  },
  infoText: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    color: COLORS.light.textSecondary,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs,
  },
  descriptionText: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    color: COLORS.light.textTertiary,
    lineHeight: TYPOGRAPHY.lineHeights.normal * TYPOGRAPHY.sizes.footnote,
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

export default BlockedUsersList;
