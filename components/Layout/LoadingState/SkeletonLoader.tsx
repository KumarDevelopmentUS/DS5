// components/layout/LoadingStates/SkeletonLoader.tsx
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleProp, ViewStyle } from 'react-native';
import { SkeletonLoaderProps, SkeletonGroupProps } from './LoadingStates.types';
import { styles } from './LoadingStates.styles';
import { useTheme } from '../../../contexts/ThemeContext';

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  testID,
}) => {
  const { colors } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  // Create the base style with static properties
  const parseDimension = (value: string | number): number | `${number}%` => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.trim().endsWith('%'))
      return value as `${number}%`;
    const parsed = Number(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const baseStyle: StyleProp<ViewStyle> = [
    styles.skeleton,
    {
      width: parseDimension(width),
      height: parseDimension(height),
      borderRadius,
      backgroundColor: colors.fill,
    },
    style,
  ];

  return (
    <View style={baseStyle} testID={testID}>
      <Animated.View
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: colors.fill,
          opacity,
        }}
      />
    </View>
  );
};

// Component for grouping multiple skeletons with synchronized animation
export const SkeletonGroup: React.FC<SkeletonGroupProps> = ({
  children,
  style,
  testID,
}) => {
  return (
    <View style={[styles.skeletonGroup, style]} testID={testID}>
      {children}
    </View>
  );
};

// Pre-built skeleton patterns for common use cases
export const SkeletonCard: React.FC<{ testID?: string }> = ({ testID }) => (
  <SkeletonGroup testID={testID}>
    <SkeletonLoader width="100%" height={120} borderRadius={8} />
    <View style={{ marginTop: 12 }}>
      <SkeletonLoader width="80%" height={16} />
      <View style={{ marginTop: 8 }}>
        <SkeletonLoader width="60%" height={14} />
      </View>
    </View>
  </SkeletonGroup>
);

export const SkeletonList: React.FC<{ items?: number; testID?: string }> = ({
  items = 3,
  testID,
}) => (
  <SkeletonGroup testID={testID}>
    {Array.from({ length: items }, (_, index) => (
      <View key={index} style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <SkeletonLoader width={40} height={40} borderRadius={20} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <SkeletonLoader width="70%" height={14} />
            <View style={{ marginTop: 6 }}>
              <SkeletonLoader width="50%" height={12} />
            </View>
          </View>
        </View>
      </View>
    ))}
  </SkeletonGroup>
);

export const SkeletonProfile: React.FC<{ testID?: string }> = ({ testID }) => (
  <SkeletonGroup testID={testID}>
    <View style={{ alignItems: 'center', marginBottom: 24 }}>
      <SkeletonLoader width={80} height={80} borderRadius={40} />
      <View style={{ marginTop: 12 }}>
        <SkeletonLoader width={120} height={18} />
      </View>
      <View style={{ marginTop: 8 }}>
        <SkeletonLoader width={80} height={14} />
      </View>
    </View>
    <View>
      <SkeletonLoader width="100%" height={16} />
      <View style={{ marginTop: 8 }}>
        <SkeletonLoader width="85%" height={16} />
      </View>
      <View style={{ marginTop: 8 }}>
        <SkeletonLoader width="70%" height={16} />
      </View>
    </View>
  </SkeletonGroup>
);
