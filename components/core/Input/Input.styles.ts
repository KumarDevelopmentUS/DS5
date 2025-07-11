import { StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDERS } from '../../../constants/theme';

export const createStyles = (colors: typeof COLORS.light) =>
  StyleSheet.create({
    container: {
      width: '100%',
    },
    label: {
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      fontSize: TYPOGRAPHY.sizes.caption1,
      color: colors.textSecondary,
      marginBottom: SPACING.xs,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: BORDERS.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: SPACING.md,
    },
    inputContainerError: {
      borderColor: colors.error,
    },
    input: {
      flex: 1,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      fontSize: TYPOGRAPHY.sizes.body,
      color: colors.text,
      height: 48, // Standard input height
    },
    icon: {
      marginHorizontal: SPACING.sm,
    },
    errorText: {
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      fontSize: TYPOGRAPHY.sizes.caption2,
      color: colors.error,
      marginTop: SPACING.xs,
      paddingLeft: SPACING.xs,
    },
  });
