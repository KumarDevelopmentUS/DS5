// components/social/Feed/PostFeedItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PostFeedItem as PostFeedItemType } from '../../../hooks/social/useCombinedFeed';
import { Avatar } from '../../core/Avatar';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { useTheme } from '../../../hooks/ui/useTheme';
import { formatRelativeTime } from '../../../utils/format';

interface PostFeedItemProps {
  item: PostFeedItemType;
}

export const PostFeedItem: React.FC<PostFeedItemProps> = ({ item }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Avatar
          source={item.user?.avatarUrl}
          name={item.user?.username}
          size="medium"
        />
        <View style={styles.headerContent}>
          <Text style={[styles.username, { color: colors.text }]}>
            {item.user?.username || 'Anonymous'}
          </Text>
          <View style={styles.meta}>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {item.data.communityName || 'Community'}
            </Text>
            <Text style={[styles.dot, { color: colors.textSecondary }]}>•</Text>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {formatRelativeTime(item.timestamp)}
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <Text style={[styles.content, { color: colors.text }]} numberOfLines={3}>
        {item.data.content}
      </Text>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.action}>
          <Ionicons
            name="heart-outline"
            size={20}
            color={colors.textSecondary}
          />
          <Text style={[styles.actionText, { color: colors.textSecondary }]}>
            Like
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action}>
          <Ionicons
            name="chatbubble-outline"
            size={20}
            color={colors.textSecondary}
          />
          <Text style={[styles.actionText, { color: colors.textSecondary }]}>
            Comment
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action}>
          <Ionicons
            name="share-outline"
            size={20}
            color={colors.textSecondary}
          />
          <Text style={[styles.actionText, { color: colors.textSecondary }]}>
            Share
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  headerContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  username: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  metaText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  dot: {
    marginHorizontal: SPACING.xs,
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  content: {
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: TYPOGRAPHY.sizes.md * 1.5,
    marginBottom: SPACING.sm,
  },
  actions: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
    paddingTop: SPACING.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.light.border,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  actionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginLeft: SPACING.xs,
  },
});
