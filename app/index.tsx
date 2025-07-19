import { Redirect, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../hooks/auth/useAuth';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/ui/useTheme';

/**
 * App Entry Point
 *
 * This component acts as the initial router for the application. It redirects
 * all users to the home page, where they can access the app as either
 * authenticated users or guests.
 */
export default function Index() {
  const { loading } = useAuth();
  const { colors } = useTheme();
  const { code } = useLocalSearchParams<{ code?: string }>();

  if (loading) {
    // Display a loading indicator while the auth state is being determined.
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // If there's a code parameter, redirect to the join page
  if (code) {
    // We need to find the match by room code first
    // For now, redirect to home and show a message
    return <Redirect href={`/(tabs)/home?code=${code}`} />;
  }

  // Always redirect to home page - users can be guests or authenticated
  return <Redirect href="/(tabs)/home" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
