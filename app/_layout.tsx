import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { MatchProvider } from '../contexts/MatchContext';
import { OfflineProvider } from '../contexts/OfflineContext';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Sentry imports
import * as Sentry from '@sentry/react-native';
import { ERROR_MONITORING_CONFIG } from '../constants/config';

// Initialize Sentry before anything else
if (ERROR_MONITORING_CONFIG.ENABLED || ERROR_MONITORING_CONFIG.ENABLE_IN_DEV) {
  Sentry.init({
    dsn: ERROR_MONITORING_CONFIG.SENTRY_DSN,
    debug: ERROR_MONITORING_CONFIG.DEBUG,
    environment: ERROR_MONITORING_CONFIG.ENVIRONMENT,
    release: ERROR_MONITORING_CONFIG.RELEASE,

    // Performance monitoring
    tracesSampleRate: ERROR_MONITORING_CONFIG.TRACES_SAMPLE_RATE,
    profilesSampleRate: ERROR_MONITORING_CONFIG.PROFILES_SAMPLE_RATE,
    enableAutoPerformanceTracing:
      ERROR_MONITORING_CONFIG.ENABLE_AUTO_PERFORMANCE_TRACING,
    enableUserInteractionTracing:
      ERROR_MONITORING_CONFIG.ENABLE_USER_INTERACTION_TRACING,

    // Session tracking
    autoSessionTracking: ERROR_MONITORING_CONFIG.AUTO_SESSION_TRACKING,
    enableNativeCrashHandling: ERROR_MONITORING_CONFIG.ENABLE_NATIVE_CRASHES,

    // Integrations
    integrations: [
      // Expo Router integration
      new Sentry.ReactNavigationInstrumentation(),
    ],

    // Filter out noisy errors
    beforeSend(event, hint) {
      // Don't send network errors in development
      if (ERROR_MONITORING_CONFIG.ENVIRONMENT === 'development') {
        const error = hint.originalException;
        if (
          error &&
          (error as any).message?.includes('Network request failed')
        ) {
          return null;
        }
      }

      return event;
    },

    // Additional context
    initialScope: {
      tags: {
        platform: 'react-native',
        expo: true,
      },
    },
  });
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
    'Inter-Black': require('../assets/fonts/Inter-Black.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <OfflineProvider>
            <NotificationProvider>
              <MatchProvider>
                <Stack screenOptions={{ headerShown: false }} />
              </MatchProvider>
            </NotificationProvider>
          </OfflineProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Wrap the root layout with Sentry for automatic error catching and performance monitoring
export default ERROR_MONITORING_CONFIG.ENABLED ||
ERROR_MONITORING_CONFIG.ENABLE_IN_DEV
  ? Sentry.wrap(RootLayout)
  : RootLayout;
