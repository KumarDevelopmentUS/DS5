// components/match/PlayLogger/PlayLogger.types.ts
import { ViewStyle } from 'react-native';
import { PlayType } from '../../../types/enums';
import { Player } from '../../../types/models';

export interface PlayLoggerProps {
  // Core props
  matchId: string;
  participants: Player[];
  currentTeam: string;

  // State
  isSubmitting?: boolean;
  disabled?: boolean;

  // Callbacks
  onSubmitPlay: (data: PlaySubmissionData) => Promise<void>;
  onUndo?: () => Promise<void>;

  // Styling
  style?: ViewStyle | ViewStyle[];

  // Testing
  testID?: string;
}

export interface PlaySubmissionData {
  // Required fields
  playerId: string;
  eventType: PlayType;
  team: string;

  // Optional fields based on play type
  defenderIds?: string[];
  defenseType?: PlayType;
  fifa?: {
    kickerId?: string;
    kickType: 'good_kick' | 'bad_kick';
  };
  redemption?: {
    success: boolean;
    targetPlayerId?: string;
  };
}

export interface PlayLoggerState {
  // Current selections
  selectedThrower: string | null;
  selectedThrowType: PlayType | null;
  selectedDefender: string | null;
  selectedDefenseType: PlayType | null;

  // FIFA state
  showFifa: boolean;
  selectedFifaKicker: string | null;
  selectedFifaAction: 'good_kick' | 'bad_kick' | null;

  // Redemption state
  showRedemption: boolean;
  redemptionSuccess: boolean | null;
  selectedRedemptionTarget: string | null;

  // Special plays
  showSpecial: boolean;

  // UI state
  currentStep: PlayStep;
  canSubmit: boolean;
  errors: string[];
}

export type PlayStep =
  | 'thrower'
  | 'throw_result'
  | 'defender'
  | 'defense_result'
  | 'fifa'
  | 'redemption'
  | 'special'
  | 'submit';

export interface PlayTypeConfig {
  id: PlayType;
  name: string;
  description: string;
  points: number;
  category: 'throw' | 'defense' | 'fifa' | 'special';
  outcome: 'good' | 'bad' | 'variable';
  color?: string;
  icon?: string;
  buildsStreak?: boolean;
  resetsStreak?: boolean;
  isBlunder?: boolean;
  isSpecial?: boolean;
}

export interface StepConfig {
  title: string;
  required: boolean;
  skipConditions?: (state: PlayLoggerState) => boolean;
  validationRules?: (state: PlayLoggerState) => string[];
}

export interface PlayValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
