// components/debug/DatabaseTest.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { EnhancedMatchService } from '../../services/match/enhancedMatchService';
import { useAuth } from '../../hooks/auth/useAuth';
import { useTheme } from '../../hooks/ui/useTheme';

export const DatabaseTest: React.FC = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string>('');

  const testDatabaseConnection = async () => {
    setIsTesting(true);
    setTestResult('Testing...');

    try {
      console.log('Testing database connection...');
      console.log('Environment variables:', {
        SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
        HAS_ANON_KEY: !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
      });
      
      const result = await EnhancedMatchService.testDatabaseConnection();
      
      if (result.success) {
        setTestResult(`✅ Database connection successful!\nUser: ${result.data?.user?.id}\nTables: ${result.data?.tables.join(', ')}`);
      } else {
        setTestResult(`❌ Database connection failed: ${result.error?.message}`);
      }
    } catch (error) {
      console.error('Database test error:', error);
      setTestResult(`❌ Test error: ${error}`);
    } finally {
      setIsTesting(false);
    }
  };

  const testMatchCreation = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to test match creation');
      return;
    }

    setIsTesting(true);
    setTestResult('Creating test match...');

    try {
      const testData = {
        title: 'Test Match',
        description: 'Test Description',
        gameType: 'die_stats',
        location: 'Test Location',
        isPublic: true,
        settings: {
          scoreLimit: 11,
          winByTwo: true,
          sinkPoints: 3 as 3 | 5,
          teamNames: {
            team1: 'Team 1',
            team2: 'Team 2',
          },
          playerNames: {
            player1: 'Player 1',
            player2: 'Player 2',
            player3: 'Player 3',
            player4: 'Player 4',
          },
          enableSpectators: true,
          trackAdvancedStats: true,
        },
      };

      const result = await EnhancedMatchService.createMatch(testData, user.id);
      
      if (result.success) {
        setTestResult(`✅ Match created successfully!\nMatch ID: ${result.data?.id}\nRoom Code: ${result.data?.roomCode}`);
      } else {
        setTestResult(`❌ Match creation failed: ${result.error?.message}`);
      }
    } catch (error) {
      setTestResult(`❌ Match creation error: ${error}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Database Test</Text>
      
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={testDatabaseConnection}
        disabled={isTesting}
      >
        <Text style={styles.buttonText}>
          {isTesting ? 'Testing...' : 'Test Database Connection'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.secondary }]}
        onPress={testMatchCreation}
        disabled={isTesting || !user}
      >
        <Text style={styles.buttonText}>
          {isTesting ? 'Creating...' : 'Test Match Creation'}
        </Text>
      </TouchableOpacity>

      {testResult ? (
        <View style={[styles.resultContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.resultText, { color: colors.text }]}>{testResult}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 