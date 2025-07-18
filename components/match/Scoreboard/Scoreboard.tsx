// components/match/Scoreboard/Scoreboard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScoreboardProps } from './types';
import { TeamScore } from './TeamScore';
import { MatchTimer } from './MatchTimer';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { calculateHitRate } from '../../../utils/calculations';
import { Player } from '../../../types/models';

/**
 * Main Scoreboard Component
 *
 * Displays the complete match scoreboard including:
 * - Team scores and names
 * - Match timer and status
 * - Team hit percentages
 * - Player statistics
 * - Connection status indicator
 */
export const Scoreboard: React.FC<ScoreboardProps> = ({
  match,
  participants,
  currentScore,
  playerStats = {},
  isConnected = true,
  className,
}) => {
  // Group players by team
  const team1Players = participants.filter((p) => p.team === 'team1');
  const team2Players = participants.filter((p) => p.team === 'team2');

  // Calculate team hit rates
  const calculateTeamHitRate = (players: Player[]): number => {
    let totalHits = 0;
    let totalThrows = 0;

    players.forEach((player) => {
      const stats = playerStats[player.userId];
      if (stats) {
        totalHits += stats.hits || 0;
        totalThrows += stats.throws || 0;
      }
    });

    return calculateHitRate(totalHits, totalThrows);
  };

  const team1HitRate = calculateTeamHitRate(team1Players);
  const team2HitRate = calculateTeamHitRate(team2Players);

  // Determine winning team
  const team1Score = currentScore.team1 || 0;
  const team2Score = currentScore.team2 || 0;
  const isTeam1Winning = team1Score > team2Score;
  const isTeam2Winning = team2Score > team1Score;

  // Get team names from match settings
  const team1Name = (match.settings as any)?.teamNames?.team1 || 'Team 1';
  const team2Name = (match.settings as any)?.teamNames?.team2 || 'Team 2';

  return (
    <View style={[styles.container, !isConnected && styles.disconnected]}>
      {/* Connection Status Indicator */}
      {!isConnected && (
        <View style={styles.connectionStatus}>
          <View style={styles.disconnectedIndicator} />
        </View>
      )}

      {/* Match Timer */}
      <View style={styles.timerSection}>
        <MatchTimer match={match} status={match.status} />
      </View>

      {/* Team Scores */}
      <View style={styles.scoresSection}>
        <TeamScore
          teamName={team1Name}
          teamId="team1"
          score={team1Score}
          players={team1Players}
          playerStats={playerStats}
          isWinning={isTeam1Winning}
          teamColor={COLORS.light.primary}
        />

        <View style={styles.separator}>
          <View style={styles.separatorLine} />
        </View>

        <TeamScore
          teamName={team2Name}
          teamId="team2"
          score={team2Score}
          players={team2Players}
          playerStats={playerStats}
          isWinning={isTeam2Winning}
          teamColor={COLORS.light.secondary}
        />
      </View>

      {/* Team Hit Rates */}
      <View style={styles.hitRatesSection}>
        <View style={styles.hitRateItem}>
          <Text style={styles.hitRateLabel}>{team1Name} Hit %</Text>
          <Text style={[styles.hitRateValue, { color: COLORS.light.primary }]}>
            {(team1HitRate * 100).toFixed(1)}%
          </Text>
        </View>

        <View style={styles.hitRateItem}>
          <Text style={styles.hitRateLabel}>{team2Name} Hit %</Text>
          <Text
            style={[styles.hitRateValue, { color: COLORS.light.secondary }]}
          >
            {(team2HitRate * 100).toFixed(1)}%
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.light.surface,
    borderRadius: 12,
    padding: SPACING.md,
    margin: SPACING.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disconnected: {
    opacity: 0.7,
    borderWidth: 1,
    borderColor: COLORS.light.error,
  },
  connectionStatus: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    zIndex: 1,
  },
  disconnectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.light.error,
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  scoresSection: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: SPACING.md,
  },
  separator: {
    width: 1,
    marginHorizontal: SPACING.sm,
    justifyContent: 'center',
  },
  separatorLine: {
    flex: 1,
    backgroundColor: COLORS.light.border,
  },
  hitRatesSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.light.border,
  },
  hitRateItem: {
    alignItems: 'center',
  },
  hitRateLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.light.textSecondary,
    marginBottom: SPACING.xs,
  },
  hitRateValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
