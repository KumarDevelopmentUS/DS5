// constants/game.ts

import { PlayType } from '../types/enums';

// Default match configuration settings based on official rulebook
export const MATCH_SETTINGS = {
  DEFAULT_SCORE_LIMIT: 11, // Official default from rulebook
  SCORE_LIMIT_OPTIONS: [7, 11, 15, 21] as const,
  DEFAULT_SINK_POINTS: 3, // Can be 3 or 5 points
  SINK_POINTS_OPTIONS: [3, 5] as const,
  DEFAULT_WIN_BY_TWO: true, // Default ON from rulebook
  TOTAL_PLAYERS: 4, // Always 2 teams of 2 players
  PLAYERS_PER_TEAM: 2,
  TOTAL_TEAMS: 2,
  DEFAULT_VISIBILITY: 'public' as const,
  TRACK_ADVANCED_STATS: true,
  ENABLE_SPECTATORS: true,
} as const;

// All possible play types that can be logged during a match (using PlayType enum values)
export const PLAY_TYPES = [
  // Good Throw Options
  {
    id: PlayType.TABLE,
    name: 'Table',
    description: 'Die lands on table, valid non-scoring throw',
    points: 0,
    category: 'throw',
    outcome: 'good',
    buildsStreak: true,
  },
  {
    id: PlayType.LINE,
    name: 'Line',
    description: 'Hits designated line precisely',
    points: 0,
    category: 'throw',
    outcome: 'good',
    resetsStreak: true,
  },
  {
    id: PlayType.HIT,
    name: 'Hit',
    description: "Successfully hits opponent's cup",
    points: 1,
    category: 'throw',
    outcome: 'good',
    buildsStreak: true,
  },
  {
    id: PlayType.KNICKER,
    name: 'Knicker',
    description: 'Glancing shot off table/object into cup',
    points: 1,
    category: 'throw',
    outcome: 'good',
    buildsStreak: true,
    isSpecial: true,
  },
  {
    id: PlayType.GOAL,
    name: 'Goal',
    description: 'Direct, powerful hit',
    points: 2,
    category: 'throw',
    outcome: 'good',
    buildsStreak: true,
  },
  {
    id: PlayType.DINK,
    name: 'Dink',
    description: 'Soft, precise touch shot',
    points: 2,
    category: 'throw',
    outcome: 'good',
    buildsStreak: true,
    isSpecial: true,
  },
  {
    id: PlayType.SINK,
    name: 'Sink',
    description: "Die lands inside opponent's cup",
    points: 3, // Configurable to 5
    category: 'throw',
    outcome: 'good',
    buildsStreak: true,
    isSpecial: true,
  },
  // Bad Throw Options
  {
    id: PlayType.SHORT,
    name: 'Short',
    description: 'Falls short of target',
    points: 0,
    category: 'throw',
    outcome: 'bad',
    resetsStreak: true,
    isBlunder: true,
  },
  {
    id: PlayType.LONG,
    name: 'Long',
    description: 'Overshoots target',
    points: 0,
    category: 'throw',
    outcome: 'bad',
    resetsStreak: true,
    isBlunder: true,
  },
  {
    id: PlayType.SIDE,
    name: 'Side',
    description: 'Misses horizontally',
    points: 0,
    category: 'throw',
    outcome: 'bad',
    resetsStreak: true,
    isBlunder: true,
  },
  {
    id: PlayType.HEIGHT,
    name: 'Height',
    description: 'Excessive vertical trajectory',
    points: 0,
    category: 'throw',
    outcome: 'bad',
    resetsStreak: true,
    isBlunder: true,
    countsAsBlunder: true,
  },
  // Defense Actions
  {
    id: PlayType.CATCH_PLUS_AURA,
    name: 'Catch + Aura',
    description: 'Clean catch with exceptional skill/timing',
    points: 0,
    category: 'defense',
    outcome: 'good',
    negatesOpponentPoints: true,
    statsImpact: ['catches', 'aura'],
  },
  {
    id: PlayType.CATCH,
    name: 'Catch',
    description: 'Standard successful catch',
    points: 0,
    category: 'defense',
    outcome: 'good',
    negatesOpponentPoints: true,
    statsImpact: ['catches'],
  },
  {
    id: PlayType.DROP,
    name: 'Drop',
    description: 'Attempted catch but failed to secure',
    points: 0,
    category: 'defense',
    outcome: 'bad',
    isBlunder: true,
  },
  {
    id: PlayType.MISS,
    name: 'Miss',
    description: 'Complete miss on catch attempt',
    points: 0,
    category: 'defense',
    outcome: 'bad',
    isBlunder: true,
  },
  {
    id: PlayType.TWO_HANDS,
    name: '2hands',
    description: 'Used two hands (improper technique)',
    points: 0,
    category: 'defense',
    outcome: 'bad',
    isBlunder: true,
  },
  {
    id: PlayType.BODY,
    name: 'Body',
    description: 'Used body instead of hands',
    points: 0,
    category: 'defense',
    outcome: 'bad',
    isBlunder: true,
  },
  // FIFA Actions
  {
    id: PlayType.GOOD_KICK,
    name: 'Good Kick',
    description: 'Successful/intended kick execution',
    points: 0, // Variable based on game state
    category: 'fifa',
    outcome: 'good',
  },
  {
    id: PlayType.BAD_KICK,
    name: 'Bad Kick',
    description: 'Unsuccessful/unintended kick execution',
    points: 0, // Variable based on game state
    category: 'fifa',
    outcome: 'bad',
  },
  {
    id: PlayType.FIFA_SAVE,
    name: 'FIFA Save',
    description: 'Defensive FIFA save for 1 point',
    points: 1,
    category: 'fifa',
    outcome: 'good',
    specialConditions: true,
  },
  // Special Actions
  {
    id: PlayType.REDEMPTION,
    name: 'Redemption',
    description: 'Redemption attempt (success/failure determined by outcome)',
    points: 0, // Negates current throw AND removes 1 point from opponent if successful
    category: 'special',
    outcome: 'variable',
    specialEffect: 'negates_and_removes_opponent_point_if_successful',
  },
  {
    id: PlayType.SELF_SINK,
    name: 'Self Sink',
    description: 'Die lands in own cup',
    points: 0,
    category: 'special',
    outcome: 'bad',
    specialEffect: 'immediate_loss',
  },
] as const;

