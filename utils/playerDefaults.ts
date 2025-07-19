// utils/playerDefaults.ts
import {
  TrackerPlayer,
  DefaultPlayer,
  EnhancedMatchSettings,
} from '../types/tracker';
import { Player } from '../types/models';
import { UserRole } from '../types/enums';
import { LivePlayerStats, LiveMatchData } from '../types/models';

/**
 * Creates default players for empty team slots
 * Ensures every match always has 4 players (2 per team)
 */

// Default player names that will be used if no custom names are provided
const DEFAULT_PLAYER_NAMES = {
  player1: 'Player 1',
  player2: 'Player 2',
  player3: 'Player 3',
  player4: 'Player 4',
};

// Default team names
const DEFAULT_TEAM_NAMES = {
  team1: 'Team 1',
  team2: 'Team 2',
};

/**
 * Creates a default player for a specific position
 */
export const createDefaultPlayer = (
  position: 1 | 2 | 3 | 4,
  customName?: string,
  matchId?: string
): TrackerPlayer => {
  const team = position <= 2 ? 'team1' : 'team2';
  const playerKey = `player${position}` as keyof typeof DEFAULT_PLAYER_NAMES;
  const defaultName = DEFAULT_PLAYER_NAMES[playerKey];

  return {
    userId: `default_${matchId || 'temp'}_${position}`,
    username: customName || defaultName,
    displayName: customName || defaultName,
    nickname: undefined,
    avatarUrl: undefined,
    team,
    position,
    role: UserRole.PLAYER,
    isActive: true,
    isRegistered: false,
    joinedAt: new Date(),
  };
};

/**
 * Ensures a team has exactly 2 players, filling empty slots with defaults
 */
export const ensureFullTeam = (
  existingPlayers: TrackerPlayer[],
  teamId: 'team1' | 'team2',
  matchSettings: EnhancedMatchSettings,
  matchId?: string
): TrackerPlayer[] => {
  const teamPlayers = existingPlayers.filter((p) => p.team === teamId);
  const fullTeam: TrackerPlayer[] = [...teamPlayers];

  // Determine positions for this team
  const positions = teamId === 'team1' ? ([1, 2] as const) : ([3, 4] as const);

  // Fill missing positions
  positions.forEach((position) => {
    const existingPlayerAtPosition = fullTeam.find(
      (p) => p.position === position
    );

    if (!existingPlayerAtPosition) {
      // Get custom name from match settings
      const playerKey =
        `player${position}` as keyof EnhancedMatchSettings['playerNames'];
      const customName = matchSettings.playerNames[playerKey];

      // Create default player
      const defaultPlayer = createDefaultPlayer(position, customName, matchId);
      fullTeam.push(defaultPlayer);
    }
  });

  // Sort by position to maintain consistent order
  return fullTeam.sort((a, b) => a.position - b.position);
};

/**
 * Ensures all 4 player positions are filled across both teams
 */
export const ensureAllPlayers = (
  existingPlayers: TrackerPlayer[],
  matchSettings: EnhancedMatchSettings,
  matchId?: string
): TrackerPlayer[] => {
  const team1Players = ensureFullTeam(
    existingPlayers,
    'team1',
    matchSettings,
    matchId
  );
  const team2Players = ensureFullTeam(
    existingPlayers,
    'team2',
    matchSettings,
    matchId
  );

  return [...team1Players, ...team2Players];
};

/**
 * Converts a regular Player to TrackerPlayer with position assignment
 */
export const convertToTrackerPlayer = (
  player: Player,
  position: 1 | 2 | 3 | 4,
  matchSettings?: EnhancedMatchSettings
): TrackerPlayer => {
  // Get custom display name from match settings if available
  let displayName = player.nickname || player.username;

  if (matchSettings) {
    const playerKey =
      `player${position}` as keyof EnhancedMatchSettings['playerNames'];
    const customName = matchSettings.playerNames[playerKey];
    if (customName && customName !== DEFAULT_PLAYER_NAMES[playerKey]) {
      displayName = customName;
    }
  }

  return {
    ...player,
    position,
    isRegistered: true,
    displayName,
    stats: undefined, // Clear the PlayerMatchStats, will be set separately as LivePlayerStats
  };
};

