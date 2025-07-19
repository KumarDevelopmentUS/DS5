import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function JoinPage() {
  const { code } = useLocalSearchParams<{ code: string }>();

  const handleOpenApp = () => {
    // Try to open the DieStats app
    const appUrl = `exp://10.0.0.195:8081/match/join/${code}`;
    Linking.openURL(appUrl).catch(() => {
      // If that fails, show instructions
      alert('Please open the DieStats app and enter the room code manually.');
    });
  };

  const copyToClipboard = async () => {
    if (code) {
      try {
        await navigator.clipboard.writeText(code);
        alert('Room code copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>🎯</Text>
          <Text style={styles.logoTitle}>DieStats</Text>
        </View>
        
        <Text style={styles.title}>Join Match</Text>
        <Text style={styles.subtitle}>Use this room code to join the match</Text>
        
        <View style={styles.roomCodeContainer}>
          <Text style={styles.roomCodeLabel}>Room Code:</Text>
          <Text style={styles.roomCode}>{code || 'No code found'}</Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleOpenApp}>
            <Ionicons name="phone-portrait" size={20} color="white" />
            <Text style={styles.primaryButtonText}>Open DieStats App</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={copyToClipboard}>
            <Ionicons name="copy" size={20} color="#667eea" />
            <Text style={styles.secondaryButtonText}>Copy Room Code</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>How to join:</Text>
          <Text style={styles.instruction}>1. Open the DieStats app on your phone</Text>
          <Text style={styles.instruction}>2. Go to "Join Match" section</Text>
          <Text style={styles.instruction}>3. Enter the room code above</Text>
          <Text style={styles.instruction}>4. Select your player position</Text>
          <Text style={styles.instruction}>5. Start playing!</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 400,
    alignSelf: 'center',
  },
  logo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 48,
    marginBottom: 10,
  },
  logoTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#667eea',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  roomCodeContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roomCodeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  roomCode: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#667eea',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#667eea',
  },
  secondaryButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
}); 