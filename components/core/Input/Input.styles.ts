// components/core/Input/Input.styles.ts
import { StyleSheet } from 'react-native';
import {
  SPACING,
  TYPOGRAPHY,
  BORDERS,
  COMPONENT_SIZES,
  MIXINS,
} from '../../../constants/theme';

export const styles = StyleSheet.create({
  // Container
  container: {
    width: '100%',
  },

  fullWidth: {
    flex: 1,
  },

  // Label
  label: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.sizes.subheadline,
    lineHeight: TYPOGRAPHY.sizes.subheadline * TYPOGRAPHY.lineHeights.normal,
    marginBottom: SPACING.xs,
  },

  // Input container base
  inputContainer: {
    ...MIXINS.rowCenter,
    borderWidth: 1.5,
    borderRadius: BORDERS.md,
    backgroundColor: 'transparent',
  },

  // Size variants - using COMPONENT_SIZES from theme
  small: {
    height: COMPONENT_SIZES.input.small.height,
    paddingHorizontal: COMPONENT_SIZES.input.small.paddingHorizontal,
  },

  medium: {
    height: COMPONENT_SIZES.input.medium.height,
    paddingHorizontal: COMPONENT_SIZES.input.medium.paddingHorizontal,
  },

  large: {
    height: COMPONENT_SIZES.input.large.height,
    paddingHorizontal: COMPONENT_SIZES.input.large.paddingHorizontal,
  },

  // Input field
  input: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    includeFontPadding: false,
    textAlignVertical: 'center',
    margin: 0,
    padding: 0,
  },

  // Input text sizes
  inputSmall: {
    fontSize: COMPONENT_SIZES.input.small.fontSize,
    lineHeight:
      COMPONENT_SIZES.input.small.fontSize * TYPOGRAPHY.lineHeights.normal,
  },

  inputMedium: {
    fontSize: COMPONENT_SIZES.input.medium.fontSize,
    lineHeight:
      COMPONENT_SIZES.input.medium.fontSize * TYPOGRAPHY.lineHeights.normal,
  },

  inputLarge: {
    fontSize: COMPONENT_SIZES.input.large.fontSize,
    lineHeight:
      COMPONENT_SIZES.input.large.fontSize * TYPOGRAPHY.lineHeights.normal,
  },

  // Icon containers
  iconContainer: {
    ...MIXINS.center,
  },

  prefixIcon: {
    marginRight: SPACING.sm,
  },

  suffixIcon: {
    marginLeft: SPACING.sm,
  },

  // Helper/Error text
  helperText: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.sizes.caption1,
    lineHeight: TYPOGRAPHY.sizes.caption1 * TYPOGRAPHY.lineHeights.normal,
    marginTop: SPACING.xs,
  },

  // Multiline input
  multiline: {
    paddingVertical: SPACING.sm,
    textAlignVertical: 'top',
    minHeight: 80,
  },
});
