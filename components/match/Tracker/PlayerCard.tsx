// components/match/Tracker/PlayerCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlayerCardProps } from '../../../types/tracker';
import { Avatar } from '../../core/Avatar';
import { useTheme } from '../../../contexts/ThemeContext';
import { calculateHitRate } from '../../../utils/calculations';
import { getPlayerDisplayName } from '../../../utils/playerDefaults';
import { SPACING, TYPOGRAPHY, BORDERS } from '../../../constants/theme';

/**
 * Player Card Component
 *
 * Displays player information, stats, and status in the tracker
 * Supports both registered and default players
 */
export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  stats,
  isOnFire = false,
  isCurrentUser = false,
  compact = false,
  style,
  testID = 'player-card',
}) => {
  const { colors } = useTheme();

  const displayName = getPlayerDisplayName(player, true);
  const hitRate = stats ? calculateHitRate(stats.hits, stats.throws) : 0;

  // Get player indicator color based on registration status
  const getPlayerIndicatorColor = () => {
    if (!player.isRegistered) {
      return colors.textSecondary; // Gray for default players
    }
    if (isCurrentUser) {
      return colors.primary; // Primary color for current user
    }
    return colors.success; // Green for other registered players
  };

  const indicatorColor = getPlayerIndicatorColor();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: isCurrentUser ? colors.primary : colors.border,
        },
        compact && styles.compactContainer,
        style,
      ]}
      testID={testID}
    >
      {/* Player Header */}
      <View style={styles.header}>
        <View style={styles.playerInfo}>
          <Avatar
            source={player.avatarUrl || undefined}
            name={displayName}
            size={compact ? 'small' : 'medium'}
            showStatus={false}
          />

          <View style={styles.nameContainer}>
            <View style={styles.nameRow}>
              <Text
                style={[
                  styles.playerName,
                  { color: isCurrentUser ? colors.primary : colors.text },
                  compact && styles.compactText,
                ]}
                numberOfLines={1}
              >
                {displayName}
              </Text>

              {/* Player Status Indicators */}
              <View style={styles.indicators}>
                {/* Registration status */}
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: indicatorColor },
                  ]}
                />

                {/* On fire indicator */}
                {isOnFire && <Text style={styles.fireEmoji}>🔥</Text>}

                {/* Current user indicator */}
                {isCurrentUser && (
                  <Ionicons name="person" size={12} color={colors.primary} />
                )}
              </View>
            </View>

            {/* Position and Team */}
            <Text style={[styles.playerMeta, { color: colors.textSecondary }]}>
              Player {player.position} • {player.team === 'team1' ? 'T1' : 'T2'}
              {!player.isRegistered && ' • Guest'}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Section */}
      {stats && !compact && (
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            {/* Score */}
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.score || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Points
              </Text>
            </View>

            {/* Hit Rate */}
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {(hitRate * 100).toFixed(0)}%
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Hit Rate
              </Text>
            </View>

            {/* Streak */}
            <View style={styles.statItem}>
              <Text
                style={[
                  styles.statValue,
                  { color: isOnFire ? colors.warning : colors.text },
                ]}
              >
                {stats.hitStreak || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Streak
              </Text>
            </View>
          </View>

          {/* Detailed Stats Row */}
          <View style={styles.detailsRow}>
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {stats.hits || 0}/{stats.throws || 0} hits
            </Text>
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {stats.catches || 0} catches
            </Text>
          </View>
        </View>
      )}

      {/* Compact Stats */}
      {stats && compact && (
        <View style={styles.compactStats}>
          <Text style={[styles.compactStatText, { color: colors.text }]}>
            {stats.score || 0}pts • {(hitRate * 100).toFixed(0)}%
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: BORDERS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  compactContainer: {
    padding: SPACING.xs,
    marginBottom: SPACING.xxs,
  },
  header: {
    marginBottom: SPACING.xs,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  nameContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xxs,
  },
  playerName: {
    fontSize: TYPOGRAPHY.sizes.callout,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    flex: 1,
  },
  compactText: {
    fontSize: TYPOGRAPHY.sizes.footnote,
  },
  indicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  fireEmoji: {
    fontSize: 12,
  },
  playerMeta: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  statsContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: SPACING.xs,
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
    fontSize: TYPOGRAPHY.sizes.callout,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.caption2,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textTransform: 'uppercase',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailText: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  compactStats: {
    marginTop: SPACING.xxs,
  },
  compactStatText: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
});

export default PlayerCard;
