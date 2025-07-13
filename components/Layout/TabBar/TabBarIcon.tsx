// components/layout/TabBar/TabBarIcon.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TabBarIconProps } from './TabBarIcon.types';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';

export const TabBarIcon: React.FC<TabBarIconProps> = ({
  name,
  focused,
  size = 24,
  color,
  badgeCount = 0,
  showBadge = false,
}) => {
  const iconColor =
    color || (focused ? COLORS.light.primary : COLORS.light.textSecondary);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={name as any} size={size} color={iconColor} />

        {/* Notification Badge */}
        {showBadge && badgeCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {badgeCount > 99 ? '99+' : badgeCount.toString()}
            </Text>
          </View>
        )}
      </View>

      {/* Focus Indicator */}
      {focused && <View style={styles.focusIndicator} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: COLORS.light.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.light.background,
  },
  badgeText: {
    color: COLORS.light.background,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: 'center',
  },
  focusIndicator: {
    width: 24,
    height: 2,
    backgroundColor: COLORS.light.primary,
    borderRadius: 1,
    marginTop: SPACING.xs,
  },
});