/**
 * Updates player display names based on match settings
 */
export const updatePlayerDisplayNames = (
  players: TrackerPlayer[],
  matchSettings: EnhancedMatchSettings
): TrackerPlayer[] => {
  return players.map((player) => {
    const playerKey =
      `player${player.position}` as keyof EnhancedMatchSettings['playerNames'];
    const customName = matchSettings.playerNames[playerKey];

    // Only update if there's a custom name and it's different from default
    if (customName && customName !== DEFAULT_PLAYER_NAMES[playerKey]) {
      return {
        ...player,
        displayName: customName,
      };
    }

    return player;
  });
};

/**
 * Gets team name from match settings or default
 */
export const getTeamDisplayName = (
  teamId: 'team1' | 'team2',
  matchSettings: EnhancedMatchSettings
): string => {
  const customName = matchSettings.teamNames[teamId];
  return customName || DEFAULT_TEAM_NAMES[teamId];
};

/**
 * Creates initial match settings with default names
 */
export const createDefaultMatchSettings = (
  overrides: Partial<EnhancedMatchSettings> = {}
): EnhancedMatchSettings => {
  return {
    scoreLimit: 11,
    winByTwo: true,
    sinkPoints: 3,
    teamNames: {
      team1: DEFAULT_TEAM_NAMES.team1,
      team2: DEFAULT_TEAM_NAMES.team2,
    },
    playerNames: {
      player1: DEFAULT_PLAYER_NAMES.player1,
      player2: DEFAULT_PLAYER_NAMES.player2,
      player3: DEFAULT_PLAYER_NAMES.player3,
      player4: DEFAULT_PLAYER_NAMES.player4,
    },
    trackAdvancedStats: true,
    enableSpectators: true,
    ...overrides,
  };
};

/**
 * Validates that all required players are present
 */
export const validatePlayerSetup = (
  players: TrackerPlayer[]
): {
  isValid: boolean;
  missingPositions: number[];
  errors: string[];
} => {
  const errors: string[] = [];
  const missingPositions: number[] = [];

  // Check for all 4 positions
  for (let position = 1; position <= 4; position++) {
    const player = players.find((p) => p.position === position);
    if (!player) {
      missingPositions.push(position);
      errors.push(`Missing player at position ${position}`);
    }
  }

  // Check team balance
  const team1Count = players.filter((p) => p.team === 'team1').length;
  const team2Count = players.filter((p) => p.team === 'team2').length;

  if (team1Count !== 2) {
    errors.push(`Team 1 has ${team1Count} players, expected 2`);
  }

  if (team2Count !== 2) {
    errors.push(`Team 2 has ${team2Count} players, expected 2`);
  }

  return {
    isValid: errors.length === 0,
    missingPositions,
    errors,
  };
};

/**
 * Gets player by position
 */
export const getPlayerByPosition = (
  players: TrackerPlayer[],
  position: 1 | 2 | 3 | 4
): TrackerPlayer | undefined => {
  return players.find((p) => p.position === position);
};

/**
 * Gets all players for a specific team
 */
export const getPlayersByTeam = (
  players: TrackerPlayer[],
  teamId: 'team1' | 'team2'
): TrackerPlayer[] => {
  return players
    .filter((p) => p.team === teamId)
    .sort((a, b) => a.position - b.position);
};

/**
 * Checks if a player is registered (real user) or default
 */
export const isRegisteredPlayer = (player: TrackerPlayer): boolean => {
  return player.isRegistered && !player.userId.startsWith('default_');
};

/**
 * Gets display name for a player, handling both registered and default players
 */
