// components/forms/MatchForm/GameSettingsSection.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Switch } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { MATCH_SETTINGS } from '../../../constants/game';
import type { GameSettingsSectionProps } from './MatchForm.types';

/**
 * Game Settings Section Component
 *
 * Handles all game-specific configuration options including
 * score limits, win conditions, and visibility settings.
 */
const GameSettingsSection: React.FC<GameSettingsSectionProps> = ({
  scoreLimit,
  winByTwo,
  sinkPoints,
  isPublic,
  onScoreLimitChange,
  onWinByTwoChange,
  onSinkPointsChange,
  onIsPublicChange,
  errors,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Game Settings</Text>

      {/* Score Limit */}
      <View style={styles.settingGroup}>
        <Text style={styles.settingLabel}>Score Limit</Text>
        <View style={styles.optionRow}>
          {MATCH_SETTINGS.SCORE_LIMIT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                scoreLimit === option && styles.optionButtonActive,
              ]}
              onPress={() => onScoreLimitChange(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  scoreLimit === option && styles.optionTextActive,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.scoreLimit && (
          <Text style={styles.errorText}>{errors.scoreLimit}</Text>
        )}
      </View>

      {/* Win by Two */}
      <View style={styles.settingGroup}>
        <View style={styles.switchRow}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.settingLabel}>Win by Two</Text>
            <Text style={styles.settingDescription}>
              Must win by at least 2 points
            </Text>
          </View>
          <Switch
            value={winByTwo}
            onValueChange={onWinByTwoChange}
            trackColor={{
              false: COLORS.light.border,
              true: COLORS.light.primary + '30',
            }}
            thumbColor={
              winByTwo ? COLORS.light.primary : COLORS.light.textSecondary
            }
          />
        </View>
      </View>

      {/* Sink Points */}
      <View style={styles.settingGroup}>
        <Text style={styles.settingLabel}>Sink Points</Text>
        <Text style={styles.settingDescription}>
          Points awarded for sinking the die
        </Text>
        <View style={styles.optionRow}>
          {MATCH_SETTINGS.SINK_POINTS_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                sinkPoints === option && styles.optionButtonActive,
              ]}
              onPress={() => onSinkPointsChange(option as 3 | 5)}
            >
              <Text
                style={[
                  styles.optionText,
                  sinkPoints === option && styles.optionTextActive,
                ]}
              >
                {option} pts
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.sinkPoints && (
          <Text style={styles.errorText}>{errors.sinkPoints}</Text>
        )}
      </View>

      {/* Visibility */}
      <View style={styles.settingGroup}>
        <View style={styles.switchRow}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.settingLabel}>Public Match</Text>
            <Text style={styles.settingDescription}>
              Allow anyone to discover and join this match
            </Text>
          </View>
          <Switch
            value={isPublic}
            onValueChange={onIsPublicChange}
            trackColor={{
              false: COLORS.light.border,
              true: COLORS.light.primary + '30',
            }}
            thumbColor={
              isPublic ? COLORS.light.primary : COLORS.light.textSecondary
            }
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.light.text,
    marginBottom: SPACING.md,
  },
  settingGroup: {
    marginBottom: SPACING.lg,
  },
  settingLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.light.text,
    marginBottom: SPACING.xs,
  },
  settingDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.light.textSecondary,
    marginBottom: SPACING.sm,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  optionButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.light.surface,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: COLORS.light.primary,
    borderColor: COLORS.light.primary,
  },
  optionText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.light.text,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  optionTextActive: {
    color: 'white',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.light.error,
    marginTop: SPACING.xs,
  },
});

export default GameSettingsSection;
