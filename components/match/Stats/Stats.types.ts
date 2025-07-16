import { ViewStyle, TextStyle } from 'react-native';
import { ReactNode } from 'react';

// Common stat item interface
export interface StatItem {
  label: string;
  value: number | string;
  unit?: string;
  icon?: ReactNode;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number | string;
  description?: string;
}

// Chart data point
export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
  color?: string;
}

// Comparison data
export interface ComparisonData {
  label: string;
  value1: number;
  value2: number;
  unit?: string;
  showDifference?: boolean;
  invertComparison?: boolean; // For stats where lower is better
}

// Component Props
export interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export interface StatChartProps {
  data: ChartDataPoint[];
  height?: number;
  showGrid?: boolean;
  showLabels?: boolean;
  color?: string;
  type?: 'line' | 'bar';
  style?: ViewStyle;
  testID?: string;
}

export interface ComparisonRowProps {
  data: ComparisonData;
  player1Name?: string;
  player2Name?: string;
  highlightBetter?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export interface StatsGridProps {
  stats: StatItem[];
  columns?: number;
  onStatPress?: (stat: StatItem) => void;
  style?: ViewStyle;
  testID?: string;
}

export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
  backgroundColor?: string;
  height?: number;
  animated?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export interface PercentageRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export interface TrendIndicatorProps {
  trend: 'up' | 'down' | 'neutral';
  value?: string | number;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export interface StatsListProps {
  title?: string;
  stats: StatItem[];
  onStatPress?: (stat: StatItem) => void;
  showTrends?: boolean;
  style?: ViewStyle;
  testID?: string;
}