// Throw outcomes organized by category (derived from PLAY_TYPES for convenience)
export const THROW_OUTCOMES = {
  GOOD: {
    TABLE: PLAY_TYPES.find((p) => p.id === PlayType.TABLE)!,
    LINE: PLAY_TYPES.find((p) => p.id === PlayType.LINE)!,
    HIT: PLAY_TYPES.find((p) => p.id === PlayType.HIT)!,
    KNICKER: PLAY_TYPES.find((p) => p.id === PlayType.KNICKER)!,
    GOAL: PLAY_TYPES.find((p) => p.id === PlayType.GOAL)!,
    DINK: PLAY_TYPES.find((p) => p.id === PlayType.DINK)!,
    SINK: PLAY_TYPES.find((p) => p.id === PlayType.SINK)!,
  },
  BAD: {
    SHORT: PLAY_TYPES.find((p) => p.id === PlayType.SHORT)!,
    LONG: PLAY_TYPES.find((p) => p.id === PlayType.LONG)!,
    SIDE: PLAY_TYPES.find((p) => p.id === PlayType.SIDE)!,
    HEIGHT: PLAY_TYPES.find((p) => p.id === PlayType.HEIGHT)!,
  },
} as const;

// Defense outcomes from the official rulebook (using PlayType enum values)
export const DEFENSE_OUTCOMES = {
  // Successful Defenses
  CATCH_PLUS_AURA: {
    id: PlayType.CATCH_PLUS_AURA,
    name: 'Catch + Aura',
    description: 'Clean catch with exceptional skill/timing',
    negatesPoints: true,
    statsImpact: ['catches', 'aura'], // Increments catches +1 and aura +1
  },
  CATCH: {
    id: PlayType.CATCH,
    name: 'Catch',
    description: 'Standard successful catch',
    negatesPoints: true,
    statsImpact: ['catches'],
  },
  // Failed Defenses
  DROP: {
    id: PlayType.DROP,
    name: 'Drop',
    description: 'Attempted catch but failed to secure',
    negatesPoints: false,
    isBlunder: true,
  },
  MISS: {
    id: PlayType.MISS,
    name: 'Miss',
    description: 'Complete miss on catch attempt',
    negatesPoints: false,
    isBlunder: true,
  },
  TWO_HANDS: {
    id: PlayType.TWO_HANDS,
    name: '2hands',
    description: 'Used two hands (improper technique)',
    negatesPoints: false,
    isBlunder: true,
  },
  BODY: {
    id: PlayType.BODY,
    name: 'Body',
    description: 'Used body instead of hands',
    negatesPoints: false,
    isBlunder: true,
  },
  NA: {
    id: 'na',
    name: 'N/A',
    description: 'No defensive action taken',
    negatesPoints: false,
    isBlunder: false,
  },
} as const;

