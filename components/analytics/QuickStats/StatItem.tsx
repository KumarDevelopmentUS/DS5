// components/analytics/QuickStats/StatItem.tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { StatItemProps } from './QuickStats.types';
import { styles } from './QuickStats.styles';
import { useTheme } from '../../../contexts/ThemeContext';

// TODO: Import trend icons when available
// import { TrendUpIcon, TrendDownIcon, TrendStableIcon } from '../../../components/icons';

export const StatItem: React.FC<StatItemProps> = ({
  data,
  variant,
  onPress,
  testID,
}) => {
  const { colors } = useTheme();

  // Get color based on stat color prop
  const getStatColor = () => {
    switch (data.color) {
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      case 'info':
        return colors.info;
      case 'default':
      default:
        return colors.text;
    }
  };

  // Get background color for stat item
  const getBackgroundColor = () => {
    if (variant === 'minimal') {
      return 'transparent';
    }
    return colors.surface;
  };

  // Get text styles based on variant
  const getValueStyle = () => {
    const baseStyle = [styles.statValue, { color: getStatColor() }];

    if (variant === 'compact') {
      return [...baseStyle, styles.statValueCompact];
    } else if (variant === 'minimal') {
      return [...baseStyle, styles.statValueMinimal];
    }

    return baseStyle;
  };

  const getLabelStyle = () => {
    const baseStyle = [styles.statLabel, { color: colors.textSecondary }];

    if (variant === 'compact') {
      return [...baseStyle, styles.statLabelCompact];
    }

    return baseStyle;
  };

  // Render trend indicator
  const renderTrend = () => {
    if (!data.trend) return null;

    const trendColor = data.trend.isPositive ? colors.success : colors.warning;

    // TODO: Replace with actual trend icons when available
    const getTrendSymbol = () => {
      switch (data.trend!.direction) {
        case 'up':
          return '↗';
        case 'down':
          return '↘';
        case 'stable':
        default:
          return '→';
      }
    };

    return (
      <View style={styles.trendContainer}>
        <Text style={[styles.trendText, { color: trendColor }]}>
          {getTrendSymbol()} {data.trend.value}
        </Text>
      </View>
    );
  };

  // Render icon
  const renderIcon = () => {
    if (!data.icon) return null;

    const iconStyle =
      variant === 'compact'
        ? styles.iconContainerCompact
        : styles.iconContainer;

    return <View style={iconStyle}>{data.icon}</View>;
  };

  // Render content based on variant
  const renderContent = () => {
    if (variant === 'minimal') {
      return (
        <View style={styles.statContentRow}>
          <Text style={getLabelStyle()} numberOfLines={1}>
            {data.label}
          </Text>
          <Text style={getValueStyle()} numberOfLines={1}>
            {data.value}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.statContent}>
        {renderIcon()}
        <Text style={getValueStyle()} numberOfLines={1}>
          {data.value}
        </Text>
        <Text style={getLabelStyle()} numberOfLines={1}>
          {data.label}
        </Text>
        {data.subtitle && (
          <Text
            style={[styles.statSubtitle, { color: colors.textTertiary }]}
            numberOfLines={1}
          >
            {data.subtitle}
          </Text>
        )}
        {renderTrend()}
      </View>
    );
  };

  // Get container styles
  const getContainerStyles = () => [
    styles.statItem,
    {
      backgroundColor: getBackgroundColor(),
    },
  ];

  // If pressable, wrap in Pressable
  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          ...getContainerStyles(),
          pressed && styles.pressed,
        ]}
        onPress={onPress}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={`${data.label}: ${data.value}`}
        accessibilityHint={data.subtitle}
      >
        {renderContent()}
      </Pressable>
    );
  }

  // Otherwise, render as View
  return (
    <View
      style={getContainerStyles()}
      testID={testID}
      accessibilityLabel={`${data.label}: ${data.value}`}
      accessibilityHint={data.subtitle}
    >
      {renderContent()}
    </View>
  );
};
