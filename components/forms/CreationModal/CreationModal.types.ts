// components/forms/CreationModal/CreationModal.types.ts
import { ReactNode } from 'react';
import { ViewStyle } from 'react-native';

export type CreationOptionType =
  | 'match'
  | 'post'
  | 'community'
  | 'tournament'
  | 'event';

export interface CreationOption {
  id: CreationOptionType;
  title: string;
  description: string;
  iconName: string;
  route: string;
  requiresAuth?: boolean;
  requiresPermission?: boolean;
  comingSoon?: boolean;
}

export interface CreationModalProps {
  // Visibility
  visible: boolean;
  onClose: () => void;

  // Behavior
  onOptionSelect?: (option: CreationOption) => void;
  enabledOptions?: CreationOptionType[];
  disabledOptions?: CreationOptionType[];

  // Customization
  title?: string;
  subtitle?: string;
  customOptions?: CreationOption[];

  // Styling
  style?: ViewStyle | ViewStyle[];

  // Accessibility
  testID?: string;
}
