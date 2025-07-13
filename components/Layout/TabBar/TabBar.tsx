// components/layout/TabBar/TabBar.tsx
import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { TabBarProps } from './TabBar.types';
import { TabBarIcon } from './TabBarIcon';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { useColors } from '../../../hooks/ui/useTheme';
import { useNotifications } from '../../../contexts/NotificationContext';

export const TabBar: React.FC<TabBarProps> = ({
  state,
  descriptors,
  navigation,
  insets,
}) => {
  const colors = useColors();
  const { unreadCount } = useNotifications();

  // Map route names to icon names
  const getTabIcon = (routeName: string): string => {
    switch (routeName) {
      case 'home':
        return 'home';
      case 'social':
        return 'people';
      case 'profile':
        return 'person';
      default:
        return 'ellipse';
    }
  };

  // Get badge count for specific tabs
  const getBadgeCount = (routeName: string): number => {
    switch (routeName) {
      case 'social':
        return unreadCount; // Show notification count on social tab
      default:
        return 0;
    }
  };

  // Get readable label for tab
  const getTabLabel = (routeName: string): string => {
    switch (routeName) {
      case 'home':
        return 'Home';
      case 'social':
        return 'Social';
      case 'profile':
        return 'Profile';
      default:
        return routeName.charAt(0).toUpperCase() + routeName.slice(1);
    }
  };

  const tabBarStyle = [
    styles.tabBar,
    {
      backgroundColor: colors.surface,
      borderTopColor: colors.border,
      paddingBottom: insets.bottom,
    },
  ];

  return (
    <SafeAreaView style={tabBarStyle}>
      <View style={styles.tabContainer}>
        {state.routes.map((route, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              // Navigate to the first route in the navigator
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const iconName = getTabIcon(route.name);
          const label = getTabLabel(route.name);
          const badgeCount = getBadgeCount(route.name);

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel || label}
              testID={options.tabBarButtonTestID || `tab-${route.name}`}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
              activeOpacity={0.7}
            >
              <TabBarIcon
                name={iconName}
                focused={isFocused}
                color={isFocused ? colors.primary : colors.textSecondary}
                badgeCount={badgeCount}
                showBadge={badgeCount > 0}
              />

              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isFocused ? colors.primary : colors.textSecondary,
                    fontWeight: isFocused
                      ? TYPOGRAPHY.weights.medium
                      : TYPOGRAPHY.weights.regular,
                  },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    minHeight: 60,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.xs,
  },
  tabLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: SPACING.xs / 2,
    textAlign: 'center',
  },
});
