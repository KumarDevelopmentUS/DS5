// components/core/Badge/Badge.tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { BadgeProps } from './Badge.types';
import { styles } from './Badge.styles';
import { useTheme } from '../../../contexts/ThemeContext';
import { SPACING } from '../../../constants/theme';

// Badge-specific color palette for achievements and gaming tiers
const BADGE_COLORS = {
  // Achievement tiers (metallic colors)
  bronze: {
    background: '#CD7F32', // Classic bronze
    text: '#FFFFFF',
  },
  silver: {
    background: '#C0C0C0', // Classic silver
    text: '#2C2C2E',
  },
  gold: {
    background: '#FFD700', // Classic gold
    text: '#2C2C2E',
  },
  diamond: {
    background: '#B9F2FF', // Light blue diamond
    text: '#1C1C1E',
  },
  master: {
    background: '#9932CC', // Purple for master tier
    text: '#FFFFFF',
  },

  // Special tier colors
  legendary: {
    background: '#FF6B35', // Orange-red for legendary
    text: '#FFFFFF',
  },
  epic: {
    background: '#8A2BE2', // Blue-violet for epic
    text: '#FFFFFF',
  },
  rare: {
    background: '#4169E1', // Royal blue for rare
    text: '#FFFFFF',
  },

  // Status colors (will use theme colors)
  default: null, // Will use theme colors
  success: null,
  error: null,
  warning: null,
  info: null,
};

export const Badge: React.FC<BadgeProps> = ({
  text,
  count,
  icon,
  variant = 'label',
  size = 'medium',
  color = 'default',
  position = 'relative',
  pressable = false,
  onPress,
  style,
  textStyle,
  testID,
}) => {
  const { colors } = useTheme();

  // Get color based on color prop
  const getColor = () => {
    // Check if it's a badge-specific color first
    if (BADGE_COLORS[color] && BADGE_COLORS[color] !== null) {
      return BADGE_COLORS[color];
    }

    // Fall back to theme colors for status colors
    switch (color) {
      case 'success':
        return { background: colors.success, text: '#FFFFFF' };
      case 'error':
        return { background: colors.error, text: '#FFFFFF' };
      case 'warning':
        return { background: colors.warning, text: '#FFFFFF' };
      case 'info':
        return { background: colors.info, text: '#FFFFFF' };
      case 'default':
      default:
        return { background: colors.fill, text: colors.text };
    }
  };

  // Get badge styles based on variant and size
  const getBadgeStyles = () => {
    const staticStyles = [styles.badge, styles[variant], styles[position]];

    const badgeColor = getColor();
    let dynamicStyles: any = {
      backgroundColor: badgeColor.background,
    };

    // Size adjustments based on variant and size
    if (variant === 'status') {
      const sizeMap = { small: 8, medium: 12, large: 16 };
      const statusSize = sizeMap[size];
      dynamicStyles = {
        ...dynamicStyles,
        width: statusSize,
        height: statusSize,
      };
    } else if (variant === 'count') {
      const sizeMap = { small: 16, medium: 20, large: 24 };
      const countSize = sizeMap[size];
      dynamicStyles = {
        ...dynamicStyles,
        minWidth: countSize,
        height: countSize,
      };
    } else if (variant === 'achievement') {
      // Achievement badges have more padding for larger size
      if (size === 'large') {
        dynamicStyles.paddingHorizontal = SPACING.md;
        dynamicStyles.paddingVertical = SPACING.sm;
      }
    }

    return [...staticStyles, dynamicStyles, style];
  };

  // Get text styles based on variant
  const getTextStyles = () => {
    let baseTextStyle;

    switch (variant) {
      case 'count':
        baseTextStyle = styles.countText;
        break;
      case 'achievement':
        baseTextStyle = styles.achievementText;
        break;
      case 'label':
        baseTextStyle = styles.labelText;
        break;
      default:
        baseTextStyle = styles.text;
    }

    const badgeColor = getColor();
    return [baseTextStyle, { color: badgeColor.text }, textStyle];
  };

  // Render badge content
  const renderContent = () => {
    switch (variant) {
      case 'status':
        // Status badges are just colored dots, no content
        return null;

      case 'count':
        // Count badges show numbers, handle 99+ case
        const displayCount = count && count > 99 ? '99+' : String(count || 0);
        return (
          <Text style={getTextStyles()} testID={`${testID}-count`}>
            {displayCount}
          </Text>
        );

      case 'achievement':
        // Achievement badges can have icon + text
        return (
          <>
            {icon && (
              <View style={styles.iconContainer} testID={`${testID}-icon`}>
                {icon}
                {/* TODO: Add specific achievement icons:
                    - Bronze: Basic medal icon
                    - Silver: Silver medal icon  
                    - Gold: Gold medal/crown icon
                    - Diamond: Diamond/crystal icon
                    - Master: Crown/master emblem
                    - Legendary: Special flame/star icon
                    - Epic: Lightning/special effect icon
                    - Rare: Star/gem icon
                    Example: <GoldMedalIcon size={16} color={badgeColor.text} />
                */}
              </View>
            )}
            {text && (
              <Text style={getTextStyles()} testID={`${testID}-text`}>
                {text}
              </Text>
            )}
          </>
        );

      case 'label':
      default:
        // Label badges show text only
        return text ? (
          <Text style={getTextStyles()} testID={`${testID}-text`}>
            {text}
          </Text>
        ) : null;
    }
  };

  // Render badge
  const renderBadge = () => (
    <View style={getBadgeStyles()}>{renderContent()}</View>
  );

  // If pressable, wrap in Pressable
  if (pressable && onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          pressed && {
            opacity: colors.activeOpacity,
            transform: [{ scale: 0.9 }],
          },
        ]}
        testID={testID}
      >
        {renderBadge()}
      </Pressable>
    );
  }

  // Otherwise, render as View
  return <View testID={testID}>{renderBadge()}</View>;
};
