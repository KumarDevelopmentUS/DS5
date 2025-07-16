import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AchievementItemProps } from './AchievementGrid.types';
import { useTheme } from '../../../hooks/ui/useTheme';
import { SPACING, BORDERS, TYPOGRAPHY } from '../../../constants/theme';
import { Card } from '../../core/Card';

export const AchievementItem: React.FC<AchievementItemProps> = ({
  achievement,
  onPress,
  size = 80,
}) => {
  const { colors } = useTheme();

  const handlePress = () => {
    if (onPress) {
      onPress(achievement);
    }
  };

  const rarityColor = {
    common: colors.textSecondary,
    uncommon: colors.success,
    rare: colors.primary,
    epic: '#9d4edd', // A purple color for epic
    legendary: '#fca311', // A gold color for legendary
  };

  const borderColor = achievement.unlocked
    ? rarityColor[achievement.rarity || 'common']
    : colors.border;

  return (
    <Pressable
      onPress={handlePress}
      style={{ width: size, height: size, margin: SPACING.xs }}
    >
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            backgroundColor: achievement.unlocked
              ? colors.background
              : colors.fill,
            borderColor,
          },
          !achievement.unlocked && styles.locked,
        ]}
      >
        {typeof achievement.icon === 'string' ? (
          <Ionicons
            name={achievement.icon as any}
            size={size * 0.5}
            color={achievement.unlocked ? colors.text : colors.textTertiary}
          />
        ) : (
          achievement.icon
        )}
      </View>
      <Text
        style={[styles.title, { color: colors.textSecondary }]}
        numberOfLines={2}
      >
        {achievement.title}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDERS.md,
    borderWidth: 2,
    overflow: 'hidden',
  },
  locked: {
    opacity: 0.5,
  },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.sizes.caption2,
    textAlign: 'center',
    marginTop: SPACING.xxs,
  },
});