// FIFA (Football Integrated Field Action) mechanics (using PlayType enum values)
export const FIFA_MECHANICS = {
  ACTIONS: {
    GOOD_KICK: {
      id: PlayType.GOOD_KICK,
      name: 'Good Kick',
      description: 'Successful/intended kick execution',
    },
    BAD_KICK: {
      id: PlayType.BAD_KICK,
      name: 'Bad Kick',
      description: 'Unsuccessful/unintended kick execution',
    },
  },
  SAVE_CONDITIONS: {
    // All must be true for FIFA Save point
    BAD_THROW: true, // Throw was Short/Long/Side/Height
    FIFA_ACTION: true, // Good or Bad Kick performed
    SUCCESSFUL_DEFENSE: true, // Catch/Catch + Aura
    DEFENDER_SELECTED: true, // Not N/A
  },
  SAVE_POINTS: 1, // Points awarded to defending team
  OVERTIME_RULES: {
    // Points only awarded if kicker's team is tied or trailing
    ONLY_IF_TIED_OR_TRAILING: true,
  },
  MATCH_POINT_RULES: {
    // When defender's team is at gameScoreLimit - 1
    GOOD_KICK_PENALTY: -1, // Point penalty to opponent
  },
} as const;

// Special game mechanics
export const SPECIAL_MECHANICS = {
  REDEMPTION: {
    SUCCESS_EFFECT: {
      negatesCurrentThrow: true,
      removesOpponentPoint: 1,
    },
    FAILED_EFFECT: {
      noEffect: true,
    },
  },
  SELF_SINK: {
    MESSAGE: 'Uh Oh! {player} lost the match. {team} must run a naked lap!!!',
    EFFECT: 'IMMEDIATE_LOSS',
  },
  ON_FIRE_STREAK: {
    ACTIVATION_THRESHOLD: 3, // 3+ consecutive hits
    INDICATOR: 'assets/images/icons/achievements/streak.png', // Fire streak icon
    QUALIFYING_THROWS: [
      PlayType.HIT,
      PlayType.KNICKER,
      PlayType.GOAL,
      PlayType.DINK,
      PlayType.SINK,
    ],
    RESET_CONDITIONS: ['Any non-hit outcome'],
    AWARD_IMPACT: 'incineroar', // Key metric for "Incineroar" award
  },
} as const;

// Match rules and timeouts
export const MATCH_RULES = {
  GRACE_PERIOD: 5, // minutes to wait for players after match start
  IDLE_TIMEOUT: 15, // minutes of inactivity before pausing
  MAX_MATCH_DURATION: 120, // minutes before auto-ending
  MIN_PLAYS_FOR_STATS: 5, // minimum plays required for meaningful statistics
  COMEBACK_THRESHOLD: 5, // point difference considered a comeback
  WIN_CONDITIONS: {
    REACH_SCORE_LIMIT: true,
    WIN_BY_TWO_IF_ENABLED: true,
    MAINTAIN_TWO_POINT_LEAD: true,
  },
} as const;

