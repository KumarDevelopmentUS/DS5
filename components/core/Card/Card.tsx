// components/core/Card/Card.tsx
import React from 'react';
import { Pressable, View } from 'react-native';
import { SHADOWS, SPACING } from '../../../constants/theme';
import { useTheme } from '../../../contexts/ThemeContext';
import { styles } from './Card.styles';
import { CardProps } from './Card.types';

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  shadow = 'sm',
  padding = 'md',
  margin,
  fullWidth = false,
  pressable = false,
  style,
  testID,
  ...pressableProps
}) => {
  const { colors } = useTheme();

  // Get card styles based on variant
  const getCardStyles = () => {
    // Start with base static styles
    const staticStyles = [styles.card, fullWidth && styles.fullWidth];

    // Create dynamic styles object
    let dynamicStyles: any = {
      // Add shadow if not 'none'
      ...(shadow !== 'none' && SHADOWS[shadow]),
      // Add padding using SPACING constants
      ...(padding && { padding: SPACING[padding] }),
      // Add margin using SPACING constants
      ...(margin && { margin: SPACING[margin] }),
    };

    // Add variant-specific styles
    switch (variant) {
      case 'default':
        dynamicStyles = {
          ...dynamicStyles,
          backgroundColor: colors.surface,
        };
        break;
      case 'elevated':
        dynamicStyles = {
          ...dynamicStyles,
          backgroundColor: colors.background,
        };
        break;
      case 'outlined':
        dynamicStyles = {
          ...dynamicStyles,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.border,
        };
        break;
      case 'filled':
        dynamicStyles = {
          ...dynamicStyles,
          backgroundColor: colors.fill,
        };
        break;
    }

    return [...staticStyles, dynamicStyles, style];
  };

  // If pressable, wrap in Pressable component
  if (pressable) {
    return (
      <Pressable
        style={({ pressed }) => [
          ...getCardStyles(),
          pressed && {
            opacity: colors.activeOpacity,
            transform: [{ scale: 0.98 }],
          },
        ]}
        testID={testID}
        {...pressableProps}
      >
        {children}
      </Pressable>
    );
  }

  // Otherwise, use View
  return (
    <View style={getCardStyles()} testID={testID}>
      {children}
    </View>
  );
};
