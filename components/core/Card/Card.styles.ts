// components/core/Card/Card.styles.ts
import { StyleSheet } from 'react-native';
import { BORDERS, SPACING } from '../../../constants/theme';

export const styles = StyleSheet.create({
  // Base card styles
  card: {
    borderRadius: BORDERS.md,
    overflow: 'hidden',
  },

  // Layout variants
  fullWidth: {
    width: '100%',
  },

  // Content container (if needed for specific cases)
  content: {
    padding: SPACING.md,
  },
});
