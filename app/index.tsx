// app/index.tsx
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { useAuth } from '../hooks/auth/useAuth';
import { COLORS } from '../constants/theme';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        // Navigate authenticated users to the main app (home screen)
        router.replace('../(tabs)/home');
      } else {
        // Navigate unauthenticated users to login screen
        router.replace('../(auth)/login');
      }
    }
  }, [isAuthenticated, loading, router]);

  // Show loading spinner while checking authentication status
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.light.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.light.background,
  },
});
