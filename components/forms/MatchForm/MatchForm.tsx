// components/forms/MatchForm/MatchForm.tsx
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
import { MatchFormData, MatchFormProps } from './MatchForm.types';

/**
 * Match Creation Form - Simplified approach that works like AuthForm
 *
 * Key differences from the broken version:
 * - Uses useState instead of complex useForm hook
 * - Updates only when user finishes editing (onBlur/onEndEditing)
 * - No complex prop passing that breaks
 * - Self-contained and simple
 */
export const MatchForm: React.FC<MatchFormProps> = ({
  onSubmit,
  loading,
  serverError,
  onCancel,
}) => {
  const { colors } = useTheme();

  // Simple state management - like AuthForm but simpler
  const [formData, setFormData] = useState<MatchFormData>({
    title: '',
    description: '',
    location: '',
    scoreLimit: MATCH_SETTINGS.DEFAULT_SCORE_LIMIT,
    winByTwo: MATCH_SETTINGS.DEFAULT_WIN_BY_TWO,
    sinkPoints: MATCH_SETTINGS.DEFAULT_SINK_POINTS as 3 | 5,
    isPublic: false,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof MatchFormData, string>>
  >({});

  // Validate a single field
  const validateField = (
    field: keyof MatchFormData,
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
  const updateField = (field: keyof MatchFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate field when user finishes editing (like AuthForm)
  const handleFieldBlur = (field: keyof MatchFormData) => {
    const error = validateField(field, formData[field]);
    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate all fields
    const newErrors: Partial<Record<keyof MatchFormData, string>> = {};
    let hasErrors = false;

    (Object.keys(formData) as Array<keyof MatchFormData>).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

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
    inputContainer: {
      marginBottom: SPACING.md,
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
    infoCard: {
      backgroundColor: colors.surface,
      padding: SPACING.md,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoText: {
      fontSize: TYPOGRAPHY.sizes.md,
      color: colors.text,
      marginBottom: SPACING.xs,
      lineHeight: 20,
    },
    infoTextBold: {
      fontWeight: TYPOGRAPHY.weights.medium,
    },
    infoTextSmall: {
      fontSize: TYPOGRAPHY.sizes.sm,
      color: colors.textSecondary,
      fontStyle: 'italic',
      marginTop: SPACING.xs,
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
    errorText: {
      fontSize: TYPOGRAPHY.sizes.sm,
      color: colors.error,
      marginTop: SPACING.xs,
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

          {/* Basic Information - Same pattern as AuthForm */}
          <View style={styles.inputContainer}>
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

          <View style={styles.inputContainer}>
            <Input
              label="Description"
              value={formData.description}
              onChangeText={(text: string) => updateField('description', text)}
              onBlur={() => handleFieldBlur('description')}
              error={errors.description}
              placeholder={PLACEHOLDERS.MATCH_DESCRIPTION}
              multiline
              maxLength={500}
              autoCapitalize="sentences"
            />
          </View>

          <View style={styles.inputContainer}>
            <Input
              label="Location"
              value={formData.location}
              onChangeText={(text: string) => updateField('location', text)}
              onBlur={() => handleFieldBlur('location')}
              error={errors.location}
              placeholder={PLACEHOLDERS.ENTER_LOCATION}
              maxLength={100}
              autoCapitalize="words"
            />
          </View>

          {/* Game Settings - Inline and simple */}
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

            {/* Sink Points - FIXED */}
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
                Manual team selection coming in a future update
              </Text>
            </View>
          </View>

          {/* Server Error - Same pattern as AuthForm */}
          {serverError && (
            <View style={styles.errorContainer}>
              <Text style={styles.serverErrorText}>{serverError}</Text>
            </View>
          )}

          {/* Buttons - FIXED: Removed extra Text wrapper */}
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
