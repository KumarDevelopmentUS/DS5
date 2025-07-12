import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { MatchProvider } from '../contexts/MatchContext';
import { OfflineProvider } from '../contexts/OfflineContext';
import { AuthNavigationWrapper } from '../components/auth/AuthNavigationWrapper';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// Sentry imports
import * as Sentry from '@sentry/react-native';
import { ERROR_MONITORING_CONFIG } from '../constants/config';
import { COLORS } from '../constants/theme';

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
      Sentry.reactNavigationIntegration(),
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

      // Filter out common React Native development warnings
      if (ERROR_MONITORING_CONFIG.ENVIRONMENT === 'development') {
        const message = event.message || '';
        const ignoredMessages = [
          'Warning:',
          'VirtualizedList:',
          'componentWillReceiveProps',
          'componentWillMount',
        ];

        if (ignoredMessages.some((ignored) => message.includes(ignored))) {
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
        environment: ERROR_MONITORING_CONFIG.ENVIRONMENT,
      },
      contexts: {
        app: {
          name: 'DieStats',
          version: ERROR_MONITORING_CONFIG.RELEASE,
        },
      },
    },
  });
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Configure React Query with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on authentication errors
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        // Don't retry on client errors (400-499)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false, // Disable for mobile
      refetchOnReconnect: true, // Re-fetch when network reconnects
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry mutations on client errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry once for server errors
        return failureCount < 1;
      },
    },
  },
});

// Splash Screen Fallback Component
const SplashScreenFallback: React.FC = () => {
  return (
    <View style={styles.splashContainer}>
      <ActivityIndicator
        size="large"
        color={COLORS.light.primary}
        testID="splash-loading-indicator"
      />
    </View>
  );
};

// Proper Error Boundary Component - matches Sentry's expected signature
const ErrorBoundaryFallback = ({
  error,
  resetError,
}: {
  error: unknown;
  componentStack: string;
  eventId: string;
  resetError: () => void;
}) => {
  useEffect(() => {
    // Log the error to Sentry (error is already captured by Sentry.withErrorBoundary)
    if (error instanceof Error) {
      console.error('Error boundary caught error:', error);
    }
  }, [error]);

  return (
    <View style={styles.errorContainer}>
      <ActivityIndicator size="large" color={COLORS.light.primary} />
      {/* In production, you might want to show a more user-friendly error message */}
    </View>
  );
};

// Main App Component
function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
    'Inter-Black': require('../assets/fonts/Inter-Black.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        SplashScreen.hideAsync();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [fontsLoaded, fontError]);

  // Enhanced error handling for font loading
  useEffect(() => {
    if (fontError) {
      // Log font loading error to Sentry
      Sentry.captureException(new Error('Font loading failed'), {
        tags: { category: 'font_loading' },
        extra: { fontError },
      });
    }
  }, [fontError]);

  // Show loading screen while fonts are loading
  if (!fontsLoaded && !fontError) {
    return <SplashScreenFallback />;
  }

  // Show error fallback if font loading failed (but continue with system fonts)
  if (fontError) {
    console.warn('Font loading failed, using system fonts:', fontError);
    // Continue rendering the app with system fonts
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <OfflineProvider>
            <NotificationProvider>
              <MatchProvider>
                <AuthNavigationWrapper>
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      // Global screen options
                      animation: 'slide_from_right', // Smooth transitions
                      gestureEnabled: true, // Enable swipe back gesture
                      contentStyle: { backgroundColor: 'transparent' }, // Prevent flash
                    }}
                  />
                </AuthNavigationWrapper>
              </MatchProvider>
            </NotificationProvider>
          </OfflineProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Styles
const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.light.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.light.background,
  },
});

// Create Error Boundary wrapped component
const RootLayoutWithErrorBoundary = Sentry.withErrorBoundary(RootLayout, {
  fallback: ErrorBoundaryFallback,
  beforeCapture: (scope, error, hint) => {
    scope.setTag('boundary', 'root');
    scope.setLevel('fatal');
  },
});

// Export the properly wrapped component
export default ERROR_MONITORING_CONFIG.ENABLED ||
ERROR_MONITORING_CONFIG.ENABLE_IN_DEV
  ? Sentry.wrap(RootLayoutWithErrorBoundary)
  : RootLayout;
