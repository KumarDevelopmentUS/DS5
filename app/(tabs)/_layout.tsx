// app/(tabs)/_layout.tsx
import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TabBar } from '../../components/Layout/TabBar';
import { useTheme } from '../../hooks/ui/useTheme';

/**
 * Tab Navigation Layout
 *
 * This component sets up the main bottom tab navigation for the authenticated
 * part of the application. It defines the tabs, their icons, and colors, and
 * uses the custom TabBar component for enhanced functionality.
 *
 * Features:
 * - Custom TabBar with notification badges
 * - Theme-aware styling
 * - Platform-specific optimizations
 * - All three main tabs: Home, Social, Profile
 */
export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      // Use our custom TabBar component instead of the default
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        // We will use custom headers in each screen
        headerShown: false,

        // These will be used by our custom TabBar
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },

        // Platform-specific optimizations
        ...(Platform.OS === 'ios' && {
          lazy: true,
        }),
      }}
    >
      {/* Home Tab - Primary landing screen */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarAccessibilityLabel:
            'Home tab - View dashboard and active matches',

          // Preload home screen for instant access
          lazy: false,

          // Icon for fallback/debugging (custom TabBar will override)
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Social Tab - Community and social features */}
      <Tabs.Screen
        name="social"
        options={{
          title: 'Social',
          tabBarLabel: 'Social',
          tabBarAccessibilityLabel: 'Social tab - View communities and friends',

          // Lazy load for better performance
          lazy: true,

          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Profile Tab - User profile and settings */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarAccessibilityLabel: 'Profile tab - View your profile and stats',

          // Lazy load for better performance
          lazy: true,

          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
