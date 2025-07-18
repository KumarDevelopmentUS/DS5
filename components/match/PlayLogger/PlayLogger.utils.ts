// components/match/PlayLogger/PlayLogger.utils.ts
import { PlayType } from '../../../types/enums';
import {
  PLAY_TYPES,
  THROW_OUTCOMES,
  DEFENSE_OUTCOMES,
} from '../../../constants/game';
import {
  PlayLoggerState,
  PlayValidation,
  PlayTypeConfig,
} from './PlayLogger.types';

/**
 * Get categorized play types for UI display
 */
export const getPlayTypesByCategory = () => {
  return {
    goodThrows: [
      PlayType.TABLE,
      PlayType.LINE,
      PlayType.HIT,
      PlayType.KNICKER,
      PlayType.GOAL,
      PlayType.DINK,
      PlayType.SINK,
    ],
    badThrows: [PlayType.SHORT, PlayType.LONG, PlayType.SIDE, PlayType.HEIGHT],
    goodDefense: [PlayType.CATCH_PLUS_AURA, PlayType.CATCH],
    badDefense: [
      PlayType.DROP,
      PlayType.MISS,
      PlayType.TWO_HANDS,
      PlayType.BODY,
    ],
    fifa: [PlayType.GOOD_KICK, PlayType.BAD_KICK, PlayType.FIFA_SAVE],
    special: [PlayType.REDEMPTION, PlayType.SELF_SINK],
  };
};

/**
 * Get play type configuration from game constants
 */
export const getPlayTypeConfig = (
  playType: PlayType
): PlayTypeConfig | null => {
  const playConfig = PLAY_TYPES.find((p) => p.id === playType);
  if (!playConfig) return null;

  return {
    id: playConfig.id,
    name: playConfig.name,
    description: playConfig.description,
    points: playConfig.points,
    category: playConfig.category as any,
    outcome: playConfig.outcome as any,
    buildsStreak:
      'buildsStreak' in playConfig ? playConfig.buildsStreak : false,
    resetsStreak:
      'resetsStreak' in playConfig ? playConfig.resetsStreak : false,
    isBlunder: 'isBlunder' in playConfig ? playConfig.isBlunder : false,
    isSpecial: 'isSpecial' in playConfig ? playConfig.isSpecial : false,
  };
};

/**
 * Get display color for play type based on outcome
 */
export const getPlayTypeColor = (playType: PlayType, colors: any): string => {
  const config = getPlayTypeConfig(playType);
  if (!config) return colors.textSecondary;

  switch (config.outcome) {
    case 'good':
      return colors.success;
    case 'bad':
      return colors.error;
    default:
      return colors.primary;
  }
};

/**
 * Check if a throw type should trigger FIFA options
 */
export const shouldShowFifa = (throwType: PlayType | null): boolean => {
  if (!throwType) return false;

  const badThrows = [
    PlayType.SHORT,
    PlayType.LONG,
    PlayType.SIDE,
    PlayType.HEIGHT,
  ];
  return badThrows.includes(throwType);
};

/**
 * Check if defense was successful (negates points)
 */
export const isSuccessfulDefense = (defenseType: PlayType | null): boolean => {
  if (!defenseType) return false;
  return [PlayType.CATCH, PlayType.CATCH_PLUS_AURA].includes(defenseType);
};

/**
 * Calculate points for a play based on all conditions
 */
export const calculatePlayPoints = (
  throwType: PlayType,
  defenseType: PlayType | null,
  fifaData: { kickType: string } | null,
  settings: any
): number => {
  // FIFA Save special case
  if (
    fifaData &&
    shouldShowFifa(throwType) &&
    isSuccessfulDefense(defenseType)
  ) {
    return 1; // FIFA Save point to defending team
  }

  // If defense was successful, no points to throwing team
  if (isSuccessfulDefense(defenseType)) {
    return 0;
  }

  // Get base points from play type
  const config = getPlayTypeConfig(throwType);
  if (!config) return 0;

  // Handle sink points configuration
  if (throwType === PlayType.SINK) {
    return settings?.sinkPoints || 3;
  }

  return config.points;
};

