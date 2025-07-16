import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { ProgressBarProps } from './Stats.types';
import { useTheme } from '../../../hooks/ui/useTheme';
import { SPACING, TYPOGRAPHY, BORDERS } from '../../../constants/theme';

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  color,
  backgroundColor,
  height = 8,
  animated = true,
  style,
  testID,
}) => {
  const { colors } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const barColor = color || colors.primary;
  const bgColor = backgroundColor || colors.fill;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: percentage,
        duration: 500,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(percentage);
    }
  }, [percentage, animated]);

  const widthInterpolation = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, style]} testID={testID}>
      {(label || showPercentage) && (
        <View style={styles.labelContainer}>
          {label && (
            <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
          )}
          {showPercentage && (
            <Text style={[styles.percentage, { color: colors.textSecondary }]}>
              {Math.round(percentage)}%
            </Text>
          )}
        </View>
      )}
      <View
        style={[
          styles.progressContainer,
          {
            height,
            backgroundColor: bgColor,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: widthInterpolation,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  percentage: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  progressContainer: {
    width: '100%',
    borderRadius: BORDERS.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: BORDERS.full,
  },
});
