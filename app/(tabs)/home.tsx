import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen } from '../../components/Layout/Screen';
import { useAuth } from '../../hooks/auth/useAuth';
import { Button } from '../../components/core/Button';
import * as Sentry from '@sentry/react-native';

/**
 * Home Screen
 *
 * The main landing screen for authenticated users. It currently displays a
 * welcome message and a logout button to test the authentication flow.
 */
const HomeScreen = () => {
  const { user, signOut } = useAuth();

  const testSentryError = () => {
    Sentry.captureException(new Error('First error'));
  };

  const testSentryMessage = () => {
    Sentry.captureMessage('Test message from home screen', 'info');
  };

  const testSentryUserContext = () => {
    // Set user context for better error tracking
    Sentry.setUser({
      id: user?.id,
      email: user?.email,
    });
    Sentry.captureException(new Error('Error with user context'));
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
    marginBottom: 30,
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
