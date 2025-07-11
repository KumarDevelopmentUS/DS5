import { TextInputProps, StyleProp, ViewStyle } from 'react-native';

export interface InputProps extends TextInputProps {
  /** A label to be displayed above the input field. */
  label?: string;
  /** An error message to be displayed below the input. If present, the input will be styled to indicate an error. */
  error?: string;
  /** Style for the outer container view. */
  containerStyle?: StyleProp<ViewStyle>;
  /** An optional icon or component to display on the left side of the input. */
  leftIcon?: React.ReactNode;
  /** An optional icon or component to display on the right side of the input. */
  rightIcon?: React.ReactNode;
}
