// components/match/History/History.types.ts
import { Match } from '../../../types/models';
import { MatchStatus } from '../../../types/enums';
import { ViewStyle } from 'react-native';

// Filter options for match history
export interface HistoryFilters {
  status?: MatchStatus[];
  gameType?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  result?: 'win' | 'loss' | 'all';
  opponents?: string[];
}

// Sort options
export interface HistorySortOption {
  field: 'endedAt' | 'createdAt' | 'score' | 'duration';
  direction: 'asc' | 'desc';
}

// Props for HistoryList component
export interface HistoryListProps {
  matches: Match[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  hasNextPage?: boolean;
  filters?: HistoryFilters;
  onFiltersChange?: (filters: HistoryFilters) => void;
  sort?: HistorySortOption;
  onSortChange?: (sort: HistorySortOption) => void;
  showFilters?: boolean;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
}

// Props for HistoryCard component
export interface HistoryCardProps {
  match: Match;
  onPress?: (match: Match) => void;
  onLongPress?: (match: Match) => void;
  showResult?: boolean;
  showOpponents?: boolean;
  showDuration?: boolean;
  showGameType?: boolean;
  compact?: boolean;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
}

// Props for HistoryFilters component
export interface HistoryFiltersProps {
  filters: HistoryFilters;
  onFiltersChange: (filters: HistoryFilters) => void;
  onReset: () => void;
  availableGameTypes?: string[];
  visible?: boolean;
  onClose?: () => void;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
}

// Props for HistoryEmpty component
export interface HistoryEmptyProps {
  onCreateMatch?: () => void;
  message?: string;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
}

// Extended match data for display purposes
export interface MatchHistoryItem extends Match {
  // Computed display properties
  result?: 'win' | 'loss' | 'tie';
  userScore?: number;
  opponentScore?: number;
  opponents?: Array<{
    id: string;
    username: string;
    avatarUrl?: string;
  }>;
  duration?: number; // in minutes
  mvpPlayer?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

// Filter preset options
export interface FilterPreset {
  id: string;
  name: string;
  filters: HistoryFilters;
  icon?: string;
}

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'all',
    name: 'All Matches',
    filters: {},
    icon: 'list',
  },
  {
    id: 'wins',
    name: 'Wins Only',
    filters: { result: 'win' },
    icon: 'trophy',
  },
  {
    id: 'losses',
    name: 'Losses Only',
    filters: { result: 'loss' },
    icon: 'frown',
  },
  {
    id: 'recent',
    name: 'Last 7 Days',
    filters: {
      dateRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        end: new Date(),
      },
    },
    icon: 'clock',
  },
  {
    id: 'this_month',
    name: 'This Month',
    filters: {
      dateRange: {
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        end: new Date(),
      },
    },
    icon: 'calendar',
  },
];

// Sort preset options
export interface SortPreset {
  id: string;
  name: string;
  sort: HistorySortOption;
  icon?: string;
}

export const SORT_PRESETS: SortPreset[] = [
  {
    id: 'newest',
    name: 'Newest First',
    sort: { field: 'endedAt', direction: 'desc' },
    icon: 'arrow-down',
  },
  {
    id: 'oldest',
    name: 'Oldest First',
    sort: { field: 'endedAt', direction: 'asc' },
    icon: 'arrow-up',
  },
  {
    id: 'created',
    name: 'Date Created',
    sort: { field: 'createdAt', direction: 'desc' },
    icon: 'plus',
  },
];
