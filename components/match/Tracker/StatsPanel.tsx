// components/match/Tracker/StatsPanel.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatsPanelProps } from '../../../types/tracker';
import { MatchEvent } from '../../../types/models';
import { PlayType } from '../../../types/enums';
import { useTheme } from '../../../contexts/ThemeContext';
import { getPlayerDisplayName } from '../../../utils/playerDefaults';
import { Player, LivePlayerStats } from '../../../types/models';
import { TrackerPlayer, TrackerPlayerWithStats } from '../../../types/tracker';

// Helper function to get display name for Player objects (not TrackerPlayer)
const getPlayerName = (player: Player | TrackerPlayer): string => {
  if ('displayName' in player) {
    return player.displayName;
  }
  return player.nickname || player.username;
};
import { calculateLiveMVP } from '../../../utils/calculations';
import {
  SPACING,
  TYPOGRAPHY,
  BORDERS,
  SHADOWS,
} from '../../../constants/theme';

/**
 * Stats Panel Component
 *
 * Displays live match statistics, recent events, and analytics
 * Includes collapsible sections for better mobile experience
 */
export const StatsPanel: React.FC<StatsPanelProps> = ({
  match,
  players,
  playerStats,
  events,
  style,
  testID = 'stats-panel',
}) => {
  const { colors } = useTheme();
  const [expandedSections, setExpandedSections] = useState({
    liveStats: true,
    recentEvents: true,
    playerBreakdown: false,
  });

  // Calculate MVP
  const playersWithStats = players
    .map((p) => ({ userId: p.userId, stats: playerStats[p.userId] }))
    .filter((p): p is { userId: string; stats: LivePlayerStats } => !!p.stats);

  const mvpResult = calculateLiveMVP(playersWithStats);
  const mvpPlayer = mvpResult ? players.find(p => p.userId === mvpResult.userId) || null : null;

  // Get recent events (last 10)
  const recentEvents = events.slice(-10).reverse();

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Calculate match statistics
  const calculateMatchStats = () => {
    const totalPlays = events.length;
    const scoringPlays = events.filter(
      (e) => e.eventData.points && e.eventData.points > 0
    ).length;

    const playTypeCount = events.reduce(
      (acc, event) => {
        acc[event.eventType] = (acc[event.eventType] || 0) + 1;
        return acc;
      },
      {} as Record<PlayType, number>
    );

    return {
      totalPlays,
      scoringPlays,
      scoringPercentage: totalPlays > 0 ? (scoringPlays / totalPlays) * 100 : 0,
      mostCommonPlay: Object.entries(playTypeCount).sort(
        ([, a], [, b]) => b - a
      )[0]?.[0] as PlayType,
      playTypeCount,
    };
  };

  const matchStats = calculateMatchStats();

  // Render collapsible section
  const renderSection = (
    title: string,
    sectionKey: keyof typeof expandedSections,
    content: React.ReactNode,
    subtitle?: string
  ) => (
    <View style={[styles.section, { backgroundColor: colors.surface }]}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection(sectionKey)}
        testID={`${testID}-${sectionKey}-toggle`}
      >
        <View style={styles.sectionTitleContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
            >
              {subtitle}
            </Text>
          )}
        </View>
        <Ionicons
          name={expandedSections[sectionKey] ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {expandedSections[sectionKey] && (
        <View style={styles.sectionContent}>{content}</View>
      )}
    </View>
  );

  // Render live stats content
  const renderLiveStats = () => (
    <View style={styles.statsGrid}>
      {/* MVP Section */}
      {mvpPlayer && (
        <View
          style={[
            styles.mvpContainer,
            { backgroundColor: colors.warning + '20' },
          ]}
        >
          <View style={styles.mvpHeader}>
            <Ionicons name="trophy" size={20} color={colors.warning} />
            <Text style={[styles.mvpTitle, { color: colors.warning }]}>
              Current MVP
            </Text>
          </View>
          <Text style={[styles.mvpName, { color: colors.text }]}>
            {getPlayerName(mvpPlayer)}
          </Text>
        </View>
      )}

      {/* Match Overview Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {matchStats.totalPlays}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Total Plays
          </Text>
        </View>

        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {matchStats.scoringPlays}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Scoring Plays
          </Text>
        </View>

        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {matchStats.scoringPercentage.toFixed(1)}%
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Score Rate
          </Text>
        </View>
      </View>

      {/* Most Common Play */}
      {matchStats.mostCommonPlay && (
        <View style={styles.commonPlayContainer}>
          <Text
            style={[styles.commonPlayLabel, { color: colors.textSecondary }]}
          >
            Most Common Play:
          </Text>
          <Text style={[styles.commonPlayValue, { color: colors.primary }]}>
            {matchStats.mostCommonPlay.toUpperCase()}(
            {matchStats.playTypeCount[matchStats.mostCommonPlay]} times)
          </Text>
        </View>
      )}
    </View>
  );

  // Render recent events content
  const renderRecentEvents = () => (
    <View style={styles.eventsContainer}>
      {recentEvents.length === 0 ? (
        <Text style={[styles.noEventsText, { color: colors.textSecondary }]}>
          No plays yet
        </Text>
      ) : (
        recentEvents.map((event, index) => {
          const player = players.find((p) => p.userId === event.playerId);
          const displayName = player ? getPlayerName(player) : 'Unknown';

          return (
            <View
              key={`${event.id}-${index}`}
              style={[styles.eventRow, { borderBottomColor: colors.border }]}
            >
              <View style={styles.eventContent}>
                <Text style={[styles.eventPlayer, { color: colors.text }]}>
                  {displayName}
                </Text>
                <Text
                  style={[styles.eventAction, { color: colors.textSecondary }]}
                >
                  {event.eventType.toUpperCase()}
                  {event.eventData.points
                    ? ` (+${event.eventData.points})`
                    : ''}
                </Text>
              </View>

              <Text style={[styles.eventTime, { color: colors.textSecondary }]}>
                {event.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          );
        })
      )}
    </View>
  );

  // Render player breakdown content
  const renderPlayerBreakdown = () => (
    <View style={styles.playerBreakdownContainer}>
      {players
        .map((player) => {
          const stats = playerStats[player.userId];
          if (!stats) return null;

          const hitRate =
            stats.throws > 0 ? (stats.hits / stats.throws) * 100 : 0;
          const catchAttempts = stats.catches + stats.drop + stats.miss + stats.twoHands + stats.body;
          const catchRate =
            catchAttempts > 0
              ? (stats.catches / catchAttempts) * 100
              : 0;

          return (
            <View
              key={player.userId}
              style={[
                styles.playerBreakdownRow,
                { borderBottomColor: colors.border },
              ]}
            >
              <Text
                style={[styles.playerBreakdownName, { color: colors.text }]}
              >
                {getPlayerName(player)}
              </Text>

              <View style={styles.playerBreakdownStats}>
                <View style={styles.breakdownStat}>
                  <Text style={[styles.breakdownValue, { color: colors.text }]}>
                    {stats.score}
                  </Text>
                  <Text
                    style={[
                      styles.breakdownLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    PTS
                  </Text>
                </View>

                <View style={styles.breakdownStat}>
                  <Text style={[styles.breakdownValue, { color: colors.text }]}>
                    {hitRate.toFixed(0)}%
                  </Text>
                  <Text
                    style={[
                      styles.breakdownLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    HIT
                  </Text>
                </View>

                <View style={styles.breakdownStat}>
                  <Text style={[styles.breakdownValue, { color: colors.text }]}>
                    {catchRate.toFixed(0)}%
                  </Text>
                  <Text
                    style={[
                      styles.breakdownLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    CATCH
                  </Text>
                </View>

                <View style={styles.breakdownStat}>
                  <Text style={[styles.breakdownValue, { color: colors.text }]}>
                    {stats.hitStreak}
                  </Text>
                  <Text
                    style={[
                      styles.breakdownLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    STREAK
                  </Text>
                </View>
              </View>
            </View>
          );
        })
        .filter(Boolean)}
    </View>
  );

  return (
    <View style={[styles.container, style]} testID={testID}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Live Statistics */}
        {renderSection(
          'Live Statistics',
          'liveStats',
          renderLiveStats(),
          mvpPlayer ? `MVP: ${getPlayerName(mvpPlayer)}` : undefined
        )}

        {/* Recent Events */}
        {renderSection(
          'Recent Plays',
          'recentEvents',
          renderRecentEvents(),
          `${recentEvents.length} recent ${recentEvents.length === 1 ? 'play' : 'plays'}`
        )}

        {/* Player Breakdown */}
        {renderSection(
          'Player Breakdown',
          'playerBreakdown',
          renderPlayerBreakdown(),
          'Detailed player statistics'
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: SPACING.sm,
  },
  section: {
    borderRadius: BORDERS.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.callout,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginTop: SPACING.xxs,
  },
  sectionContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  statsGrid: {
    gap: SPACING.sm,
  },
  mvpContainer: {
    padding: SPACING.sm,
    borderRadius: BORDERS.sm,
    alignItems: 'center',
  },
  mvpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  mvpTitle: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    textTransform: 'uppercase',
  },
  mvpName: {
    fontSize: TYPOGRAPHY.sizes.callout,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.sm,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.title3,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textTransform: 'uppercase',
    marginTop: SPACING.xxs,
  },
  commonPlayContainer: {
    alignItems: 'center',
    padding: SPACING.sm,
  },
  commonPlayLabel: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  commonPlayValue: {
    fontSize: TYPOGRAPHY.sizes.callout,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    marginTop: SPACING.xxs,
  },
  eventsContainer: {
    gap: SPACING.xs,
  },
  noEventsText: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: SPACING.md,
  },
  eventRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  eventContent: {
    flex: 1,
  },
  eventPlayer: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  eventAction: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginTop: SPACING.xxs,
  },
  eventTime: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  playerBreakdownContainer: {
    gap: SPACING.xs,
  },
  playerBreakdownRow: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  playerBreakdownName: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    marginBottom: SPACING.xs,
  },
  playerBreakdownStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownStat: {
    alignItems: 'center',
    flex: 1,
  },
  breakdownValue: {
    fontSize: TYPOGRAPHY.sizes.callout,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  breakdownLabel: {
    fontSize: TYPOGRAPHY.sizes.caption2,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textTransform: 'uppercase',
  },
});

export default StatsPanel;
