// components/core/ProgressIndicator/ProgressIndicator.types.ts
import { ViewStyle } from 'react-native';

export type ProgressVariant = 'dots' | 'steps' | 'bar';
export type ProgressSize = 'small' | 'medium' | 'large';

export interface Step {
  id: string;
  title?: string;
  description?: string;
  completed?: boolean;
}

export interface ProgressIndicatorProps {
  // Progress data
  currentStep: number; // 0-based index
  totalSteps: number;
  steps?: Step[]; // Optional step details for 'steps' variant

  // Appearance
  variant?: ProgressVariant;
  size?: ProgressSize;

  // Interaction
  allowNavigation?: boolean; // Allow clicking on completed steps
  onStepPress?: (stepIndex: number) => void;

  // Labels
  showLabels?: boolean;
  showProgress?: boolean; // Show "Step 2 of 5" text

  // Styling
  style?: ViewStyle | ViewStyle[];

  // Accessibility
  testID?: string;
}
