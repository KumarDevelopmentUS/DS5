import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { StatsListProps, StatItem } from './Stats.types';
import { TrendIndicator } from './TrendIndicator';
import { Card } from '../../core/Card';
import { useTheme } from '../../../hooks/ui/useTheme';
import { SPACING, TYPOGRAPHY, BORDERS } from '../../../constants/theme';

export const StatsList: React.FC<StatsListProps> = ({
  title,
  stats,
  onStatPress,
  showTrends = true,
  style,
  testID,
}) => {
  const { colors } = useTheme();

  const renderStatItem = (stat: StatItem, index: number) => {
    const isLast = index === stats.length - 1;

    const content = (
      <View
        style={[
          styles.statItem,
          !isLast && styles.statItemBorder,
          { borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.statLeft}>
          {stat.icon && <View style={styles.icon}>{stat.icon}</View>}
          <View style={styles.statInfo}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {stat.label}
            </Text>
            {stat.description && (
              <Text
                style={[styles.statDescription, { color: colors.textTertiary }]}
              >
                {stat.description}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.statRight}>
          <Text
            style={[styles.statValue, { color: stat.color || colors.text }]}
          >
            {stat.value}
            {stat.unit && (
              <Text style={[styles.statUnit, { color: colors.textSecondary }]}>
                {' '}
                {stat.unit}
              </Text>
            )}
          </Text>
          {showTrends && stat.trend && (
            <TrendIndicator
              trend={stat.trend}
              value={stat.trendValue}
              size="small"
              style={styles.trend}
            />
          )}
        </View>
      </View>
    );

    if (onStatPress) {
      return (
        <Pressable
          key={`${stat.label}-${index}`}
          onPress={() => onStatPress(stat)}
          style={({ pressed }) => [pressed && { opacity: 0.7 }]}
        >
          {content}
        </Pressable>
      );
    }

    return <View key={`${stat.label}-${index}`}>{content}</View>;
  };

  return (
    <Card variant="default" style={style} testID={testID}>
      {title && (
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        </View>
      )}
      <View style={styles.statsList}>
        {stats.map((stat, index) => renderStatItem(stat, index))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.callout,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  statsList: {
    paddingVertical: SPACING.xs,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  statItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.callout,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  statDescription: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginTop: SPACING.xxs,
  },
  statRight: {
    alignItems: 'flex-end',
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.callout,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  statUnit: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  trend: {
    marginTop: SPACING.xxs,
  },
});
