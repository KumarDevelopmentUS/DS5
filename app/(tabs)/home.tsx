import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen } from '../../components/Layout/Screen';
import { useAuth } from '../../hooks/auth/useAuth';
import { Button } from '../../components/core/Button';
import * as Sentry from '@sentry/react-native';
import { ERROR_MONITORING_CONFIG } from '../../constants/config';

/**
 * Home Screen
 *
 * The main landing screen for authenticated users. It currently displays a
 * welcome message and a logout button to test the authentication flow.
 */
const HomeScreen = () => {
  const { user, signOut } = useAuth();

  // Debug Sentry setup on component mount
  useEffect(() => {
    console.log('=== SENTRY DEBUG INFO ===');
    console.log('Sentry available:', !!Sentry);
    console.log('Sentry DSN configured:', !!ERROR_MONITORING_CONFIG.SENTRY_DSN);
    console.log('Sentry enabled:', ERROR_MONITORING_CONFIG.ENABLED);
    console.log('Sentry dev mode:', ERROR_MONITORING_CONFIG.ENABLE_IN_DEV);
    console.log('Environment:', ERROR_MONITORING_CONFIG.ENVIRONMENT);

    // Test if Sentry is actually working
    try {
      Sentry.captureMessage('Sentry initialization test', 'debug');
      console.log('✅ Sentry test message sent successfully');
    } catch (error) {
      console.error('❌ Sentry test failed:', error);
    }
    console.log('========================');
  }, []);

  const testSentryError = () => {
    console.log('🚨 Testing Sentry error...');
    try {
      Sentry.captureException(new Error('First error'));
      console.log('✅ Error sent to Sentry successfully');
    } catch (error) {
      console.error('❌ Failed to send error to Sentry:', error);
    }
  };

  const testSentryMessage = () => {
    console.log('📝 Testing Sentry message...');
    try {
      Sentry.captureMessage('Test message from home screen', 'info');
      console.log('✅ Message sent to Sentry successfully');
    } catch (error) {
      console.error('❌ Failed to send message to Sentry:', error);
    }
  };

  const testSentryUserContext = () => {
    console.log('👤 Testing Sentry with user context...');
    try {
      // Set user context for better error tracking
      Sentry.setUser({
        id: user?.id,
        email: user?.email,
      });
      Sentry.captureException(new Error('Error with user context'));
      console.log('✅ Error with user context sent to Sentry successfully');
    } catch (error) {
      console.error(
        '❌ Failed to send error with user context to Sentry:',
        error
      );
    }
  };

  const testCriticalError = () => {
    console.log('💥 Testing critical error...');
    try {
      Sentry.captureException(new Error('Critical test error'), {
        level: 'fatal',
        tags: {
          section: 'home_screen',
          test: 'critical_error',
        },
        extra: {
          user_id: user?.id,
          timestamp: new Date().toISOString(),
        },
      });
      console.log('✅ Critical error sent to Sentry successfully');
    } catch (error) {
      console.error('❌ Failed to send critical error to Sentry:', error);
    }
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome Home!</Text>
        {user && (
          <Text style={styles.emailText}>
            You are logged in as: {user.email}
          </Text>
        )}

        {/* Sentry Configuration Info */}
        <View style={styles.configSection}>
          <Text style={styles.sectionTitle}>🔧 Sentry Config</Text>
          <Text style={styles.configText}>
            Enabled: {ERROR_MONITORING_CONFIG.ENABLED ? '✅' : '❌'}
          </Text>
          <Text style={styles.configText}>
            Dev Mode: {ERROR_MONITORING_CONFIG.ENABLE_IN_DEV ? '✅' : '❌'}
          </Text>
          <Text style={styles.configText}>
            DSN: {ERROR_MONITORING_CONFIG.SENTRY_DSN ? '✅ Set' : '❌ Missing'}
          </Text>
          <Text style={styles.configText}>
            Environment: {ERROR_MONITORING_CONFIG.ENVIRONMENT}
          </Text>
        </View>

        {/* Sentry Test Section */}
        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>🚨 Sentry Testing</Text>

          <View style={styles.buttonContainer}>
            <Button onPress={testSentryError}>
              <Text>Try! (Test Error)</Text>
            </Button>
          </View>

          <View style={styles.buttonContainer}>
            <Button onPress={testSentryMessage}>
              <Text>Test Message</Text>
            </Button>
          </View>

          <View style={styles.buttonContainer}>
            <Button onPress={testSentryUserContext}>
              <Text>Test with User Context</Text>
            </Button>
          </View>

          <View style={styles.buttonContainer}>
            <Button onPress={testCriticalError}>
              <Text>Test Critical Error</Text>
            </Button>
          </View>
        </View>

        {/* Auth Section */}
        <View style={styles.authSection}>
          <Text style={styles.sectionTitle}>🔐 Authentication</Text>
          <View style={styles.buttonContainer}>
            <Button onPress={signOut}>
              <Text>Log Out</Text>
            </Button>
          </View>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  emailText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  configSection: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
  },
  configText: {
    fontSize: 12,
    color: '#333',
    marginBottom: 5,
  },
  testSection: {
    width: '100%',
    marginBottom: 30,
    alignItems: 'center',
  },
  authSection: {
    width: '100%',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '80%',
    marginBottom: 10,
  },
});

export default HomeScreen;
