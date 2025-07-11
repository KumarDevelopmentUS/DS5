import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen } from '../../components/Layout/Screen';
import { useAuth } from '../../hooks/auth/useAuth';
import { Button } from '../../components/core/Button';

/**
 * Home Screen
 *
 * The main landing screen for authenticated users. It currently displays a
 * welcome message and a logout button to test the authentication flow.
 */
const HomeScreen = () => {
  const { user, signOut } = useAuth();

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome Home!</Text>
        {user && (
          <Text style={styles.emailText}>
            You are logged in as: {user.email}
          </Text>
        )}
        <View style={styles.buttonContainer}>
          <Button onPress={signOut}>
            <Text>Log Out</Text>
          </Button>
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
    marginBottom: 40,
  },
  buttonContainer: {
    width: '80%',
  },
});

export default HomeScreen;