export const getPlayerDisplayName = (
  player: TrackerPlayer,
  useNickname: boolean = true
): string => {
  if (player.displayName) {
    return player.displayName;
  }

  if (useNickname && player.nickname) {
    return player.nickname;
  }

  return player.username;
};

/**
 * Creates participant data for database storage
 * This is used when storing default players in the database
 */
export const createParticipantForDefaultPlayer = (
  player: TrackerPlayer,
  matchId: string
): {
  match_id: string;
  user_id: string;
  team: string;
  role: string;
  is_active: boolean;
  joined_at: string;
} => {
  // Determine team based on position: positions 1-2 are team1, positions 3-4 are team2
  const defaultTeam = player.position <= 2 ? 'team1' : 'team2';
  
  return {
    match_id: matchId,
    user_id: player.userId,
    team: player.team || defaultTeam,
    role: player.role,
    is_active: player.isActive,
    joined_at: player.joinedAt.toISOString(),
  };
};

/**
 * Creates default live player stats for a position
 */
export const createDefaultLivePlayerStats = (
  position: string,
  playerName: string
): LivePlayerStats => {
  return {
    name: playerName,
    throws: 0,
    hits: 0,
    score: 0,
    tableDie: 0,
    line: 0,
    hit: 0,
    knicker: 0,
    goal: 0,
    dink: 0,
    sink: 0,
    short: 0,
    long: 0,
    side: 0,
    height: 0,
    catches: 0,
    catchPlusAura: 0,
    drop: 0,
    miss: 0,
    twoHands: 0,
    body: 0,
    fifaAttempts: 0,
    fifaSuccess: 0,
    goodKick: 0,
    badKick: 0,
    hitStreak: 0,
    currentlyOnFire: false,
    onFireCount: 0,
    blunders: 0,
    specialThrows: 0,
    lineThrows: 0,
    aura: 0,
  };
};

/**
 * Initializes live match data structure
 */
export const initializeLiveMatchData = (
  match: any,
  participants: any[]
): LiveMatchData => {
  // Create default player stats for all 4 positions
  const livePlayerStats: { [position: string]: LivePlayerStats } = {};
  const playerMap: { [userId: string]: string } = {};
  
  // Initialize all 4 positions with default stats
  for (let i = 1; i <= 4; i++) {
    const position = i.toString();
    const playerName = (match.settings as any)?.playerNames?.[`player${i}`] || `Player ${i}`;
    livePlayerStats[position] = createDefaultLivePlayerStats(position, playerName);
  }
  
  // Map real participants to positions
  participants.forEach((participant, index) => {
    const position = (index + 1).toString();
    if (position in livePlayerStats) {
      playerMap[participant.userId] = position;
      // Update the name for real participants
      livePlayerStats[position].name = participant.nickname || participant.username;
    }
  });
  
  return {
    livePlayerStats,
    liveTeamPenalties: { "1": 0, "2": 0 },
    matchSetup: {
      arena: match.location || "The Grand Dome",
      gameScoreLimit: match.settings?.scoreLimit || 11,
      sinkPoints: match.settings?.sinkPoints || 3,
      winByTwo: match.settings?.winByTwo || true,
      title: match.title,
      teamNames: {
        "1": (match.settings as any)?.teamNames?.team1 || "Team 1",
        "2": (match.settings as any)?.teamNames?.team2 || "Team 2",
      },
      playerNames: {
        "1": (match.settings as any)?.playerNames?.player1 || "Player 1",
        "2": (match.settings as any)?.playerNames?.player2 || "Player 2",
        "3": (match.settings as any)?.playerNames?.player3 || "Player 3",
        "4": (match.settings as any)?.playerNames?.player4 || "Player 4",
      },
    },
    participants: participants.map(p => p.userId),
    playerMap,
    recentPlays: [], // Initialize with empty array
    roomCode: match.room_code || match.roomCode, // Handle both field names
    status: match.status,
  };
};

