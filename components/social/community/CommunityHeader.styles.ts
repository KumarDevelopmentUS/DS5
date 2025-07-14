// components/social/Community/CommunityHeader.styles.ts
import { StyleSheet } from 'react-native';
import {
  SPACING,
  TYPOGRAPHY,
  BORDERS,
  MIXINS,
  COMPONENT_SIZES,
} from '../../../constants/theme';

const BANNER_HEIGHT = 120;
const AVATAR_SIZE = COMPONENT_SIZES.avatar.xlarge;
const AVATAR_OVERLAP = AVATAR_SIZE / 2;

export const styles = StyleSheet.create({
  // Main container
  container: {
    paddingBottom: SPACING.lg,
  },

  // Banner section
  bannerImage: {
    height: BANNER_HEIGHT,
    width: '100%',
  },

  bannerPlaceholder: {
    height: BANNER_HEIGHT,
    width: '100%',
  },

  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  // Avatar section
  avatarContainer: {
    alignItems: 'center',
    marginTop: -AVATAR_OVERLAP,
    marginBottom: SPACING.sm,
  },

  avatar: {
    borderWidth: 4,
  },

  // Info section
  infoContainer: {
    paddingHorizontal: SPACING.md,
  },

  titleRow: {
    ...MIXINS.rowCenter,
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },

  title: {
    fontSize: TYPOGRAPHY.sizes.title2,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    lineHeight: TYPOGRAPHY.sizes.title2 * TYPOGRAPHY.lineHeights.tight,
    flex: 1,
    textAlign: 'center',
  },

  badges: {
    ...MIXINS.rowCenter,
    position: 'absolute',
    right: 0,
    top: 0,
  },

  badge: {
    marginLeft: SPACING.xs,
  },

  description: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    lineHeight: TYPOGRAPHY.sizes.body * TYPOGRAPHY.lineHeights.relaxed,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },

  metaRow: {
    ...MIXINS.rowCenter,
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },

  memberButton: {
    ...MIXINS.center,
  },

  memberCount: {
    fontSize: TYPOGRAPHY.sizes.title3,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    lineHeight: TYPOGRAPHY.sizes.title3 * TYPOGRAPHY.lineHeights.tight,
  },

  memberLabel: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    lineHeight: TYPOGRAPHY.sizes.footnote * TYPOGRAPHY.lineHeights.normal,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  separator: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginHorizontal: SPACING.md,
  },

  school: {
    fontSize: TYPOGRAPHY.sizes.subheadline,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    lineHeight: TYPOGRAPHY.sizes.subheadline * TYPOGRAPHY.lineHeights.normal,
  },

  // Actions section
  actionsContainer: {
    paddingHorizontal: SPACING.md,
    ...MIXINS.rowCenter,
    justifyContent: 'center',
  },

  actionButton: {
    marginHorizontal: SPACING.xs,
    minWidth: 120,
  },
});