// Scoring system configurations
export const SCORING = {
  WIN_POINTS: 100,
  PARTICIPATION_POINTS: 10,
  MVP_BONUS: 50,
  STREAK_MULTIPLIER: 1.1,
  COMEBACK_BONUS: 25,
  PERFECT_GAME_BONUS: 100,
  FIFA_SAVE_POINTS: 1,
} as const;

// Achievement definitions based on Die Stats mechanics
export const ACHIEVEMENTS = [
  // Milestone Achievements (Bronze tier, single unlock)
  {
    id: 'first_win',
    name: 'First Victory',
    description: 'Win your first match!',
    icon: 'trophy',
    category: 'milestone',
    criteria: { wins: 1 },
    points: 50,
    rarity: 'common',
    tier: 'Bronze',
  },

  // Tiered Achievements (Bronze, Silver, Gold, Diamond, Master)
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Total matches played',
    icon: 'medal',
    category: 'dedication',
    criteria: {
      tiers: [5, 10, 20, 40, 80], // Bronze, Silver, Gold, Diamond, Master
      statName: 'totalMatches',
    },
    points: [50, 100, 200, 400, 800],
    rarity: 'progressive',
  },
  {
    id: 'true_champion',
    name: 'True Champion',
    description: 'Total wins achieved',
    icon: 'trophy',
    category: 'skill',
    criteria: {
      tiers: [5, 10, 20, 40, 80],
      statName: 'totalWins',
    },
    points: [75, 150, 300, 600, 1200],
    rarity: 'progressive',
  },
  {
    id: 'high_scorer',
    name: 'High Scorer',
    description: 'Total score accumulated',
    icon: 'calculator',
    category: 'skill',
    criteria: {
      tiers: [25, 50, 100, 200, 500],
      statName: 'totalScore',
    },
    points: [50, 100, 200, 400, 800],
    rarity: 'progressive',
  },
  {
    id: 'goal_machine_gary',
    name: 'Goal Machine Gary',
    description: 'Total goals scored',
    icon: 'target',
    category: 'skill',
    criteria: {
      tiers: [5, 10, 20, 40, 80],
      statName: 'totalGoals',
    },
    points: [60, 120, 240, 480, 960],
    rarity: 'progressive',
  },
  {
    id: 'wet_master',
    name: 'Wet Master',
    description: 'Total sinks achieved',
    icon: 'water',
    category: 'skill',
    criteria: {
      tiers: [5, 10, 20, 40, 80],
      statName: 'totalSinks',
    },
    points: [100, 200, 400, 800, 1600],
    rarity: 'progressive',
  },
  {
    id: 'hot_streak',
    name: 'Hot Streak',
    description: 'Times on fire achieved',
    icon: 'fire',
    category: 'streak',
    criteria: {
      tiers: [5, 10, 20, 40, 80],
      statName: 'totalOnFireCount',
    },
    points: [75, 150, 300, 600, 1200],
    rarity: 'progressive',
  },

  // Rate-based Achievements (percentage thresholds)
  {
    id: 'sharpshooter',
    name: 'Sharpshooter',
    description: 'Achieve a high hit rate',
    icon: 'bullseye',
    category: 'skill',
    criteria: {
      type: 'rate',
      tiers: [50.1, 60.1, 78.1, 86.1, 93.1], // Bronze, Silver, Gold, Diamond, Master
      statName: 'hitRate',
      minAttempts: 10,
    },
    points: [100, 200, 400, 800, 1600],
    rarity: 'progressive',
  },
  {
    id: 'goalkeeper',
    name: 'Goalkeeper',
    description: 'Achieve a high catch rate',
    icon: 'shield',
    category: 'defense',
    criteria: {
      type: 'rate',
      tiers: [50.1, 60.1, 78.1, 86.1, 93.1],
      statName: 'catchRate',
      minAttempts: 10,
    },
    points: [100, 200, 400, 800, 1600],
    rarity: 'progressive',
  },
  {
    id: 'fifa_pro',
    name: 'FIFA Pro',
    description: 'Achieve a high FIFA success rate',
    icon: 'soccer',
    category: 'special',
    criteria: {
      type: 'rate',
      tiers: [50.1, 60.1, 78.1, 86.1, 93.1],
      statName: 'fifaRate',
      minAttempts: 5,
    },
    points: [125, 250, 500, 1000, 2000],
    rarity: 'progressive',
  },

  // Streak Achievements (single threshold)
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Win 7 matches in a row',
    icon: 'trending-up',
    category: 'streak',
    criteria: {
      type: 'streak',
      threshold: 7,
      statName: 'longestWinStreak',
    },
    points: 300,
    rarity: 'rare',
    tier: 'Bronze',
  },

  // Granular Stat Achievements
  {
    id: 'table_die_danny',
    name: 'Table Die Danny',
    description: 'Total table dies',
    icon: 'cube',
    category: 'technique',
    criteria: {
      tiers: [5, 10, 20, 40, 80],
      statName: 'totalTableDie',
    },
    points: [25, 50, 100, 200, 400],
    rarity: 'progressive',
  },
  {
    id: 'line_larry',
    name: 'Line Larry',
    description: 'Total line shots',
    icon: 'line',
    category: 'technique',
    criteria: {
      tiers: [5, 10, 20, 40, 80],
      statName: 'totalLine',
    },
    points: [25, 50, 100, 200, 400],
    rarity: 'progressive',
  },
  {
    id: 'knicker_knight',
    name: 'Knicker Knight',
    description: 'Total knickers',
    icon: 'bandage',
    category: 'technique',
    criteria: {
      tiers: [5, 10, 20, 40, 80],
      statName: 'totalKnicker',
    },
    points: [40, 80, 160, 320, 640],
    rarity: 'progressive',
  },
  {
    id: 'dink_dynamo',
    name: 'Dink Dynamo',
    description: 'Total dinks',
    icon: 'pulse',
    category: 'technique',
    criteria: {
      tiers: [5, 10, 20, 40, 80],
      statName: 'totalDink',
    },
    points: [60, 120, 240, 480, 960],
    rarity: 'progressive',
  },
  {
    id: 'aura_catcher',
    name: 'Aura Catcher',
    description: 'Total catches with aura',
    icon: 'sparkles',
    category: 'defense',
    criteria: {
      tiers: [5, 10, 20, 40, 80],
      statName: 'totalAura',
    },
    points: [75, 150, 300, 600, 1200],
    rarity: 'progressive',
  },

  // "Shame" Achievements (negative stats)
  {
    id: 'butterfingers',
    name: 'Butterfingers',
    description: 'Total drops',
    icon: 'frown',
    category: 'shame',
    criteria: {
      tiers: [5, 10, 20, 40, 80],
      statName: 'totalDrop',
    },
    points: [10, 20, 40, 80, 160], // Lower points for negative achievements
    rarity: 'progressive',
  },
  {
    id: 'miss_maestro',
    name: 'Miss Maestro',
    description: 'Total missed catches',
    icon: 'x-circle',
    category: 'shame',
    criteria: {
      tiers: [5, 10, 20, 40, 80],
      statName: 'totalMiss',
    },
    points: [10, 20, 40, 80, 160],
    rarity: 'progressive',
  },
  {
    id: 'two_hand_harold',
    name: 'Two Hand Harold',
    description: 'Total two-hand catches (improper technique)',
    icon: 'hand',
    category: 'shame',
    criteria: {
      tiers: [5, 10, 20, 40, 80],
      statName: 'totalTwoHands',
    },
    points: [10, 20, 40, 80, 160],
    rarity: 'progressive',
  },

  // Special/Unique Achievements
  {
    id: 'marathon_player',
    name: 'Marathon Player',
    description: 'Total play time in minutes',
    icon: 'clock',
    category: 'dedication',
    criteria: {
      tiers: [60, 180, 360, 720, 1800], // 1h, 3h, 6h, 12h, 30h in minutes
      statName: 'totalPlayTimeMinutes',
    },
    points: [50, 100, 200, 400, 1000],
    rarity: 'progressive',
  },
  {
    id: 'comeback_king',
    name: 'Comeback King',
    description: 'Win after being 5+ points behind',
    icon: 'comeback',
    category: 'clutch',
    criteria: { comebacks: 1 },
    points: 250,
    rarity: 'epic',
    tier: 'Bronze',
  },
  {
    id: 'perfect_defense',
    name: 'Perfect Defense',
    description: 'Win a match without allowing any scores',
    icon: 'diamond',
    category: 'defense',
    criteria: { perfectDefense: 1 },
    points: 400,
    rarity: 'legendary',
    tier: 'Bronze',
  },
  {
    id: 'redemption_master',
    name: 'Redemption Master',
    description: 'Successfully redeem 10 times',
    icon: 'refresh',
    category: 'special',
    criteria: { redemptions: 10 },
    points: 175,
    rarity: 'rare',
    tier: 'Bronze',
  },
] as const;

