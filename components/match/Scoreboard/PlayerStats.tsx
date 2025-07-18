// components/match/Scoreboard/PlayerStats.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PlayerStatsProps } from './types';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { calculateHitRate } from '../../../utils/calculations';
import { isOnFire } from '../../../utils/calculations';

/**
 * Player Stats Component
 *
 * Displays individual player information:
 * - Player name and avatar
 * - Hit percentage
 * - Current streak
 * - On-fire status
 * - Score contribution
 */
export const PlayerStats: React.FC<PlayerStatsProps> = ({
  player,
  stats,
  isCurrentUser = false,
  isOnFire: onFireProp,
  className,
}) => {
  if (!stats) {
    return (
      <View style={[styles.container, styles.noStats]}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {(player.nickname || player.username).charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName} numberOfLines={1}>
            {player.nickname || player.username}
          </Text>
          <Text style={styles.noStatsText}>No stats yet</Text>
        </View>
      </View>
    );
  }

  const hitRate = calculateHitRate(stats.hits || 0, stats.throws || 0);
  const playerOnFire = onFireProp ?? isOnFire(stats.currentStreak || 0);

  return (
    <View style={[styles.container, isCurrentUser && styles.currentUser]}>
      <View style={styles.playerHeader}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {(player.nickname || player.username).charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.playerInfo}>
          <Text
            style={[styles.playerName, isCurrentUser && styles.currentUserName]}
            numberOfLines={1}
          >
            {player.nickname || player.username}
          </Text>
          {isCurrentUser && <Text style={styles.currentUserLabel}>You</Text>}
        </View>

        {playerOnFire && (
          <View style={styles.fireBadge}>
            <Text style={styles.fireEmoji}>🔥</Text>
          </View>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{(hitRate * 100).toFixed(0)}%</Text>
          <Text style={styles.statLabel}>Hit Rate</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.score || 0}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statValue, playerOnFire && styles.onFireStreak]}>
            {stats.currentStreak || 0}
          </Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
      </View>

      {/* Detailed stats row */}
      <View style={styles.detailsRow}>
        <Text style={styles.detailText}>
          {stats.hits || 0}/{stats.throws || 0} hits
        </Text>
        <Text style={styles.detailText}>
          {stats.catches || 0}/{stats.catchAttempts || 0} catches
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.light.background,
    borderRadius: 8,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  noStats: {
    opacity: 0.6,
  },
  currentUser: {
    backgroundColor: COLORS.light.primary + '10',
    borderColor: COLORS.light.primary,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  playerInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  playerName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.light.text,
  },
  currentUserName: {
    color: COLORS.light.primary,
  },
  currentUserLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.light.primary,
    textTransform: 'uppercase',
  },
  noStatsText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.light.textSecondary,
    fontStyle: 'italic',
  },
  fireBadge: {
    backgroundColor: COLORS.light.warning,
    borderRadius: 12,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
  },
  fireEmoji: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.light.text,
  },
  onFireStreak: {
    color: COLORS.light.warning,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.light.textSecondary,
    textTransform: 'uppercase',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.light.textSecondary,
  },
});
