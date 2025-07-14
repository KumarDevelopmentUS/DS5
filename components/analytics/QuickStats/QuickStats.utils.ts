// components/analytics/QuickStats/QuickStats.utils.ts
import { PlayerStats } from '../../../types/models';
import { StatConfig, QuickStatItemData } from './QuickStats.types';
import {
  formatPercentage,
  formatNumber,
  formatRelativeTime,
} from '../../../utils/format';

/**
 * Predefined stat configurations for common use cases
 */
export const STAT_CONFIGS: Record<string, StatConfig> = {
  winRate: {
    key: 'winRate',
    label: 'Win Rate',
    getValue: (stats: PlayerStats) => formatPercentage(stats.winRate),
    getSubtitle: (stats: PlayerStats) =>
      `${stats.totalWins}W / ${stats.totalLosses}L`,
    color: (stats) =>
      stats.winRate >= 0.7
        ? 'success'
        : stats.winRate >= 0.5
          ? 'default'
          : 'warning',
    priority: 1,
  },

  totalMatches: {
    key: 'totalMatches',
    label: 'Matches',
    getValue: (stats: PlayerStats) => formatNumber(stats.totalMatches),
    getSubtitle: (stats: PlayerStats) =>
      stats.lastPlayed
        ? `Last: ${formatRelativeTime(stats.lastPlayed)}`
        : 'Never played',
    color: 'default',
    priority: 2,
  },

  longestStreak: {
    key: 'longestStreak',
    label: 'Best Streak',
    getValue: (stats: PlayerStats) => formatNumber(stats.longestStreak),
    getSubtitle: (stats: PlayerStats) =>
      stats.longestStreak > 0 ? 'consecutive hits' : 'No streaks yet',
    color: (stats) =>
      stats.longestStreak >= 10
        ? 'success'
        : stats.longestStreak >= 5
          ? 'info'
          : 'default',
    priority: 3,
  },

  hitRate: {
    key: 'hitRate',
    label: 'Accuracy',
    getValue: (stats: PlayerStats) => formatPercentage(stats.hitRate),
    getSubtitle: (stats: PlayerStats) =>
      `${formatNumber(stats.totalHits)} hits`,
    color: (stats) =>
      stats.hitRate >= 0.8
        ? 'success'
        : stats.hitRate >= 0.6
          ? 'default'
          : 'warning',
    priority: 4,
  },

  avgScore: {
    key: 'avgScore',
    label: 'Avg Score',
    getValue: (stats: PlayerStats) => formatNumber(stats.avgScore, 1),
    getSubtitle: (stats: PlayerStats) =>
      `${formatNumber(stats.totalScore)} total`,
    color: 'default',
    priority: 5,
  },

  catchRate: {
    key: 'catchRate',
    label: 'Defense',
    getValue: (stats: PlayerStats) =>
      stats.totalCatchAttempts > 0 ? formatPercentage(stats.catchRate) : 'N/A',
    getSubtitle: (stats: PlayerStats) =>
      stats.totalCatchAttempts > 0
        ? `${formatNumber(stats.totalCatches)} catches`
        : 'No defense recorded',
    color: (stats) =>
      stats.totalCatchAttempts === 0
        ? 'default'
        : stats.catchRate >= 0.7
          ? 'success'
          : stats.catchRate >= 0.5
            ? 'default'
            : 'warning',
    priority: 6,
  },

  totalSinks: {
    key: 'totalSinks',
    label: 'Sinks',
    getValue: (stats: PlayerStats) => formatNumber(stats.totalSinks),
    getSubtitle: (stats: PlayerStats) => 'premium shots',
    color: (stats) =>
      stats.totalSinks >= 20
        ? 'success'
        : stats.totalSinks >= 5
          ? 'info'
          : 'default',
    priority: 7,
  },

  onFireCount: {
    key: 'onFireCount',
    label: 'On Fire',
    getValue: (stats: PlayerStats) => formatNumber(stats.totalOnFireCount),
    getSubtitle: (stats: PlayerStats) => 'hot streaks',
    color: (stats) =>
      stats.totalOnFireCount >= 10
        ? 'success'
        : stats.totalOnFireCount >= 3
          ? 'info'
          : 'default',
    priority: 8,
  },
};

