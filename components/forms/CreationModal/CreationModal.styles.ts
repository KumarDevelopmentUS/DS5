// components/forms/CreationModal/CreationModal.styles.ts
import { StyleSheet } from 'react-native';
import {
  SPACING,
  TYPOGRAPHY,
  BORDERS,
  SHADOWS,
  MIXINS,
} from '../../../constants/theme';

export const styles = StyleSheet.create({
  // Modal content container
  container: {
    minHeight: 320,
    maxHeight: '80%',
  },

  // Header section
  header: {
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    marginBottom: SPACING.lg,
  },

  title: {
    fontSize: TYPOGRAPHY.sizes.title2,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    textAlign: 'center',
    marginBottom: SPACING.xs,
    lineHeight: TYPOGRAPHY.sizes.title2 * TYPOGRAPHY.lineHeights.tight,
  },

  subtitle: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sizes.body * TYPOGRAPHY.lineHeights.normal,
  },

  // Options grid
  optionsContainer: {
    flex: 1,
  },

  optionsGrid: {
    gap: SPACING.md,
  },

  // Individual option card
  optionCard: {
    ...MIXINS.rowCenter,
    padding: SPACING.lg,
    borderRadius: BORDERS.lg,
    borderWidth: 1,
    minHeight: 80,
    ...SHADOWS.sm,
  },

  optionCardPressed: {
    transform: [{ scale: 0.98 }],
    ...SHADOWS.md,
  },

  optionCardDisabled: {
    opacity: 0.5,
  },

  // Option content
  optionIconContainer: {
    ...MIXINS.center,
    width: 48,
    height: 48,
    borderRadius: BORDERS.lg,
    marginRight: SPACING.md,
  },

  optionContent: {
    flex: 1,
  },

  optionTitle: {
    fontSize: TYPOGRAPHY.sizes.callout,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    marginBottom: SPACING.xs,
    lineHeight: TYPOGRAPHY.sizes.callout * TYPOGRAPHY.lineHeights.tight,
  },

  optionDescription: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    lineHeight: TYPOGRAPHY.sizes.footnote * TYPOGRAPHY.lineHeights.normal,
  },

  // Coming soon badge
  comingSoonBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xxs,
    borderRadius: BORDERS.sm,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
  },

  comingSoonText: {
    fontSize: TYPOGRAPHY.sizes.caption2,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: '#FF9500',
  },

  // Footer (if needed for additional actions)
  footer: {
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    marginTop: SPACING.lg,
  },

  footerButton: {
    marginTop: SPACING.md,
  },

  // Loading state
  loadingContainer: {
    ...MIXINS.center,
    padding: SPACING.xl,
  },

  loadingText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginTop: SPACING.md,
    textAlign: 'center',
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
    marginTop: SPACING.md,
  },
});
