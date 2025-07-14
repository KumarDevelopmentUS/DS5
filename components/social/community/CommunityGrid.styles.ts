// components/social/Community/CommunityGrid.styles.ts
import { StyleSheet } from 'react-native';
import { SPACING, MIXINS } from '../../../constants/theme';

export const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
  },

  listContent: {
    padding: SPACING.md,
  },

  // Grid layout
  row: {
    justifyContent: 'space-between',
  },

  gridItem: {
    marginBottom: SPACING.md,
  },

  // Empty state
  emptyContainer: {
    ...MIXINS.center,
    paddingVertical: SPACING.xxl,
  },

  // Footer
  footerContainer: {
    paddingVertical: SPACING.md,
    ...MIXINS.center,
  },
});
