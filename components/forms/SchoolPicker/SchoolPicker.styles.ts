// components/forms/SchoolPicker/SchoolPicker.styles.ts
import { StyleSheet, Dimensions } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDERS } from '../../../constants/theme';

const { height: screenHeight } = Dimensions.get('window');

export const createStyles = (colors: typeof COLORS.light) =>
  StyleSheet.create({
    // Styles for the touchable input field
    pickerInput: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: BORDERS.md,
      backgroundColor: colors.surface,
    },
    pickerInputError: {
      borderColor: colors.error,
    },
    pickerText: {
      fontSize: TYPOGRAPHY.sizes.body,
      color: colors.text,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
    },
    placeholderText: {
      color: colors.textSecondary,
    },
    errorText: {
      color: colors.error,
      fontSize: TYPOGRAPHY.sizes.footnote,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      marginTop: SPACING.xs,
      marginLeft: SPACING.sm,
    },
    label: {
      fontSize: TYPOGRAPHY.sizes.callout,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: colors.text,
      marginBottom: SPACING.sm,
    },

    // Styles for the Modal
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      height: screenHeight * 0.8,
      backgroundColor: colors.background,
      borderTopLeftRadius: BORDERS.lg,
      borderTopRightRadius: BORDERS.lg,
      padding: SPACING.md,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: TYPOGRAPHY.sizes.title3,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: colors.text,
    },
    searchInput: {
      height: 44,
      backgroundColor: colors.surface,
      borderRadius: BORDERS.md,
      paddingHorizontal: SPACING.md,
      fontSize: TYPOGRAPHY.sizes.body,
      color: colors.text,
      marginVertical: SPACING.md,
    },
    listItem: {
      paddingVertical: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    listItemText: {
      fontSize: TYPOGRAPHY.sizes.body,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: colors.text,
    },
    emptyStateContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyStateText: {
      fontSize: TYPOGRAPHY.sizes.body,
      color: colors.textSecondary,
    },
  });
