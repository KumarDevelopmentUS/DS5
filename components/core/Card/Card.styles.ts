// components/core/Card/Card.styles.ts
import { StyleSheet } from 'react-native';
import { BORDERS, SPACING, SHADOWS } from '../../../constants/theme';

export const styles = StyleSheet.create({
  // Base card styles - Apple-inspired design
  card: {
    borderRadius: BORDERS.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    ...SHADOWS.sm,
  },

  // Layout variants
  fullWidth: {
    width: '100%',
  },

  // Content container (if needed for specific cases)
  content: {
    padding: SPACING.md,
  },

  // Pressable variant for interactive cards
  pressable: {
    ...SHADOWS.sm,
  },
});
