// components/social/Friends/UserSearchCard.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { User } from '../../../types/models';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../../../constants/theme';
import { MESSAGES } from '../../../constants/messages';
import Avatar from '../../core/Avatar';
import Button from '../../core/Button';
// TODO: Add Icon component when available
// import Icon from '../../core/Icon';

interface UserSearchCardProps {
  user: User & {
    mutualFriends?: number;
    mutualFriendsList?: any[];
  };
  onPress?: () => void;
  onAddFriend?: () => void;
  onViewMutuals?: () => void;
  showAddButton?: boolean;
  style?: ViewStyle;
  isLoading?: boolean;
  isFriendRequestPending?: boolean;
}

const UserSearchCard: React.FC<UserSearchCardProps> = ({
  user,
  onPress,
  onAddFriend,
  onViewMutuals,
  showAddButton = true,
  style,
  isLoading = false,
  isFriendRequestPending = false,
}) => {
  const displayName = user.nickname || user.username;
  const secondaryText = user.nickname ? `@${user.username}` : user.school;

  const handlePress = () => {
    if (!isLoading && onPress) {
      onPress();
    }
  };

  const handleAddFriend = () => {
    if (!isLoading && onAddFriend) {
      onAddFriend();
    }
  };

  const handleViewMutuals = () => {
    if (!isLoading && onViewMutuals) {
      onViewMutuals();
    }
  };

  const getAddButtonText = () => {
    if (isFriendRequestPending) {
      return 'Request Sent';
    }
    return MESSAGES.BUTTON_LABELS.ADD_FRIEND;
  };

  const getAddButtonVariant = () => {
    if (isFriendRequestPending) {
      return 'outline' as const;
    }
    return 'primary' as const;
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Avatar */}
        <Avatar
          source={user.avatarUrl}
          size="medium"
          name={displayName}
          style={styles.avatar}
        />

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.displayName} numberOfLines={1}>
            {displayName}
          </Text>

          {secondaryText && (
            <Text style={styles.secondaryText} numberOfLines={1}>
              {secondaryText}
            </Text>
          )}

          {/* Mutual Friends */}
          {user.mutualFriends !== undefined && user.mutualFriends > 0 && (
            <TouchableOpacity
              style={styles.mutualFriendsContainer}
              onPress={handleViewMutuals}
              disabled={isLoading}
            >
              {/* TODO: Replace with Icon component when available */}
              <Text style={styles.mutualFriendsIcon}>👥</Text>
              <Text style={styles.mutualFriendsText}>
                {user.mutualFriends === 1
                  ? '1 mutual friend'
                  : `${user.mutualFriends} mutual friends`}
              </Text>
            </TouchableOpacity>
          )}

          {/* School Badge */}
          {user.school && (
            <View style={styles.schoolBadge}>
              {/* TODO: Replace with Icon component when available */}
              <Text style={styles.schoolIcon}>🎓</Text>
              <Text style={styles.schoolText} numberOfLines={1}>
                {user.school}
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        {showAddButton && (
          <View style={styles.actions}>
            <Button
              variant={getAddButtonVariant()}
              size="small"
              onPress={handleAddFriend}
              disabled={isLoading || isFriendRequestPending}
              style={styles.addButton}
              // TODO: Add icon prop when Icon component is available
              // icon={isFriendRequestPending ? undefined : 'user-plus'}
            >
              {getAddButtonText()}
            </Button>
          </View>
        )}
      </View>

      {/* Public Profile Indicator */}
      {user.isPublic && (
        <View style={styles.publicIndicator}>
          {/* TODO: Replace with Icon component when available */}
          <Text style={{ fontSize: 12, color: COLORS.light.success }}>🌐</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.light.surface,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    position: 'relative',
    ...SHADOWS.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  avatar: {
    marginRight: SPACING.md,
  },
  userInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.light.text,
    marginBottom: SPACING.xxs,
  },
  secondaryText: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    color: COLORS.light.textSecondary,
    marginBottom: SPACING.xxs,
  },
  mutualFriendsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xxs,
  },
  mutualFriendsIcon: {
    marginRight: SPACING.xxs,
    fontSize: 12,
    color: COLORS.light.textSecondary,
  },
  mutualFriendsText: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    color: COLORS.light.textSecondary,
  },
  schoolBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xxs,
    backgroundColor: COLORS.light.fillTertiary,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xxs,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  schoolIcon: {
    marginRight: SPACING.xxs,
    fontSize: 10,
    color: COLORS.light.primary,
  },
  schoolText: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    color: COLORS.light.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  publicIndicator: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: COLORS.light.success,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default UserSearchCard;
