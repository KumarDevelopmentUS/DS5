// components/social/Feed/ActivityFeedItem.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FriendActivityFeedItem } from '../../../hooks/social/useCombinedFeed';
import { Avatar } from '../../core/Avatar';
import { SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { useTheme } from '../../../hooks/ui/useTheme';
import { formatRelativeTime } from '../../../utils/format';

interface ActivityFeedItemProps {
  item: FriendActivityFeedItem;
}

export const ActivityFeedItem: React.FC<ActivityFeedItemProps> = ({ item }) => {
  const { colors } = useTheme();

  const getActivityIcon = () => {
    switch (item.data.action) {
      case 'became_friends':
        return 'people';
      case 'created_match':
        return 'add-circle';
      case 'joined_match':
        return 'game-controller';
      default:
        return 'ellipse';
    }
  };

  const getActivityText = () => {
    switch (item.data.action) {
      case 'became_friends':
        return `became friends with ${item.data.targetUserName}`;
      case 'created_match':
        return `created a new match: ${item.data.matchTitle}`;
      case 'joined_match':
        return `joined a match`;
      default:
        return 'was active';
    }
  };

  return (
    <View style={styles.container}>
      <Avatar
        source={item.user?.avatarUrl}
        name={item.user?.username}
        size="medium"
      />
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={[styles.username, { color: colors.text }]}>
            {item.user?.username || 'Someone'}
          </Text>
          <Text style={[styles.activity, { color: colors.textSecondary }]}>
            {' '}
            {getActivityText()}
          </Text>
        </View>
        <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
          {formatRelativeTime(item.timestamp)}
        </Text>
      </View>
      <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
        <Ionicons name={getActivityIcon()} size={20} color={colors.primary} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  textContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  username: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  activity: {
    fontSize: TYPOGRAPHY.sizes.md,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 2,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
});
