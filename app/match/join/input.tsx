import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../../components/core/Button';
import { Card } from '../../../components/core/Card';
import { useTheme } from '../../../hooks/ui/useTheme';
import { SPACING, TYPOGRAPHY, BORDERS } from '../../../constants/theme';

export default function JoinMatchInputScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [roomCode, setRoomCode] = useState('');

  const handleJoinMatch = () => {
    if (!roomCode.trim()) {
      Alert.alert('Error', 'Please enter a room code');
      return;
    }

    // Navigate to the join match screen with the room code
    router.push(`/match/join/${roomCode.trim()}`);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Join Match
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Enter the room code to join a match
          </Text>
        </View>

        {/* Room Code Input */}
        <Card style={styles.inputCard}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Room Code
            </Text>
            <TextInput
              style={[styles.input, { 
                color: colors.text, 
                borderColor: colors.border,
                backgroundColor: colors.surface 
              }]}
              value={roomCode}
              onChangeText={setRoomCode}
              placeholder="Enter room code (e.g., C16551)"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={10}
            />
          </View>
        </Card>

        {/* Instructions */}
        <Card style={styles.instructionsCard}>
          <View style={styles.instructionsContent}>
            <Ionicons name="information-circle" size={24} color={colors.primary} />
            <Text style={[styles.instructionsTitle, { color: colors.text }]}>
              How to get a room code:
            </Text>
            <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>
              • Ask the match host for the room code{'\n'}
              • Scan the QR code from the host's screen{'\n'}
              • Check your messages for an invite link
            </Text>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            size="large"
            onPress={handleJoinMatch}
            disabled={!roomCode.trim()}
            style={styles.joinButton}
          >
            <Ionicons name="enter" size={20} color="white" />
            <Text style={styles.buttonText}>Join Match</Text>
          </Button>

          <Button
            variant="outline"
            size="medium"
            onPress={handleBack}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
            <Text style={[styles.buttonText, { color: colors.primary }]}>Back</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
    paddingTop: SPACING.xl * 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.largeTitle,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
  },
  inputCard: {
    marginBottom: SPACING.lg,
  },
  inputContainer: {
    padding: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.callout,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: BORDERS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.title3,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    textAlign: 'center',
    letterSpacing: 2,
  },
  instructionsCard: {
    marginBottom: SPACING.xl,
  },
  instructionsContent: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  instructionsTitle: {
    fontSize: TYPOGRAPHY.sizes.callout,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  instructionsText: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    gap: SPACING.md,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.sizes.callout,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
}); 