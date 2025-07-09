// components/core/Modal/Modal.styles.ts
import { StyleSheet, Dimensions } from 'react-native';
import { SPACING, BORDERS, Z_INDEX, MIXINS } from '../../../constants/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // Overlay
  overlay: {
    ...MIXINS.absoluteFill,
    ...MIXINS.center,
    zIndex: Z_INDEX.modalBackdrop,
  },

  // Backdrop
  backdrop: {
    ...MIXINS.absoluteFill,
  },

  // Modal container
  container: {
    zIndex: Z_INDEX.modal,
    borderRadius: BORDERS.lg,
    overflow: 'hidden',
    maxWidth: screenWidth - SPACING.lg * 2,
    maxHeight: screenHeight - SPACING.xl * 2,
  },

  // Header
  header: {
    ...MIXINS.rowCenter,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },

  // Title
  title: {
    flex: 1,
    textAlign: 'center',
  },

  // Close button
  closeButton: {
    ...MIXINS.center,
    width: 32,
    height: 32,
    borderRadius: BORDERS.md,
  },

  // Content - removed flex to avoid type conflicts
  content: {
    minHeight: 100,
  },

  // Size variants
  small: {
    width: Math.min(320, screenWidth - SPACING.lg * 2),
  },

  medium: {
    width: Math.min(480, screenWidth - SPACING.lg * 2),
  },

  large: {
    width: Math.min(640, screenWidth - SPACING.lg * 2),
  },

  fullscreen: {
    width: screenWidth,
    height: screenHeight,
    maxWidth: screenWidth,
    maxHeight: screenHeight,
    borderRadius: 0,
  },

  // Position variants
  center: {
    // Default center position handled by overlay
  },

  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
});
