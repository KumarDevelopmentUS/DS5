// components/analytics/QuickStats/QuickStats.styles.ts
import { StyleSheet } from 'react-native';
import { SPACING, TYPOGRAPHY, BORDERS, MIXINS } from '../../../constants/theme';

export const styles = StyleSheet.create({
  // Main container
  container: {
    width: '100%',
  },

  // Layout variants
  gridLayout: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  rowLayout: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  columnLayout: {
    flexDirection: 'column',
  },

  // Stat item containers
  statItem: {
    ...MIXINS.center,
    padding: SPACING.md,
    borderRadius: BORDERS.md,
    marginBottom: SPACING.sm,
  },

  // Grid layout specific
  gridStatItem: {
    width: '48%', // Two items per row with small gap
    marginBottom: SPACING.sm,
  },

  // Row layout specific
  rowStatItem: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },

  // Column layout specific
  columnStatItem: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },

  // Stat content
  statContent: {
    ...MIXINS.center,
    flex: 1,
  },

  statContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },

  // Text styles
  statValue: {
    fontSize: TYPOGRAPHY.sizes.title3,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    textAlign: 'center',
    marginBottom: SPACING.xxs,
  },

  statValueCompact: {
    fontSize: TYPOGRAPHY.sizes.headline,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },

  statValueMinimal: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },

  statLabel: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    textAlign: 'center',
    opacity: 0.8,
  },

  statLabelCompact: {
    fontSize: TYPOGRAPHY.sizes.caption2,
  },

  statSubtitle: {
    fontSize: TYPOGRAPHY.sizes.caption2,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
    marginTop: SPACING.xxs,
    opacity: 0.6,
  },

  // Icon container
  iconContainer: {
    marginBottom: SPACING.xs,
  },

  iconContainerCompact: {
    marginBottom: SPACING.xxs,
  },

  iconContainerRow: {
    marginBottom: 0,
    marginRight: SPACING.sm,
  },

  // Trend indicator
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xxs,
  },

  trendText: {
    fontSize: TYPOGRAPHY.sizes.caption2,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    marginLeft: SPACING.xxs,
  },

  trendIcon: {
    width: 12,
    height: 12,
  },

  // Achievement badge
  achievementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },

  achievementBadge: {
    marginRight: SPACING.xs,
  },

  achievementText: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    flex: 1,
  },

  // Loading and error states
  loadingContainer: {
    ...MIXINS.center,
    padding: SPACING.lg,
  },

  errorContainer: {
    ...MIXINS.center,
    padding: SPACING.lg,
  },

  errorText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },

  // Empty state
  emptyContainer: {
    ...MIXINS.center,
    padding: SPACING.xl,
  },

  emptyText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
    opacity: 0.6,
    marginBottom: SPACING.sm,
  },

  emptySubtext: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
    opacity: 0.5,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },

  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.headline,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },

  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    opacity: 0.7,
    marginTop: SPACING.xxs,
  },

  // Pressable states
  pressable: {
    // Additional styles for pressable items will be applied dynamically
  },

  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
});
