// app/index.tsx
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../hooks/auth/useAuth';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/ui/useTheme';

/**
 * App Entry Point
 * 
 * Initial router that redirects users to the home page or handles QR code parameters.
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

  // If there's a code parameter, redirect to the new room code-based join page
  if (code) {
    return <Redirect href={`/match/join/code/${code}`} />;
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
