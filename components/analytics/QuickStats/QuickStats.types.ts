// components/analytics/QuickStats/QuickStats.types.ts
import { ViewStyle } from 'react-native';

export interface QuickStatItemData {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'default' | 'success' | 'warning' | 'error' | 'info';
  trend?: {
    direction: 'up' | 'down' | 'stable';
    value?: string;
    isPositive?: boolean;
  };
}

export interface QuickStatsProps {
  // Data source
  userId?: string; // If not provided, uses current user

  // Appearance
  variant?: 'compact' | 'detailed' | 'minimal';
  layout?: 'grid' | 'row' | 'column';

  // Customization
  maxStats?: number; // Maximum number of stats to show
  showTrends?: boolean;
  showAchievements?: boolean;

  // Layout
  style?: ViewStyle | ViewStyle[];

  // Interaction
  onStatPress?: (statKey: string, value: any) => void;
  onRefresh?: () => void;

  // Accessibility
  testID?: string;
}

export interface StatItemProps {
  data: QuickStatItemData;
  variant: 'compact' | 'detailed' | 'minimal';
  onPress?: () => void;
  testID?: string;
}

// Predefined stat configurations for different contexts
export interface StatConfig {
  key: string;
  label: string;
  getValue: (stats: any) => string | number;
  getSubtitle?: (stats: any) => string;
  color?:
    | 'default'
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | ((stats: any) => 'default' | 'success' | 'warning' | 'error' | 'info');
  priority: number; // For sorting when maxStats is used
}
