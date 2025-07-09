// components/layout/LoadingStates/LoadingStates.types.ts
import { ReactNode } from 'react';
import { ViewStyle, TextStyle, StyleProp } from 'react-native';

export type SpinnerSize = 'small' | 'medium' | 'large';
export type SpinnerVariant = 'primary' | 'secondary' | 'light' | 'dark';

export interface SpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export interface SkeletonLoaderProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export interface SkeletonGroupProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export interface EmptyStateProps {
  // Content
  title?: string;
  message?: string;
  icon?: ReactNode;

  // Actions
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;

  // Styling
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  messageStyle?: StyleProp<TextStyle>;

  // Accessibility
  testID?: string;
}

export interface EmptyStateAction {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
}

export interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  spinner?: boolean;
  backgroundColor?: string;
  opacity?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
