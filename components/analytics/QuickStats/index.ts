// components/analytics/QuickStats/index.ts
export { QuickStats, QuickStats as default } from './QuickStats';
export { StatItem } from './StatItem';
export { styles as QuickStatsStyles } from './QuickStats.styles';
export type {
  QuickStatsProps,
  QuickStatItemData,
  StatItemProps,
  StatConfig,
} from './QuickStats.types';
export {
  STAT_CONFIGS,
  transformStatsToItems,
  getDefaultStatsForVariant,
  formatAchievementDisplay,
  getEmptyStateMessage,
  calculateTrend,
  getStatColor,
} from './QuickStats.utils';
