// components/core/Button/Button.styles.ts
import { StyleSheet } from 'react-native';
import {
  SPACING,
  TYPOGRAPHY,
  BORDERS,
  SHADOWS,
  COMPONENT_SIZES,
  MIXINS,
} from '../../../constants/theme';

export const styles = StyleSheet.create({
  // Base styles using existing theme constants
  base: {
    ...MIXINS.rowCenter,
    justifyContent: 'center',
    borderRadius: BORDERS.md,
    borderWidth: 1,
    ...SHADOWS.sm,
  },

  // Size variants - directly using COMPONENT_SIZES from theme
  small: {
    height: COMPONENT_SIZES.button.small.height,
    paddingHorizontal: COMPONENT_SIZES.button.small.paddingHorizontal,
    minWidth: 80,
  },

  medium: {
    height: COMPONENT_SIZES.button.medium.height,
    paddingHorizontal: COMPONENT_SIZES.button.medium.paddingHorizontal,
    minWidth: 100,
  },

  large: {
    height: COMPONENT_SIZES.button.large.height,
    paddingHorizontal: COMPONENT_SIZES.button.large.paddingHorizontal,
    minWidth: 120,
  },

  // Layout
  fullWidth: {
    width: '100%',
  },

  // Base text style using theme typography
  textBase: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    textAlign: 'center' as const,
    includeFontPadding: false,
  },

  // Text sizes - using COMPONENT_SIZES from theme
  textSmall: {
    fontSize: COMPONENT_SIZES.button.small.fontSize,
    lineHeight:
      COMPONENT_SIZES.button.small.fontSize * TYPOGRAPHY.lineHeights.normal,
  },

  textMedium: {
    fontSize: COMPONENT_SIZES.button.medium.fontSize,
    lineHeight:
      COMPONENT_SIZES.button.medium.fontSize * TYPOGRAPHY.lineHeights.normal,
  },

  textLarge: {
    fontSize: COMPONENT_SIZES.button.large.fontSize,
    lineHeight:
      COMPONENT_SIZES.button.large.fontSize * TYPOGRAPHY.lineHeights.normal,
  },

  // Icon spacing using theme SPACING
  iconLeft: {
    marginRight: SPACING.xs,
  },

  iconRight: {
    marginLeft: SPACING.xs,
  },

  // Loading
  loadingContainer: {
    ...MIXINS.rowCenter,
  },

  loadingText: {
    marginLeft: SPACING.xs,
  },
});
