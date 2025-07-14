// components/match/History/HistoryEmpty.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Button } from '../../core/Button';
import { HistoryEmptyProps } from './History.types';
import { useTheme } from '../../../contexts/ThemeContext';
import { SPACING, TYPOGRAPHY } from '../../../constants/theme';

export const HistoryEmpty: React.FC<HistoryEmptyProps> = ({
  onCreateMatch,
  message,
  style,
  testID,
}) => {
  const { colors } = useTheme();

  const defaultMessage = onCreateMatch
    ? 'No matches yet! Start playing to build your history.'
    : 'No matches found. Try adjusting your filters.';

  return (
    <View
      style={[
        {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: SPACING.xl,
          paddingVertical: SPACING.xxl,
        },
        style,
      ]}
      testID={testID}
    >
      {/* Empty state illustration placeholder */}
      <View
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: colors.fillSecondary,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: SPACING.xl,
        }}
      >
        {/* TODO: Add empty state illustration */}
        <Text
          style={{
            fontSize: 48,
            color: colors.textTertiary,
          }}
        >
          📋
        </Text>
      </View>

      {/* Title */}
      <Text
        style={{
          fontSize: TYPOGRAPHY.sizes.title3,
          fontFamily: TYPOGRAPHY.fontFamily.medium,
          color: colors.text,
          textAlign: 'center',
          marginBottom: SPACING.sm,
        }}
      >
        No Match History
      </Text>

      {/* Message */}
      <Text
        style={{
          fontSize: TYPOGRAPHY.sizes.body,
          fontFamily: TYPOGRAPHY.fontFamily.regular,
          color: colors.textSecondary,
          textAlign: 'center',
          lineHeight: TYPOGRAPHY.sizes.body * TYPOGRAPHY.lineHeights.relaxed,
          marginBottom: SPACING.xl,
        }}
      >
        {message || defaultMessage}
      </Text>

      {/* Action Button */}
      {onCreateMatch && (
        <Button
          variant="primary"
          size="large"
          onPress={onCreateMatch}
          testID={`${testID}-create-match`}
        >
          Create Your First Match
        </Button>
      )}
    </View>
  );
};
