import React from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { AchievementGridProps } from './AchievementGrid.types';
import { AchievementItem } from './AchievementItem';
import { useTheme } from '../../../hooks/ui/useTheme';
import { SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { Card } from '../../core/Card';

const { width: screenWidth } = Dimensions.get('window');

export const AchievementGrid: React.FC<AchievementGridProps> = ({
  achievements,
  onAchievementPress,
  columns = 4,
  style,
  testID,
  title,
}) => {
  const { colors } = useTheme();
  // Adjust total padding as needed
  const totalHorizontalPadding = SPACING.md * 2;
  const itemSize = (screenWidth - totalHorizontalPadding) / columns;

  // Correctly flatten the style array to handle the optional style prop
  const cardStyle = StyleSheet.flatten([styles.card, style]);

  return (
    <Card style={cardStyle} testID={testID}>
      {title && (
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      )}
      <FlatList
        data={achievements}
        keyExtractor={(item) => item.id}
        numColumns={columns}
        renderItem={({ item }) => (
          <AchievementItem
            achievement={item}
            onPress={onAchievementPress}
            size={itemSize - SPACING.sm * 2} // Adjust for margin/padding within item
          />
        )}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.headline,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  listContent: {
    alignItems: 'center',
  },
  row: {
    justifyContent: 'flex-start',
  },
});
