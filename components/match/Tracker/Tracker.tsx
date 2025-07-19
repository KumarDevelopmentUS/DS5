// components/match/Tracker/Tracker.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Alert,
  BackHandler,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  TrackerProps,
  TrackerMatch,
  TrackerPlayer,
} from '../../../types/tracker';
import { TrackerHeader } from './TrackerHeader';
import { ScoreboardPanel } from './ScoreBoardPanel';
import { StatsPanel } from './StatsPanel';
import { Button } from '../../core/Button';
import { Modal } from '../../core/Modal';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../hooks/auth/useAuth';
import { useMatch } from '../../../hooks/match/useMatch';
import {
  ensureAllPlayers,
  updatePlayerDisplayNames,
  convertToTrackerPlayer,
} from '../../../utils/playerDefaults';
import { PlaySubmissionData } from '../../../types/tracker';
import { SPACING } from '../../../constants/theme';
import {
  PLAY_TYPES,
  DEFENSE_OUTCOMES,
  FIFA_MECHANICS,
} from '../../../constants/game';
import { PlayType } from '../../../types/enums';

/**
 * Main Tracker Component
 *
 * Consolidated match tracking interface that combines:
 * - Match header with room code and QR code
 * - Live scoreboard with all 4 players
 * - Play logger for game actions
 * - Live statistics and analytics
 *
 * Supports both portrait and landscape orientations (TODO: landscape)
 * Shows all players including default/unregistered players
 */
