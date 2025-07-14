// components/match/ActiveMatchCard/ActiveMatchCard.types.ts
import { ViewStyle } from 'react-native';
import { Match, Player } from '../../../types/models';

export interface ActiveMatchCardProps {
  // Data
  match: Match;

  // Actions
  onJoin?: (matchId: string) => void;
  onView?: (matchId: string) => void;
  onShare?: (matchId: string) => void;

  // Display options
  showActions?: boolean;
  showParticipants?: boolean;
  maxVisibleParticipants?: number;

  // Styling
  style?: ViewStyle | ViewStyle[];

  // Accessibility
  testID?: string;
}

export interface MatchParticipantAvatarProps {
  participant: Player; // Use Player type instead of User
  size?: 'small' | 'medium';
  showOnlineStatus?: boolean;
}

export interface MatchMetadataProps {
  match: Match;
  compact?: boolean;
}
