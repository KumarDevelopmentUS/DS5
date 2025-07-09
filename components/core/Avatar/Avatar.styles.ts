// components/core/Avatar/Avatar.styles.ts
import { StyleSheet } from 'react-native';
import { BORDERS, COMPONENT_SIZES, MIXINS } from '../../../constants/theme';

export const styles = StyleSheet.create({
  // Base container
  container: {
    ...MIXINS.center,
    borderRadius: BORDERS.full,
    overflow: 'hidden',
  },

  // Size variants using theme constants
  small: {
    width: COMPONENT_SIZES.avatar.small,
    height: COMPONENT_SIZES.avatar.small,
  },

  medium: {
    width: COMPONENT_SIZES.avatar.medium,
    height: COMPONENT_SIZES.avatar.medium,
  },

  large: {
    width: COMPONENT_SIZES.avatar.large,
    height: COMPONENT_SIZES.avatar.large,
  },

  xlarge: {
    width: COMPONENT_SIZES.avatar.xlarge,
    height: COMPONENT_SIZES.avatar.xlarge,
  },

  // Image
  image: {
    width: '100%',
    height: '100%',
    borderRadius: BORDERS.full,
  },

  // Initials fallback
  initials: {
    ...MIXINS.center,
    width: '100%',
    height: '100%',
  },

  // Status indicator container
  statusContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },

  // Status indicator
  statusIndicator: {
    borderRadius: BORDERS.full,
    borderWidth: 2,
  },

  // Status indicator sizes (based on avatar size)
  statusSmall: {
    width: 8,
    height: 8,
  },

  statusMedium: {
    width: 12,
    height: 12,
  },

  statusLarge: {
    width: 16,
    height: 16,
  },

  statusXlarge: {
    width: 20,
    height: 20,
  },

  // Pressable state
  pressable: {
    // Handled dynamically with opacity
  },
});
