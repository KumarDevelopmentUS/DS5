// components/social/Community/CommunityCard.styles.ts
import { StyleSheet } from 'react-native';
import { SPACING, TYPOGRAPHY, BORDERS, MIXINS } from '../../../constants/theme';

export const styles = StyleSheet.create({
  // Card container
  card: {
    // Additional card-specific styles if needed
  },

  // Header section
  header: {
    ...MIXINS.rowCenter,
    marginBottom: SPACING.sm,
  },

  headerContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },

  titleRow: {
    ...MIXINS.rowCenter,
    justifyContent: 'flex-start',
    marginBottom: SPACING.xxs,
  },

  title: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    lineHeight: TYPOGRAPHY.sizes.body * TYPOGRAPHY.lineHeights.normal,
    marginRight: SPACING.xs,
    flex: 1,
  },

  metaRow: {
    ...MIXINS.rowCenter,
    justifyContent: 'flex-start',
  },

  memberCount: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    lineHeight: TYPOGRAPHY.sizes.footnote * TYPOGRAPHY.lineHeights.normal,
  },

  separator: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginHorizontal: SPACING.xs,
  },

  school: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    lineHeight: TYPOGRAPHY.sizes.footnote * TYPOGRAPHY.lineHeights.normal,
    flex: 1,
  },

  // Description
  description: {
    fontSize: TYPOGRAPHY.sizes.subheadline,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    lineHeight: TYPOGRAPHY.sizes.subheadline * TYPOGRAPHY.lineHeights.relaxed,
    marginBottom: SPACING.sm,
  },

  // Actions section
  actions: {
    ...MIXINS.rowCenter,
    justifyContent: 'flex-end',
    marginTop: SPACING.xs,
  },

  joinButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDERS.sm,
    borderWidth: 1,
  },

  joinButtonText: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    lineHeight: TYPOGRAPHY.sizes.footnote * TYPOGRAPHY.lineHeights.normal,
    textAlign: 'center',
  },
});
