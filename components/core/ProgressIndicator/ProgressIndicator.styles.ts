// components/core/ProgressIndicator/ProgressIndicator.styles.ts
import { StyleSheet } from 'react-native';
import { SPACING, BORDERS, TYPOGRAPHY, MIXINS } from '../../../constants/theme';

export const styles = StyleSheet.create({
  // Container
  container: {
    width: '100%',
  },

  // Progress text
  progressText: {
    textAlign: 'center',
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.sizes.caption1,
    marginBottom: SPACING.sm,
  },

  // Dots variant
  dotsContainer: {
    ...MIXINS.rowCenter,
    justifyContent: 'center',
  },

  dot: {
    borderRadius: BORDERS.full,
    marginHorizontal: SPACING.xs / 2,
  },

  // Steps variant
  stepsContainer: {
    ...MIXINS.rowCenter,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  stepWrapper: {
    ...MIXINS.center,
    flex: 1,
  },

  stepCircle: {
    ...MIXINS.center,
    borderRadius: BORDERS.full,
    borderWidth: 2,
  },

  stepContent: {
    ...MIXINS.center,
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.xs,
  },

  stepTitle: {
    textAlign: 'center',
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.sizes.caption1,
    marginBottom: SPACING.xxs,
  },

  stepDescription: {
    textAlign: 'center',
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.sizes.caption2,
  },

  // Connector line between steps
  connector: {
    height: 2,
    flex: 1,
    marginHorizontal: SPACING.xs,
    alignSelf: 'flex-start',
  },

  // Bar variant
  barContainer: {
    width: '100%',
    borderRadius: BORDERS.sm,
    overflow: 'hidden',
  },

  barFill: {
    height: '100%',
    borderRadius: BORDERS.sm,
  },

  // Size variants for dots
  dotSmall: {
    width: 6,
    height: 6,
  },

  dotMedium: {
    width: 8,
    height: 8,
  },

  dotLarge: {
    width: 12,
    height: 12,
  },

  // Size variants for steps
  stepSmall: {
    width: 24,
    height: 24,
  },

  stepMedium: {
    width: 32,
    height: 32,
  },

  stepLarge: {
    width: 40,
    height: 40,
  },

  // Size variants for bar
  barSmall: {
    height: 4,
  },

  barMedium: {
    height: 6,
  },

  barLarge: {
    height: 8,
  },

  // Step number text
  stepNumber: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    includeFontPadding: false,
  },

  stepNumberSmall: {
    fontSize: TYPOGRAPHY.sizes.caption2,
  },

  stepNumberMedium: {
    fontSize: TYPOGRAPHY.sizes.caption1,
  },

  stepNumberLarge: {
    fontSize: TYPOGRAPHY.sizes.footnote,
  },
});
