// components/analytics/QuickStats/QuickStats.tsx
import React from 'react';
import { View, Text, RefreshControl, ScrollView } from 'react-native';
import { QuickStatsProps } from './QuickStats.types';
import { StatItem } from './StatItem';
import { styles } from './QuickStats.styles';
import { useTheme } from '../../../contexts/ThemeContext';
import { usePlayerStats } from '../../../hooks/analytics/usePlayerStats';
import {
  transformStatsToItems,
  getDefaultStatsForVariant,
  formatAchievementDisplay,
  getEmptyStateMessage,
} from './QuickStats.utils';
import { Card } from '../../core/Card';
import { Badge } from '../../core/Badge';
import { Button } from '../../core/Button';
import {
  SkeletonLoader,
  SkeletonGroup,
} from '@/components/Layout/LoadingStates/SkeletonLoader';

export const QuickStats: React.FC<QuickStatsProps> = ({
  userId,
  variant = 'detailed',
  layout = 'grid',
  maxStats,
  showTrends = false,
  showAchievements = true,
  style,
  onStatPress,
  onRefresh,
  testID = 'quick-stats',
}) => {
  const { colors } = useTheme();
  const { stats, achievements, ranking, isLoading, isError, error, refetch } =
    usePlayerStats(userId);

  // Handle refresh
  const handleRefresh = () => {
    refetch();
    onRefresh?.();
  };

  // Get stats to display
  const statsToShow = getDefaultStatsForVariant(variant);
  const limitedMaxStats =
    maxStats || (variant === 'minimal' ? 2 : variant === 'compact' ? 4 : 8);

  // Transform stats to display items
  const statItems = stats
    ? transformStatsToItems(stats, statsToShow, limitedMaxStats)
    : [];

  // Format achievements
  const achievementData = formatAchievementDisplay(achievements);

  // Get container styles based on layout
  const getContainerStyles = () => {
    const baseStyles = [styles.container];

    switch (layout) {
      case 'grid':
        return [...baseStyles, styles.gridLayout];
      case 'row':
        return [...baseStyles, styles.rowLayout];
      case 'column':
        return [...baseStyles, styles.columnLayout];
      default:
        return baseStyles;
    }
  };

  // Get stat item styles based on layout
  const getStatItemStyles = () => {
    switch (layout) {
      case 'grid':
        return styles.gridStatItem;
      case 'row':
        return styles.rowStatItem;
      case 'column':
        return styles.columnStatItem;
      default:
        return {};
    }
  };

  // Handle stat item press
  const handleStatPress = (item: any, index: number) => {
    const statKey = statsToShow[index];
    onStatPress?.(statKey, item.value);
  };

  // Render loading state
  const renderLoadingState = () => (
    <Card
      variant="default"
      padding="md"
      style={style}
      testID={`${testID}-loading`}
    >
      <SkeletonGroup>
        {layout === 'grid' ? (
          <View style={styles.gridLayout}>
            {Array.from({ length: limitedMaxStats }, (_, index) => (
              <View key={index} style={styles.gridStatItem}>
                <SkeletonLoader width="100%" height={80} borderRadius={8} />
              </View>
            ))}
          </View>
        ) : layout === 'row' ? (
          <View style={styles.rowLayout}>
            {Array.from(
              { length: Math.min(limitedMaxStats, 4) },
              (_, index) => (
                <View key={index} style={styles.rowStatItem}>
                  <SkeletonLoader width="100%" height={60} borderRadius={8} />
                </View>
              )
            )}
          </View>
        ) : (
          <View style={styles.columnLayout}>
            {Array.from({ length: limitedMaxStats }, (_, index) => (
              <View
                key={index}
                style={[styles.columnStatItem, { marginBottom: 8 }]}
              >
                <SkeletonLoader width="100%" height={40} borderRadius={6} />
              </View>
            ))}
          </View>
        )}
      </SkeletonGroup>
    </Card>
  );

  // Render error state
  const renderErrorState = () => (
    <Card
      variant="outlined"
      padding="lg"
      style={style}
      testID={`${testID}-error`}
    >
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Failed to load statistics
        </Text>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          {error?.message || 'An unexpected error occurred'}
        </Text>
        <Button
          variant="outline"
          size="small"
          onPress={handleRefresh}
          testID={`${testID}-retry`}
        >
          Try Again
        </Button>
      </View>
    </Card>
  );

  // Render empty state
  const renderEmptyState = () => {
    const emptyMessage = getEmptyStateMessage(stats);

    return (
      <Card
        variant="default"
        padding="lg"
        style={style}
        testID={`${testID}-empty`}
      >
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {emptyMessage.title}
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
            {emptyMessage.subtitle}
          </Text>
        </View>
      </Card>
    );
  };

  // Render header with title and achievements
  const renderHeader = () => {
    if (variant === 'minimal') return null;

    return (
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Quick Stats
          </Text>
          {ranking.globalRank && (
            <Text
              style={[styles.headerSubtitle, { color: colors.textSecondary }]}
            >
              Rank #{ranking.globalRank} of {ranking.totalPlayers}
            </Text>
          )}
        </View>

        {showAchievements && achievementData.recent && (
          <View style={styles.achievementContainer}>
            <Badge
              variant="achievement"
              color="gold"
              text={achievementData.recent.name}
              size="small"
              style={styles.achievementBadge}
              testID={`${testID}-recent-achievement`}
            />
          </View>
        )}
      </View>
    );
  };

  // Render achievements summary
  const renderAchievements = () => {
    if (!showAchievements || variant === 'minimal' || !achievementData.count) {
      return null;
    }

    return (
      <View style={styles.achievementContainer}>
        <Badge
          variant="count"
          count={achievementData.count}
          color="gold"
          size="small"
          style={styles.achievementBadge}
          testID={`${testID}-achievement-count`}
        />
        <Text style={[styles.achievementText, { color: colors.textSecondary }]}>
          {achievementData.count}{' '}
          {achievementData.count === 1 ? 'achievement' : 'achievements'}{' '}
          unlocked
        </Text>
      </View>
    );
  };

  // Render stats grid/list
  const renderStats = () => {
    if (statItems.length === 0) {
      return renderEmptyState();
    }

    return (
      <View style={getContainerStyles()}>
        {statItems.map((item, index) => (
          <View key={`stat-${index}`} style={getStatItemStyles()}>
            <StatItem
              data={item}
              variant={variant}
              onPress={
                onStatPress ? () => handleStatPress(item, index) : undefined
              }
              testID={`${testID}-stat-${index}`}
            />
          </View>
        ))}
      </View>
    );
  };

  // Render main content
  const renderContent = () => {
    if (isLoading) {
      return renderLoadingState();
    }

    if (isError) {
      return renderErrorState();
    }

    return (
      <Card
        variant={variant === 'minimal' ? 'outlined' : 'default'}
        padding={variant === 'minimal' ? 'sm' : 'md'}
        style={style}
        testID={testID}
      >
        {renderHeader()}
        {renderStats()}
        {renderAchievements()}
      </Card>
    );
  };

  // If onRefresh is provided, wrap in ScrollView with RefreshControl
  if (onRefresh) {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        testID={`${testID}-scroll`}
      >
        {renderContent()}
      </ScrollView>
    );
  }

  return renderContent();
};
