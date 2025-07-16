// components/forms/MatchForm/MatchCreatedDisplay.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { QrCode, Copy, Share2, Users, Settings } from 'lucide-react-native';
import { Button } from '../../core/Button/Button';
import { Card } from '../../core/Card/Card';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { BUTTON_LABELS, SUCCESS_MESSAGES } from '../../../constants/messages';
import type { Match } from '../../../types/models';

interface MatchCreatedDisplayProps {
  match: Match;
  roomCode: string;
  qrCodeData: string;
  onCopyRoomCode: () => Promise<boolean>;
  onShareMatch: () => Promise<void>;
  onCreateAnother: () => void;
  onGoToMatch: () => void;
}

/**
 * Match Created Success Display
 *
 * Shows the successfully created match with QR code,
 * sharing options, and navigation actions.
 */
const MatchCreatedDisplay: React.FC<MatchCreatedDisplayProps> = ({
  match,
  roomCode,
  qrCodeData,
  onCopyRoomCode,
  onShareMatch,
  onCreateAnother,
  onGoToMatch,
}) => {
  const handleCopyRoomCode = async () => {
    const success = await onCopyRoomCode();
    if (success) {
      Alert.alert('Copied!', 'Room code copied to clipboard');
    } else {
      Alert.alert('Error', 'Failed to copy room code');
    }
  };

  return (
    <View style={styles.container}>
      {/* Success Header */}
      <View style={styles.header}>
        <Text style={styles.successTitle}>🎉 Match Created!</Text>
        <Text style={styles.successSubtitle}>
          Share the room code or QR code with your friends
        </Text>
      </View>

      {/* Match Info Card */}
      <Card style={styles.matchCard}>
        <Text style={styles.matchTitle}>{match.title}</Text>
        {match.description && (
          <Text style={styles.matchDescription}>{match.description}</Text>
        )}

        <View style={styles.matchDetails}>
          <View style={styles.detailRow}>
            <Users size={16} color={COLORS.light.textSecondary} />
            <Text style={styles.detailText}>4 players (2 teams of 2)</Text>
          </View>
          <View style={styles.detailRow}>
            <Settings size={16} color={COLORS.light.textSecondary} />
            <Text style={styles.detailText}>
              Score to {match.settings.scoreLimit} •
              {match.settings.winByTwo ? ' Win by 2 • ' : ' '}
              Sink worth {match.settings.sinkPoints} pts
            </Text>
          </View>
        </View>
      </Card>

      {/* Room Code Section */}
      <Card style={styles.roomCodeCard}>
        <Text style={styles.roomCodeLabel}>Room Code</Text>
        <View style={styles.roomCodeContainer}>
          <Text style={styles.roomCodeText}>{roomCode}</Text>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={handleCopyRoomCode}
          >
            <Copy size={20} color={COLORS.light.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.roomCodeHint}>
          Friends can join by entering this code in the app
        </Text>
      </Card>

      {/* QR Code Section */}
      <Card style={styles.qrCodeCard}>
        <Text style={styles.qrCodeLabel}>QR Code</Text>

        {/* TODO: Replace with actual QR code component */}
        <View style={styles.qrCodePlaceholder}>
          <QrCode size={120} color={COLORS.light.text} />
          <Text style={styles.qrCodePlaceholderText}>
            QR Code will display here
          </Text>
          <Text style={styles.qrCodeData}>{qrCodeData}</Text>
        </View>

        <Text style={styles.qrCodeHint}>
          Friends can scan this QR code to join instantly
        </Text>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          variant="outline"
          size="large"
          onPress={onShareMatch}
          icon={<Share2 size={20} color={COLORS.light.primary} />}
          style={styles.shareButton}
        >
          Share Match
        </Button>

        <Button
          variant="primary"
          size="large"
          onPress={onGoToMatch}
          style={styles.goToMatchButton}
        >
          Go to Match
        </Button>
      </View>

      {/* Create Another Button */}
      <TouchableOpacity
        style={styles.createAnotherButton}
        onPress={onCreateAnother}
      >
        <Text style={styles.createAnotherText}>Create Another Match</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  successTitle: {
    fontSize: TYPOGRAPHY.sizes.xxxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.light.success,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.light.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  matchCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  matchTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.light.text,
    marginBottom: SPACING.xs,
  },
  matchDescription: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.light.textSecondary,
    marginBottom: SPACING.md,
  },
  matchDetails: {
    gap: SPACING.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  detailText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.light.textSecondary,
  },
  roomCodeCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  roomCodeLabel: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.light.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  roomCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.light.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.light.primary + '20',
    marginBottom: SPACING.sm,
  },
  roomCodeText: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.light.primary,
    letterSpacing: 2,
    marginRight: SPACING.md,
  },
  copyButton: {
    padding: SPACING.xs,
  },
  roomCodeHint: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.light.textSecondary,
    textAlign: 'center',
  },
  qrCodeCard: {
    marginBottom: SPACING.xl,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  qrCodeLabel: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.light.text,
    marginBottom: SPACING.md,
  },
  qrCodePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.light.surface,
    padding: SPACING.xl,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.light.border,
    marginBottom: SPACING.sm,
    minHeight: 180,
  },
  qrCodePlaceholderText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.light.textSecondary,
    marginTop: SPACING.sm,
  },
  qrCodeData: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.light.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  qrCodeHint: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.light.textSecondary,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  shareButton: {
    flex: 1,
  },
  goToMatchButton: {
    flex: 2,
  },
  createAnotherButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  createAnotherText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.light.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});

export default MatchCreatedDisplay;
