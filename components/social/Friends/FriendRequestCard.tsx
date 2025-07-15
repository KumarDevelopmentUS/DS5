// components/social/Friends/FriendRequestCard.tsx
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

interface FriendRequestCardProps {
  friend: Friend & {
    mutualFriends?: number;
    mutualFriendsList?: any[];
    requestSent?: Date;
  };
  type: 'incoming' | 'outgoing';
  onPress?: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
  onCancel?: () => void;
  onViewMutuals?: () => void;
  style?: ViewStyle;
  isLoading?: boolean;
}

const FriendRequestCard: React.FC<FriendRequestCardProps> = ({
  friend,
  type,
  onPress,
  onAccept,
  onDecline,
  onCancel,
  onViewMutuals,
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

  const handleAccept = () => {
    if (!isLoading && onAccept) {
      onAccept();
    }
  };

  const handleDecline = () => {
    if (!isLoading && onDecline) {
      onDecline();
    }
  };

  const handleCancel = () => {
    if (!isLoading && onCancel) {
      onCancel();
    }
  };

  const handleViewMutuals = () => {
    if (!isLoading && onViewMutuals) {
      onViewMutuals();
    }
  };

  const getRequestStatusText = () => {
    if (type === 'incoming') {
      return 'Sent you a friend request';
    } else {
      return 'Friend request sent';
    }
  };

  const getRequestTime = () => {
    if (friend.requestSent) {
      return formatRelativeTime(friend.requestSent);
    }
    return '';
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

          {/* Request Status */}
          <Text style={styles.requestStatus} numberOfLines={1}>
            {getRequestStatusText()}
            {getRequestTime() && (
              <Text style={styles.requestTime}> • {getRequestTime()}</Text>
            )}
          </Text>

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
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {type === 'incoming' && (
            <>
              <Button
                onPress={handleAccept}
                disabled={isLoading}
                style={styles.acceptButton}
              >
                <Text style={styles.acceptButtonText}>
                  {MESSAGES.BUTTON_LABELS.ACCEPT_REQUEST}
                </Text>
              </Button>
              <Button
                onPress={handleDecline}
                disabled={isLoading}
                style={styles.declineButton}
              >
                <Text style={styles.declineButtonText}>
                  {MESSAGES.BUTTON_LABELS.DECLINE_REQUEST}
                </Text>
              </Button>
            </>
          )}

          {type === 'outgoing' && onCancel && (
            <Button
              onPress={handleCancel}
              disabled={isLoading}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Button>
          )}
        </View>
      </View>

      {/* Request Type Indicator */}
      <View
        style={[
          styles.typeIndicator,
          type === 'incoming'
            ? styles.incomingIndicator
            : styles.outgoingIndicator,
        ]}
      />
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
  requestStatus: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    color: COLORS.light.textTertiary,
    marginBottom: SPACING.xxs,
  },
  requestTime: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    color: COLORS.light.textTertiary,
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
  actions: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: SPACING.xs,
  },
  acceptButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.light.success,
    borderRadius: 8,
  },
  acceptButtonText: {
    color: COLORS.light.background,
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  declineButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderColor: COLORS.light.error,
    borderWidth: 1,
    borderRadius: 8,
  },
  declineButtonText: {
    color: COLORS.light.error,
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  cancelButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderColor: COLORS.light.border,
    borderWidth: 1,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: COLORS.light.textSecondary,
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  typeIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 4,
    height: '100%',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  incomingIndicator: {
    backgroundColor: COLORS.light.primary,
  },
  outgoingIndicator: {
    backgroundColor: COLORS.light.warning,
  },
});

export default FriendRequestCard;
