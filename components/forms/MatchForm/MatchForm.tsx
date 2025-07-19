// components/forms/MatchForm/MatchForm.tsx - UPDATED VERSION
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MATCH_SETTINGS } from '../../../constants/game';
import { PLACEHOLDERS } from '../../../constants/messages';
import { BORDERS, COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { useTheme } from '../../../hooks/ui/useTheme';
import { validateMatchTitle } from '../../../utils/validation';
import { Button } from '../../core/Button';
import { Input } from '../../core/Input';
import { TrackerMatchFormData } from '../../../types/tracker';

// Updated form props to use tracker types
interface MatchFormProps {
  onSubmit: (data: TrackerMatchFormData) => Promise<void>;
  loading: boolean;
  serverError?: string | null;
  onCancel?: () => void;
}

// Updated validation errors
interface MatchFormErrors {
  title?: string;
  description?: string;
  location?: string;
  scoreLimit?: string;
  sinkPoints?: string;
  team1Name?: string;
  team2Name?: string;
  player1Name?: string;
  player2Name?: string;
  player3Name?: string;
  player4Name?: string;
  general?: string;
}

/**
 * Enhanced Match Creation Form
 *
 * Now includes all team and player name fields for the tracker system
 * Stores complete match configuration including display names
 */
export const MatchForm: React.FC<MatchFormProps> = ({
  onSubmit,
  loading,
  serverError,
  onCancel,
}) => {
  const { colors } = useTheme();

  // Enhanced form data with all required fields
  const [formData, setFormData] = useState<TrackerMatchFormData>({
    title: 'Match',
    description: 'Die up!',
    location: 'The Grand Dome',
    scoreLimit: MATCH_SETTINGS.DEFAULT_SCORE_LIMIT,
    winByTwo: MATCH_SETTINGS.DEFAULT_WIN_BY_TWO,
    sinkPoints: MATCH_SETTINGS.DEFAULT_SINK_POINTS as 3 | 5,
    isPublic: MATCH_SETTINGS.DEFAULT_VISIBILITY === 'public', // Use constant for consistency
    // Team names
    team1Name: 'Team 1',
    team2Name: 'Team 2',
    // Player names
    player1Name: 'Player 1',
    player2Name: 'Player 2',
    player3Name: 'Player 3',
    player4Name: 'Player 4',
  });

  // Track which fields have been edited by the user
  const [editedFields, setEditedFields] = useState<
    Set<keyof TrackerMatchFormData>
  >(new Set());

  const [errors, setErrors] = useState<MatchFormErrors>({});

  // Validate a single field
  const validateField = (
    field: keyof TrackerMatchFormData,
    value: any
  ): string | undefined => {
    switch (field) {
      case 'title':
        const titleResult = validateMatchTitle(value);
        return titleResult.isValid ? undefined : titleResult.error;
      case 'description':
        if (value && value.length > 500) {
          return 'Description must be less than 500 characters';
        }
        return undefined;
      case 'location':
        if (value && value.length > 100) {
          return 'Location must be less than 100 characters';
        }
        return undefined;
      case 'team1Name':
      case 'team2Name':
        if (!value || value.trim().length === 0) {
          return 'Team name is required';
        }
        if (value.trim().length > 25) {
          return 'Team name must be less than 25 characters';
        }
        return undefined;
      case 'player1Name':
      case 'player2Name':
      case 'player3Name':
      case 'player4Name':
        if (!value || value.trim().length === 0) {
          return 'Player name is required';
        }
        if (value.trim().length > 30) {
          return 'Player name must be less than 30 characters';
        }
        return undefined;
      case 'scoreLimit':
        if (!MATCH_SETTINGS.SCORE_LIMIT_OPTIONS.includes(value)) {
          return 'Please select a valid score limit';
        }
        return undefined;
      case 'sinkPoints':
        if (!MATCH_SETTINGS.SINK_POINTS_OPTIONS.includes(value)) {
          return 'Please select valid sink points';
        }
        return undefined;
      default:
        return undefined;
    }
  };

  // Update field value and clear error
  const updateField = (field: keyof TrackerMatchFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setEditedFields((prev) => new Set(prev).add(field));
    if (errors[field as keyof MatchFormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate field when user finishes editing
  const handleFieldBlur = (field: keyof TrackerMatchFormData) => {
    const error = validateField(field, formData[field]);
    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate all fields
    const newErrors: MatchFormErrors = {};
    let hasErrors = false;

    (Object.keys(formData) as Array<keyof TrackerMatchFormData>).forEach(
      (field) => {
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field as keyof MatchFormErrors] = error;
          hasErrors = true;
        }
      }
    );

    setErrors(newErrors);

    if (!hasErrors) {
      await onSubmit(formData);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: SPACING.md,
      paddingTop: SPACING.lg,
      paddingBottom: SPACING.xl,
    },
    formContainer: {
      width: '100%',
    },
    title: {
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      fontSize: TYPOGRAPHY.sizes.largeTitle,
      color: colors.text,
      marginBottom: SPACING.sm,
      textAlign: 'center',
    },
    subtitle: {
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      fontSize: TYPOGRAPHY.sizes.body,
      color: colors.textSecondary,
      marginBottom: SPACING.xl,
      textAlign: 'center',
    },
    section: {
      marginBottom: SPACING.xl,
    },
    sectionTitle: {
      fontSize: TYPOGRAPHY.sizes.lg,
      fontWeight: TYPOGRAPHY.weights.medium,
      color: colors.text,
      marginBottom: SPACING.md,
    },
    settingGroup: {
      marginBottom: SPACING.lg,
    },
    settingLabel: {
      fontSize: TYPOGRAPHY.sizes.md,
      fontWeight: TYPOGRAPHY.weights.medium,
      color: colors.text,
      marginBottom: SPACING.xs,
    },
    settingDescription: {
      fontSize: TYPOGRAPHY.sizes.sm,
      color: colors.textSecondary,
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
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      minWidth: 60,
      alignItems: 'center',
    },
    optionButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    optionText: {
      fontSize: TYPOGRAPHY.sizes.md,
      color: colors.text,
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
    errorContainer: {
      marginTop: SPACING.md,
      backgroundColor: colors.error,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: BORDERS.md,
    },
    serverErrorText: {
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.light.background,
      textAlign: 'center',
      fontSize: TYPOGRAPHY.sizes.footnote,
    },
    buttonContainer: {
      marginTop: SPACING.md,
    },
    linksContainer: {
      marginTop: SPACING.lg,
      alignItems: 'center',
    },
    linkButton: {
      padding: SPACING.sm,
    },
    linkText: {
      color: colors.primary,
      fontSize: TYPOGRAPHY.sizes.body,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },
    teamBox: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: BORDERS.md,
      backgroundColor: colors.surface,
      padding: SPACING.md,
      marginBottom: SPACING.md,
    },
    teamHeader: {
      alignItems: 'center',
      marginBottom: SPACING.sm,
    },
    teamPlayersRow: {
      flexDirection: 'row',
      gap: SPACING.md,
    },
    playerInput: {
      flex: 1,
    },
    matchInfoRow: {
      flexDirection: 'row',
      gap: SPACING.md,
      marginBottom: SPACING.md,
    },
    matchInfoInput: {
      flex: 1,
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>Create New Match</Text>
          <Text style={styles.subtitle}>
            Set up your die game and invite friends to join
          </Text>

          {/* Match Title and Location */}
          <View style={styles.matchInfoRow}>
            <View style={styles.matchInfoInput}>
              <Input
                label="Match Title"
                value={formData.title}
                onChangeText={(text: string) => updateField('title', text)}
                onBlur={() => handleFieldBlur('title')}
                error={errors.title}
                placeholder={PLACEHOLDERS.MATCH_TITLE}
                autoCapitalize="words"
                maxLength={50}
              />
            </View>
            <View style={styles.matchInfoInput}>
              <Input
                label="Location"
                value={formData.location}
                onChangeText={(text: string) => updateField('location', text)}
                onBlur={() => handleFieldBlur('location')}
                error={errors.location}
                placeholder={PLACEHOLDERS.ENTER_LOCATION}
                autoCapitalize="words"
                maxLength={100}
              />
            </View>
          </View>

          {/* Match Description */}
          <Input
            label="Description (Optional)"
            value={formData.description}
            onChangeText={(text: string) => updateField('description', text)}
            onBlur={() => handleFieldBlur('description')}
            error={errors.description}
            placeholder="Describe your match..."
            multiline
            numberOfLines={2}
            maxLength={500}
            style={{ marginBottom: SPACING.md }}
          />

          {/* Team 1 */}
          <View style={styles.teamBox}>
            <View style={styles.teamHeader}>
              <Input
                label="Team 1 Name"
                value={formData.team1Name}
                onChangeText={(text: string) => updateField('team1Name', text)}
                onBlur={() => handleFieldBlur('team1Name')}
                error={errors.team1Name}
                placeholder="Team 1"
                autoCapitalize="words"
                maxLength={25}
                containerStyle={{ width: '60%' }}
              />
            </View>
            <View style={styles.teamPlayersRow}>
              <View style={styles.playerInput}>
                <Input
                  label="Player 1"
                  value={formData.player1Name}
                  onChangeText={(text: string) =>
                    updateField('player1Name', text)
                  }
                  onBlur={() => handleFieldBlur('player1Name')}
                  error={errors.player1Name}
                  placeholder="Player 1"
                  autoCapitalize="words"
                  maxLength={30}
                />
              </View>
              <View style={styles.playerInput}>
                <Input
                  label="Player 2"
                  value={formData.player2Name}
                  onChangeText={(text: string) =>
                    updateField('player2Name', text)
                  }
                  onBlur={() => handleFieldBlur('player2Name')}
                  error={errors.player2Name}
                  placeholder="Player 2"
                  autoCapitalize="words"
                  maxLength={30}
                />
              </View>
            </View>
          </View>

          {/* Team 2 */}
          <View style={styles.teamBox}>
            <View style={styles.teamHeader}>
              <Input
                label="Team 2 Name"
                value={formData.team2Name}
                onChangeText={(text: string) => updateField('team2Name', text)}
                onBlur={() => handleFieldBlur('team2Name')}
                error={errors.team2Name}
                placeholder="Team 2"
                autoCapitalize="words"
                maxLength={25}
                containerStyle={{ width: '60%' }}
              />
            </View>
            <View style={styles.teamPlayersRow}>
              <View style={styles.playerInput}>
                <Input
                  label="Player 3"
                  value={formData.player3Name}
                  onChangeText={(text: string) =>
                    updateField('player3Name', text)
                  }
                  onBlur={() => handleFieldBlur('player3Name')}
                  error={errors.player3Name}
                  placeholder="Player 3"
                  autoCapitalize="words"
                  maxLength={30}
                />
              </View>
              <View style={styles.playerInput}>
                <Input
                  label="Player 4"
                  value={formData.player4Name}
                  onChangeText={(text: string) =>
                    updateField('player4Name', text)
                  }
                  onBlur={() => handleFieldBlur('player4Name')}
                  error={errors.player4Name}
                  placeholder="Player 4"
                  autoCapitalize="words"
                  maxLength={30}
                />
              </View>
            </View>
          </View>

          {/* Game Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Game Settings</Text>

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
                      formData.sinkPoints === option &&
                        styles.optionButtonActive,
                    ]}
                    onPress={() => updateField('sinkPoints', option as 3 | 5)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        formData.sinkPoints === option &&
                          styles.optionTextActive,
                      ]}
                    >
                      {String(option) + ' pts'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.sinkPoints && (
                <Text style={{ color: colors.error, marginTop: SPACING.xs }}>
                  {errors.sinkPoints}
                </Text>
              )}
            </View>

            {/* Score Limit */}
            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>Score Limit</Text>
              <View style={styles.optionRow}>
                {MATCH_SETTINGS.SCORE_LIMIT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      formData.scoreLimit === option &&
                        styles.optionButtonActive,
                    ]}
                    onPress={() => updateField('scoreLimit', option)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        formData.scoreLimit === option &&
                          styles.optionTextActive,
                      ]}
                    >
                      {String(option)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.scoreLimit && (
                <Text style={{ color: colors.error, marginTop: SPACING.xs }}>
                  {errors.scoreLimit}
                </Text>
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
                  value={formData.winByTwo}
                  onValueChange={(value) => updateField('winByTwo', value)}
                  trackColor={{
                    false: colors.border,
                    true: colors.primary + '30',
                  }}
                  thumbColor={
                    formData.winByTwo ? colors.primary : colors.textSecondary
                  }
                />
              </View>
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
                  value={formData.isPublic}
                  onValueChange={(value) => updateField('isPublic', value)}
                  trackColor={{
                    false: colors.border,
                    true: colors.primary + '30',
                  }}
                  thumbColor={
                    formData.isPublic ? colors.primary : colors.textSecondary
                  }
                />
              </View>
            </View>
          </View>

          {/* Server Error */}
          {serverError && (
            <View style={styles.errorContainer}>
              <Text style={styles.serverErrorText}>{serverError}</Text>
            </View>
          )}

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <Button onPress={handleSubmit} loading={loading}>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                {loading ? 'Creating Match...' : 'Create Match'}
              </Text>
            </Button>
          </View>

          {/* Cancel Button */}
          {onCancel && (
            <View style={styles.linksContainer}>
              <TouchableOpacity style={styles.linkButton} onPress={onCancel}>
                <Text style={styles.linkText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
