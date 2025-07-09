// components/core/Input/Input.types.ts
import { ReactNode } from 'react';
import { TextInputProps, TextStyle, ViewStyle } from 'react-native';

export type InputSize = 'small' | 'medium' | 'large';
export type InputState = 'default' | 'error' | 'success' | 'disabled';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  // Content
  label?: string;
  helperText?: string;
  errorText?: string;

  // Appearance
  size?: InputSize;
  state?: InputState;

  // Icons
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
  onPrefixPress?: () => void;
  onSuffixPress?: () => void;

  // Layout
  fullWidth?: boolean;

  // Styling
  style?: ViewStyle | ViewStyle[];
  inputStyle?: TextStyle | TextStyle[];
  labelStyle?: TextStyle | TextStyle[];

  // Accessibility
  testID?: string;
}
