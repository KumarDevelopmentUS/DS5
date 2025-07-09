// components/layout/Screen/Screen.styles.ts
import { StyleSheet } from 'react-native';
import { SPACING, TYPOGRAPHY, MIXINS } from '../../../constants/theme';

export const styles = StyleSheet.create({
  // Screen container
  screenContainer: {
    flex: 1,
  },

  // Fixed preset
  fixedContent: {
    flex: 1,
    padding: SPACING.md,
  },

  // Scroll preset
  scrollContainer: {
    flexGrow: 1,
  },

  scrollContent: {
    padding: SPACING.md,
  },

  // Auto preset (no padding)
  autoContent: {
    flex: 1,
  },

  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 56,
    alignItems: 'center',
  },

  headerContent: {
    flex: 1,
    ...MIXINS.center,
    paddingHorizontal: SPACING.sm,
  },

  headerTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.sizes.lg,
    textAlign: 'center',
  },

  headerSubtitle: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    marginTop: SPACING.xxs,
  },

  headerSide: {
    ...MIXINS.rowCenter,
    alignItems: 'center',
  },

  headerAction: {
    ...MIXINS.center,
    minWidth: 44,
    minHeight: 44,
    marginHorizontal: SPACING.xs / 2,
    borderRadius: 8,
  },

  headerActionText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.sizes.sm,
  },

  backButton: {
    ...MIXINS.center,
    minWidth: 44,
    minHeight: 44,
    borderRadius: 8,
  },

  // Disabled state
  disabled: {
    opacity: 0.5,
  },
});
