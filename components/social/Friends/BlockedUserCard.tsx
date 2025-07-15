// components/social/Friends/BlockedUserCard.tsx
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
import { formatRelativeTime } from '../../../utils/format';
import { MESSAGES } from '../../../constants/messages';
import Avatar from '../../core/Avatar';
import Button from '../../core/Button';
// TODO: Update import path once Icon component is available
// import Icon from '../../common/Icon';

interface BlockedUserCardProps {
  user: User & {
    blockedAt?: Date;
  };
  onPress?: () => void;
  onUnblock?: () => void;
  style?: ViewStyle;
  isLoading?: boolean;
  showUnblockButton?: boolean;
}

const BlockedUserCard: React.FC<BlockedUserCardProps> = ({
  user,
  onPress,
  onUnblock,
  style,
  isLoading = false,
  showUnblockButton = true,
}) => {
  const displayName = user.nickname || user.username;
  const secondaryText = user.nickname ? `@${user.username}` : user.school;

  const handlePress = () => {
    if (!isLoading && onPress) {
      onPress();
    }
  };

  const handleUnblock = () => {
    if (!isLoading && onUnblock) {
      onUnblock();
    }
  };

  const getBlockedText = () => {
    if (user.blockedAt) {
      return `Blocked ${formatRelativeTime(user.blockedAt)}`;
    }
    return 'Blocked user';
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Avatar with overlay */}
        <View style={styles.avatarContainer}>
          <Avatar
            source={user.avatarUrl || undefined}
            size="medium"
            name={displayName}
            style={[styles.avatar, styles.blockedAvatar]}
          />
          <View style={styles.avatarOverlay}>
            {/* TODO: Add Icon component when available */}
            <Text style={styles.blockedIcon}>⛔</Text>
          </View>
        </View>

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

          {/* Blocked Status */}
          <Text style={styles.blockedStatus} numberOfLines={1}>
            {getBlockedText()}
          </Text>
        </View>

        {/* Actions */}
        {showUnblockButton && (
          <View style={styles.actions}>
            <Button
              onPress={handleUnblock}
              disabled={isLoading}
              style={styles.unblockButton}
            >
              <Text style={styles.unblockButtonText}>
                {MESSAGES.BUTTON_LABELS.UNBLOCK_USER}
              </Text>
            </Button>
          </View>
        )}
      </View>

      {/* Blocked Indicator */}
      <View style={styles.blockedIndicator} />
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
    opacity: 0.7,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  avatar: {
    marginRight: 0,
  },
  blockedAvatar: {
    opacity: 0.5,
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 22, // Half of medium avatar size
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockedIcon: {
    fontSize: 20,
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
  blockedStatus: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    color: COLORS.light.error,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unblockButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderColor: COLORS.light.success,
    borderWidth: 1,
    borderRadius: 8,
  },
  unblockButtonText: {
    color: COLORS.light.success,
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  blockedIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 4,
    height: '100%',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: COLORS.light.error,
  },
});

export default BlockedUserCard;
