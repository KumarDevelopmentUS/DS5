import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ComparisonRowProps } from './Stats.types';
import { ProgressBar } from './ProgressBar';
import { useTheme } from '../../../hooks/ui/useTheme';
import { SPACING, TYPOGRAPHY } from '../../../constants/theme';

export const ComparisonRow: React.FC<ComparisonRowProps> = ({
  data,
  player1Name = 'You',
  player2Name = 'Opponent',
  highlightBetter = true,
  style,
  testID,
}) => {
  const { colors } = useTheme();
  const {
    label,
    value1,
    value2,
    unit = '',
    showDifference = true,
    invertComparison = false,
  } = data;

  const total = value1 + value2 || 1; // Avoid division by zero
  const percentage1 = (value1 / total) * 100;
  const percentage2 = (value2 / total) * 100;

  const isBetter1 = invertComparison ? value1 < value2 : value1 > value2;
  const isBetter2 = !isBetter1 && value1 !== value2;

  const getValueColor = (isBetter: boolean) => {
    if (!highlightBetter || value1 === value2) return colors.text;
    return isBetter ? colors.success : colors.textSecondary;
  };

  const difference = Math.abs(value1 - value2);
  const differenceText =
    showDifference && difference > 0 ? `(+${difference}${unit})` : '';

  return (
    <View style={[styles.container, style]} testID={testID}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {label}
      </Text>

      <View style={styles.comparisonContainer}>
        <View style={styles.playerSection}>
          <Text
            style={[styles.playerName, { color: colors.text }]}
            numberOfLines={1}
          >
            {player1Name}
          </Text>
          <View style={styles.valueContainer}>
            <Text style={[styles.value, { color: getValueColor(isBetter1) }]}>
              {value1}
              {unit}
            </Text>
            {isBetter1 && differenceText && (
              <Text style={[styles.difference, { color: colors.success }]}>
                {differenceText}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.barsContainer}>
          <View style={styles.barWrapper}>
            <View style={[styles.bar, styles.leftBar]}>
              <ProgressBar
                value={percentage1}
                max={100}
                color={
                  isBetter1 && highlightBetter ? colors.success : colors.primary
                }
                height={6}
                showPercentage={false}
                animated={false}
              />
            </View>
          </View>
          <View style={styles.barWrapper}>
            <View style={[styles.bar, styles.rightBar]}>
              <ProgressBar
                value={percentage2}
                max={100}
                color={
                  isBetter2 && highlightBetter
                    ? colors.success
                    : colors.secondary
                }
                height={6}
                showPercentage={false}
                animated={false}
              />
            </View>
          </View>
        </View>

        <View style={[styles.playerSection, styles.rightPlayerSection]}>
          <Text
            style={[styles.playerName, { color: colors.text }]}
            numberOfLines={1}
          >
            {player2Name}
          </Text>
          <View style={styles.valueContainer}>
            <Text style={[styles.value, { color: getValueColor(isBetter2) }]}>
              {value2}
              {unit}
            </Text>
            {isBetter2 && differenceText && (
              <Text style={[styles.difference, { color: colors.success }]}>
                {differenceText}
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.xs,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  comparisonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerSection: {
    flex: 1,
  },
  rightPlayerSection: {
    alignItems: 'flex-end',
  },
  playerName: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginBottom: SPACING.xxs,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.xxs,
  },
  value: {
    fontSize: TYPOGRAPHY.sizes.callout,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  difference: {
    fontSize: TYPOGRAPHY.sizes.caption2,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  barsContainer: {
    flex: 2,
    flexDirection: 'row',
    marginHorizontal: SPACING.sm,
    gap: SPACING.xxs,
  },
  barWrapper: {
    flex: 1,
  },
  bar: {
    transform: [{ scaleX: -1 }], // Flip for mirrored effect
  },
  leftBar: {
    // Left bar grows from right to left
  },
  rightBar: {
    transform: [{ scaleX: 1 }], // Right bar grows normally
  },
});
