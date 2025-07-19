// components/match/Tracker/TrackerHeader.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TrackerHeaderProps } from '../../../types/tracker';
import { RoomCodeDisplay } from '../../ui/RoomCodeDisplay';
import { QRCodeDisplay } from '../../ui/QRCodeDisplay';
import { Modal } from '../../core/Modal';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  SPACING,
  TYPOGRAPHY,
  BORDERS,
  SHADOWS,
} from '../../../constants/theme';
import * as Clipboard from 'expo-clipboard';

/**
 * Tracker Header Component
 * 
 * Displays match information, room code, QR code, and sharing functionality.
 * Handles match status display and connection indicators.
 */
export const TrackerHeader: React.FC<TrackerHeaderProps> = ({
  match,
  isConnected,
  style,
  testID = 'tracker-header',
  onHostJoin,
  isHost,
  isUserParticipant,
}) => {
  const { colors } = useTheme();
  const [showRoomCode, setShowRoomCode] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showHostJoin, setShowHostJoin] = useState(false);

  // Generate shareable URL for QR code
  const generateShareableUrl = (): string => {
    // Use the new room code-based URL structure for cleaner sharing
    return `http://localhost:3000/match/join/code/${match.roomCode}`;
  };

  // Handle room code copy
  const handleCopyRoomCode = async (): Promise<boolean> => {
    try {
      await Clipboard.setStringAsync(match.roomCode);
      return true;
    } catch (error) {
      console.error('Failed to copy room code:', error);
      return false;
    }
  };

  // Handle URL copy for QR code
  const handleCopyUrl = async (): Promise<boolean> => {
    try {
      const url = generateShareableUrl();
      await Clipboard.setStringAsync(url);
      return true;
    } catch (error) {
      console.error('Failed to copy URL:', error);
      return false;
    }
  };

  // Get status display info
  const getStatusInfo = () => {
    switch (match.status) {
      case 'pending':
        return {
          text: 'Waiting to Start',
          color: colors.warning,
          icon: 'time' as const,
        };
      case 'active':
        return {
          text: 'Live',
          color: colors.success,
          icon: 'radio' as const,
        };
      case 'paused':
        return {
          text: 'Paused',
          color: colors.warning,
          icon: 'pause' as const,
        };
      case 'completed':
        return {
          text: 'Final',
          color: colors.textSecondary,
          icon: 'checkmark-circle' as const,
        };
      case 'abandoned':
        return {
          text: 'Abandoned',
          color: colors.error,
          icon: 'close-circle' as const,
        };
      default:
        return {
          text: match.status,
          color: colors.textSecondary,
          icon: 'help' as const,
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <View
      style={[styles.container, { backgroundColor: colors.surface }, style]}
      testID={testID}
    >
      {/* Match Title and Status */}
      <View style={styles.titleSection}>
        <Text
          style={[styles.matchTitle, { color: colors.text }]}
          numberOfLines={1}
        >
          {match.title}
        </Text>

        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: statusInfo.color },
            ]}
          />
          <Ionicons name={statusInfo.icon} size={16} color={statusInfo.color} />
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.text}
          </Text>

          {/* Connection indicator */}
          <View
            style={[
              styles.connectionIndicator,
              { backgroundColor: isConnected ? colors.success : colors.error },
            ]}
          />
        </View>
      </View>

      {/* Match Info, Game Rules, and QR Code - Combined Section */}
      <View style={styles.infoSection}>
        {/* Left side: Description and Location */}
        <View style={styles.leftInfo}>
          {match.description && (
            <Text
              style={[styles.description, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {match.description}
            </Text>
          )}

          {match.location && (
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={16} color={colors.textSecondary} />
              <Text
                style={[styles.location, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {match.location}
              </Text>
            </View>
          )}
        </View>

        {/* Center: Game Rules */}
        <View style={styles.gameRulesContainer}>
          <Text style={[styles.gameRulesTitle, { color: colors.text }]}>
            Game Rules
          </Text>
          <View style={styles.gameRulesRow}>
            <View style={styles.gameRuleItem}>
              <Ionicons name="trophy" size={16} color={colors.primary} />
              <Text style={[styles.gameRuleText, { color: colors.textSecondary }]}>
                First to {match.settings.scoreLimit}
              </Text>
            </View>
            <View style={styles.gameRuleItem}>
              <Ionicons name="water" size={16} color={colors.primary} />
              <Text style={[styles.gameRuleText, { color: colors.textSecondary }]}>
                Sink = {match.settings.sinkPoints} pts
              </Text>
            </View>
            {match.settings.winByTwo && (
              <View style={styles.gameRuleItem}>
                <Ionicons name="arrow-up" size={16} color={colors.primary} />
                <Text style={[styles.gameRuleText, { color: colors.textSecondary }]}>
                  Win by 2
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Room Code, QR Code, and Host Join Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: colors.primary + '20' },
          ]}
          onPress={() => setShowRoomCode(true)}
          testID={`${testID}-room-code-button`}
        >
          <Ionicons name="key" size={18} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>
            {match.roomCode}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: colors.primary + '20' },
          ]}
          onPress={() => setShowQRCode(true)}
          testID={`${testID}-qr-code-button`}
        >
          <Ionicons name="qr-code" size={18} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>
            QR Code
          </Text>
        </TouchableOpacity>

        {/* Host Join Button - Only show if user is host and not already a participant */}
        {isHost && !isUserParticipant && onHostJoin && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.success + '20' },
            ]}
            onPress={() => setShowHostJoin(true)}
            testID={`${testID}-host-join-button`}
          >
            <Ionicons name="person-add" size={18} color={colors.success} />
            <Text style={[styles.actionText, { color: colors.success }]}>
              Join Match
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Room Code Modal */}
      <Modal
        visible={showRoomCode}
        onClose={() => setShowRoomCode(false)}
        title="Share Room Code"
        size="medium"
        testID={`${testID}-room-code-modal`}
      >
        <RoomCodeDisplay
          roomCode={match.roomCode}
          matchTitle={match.title}
          onCopy={handleCopyRoomCode}
        />
      </Modal>

      {/* QR Code Modal */}
      <Modal
        visible={showQRCode}
        onClose={() => setShowQRCode(false)}
        title="QR Code"
        size="medium"
        testID={`${testID}-qr-code-modal`}
      >
        <View style={styles.qrModalContent}>
          <Text
            style={[styles.qrInstructions, { color: colors.textSecondary }]}
          >
            Scan this QR code with your camera app to join the match:
          </Text>

          <View style={styles.qrContainer}>
            <QRCodeDisplay
              value={generateShareableUrl()}
              size={200}
              testID={`${testID}-qr-code`}
            />
          </View>

          <TouchableOpacity
            style={[styles.copyUrlButton, { backgroundColor: colors.primary }]}
            onPress={handleCopyUrl}
            testID={`${testID}-copy-url-button`}
          >
            <Ionicons name="link" size={16} color={colors.background} />
            <Text style={[styles.copyUrlText, { color: colors.background }]}>
              Copy Link
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Host Join Modal */}
      <Modal
        visible={showHostJoin}
        onClose={() => setShowHostJoin(false)}
        title="Join as Player"
        size="medium"
        testID={`${testID}-host-join-modal`}
      >
        <View style={styles.hostJoinModalContent}>
          <Text
            style={[styles.hostJoinInstructions, { color: colors.textSecondary }]}
          >
            Select which team and position you'd like to join:
          </Text>

          <View style={styles.teamSelectionContainer}>
            {/* Team 1 */}
            <View style={styles.teamSection}>
              <Text style={[styles.teamTitle, { color: colors.text }]}>
                {match.settings.teamNames.team1}
              </Text>
              <View style={styles.playerSlots}>
                <TouchableOpacity
                  style={[styles.playerSlot, { borderColor: colors.primary }]}
                  onPress={async () => {
                    try {
                      const success = await onHostJoin?.('team1', 1);
                      if (!success) {
                        console.error('Failed to join as host in position 1');
                      }
                    } catch (error) {
                      console.error('Error joining as host:', error);
                    }
                    setShowHostJoin(false);
                  }}
                >
                  <Text style={[styles.playerSlotText, { color: colors.primary }]}>
                    {match.settings.playerNames.player1}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.playerSlot, { borderColor: colors.primary }]}
                  onPress={async () => {
                    try {
                      const success = await onHostJoin?.('team1', 2);
                      if (!success) {
                        console.error('Failed to join as host in position 2');
                      }
                    } catch (error) {
                      console.error('Error joining as host:', error);
                    }
                    setShowHostJoin(false);
                  }}
                >
                  <Text style={[styles.playerSlotText, { color: colors.primary }]}>
                    {match.settings.playerNames.player2}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Team 2 */}
            <View style={styles.teamSection}>
              <Text style={[styles.teamTitle, { color: colors.text }]}>
                {match.settings.teamNames.team2}
              </Text>
              <View style={styles.playerSlots}>
                <TouchableOpacity
                  style={[styles.playerSlot, { borderColor: colors.primary }]}
                  onPress={async () => {
                    try {
                      const success = await onHostJoin?.('team2', 3);
                      if (!success) {
                        console.error('Failed to join as host in position 3');
                      }
                    } catch (error) {
                      console.error('Error joining as host:', error);
                    }
                    setShowHostJoin(false);
                  }}
                >
                  <Text style={[styles.playerSlotText, { color: colors.primary }]}>
                    {match.settings.playerNames.player3}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.playerSlot, { borderColor: colors.primary }]}
                  onPress={async () => {
                    try {
                      const success = await onHostJoin?.('team2', 4);
                      if (!success) {
                        console.error('Failed to join as host in position 4');
                      }
                    } catch (error) {
                      console.error('Error joining as host:', error);
                    }
                    setShowHostJoin(false);
                  }}
                >
                  <Text style={[styles.playerSlotText, { color: colors.primary }]}>
                    {match.settings.playerNames.player4}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    borderRadius: BORDERS.lg,
    marginHorizontal: SPACING.sm,
    marginTop: SPACING.xl * 2,
    marginBottom: SPACING.xs,
    ...SHADOWS.sm,
  },
  titleSection: {
    marginBottom: SPACING.sm,
  },
  matchTitle: {
    fontSize: TYPOGRAPHY.sizes.title2,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    marginBottom: SPACING.xs,
    lineHeight: TYPOGRAPHY.sizes.title2 * 1.2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    textTransform: 'uppercase',
  },
  connectionIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: SPACING.sm,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDERS.md,
    gap: SPACING.xs,
  },
  actionText: {
    fontSize: TYPOGRAPHY.sizes.callout,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginBottom: 4,
    lineHeight: TYPOGRAPHY.sizes.footnote * 1.3,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  location: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    flex: 1,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  leftInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  gameRulesContainer: {
    flex: 0,
    minWidth: 120,
    marginRight: SPACING.sm,
  },
  gameRulesTitle: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gameRulesRow: {
    flexDirection: 'column',
    gap: 2,
  },
  gameRuleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gameRuleText: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },

  qrModalContent: {
    alignItems: 'center',
    padding: SPACING.md,
  },
  qrInstructions: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  qrContainer: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  copyUrlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDERS.sm,
    gap: SPACING.xs,
  },
  copyUrlText: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  roomCodeText: {
    fontSize: TYPOGRAPHY.sizes.largeTitle,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    textAlign: 'center',
    letterSpacing: 2,
  },
  hostJoinModalContent: {
    padding: SPACING.md,
  },
  hostJoinInstructions: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: TYPOGRAPHY.sizes.body * 1.4,
  },
  teamSelectionContainer: {
    gap: SPACING.lg,
  },
  teamSection: {
    gap: SPACING.sm,
  },
  teamTitle: {
    fontSize: TYPOGRAPHY.sizes.headline,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    textAlign: 'center',
  },
  playerSlots: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  playerSlot: {
    flex: 1,
    borderWidth: 2,
    borderRadius: BORDERS.md,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerSlotText: {
    fontSize: TYPOGRAPHY.sizes.callout,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    textAlign: 'center',
  },
});

export default TrackerHeader;
