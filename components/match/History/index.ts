// components/match/History/index.ts

// Export main components
export { HistoryList } from './HistoryList';
export { HistoryCard } from './HistoryCard';
export { HistoryFilters } from './HistoryFilters';
export { HistoryEmpty } from './HistoryEmpty';

// Export types
export type {
  HistoryFilters as HistoryFiltersType,
  HistorySortOption,
  HistoryListProps,
  HistoryCardProps,
  HistoryFiltersProps,
  HistoryEmptyProps,
  MatchHistoryItem,
  FilterPreset,
  SortPreset,
} from './History.types';

// Export constants
export { FILTER_PRESETS, SORT_PRESETS } from './History.types';

// Default export for main component
export { HistoryList as default } from './HistoryList';
