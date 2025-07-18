// app/match/[id]/index.tsx - FIXED VERSION
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  BackHandler,
  RefreshControl,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../hooks/auth/useAuth';
import { useMatch } from '../../../hooks/match/useMatch';
import { useTheme } from '../../../contexts/ThemeContext';
import { Scoreboard } from '../../../components/match/Scoreboard';
import { PlayLogger } from '../../../components/match/PlayLogger';
import { Button } from '../../../components/core/Button';
import { Modal } from '../../../components/core/Modal';
import { MatchStatus } from '../../../types/enums';
import { PlaySubmissionData } from '../../../components/match/PlayLogger/PlayLogger.types';
import {
  SPACING,
  TYPOGRAPHY,
  BORDERS,
  SHADOWS,
  MIXINS,
} from '../../../constants/theme';

export default function LiveMatchScreen() {
  const { id: matchId } = useLocalSearchParams<{ id: string }>();
  const { user, profile } = useAuth();
  const { colors } = useTheme();

  // State management
  const [showPlayLogger, setShowPlayLogger] = useState(false);
  const [showMatchControls, setShowMatchControls] = useState(false);
  const [showRoomCode, setShowRoomCode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  console.log('LiveMatchScreen - matchId:', matchId);
  console.log('LiveMatchScreen - user:', user?.id);

  // Match hook with real-time updates
  const {
    match,
    participants,
    events,
    currentScore,
    playerStats,
    presentPlayers,
    isConnected,
    isLoading,
    isSubmittingPlay,
    isUpdatingMatch,
    error,
    lastUpdated,
    mvpPlayer,
    submitPlay,
    undoLastPlay,
    startMatch,
    pauseMatch,
    resumeMatch,
    endMatch,
    kickPlayer,
    changePlayerTeam,
    refreshMatch,
    isUserParticipant,
    canUserControl,
    getPlayerByTeam,
    getTeamScore,
  } = useMatch(matchId!, {
    enableRealtime: true,
    includeStats: true,
    trackPresence: true,
  });

  console.log('LiveMatchScreen - match data:', {
    matchExists: !!match,
    participantsCount: participants.length,
    isUserParticipant: isUserParticipant(),
    matchStatus: match?.status,
  });

  // Map participants to use custom player names from match.settings
  const playerNames = match?.settings?.playerNames || {};
  const team1Players = participants.filter((p) => p.team === 'team1');
  const team2Players = participants.filter((p) => p.team === 'team2');
  const participantsWithCustomNames = participants.map((p, idx) => {
    let customName = p.username;
    if (p.team === 'team1') {
      if (team1Players[0] && p.userId === team1Players[0].userId) {
        customName = playerNames.player1 || p.username;
      } else if (team1Players[1] && p.userId === team1Players[1].userId) {
        customName = playerNames.player2 || p.username;
      }
    } else if (p.team === 'team2') {
      if (team2Players[0] && p.userId === team2Players[0].userId) {
        customName = playerNames.player3 || p.username;
      } else if (team2Players[1] && p.userId === team2Players[1].userId) {
        customName = playerNames.player4 || p.username;
      }
    }
    return { ...p, username: customName };
  });

  // Determine current user's team
  const currentUserTeam = useMemo(() => {
    if (!user?.id || !participants.length) {
      console.log('No user ID or participants for team determination');
      return null;
    }
    const userParticipant = participants.find((p) => p.userId === user.id);
    console.log('User participant found:', userParticipant);
    return userParticipant?.team || null;
  }, [user?.id, participants]);

  // Get team players for current user's team
  const currentTeamPlayers = useMemo(() => {
    if (!currentUserTeam) {
      console.log('No current user team, returning empty array');
      return [];
    }
    const teamPlayers = getPlayerByTeam(currentUserTeam);
    console.log('Team players for', currentUserTeam, ':', teamPlayers);
    return teamPlayers;
  }, [currentUserTeam, getPlayerByTeam]);

  // Debug logging for PlayLogger visibility
  useEffect(() => {
    console.log('PlayLogger visibility check:', {
      isParticipant: isUserParticipant(),
      matchStatus: match?.status,
      currentUserTeam,
      currentTeamPlayersCount: currentTeamPlayers.length,
      showPlayLogger,
    });
  }, [
    isUserParticipant(),
    match?.status,
    currentUserTeam,
    currentTeamPlayers.length,
    showPlayLogger,
  ]);

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      handleBackPress();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );
    return () => backHandler.remove();
  }, [match?.status]);

  // Auto-refresh when coming back from background
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isConnected) {
        refreshMatch();
      }
    }, 30000); // Refresh every 30 seconds if disconnected

    return () => clearInterval(interval);
  }, [isConnected, refreshMatch]);

  // Handle back navigation
  const handleBackPress = useCallback(() => {
    if (match?.status === MatchStatus.ACTIVE) {
      Alert.alert(
        'Leave Match',
        'The match is still active. Are you sure you want to leave?',
        [
          { text: 'Stay', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  }, [match?.status]);

  // Handle play submission
  const handleSubmitPlay = useCallback(
    async (playData: PlaySubmissionData) => {
      console.log('Submitting play:', playData);
      try {
        const success = await submitPlay(playData);
        console.log('Play submission result:', success);
        if (success) {
          setShowPlayLogger(false);
        }
      } catch (error) {
        console.error('Play submission error:', error);
        Alert.alert('Error', 'Failed to submit play. Please try again.', [
          { text: 'OK' },
        ]);
      }
    },
    [submitPlay]
  );

  // Handle undo last play
  const handleUndoPlay = useCallback(async () => {
    Alert.alert(
      'Undo Last Play',
      'Are you sure you want to undo the last play?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Undo',
          style: 'destructive',
          onPress: async () => {
            const success = await undoLastPlay();
            if (!success) {
              Alert.alert('Error', 'Failed to undo play');
            }
          },
        },
      ]
    );
  }, [undoLastPlay]);

  // Handle match control actions
  const handleStartMatch = useCallback(async () => {
    const success = await startMatch();
    if (success) {
      setShowMatchControls(false);
    }
  }, [startMatch]);

  const handlePauseMatch = useCallback(async () => {
    const success = await pauseMatch();
    if (success) {
      setShowMatchControls(false);
    }
  }, [pauseMatch]);

  const handleResumeMatch = useCallback(async () => {
    const success = await resumeMatch();
    if (success) {
      setShowMatchControls(false);
    }
  }, [resumeMatch]);

  const handleEndMatch = useCallback(async () => {
    Alert.alert(
      'End Match',
      'Are you sure you want to end this match? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Match',
          style: 'destructive',
          onPress: async () => {
            const success = await endMatch();
            if (success) {
              setShowMatchControls(false);
              // Navigate to match recap - using type assertion for dynamic route
              router.push(`/match/${matchId}/recap` as any);
            }
          },
        },
      ]
    );
  }, [endMatch, matchId]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshMatch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshMatch]);

  // Handle navigation to stats screen
  const handleViewStats = useCallback(() => {
    router.push(`/match/${matchId}/stats` as any);
  }, [matchId]);

  // Handle room code copy
  const handleCopyRoomCode = useCallback(async () => {
    if (match?.roomCode) {
      try {
        // Note: You'll need to import Clipboard from '@react-native-clipboard/clipboard'
        // For now, we'll just show an alert
        Alert.alert('Room Code', match.roomCode, [
          {
            text: 'Copy',
            onPress: () => {
              // Clipboard.setString(match.roomCode);
              Alert.alert('Copied!', 'Room code copied to clipboard');
            },
          },
          { text: 'Close' },
        ]);
      } catch (error) {
        Alert.alert('Error', 'Failed to copy room code');
      }
    }
  }, [match?.roomCode]);

  // Render loading state
  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading match...
        </Text>
      </View>
    );
  }

  // Render error state
  if (error || !match) {
    return (
      <View
        style={[styles.errorContainer, { backgroundColor: colors.background }]}
      >
        <Ionicons name="alert-circle" size={48} color={colors.error} />
        <Text style={[styles.errorTitle, { color: colors.text }]}>
          {error?.message || 'Match not found'}
        </Text>
        <Text style={[styles.errorSubtitle, { color: colors.textSecondary }]}>
          Please check your connection and try again.
        </Text>
        <Button onPress={handleRefresh} style={styles.retryButton}>
          Try Again
        </Button>
      </View>
    );
  }

  // Check if user is a participant
  const isParticipant = isUserParticipant();
  const canControl = canUserControl();

  console.log('Rendering LiveMatchScreen:', {
    isParticipant,
    canControl,
    matchStatus: match.status,
    currentUserTeam,
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Custom Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable style={styles.headerButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {match.title}
          </Text>
          <Pressable onPress={() => setShowRoomCode(!showRoomCode)}>
            <View style={styles.roomCodeHeader}>
              <Text
                style={[styles.headerSubtitle, { color: colors.textSecondary }]}
              >
                Room: {match.roomCode}
              </Text>
              <Ionicons
                name={showRoomCode ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={colors.textSecondary}
                style={{ marginLeft: 4 }}
              />
            </View>
          </Pressable>
        </View>

        <View style={styles.headerActions}>
          {/* Connection indicator */}
          <View
            style={[
              styles.connectionIndicator,
              {
                backgroundColor: isConnected ? colors.success : colors.error,
              },
            ]}
          />

          {/* Controls menu */}
          {canControl && (
            <Pressable
              style={styles.headerButton}
              onPress={() => setShowMatchControls(true)}
            >
              <Ionicons
                name="ellipsis-vertical"
                size={24}
                color={colors.text}
              />
            </Pressable>
          )}
        </View>
      </View>

      {/* Room Code Dropdown */}
      {showRoomCode && (
        <View
          style={[
            styles.roomCodeDropdown,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <View style={styles.roomCodeSection}>
            <Text style={[styles.roomCodeLabel, { color: colors.text }]}>
              Share this code with friends to join:
            </Text>
            <View style={styles.roomCodeContainer}>
              <Text style={[styles.roomCodeText, { color: colors.primary }]}>
                {match.roomCode}
              </Text>
              <Pressable
                style={[
                  styles.copyButton,
                  { backgroundColor: colors.primary + '20' },
                ]}
                onPress={handleCopyRoomCode}
              >
                <Ionicons name="copy" size={16} color={colors.primary} />
              </Pressable>
            </View>
          </View>

          {/* QR Code placeholder */}
          <View style={styles.qrCodeSection}>
            <Text style={[styles.qrCodeLabel, { color: colors.textSecondary }]}>
              QR Code (Coming Soon)
            </Text>
            <View
              style={[styles.qrCodePlaceholder, { borderColor: colors.border }]}
            >
              <Ionicons name="qr-code" size={48} color={colors.textSecondary} />
              <Text
                style={[styles.qrCodeText, { color: colors.textSecondary }]}
              >
                QR Code will be displayed here
              </Text>
            </View>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Scoreboard */}
        <Scoreboard
          match={match}
          participants={participantsWithCustomNames}
          currentScore={currentScore}
          playerStats={playerStats}
          isConnected={isConnected}
        />

        {/* Match Status Info */}
        <View style={[styles.statusCard, { backgroundColor: colors.surface }]}>
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
              Status:
            </Text>
            <Text style={[styles.statusValue, { color: colors.text }]}>
              {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
            </Text>
          </View>

          {presentPlayers.length > 0 && (
            <View style={styles.statusRow}>
              <Text
                style={[styles.statusLabel, { color: colors.textSecondary }]}
              >
                Online:
              </Text>
              <Text style={[styles.statusValue, { color: colors.success }]}>
                {presentPlayers.length} player
                {presentPlayers.length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}

          {lastUpdated && (
            <View style={styles.statusRow}>
              <Text
                style={[styles.statusLabel, { color: colors.textSecondary }]}
              >
                Updated:
              </Text>
              <Text
                style={[styles.statusValue, { color: colors.textSecondary }]}
              >
                {lastUpdated.toLocaleTimeString()}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {isParticipant && (
          <View style={styles.actionButtons}>
            {/* Always show Log Play button for participants, regardless of match status for testing */}
            <Button
              onPress={() => {
                console.log('Log Play button pressed');
                setShowPlayLogger(true);
              }}
              style={styles.logPlayButton}
              disabled={isSubmittingPlay}
              loading={isSubmittingPlay}
            >
              Log Play {match.status !== MatchStatus.ACTIVE && '(Demo)'}
            </Button>

            <Button
              onPress={handleViewStats}
              variant="outline"
              style={styles.viewStatsButton}
            >
              View Stats
            </Button>

            {events.length > 0 && (
              <Button
                onPress={handleUndoPlay}
                variant="outline"
                style={styles.undoButton}
              >
                Undo Last Play
              </Button>
            )}
          </View>
        )}

        {/* MVP Display */}
        {mvpPlayer && (
          <View style={[styles.mvpCard, { backgroundColor: colors.surface }]}>
            <View style={styles.mvpHeader}>
              <Ionicons name="trophy" size={24} color={colors.warning} />
              <Text style={[styles.mvpTitle, { color: colors.text }]}>
                Current MVP
              </Text>
            </View>
            <Text style={[styles.mvpName, { color: colors.primary }]}>
              {mvpPlayer.nickname || mvpPlayer.username}
            </Text>
          </View>
        )}

        {/* Recent Events Summary */}
        {events.length > 0 && (
          <View
            style={[styles.eventsCard, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Recent Plays ({events.length})
            </Text>
            {events
              .slice(-5)
              .reverse()
              .map((event, index) => {
                const player = participants.find(
                  (p) => p.userId === event.playerId
                );
                return (
                  <View key={event.id} style={styles.eventRow}>
                    <Text
                      style={[
                        styles.eventText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {player?.nickname || player?.username || 'Unknown'}:{' '}
                      {event.eventType}
                      {event.eventData.points
                        ? ` (+${event.eventData.points})`
                        : ''}
                    </Text>
                  </View>
                );
              })}
          </View>
        )}
      </ScrollView>

      {/* Play Logger Modal */}
      <Modal
        visible={showPlayLogger}
        onClose={() => {
          console.log('Closing PlayLogger modal');
          setShowPlayLogger(false);
        }}
        title="Log Play"
        size="large"
        position="bottom"
        padding="lg"
        testID="play-logger-modal"
      >
        <View style={{ minHeight: 400 }}>
          <Text style={[{ color: colors.text, marginBottom: 16 }]}>
            Debug Info:
          </Text>
          <Text style={[{ color: colors.textSecondary, marginBottom: 8 }]}>
            Match ID: {matchId}
          </Text>
          <Text style={[{ color: colors.textSecondary, marginBottom: 8 }]}>
            Current Team: {currentUserTeam || 'None'}
          </Text>
          <Text style={[{ color: colors.textSecondary, marginBottom: 8 }]}>
            Team Players: {currentTeamPlayers.length}
          </Text>
          <Text style={[{ color: colors.textSecondary, marginBottom: 16 }]}>
            All Participants: {participants.length}
          </Text>

          {currentUserTeam && participants.length > 0 ? (
            <PlayLogger
              matchId={matchId!}
              participants={participantsWithCustomNames}
              currentTeam={currentUserTeam}
              isSubmitting={isSubmittingPlay}
              disabled={false} // Enable for testing
              onSubmitPlay={handleSubmitPlay}
              onUndo={events.length > 0 ? handleUndoPlay : undefined}
            />
          ) : (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={[{ color: colors.textSecondary }]}>
                Unable to load PlayLogger.
                {!currentUserTeam && ' No team assigned.'}
                {participants.length === 0 && ' No participants found.'}
              </Text>
            </View>
          )}
        </View>
      </Modal>

      {/* Match Controls Modal */}
      <Modal
        visible={showMatchControls}
        onClose={() => setShowMatchControls(false)}
        title="Match Controls"
        size="medium"
        testID="match-controls-modal"
      >
        <View style={styles.controlsGrid}>
          {match.status === MatchStatus.PENDING && (
            <Button
              onPress={handleStartMatch}
              loading={isUpdatingMatch}
              style={styles.controlButton}
            >
              Start Match
            </Button>
          )}

          {match.status === MatchStatus.ACTIVE && (
            <Button
              onPress={handlePauseMatch}
              variant="outline"
              loading={isUpdatingMatch}
              style={styles.controlButton}
            >
              Pause Match
            </Button>
          )}

          {match.status === MatchStatus.PAUSED && (
            <Button
              onPress={handleResumeMatch}
              loading={isUpdatingMatch}
              style={styles.controlButton}
            >
              Resume Match
            </Button>
          )}

          {(match.status === MatchStatus.ACTIVE ||
            match.status === MatchStatus.PAUSED) && (
            <Button
              onPress={handleEndMatch}
              variant="destructive"
              loading={isUpdatingMatch}
              style={styles.controlButton}
            >
              End Match
            </Button>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
  },

  // Header
  header: {
    ...MIXINS.rowCenter,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    ...SHADOWS.sm,
  },

  headerButton: {
    ...MIXINS.center,
    width: 40,
    height: 40,
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.headline,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },

  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginTop: SPACING.xxs,
  },

  roomCodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerActions: {
    ...MIXINS.rowCenter,
    gap: SPACING.sm,
  },

  connectionIndicator: {
    width: 8,
    height: 8,
    borderRadius: BORDERS.full,
  },

  // Room Code Dropdown
  roomCodeDropdown: {
    padding: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    ...SHADOWS.sm,
  },

  roomCodeSection: {
    marginBottom: SPACING.md,
  },

  roomCodeLabel: {
    fontSize: TYPOGRAPHY.sizes.subheadline,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    marginBottom: SPACING.xs,
  },

  roomCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },

  roomCodeText: {
    fontSize: TYPOGRAPHY.sizes.title2,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    letterSpacing: 2,
  },

  copyButton: {
    padding: SPACING.xs,
    borderRadius: BORDERS.sm,
  },

  qrCodeSection: {
    alignItems: 'center',
  },

  qrCodeLabel: {
    fontSize: TYPOGRAPHY.sizes.footnote,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginBottom: SPACING.xs,
  },

  qrCodePlaceholder: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: BORDERS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  qrCodeText: {
    fontSize: TYPOGRAPHY.sizes.caption2,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },

  // Content
  content: {
    flex: 1,
  },

  // Loading
  loadingContainer: {
    ...MIXINS.center,
    flex: 1,
    gap: SPACING.md,
  },

  loadingText: {
    fontSize: TYPOGRAPHY.sizes.subheadline,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },

  // Error
  errorContainer: {
    ...MIXINS.center,
    flex: 1,
    padding: SPACING.xl,
    gap: SPACING.md,
  },

  errorTitle: {
    fontSize: TYPOGRAPHY.sizes.title2,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    textAlign: 'center',
  },

  errorSubtitle: {
    fontSize: TYPOGRAPHY.sizes.subheadline,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
  },

  retryButton: {
    marginTop: SPACING.lg,
  },

  // Status Card
  statusCard: {
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDERS.md,
    ...SHADOWS.sm,
  },

  statusRow: {
    ...MIXINS.rowCenter,
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },

  statusLabel: {
    fontSize: TYPOGRAPHY.sizes.subheadline,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },

  statusValue: {
    fontSize: TYPOGRAPHY.sizes.subheadline,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },

  // Action Buttons
  actionButtons: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },

  logPlayButton: {
    // Primary styling from Button component
  },

  viewStatsButton: {
    // Outline styling from Button component
  },

  undoButton: {
    // Outline styling from Button component
  },

  // MVP Card
  mvpCard: {
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDERS.md,
    ...SHADOWS.sm,
  },

  mvpHeader: {
    ...MIXINS.rowCenter,
    marginBottom: SPACING.xs,
  },

  mvpTitle: {
    fontSize: TYPOGRAPHY.sizes.subheadline,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    marginLeft: SPACING.xs,
  },

  mvpName: {
    fontSize: TYPOGRAPHY.sizes.title3,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    textAlign: 'center',
  },

  // Events Card
  eventsCard: {
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDERS.md,
    ...SHADOWS.sm,
  },

  cardTitle: {
    fontSize: TYPOGRAPHY.sizes.headline,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    marginBottom: SPACING.sm,
  },

  eventRow: {
    paddingVertical: SPACING.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },

  eventText: {
    fontSize: TYPOGRAPHY.sizes.subheadline,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },

  // Controls
  controlsGrid: {
    gap: SPACING.md,
  },

  controlButton: {
    // Button styling from Button component
  },
});