/**
 * Updates throwing player statistics in live match data
 */
export const updateThrowingPlayerStats = (
  liveMatchData: LiveMatchData,
  position: string,
  throwType: string,
  points: number
): LiveMatchData => {
  const updatedData = { ...liveMatchData };
  const playerStats = { ...updatedData.livePlayerStats[position] };
  
  // Update basic throwing stats
  playerStats.throws += 1;
  
  // Update specific throw type counts
  switch (throwType) {
    case 'table':
      playerStats.tableDie += 1;
      break;
    case 'line':
      playerStats.line += 1;
      playerStats.lineThrows += 1;
      break;
    case 'hit':
      playerStats.hit += 1;
      playerStats.hits += 1;
      break;
    case 'knicker':
      playerStats.knicker += 1;
      playerStats.hits += 1;
      playerStats.specialThrows += 1;
      break;
    case 'goal':
      playerStats.goal += 1;
      playerStats.hits += 1;
      break;
    case 'dink':
      playerStats.dink += 1;
      playerStats.hits += 1;
      playerStats.specialThrows += 1;
      break;
    case 'sink':
      playerStats.sink += 1;
      playerStats.hits += 1;
      playerStats.specialThrows += 1;
      break;
    case 'short':
    case 'long':
    case 'side':
    case 'height':
      (playerStats as any)[throwType] += 1;
      playerStats.blunders += 1;
      break;
  }
  
  // Update streak logic based on rulebook
  const isGoodThrow = ['hit', 'knicker', 'goal', 'dink', 'sink'].includes(throwType);
  const isBadThrow = ['short', 'long', 'side', 'height', 'line'].includes(throwType);
  
  if (isGoodThrow) {
    playerStats.hitStreak += 1;
    // Check if player just went "on fire" (3+ consecutive good throws)
    if (playerStats.hitStreak === 3) {
      playerStats.currentlyOnFire = true;
      playerStats.onFireCount += 1;
    }
  } else if (isBadThrow) {
    playerStats.hitStreak = 0; // Reset streak on bad throws
    playerStats.currentlyOnFire = false;
  }
  
  // Update score if points were earned
  if (points > 0) {
    playerStats.score += points;
  }
  
  updatedData.livePlayerStats[position] = playerStats;
  return updatedData;
};

/**
 * Updates defensive player statistics in live match data
 */
export const updateDefensivePlayerStats = (
  liveMatchData: LiveMatchData,
  position: string,
  defenseType: string
): LiveMatchData => {
  const updatedData = { ...liveMatchData };
  const playerStats = { ...updatedData.livePlayerStats[position] };
  
  switch (defenseType) {
    case 'catch':
      playerStats.catches += 1;
      break;
    case 'catch_plus_aura':
      playerStats.catchPlusAura += 1;
      playerStats.catches += 1;
      playerStats.aura += 1;
      break;
    case 'drop':
    case 'miss':
    case 'two_hands':
    case 'body':
      (playerStats as any)[defenseType] += 1;
      playerStats.blunders += 1;
      break;
  }
  
  updatedData.livePlayerStats[position] = playerStats;
  return updatedData;
};

/**
 * Updates FIFA statistics in live match data
 */
export const updateFifaStats = (
  liveMatchData: LiveMatchData,
  position: string,
  kickType: string,
  isSuccess: boolean
): LiveMatchData => {
  const updatedData = { ...liveMatchData };
  const playerStats = { ...updatedData.livePlayerStats[position] };
  
  playerStats.fifaAttempts += 1;
  
  if (kickType === 'good_kick') {
    playerStats.goodKick += 1;
  } else if (kickType === 'bad_kick') {
    playerStats.badKick += 1;
  }
  
  if (isSuccess) {
    playerStats.fifaSuccess += 1;
  }
  
  updatedData.livePlayerStats[position] = playerStats;
  return updatedData;
};
