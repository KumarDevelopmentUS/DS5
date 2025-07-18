// components/ui/RoomCodeDisplay.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RoomCodeDisplayProps } from '../../types/tracker';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, TYPOGRAPHY, BORDERS } from '../../constants/theme';

/**
 * Room Code Display Component
 *
 * Shows the match room code with copy functionality
 * Includes visual feedback for copy actions
 */
export const RoomCodeDisplay: React.FC<RoomCodeDisplayProps> = ({
  roomCode,
  matchTitle,
  onCopy,
  style,
  testID = 'room-code-display',
}) => {
  const { colors } = useTheme();
  const [isCopying, setIsCopying] = useState(false);
  const [lastCopied, setLastCopied] = useState<Date | null>(null);

  const handleCopy = async () => {
    if (isCopying) return;

    setIsCopying(true);
    try {
      const success = await onCopy();
      if (success) {
        setLastCopied(new Date());
        Alert.alert('Copied!', `Room code ${roomCode} copied to clipboard`, [
          { text: 'OK' },
        ]);
      } else {
        Alert.alert(
          'Copy Failed',
          'Unable to copy room code. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to copy room code.', [{ text: 'OK' }]);
    } finally {
      setIsCopying(false);
    }
  };

  const recentlyCopied = lastCopied && Date.now() - lastCopied.getTime() < 3000;

  return (
    <View style={[styles.container, style]} testID={testID}>
      {/* Title */}
      <Text style={[styles.title, { color: colors.text }]}>
        Join "{matchTitle}"
      </Text>

      {/* Instructions */}
      <Text style={[styles.instructions, { color: colors.textSecondary }]}>
        Share this code with friends to join:
      </Text>

      {/* Room Code Display */}
      <View
        style={[
          styles.codeContainer,
          {
            backgroundColor: colors.surface,
            borderColor: recentlyCopied ? colors.success : colors.border,
          },
        ]}
      >
        <Text style={[styles.roomCode, { color: colors.primary }]}>
          {roomCode}
        </Text>

        <TouchableOpacity
          style={[
            styles.copyButton,
            {
              backgroundColor: recentlyCopied
                ? colors.success
                : colors.primary + '20',
            },
          ]}
          onPress={handleCopy}
          disabled={isCopying}
          testID={`${testID}-copy-button`}
        >
          {isCopying ? (
            <Ionicons name="hourglass" size={20} color={colors.primary} />
          ) : recentlyCopied ? (
            <Ionicons name="checkmark" size={20} color={colors.background} />
          ) : (
            <Ionicons name="copy" size={20} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Helper Text */}
      <Text style={[styles.helperText, { color: colors.textSecondary }]}>
        {recentlyCopied
          ? 'Copied to clipboard!'
          : 'Tap the copy button to share'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.callout,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  instructions: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDERS.lg,
    borderWidth: 2,
    marginBottom: SPACING.sm,
    minWidth: 200,
  },
  roomCode: {
    fontSize: TYPOGRAPHY.sizes.title2,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    letterSpacing: 3,
    marginRight: SPACING.md,
  },
  copyButton: {
    padding: SPACING.sm,
    borderRadius: BORDERS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperText: {
    fontSize: TYPOGRAPHY.sizes.caption1,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
  },
});

export default RoomCodeDisplay;
