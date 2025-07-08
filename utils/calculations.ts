// utils/calculations.ts

import { PlayerMatchStats, Player } from '../types/models';
import { STATS_CONFIG, SCORING } from '../constants/game';

// ============================================
// WIN RATE CALCULATIONS
// ============================================

/**
 * Calculates win rate as a percentage
 * @param wins - Number of wins
 * @param total - Total number of games played
 * @returns Win rate as a decimal (0.0 to 1.0)
 */
export const calculateWinRate = (wins: number, total: number): number => {
  if (total === 0) return 0;
  if (wins < 0 || total < 0) return 0;
  if (wins > total) return 1; // Cap at 100%

  return Number((wins / total).toFixed(4)); // Return as decimal with 4 decimal precision
};

/**
 * Calculates win rate as a percentage string
 * @param wins - Number of wins
 * @param total - Total number of games played
 * @returns Win rate as a percentage string (e.g., "75.0%")
 */
export const calculateWinRatePercentage = (
  wins: number,
  total: number
): string => {
  const rate = calculateWinRate(wins, total);
  return `${(rate * 100).toFixed(1)}%`;
};

// ============================================
// MVP CALCULATIONS
// ============================================

/**
 * MVP calculation weights based on Die Stats scoring system
 */
const MVP_WEIGHTS = {
  // Offensive contributions
  score: 1.0, // Raw points scored
  hits: 0.5, // Basic scoring throws
  goals: 2.0, // Power shots (2 points)
  dinks: 2.0, // Finesse shots (2 points)
  sinks: 4.0, // Premium shots (3-5 points)
  knickers: 0.8, // Skill shots (1 point but technique)

  // Streak bonuses
  longestStreak: 0.5, // Consistency bonus
  onFireCount: 1.5, // Hot streak achievements

  // Defensive contributions
  catches: 1, // Defensive saves
  catchRate: 2.0, // Defensive efficiency (if > 50%)

  // FIFA and special plays
  fifaSuccess: 1.5, // FIFA save success

  // Penalties for poor play
  blunderPenalty: -0.5, // Negative impact for drops/misses
  throwEfficiency: 1.0, // Reward for good throw accuracy
} as const;

/**
 * Calculates MVP score for a player based on their match statistics
 * @param stats - Player's match statistics
 * @returns MVP score (higher is better)
 */
export const calculateMVPScore = (stats: PlayerMatchStats): number => {
  // Base offensive score
  let mvpScore = stats.score * MVP_WEIGHTS.score;

  // Add weighted contributions
  mvpScore += stats.hits * MVP_WEIGHTS.hits;
  mvpScore += stats.goals * MVP_WEIGHTS.goals;
  mvpScore += stats.dinks * MVP_WEIGHTS.dinks;
  mvpScore += stats.sinks * MVP_WEIGHTS.sinks;
  mvpScore += stats.knickers * MVP_WEIGHTS.knickers;

  // Streak bonuses
  mvpScore += stats.longestStreak * MVP_WEIGHTS.longestStreak;
  mvpScore += stats.onFireCount * MVP_WEIGHTS.onFireCount;

  // Defensive contributions
  mvpScore += stats.catches * MVP_WEIGHTS.catches;

  // Catch rate bonus (only if above 50% and has attempts)
  if (stats.catchAttempts > 0) {
    const catchRate = stats.catches / stats.catchAttempts;
    if (catchRate > 0.5) {
      mvpScore += catchRate * MVP_WEIGHTS.catchRate;
    }
  }

  // FIFA success bonus
  if (stats.fifaAttempts > 0) {
    const fifaRate = stats.fifaSuccess / stats.fifaAttempts;
    mvpScore += fifaRate * MVP_WEIGHTS.fifaSuccess;
  }

  // Throw efficiency bonus
  if (stats.throws > 0) {
    const throwEfficiency = stats.hits / stats.throws;
    mvpScore += throwEfficiency * MVP_WEIGHTS.throwEfficiency;
  }

  // Blunder penalty
  mvpScore += stats.blunders * MVP_WEIGHTS.blunderPenalty;

  return Math.max(0, Number(mvpScore.toFixed(2))); // Ensure non-negative
};

/**
 * Determines the MVP from a list of players and their match stats
 * @param players - Array of players with their match statistics
 * @returns The player with the highest MVP score, or null if no players
 */
export const calculateMVP = (
  players: (Player & { stats: PlayerMatchStats })[]
): Player | null => {
  if (!players || players.length === 0) return null;

  // Filter out players with insufficient activity
  const activePlayers = players.filter(
    (player) => player.stats && player.stats.throws >= 3 // Minimum 3 throws to be considered
  );

  if (activePlayers.length === 0) return null;

  // Calculate MVP scores for all active players
  const playersWithMVPScores = activePlayers.map((player) => ({
    player,
    mvpScore: calculateMVPScore(player.stats),
  }));

  // Find the player with the highest MVP score
  const mvpCandidate = playersWithMVPScores.reduce((best, current) =>
    current.mvpScore > best.mvpScore ? current : best
  );

  return mvpCandidate.player;
};

// ============================================
// ELO RATING CALCULATIONS
// ============================================

/**
 * Calculates expected score for Elo rating system
 * @param playerRating - Current player rating
 * @param opponentRating - Opponent's current rating
 * @returns Expected score (0.0 to 1.0)
 */
const calculateExpectedScore = (
  playerRating: number,
  opponentRating: number
): number => {
  const exponent = (opponentRating - playerRating) / 400;
  return 1 / (1 + Math.pow(10, exponent));
};

