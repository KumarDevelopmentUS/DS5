// components/forms/MatchForm/MatchForm.tsx
import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Button } from '../../core/Button/Button';
import { Screen } from '../../Layout/Screen/Screen';
import MatchFormField from './MatchFormField';
import GameSettingsSection from './GameSettingsSection';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { BUTTON_LABELS, PLACEHOLDERS } from '../../../constants/messages';
import type { MatchFormProps } from './MatchForm.types';
import { Input } from '../../core/Input/Input';

/**
 * Main Match Creation Form Component
 *
 * A single-screen form that allows users to create a new match with all
 * necessary settings. Designed for optimal user experience with real-time
 * validation and clear visual hierarchy.
 *
 * OPTIMIZED with useMemo and useCallback to prevent unnecessary re-renders
 */

const MatchForm: React.FC<MatchFormProps> = ({
  formData,
  errors,
  isCreating,
  isFormValid,
  onUpdateField,
  onCreateMatch,
  onClearError,
}) => {
  // Create stable handlers using useCallback with proper dependencies
  const titleHandlers = useMemo(
    () => ({
      onChange: (value: string) => onUpdateField('title', value),
      onClearError: () => onClearError('title'),
    }),
    [onUpdateField, onClearError]
  );

  const descriptionHandlers = useMemo(
    () => ({
      onChange: (value: string) => onUpdateField('description', value),
      onClearError: () => onClearError('description'),
    }),
    [onUpdateField, onClearError]
  );

  const locationHandlers = useMemo(
    () => ({
      onChange: (value: string) => onUpdateField('location', value),
      onClearError: () => onClearError('location'),
    }),
    [onUpdateField, onClearError]
  );

  const gameSettingsHandlers = useMemo(
    () => ({
      onScoreLimitChange: (value: number) => onUpdateField('scoreLimit', value),
      onWinByTwoChange: (value: boolean) => onUpdateField('winByTwo', value),
      onSinkPointsChange: (value: 3 | 5) => onUpdateField('sinkPoints', value),
      onIsPublicChange: (value: boolean) => onUpdateField('isPublic', value),
    }),
    [onUpdateField]
  );
  const handleTitleChange = useCallback(
    (text: string) => {
      onUpdateField('title', text);
    },
    [onUpdateField]
  );

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create New Match</Text>
            <Text style={styles.subtitle}>
              Set up your die game and invite friends to join
            </Text>
          </View>

          {/* Basic Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Match Details</Text>

            <Input
              label="Match Title"
              value={formData.title}
              onChangeText={handleTitleChange}
              error={errors.title}
              placeholder={PLACEHOLDERS.MATCH_TITLE}
              maxLength={50}
            />

            <MatchFormField
              label="Description"
              value={formData.description}
              onValueChange={descriptionHandlers.onChange}
              error={errors.description}
              placeholder={PLACEHOLDERS.MATCH_DESCRIPTION}
              multiline
              maxLength={500}
              onClearError={descriptionHandlers.onClearError}
            />

            <MatchFormField
              label="Location"
              value={formData.location}
              onValueChange={locationHandlers.onChange}
              error={errors.location}
              placeholder={PLACEHOLDERS.ENTER_LOCATION}
              maxLength={100}
              onClearError={locationHandlers.onClearError}
            />
          </View>

          {/* Game Settings Section */}
          <GameSettingsSection
            scoreLimit={formData.scoreLimit}
            winByTwo={formData.winByTwo}
            sinkPoints={formData.sinkPoints}
            isPublic={formData.isPublic}
            onScoreLimitChange={gameSettingsHandlers.onScoreLimitChange}
            onWinByTwoChange={gameSettingsHandlers.onWinByTwoChange}
            onSinkPointsChange={gameSettingsHandlers.onSinkPointsChange}
            onIsPublicChange={gameSettingsHandlers.onIsPublicChange}
            errors={errors}
          />

          {/* Team Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Team Setup</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                🎯 <Text style={styles.infoTextBold}>4 Players Total</Text> - 2
                teams of 2 players each
              </Text>
              <Text style={styles.infoText}>
                🔀 <Text style={styles.infoTextBold}>Random Teams</Text> -
                Players will be automatically assigned
              </Text>
              <Text style={styles.infoTextSmall}>
                {/* TODO: Manual team selection coming soon */}
                Manual team selection coming in a future update
              </Text>
            </View>
          </View>

          {/* General Error Display */}
          {errors.general && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errors.general}</Text>
            </View>
          )}

          {/* Create Button */}
          <View style={styles.buttonContainer}>
            <Button
              variant="primary"
              size="large"
              onPress={onCreateMatch}
              loading={isCreating}
              disabled={!isFormValid || isCreating}
            >
              {isCreating ? 'Creating Match...' : BUTTON_LABELS.CREATE_MATCH}
            </Button>
          </View>

          {/* Bottom spacing for keyboard */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  header: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xxxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.light.text,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.light.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.light.text,
    marginBottom: SPACING.md,
  },
  infoCard: {
    backgroundColor: COLORS.light.surface,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  infoText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.light.text,
    marginBottom: SPACING.xs,
    lineHeight: 20,
  },
  infoTextBold: {
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  infoTextSmall: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.light.textSecondary,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
  },
  errorContainer: {
    backgroundColor: COLORS.light.error + '10',
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.light.error + '30',
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.light.error,
    fontSize: TYPOGRAPHY.sizes.md,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: SPACING.lg,
    marginHorizontal: SPACING.md,
  },
  bottomSpacing: {
    height: SPACING.xxl,
  },
});

export default MatchForm;
