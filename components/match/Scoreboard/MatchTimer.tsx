// components/match/Scoreboard/MatchTimer.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MatchTimerProps } from './types';
import { MatchStatus } from '../../../types/enums';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';

/**
 * Match Timer Component
 *
 * Displays match duration and status:
 * - Elapsed time for active matches
 * - Match status indicator
 * - Pause/resume visual feedback
 */
export const MatchTimer: React.FC<MatchTimerProps> = ({
  match,
  status,
  className,
}) => {
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  // Calculate elapsed time
  useEffect(() => {
    const calculateElapsed = () => {
      if (!match.startedAt) return 0;

      const startTime = new Date(match.startedAt).getTime();
      const endTime = match.endedAt
        ? new Date(match.endedAt).getTime()
        : Date.now();

      return Math.floor((endTime - startTime) / 1000);
    };

    setElapsedTime(calculateElapsed());

    // Update timer every second for active matches
    if (status === MatchStatus.ACTIVE) {
      const interval = setInterval(() => {
        setElapsedTime(calculateElapsed());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [match.startedAt, match.endedAt, status]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get status display info
  const getStatusInfo = () => {
    switch (status) {
      case MatchStatus.PENDING:
        return { text: 'Waiting to Start', color: COLORS.light.warning };
      case MatchStatus.ACTIVE:
        return { text: 'Live', color: COLORS.light.success };
      case MatchStatus.PAUSED:
        return { text: 'Paused', color: COLORS.light.warning };
      case MatchStatus.COMPLETED:
        return { text: 'Final', color: COLORS.light.textSecondary };
      case MatchStatus.ABANDONED:
        return { text: 'Abandoned', color: COLORS.light.error };
      default:
        return { text: status, color: COLORS.light.textSecondary };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: statusInfo.color },
          ]}
        />
        <Text style={[styles.statusText, { color: statusInfo.color }]}>
          {statusInfo.text}
        </Text>
      </View>

      <Text style={styles.timeText}>{formatTime(elapsedTime)}</Text>

      <Text style={styles.matchTitle} numberOfLines={1}>
        {match.title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    textTransform: 'uppercase',
  },
  timeText: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.light.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  matchTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.light.textSecondary,
    textAlign: 'center',
  },
});