/**
 * Calculates new Elo rating after a match
 * @param currentRating - Player's current Elo rating
 * @param opponentRating - Opponent's Elo rating
 * @param actualScore - Actual match result (1 = win, 0.5 = tie, 0 = loss)
 * @param kFactor - K-factor for rating change magnitude (optional, uses default from config)
 * @returns New Elo rating
 */
export const calculateNewEloRating = (
  currentRating: number,
  opponentRating: number,
  actualScore: number,
  kFactor: number = STATS_CONFIG.K_FACTOR
): number => {
  // Validate inputs
  if (currentRating < 0 || opponentRating < 0) {
    throw new Error('Ratings cannot be negative');
  }

  if (actualScore < 0 || actualScore > 1) {
    throw new Error('Actual score must be between 0 and 1');
  }

  const expectedScore = calculateExpectedScore(currentRating, opponentRating);
  const ratingChange = kFactor * (actualScore - expectedScore);
  const newRating = currentRating + ratingChange;

  // Ensure rating stays within bounds
  const minRating = STATS_CONFIG.RATING_RANGE.min;
  const maxRating = STATS_CONFIG.RATING_RANGE.max;

  return Math.max(minRating, Math.min(maxRating, Math.round(newRating)));
};

/**
 * Calculates Elo rating changes for both players after a match
 * @param winnerRating - Winner's current Elo rating
 * @param loserRating - Loser's current Elo rating
 * @param isTie - Whether the match was a tie (optional, defaults to false)
 * @returns Object with new ratings for both players
 */
export const calculateElo = (
  winnerRating: number,
  loserRating: number,
  isTie: boolean = false
): {
  winnerNewRating: number;
  loserNewRating: number;
  winnerChange: number;
  loserChange: number;
} => {
  const actualScore = isTie ? 0.5 : 1;

  const winnerNewRating = calculateNewEloRating(
    winnerRating,
    loserRating,
    actualScore
  );
  const loserNewRating = calculateNewEloRating(
    loserRating,
    winnerRating,
    1 - actualScore
  );

  const winnerChange = winnerNewRating - winnerRating;
  const loserChange = loserNewRating - loserRating;

  return {
    winnerNewRating,
    loserNewRating,
    winnerChange,
    loserChange,
  };
};

// ============================================
// ADDITIONAL STATISTICAL CALCULATIONS
// ============================================

/**
 * Calculates hit rate (accuracy) percentage
 * @param hits - Number of successful hits
 * @param attempts - Total throw attempts
 * @returns Hit rate as decimal (0.0 to 1.0)
 */
export const calculateHitRate = (hits: number, attempts: number): number => {
  return calculateWinRate(hits, attempts); // Same calculation logic
};

/**
 * Calculates catch rate (defensive efficiency) percentage
 * @param catches - Number of successful catches
 * @param attempts - Total catch attempts
 * @returns Catch rate as decimal (0.0 to 1.0)
 */
export const calculateCatchRate = (
  catches: number,
  attempts: number
): number => {
  return calculateWinRate(catches, attempts); // Same calculation logic
};

/**
 * Calculates average score per game
 * @param totalScore - Total points scored across all games
 * @param gamesPlayed - Number of games played
 * @returns Average score per game
 */
export const calculateAverageScore = (
  totalScore: number,
  gamesPlayed: number
): number => {
  if (gamesPlayed === 0) return 0;
  return Number((totalScore / gamesPlayed).toFixed(2));
};

/**
 * Calculates points per throw efficiency
 * @param totalScore - Total points scored
 * @param totalThrows - Total throws attempted
 * @returns Points per throw ratio
 */
export const calculateEfficiency = (
  totalScore: number,
  totalThrows: number
): number => {
  if (totalThrows === 0) return 0;
  return Number((totalScore / totalThrows).toFixed(3));
};

/**
 * Determines if a player is on a hot streak (3+ consecutive scoring throws)
 * @param currentStreak - Current consecutive hit streak
 * @returns Whether player is "on fire"
 */
export const isOnFire = (currentStreak: number): boolean => {
  return currentStreak >= 3; // Based on ON_FIRE_STREAK.ACTIVATION_THRESHOLD from game constants
};

/**
 * Calculates comeback status (winning after being significantly behind)
 * @param currentScore - Current team score
 * @param opponentScore - Opponent team score
 * @param maxDeficit - Maximum deficit the team was behind
 * @returns Whether this qualifies as a comeback
 */
export const isComeback = (
  currentScore: number,
  opponentScore: number,
  maxDeficit: number
): boolean => {
  const COMEBACK_THRESHOLD = 5; // From MATCH_RULES.COMEBACK_THRESHOLD
  return currentScore > opponentScore && maxDeficit >= COMEBACK_THRESHOLD;
};

/**
 * Calculates performance rating based on multiple stats
 * @param stats - Player match statistics
 * @returns Performance rating (0-100 scale)
 */
export const calculatePerformanceRating = (stats: PlayerMatchStats): number => {
  if (stats.throws === 0) return 0;

  // Base accuracy score
  const accuracy = (stats.hits / stats.throws) * 40; // 40 points max

  // Scoring efficiency
  const efficiency = (stats.score / stats.throws) * 30; // 30 points max

  // Defensive contribution
  const defense =
    stats.catchAttempts > 0
      ? (stats.catches / stats.catchAttempts) * 20 // 20 points max
      : 10; // Default if no defensive opportunities

  // Streak bonus
  const streakBonus = Math.min(stats.onFireCount * 2, 10); // 10 points max

  const totalRating = accuracy + efficiency + defense + streakBonus;

  return Math.min(100, Math.max(0, Math.round(totalRating)));
};
