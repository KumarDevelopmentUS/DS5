import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Rect, Path, Text as SvgText } from 'react-native-svg';
import { StatChartProps } from './Stats.types';
import { Card } from '../../core/Card';
import { useTheme } from '../../../hooks/ui/useTheme';
import { SPACING, TYPOGRAPHY } from '../../../constants/theme';

export const StatChart: React.FC<StatChartProps> = ({
  data,
  height = 200,
  showGrid = true,
  showLabels = true,
  color,
  type = 'line',
  style,
  testID,
}) => {
  const { colors } = useTheme();
  const chartColor = color || colors.primary;

  const { width: screenWidth } = Dimensions.get('window');
  const chartWidth = screenWidth - SPACING.md * 2; // Card padding

  const cardStyle = StyleSheet.flatten([styles.card, style]);

  if (!data || data.length === 0) {
    return (
      <Card variant="default" style={[cardStyle, { height }]}>
        <View style={styles.centered}>
          <Text style={{ color: colors.textSecondary }}>No data available</Text>
        </View>
      </Card>
    );
  }

  const yMax = Math.max(...data.map((d) => d.y));
  const xMax = data.length - 1;

  const getX = (index: number) => (index / xMax) * chartWidth;
  const getY = (y: number) => height - (y / yMax) * height;

  const createLinePath = () => {
    if (data.length < 2) return '';
    const path = data
      .map((point, i) => {
        const x = getX(i);
        const y = getY(point.y);
        return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
      })
      .join(' ');
    return path;
  };

  const renderGrid = () => {
    const horizontalLines = Array.from({ length: 5 }).map((_, i) => (
      <Line
        key={`h-line-${i}`}
        x1="0"
        y1={(height / 4) * i}
        x2={chartWidth}
        y2={(height / 4) * i}
        stroke={colors.border}
        strokeWidth="0.5"
      />
    ));
    return horizontalLines;
  };

  const renderLabels = () => {
    return data.map((point, i) => (
      <SvgText
        key={`label-${i}`}
        x={getX(i)}
        y={height + SPACING.sm}
        fill={colors.textSecondary}
        fontSize={TYPOGRAPHY.sizes.caption2}
        textAnchor="middle"
      >
        {point.x}
      </SvgText>
    ));
  };

  return (
    <Card variant="default" style={cardStyle} testID={testID}>
      <View style={{ height, width: chartWidth }}>
        <Svg height={height + (showLabels ? 30 : 0)} width={chartWidth}>
          {showGrid && renderGrid()}

          {type === 'line' && (
            <Path
              d={createLinePath()}
              stroke={chartColor}
              strokeWidth="2"
              fill="none"
            />
          )}

          {type === 'bar' &&
            data.map((point, i) => {
              const barWidth = (chartWidth / data.length) * 0.7;
              const x = getX(i) - barWidth / 2;
              const y = getY(point.y);
              return (
                <Rect
                  key={`bar-${i}`}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={height - y}
                  fill={point.color || chartColor}
                />
              );
            })}

          {showLabels && renderLabels()}
        </Svg>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: SPACING.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
