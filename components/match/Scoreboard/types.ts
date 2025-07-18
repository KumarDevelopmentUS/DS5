// components/match/Scoreboard/types.ts
import {
  Match,
  Player,
  TeamScore as TeamScoreData,
  PlayerMatchStats,
} from '../../../types/models';
import { MatchStatus } from '../../../types/enums';
import { ViewStyle } from 'react-native';

export interface ScoreboardProps {
  match: Match;
  participants: Player[];
  currentScore: TeamScoreData;
  playerStats?: Record<string, PlayerMatchStats>;
  isConnected?: boolean;
  className?: string;
}

export interface TeamScoreProps {
  teamName: string;
  teamId: string;
  score: number;
  players: Player[];
  playerStats?: Record<string, PlayerMatchStats>;
  isWinning?: boolean;
  teamColor?: string;
  className?: string;
}

export interface MatchTimerProps {
  match: Match;
  status: MatchStatus;
  className?: string;
}

export interface PlayerStatsProps {
  player: Player;
  stats?: PlayerMatchStats;
  isCurrentUser?: boolean;
  isOnFire?: boolean;
  className?: string;
  style?: ViewStyle;
}
