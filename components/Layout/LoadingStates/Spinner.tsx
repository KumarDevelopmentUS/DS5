// components/layout/LoadingStates/Spinner.tsx
import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import { SpinnerProps } from './LoadingStates.types';
import { styles } from './LoadingStates.styles';
import { useTheme } from '../../../contexts/ThemeContext';

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'medium',
  variant = 'primary',
  style,
  testID,
}) => {
  const { colors } = useTheme();
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    spinAnimation.start();

    return () => spinAnimation.stop();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.spinnerSmall;
      case 'large':
        return styles.spinnerLarge;
      case 'medium':
      default:
        return styles.spinnerMedium;
    }
  };

  const getColor = () => {
    switch (variant) {
      case 'secondary':
        return colors.secondary;
      case 'light':
        return '#FFFFFF';
      case 'dark':
        return colors.text;
      case 'primary':
      default:
        return colors.primary;
    }
  };

  const sizeStyle = getSizeStyle();
  const color = getColor();
  const strokeWidth = size === 'small' ? 2 : size === 'large' ? 3 : 2.5;

  return (
    <View style={[styles.spinnerContainer, style]} testID={testID}>
      <Animated.View
        style={[
          sizeStyle,
          {
            transform: [{ rotate: spin }],
          },
        ]}
      >
        <View
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 999,
            borderWidth: strokeWidth,
            borderColor: `${color}20`, // 20% opacity for background
            borderTopColor: color,
          }}
        />
      </Animated.View>
    </View>
  );
};
