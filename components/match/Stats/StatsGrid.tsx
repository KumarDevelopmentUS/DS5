import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { StatsGridProps } from './Stats.types';
import { StatCard } from './StatCard';
import { SPACING } from '../../../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

export const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
  columns = 2,
  onStatPress,
  style,
  testID,
}) => {
  const cardWidth =
    (screenWidth - SPACING.md * 2 - SPACING.sm * (columns - 1)) / columns;

  // Handle undefined or null stats
  if (!stats || stats.length === 0) {
    return (
      <View style={[styles.container, style]} testID={testID}>
        <View style={[styles.gridItem, { width: cardWidth }]}>
          <StatCard
            title="No Stats"
            value="--"
            subtitle="Play matches to see your stats"
            size="small"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]} testID={testID}>
      {stats.map((stat, index) => (
        <View
          key={`${stat.label}-${index}`}
          style={[styles.gridItem, { width: cardWidth }]}
        >
          <StatCard
            title={stat.label}
            value={stat.value}
            subtitle={stat.description}
            icon={stat.icon}
            trend={stat.trend}
            trendValue={stat.trendValue?.toString()}
            color={stat.color}
            size="small"
            onPress={onStatPress ? () => onStatPress(stat) : undefined}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.sm / 2,
  },
  gridItem: {
    padding: SPACING.sm / 2,
  },
});
