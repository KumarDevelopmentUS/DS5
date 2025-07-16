import { ViewStyle } from 'react-native';
import { ReactNode } from 'react';

/**
 * Represents a single achievement that a user can earn.
 */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: ReactNode; // Can be an icon name (string) or a full component
  unlocked: boolean;
  unlockedAt?: Date;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

/**
 * Props for the individual AchievementItem component.
 */
export interface AchievementItemProps {
  achievement: Achievement;
  onPress?: (achievement: Achievement) => void;
  size?: number;
}

/**
 * Props for the main AchievementGrid component.
 */
export interface AchievementGridProps {
  achievements: Achievement[];
  onAchievementPress?: (achievement: Achievement) => void;
  columns?: number;
  style?: ViewStyle;
  testID?: string;
  // Optional title for the grid section
  title?: string;
}
