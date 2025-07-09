// components/core/Badge/Badge.types.ts
import { ReactNode } from 'react';
import { ViewStyle, TextStyle } from 'react-native';
import { SPACING } from '../../../constants/theme';

export type BadgeVariant = 'status' | 'count' | 'achievement' | 'label';
export type BadgeSize = 'small' | 'medium' | 'large';

// Badge-specific color system for achievements and status
export type BadgeColor =
  // Achievement tiers
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'diamond'
  | 'master'
  // Status colors
  | 'default'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  // Special colors
  | 'legendary'
  | 'epic'
  | 'rare';

export type SpacingKey = keyof typeof SPACING;

export interface BadgeProps {
  // Content
  text?: string;
  count?: number;
  icon?: ReactNode; // TODO: Add specific achievement icons later

  // Appearance
  variant?: BadgeVariant;
  size?: BadgeSize;
  color?: BadgeColor;

  // Layout
  position?: 'absolute' | 'relative';

  // Interaction
  pressable?: boolean;
  onPress?: () => void;

  // Styling
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];

  // Accessibility
  testID?: string;
}
