// components/match/ActiveMatchCard/ActiveMatchCard.styles.ts
import { StyleSheet } from 'react-native';
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BORDERS,
  MIXINS,
} from '../../../constants/theme';

export const createStyles = (colors: typeof COLORS.light) =>
  StyleSheet.create({
    // Main container
    container: {
      marginBottom: SPACING.md,
    },

    // Header section
    header: {
      ...MIXINS.rowCenter,
      justifyContent: 'space-between',
      marginBottom: SPACING.sm,
    },

    headerLeft: {
      flex: 1,
      marginRight: SPACING.sm,
    },

    title: {
      fontSize: TYPOGRAPHY.sizes.title3,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: colors.text,
      marginBottom: SPACING.xxs,
    },

    subtitle: {
      fontSize: TYPOGRAPHY.sizes.caption1,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: colors.textSecondary,
    },

    // Status section
    statusContainer: {
      ...MIXINS.rowCenter,
    },

    // Participants section
    participantsContainer: {
      ...MIXINS.rowCenter,
      marginBottom: SPACING.sm,
    },

    participantAvatars: {
      ...MIXINS.rowCenter,
      marginRight: SPACING.sm,
    },

    participantAvatar: {
      marginLeft: -SPACING.xs, // Overlap avatars slightly
    },

    participantAvatarFirst: {
      marginLeft: 0, // First avatar has no left margin
    },

    participantCount: {
      fontSize: TYPOGRAPHY.sizes.caption1,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: colors.textSecondary,
    },

    moreParticipants: {
      ...MIXINS.center,
      width: 32,
      height: 32,
      borderRadius: BORDERS.full,
      backgroundColor: colors.fillSecondary,
      borderWidth: 2,
      borderColor: colors.background,
      marginLeft: -SPACING.xs,
    },

    moreParticipantsText: {
      fontSize: TYPOGRAPHY.sizes.caption2,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: colors.textSecondary,
      includeFontPadding: false,
    },

    // Metadata section
    metadataContainer: {
      ...MIXINS.rowCenter,
      justifyContent: 'space-between',
      marginBottom: SPACING.md,
    },

    metadataItem: {
      ...MIXINS.rowCenter,
    },

    metadataIcon: {
      marginRight: SPACING.xs,
    },

    metadataText: {
      fontSize: TYPOGRAPHY.sizes.caption1,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: colors.textSecondary,
    },

    metadataTextBold: {
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: colors.text,
    },

    roomCode: {
      fontSize: TYPOGRAPHY.sizes.caption1,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: colors.primary,
      letterSpacing: TYPOGRAPHY.letterSpacing.wide,
    },

    // Actions section
    actionsContainer: {
      ...MIXINS.rowCenter,
      gap: SPACING.sm,
    },

    actionButton: {
      flex: 1,
    },

    primaryAction: {
      flex: 1.5, // Make primary action slightly larger
    },

    // Score section (if match is active)
    scoreContainer: {
      ...MIXINS.rowCenter,
      justifyContent: 'center',
      paddingVertical: SPACING.sm,
      marginBottom: SPACING.sm,
      backgroundColor: colors.fillTertiary,
      borderRadius: BORDERS.sm,
    },

    scoreText: {
      fontSize: TYPOGRAPHY.sizes.title2,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: colors.text,
      marginHorizontal: SPACING.md,
    },

    scoreVs: {
      fontSize: TYPOGRAPHY.sizes.body,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: colors.textSecondary,
    },

    // Live indicator
    liveIndicator: {
      ...MIXINS.rowCenter,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      backgroundColor: colors.error,
      borderRadius: BORDERS.full,
    },

    liveIndicatorDot: {
      width: 6,
      height: 6,
      borderRadius: BORDERS.full,
      backgroundColor: '#FFFFFF',
      marginRight: SPACING.xs,
    },

    liveIndicatorText: {
      fontSize: TYPOGRAPHY.sizes.caption2,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: '#FFFFFF',
      textTransform: 'uppercase',
    },

    // Empty state
    emptyParticipants: {
      ...MIXINS.rowCenter,
    },

    emptyParticipantsText: {
      fontSize: TYPOGRAPHY.sizes.caption1,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: colors.textTertiary,
      fontStyle: 'italic',
    },
  });
