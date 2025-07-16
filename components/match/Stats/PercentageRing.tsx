import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { PercentageRingProps } from './Stats.types';
import { useTheme } from '../../../hooks/ui/useTheme';
import { TYPOGRAPHY } from '../../../constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const PercentageRing: React.FC<PercentageRingProps> = ({
  percentage,
  size = 80,
  strokeWidth = 8,
  color,
  backgroundColor,
  showLabel = true,
  label,
  animated = true,
  style,
  testID,
}) => {
  const { colors } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const ringColor = color || colors.primary;
  const bgColor = backgroundColor || colors.fill;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: percentage,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    } else {
      animatedValue.setValue(percentage);
    }
  }, [percentage, animated]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View
      style={[styles.container, { width: size, height: size }, style]}
      testID={testID}
    >
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
      </Svg>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={[styles.percentageText, { color: colors.text }]}>
            {Math.round(percentage)}%
          </Text>
          {label && (
            <Text style={[styles.labelText, { color: colors.textSecondary }]}>
              {label}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  labelContainer: {
    alignItems: 'center',
  },
  percentageText: {
    fontSize: TYPOGRAPHY.sizes.headline,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  labelText: {
    fontSize: TYPOGRAPHY.sizes.caption2,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginTop: 2,
  },
});
