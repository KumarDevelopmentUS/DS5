// components/match/PlayLogger/PlayLogger.tsx - FIXED VERSION
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import {
  PlayLoggerProps,
  PlayLoggerState,
  PlaySubmissionData,
} from './PlayLogger.types';
import { styles } from './PlayLogger.styles';
import { useTheme } from '../../../contexts/ThemeContext';
import { Button } from '../../core/Button';
import { Avatar } from '../../core/Avatar';
import { PlayType } from '../../../types/enums';
import { SPACING, TYPOGRAPHY } from '../../../constants/theme';
import {
  resetPlayState,
  validatePlayState,
  getPlayTypesByCategory,
  getPlayTypeDisplayInfo,
  shouldShowFifa,
  canShowRedemption,
  formatPlayerName,
  getTeamColor,
} from './PlayLogger.utils';

export const PlayLogger: React.FC<PlayLoggerProps> = ({
  matchId,
  participants,
  currentTeam,
  isSubmitting = false,
  disabled = false,
  onSubmitPlay,
  onUndo,
  style,
  testID = 'play-logger',
}) => {
  const { colors } = useTheme();
  const [state, setState] = useState<PlayLoggerState>(resetPlayState);

  // Reset state when match changes
  useEffect(() => {
    setState(resetPlayState());
  }, [matchId]);

  // Update can submit status when state changes
  useEffect(() => {
    const validation = validatePlayState(state);
    setState((prev) => ({
      ...prev,
      canSubmit: validation.isValid,
      errors: validation.errors,
    }));
  }, [
    state.selectedThrower,
    state.selectedThrowType,
    state.selectedDefender,
    state.selectedDefenseType,
    state.showFifa,
    state.selectedFifaKicker,
    state.selectedFifaAction,
    state.showRedemption,
    state.redemptionSuccess,
  ]);

  const updateState = useCallback((updates: Partial<PlayLoggerState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Get filtered participants for current team
  const currentTeamPlayers = participants.filter((p) => p.team === currentTeam);
  const opposingTeamPlayers = participants.filter(
    (p) => p.team !== currentTeam
  );

  // Handle player selection
  const handlePlayerSelect = useCallback(
    (playerId: string, type: 'thrower' | 'defender' | 'fifa') => {
      const updates: Partial<PlayLoggerState> = {};

      switch (type) {
        case 'thrower':
          updates.selectedThrower = playerId;
          break;
        case 'defender':
          updates.selectedDefender = playerId;
          break;
        case 'fifa':
          updates.selectedFifaKicker = playerId;
          break;
      }

      updateState(updates);
    },
    [updateState]
  );

  // Handle throw type selection
  const handleThrowTypeSelect = useCallback(
    (throwType: PlayType) => {
      const updates: Partial<PlayLoggerState> = {
        selectedThrowType: throwType,
        selectedDefender: null,
        selectedDefenseType: null,
        showFifa: false,
        showRedemption: false,
        selectedFifaKicker: null,
        selectedFifaAction: null,
        redemptionSuccess: null,
      };

      // Auto-show FIFA for bad throws
      if (shouldShowFifa(throwType)) {
        updates.showFifa = true;
      }

      updateState(updates);
    },
    [updateState]
  );

  // Handle defense type selection
  const handleDefenseTypeSelect = useCallback(
    (defenseType: PlayType) => {
      updateState({ selectedDefenseType: defenseType });
    },
    [updateState]
  );

  // Handle FIFA action selection
  const handleFifaActionSelect = useCallback(
    (action: 'good_kick' | 'bad_kick') => {
      updateState({ selectedFifaAction: action });
    },
    [updateState]
  );

  // Handle redemption result
  const handleRedemptionSelect = useCallback(
    (success: boolean) => {
      updateState({ redemptionSuccess: success });
    },
    [updateState]
  );

  // Handle self sink
  const handleSelfSink = useCallback(() => {
    Alert.alert(
      'Self Sink',
      'Are you sure? This will end the match immediately!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: () => {
            updateState({
              selectedThrowType: PlayType.SELF_SINK,
              selectedDefender: null,
              selectedDefenseType: null,
              showFifa: false,
              showRedemption: false,
            });
          },
        },
      ]
    );
  }, [updateState]);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (
      !state.canSubmit ||
      !state.selectedThrower ||
      !state.selectedThrowType
    ) {
      return;
    }

    const playData: PlaySubmissionData = {
      playerId: state.selectedThrower,
      eventType: state.selectedThrowType,
      team: currentTeam,
    };

    // Add defense data if selected
    if (state.selectedDefender || state.selectedDefenseType) {
      if (state.selectedDefender) {
        playData.defenderIds = [state.selectedDefender];
      }
      if (state.selectedDefenseType) {
        playData.defenseType = state.selectedDefenseType;
      }
    }

    // Add FIFA data if applicable
    if (
      state.showFifa &&
      state.selectedFifaKicker &&
      state.selectedFifaAction
    ) {
      playData.fifa = {
        kickerId: state.selectedFifaKicker,
        kickType: state.selectedFifaAction,
      };
    }

    // Add redemption data if applicable
    if (state.showRedemption && state.redemptionSuccess !== null) {
      playData.redemption = {
        success: state.redemptionSuccess,
        targetPlayerId: state.selectedRedemptionTarget || undefined,
      };
    }

    try {
      await onSubmitPlay(playData);
      setState(resetPlayState());
    } catch (error) {
      console.error('Failed to submit play:', error);
    }
  }, [state, currentTeam, onSubmitPlay]);

  // Handle undo
  const handleUndo = useCallback(async () => {
    if (onUndo) {
      try {
        await onUndo();
      } catch (error) {
        console.error('Failed to undo play:', error);
      }
    }
  }, [onUndo]);

  // Render player button
  const renderPlayerButton = (
    player: any,
    isSelected: boolean,
    onPress: () => void,
    buttonTestId: string
  ) => {
    const teamColor = getTeamColor(player.team, colors);

    return (
      <Button
        key={player.userId}
        onPress={onPress}
        style={[
          styles.playerButton,
          {
            backgroundColor: isSelected ? teamColor : colors.surface,
            borderColor: isSelected ? teamColor : colors.border,
          },
        ]}
        testID={buttonTestId}
      >
        <View style={styles.playerButtonContent}>
          <Avatar
            source={player.avatarUrl}
            name={formatPlayerName(player.username, player.nickname)}
            size="small"
          />
          <Text
            style={[
              styles.playerName,
              { color: isSelected ? colors.background : colors.text },
            ]}
          >
            {formatPlayerName(player.username, player.nickname)}
          </Text>
          <Text
            style={[
              styles.playerTeam,
              { color: isSelected ? colors.background : colors.textSecondary },
            ]}
          >
            {player.team}
          </Text>
        </View>
      </Button>
    );
  };

  // Render play type button
  const renderPlayTypeButton = (
    playType: PlayType,
    isSelected: boolean,
    onPress: () => void,
    buttonTestId: string
  ) => {
    const displayInfo = getPlayTypeDisplayInfo(playType, colors);
    if (!displayInfo) return null;

    return (
      <Button
        key={playType}
        onPress={onPress}
        style={[
          styles.playTypeButton,
          {
            backgroundColor: isSelected ? displayInfo.color : colors.surface,
            borderColor: isSelected ? displayInfo.color : colors.border,
          },
        ]}
        testID={buttonTestId}
      >
        <View style={styles.playTypeButtonContent}>
          <Text
            style={[
              styles.playTypeName,
              { color: isSelected ? colors.background : colors.text },
            ]}
          >
            {displayInfo.name}
          </Text>
          {displayInfo.points > 0 ? (
            <Text
              style={[
                styles.playTypePoints,
                {
                  color: isSelected ? colors.background : colors.textSecondary,
                },
              ]}
            >
              {displayInfo.points} pt{displayInfo.points !== 1 ? 's' : ''}
            </Text>
          ) : null}
        </View>
      </Button>
    );
  };

  const playTypes = getPlayTypesByCategory();

  return (
    <ScrollView
      style={[styles.container, style]}
      showsVerticalScrollIndicator={false}
      testID={testID}
    >
      {/* Throwing Player Selection */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Throwing Player
          </Text>
          <Text style={[styles.requiredIndicator, { color: colors.error }]}>
            Required
          </Text>
        </View>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          Select the player who threw the die
        </Text>
        <View style={styles.buttonGrid}>
          {currentTeamPlayers.map((player) =>
            renderPlayerButton(
              player,
              state.selectedThrower === player.userId,
              () => handlePlayerSelect(player.userId, 'thrower'),
              `${testID}-thrower-${player.userId}`
            )
          )}
        </View>
      </View>

      {/* Throw Result Selection */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Throw Result
          </Text>
          <Text style={[styles.requiredIndicator, { color: colors.error }]}>
            Required
          </Text>
        </View>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          Select the outcome of the throw
        </Text>

        {/* Good Throws */}
        <View style={{ marginBottom: SPACING.md }}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.success, fontSize: TYPOGRAPHY.sizes.subheadline },
            ]}
          >
            Good Throws
          </Text>
          <View style={styles.buttonGrid}>
            {playTypes.goodThrows.map((throwType) =>
              renderPlayTypeButton(
                throwType,
                state.selectedThrowType === throwType,
                () => handleThrowTypeSelect(throwType),
                `${testID}-throw-${throwType}`
              )
            )}
          </View>
        </View>

        {/* Bad Throws */}
        <View style={{ marginBottom: SPACING.md }}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.error, fontSize: TYPOGRAPHY.sizes.subheadline },
            ]}
          >
            Bad Throws
          </Text>
          <View style={styles.buttonGrid}>
            {playTypes.badThrows.map((throwType) =>
              renderPlayTypeButton(
                throwType,
                state.selectedThrowType === throwType,
                () => handleThrowTypeSelect(throwType),
                `${testID}-throw-${throwType}`
              )
            )}
          </View>
        </View>
      </View>

      {/* Defense Section - Skip for Self Sink */}
      {state.selectedThrowType &&
      state.selectedThrowType !== PlayType.SELF_SINK ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Defense
            </Text>
            <Text
              style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
            >
              Optional
            </Text>
          </View>
          <Text
            style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
          >
            Select defending player and defense result
          </Text>

          {/* Defending Player */}
          <View style={{ marginBottom: SPACING.md }}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.text,
                  fontSize: TYPOGRAPHY.sizes.subheadline,
                },
              ]}
            >
              Defending Player
            </Text>
            <View style={styles.buttonGrid}>
              {opposingTeamPlayers.map((player) =>
                renderPlayerButton(
                  player,
                  state.selectedDefender === player.userId,
                  () => handlePlayerSelect(player.userId, 'defender'),
                  `${testID}-defender-${player.userId}`
                )
              )}
              <Button
                onPress={() => updateState({ selectedDefender: 'team' })}
                style={[
                  styles.playTypeButton,
                  {
                    backgroundColor:
                      state.selectedDefender === 'team'
                        ? colors.primary
                        : colors.surface,
                    borderColor:
                      state.selectedDefender === 'team'
                        ? colors.primary
                        : colors.border,
                  },
                ]}
                testID={`${testID}-defender-team`}
              >
                <Text
                  style={[
                    styles.playTypeName,
                    {
                      color:
                        state.selectedDefender === 'team'
                          ? colors.background
                          : colors.text,
                    },
                  ]}
                >
                  TEAM
                </Text>
              </Button>
              <Button
                onPress={() => updateState({ selectedDefender: 'na' })}
                style={[
                  styles.playTypeButton,
                  {
                    backgroundColor:
                      state.selectedDefender === 'na'
                        ? colors.textSecondary
                        : colors.surface,
                    borderColor:
                      state.selectedDefender === 'na'
                        ? colors.textSecondary
                        : colors.border,
                  },
                ]}
                testID={`${testID}-defender-na`}
              >
                <Text
                  style={[
                    styles.playTypeName,
                    {
                      color:
                        state.selectedDefender === 'na'
                          ? colors.background
                          : colors.text,
                    },
                  ]}
                >
                  N/A
                </Text>
              </Button>
            </View>
          </View>

          {/* Defense Result */}
          <View style={{ marginBottom: SPACING.md }}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.text,
                  fontSize: TYPOGRAPHY.sizes.subheadline,
                },
              ]}
            >
              Defense Result
            </Text>

            {/* Good Defense */}
            <View style={{ marginBottom: SPACING.sm }}>
              <Text style={[styles.sectionSubtitle, { color: colors.success }]}>
                Successful Defense
              </Text>
              <View style={styles.buttonGrid}>
                {playTypes.goodDefense.map((defenseType) =>
                  renderPlayTypeButton(
                    defenseType,
                    state.selectedDefenseType === defenseType,
                    () => handleDefenseTypeSelect(defenseType),
                    `${testID}-defense-${defenseType}`
                  )
                )}
              </View>
            </View>

            {/* Bad Defense */}
            <View>
              <Text style={[styles.sectionSubtitle, { color: colors.error }]}>
                Failed Defense
              </Text>
              <View style={styles.buttonGrid}>
                {playTypes.badDefense.map((defenseType) =>
                  renderPlayTypeButton(
                    defenseType,
                    state.selectedDefenseType === defenseType,
                    () => handleDefenseTypeSelect(defenseType),
                    `${testID}-defense-${defenseType}`
                  )
                )}
              </View>
            </View>
          </View>
        </View>
      ) : null}

      {/* FIFA Section */}
      {shouldShowFifa(state.selectedThrowType) ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              FIFA
            </Text>
            <Button
              onPress={() => updateState({ showFifa: !state.showFifa })}
              variant="outline"
              size="small"
              style={styles.showButton}
              testID={`${testID}-fifa-toggle`}
            >
              <Text style={[styles.showButtonText, { color: colors.primary }]}>
                {state.showFifa ? 'Hide' : 'Show'}
              </Text>
            </Button>
          </View>

          {state.showFifa ? (
            <View
              style={[
                styles.fifaSection,
                {
                  backgroundColor: colors.fillSecondary,
                  borderColor: colors.border,
                },
              ]}
            >
              {/* FIFA Kicker */}
              <View style={{ marginBottom: SPACING.md }}>
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color: colors.text,
                      fontSize: TYPOGRAPHY.sizes.subheadline,
                    },
                  ]}
                >
                  FIFA Kicker
                </Text>
                <View style={styles.buttonGrid}>
                  {currentTeamPlayers.map((player) =>
                    renderPlayerButton(
                      player,
                      state.selectedFifaKicker === player.userId,
                      () => handlePlayerSelect(player.userId, 'fifa'),
                      `${testID}-fifa-kicker-${player.userId}`
                    )
                  )}
                </View>
              </View>

              {/* FIFA Action */}
              <View>
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color: colors.text,
                      fontSize: TYPOGRAPHY.sizes.subheadline,
                    },
                  ]}
                >
                  FIFA Action
                </Text>
                <View style={styles.fifaGrid}>
                  <Button
                    onPress={() => handleFifaActionSelect('good_kick')}
                    style={[
                      styles.fifaActionButton,
                      {
                        backgroundColor:
                          state.selectedFifaAction === 'good_kick'
                            ? colors.success
                            : colors.surface,
                        borderColor:
                          state.selectedFifaAction === 'good_kick'
                            ? colors.success
                            : colors.border,
                      },
                    ]}
                    testID={`${testID}-fifa-good`}
                  >
                    <Text
                      style={[
                        styles.playTypeName,
                        {
                          color:
                            state.selectedFifaAction === 'good_kick'
                              ? colors.background
                              : colors.text,
                        },
                      ]}
                    >
                      Good Kick
                    </Text>
                  </Button>
                  <Button
                    onPress={() => handleFifaActionSelect('bad_kick')}
                    style={[
                      styles.fifaActionButton,
                      {
                        backgroundColor:
                          state.selectedFifaAction === 'bad_kick'
                            ? colors.error
                            : colors.surface,
                        borderColor:
                          state.selectedFifaAction === 'bad_kick'
                            ? colors.error
                            : colors.border,
                      },
                    ]}
                    testID={`${testID}-fifa-bad`}
                  >
                    <Text
                      style={[
                        styles.playTypeName,
                        {
                          color:
                            state.selectedFifaAction === 'bad_kick'
                              ? colors.background
                              : colors.text,
                        },
                      ]}
                    >
                      Bad Kick
                    </Text>
                  </Button>
                </View>
              </View>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Redemption Section */}
      {canShowRedemption(state) ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Redemption
            </Text>
            <Button
              onPress={() =>
                updateState({ showRedemption: !state.showRedemption })
              }
              variant="outline"
              size="small"
              style={styles.showButton}
              testID={`${testID}-redemption-toggle`}
            >
              <Text style={[styles.showButtonText, { color: colors.primary }]}>
                {state.showRedemption ? 'Hide' : 'Show'}
              </Text>
            </Button>
          </View>

          {state.showRedemption ? (
            <View
              style={[
                styles.redemptionSection,
                {
                  backgroundColor: colors.fillSecondary,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.sectionSubtitle,
                  { color: colors.textSecondary, marginBottom: SPACING.sm },
                ]}
              >
                Was the redemption attempt successful?
              </Text>
              <View style={styles.redemptionButtons}>
                <Button
                  onPress={() => handleRedemptionSelect(true)}
                  style={[
                    styles.redemptionButton,
                    {
                      backgroundColor:
                        state.redemptionSuccess === true
                          ? colors.success
                          : colors.surface,
                      borderColor:
                        state.redemptionSuccess === true
                          ? colors.success
                          : colors.border,
                    },
                  ]}
                  testID={`${testID}-redemption-success`}
                >
                  <Text
                    style={[
                      styles.playTypeName,
                      {
                        color:
                          state.redemptionSuccess === true
                            ? colors.background
                            : colors.text,
                      },
                    ]}
                  >
                    Success
                  </Text>
                </Button>
                <Button
                  onPress={() => handleRedemptionSelect(false)}
                  style={[
                    styles.redemptionButton,
                    {
                      backgroundColor:
                        state.redemptionSuccess === false
                          ? colors.error
                          : colors.surface,
                      borderColor:
                        state.redemptionSuccess === false
                          ? colors.error
                          : colors.border,
                    },
                  ]}
                  testID={`${testID}-redemption-failed`}
                >
                  <Text
                    style={[
                      styles.playTypeName,
                      {
                        color:
                          state.redemptionSuccess === false
                            ? colors.background
                            : colors.text,
                      },
                    ]}
                  >
                    Failed
                  </Text>
                </Button>
              </View>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Special Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Special
          </Text>
          <Button
            onPress={() => updateState({ showSpecial: !state.showSpecial })}
            variant="outline"
            size="small"
            style={styles.showButton}
            testID={`${testID}-special-toggle`}
          >
            <Text style={[styles.showButtonText, { color: colors.primary }]}>
              {state.showSpecial ? 'Hide' : 'Show'}
            </Text>
          </Button>
        </View>

        {state.showSpecial ? (
          <View
            style={[
              styles.specialSection,
              {
                backgroundColor: colors.fillSecondary,
                borderColor: colors.border,
              },
            ]}
          >
            <Button
              onPress={handleSelfSink}
              style={[
                styles.specialButton,
                {
                  backgroundColor:
                    state.selectedThrowType === PlayType.SELF_SINK
                      ? colors.error
                      : colors.surface,
                  borderColor:
                    state.selectedThrowType === PlayType.SELF_SINK
                      ? colors.error
                      : colors.border,
                },
              ]}
              testID={`${testID}-self-sink`}
            >
              <Text
                style={[
                  styles.playTypeName,
                  {
                    color:
                      state.selectedThrowType === PlayType.SELF_SINK
                        ? colors.background
                        : colors.text,
                  },
                ]}
              >
                Self Sink
              </Text>
            </Button>
          </View>
        ) : null}
      </View>

      {/* Error Display */}
      {state.errors.length > 0 ? (
        <View
          style={[
            styles.errorContainer,
            { backgroundColor: colors.error + '20', borderColor: colors.error },
          ]}
        >
          {state.errors.map((error: string, index: number) => (
            <Text
              key={index}
              style={[styles.errorText, { color: colors.error }]}
            >
              {error}
            </Text>
          ))}
        </View>
      ) : null}

      {/* Actions */}
      <View
        style={[styles.actionsContainer, { borderTopColor: colors.border }]}
      >
        {onUndo ? (
          <Button
            onPress={handleUndo}
            variant="outline"
            disabled={disabled || isSubmitting}
            style={styles.undoButton}
            testID={`${testID}-undo`}
          >
            <Text style={[styles.showButtonText, { color: colors.primary }]}>
              Undo
            </Text>
          </Button>
        ) : null}
        <Button
          onPress={handleSubmit}
          disabled={!state.canSubmit || disabled || isSubmitting}
          loading={isSubmitting}
          style={styles.submitButton}
          testID={`${testID}-submit`}
        >
          <Text
            style={[
              styles.playTypeName,
              {
                color:
                  !state.canSubmit || disabled || isSubmitting
                    ? colors.textSecondary
                    : colors.background,
              },
            ]}
          >
            Submit Play
          </Text>
        </Button>
      </View>

      {/* Loading Overlay */}
      {isSubmitting ? (
        <View
          style={[styles.loadingOverlay, { backgroundColor: colors.overlay }]}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : null}
    </ScrollView>
  );
};
