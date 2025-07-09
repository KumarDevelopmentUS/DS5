// components/core/Card/Card.types.ts
import { ReactNode } from 'react';
import { PressableProps, ViewStyle } from 'react-native';
import { SHADOWS, SPACING } from '../../../constants/theme';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled';
export type CardShadow = keyof typeof SHADOWS;
export type SpacingKey = keyof typeof SPACING;

export interface CardProps extends Omit<PressableProps, 'style'> {
  // Content
  children: ReactNode;

  // Appearance
  variant?: CardVariant;
  shadow?: CardShadow;

  // Layout
  padding?: SpacingKey;
  margin?: SpacingKey;
  fullWidth?: boolean;

  // Interaction
  pressable?: boolean;

  // Styling
  style?: ViewStyle | ViewStyle[];

  // Accessibility
  testID?: string;
}
