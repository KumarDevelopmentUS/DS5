// components/layout/TabBar/TabBar.types.ts
import type { BottomTabNavigationEventMap } from '@react-navigation/bottom-tabs';
import type {
  NavigationHelpers,
  ParamListBase,
  TabNavigationState,
} from '@react-navigation/native';
import type { EdgeInsets } from 'react-native-safe-area-context';

export interface TabBarProps {
  state: TabNavigationState<ParamListBase>;
  descriptors: Record<string, any>;
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
  insets: EdgeInsets;
}

export interface TabInfo {
  key: string;
  name: string;
  icon: string;
  label: string;
  focused: boolean;
  color: string;
  onPress: () => void;
  onLongPress: () => void;
  badgeCount?: number;
}
