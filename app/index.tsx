import { Redirect } from 'expo-router';
import { useAuth } from '../hooks/auth/useAuth';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/ui/useTheme';

/**
 * App Entry Point
 *
 * This component acts as the initial router for the application. It checks the
 * user's authentication status and declaratively redirects them to the appropriate
 * screen. This approach is safer than programmatic navigation on initial load,
 * especially for web, as it avoids race conditions with the router setup.
 */
export default function Index() {
  const { isAuthenticated, loading } = useAuth();
  const { colors } = useTheme();

  if (loading) {
    // Display a loading indicator while the auth state is being determined.
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isAuthenticated) {
    // If the user is authenticated, redirect them to the main app (home screen).
    return <Redirect href="/(tabs)/home" />;
  } else {
    // If the user is not authenticated, redirect them to the login screen.
    return <Redirect href="/(auth)/login" />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