// Achievement categories for organization
export const ACHIEVEMENT_CATEGORIES = {
  MILESTONE: 'milestone',
  SKILL: 'skill',
  STREAK: 'streak',
  DEFENSE: 'defense',
  SPECIAL: 'special',
  CLUTCH: 'clutch',
  DEDICATION: 'dedication',
  TECHNIQUE: 'technique',
  SHAME: 'shame', // For negative stat achievements
  COMPETITIVE: 'competitive',
  COMMUNITY: 'community',
} as const;

// Achievement rarity levels
export const ACHIEVEMENT_RARITY = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
  PROGRESSIVE: 'progressive', // For tiered achievements
} as const;

// Achievement tiers for progressive achievements
export const ACHIEVEMENT_TIERS = {
  BRONZE: 'Bronze',
  SILVER: 'Silver',
  GOLD: 'Gold',
  DIAMOND: 'Diamond',
  MASTER: 'Master',
} as const;

// Statistical tracking configurations
export const STATS_CONFIG = {
  RATING_SYSTEM: 'elo',
  DEFAULT_RATING: 1000,
  RATING_RANGE: { min: 0, max: 3000 },
  K_FACTOR: 32,
  PERCENTILE_BUCKETS: [10, 25, 50, 75, 90, 95, 99],
  MIN_GAMES_FOR_RANKING: 10,
  TRACKED_STATS: [
    'throws',
    'hits',
    'goals',
    'dinks',
    'sinks',
    'knickers',
    'catches',
    'aura',
    'drops',
    'misses',
    'blunders',
    'height',
    'onFireCount',
    'fifaSaves',
    'redemptions',
    'wins',
    'losses',
    'comebacks',
  ],
} as const;

