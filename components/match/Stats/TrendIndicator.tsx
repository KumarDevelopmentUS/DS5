import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TrendIndicatorProps } from './Stats.types';
import { useTheme } from '../../../hooks/ui/useTheme';
import { SPACING, TYPOGRAPHY } from '../../../constants/theme';

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  trend,
  value,
  size = 'medium',
  showIcon = true,
  style,
  testID,
}) => {
  const { colors } = useTheme();

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return colors.success;
      case 'down':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { fontSize: TYPOGRAPHY.sizes.caption2, iconSize: 12 };
      case 'large':
        return { fontSize: TYPOGRAPHY.sizes.body, iconSize: 20 };
      default:
        return { fontSize: TYPOGRAPHY.sizes.footnote, iconSize: 16 };
    }
  };

  const sizeStyles = getSizeStyles();
  const trendColor = getTrendColor();

  return (
    <View style={[styles.container, style]} testID={testID}>
      {showIcon && (
        <Ionicons
          name={getTrendIcon() as any}
          size={sizeStyles.iconSize}
          color={trendColor}
          style={styles.icon}
        />
      )}
      {value && (
        <Text
          style={[
            styles.value,
            {
              fontSize: sizeStyles.fontSize,
              color: trendColor,
            },
          ]}
        >
          {trend === 'up' && '+'}
          {value}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: SPACING.xxs,
  },
  value: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
});
