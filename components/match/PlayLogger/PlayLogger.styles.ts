// components/match/PlayLogger/PlayLogger.styles.ts
import { StyleSheet } from 'react-native';
import {
  SPACING,
  BORDERS,
  SHADOWS,
  TYPOGRAPHY,
  MIXINS,
} from '../../../constants/theme';

export const styles = StyleSheet.create({
  // Main container
  container: {
    padding: SPACING.lg,
  },

  // Step sections
  section: {
    marginBottom: SPACING.lg,
  },

  sectionHeader: {
    ...MIXINS.rowCenter,
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    paddingVertical: SPACING.xs,
  },

  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.headline,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    lineHeight: TYPOGRAPHY.sizes.headline * TYPOGRAPHY.lineHeights.normal,
  },

  sectionSubtitle: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    lineHeight: TYPOGRAPHY.sizes.footnote * TYPOGRAPHY.lineHeights.normal,
    marginTop: SPACING.xxs,
  },

  requiredIndicator: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },

  // Button grids
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },

  // Player buttons (larger)
  playerButton: {
    ...MIXINS.center,
    minHeight: 60,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDERS.md,
    borderWidth: 2,
    flex: 1,
    minWidth: '45%',
    maxWidth: '48%',
    ...SHADOWS.sm,
  },

  playerButtonContent: {
    ...MIXINS.center,
    gap: SPACING.xs,
  },

  playerName: {
    fontSize: TYPOGRAPHY.sizes.callout,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    textAlign: 'center',
  },

  playerTeam: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
  },

  // Play type buttons (smaller)
  playTypeButton: {
    ...MIXINS.center,
    minHeight: 48,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDERS.md,
    borderWidth: 2,
    minWidth: 80,
    ...SHADOWS.sm,
  },

  playTypeButtonContent: {
    ...MIXINS.center,
  },

  playTypeName: {
    fontSize: TYPOGRAPHY.sizes.subheadline,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    textAlign: 'center',
  },

  playTypePoints: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
    marginTop: SPACING.xxs,
  },

  // Special buttons
  showButton: {
    ...MIXINS.center,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDERS.md,
    borderWidth: 1,
    minHeight: 40,
  },

  showButtonText: {
    fontSize: TYPOGRAPHY.sizes.subheadline,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },

  // FIFA section
  fifaSection: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDERS.md,
    borderWidth: 1,
  },

  fifaGrid: {
    gap: SPACING.sm,
  },

  fifaActionButton: {
    ...MIXINS.center,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDERS.md,
    borderWidth: 2,
    minHeight: 44,
    flex: 1,
  },

  fifaActionText: {
    fontSize: TYPOGRAPHY.sizes.subheadline,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },

  // Redemption section
  redemptionSection: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDERS.md,
    borderWidth: 1,
  },

  redemptionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },

  redemptionButton: {
    ...MIXINS.center,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDERS.md,
    borderWidth: 2,
    flex: 1,
    minHeight: 44,
  },

  redemptionButtonText: {
    fontSize: TYPOGRAPHY.sizes.subheadline,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },

  // Special section
  specialSection: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDERS.md,
    borderWidth: 1,
  },

  specialButton: {
    ...MIXINS.center,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDERS.md,
    borderWidth: 2,
    minHeight: 44,
  },

  specialButtonText: {
    fontSize: TYPOGRAPHY.sizes.subheadline,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },

  // Actions
  actionsContainer: {
    ...MIXINS.rowCenter,
    gap: SPACING.md,
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
  },

  submitButton: {
    flex: 2,
  },

  undoButton: {
    flex: 1,
  },

  // Error display
  errorContainer: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDERS.md,
    borderWidth: 1,
  },

  errorText: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    textAlign: 'center',
  },

  // Team indicator
  teamIndicator: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    width: 12,
    height: 12,
    borderRadius: BORDERS.full,
  },

  // Disabled state
  disabled: {
    opacity: 0.5,
  },

  // Loading overlay
  loadingOverlay: {
    ...MIXINS.absoluteFill,
    ...MIXINS.center,
    borderRadius: BORDERS.md,
  },

  // Responsive adjustments for smaller screens
  compactGrid: {
    gap: SPACING.xs,
  },

  compactButton: {
    minHeight: 40,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },

  compactText: {
    fontSize: TYPOGRAPHY.sizes.footnote,
  },
});
