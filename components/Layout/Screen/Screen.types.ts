// components/layout/Screen/Screen.types.ts
import { ReactNode } from 'react';
import { ViewStyle, ScrollViewProps, StyleProp, TextStyle } from 'react-native';

export interface ScreenHeaderProps {
  // Title
  title?: string;
  subtitle?: string;

  // Navigation
  showBackButton?: boolean;
  onBackPress?: () => void;
  backButtonTestID?: string;

  // Actions
  rightActions?: ScreenHeaderAction[];
  leftActions?: ScreenHeaderAction[];

  // Styling
  headerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;

  // Accessibility
  testID?: string;
}

export interface ScreenHeaderAction {
  id: string;
  icon?: ReactNode;
  text?: string;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
}

export type ScreenPreset = 'fixed' | 'scroll' | 'auto';

export interface ScreenProps {
  // Content
  children: ReactNode;

  // Header
  header?: ScreenHeaderProps | null;

  // Layout
  preset?: ScreenPreset;
  safeAreaEdges?: ('top' | 'bottom' | 'left' | 'right')[];

  // Styling
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;

  // ScrollView props (when preset is 'scroll')
  scrollViewProps?: Omit<
    ScrollViewProps,
    'children' | 'style' | 'contentContainerStyle'
  >;

  // Keyboard
  keyboardShouldPersistTaps?: 'never' | 'always' | 'handled';

  // Accessibility
  testID?: string;
}
