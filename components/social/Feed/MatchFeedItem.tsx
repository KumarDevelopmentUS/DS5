// components/social/Feed/MatchFeedItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MatchResultFeedItem } from '../../../hooks/social/useCombinedFeed';
import { Avatar } from '../../core/Avatar';
import { Badge } from '../../core/Badge';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { useTheme } from '../../../hooks/ui/useTheme';
import { formatRelativeTime } from '../../../utils/format';

interface MatchFeedItemProps {
  item: MatchResultFeedItem;
}

export const MatchFeedItem: React.FC<MatchFeedItemProps> = ({ item }) => {
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
          <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
            {formatRelativeTime(item.timestamp)}
          </Text>
        </View>
        <Badge
          color="success"
          size="small"
          variant="achievement"
          icon={
            <Ionicons name="trophy" size={14} color={COLORS.light.background} />
          }
        />
      </View>

      {/* Match Info */}
      <View style={[styles.matchCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.matchTitle, { color: colors.text }]}>
          {item.data.title}
        </Text>
        <View style={styles.matchMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="game-controller" size={16} color={colors.primary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {item.data.gameType}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people" size={16} color={colors.primary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {item.data.playerCount} players
            </Text>
          </View>
        </View>
      </View>

      {/* View Details */}
      <TouchableOpacity style={styles.viewButton}>
        <Text style={[styles.viewButtonText, { color: colors.primary }]}>
          View Match Details
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  timestamp: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 2,
  },
  matchCard: {
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  matchTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.sm,
  },
  matchMeta: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  metaText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
  },
  viewButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginRight: SPACING.xs,
  },
});
