// components/social/Community/MemberList.styles.ts
import { StyleSheet } from 'react-native';
import { SPACING, TYPOGRAPHY, BORDERS, MIXINS } from '../../../constants/theme';

export const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
  },

  listContent: {
    padding: SPACING.md,
  },

  // Member item
  memberCard: {
    marginBottom: SPACING.xs,
  },

  memberContent: {
    ...MIXINS.rowCenter,
  },

  memberInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },

  memberHeader: {
    ...MIXINS.rowCenter,
    justifyContent: 'space-between',
    marginBottom: SPACING.xxs,
  },

  memberName: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    lineHeight: TYPOGRAPHY.sizes.body * TYPOGRAPHY.lineHeights.normal,
    flex: 1,
  },

  roleBadgeContainer: {
    marginLeft: SPACING.xs,
  },

  memberMeta: {
    ...MIXINS.rowCenter,
    justifyContent: 'flex-start',
  },

  memberSchool: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    lineHeight: TYPOGRAPHY.sizes.footnote * TYPOGRAPHY.lineHeights.normal,
    flex: 1,
  },

  separator: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginHorizontal: SPACING.xs,
  },

  joinedDate: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    lineHeight: TYPOGRAPHY.sizes.footnote * TYPOGRAPHY.lineHeights.normal,
  },

  // Empty state
  emptyContainer: {
    ...MIXINS.center,
    paddingVertical: SPACING.xxl,
  },

  emptyText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    lineHeight: TYPOGRAPHY.sizes.body * TYPOGRAPHY.lineHeights.normal,
  },

  // Footer
  footerContainer: {
    paddingVertical: SPACING.md,
    ...MIXINS.center,
  },

  loadMoreButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderRadius: BORDERS.sm,
  },

  loadMoreText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    lineHeight: TYPOGRAPHY.sizes.body * TYPOGRAPHY.lineHeights.normal,
  },
});