// Quick reference for scoring (from rulebook)
export const QUICK_REFERENCE = {
  SCORING_THROWS: {
    HIT: 1,
    KNICKER: 1,
    GOAL: 2,
    DINK: 2,
    SINK: 3, // or 5 based on configuration
  },
  SPECIAL_ACTIONS: {
    FIFA_SAVE: 1, // to defender
    REDEMPTION_SUCCESS: -1, // to opponent
    GOOD_DEFENSE: 'negates throw points',
    ON_FIRE: '3+ consecutive hits',
  },
} as const;

// Export all constants as a single object for easy importing
export const GAME_CONSTANTS = {
  MATCH_SETTINGS,
  THROW_OUTCOMES,
  DEFENSE_OUTCOMES,
  FIFA_MECHANICS,
  SPECIAL_MECHANICS,
  MATCH_RULES,
  SCORING,
  ACHIEVEMENTS,
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_RARITY,
  STATS_CONFIG,
  QUICK_REFERENCE,
} as const;

// Type definitions for better TypeScript support
export type ThrowOutcome =
  | keyof typeof THROW_OUTCOMES.GOOD
  | keyof typeof THROW_OUTCOMES.BAD;
export type DefenseOutcome = keyof typeof DEFENSE_OUTCOMES;
export type AchievementId = (typeof ACHIEVEMENTS)[number]['id'];
export type AchievementCategory = (typeof ACHIEVEMENTS)[number]['category'];
export type AchievementRarity = (typeof ACHIEVEMENTS)[number]['rarity'];
export type ScoreLimit = (typeof MATCH_SETTINGS.SCORE_LIMIT_OPTIONS)[number];
export type SinkPoints = (typeof MATCH_SETTINGS.SINK_POINTS_OPTIONS)[number];