/**
 * Get the appropriate color for a stat based on its value and configuration
 */
export const getStatColor = (
  config: StatConfig,
  stats: PlayerStats
): 'default' | 'success' | 'warning' | 'error' | 'info' => {
  if (typeof config.color === 'function') {
    return config.color(stats);
  }
  return config.color || 'default';
};

/**
 * Transform PlayerStats into QuickStatItemData array
 */
export const transformStatsToItems = (
  stats: PlayerStats,
  selectedStats: string[] = Object.keys(STAT_CONFIGS),
  maxStats?: number
): QuickStatItemData[] => {
  // Get configurations for selected stats
  const configs = selectedStats
    .map((key) => STAT_CONFIGS[key])
    .filter(Boolean)
    .sort((a, b) => a.priority - b.priority);

  // Limit to maxStats if specified
  const limitedConfigs = maxStats ? configs.slice(0, maxStats) : configs;

  // Transform each config to QuickStatItemData
  return limitedConfigs.map((config) => {
    const value = config.getValue(stats);
    const subtitle = config.getSubtitle ? config.getSubtitle(stats) : undefined;
    const color = getStatColor(config, stats);

    return {
      label: config.label,
      value,
      subtitle,
      color,
    };
  });
};

/**
 * Get default stats configuration based on variant
 */
export const getDefaultStatsForVariant = (
  variant: 'compact' | 'detailed' | 'minimal'
): string[] => {
  switch (variant) {
    case 'minimal':
      return ['winRate', 'totalMatches'];

    case 'compact':
      return ['winRate', 'totalMatches', 'longestStreak', 'hitRate'];

    case 'detailed':
    default:
      return [
        'winRate',
        'totalMatches',
        'longestStreak',
        'hitRate',
        'avgScore',
        'catchRate',
        'totalSinks',
        'onFireCount',
      ];
  }
};

/**
 * Format achievement data for display
 */
export const formatAchievementDisplay = (
  achievements: any[]
): {
  recent: any | null;
  count: number;
} => {
  if (!achievements || achievements.length === 0) {
    return { recent: null, count: 0 };
  }

  // Sort by unlock date (most recent first)
  const sortedAchievements = achievements
    .filter((achievement) => achievement.unlockedAt)
    .sort(
      (a, b) =>
        new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime()
    );

  return {
    recent: sortedAchievements[0] || null,
    count: achievements.length,
  };
};

/**
 * Generate empty state message based on stats
 */
export const getEmptyStateMessage = (
  stats: PlayerStats | null
): {
  title: string;
  subtitle: string;
} => {
  if (!stats) {
    return {
      title: 'Loading stats...',
      subtitle: 'Please wait while we fetch your data',
    };
  }

  if (stats.totalMatches === 0) {
    return {
      title: 'No matches played yet',
      subtitle: 'Start playing to see your statistics here!',
    };
  }

  return {
    title: 'Stats available',
    subtitle: 'Your game statistics are displayed above',
  };
};

/**
 * Calculate trend data (if historical data becomes available)
 * For now, returns placeholder trend data
 */
export const calculateTrend = (
  currentValue: number,
  previousValue?: number
):
  | {
      direction: 'up' | 'down' | 'stable';
      value: string;
      isPositive: boolean;
    }
  | undefined => {
  if (previousValue === undefined) return undefined;

  const difference = currentValue - previousValue;
  const percentageChange =
    previousValue !== 0 ? (difference / previousValue) * 100 : 0;

  let direction: 'up' | 'down' | 'stable';
  if (Math.abs(percentageChange) < 1) {
    direction = 'stable';
  } else if (difference > 0) {
    direction = 'up';
  } else {
    direction = 'down';
  }

  // For stats like win rate, hit rate, etc., up is generally positive
  // For losses, down would be positive
  const isPositive = direction === 'up';

  return {
    direction,
    value: `${Math.abs(percentageChange).toFixed(1)}%`,
    isPositive,
  };
};
