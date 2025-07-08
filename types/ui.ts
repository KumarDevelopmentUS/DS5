// types/ui.ts
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

// Navigation Parameter Types
export type RootStackParamList = {
  // Auth routes
  '(auth)/login': undefined;
  '(auth)/signup': undefined;
  '(auth)/forgot-password': undefined;

  // Tab routes
  '(tabs)/home': undefined;
  '(tabs)/social': undefined;
  '(tabs)/profile': undefined;

  // Match routes
  'match/create': undefined;
  'match/[id]/index': { id: string };
  'match/[id]/stats': { id: string };
  'match/[id]/recap': { id: string };
  'match/history/[id]': { id: string };

  // Social routes
  'social/community/[id]/index': { id: string };
  'social/community/[id]/members': { id: string };
  'social/community/[id]/settings': { id: string };
  'social/post/[id]': { id: string };
  'social/friends/index': undefined;
  'social/friends/[id]': { id: string };

  // Analytics routes
  'analytics/player/[id]': { id: string };
  'analytics/team/[id]': { id: string };
  'analytics/leaderboards': undefined;

  // Settings routes
  'settings/index': undefined;
  'settings/appearance': undefined;
  'settings/notifications': undefined;
  'settings/privacy': undefined;
};

// Screen Props Types
export type ScreenProps<T extends keyof RootStackParamList> = {
  navigation: NativeStackNavigationProp<RootStackParamList, T>;
  route: RouteProp<RootStackParamList, T>;
};

// Form State Management
export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface FormField {
  value: string;
  error?: string;
  touched: boolean;
  required?: boolean;
}

// Multi-Step Form State
export interface MultiStepFormState<T> {
  currentStep: number;
  totalSteps: number;
  stepData: Partial<T>[];
  isComplete: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

// Loading States
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  state: LoadingState;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  hasMore: boolean;
  total?: number;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationParams;
  isLoadingMore: boolean;
  isRefreshing: boolean;
}

// Component Props Base Types
export interface BaseComponentProps {
  style?: ViewStyle | ViewStyle[];
  testID?: string;
  accessible?: boolean;
  accessibilityLabel?: string;
}

export interface BaseTextProps {
  style?: TextStyle | TextStyle[];
  testID?: string;
  accessible?: boolean;
  accessibilityLabel?: string;
}

export interface BaseImageProps extends BaseComponentProps {
  style?: ImageStyle | ImageStyle[];
}

// Modal Props
export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  animationType?: 'none' | 'slide' | 'fade';
  transparent?: boolean;
  presentationStyle?:
    | 'fullScreen'
    | 'pageSheet'
    | 'formSheet'
    | 'overFullScreen';
}

// List Item Props
export interface ListItemProps<T> {
  item: T;
  index: number;
  onPress?: (item: T) => void;
  isSelected?: boolean;
  isDisabled?: boolean;
}

// Tab Bar Props
export interface TabBarProps {
  state: any; // From React Navigation
  descriptors: any; // From React Navigation
  navigation: any; // From React Navigation
  position?: any; // For animated tab bars
}

// Search Props
export interface SearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  placeholder?: string;
  isSearching?: boolean;
  results?: any[];
  onClear?: () => void;
}

// Filter Props
export interface FilterOption<T = string> {
  label: string;
  value: T;
  icon?: string;
}

export interface FilterState<T = any> {
  activeFilters: T;
  availableFilters: FilterOption[];
  onFilterChange: (filters: T) => void;
  onReset: () => void;
}

// Sort Props
export interface SortOption {
  label: string;
  value: string;
  direction: 'asc' | 'desc';
}

export interface SortState {
  activeSort: SortOption | null;
  availableSorts: SortOption[];
  onSortChange: (sort: SortOption) => void;
}

// Action Sheet Props
export interface ActionSheetOption {
  label: string;
  value: string;
  icon?: string;
  destructive?: boolean;
}

export interface ActionSheetProps {
  visible: boolean;
  options: ActionSheetOption[];
  onSelect: (option: ActionSheetOption) => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  cancelButtonLabel?: string;
}

// Toast/Notification Props
export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top' | 'bottom' | 'center';
  onDismiss?: () => void;
}

// Badge Props
export interface BadgeProps {
  count: number;
  max?: number;
  dot?: boolean;
  offset?: [number, number];
  status?: 'default' | 'primary' | 'success' | 'warning' | 'error';
}

// Card Props
export interface CardProps extends BaseComponentProps {
  onPress?: () => void;
  elevation?: number;
  borderRadius?: number;
  padding?: number;
}

// Avatar Props
export interface AvatarProps {
  source?: { uri: string } | number;
  size?: 'small' | 'medium' | 'large' | number;
  name?: string; // For initials fallback
  onPress?: () => void;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
}

// Progress Props
export interface ProgressProps {
  value: number;
  max?: number;
  color?: string;
  backgroundColor?: string;
  height?: number;
  animated?: boolean;
  showLabel?: boolean;
}

// Refresh Control Props
export interface RefreshProps {
  refreshing: boolean;
  onRefresh: () => void;
  tintColor?: string;
  title?: string;
  titleColor?: string;
}

// Keyboard Props
export interface KeyboardState {
  isVisible: boolean;
  height: number;
  duration: number;
  easing: 'keyboard' | 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}

// Theme Props
export interface ThemedProps {
  theme: 'light' | 'dark';
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
}

// Error Boundary Props
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

// Swipeable Props
export interface SwipeableProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftActions?: React.ReactNode;
  rightActions?: React.ReactNode;
  friction?: number;
  overshootLeft?: boolean;
  overshootRight?: boolean;
}

// Chart/Graph Props
export interface ChartDataPoint {
  x: number | string;
  y: number;
  label?: string;
}

export interface ChartProps {
  data: ChartDataPoint[];
  width: number;
  height: number;
  color?: string;
  strokeWidth?: number;
  showGrid?: boolean;
  showLabels?: boolean;
  animated?: boolean;
}

// Dropdown Props
export interface DropdownOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
  icon?: string;
}

export interface DropdownProps<T = string> {
  options: DropdownOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
  multiple?: boolean;
}

// Date Picker Props
export interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
}

// Segment Control Props
export interface SegmentOption {
  label: string;
  value: string;
  icon?: string;
}

export interface SegmentControlProps {
  options: SegmentOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

// Export commonly used type utilities
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ValueOf<T> = T[keyof T];
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
