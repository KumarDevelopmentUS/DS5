// types/tracker.ts
import { ViewStyle } from 'react-native';
import { PlayType, MatchStatus } from './enums';
import {
  Match,
  Player,
  LivePlayerStats,
  TeamScore,
  MatchEvent,
} from './models';

// Enhanced match settings to include team and player names
export interface EnhancedMatchSettings {
  scoreLimit: number;
  winByTwo: boolean;
  sinkPoints: 3 | 5;
  teamNames: {
    team1: string;
    team2: string;
  };
  playerNames: {
    player1: string;
    player2: string;
    player3: string;
    player4: string;
  };
  trackAdvancedStats?: boolean;
  enableSpectators?: boolean;
}

// Enhanced match interface with required settings
export interface TrackerMatch extends Omit<Match, 'settings' | 'participants'> {
  settings: EnhancedMatchSettings;
  participants: TrackerPlayer[];
  currentScore: TeamScore;
}

// Enhanced player interface for tracker
export interface TrackerPlayer extends Omit<Player, 'stats'> {
  isRegistered: boolean; // Whether this is a real user or default player
  displayName: string; // The name to show in the tracker
  position: 1 | 2 | 3 | 4; // Player position (1-2 for team1, 3-4 for team2)
  stats?: LivePlayerStats;
}

// Default player creation interface
export interface DefaultPlayer {
  id: string;
  name: string;
  team: 'team1' | 'team2';
  position: 1 | 2 | 3 | 4;
  isRegistered: false;
}

// Tracker component props
export interface TrackerProps {
  matchId: string;
  style?: ViewStyle;
  testID?: string;
}

// Tracker header props
export interface TrackerHeaderProps {
  match: TrackerMatch;
  isConnected: boolean;
  style?: ViewStyle;
  testID?: string;
  onHostJoin?: (team: string, position: 1 | 2 | 3 | 4) => Promise<boolean>;
  isHost?: boolean;
  isUserParticipant?: boolean;
}

// Scoreboard panel props
export interface ScoreboardPanelProps {
  match: TrackerMatch;
  players: TrackerPlayer[];
  currentScore: TeamScore;
  playerStats?: Record<string, LivePlayerStats>;
  isConnected: boolean;
  style?: ViewStyle;
  testID?: string;
}

// Play logger props (enhanced from existing)
export interface TrackerPlayLoggerProps {
  matchId: string;
  players: TrackerPlayer[];
  currentTeam: string;
  isSubmitting?: boolean;
  disabled?: boolean;
  onSubmitPlay: (data: PlaySubmissionData) => Promise<void>;
  onUndo?: () => Promise<void>;
  style?: ViewStyle;
  testID?: string;
}

// Stats panel props
export interface StatsPanelProps {
  match: TrackerMatch;
  players: TrackerPlayer[];
  playerStats: Record<string, LivePlayerStats>;
  events: MatchEvent[];
  style?: ViewStyle;
  testID?: string;
}

// Room code display props
export interface RoomCodeDisplayProps {
  roomCode: string;
  matchTitle: string;
  onCopy: () => Promise<boolean>;
  style?: ViewStyle;
  testID?: string;
}

// QR code display props
export interface QRCodeDisplayProps {
  value: string;
  size?: number;
  backgroundColor?: string;
  color?: string;
  style?: ViewStyle;
  testID?: string;
}

// Play submission data (enhanced)
export interface PlaySubmissionData {
  playerId: string;
  eventType: PlayType;
  team: string;
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

// Team panel props
export interface TeamPanelProps {
  teamName: string;
  teamId: 'team1' | 'team2';
  players: TrackerPlayer[];
  score: number;
  playerStats?: Record<string, LivePlayerStats>;
  isWinning: boolean;
  teamColor: string;
  style?: ViewStyle;
  testID?: string;
}

// Player card props for display in tracker
export interface PlayerCardProps {
  player: TrackerPlayer;
  stats?: LivePlayerStats;
  isOnFire?: boolean;
  isCurrentUser?: boolean;
  compact?: boolean;
  style?: ViewStyle;
  testID?: string;
}

// Enhanced match form data to include all player/team names
export interface TrackerMatchFormData {
  title: string;
  description: string;
  location: string;
  scoreLimit: number;
  winByTwo: boolean;
  sinkPoints: 3 | 5;
  isPublic: boolean;
  // Team names
  team1Name: string;
  team2Name: string;
  // Player names
  player1Name: string;
  player2Name: string;
  player3Name: string;
  player4Name: string;
}

// Tracker state interface
export interface TrackerState {
  match: TrackerMatch | null;
  players: TrackerPlayer[];
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// Real-time update types for tracker
export interface TrackerRealtimeUpdate {
  type:
    | 'score_update'
    | 'player_join'
    | 'player_leave'
    | 'match_status'
    | 'new_event';
  payload: any;
  timestamp: Date;
}

// Layout orientation enum
export enum TrackerOrientation {
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape', // TODO: Implement landscape support
}

// Responsive breakpoints for tracker
export interface TrackerBreakpoints {
  small: number; // Phone portrait
  medium: number; // Phone landscape / small tablet
  large: number; // Tablet portrait
  xlarge: number; // Tablet landscape
}

// Section visibility state for collapsible sections
export interface TrackerSectionVisibility {
  scoreboard: boolean;
  playLogger: boolean;
  stats: boolean;
  events: boolean;
}

// Tracker theme customization
export interface TrackerTheme {
  team1Color: string;
  team2Color: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  borderColor: string;
  successColor: string;
  errorColor: string;
  warningColor: string;
}

// Error types specific to tracker
export type TrackerError =
  | 'MATCH_NOT_FOUND'
  | 'NOT_PARTICIPANT'
  | 'CONNECTION_LOST'
  | 'PERMISSION_DENIED'
  | 'INVALID_PLAY'
  | 'MATCH_ENDED'
  | 'UNKNOWN_ERROR';

// Export commonly used type combinations
export type TrackerPlayerWithStats = TrackerPlayer & {
  stats: LivePlayerStats;
};
export type TrackerTeamData = {
  name: string;
  players: TrackerPlayer[];
  score: number;
  color: string;
};
