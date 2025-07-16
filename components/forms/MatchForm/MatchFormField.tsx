// components/forms/MatchForm/MatchFormField.tsx
import React, { useCallback, memo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import type { MatchFormFieldProps } from './MatchForm.types';

/**
 * Reusable form field component for match creation
 *
 * Supports text input, multiline text, and error display with
 * consistent styling and behavior across all form fields.
 *
 * MEMO WRAPPED to prevent unnecessary re-renders that cause TextInput focus loss
 */
const MatchFormField: React.FC<MatchFormFieldProps> = memo(
  ({
    label,
    value,
    onValueChange,
    error,
    placeholder,
    required = false,
    multiline = false,
    keyboardType = 'default',
    maxLength,
    onClearError,
  }) => {
    const hasError = !!error;
    const isEmpty =
      !value || (typeof value === 'string' && value.trim().length === 0);

    // Stable function references using useCallback
    const handleChangeText = useCallback(
      (text: string) => {
        onValueChange(text);
        if (hasError && onClearError) {
          onClearError();
        }
      },
      [onValueChange, hasError, onClearError]
    );

    const handleClear = useCallback(() => {
      onValueChange('');
    }, [onValueChange]);

    return (
      <View style={styles.container}>
        {/* Label */}
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
          {maxLength && typeof value === 'string' && (
            <Text style={styles.charCount}>
              {value.length}/{maxLength}
            </Text>
          )}
        </View>

        {/* Input */}
        <View
          style={[
            styles.inputContainer,
            hasError && styles.inputContainerError,
          ]}
        >
          <TextInput
            style={[styles.input, multiline && styles.inputMultiline]}
            value={typeof value === 'string' ? value : String(value)}
            onChangeText={handleChangeText}
            placeholder={placeholder}
            placeholderTextColor={COLORS.light.textSecondary}
            keyboardType={keyboardType}
            multiline={multiline}
            numberOfLines={multiline ? 4 : 1}
            maxLength={maxLength}
            textAlignVertical={multiline ? 'top' : 'center'}
          />

          {/* Clear button */}
          {!isEmpty && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={16} color={COLORS.light.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Error */}
        {hasError && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }
);

// Add display name for debugging
MatchFormField.displayName = 'MatchFormField';

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.light.text,
  },
  required: {
    color: COLORS.light.error,
  },
  charCount: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.light.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.light.surface,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  inputContainerError: {
    borderColor: COLORS.light.error,
    backgroundColor: COLORS.light.error + '05',
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.light.text,
    padding: 0,
    margin: 0,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  clearButton: {
    marginLeft: SPACING.xs,
    marginTop: Platform.OS === 'ios' ? 2 : 0,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.light.error,
    marginTop: SPACING.xs,
  },
});

export default MatchFormField;
