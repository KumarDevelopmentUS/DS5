// components/match/History/HistoryFilters.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Button } from '../../core/Button';
import { Badge } from '../../core/Badge';
import { Card } from '../../core/Card';
import {
  HistoryFiltersProps,
  FILTER_PRESETS,
  FilterPreset,
} from './History.types';
import { useTheme } from '../../../contexts/ThemeContext';
import { SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { MatchStatus } from '../../../types/enums';

export const HistoryFilters: React.FC<HistoryFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  availableGameTypes = [],
  visible = true,
  onClose,
  style,
  testID,
}) => {
  const { colors } = useTheme();
  const [activePreset, setActivePreset] = useState<string | null>(null);

  if (!visible) return null;

  // Check if a filter preset is currently active
  const getActivePreset = (): FilterPreset | null => {
    return (
      FILTER_PRESETS.find((preset) => {
        // Simple comparison - could be more sophisticated
        return JSON.stringify(preset.filters) === JSON.stringify(filters);
      }) || null
    );
  };

  // Handle preset selection
  const handlePresetSelect = (preset: FilterPreset) => {
    setActivePreset(preset.id);
    onFiltersChange(preset.filters);
  };

  // Handle status filter toggle
  const handleStatusToggle = (status: MatchStatus) => {
    const currentStatuses = filters.status || [];
    const updatedStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status];

    onFiltersChange({
      ...filters,
      status: updatedStatuses.length > 0 ? updatedStatuses : undefined,
    });
  };

  // Handle game type filter toggle
  const handleGameTypeToggle = (gameType: string) => {
    const currentTypes = filters.gameType || [];
    const updatedTypes = currentTypes.includes(gameType)
      ? currentTypes.filter((t) => t !== gameType)
      : [...currentTypes, gameType];

    onFiltersChange({
      ...filters,
      gameType: updatedTypes.length > 0 ? updatedTypes : undefined,
    });
  };

  // Handle result filter
  const handleResultFilter = (result: 'win' | 'loss' | 'all') => {
    onFiltersChange({
      ...filters,
      result: result === 'all' ? undefined : result,
    });
  };

  // Clear all filters
  const handleReset = () => {
    setActivePreset(null);
    onReset();
  };

  // Count active filters
  const getActiveFilterCount = (): number => {
    let count = 0;
    if (filters.status?.length) count++;
    if (filters.gameType?.length) count++;
    if (filters.result) count++;
    if (filters.dateRange) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();
  const currentPreset = getActivePreset();

  return (
    <Card
      variant="default"
      padding="md"
      style={[
        {
          marginHorizontal: SPACING.md,
          marginBottom: SPACING.md,
        },
        ...(Array.isArray(style) ? style : style ? [style] : []),
      ]}
      testID={testID}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: SPACING.md,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={{
              fontSize: TYPOGRAPHY.sizes.lg,
              fontFamily: TYPOGRAPHY.fontFamily.medium,
              color: colors.text,
              marginRight: SPACING.sm,
            }}
          >
            Filters
          </Text>
          {activeFilterCount > 0 && (
            <Badge
              count={activeFilterCount}
              variant="count"
              size="small"
              color="default"
              testID={`${testID}-count`}
            />
          )}
        </View>

        <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="small"
              onPress={handleReset}
              testID={`${testID}-reset`}
            >
              Reset
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="small"
              onPress={onClose}
              testID={`${testID}-close`}
            >
              Close
            </Button>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Filter Presets */}
        <View style={{ marginBottom: SPACING.lg }}>
          <Text
            style={{
              fontSize: TYPOGRAPHY.sizes.sm,
              fontFamily: TYPOGRAPHY.fontFamily.medium,
              color: colors.textSecondary,
              marginBottom: SPACING.sm,
            }}
          >
            Quick Filters
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: SPACING.md }}
          >
            {FILTER_PRESETS.map((preset) => (
              <Button
                key={preset.id}
                variant={
                  currentPreset?.id === preset.id ? 'primary' : 'outline'
                }
                size="small"
                onPress={() => handlePresetSelect(preset)}
                style={{ marginRight: SPACING.sm }}
                testID={`${testID}-preset-${preset.id}`}
              >
                {preset.name}
              </Button>
            ))}
          </ScrollView>
        </View>

        {/* Result Filter */}
        <View style={{ marginBottom: SPACING.lg }}>
          <Text
            style={{
              fontSize: TYPOGRAPHY.sizes.sm,
              fontFamily: TYPOGRAPHY.fontFamily.medium,
              color: colors.textSecondary,
              marginBottom: SPACING.sm,
            }}
          >
            Match Result
          </Text>

          <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
            {(['all', 'win', 'loss'] as const).map((result) => (
              <Button
                key={result}
                variant={
                  (result === 'all' && !filters.result) ||
                  filters.result === result
                    ? 'primary'
                    : 'outline'
                }
                size="small"
                onPress={() => handleResultFilter(result)}
                testID={`${testID}-result-${result}`}
              >
                {result === 'all'
                  ? 'All'
                  : result === 'win'
                    ? 'Wins'
                    : 'Losses'}
              </Button>
            ))}
          </View>
        </View>

        {/* Status Filter */}
        <View style={{ marginBottom: SPACING.lg }}>
          <Text
            style={{
              fontSize: TYPOGRAPHY.sizes.sm,
              fontFamily: TYPOGRAPHY.fontFamily.medium,
              color: colors.textSecondary,
              marginBottom: SPACING.sm,
            }}
          >
            Match Status
          </Text>

          <View
            style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}
          >
            {Object.values(MatchStatus).map((status) => {
              const isSelected = filters.status?.includes(status) || false;
              return (
                <Button
                  key={status}
                  variant={isSelected ? 'primary' : 'outline'}
                  size="small"
                  onPress={() => handleStatusToggle(status)}
                  testID={`${testID}-status-${status}`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              );
            })}
          </View>
        </View>

        {/* Game Type Filter */}
        {availableGameTypes.length > 0 && (
          <View style={{ marginBottom: SPACING.lg }}>
            <Text
              style={{
                fontSize: TYPOGRAPHY.sizes.sm,
                fontFamily: TYPOGRAPHY.fontFamily.medium,
                color: colors.textSecondary,
                marginBottom: SPACING.sm,
              }}
            >
              Game Type
            </Text>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: SPACING.sm,
              }}
            >
              {availableGameTypes.map((gameType) => {
                const isSelected =
                  filters.gameType?.includes(gameType) || false;
                return (
                  <Button
                    key={gameType}
                    variant={isSelected ? 'primary' : 'outline'}
                    size="small"
                    onPress={() => handleGameTypeToggle(gameType)}
                    testID={`${testID}-game-type-${gameType}`}
                  >
                    {gameType.charAt(0).toUpperCase() + gameType.slice(1)}
                  </Button>
                );
              })}
            </View>
          </View>
        )}

        {/* Date Range Filter */}
        {filters.dateRange && (
          <View style={{ marginBottom: SPACING.lg }}>
            <Text
              style={{
                fontSize: TYPOGRAPHY.sizes.sm,
                fontFamily: TYPOGRAPHY.fontFamily.medium,
                color: colors.textSecondary,
                marginBottom: SPACING.sm,
              }}
            >
              Date Range
            </Text>

            <View
              style={{
                padding: SPACING.sm,
                backgroundColor: colors.fillSecondary,
                borderRadius: 8,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: TYPOGRAPHY.sizes.sm,
                  color: colors.text,
                }}
              >
                {filters.dateRange.start.toLocaleDateString()} -{' '}
                {filters.dateRange.end.toLocaleDateString()}
              </Text>

              <Button
                variant="ghost"
                size="small"
                onPress={() =>
                  onFiltersChange({
                    ...filters,
                    dateRange: undefined,
                  })
                }
                testID={`${testID}-clear-date`}
              >
                Clear
              </Button>
            </View>
          </View>
        )}
      </ScrollView>
    </Card>
  );
};
