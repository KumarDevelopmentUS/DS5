// components/match/History/HistoryList.tsx
import React, { useState } from 'react';
import {
  FlatList,
  View,
  RefreshControl,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { HistoryCard } from './HistoryCard';
import { HistoryFilters } from './HistoryFilters';
import { HistoryEmpty } from './HistoryEmpty';
import { Button } from '../../core/Button';
import {
  HistoryListProps,
  MatchHistoryItem,
  SORT_PRESETS,
} from './History.types';
import { useTheme } from '../../../contexts/ThemeContext';
import { SPACING } from '../../../constants/theme';
import { Match } from '../../../types/models';
import { MATCH_ROUTES } from '../../../constants/routes';
import { useRouter } from 'expo-router';

export const HistoryList: React.FC<HistoryListProps> = ({
  matches,
  isLoading = false,
  isLoadingMore = false,
  onLoadMore,
  onRefresh,
  refreshing = false,
  hasNextPage = false,
  filters = {},
  onFiltersChange,
  sort = SORT_PRESETS[0].sort,
  onSortChange,
  showFilters = true,
  style,
  testID,
}) => {
  const { colors } = useTheme();
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const router = useRouter();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showActions, setShowActions] = useState(false);

  // Extract unique game types from matches for filter options
  const getAvailableGameTypes = (): string[] => {
    const gameTypes = new Set(matches.map((match) => match.gameType));
    return Array.from(gameTypes);
  };

  // Handle match press - navigate to match details
  const handleMatchPress = (match: Match) => {
    // Navigate to match details
    router.push(`/match/${match.id}`);
  };

  // Handle match long press - show action sheet
  const handleMatchLongPress = (match: Match) => {
    // Show match actions (delete, share, etc.)
    setSelectedMatch(match);
    setShowActions(true);
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: typeof filters) => {
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  // Handle filter reset
  const handleFiltersReset = () => {
    if (onFiltersChange) {
      onFiltersChange({});
    }
  };

  // Toggle filters panel
  const toggleFiltersPanel = () => {
    setShowFiltersPanel(!showFiltersPanel);
  };

  // Count active filters for display
  const getActiveFilterCount = (): number => {
    let count = 0;
    if (filters.status?.length) count++;
    if (filters.gameType?.length) count++;
    if (filters.result) count++;
    if (filters.dateRange) count++;
    return count;
  };

  // Render individual match card
  const renderMatchCard: ListRenderItem<Match> = ({ item, index }) => (
    <HistoryCard
      match={item}
      onPress={handleMatchPress}
      onLongPress={handleMatchLongPress}
      showResult={true}
      showOpponents={true}
      showDuration={false}
      showGameType={true}
      compact={false}
      testID={`${testID}-match-${index}`}
    />
  );

  // Render loading footer
  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View
        style={{
          paddingVertical: SPACING.lg,
          alignItems: 'center',
        }}
      >
        <ActivityIndicator
          size="small"
          color={colors.primary}
          testID={`${testID}-loading-more`}
        />
      </View>
    );
  };

  // Render header with filters and sort
  const renderHeader = () => {
    if (!showFilters) return null;

    const activeFilterCount = getActiveFilterCount();

    return (
      <View>
        {/* Filter Controls */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm,
            backgroundColor: colors.background,
          }}
        >
          <Button
            variant={showFiltersPanel ? 'primary' : 'outline'}
            size="small"
            onPress={toggleFiltersPanel}
            testID={`${testID}-toggle-filters`}
          >
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>

          <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
            {/* Sort Button */}
            <Button
              variant="outline"
              size="small"
              onPress={() => {
                // TODO: Show sort options modal/dropdown
                // For now, cycle through sort options
                const currentIndex = SORT_PRESETS.findIndex(
                  (preset) =>
                    JSON.stringify(preset.sort) === JSON.stringify(sort)
                );
                const nextIndex = (currentIndex + 1) % SORT_PRESETS.length;
                if (onSortChange) {
                  onSortChange(SORT_PRESETS[nextIndex].sort);
                }
              }}
              testID={`${testID}-sort`}
            >
              Sort
            </Button>
          </View>
        </View>

        {/* Filters Panel */}
        <HistoryFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleFiltersReset}
          availableGameTypes={getAvailableGameTypes()}
          visible={showFiltersPanel}
          onClose={() => setShowFiltersPanel(false)}
          testID={`${testID}-filters`}
        />
      </View>
    );
  };

  // Handle load more
  const handleLoadMore = () => {
    if (hasNextPage && !isLoadingMore && onLoadMore) {
      onLoadMore();
    }
  };

  // Show loading state
  if (isLoading && matches.length === 0) {
    return (
      <View
        style={[
          {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.background,
          },
          style,
        ]}
      >
        <ActivityIndicator
          size="large"
          color={colors.primary}
          testID={`${testID}-loading`}
        />
      </View>
    );
  }

  // Show empty state
  if (!isLoading && matches.length === 0) {
    return (
      <View style={[{ flex: 1, backgroundColor: colors.background }, style]}>
        {renderHeader()}
        <HistoryEmpty
          onCreateMatch={() => {
            // Navigate to match creation
            router.push('/match/create');
          }}
          testID={`${testID}-empty`}
        />
      </View>
    );
  }

  return (
    <View style={[{ flex: 1, backgroundColor: colors.background }, style]}>
      <FlatList
        data={matches}
        renderItem={renderMatchCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
              progressBackgroundColor={colors.surface}
            />
          ) : undefined
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: SPACING.lg,
        }}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.xs }} />}
        testID={testID}
      />
    </View>
  );
};
