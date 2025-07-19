// components/match/Stats/DetailedPlayerStats.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LivePlayerStats } from '../../../types/models';
import { TrackerPlayer } from '../../../types/tracker';
import { useTheme } from '../../../contexts/ThemeContext';
import { calculateHitRate, calculateCatchRate } from '../../../utils/calculations';
import { SPACING, TYPOGRAPHY, BORDERS } from '../../../constants/theme';

interface DetailedPlayerStatsProps {
  player: TrackerPlayer;
  stats: LivePlayerStats;
  isCurrentUser?: boolean;
}

interface StatRowProps {
  label: string;
  value: string | number;
  subValue?: string;
  isHighlighted?: boolean;
}

const StatRow: React.FC<StatRowProps> = ({ label, value, subValue, isHighlighted }) => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.statRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <View style={styles.statValueContainer}>
        <Text style={[
          styles.statValue, 
          { color: colors.text },
          isHighlighted && { color: colors.primary, fontWeight: 'bold' }
        ]}>
          {value}
        </Text>
        {subValue && (
          <Text style={[styles.statSubValue, { color: colors.textSecondary }]}>
            {subValue}
          </Text>
        )}
      </View>
    </View>
  );
};

export const DetailedPlayerStats: React.FC<DetailedPlayerStatsProps> = ({
  player,
  stats,
  isCurrentUser = false,
}) => {
  const { colors } = useTheme();

  // Calculate derived statistics
  const hitRate = calculateHitRate(stats.hits, stats.throws);
  const catchAttempts = stats.catches + stats.drop + stats.miss + stats.twoHands + stats.body;
  const catchRate = calculateCatchRate(stats.catches, catchAttempts);
  const fifaRate = stats.fifaAttempts > 0 ? (stats.fifaSuccess / stats.fifaAttempts) * 100 : 0;
  const efficiency = stats.throws > 0 ? (stats.score / stats.throws) * 100 : 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Player Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.avatarPlaceholder}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {player.displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.playerInfo}>
          <Text style={[styles.playerName, { color: colors.text }]}>
            {player.displayName}
          </Text>
          <Text style={[styles.playerTeam, { color: colors.textSecondary }]}>
            {player.team === 'team1' ? 'Team 1' : 'Team 2'} • Position {player.position}
          </Text>
          {isCurrentUser && (
            <Text style={[styles.currentUserLabel, { color: colors.primary }]}>
              You
            </Text>
          )}
        </View>
        {stats.currentlyOnFire && (
          <View style={styles.fireBadge}>
            <Text style={styles.fireEmoji}>🔥</Text>
          </View>
        )}
      </View>

      {/* Overall Performance */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>
          Overall Performance
        </Text>
        
        <StatRow 
          label="Total Score" 
          value={stats.score} 
          isHighlighted={true}
        />
        <StatRow 
          label="Total Throws" 
          value={stats.throws} 
        />
        <StatRow 
          label="Hit Rate" 
          value={`${(hitRate * 100).toFixed(1)}%`}
          subValue={`${stats.hits}/${stats.throws} hits`}
        />
        <StatRow 
          label="Efficiency" 
          value={`${efficiency.toFixed(1)}%`}
          subValue={`${stats.score} points / ${stats.throws} throws`}
        />
        <StatRow 
          label="Current Streak" 
          value={stats.hitStreak}
          subValue={stats.currentlyOnFire ? "🔥 On Fire!" : ""}
        />
        <StatRow 
          label="Times On Fire" 
          value={stats.onFireCount}
        />
      </View>

      {/* Throwing Statistics */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>
          Throwing Statistics
        </Text>
        
        <StatRow 
          label="Hits" 
          value={stats.hit}
          subValue="1 point each"
        />
        <StatRow 
          label="Goals" 
          value={stats.goal}
          subValue="2 points each"
        />
        <StatRow 
          label="Dinks" 
          value={stats.dink}
          subValue="2 points each"
        />
        <StatRow 
          label="Sinks" 
          value={stats.sink}
          subValue="3-5 points each"
        />
        <StatRow 
          label="Knickers" 
          value={stats.knicker}
          subValue="1 point each"
        />
        <StatRow 
          label="Table Die" 
          value={stats.tableDie}
          subValue="0 points"
        />
        <StatRow 
          label="Line Hits" 
          value={stats.line}
          subValue="0 points"
        />
      </View>

      {/* Error Statistics */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>
          Errors & Blunders
        </Text>
        
        <StatRow 
          label="Short Throws" 
          value={stats.short}
        />
        <StatRow 
          label="Long Throws" 
          value={stats.long}
        />
        <StatRow 
          label="Side Misses" 
          value={stats.side}
        />
        <StatRow 
          label="Height Throws" 
          value={stats.height}
        />
        <StatRow 
          label="Total Blunders" 
          value={stats.blunders}
          isHighlighted={true}
        />
      </View>

      {/* Defensive Statistics */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>
          Defensive Statistics
        </Text>
        
        <StatRow 
          label="Catches" 
          value={stats.catches}
          subValue="Successful defenses"
        />
        <StatRow 
          label="Catch + Aura" 
          value={stats.catchPlusAura}
          subValue="Exceptional catches"
        />
        <StatRow 
          label="Catch Rate" 
          value={`${(catchRate * 100).toFixed(1)}%`}
          subValue={`${stats.catches}/${catchAttempts} attempts`}
        />
        <StatRow 
          label="Drops" 
          value={stats.drop}
        />
        <StatRow 
          label="Misses" 
          value={stats.miss}
        />
        <StatRow 
          label="Two Hands" 
          value={stats.twoHands}
          subValue="Improper technique"
        />
        <StatRow 
          label="Body Catches" 
          value={stats.body}
          subValue="Used body instead of hands"
        />
        <StatRow 
          label="Aura" 
          value={stats.aura}
          subValue="Special defensive stat"
        />
      </View>

      {/* FIFA Statistics */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>
          FIFA Statistics
        </Text>
        
        <StatRow 
          label="FIFA Attempts" 
          value={stats.fifaAttempts}
        />
        <StatRow 
          label="Good Kicks" 
          value={stats.goodKick}
        />
        <StatRow 
          label="Bad Kicks" 
          value={stats.badKick}
        />
        <StatRow 
          label="FIFA Success Rate" 
          value={`${fifaRate.toFixed(1)}%`}
          subValue={`${stats.fifaSuccess}/${stats.fifaAttempts} successful`}
        />
      </View>

      {/* Special Statistics */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>
          Special Statistics
        </Text>
        
        <StatRow 
          label="Special Throws" 
          value={stats.specialThrows}
          subValue="Knicker, Dink, Sink"
        />
        <StatRow 
          label="Line Throws" 
          value={stats.lineThrows}
        />
        <StatRow 
          label="Total Hits" 
          value={stats.hits}
          subValue="All scoring throws"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: BORDERS.radius,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  playerTeam: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: 2,
  },
  currentUserLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: 'bold',
  },
  fireBadge: {
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
    borderRadius: 20,
    padding: SPACING.xs,
  },
  fireEmoji: {
    fontSize: 20,
  },
  section: {
    marginBottom: SPACING.md,
    borderRadius: BORDERS.radius,
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    flex: 1,
  },
  statValueContainer: {
    alignItems: 'flex-end',
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
  statSubValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 2,
  },
}); 