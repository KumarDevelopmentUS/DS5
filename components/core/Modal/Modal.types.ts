// components/core/Modal/Modal.types.ts
import { ReactNode } from 'react';
import { ViewStyle, ModalProps as RNModalProps } from 'react-native';
import { SPACING, ANIMATIONS } from '../../../constants/theme';

export type ModalSize = 'small' | 'medium' | 'large' | 'fullscreen';
export type ModalPosition = 'center' | 'bottom' | 'top';
export type AnimationType = 'slide' | 'fade' | 'scale';
export type SpacingKey = keyof typeof SPACING;

export interface ModalProps extends Omit<RNModalProps, 'animationType'> {
  // Visibility
  visible: boolean;
  onClose: () => void;

  // Content
  children: ReactNode;
  title?: string;

  // Layout
  size?: ModalSize;
  position?: ModalPosition;
  padding?: SpacingKey;

  // Behavior
  dismissible?: boolean;
  closeOnBackdropPress?: boolean;
  showCloseButton?: boolean;

  // Animation
  animationType?: AnimationType;
  animationDuration?: keyof typeof ANIMATIONS;

  // Styling
  style?: ViewStyle | ViewStyle[];
  contentStyle?: ViewStyle | ViewStyle[];

  // Accessibility
  testID?: string;
}