export const Tracker: React.FC<TrackerProps> = ({
  matchId,
  style,
  testID = 'tracker',
}) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  // Local state
  const [showPlayLogger, setShowPlayLogger] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAttacker, setSelectedAttacker] = useState<string | null>(null);
  const [selectedThrowResult, setSelectedThrowResult] =
    useState<PlayType | null>(null);
  const [selectedDefender, setSelectedDefender] = useState<string | null>(null);
  const [selectedDefenseResult, setSelectedDefenseResult] = useState<
    string | null
  >(null);
  const [selectedFifaAction, setSelectedFifaAction] = useState<string | null>(
    null
  );
  const [isRedemption, setIsRedemption] = useState(false);
  // Add state for collapsible sections
  const [showFifaSection, setShowFifaSection] = useState(false);
  const [showRedemptionSection, setShowRedemptionSection] = useState(false);
  const [redemptionSuccess, setRedemptionSuccess] = useState<boolean | null>(
    null
  );

  // Use the existing useMatch hook
  const {
    match,
    participants,
    liveMatchData,
    currentScore,
    playerStats,
    isConnected,
    isLoading,
    isSubmittingPlay,
    error,
    lastUpdated,
    submitPlay,
    undoLastPlay,
    refreshMatch,
    isUserParticipant,
    canUserControl,
    getPlayerByTeam,
    startMatch, // Add this
    joinAsHost, // Add this
  } = useMatch(matchId, {
    enableRealtime: true,
    includeStats: true,
    trackPresence: true,
  });

  // Convert to tracker format
  const trackerMatch: TrackerMatch | null = match
    ? {
        ...match,
        settings: {
          scoreLimit: match.settings?.scoreLimit || 11,
          winByTwo: match.settings?.winByTwo || true,
          sinkPoints: (match.settings?.sinkPoints || 3) as 3 | 5,
          teamNames: {
            team1: (match.settings as any)?.teamNames?.team1 || 'Team 1',
            team2: (match.settings as any)?.teamNames?.team2 || 'Team 2',
          },
          playerNames: {
            player1:
              (match.settings as any)?.playerNames?.player1 || 'Player 1',
            player2:
              (match.settings as any)?.playerNames?.player2 || 'Player 2',
            player3:
              (match.settings as any)?.playerNames?.player3 || 'Player 3',
            player4:
              (match.settings as any)?.playerNames?.player4 || 'Player 4',
          },
          trackAdvancedStats:
            (match.settings as any)?.trackAdvancedStats || true,
          enableSpectators: (match.settings as any)?.enableSpectators || true,
        },
        participants: [], // Will be set below
        currentScore: currentScore || { team1: 0, team2: 0 },
      }
    : null;

  // Convert participants to tracker players and ensure all 4 positions
  const trackerPlayers: TrackerPlayer[] = trackerMatch
    ? (() => {
        // Use live match data to determine positions if available
        const livePlayerMap = liveMatchData?.playerMap || {};

        // Debug logging
        console.log('[Tracker] Live match data:', {
          livePlayerMap,
          participants: participants.map(p => ({ userId: p.userId, team: p.team })),
          liveMatchData: liveMatchData ? {
            hasPlayerMap: !!liveMatchData.playerMap,
            playerMapKeys: Object.keys(liveMatchData.playerMap || {}),
            playerMapValues: Object.values(liveMatchData.playerMap || {})
          } : null
        });

        // Convert existing participants to tracker players
        const convertedPlayers = participants.map((participant) => {
          // Try to get position from live match data first
          const positionString = livePlayerMap[participant.userId];
          
          console.log(`[Tracker] Processing participant ${participant.userId}:`, {
            positionString,
            team: participant.team
          });
          
          let position: 1 | 2 | 3 | 4;
          
          if (positionString) {
            // Extract position from slot ID (e.g., "default_2" -> position 2)
            const slotMatch = positionString.match(/default_(\d+)/);
            if (slotMatch) {
              position = parseInt(slotMatch[1]) as 1 | 2 | 3 | 4;
              console.log(`[Tracker] Extracted position from slot: ${position}`);
            } else {
              // Fallback to old logic
              const teamPlayers = participants.filter(
                (p) => p.team === participant.team
              );
              const teamIndex = teamPlayers.findIndex(
                (p) => p.userId === participant.userId
              );
              position =
                participant.team === 'team1'
                  ? ((teamIndex + 1) as 1 | 2)
                  : ((teamIndex + 3) as 3 | 4);
              console.log(`[Tracker] Fallback position calculation: ${position} (team: ${participant.team}, index: ${teamIndex})`);
            }
          } else {
            // Fallback to old logic if no live data
            const teamPlayers = participants.filter(
              (p) => p.team === participant.team
            );
            const teamIndex = teamPlayers.findIndex(
              (p) => p.userId === participant.userId
            );
            position =
              participant.team === 'team1'
                ? ((teamIndex + 1) as 1 | 2)
                : ((teamIndex + 3) as 3 | 4);
            console.log(`[Tracker] No live data, using fallback: ${position} (team: ${participant.team}, index: ${teamIndex})`);
          }

          return convertToTrackerPlayer(
            participant,
            position,
            trackerMatch.settings
          );
        });

        // Ensure all 4 players are present (fill with defaults if needed)
        const allPlayers = ensureAllPlayers(
          convertedPlayers,
          trackerMatch.settings,
          matchId
        );

        // Update display names from match settings
        return updatePlayerDisplayNames(allPlayers, trackerMatch.settings);
      })()
    : [];

  // Update match with tracker players
  if (trackerMatch) {
    trackerMatch.participants = trackerPlayers;
  }

  // Get current user's team
  const currentUserTeam = user
    ? trackerPlayers.find((p) => p.userId === user.id)?.team
    : null;

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      if (showPlayLogger) {
        setShowPlayLogger(false);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );
    return () => backHandler.remove();
  }, [showPlayLogger]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshMatch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getGoodThrows = () =>
    PLAY_TYPES.filter(
      (play) => play.category === 'throw' && play.outcome === 'good'
    );
  const getBadThrows = () =>
    PLAY_TYPES.filter(
      (play) => play.category === 'throw' && play.outcome === 'bad'
    );
  const getDefenseOptions = () => Object.values(DEFENSE_OUTCOMES);
  const getFifaOptions = () => Object.values(FIFA_MECHANICS.ACTIONS);

  const lastFourEvents = liveMatchData?.recentPlays || [];

  const handleSubmitPlay = async () => {
    if (!selectedAttacker || !selectedThrowResult) {
      Alert.alert('Error', 'Please select an attacker and throw result');
      return;
    }

    try {
      // Determine if this is a good throw (for streak tracking)
      const isGoodThrow = getGoodThrows().some(
        (throwType) => throwType.id === selectedThrowResult
      );

      const playData = {
        playerId: selectedAttacker, // The thrower's ID (not the logged-in user)
        eventType: selectedThrowResult,
        team:
          trackerPlayers.find((p) => p.userId === selectedAttacker)?.team ||
          'team1',
        defenderIds:
          selectedDefender &&
          selectedDefender !== 'team' &&
          selectedDefender !== 'na'
            ? [selectedDefender]
            : [],
        defenseType:
          selectedDefenseResult && selectedDefenseResult !== 'na'
            ? (selectedDefenseResult as PlayType)
            : undefined,
        fifa:
          selectedFifaAction && selectedFifaAction !== 'na'
            ? {
                kickType: selectedFifaAction as 'good_kick' | 'bad_kick',
              }
            : undefined,
        redemption: isRedemption
          ? {
              targetPlayerId: undefined, // Will be determined by the backend
              success: redemptionSuccess || undefined, // Convert null to undefined
            }
          : undefined,
      };

      const success = await submitPlay(playData);
      if (success) {
        // Reset form
        setSelectedAttacker(null);
        setSelectedThrowResult(null);
        setSelectedDefender(null);
        setSelectedDefenseResult(null);
        setSelectedFifaAction(null);
        setIsRedemption(false);
        setRedemptionSuccess(null);
        setShowFifaSection(false);
        setShowRedemptionSection(false);
      }
    } catch (error) {
      console.error('Play submission error:', error);
      Alert.alert('Error', 'Failed to submit play. Please try again.');
    }
  };

  // Handle undo
  const handleUndo = async (): Promise<void> => {
    try {
      const success = await undoLastPlay();
      if (!success) {
        Alert.alert('Error', 'Failed to undo play');
      }
    } catch (error) {
      console.error('Undo error:', error);
      Alert.alert('Error', 'Failed to undo play');
      throw error;
    }
  };

  // Handle start match
  const handleStartMatch = async () => {
    try {
      const success = await startMatch();
      if (success) {
        Alert.alert('Success', 'Match started!');
      } else {
        Alert.alert('Error', 'Failed to start match');
      }
    } catch (error) {
      console.error('Start match error:', error);
      Alert.alert('Error', 'Failed to start match');
    }
  };

  // Update the collapsible section logic to be mutually exclusive
  const handleFifaToggle = () => {
    setShowFifaSection(!showFifaSection);
    if (!showFifaSection) {
      setShowRedemptionSection(false); // Close redemption when opening FIFA
    }
  };

  const handleRedemptionToggle = () => {
    setShowRedemptionSection(!showRedemptionSection);
    if (!showRedemptionSection) {
      setShowFifaSection(false); // Close FIFA when opening redemption
    }
  };

  const handleBackToHome = () => {
    router.push('/(tabs)/home');
  };

  // Loading state
  if (isLoading || !trackerMatch) {
    console.log('[Tracker] Loading state:', { isLoading, hasMatch: !!trackerMatch, matchId });
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: colors.background },
        ]}
      >
        {/* TODO: Add loading spinner */}
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: colors.background },
        ]}
      >
        {/* TODO: Add error display */}
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }, style]}
      testID={testID}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header with room code and QR */}
        <TrackerHeader
          match={trackerMatch}
          isConnected={isConnected}
          testID={`${testID}-header`}
          onHostJoin={joinAsHost}
          isHost={canUserControl()}
          isUserParticipant={isUserParticipant()}
        />

        {/* Scoreboard with all 4 players */}
        <ScoreboardPanel
          match={trackerMatch}
          players={trackerPlayers}
          currentScore={trackerMatch.currentScore}
          playerStats={playerStats}
          isConnected={isConnected}
          testID={`${testID}-scoreboard`}
        />

        {/* Start Match Button - Only show when pending and user is participant */}
        {trackerMatch.status === 'pending' && isUserParticipant() && (
          <View style={styles.startMatchContainer}>
            <Button
              onPress={handleStartMatch}
              style={styles.startMatchButton}
              testID="start-match-button"
            >
              <Text>Start Match</Text>
            </Button>
          </View>
        )}

        {/* Play-by-Play Input - only show when match is active */}
        {trackerMatch.status === 'active' && (
          <View
            style={[
              styles.playLoggerContainer,
              { backgroundColor: colors.surface },
            ]}
          >
            <Text style={[styles.playLoggerTitle, { color: colors.primary }]}>
              Log Play
            </Text>

            {/* Attacking Player Selection - 4 players side by side */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Attacking Player
              </Text>
              <View style={styles.playerRow}>
                {trackerPlayers.map((player) => (
                  <Button
                    key={player.userId}
                    variant={
                      selectedAttacker === player.userId ? 'primary' : 'outline'
                    }
                    size="small"
                    onPress={() => setSelectedAttacker(player.userId)}
                    style={styles.playerButton}
                    testID={`attacker-${player.userId}`}
                  >
                    <Text
                      style={[
                        {
                          color:
                            selectedAttacker === player.userId
                              ? '#FFFFFF'
                              : colors.primary,
                        },
                        styles.buttonText,
                      ]}
                    >
                      {player.displayName}
                    </Text>
                  </Button>
                ))}
              </View>
            </View>

            {/* Throw Result Selection */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Throw Result
              </Text>

              {/* Good Throws - without point labels */}
              <Text
                style={[
                  styles.subsectionTitle,
                  { color: colors.textSecondary },
                ]}
              >
                Good Throws
              </Text>
              <View style={styles.throwGrid}>
                {getGoodThrows().map((throwType) => (
                  <Button
                    key={throwType.id}
                    variant={
                      selectedThrowResult === throwType.id
                        ? 'primary'
                        : 'outline'
                    }
                    size="small"
                    onPress={() => setSelectedThrowResult(throwType.id)}
                    style={styles.throwButton}
                    testID={`throw-${throwType.id}`}
                  >
                    <Text
                      style={[
                        {
                          color:
                            selectedThrowResult === throwType.id
                              ? '#FFFFFF'
                              : colors.primary,
                        },
                        styles.buttonText,
                      ]}
                    >
                      {throwType.name}
                    </Text>
                  </Button>
                ))}
              </View>

              {/* Bad Throws */}
              <Text
                style={[
                  styles.subsectionTitle,
                  { color: colors.textSecondary },
                ]}
              >
                Bad Throws
              </Text>
              <View style={styles.throwGrid}>
                {getBadThrows().map((throwType) => (
                  <Button
                    key={throwType.id}
                    variant={
                      selectedThrowResult === throwType.id
                        ? 'destructive'
                        : 'outline'
                    }
                    size="small"
                    onPress={() => setSelectedThrowResult(throwType.id)}
                    style={styles.throwButton}
                    testID={`throw-${throwType.id}`}
                  >
                    <Text
                      style={[
                        {
                          color:
                            selectedThrowResult === throwType.id
                              ? '#FFFFFF'
                              : colors.error,
                        },
                        styles.buttonText,
                      ]}
                    >
                      {throwType.name}
                    </Text>
                  </Button>
                ))}
              </View>
            </View>

            {/* Defense Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Defense
              </Text>

              {/* Defending Player Selection - 4 players side by side + TEAM + N/A */}
              <Text
                style={[
                  styles.subsectionTitle,
                  { color: colors.textSecondary },
                ]}
              >
                Defending Player
              </Text>
              <View style={styles.playerRow}>
                {trackerPlayers.map((player) => (
                  <Button
                    key={player.userId}
                    variant={
                      selectedDefender === player.userId ? 'primary' : 'outline'
                    }
                    size="small"
                    onPress={() => setSelectedDefender(player.userId)}
                    style={styles.playerButton}
                    testID={`defender-${player.userId}`}
                  >
                    <Text
                      style={[
                        {
                          color:
                            selectedDefender === player.userId
                              ? '#FFFFFF'
                              : colors.primary,
                        },
                        styles.buttonText,
                      ]}
                    >
                      {player.displayName}
                    </Text>
                  </Button>
                ))}
              </View>
              <View style={styles.teamNaRow}>
                <Button
                  variant={selectedDefender === 'team' ? 'primary' : 'outline'}
                  size="small"
                  onPress={() => setSelectedDefender('team')}
                  style={styles.teamNaButton}
                  testID="defender-team"
                >
                  <Text
                    style={[
                      {
                        color:
                          selectedDefender === 'team'
                            ? '#FFFFFF'
                            : colors.primary,
                      },
                      styles.buttonText,
                    ]}
                  >
                    TEAM
                  </Text>
                </Button>
                <Button
                  variant={selectedDefender === 'na' ? 'primary' : 'outline'}
                  size="small"
                  onPress={() => setSelectedDefender('na')}
                  style={styles.teamNaButton}
                  testID="defender-na"
                >
                  <Text
                    style={[
                      {
                        color:
                          selectedDefender === 'na'
                            ? '#FFFFFF'
                            : colors.primary,
                      },
                      styles.buttonText,
                    ]}
                  >
                    N/A
                  </Text>
                </Button>
              </View>

              {/* Defense Outcome */}
              <Text
                style={[
                  styles.subsectionTitle,
                  { color: colors.textSecondary },
                ]}
              >
                Defense Outcome
              </Text>
              <View style={styles.defenseGrid}>
                {getDefenseOptions().map((defense) => (
                  <Button
                    key={defense.id}
                    variant={
                      selectedDefenseResult === defense.id
                        ? 'primary'
                        : 'outline'
                    }
                    size="small"
                    onPress={() => setSelectedDefenseResult(defense.id)}
                    style={styles.defenseButton}
                    testID={`defense-${defense.id}`}
                  >
                    <Text
                      style={[
                        {
                          color:
                            selectedDefenseResult === defense.id
                              ? '#FFFFFF'
                              : colors.primary,
                        },
                        styles.buttonText,
                      ]}
                    >
                      {defense.name}
                    </Text>
                  </Button>
                ))}
              </View>
            </View>

            {/* FIFA Actions and Redemption - Side by side, mutually exclusive */}
            <View style={styles.section}>
              <View style={styles.collapsibleRow}>
                {/* FIFA Actions - Collapsible */}
                <View style={styles.collapsibleHalf}>
                  <Button
                    variant="ghost"
                    size="small"
                    onPress={handleFifaToggle}
                    style={styles.collapsibleHeader}
                    testID="fifa-toggle"
                  >
                    <Text
                      style={[
                        styles.collapsibleHeaderText,
                        { color: colors.text },
                      ]}
                    >
                      FIFA Action {showFifaSection ? '▼' : '▶'}
                    </Text>
                  </Button>

                  {showFifaSection && (
                    <View style={styles.collapsibleContent}>
                      <View style={styles.horizontalButtonRow}>
                        {getFifaOptions().map((fifa) => (
                          <Button
                            key={fifa.id}
                            variant={
                              selectedFifaAction === fifa.id
                                ? 'primary'
                                : 'outline'
                            }
                            size="small"
                            onPress={() => setSelectedFifaAction(fifa.id)}
                            style={styles.horizontalButton}
                            testID={`fifa-${fifa.id}`}
                          >
                            <Text
                              style={[
                                {
                                  color:
                                    selectedFifaAction === fifa.id
                                      ? '#FFFFFF'
                                      : colors.primary,
                                },
                                styles.buttonText,
                              ]}
                            >
                              {fifa.name}
                            </Text>
                          </Button>
                        ))}
                        <Button
                          variant={
                            selectedFifaAction === 'na' ? 'primary' : 'outline'
                          }
                          size="small"
                          onPress={() => setSelectedFifaAction('na')}
                          style={styles.horizontalButton}
                          testID="fifa-na"
                        >
                          <Text
                            style={[
                              {
                                color:
                                  selectedFifaAction === 'na'
                                    ? '#FFFFFF'
                                    : colors.primary,
                              },
                              styles.buttonText,
                            ]}
                          >
                            N/A
                          </Text>
                        </Button>
                      </View>
                    </View>
                  )}
                </View>

                {/* Redemption Option - Collapsible */}
                <View style={styles.collapsibleHalf}>
                  <Button
                    variant="ghost"
                    size="small"
                    onPress={handleRedemptionToggle}
                    style={styles.collapsibleHeader}
                    testID="redemption-toggle"
                  >
                    <Text
                      style={[
                        styles.collapsibleHeaderText,
                        { color: colors.text },
                      ]}
                    >
                      Redemption {showRedemptionSection ? '▼' : '▶'}
                    </Text>
                  </Button>

                  {showRedemptionSection && (
                    <View style={styles.collapsibleContent}>
                      <View style={styles.horizontalButtonRow}>
                        <Button
                          variant={
                            redemptionSuccess === true ? 'primary' : 'outline'
                          }
                          size="small"
                          onPress={() => {
                            setIsRedemption(true);
                            setRedemptionSuccess(true);
                          }}
                          style={styles.horizontalButton}
                          testID="redemption-success"
                        >
                          <Text
                            style={[
                              {
                                color:
                                  redemptionSuccess === true
                                    ? '#FFFFFF'
                                    : colors.primary,
                              },
                              styles.buttonText,
                            ]}
                          >
                            ✓ Success
                          </Text>
                        </Button>
                        <Button
                          variant={
                            redemptionSuccess === false
                              ? 'destructive'
                              : 'outline'
                          }
                          size="small"
                          onPress={() => {
                            setIsRedemption(true);
                            setRedemptionSuccess(false);
                          }}
                          style={styles.horizontalButton}
                          testID="redemption-failure"
                        >
                          <Text
                            style={[
                              {
                                color:
                                  redemptionSuccess === false
                                    ? '#FFFFFF'
                                    : colors.error,
                              },
                              styles.buttonText,
                            ]}
                          >
                            ✗ Failed
                          </Text>
                        </Button>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Submit Button */}
            <Button
              onPress={handleSubmitPlay}
              disabled={
                !selectedAttacker || !selectedThrowResult || isSubmittingPlay
              }
              loading={isSubmittingPlay}
              style={styles.submitButton}
              testID="submit-play"
            >
              <Text style={styles.buttonText}>Submit Play</Text>
            </Button>
          </View>
          )}

          {/* Undo Button */}
        {lastFourEvents.length > 0 && isUserParticipant() && (
            <Button
              onPress={handleUndo}
              variant="outline"
              style={styles.undoButton}
              testID={`${testID}-undo-button`}
            >
            <Text>Undo Last Play</Text>
            </Button>
          )}

        {/* Live Statistics */}
        <StatsPanel
          match={trackerMatch}
          players={trackerPlayers}
          playerStats={playerStats}
          events={lastFourEvents}
          testID={`${testID}-stats`}
        />

        {/* Back to Home Button */}
        <View style={styles.backToHomeContainer}>
          <Button
            onPress={handleBackToHome}
            variant="outline"
            style={styles.backToHomeButton}
            testID="back-to-home-button"
          >
            <Text style={[styles.backToHomeText, { color: colors.primary }]}>
              Back to Home
            </Text>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  actionsContainer: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  logPlayButton: {
    // Primary button styling from Button component
  },
  undoButton: {
    // Outline button styling from Button component
  },
  playLoggerContainer: {
    margin: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  playLoggerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  playLoggerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 4,
  },
  playerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  playerButton: {
    flex: 1,
    minWidth: 80,
  },
  throwGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  throwButton: {
    flex: 1,
    minWidth: 70,
  },
  defenseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  defenseButton: {
    flex: 1,
    minWidth: 80,
  },
  fifaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fifaButton: {
    flex: 1,
    minWidth: 80,
  },
  redemptionButton: {
    alignSelf: 'center',
    marginTop: 8,
  },
  submitButton: {
    marginTop: 16,
    alignSelf: 'stretch',
  },
  startMatchContainer: {
    margin: SPACING.sm,
    alignItems: 'center',
  },
  startMatchButton: {
    minWidth: 200,
  },
  playerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  teamNaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  teamNaButton: {
    flex: 1,
  },
  buttonText: {
    textAlign: 'center',
  },
  collapsibleHeader: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  collapsibleHeaderText: {
    fontSize: 16,
    fontWeight: '600',
  },
  collapsibleContent: {
    marginTop: 8,
  },
  redemptionOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  collapsibleRow: {
    flexDirection: 'row',
    gap: 16,
  },
  collapsibleHalf: {
    flex: 1,
  },
  horizontalButtonRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-start', // Start from the left
  },
  horizontalButton: {
    flex: 0, // Don't expand, just take needed space
    minWidth: 80,
  },
  backToHomeContainer: {
    margin: SPACING.lg,
    alignItems: 'center',
  },
  backToHomeButton: {
    minWidth: 200,
  },
  backToHomeText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Tracker;
