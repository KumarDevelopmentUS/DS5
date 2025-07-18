// components/match/Scoreboard/TeamScore.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TeamScoreProps } from './types';
import { PlayerStats } from './PlayerStats';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';

/**
 * Team Score Component
 *
 * Displays team information including:
 * - Team name and score
 * - Individual player statistics
 * - Winning team highlighting
 */
export const TeamScore: React.FC<TeamScoreProps> = ({
  teamName,
  teamId,
  score,
  players,
  playerStats = {},
  isWinning = false,
  teamColor = COLORS.light.text,
  className,
}) => {
  return (
    <View style={[styles.container, isWinning && styles.winningTeam]}>
      {/* Team Header */}
      <View style={styles.teamHeader}>
        <Text style={[styles.teamName, { color: teamColor }]}>{teamName}</Text>
        <Text style={[styles.teamScore, isWinning && styles.winningScore]}>
          {score}
        </Text>
      </View>

      {/* Player List */}
      <View style={styles.playersContainer}>
        {players.map((player) => (
          <PlayerStats
            key={player.userId}
            player={player}
            stats={playerStats[player.userId]}
            style={styles.playerItem}
          />
        ))}

        {/* Empty slots if less than 2 players */}
        {players.length < 2 && (
          <View style={styles.emptySlot}>
            <Text style={styles.emptySlotText}>Waiting for player...</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.sm,
  },
  winningTeam: {
    backgroundColor: COLORS.light.background,
    borderWidth: 2,
    borderColor: COLORS.light.success,
    borderRadius: 8,
  },
  teamHeader: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  teamName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginBottom: SPACING.xs,
  },
  teamScore: {
    fontSize: TYPOGRAPHY.sizes.xxxl,
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.light.text,
  },
  winningScore: {
    color: COLORS.light.success,
  },
  playersContainer: {
    gap: SPACING.sm,
  },
  playerItem: {
    marginBottom: SPACING.xs,
  },
  emptySlot: {
    padding: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.light.border,
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  emptySlotText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.light.textSecondary,
    fontStyle: 'italic',
  },
});
