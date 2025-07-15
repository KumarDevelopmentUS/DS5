// components/social/Friends/FriendCard.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Friend } from '../../../types/models';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../../../constants/theme';
import { formatRelativeTime } from '../../../utils/format';
import { MESSAGES } from '../../../constants/messages';
import Avatar from '../../core/Avatar';
import Button from '../../core/Button';
// TODO: Update import path once Icon component is available
// import Icon from '../../common/Icon';

interface FriendCardProps {
  friend: Friend & {
    mutualFriends?: number;
    mutualFriendsList?: any[];
  };
  onPress?: () => void;
  onRemove?: () => void;
  onViewMutuals?: () => void;
  showActions?: boolean;
  style?: ViewStyle;
  isLoading?: boolean;
}

const FriendCard: React.FC<FriendCardProps> = ({
  friend,
  onPress,
  onRemove,
  onViewMutuals,
  showActions = true,
  style,
  isLoading = false,
}) => {
  const displayName = friend.nickname || friend.username;
  const secondaryText = friend.nickname ? `@${friend.username}` : friend.school;

  const handlePress = () => {
    if (!isLoading && onPress) {
      onPress();
    }
  };

  const handleRemove = () => {
    if (!isLoading && onRemove) {
      onRemove();
    }
  };

  const handleViewMutuals = () => {
    if (!isLoading && onViewMutuals) {
      onViewMutuals();
    }
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
          source={friend.avatarUrl || undefined}
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
          {friend.mutualFriends !== undefined && friend.mutualFriends > 0 && (
            <TouchableOpacity
              style={styles.mutualFriendsContainer}
              onPress={handleViewMutuals}
              disabled={isLoading}
            >
              {/* TODO: Add Icon component when available */}
              <Text style={styles.mutualFriendsIcon}>👥</Text>
              <Text style={styles.mutualFriendsText}>
                {friend.mutualFriends === 1
                  ? '1 mutual friend'
                  : `${friend.mutualFriends} mutual friends`}
              </Text>
            </TouchableOpacity>
          )}

          {/* Friend Since */}
          {friend.friendSince && (
            <Text style={styles.friendSince}>
              Friends since {formatRelativeTime(friend.friendSince)}
            </Text>
          )}
        </View>

        {/* Actions */}
        {showActions && onRemove && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={handleRemove}
              disabled={isLoading}
            >
              {/* TODO: Add Icon component when available */}
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Online Status Indicator */}
      {friend.isOnline && <View style={styles.onlineIndicator} />}
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
  },
  mutualFriendsText: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    color: COLORS.light.textSecondary,
  },
  friendSince: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    color: COLORS.light.textTertiary,
    marginTop: SPACING.xxs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeButton: {
    padding: SPACING.xs,
    borderRadius: 8,
    backgroundColor: COLORS.light.fillTertiary,
  },
  removeButtonText: {
    fontSize: 16,
    color: COLORS.light.error,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  onlineIndicator: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.light.success,
  },
});

export default FriendCard;
