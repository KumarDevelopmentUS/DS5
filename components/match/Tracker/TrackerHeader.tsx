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
 * Displays match title, status, room code, and QR code
 * Handles sharing and copying functionality
 */
export const TrackerHeader: React.FC<TrackerHeaderProps> = ({
  match,
  isConnected,
  style,
  testID = 'tracker-header',
}) => {
  const { colors } = useTheme();
  const [showRoomCode, setShowRoomCode] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  // Generate shareable URL for QR code
  const generateShareableUrl = (): string => {
    // TODO: Replace with your app's deep link domain
    const baseUrl = 'https://diestats.app/join/';
    return `${baseUrl}${match.roomCode}`;
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

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {/* Room Code Button */}
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

        {/* QR Code Button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: colors.primary + '20' },
          ]}
          onPress={() => setShowQRCode(true)}
          testID={`${testID}-qr-code-button`}
        >
          <Ionicons name="qr-code" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Match Info */}
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

      {/* Game Rules */}
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
            Scan this QR code to join the match instantly:
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    borderRadius: BORDERS.md,
    marginHorizontal: SPACING.sm,
    marginVertical: SPACING.xs,
    ...SHADOWS.sm,
  },
  titleSection: {
    marginBottom: SPACING.sm,
  },
  matchTitle: {
    fontSize: TYPOGRAPHY.sizes.title3,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    marginBottom: SPACING.xs,
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
    marginBottom: SPACING.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDERS.sm,
    gap: SPACING.xs,
  },
  actionText: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    letterSpacing: 1,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginBottom: SPACING.xs,
    lineHeight: TYPOGRAPHY.sizes.footnote * 1.4,
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
  gameRulesContainer: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)', // Light border
  },
  gameRulesTitle: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gameRulesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  gameRuleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  gameRuleText: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
});

export default TrackerHeader;
