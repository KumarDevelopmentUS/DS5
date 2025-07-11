// components/forms/AuthForm/AuthForm.styles.ts

import { StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDERS } from '../../../constants/theme';

// The styles are created inside a function to accept the current theme's colors.
export const createStyles = (colors: typeof COLORS.light) =>
  StyleSheet.create({
    container: {
      width: '100%',
    },
    title: {
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      fontSize: TYPOGRAPHY.sizes.largeTitle,
      color: colors.text,
      marginBottom: SPACING.sm,
      textAlign: 'center',
    },
    subtitle: {
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      fontSize: TYPOGRAPHY.sizes.body,
      color: colors.textSecondary,
      marginBottom: SPACING.xl,
      textAlign: 'center',
    },
    inputContainer: {
      marginBottom: SPACING.md,
    },
    buttonContainer: {
      marginTop: SPACING.md,
    },
    errorContainer: {
      marginTop: SPACING.md,
      backgroundColor: colors.error,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: BORDERS.md,
    },
    serverErrorText: {
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.light.background, // Always use light text on error background
      textAlign: 'center',
      fontSize: TYPOGRAPHY.sizes.footnote,
    },
    linksContainer: {
      marginTop: SPACING.lg,
      alignItems: 'center',
    },
    linkButton: {
      padding: SPACING.sm,
    },
    linkText: {
      color: colors.primary,
      fontSize: TYPOGRAPHY.sizes.body,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },
    forgotPasswordButton: {
      marginTop: SPACING.sm,
    },
  });
