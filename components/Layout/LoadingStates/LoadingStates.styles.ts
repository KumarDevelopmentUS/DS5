// components/layout/LoadingStates/LoadingStates.styles.ts
import { StyleSheet } from 'react-native';
import { SPACING, TYPOGRAPHY, MIXINS } from '../../../constants/theme';

export const styles = StyleSheet.create({
  // Spinner styles
  spinnerContainer: {
    ...MIXINS.center,
  },

  spinnerSmall: {
    width: 16,
    height: 16,
  },

  spinnerMedium: {
    width: 24,
    height: 24,
  },

  spinnerLarge: {
    width: 32,
    height: 32,
  },

  // Skeleton styles
  skeleton: {
    overflow: 'hidden',
  },

  skeletonGroup: {
    // Container for multiple skeletons
  },

  // Empty state styles
  emptyStateContainer: {
    ...MIXINS.center,
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },

  emptyStateIcon: {
    marginBottom: SPACING.lg,
    opacity: 0.6,
  },

  emptyStateTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.sizes.lg,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },

  emptyStateMessage: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.sizes.md,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sizes.md * 1.5,
    marginBottom: SPACING.xl,
  },

  emptyStateActions: {
    ...MIXINS.center,
    width: '100%',
    gap: SPACING.md,
  },

  emptyStateButton: {
    ...MIXINS.center,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    minWidth: 120,
  },

  emptyStateButtonPrimary: {
    // Will be styled with theme colors
  },

  emptyStateButtonSecondary: {
    borderWidth: 1,
    // Will be styled with theme colors
  },

  emptyStateButtonText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.sizes.md,
  },

  // Loading overlay styles
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    ...MIXINS.center,
    zIndex: 1000,
  },

  loadingOverlayContent: {
    ...MIXINS.center,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: SPACING.xl,
    minWidth: 120,
    minHeight: 120,
  },

  loadingOverlayMessage: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.sizes.md,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});