/**
 * Validate current play logger state
 */
export const validatePlayState = (state: PlayLoggerState): PlayValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!state.selectedThrower) {
    errors.push('Please select a throwing player');
  }

  if (!state.selectedThrowType) {
    errors.push('Please select a throw result');
  }

  // Defense validation
  if (
    state.selectedThrowType &&
    state.selectedThrowType !== PlayType.SELF_SINK
  ) {
    if (!state.selectedDefender && !state.selectedDefenseType) {
      warnings.push('Consider selecting a defender or defense result');
    }
  }

  // FIFA validation
  if (state.showFifa) {
    if (!state.selectedFifaKicker) {
      errors.push('Please select a FIFA kicker');
    }
    if (!state.selectedFifaAction) {
      errors.push('Please select a FIFA action');
    }
  }

  // Redemption validation
  if (state.showRedemption) {
    if (state.redemptionSuccess === null) {
      errors.push('Please select redemption result');
    }
  }

  // Special validation for Self Sink
  if (state.selectedThrowType === PlayType.SELF_SINK) {
    if (state.selectedDefender || state.selectedDefenseType) {
      warnings.push('Defense not applicable for Self Sink');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Check if FIFA options should be available
 */
export const canShowFifa = (state: PlayLoggerState): boolean => {
  return shouldShowFifa(state.selectedThrowType);
};

/**
 * Check if redemption options should be available
 */
export const canShowRedemption = (state: PlayLoggerState): boolean => {
  // Redemption can be attempted on any throw
  return (
    !!state.selectedThrowType && state.selectedThrowType !== PlayType.SELF_SINK
  );
};

/**
 * Get next step in the play logging flow
 */
export const getNextStep = (
  state: PlayLoggerState
): PlayLoggerState['currentStep'] => {
  if (!state.selectedThrower) return 'thrower';
  if (!state.selectedThrowType) return 'throw_result';

  // Self sink goes straight to submit
  if (state.selectedThrowType === PlayType.SELF_SINK) return 'submit';

  if (!state.selectedDefender && !state.selectedDefenseType) return 'defender';
  if (state.selectedDefender && !state.selectedDefenseType)
    return 'defense_result';

  // Check special conditions
  if (
    state.showFifa &&
    (!state.selectedFifaKicker || !state.selectedFifaAction)
  ) {
    return 'fifa';
  }

  if (state.showRedemption && state.redemptionSuccess === null) {
    return 'redemption';
  }

  return 'submit';
};

/**
 * Reset state for new play
 */
export const resetPlayState = (): PlayLoggerState => {
  return {
    selectedThrower: null,
    selectedThrowType: null,
    selectedDefender: null,
    selectedDefenseType: null,
    showFifa: false,
    selectedFifaKicker: null,
    selectedFifaAction: null,
    showRedemption: false,
    redemptionSuccess: null,
    selectedRedemptionTarget: null,
    showSpecial: false,
    currentStep: 'thrower',
    canSubmit: false,
    errors: [],
  };
};

/**
 * Get team color for player buttons
 */
export const getTeamColor = (team: string, colors: any): string => {
  switch (team) {
    case 'team1':
      return colors.primary;
    case 'team2':
      return colors.secondary;
    default:
      return colors.textSecondary;
  }
};

/**
 * Format player display name
 */
export const formatPlayerName = (
  username: string,
  nickname?: string
): string => {
  if (nickname && nickname.trim()) {
    return nickname.trim();
  }
  return username;
};

/**
 * Get play type display info for buttons
 */
export const getPlayTypeDisplayInfo = (playType: PlayType, colors: any) => {
  const config = getPlayTypeConfig(playType);
  if (!config) return null;

  return {
    name: config.name,
    points: config.points,
    color: getPlayTypeColor(playType, colors),
    isSpecial: config.isSpecial,
    description: config.description,
  };
};
