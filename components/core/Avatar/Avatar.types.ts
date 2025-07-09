// components/core/Avatar/Avatar.types.ts
import { ImageStyle, ViewStyle } from 'react-native';
import { COMPONENT_SIZES } from '../../../constants/theme';

export type AvatarSize = keyof typeof COMPONENT_SIZES.avatar;
export type OnlineStatus = 'online' | 'offline' | 'away' | 'busy';

export interface AvatarProps {
  // Image source
  source?: string | null;

  // Fallback content
  name?: string; // Used for initials fallback

  // Size
  size?: AvatarSize;

  // Status indicator
  showStatus?: boolean;
  status?: OnlineStatus;

  // Interaction
  pressable?: boolean;
  onPress?: () => void;

  // Styling
  style?: ViewStyle | ViewStyle[];
  imageStyle?: ImageStyle | ImageStyle[];

  // Accessibility
  testID?: string;
}
