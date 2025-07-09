// components/core/Badge/Badge.styles.ts
import { StyleSheet } from 'react-native';
import { SPACING, BORDERS, TYPOGRAPHY, MIXINS } from '../../../constants/theme';

export const styles = StyleSheet.create({
  // Base badge styles
  badge: {
    ...MIXINS.center,
    ...MIXINS.rowCenter,
    borderRadius: BORDERS.full,
    overflow: 'hidden',
  },

  // Variant styles
  status: {
    width: 12,
    height: 12,
    borderRadius: BORDERS.full,
  },

  count: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: SPACING.xs,
    borderRadius: BORDERS.full,
  },

  achievement: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDERS.md,
  },

  label: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: BORDERS.sm,
  },

  // Size variants
  small: {
    // Size handled per variant
  },

  medium: {
    // Size handled per variant
  },

  large: {
    // Size handled per variant
  },

  // Text styles
  text: {
    fontSize: TYPOGRAPHY.sizes.caption2,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    includeFontPadding: false,
    textAlign: 'center',
  },

  // Count text (smaller)
  countText: {
    fontSize: TYPOGRAPHY.sizes.caption2,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    includeFontPadding: false,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sizes.caption2 * 1.2,
  },

  // Achievement text
  achievementText: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    includeFontPadding: false,
    marginLeft: SPACING.xs,
  },

  // Label text
  labelText: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    includeFontPadding: false,
  },

  // Icon container
  iconContainer: {
    ...MIXINS.center,
  },

  // Position variants
  absolute: {
    position: 'absolute',
    top: -4,
    right: -4,
    zIndex: 10,
  },

  relative: {
    position: 'relative',
  },
});
