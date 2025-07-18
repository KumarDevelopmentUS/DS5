// components/match/Tracker/ScoreboardPanel.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScoreboardPanelProps, TrackerPlayer } from '../../../types/tracker';
import { PlayerCard } from './PlayerCard';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../hooks/auth/useAuth';
import {
  getPlayersByTeam,
  getTeamDisplayName,
} from '../../../utils/playerDefaults';
import { calculateHitRate, isOnFire } from '../../../utils/calculations';
import {
  SPACING,
  TYPOGRAPHY,
  BORDERS,
  SHADOWS,
} from '../../../constants/theme';

/**
 * Scoreboard Panel Component
 *
 * Displays team scores, player information, and team statistics
 * Shows all 4 players (including defaults) with their current stats
 */
export const ScoreboardPanel: React.FC<ScoreboardPanelProps> = ({
  match,
  players,
  currentScore,
  playerStats = {},
  isConnected,
  style,
  testID = 'scoreboard-panel',
}) => {
  const { colors } = useTheme();
  const { user } = useAuth();

  // Get teams
  const team1Players = getPlayersByTeam(players, 'team1');
  const team2Players = getPlayersByTeam(players, 'team2');

  // Get team names
  const team1Name = getTeamDisplayName('team1', match.settings);
  const team2Name = getTeamDisplayName('team2', match.settings);

  // Get scores
  const team1Score = currentScore.team1 || 0;
  const team2Score = currentScore.team2 || 0;

  // Determine winning team
  const isTeam1Winning = team1Score > team2Score;
  const isTeam2Winning = team2Score > team1Score;

  // Calculate team hit rates
  const calculateTeamHitRate = (teamPlayers: TrackerPlayer[]): number => {
    let totalHits = 0;
    let totalThrows = 0;

    teamPlayers.forEach((player) => {
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

  // Render team section
  const renderTeamSection = (
    teamPlayers: TrackerPlayer[],
    teamName: string,
    teamScore: number,
    teamHitRate: number,
    isWinning: boolean,
    teamColor: string
  ) => (
    <View
      style={[
        styles.teamSection,
        { backgroundColor: colors.surface },
        isWinning && { borderColor: colors.success, borderWidth: 2 },
      ]}
    >
      {/* Team Header */}
      <View style={styles.teamHeader}>
        <View style={styles.teamInfo}>
          <Text style={[styles.teamName, { color: teamColor }]}>
            {teamName}
          </Text>
          <Text style={[styles.teamMeta, { color: colors.textSecondary }]}>
            Hit Rate: {(teamHitRate * 100).toFixed(1)}%
          </Text>
        </View>

        <View style={styles.scoreContainer}>
          <Text
            style={[
              styles.teamScore,
              { color: isWinning ? colors.success : colors.text },
            ]}
          >
            {teamScore}
          </Text>
          {isWinning && teamScore !== 0 && (
            <Text style={[styles.winningIndicator, { color: colors.success }]}>
              Leading
            </Text>
          )}
        </View>
      </View>

      {/* Players */}
      <View style={styles.playersContainer}>
        {teamPlayers.map((player) => {
          const stats = playerStats[player.userId];
          const playerOnFire = stats
            ? isOnFire(stats.hitStreak || 0)
            : false;
          const isCurrentUser = user?.id === player.userId;

          return (
            <PlayerCard
              key={player.userId}
              player={player}
              stats={stats}
              isOnFire={playerOnFire}
              isCurrentUser={isCurrentUser}
              compact={false}
              testID={`${testID}-player-${player.position}`}
            />
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, style]} testID={testID}>
      {/* Connection Status */}
      {!isConnected && (
        <View
          style={[
            styles.connectionWarning,
            { backgroundColor: colors.error + '20' },
          ]}
        >
          <Text style={[styles.connectionText, { color: colors.error }]}>
            Connection Lost - Scores may be outdated
          </Text>
        </View>
      )}

      {/* Match Status Bar */}
      <View
        style={[styles.statusBar, { backgroundColor: colors.fillSecondary }]}
      >
        <Text style={[styles.statusText, { color: colors.text }]}>
          {match.status === 'active'
            ? 'Live Match'
            : match.status === 'pending'
              ? 'Waiting to Start'
              : match.status === 'paused'
                ? 'Match Paused'
                : match.status === 'completed'
                  ? 'Match Complete'
                  : 'Match Ended'}
        </Text>

        {match.settings.scoreLimit && (
          <Text
            style={[styles.scoreLimitText, { color: colors.textSecondary }]}
          >
            First to {match.settings.scoreLimit}
            {match.settings.winByTwo ? ' (Win by 2)' : ''}
          </Text>
        )}
      </View>

      {/* Teams Container */}
      <View style={styles.teamsContainer}>
        {/* Team 1 */}
        {renderTeamSection(
          team1Players,
          team1Name,
          team1Score,
          team1HitRate,
          isTeam1Winning,
          colors.primary
        )}

        {/* VS Divider */}
        <View style={styles.divider}>
          <View
            style={[styles.dividerLine, { backgroundColor: colors.border }]}
          />
          <View
            style={[styles.vsContainer, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.vsText, { color: colors.textSecondary }]}>
              VS
            </Text>
          </View>
          <View
            style={[styles.dividerLine, { backgroundColor: colors.border }]}
          />
        </View>

        {/* Team 2 */}
        {renderTeamSection(
          team2Players,
          team2Name,
          team2Score,
          team2HitRate,
          isTeam2Winning,
          colors.secondary
        )}
      </View>

      {/* Game Settings Info */}
      <View
        style={[styles.gameInfo, { backgroundColor: colors.fillSecondary }]}
      >
        <Text style={[styles.gameInfoText, { color: colors.textSecondary }]}>
          Sink: {match.settings.sinkPoints} pts • Score Limit:{' '}
          {match.settings.scoreLimit}
          {match.settings.winByTwo ? ' (Win by 2)' : ''}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: SPACING.sm,
  },
  connectionWarning: {
    padding: SPACING.sm,
    borderRadius: BORDERS.sm,
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  connectionText: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: BORDERS.sm,
    marginBottom: SPACING.sm,
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.callout,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  scoreLimitText: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  teamsContainer: {
    marginBottom: SPACING.sm,
  },
  teamSection: {
    borderRadius: BORDERS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: TYPOGRAPHY.sizes.title3,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    marginBottom: SPACING.xxs,
  },
  teamMeta: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  teamScore: {
    fontSize: TYPOGRAPHY.sizes.largeTitle,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  winningIndicator: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    textTransform: 'uppercase',
  },
  playersContainer: {
    gap: SPACING.xs,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  vsContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDERS.full,
    marginHorizontal: SPACING.sm,
  },
  vsText: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    textTransform: 'uppercase',
  },
  gameInfo: {
    padding: SPACING.sm,
    borderRadius: BORDERS.sm,
    alignItems: 'center',
  },
  gameInfoText: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
  },
});

export default ScoreboardPanel;
