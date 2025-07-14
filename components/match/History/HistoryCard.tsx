// components/match/History/HistoryCard.tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Card } from '../../core/Card';
import { Avatar } from '../../core/Avatar';
import { Badge } from '../../core/Badge';
import { HistoryCardProps, MatchHistoryItem } from './History.types';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  formatRelativeTime,
  formatDuration,
  formatScore,
  capitalize,
} from '../../../utils/format';
import { SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { MatchStatus } from '../../../types/enums';

export const HistoryCard: React.FC<HistoryCardProps> = ({
  match,
  onPress,
  onLongPress,
  showResult = true,
  showOpponents = true,
  showDuration = false,
  showGameType = true,
  compact = false,
  style,
  testID,
}) => {
  const { colors } = useTheme();

  // Cast to extended type for easier access to computed properties
  const historyMatch = match as MatchHistoryItem;

  // Get result badge color
  const getResultColor = () => {
    switch (historyMatch.result) {
      case 'win':
        return 'success';
      case 'loss':
        return 'error';
      case 'tie':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Get status badge color
  const getStatusColor = () => {
    switch (match.status) {
      case MatchStatus.COMPLETED:
        return 'success';
      case MatchStatus.ABANDONED:
        return 'error';
      default:
        return 'default';
    }
  };

  // Format match duration
  const getFormattedDuration = () => {
    if (!historyMatch.duration) return null;
    return formatDuration(historyMatch.duration * 60); // Convert minutes to seconds
  };

  // Format match date
  const getFormattedDate = () => {
    const date = match.endedAt || match.createdAt;
    return formatRelativeTime(date);
  };

  // Get opponent display text
  const getOpponentText = () => {
    if (!historyMatch.opponents || historyMatch.opponents.length === 0) {
      return 'Unknown opponents';
    }

    if (historyMatch.opponents.length === 1) {
      return historyMatch.opponents[0].username;
    }

    if (historyMatch.opponents.length === 2) {
      return `${historyMatch.opponents[0].username} & ${historyMatch.opponents[1].username}`;
    }

    return `${historyMatch.opponents[0].username} & ${historyMatch.opponents.length - 1} others`;
  };

  // Handle press
  const handlePress = () => {
    if (onPress) {
      onPress(match);
    }
  };

  // Handle long press
  const handleLongPress = () => {
    if (onLongPress) {
      onLongPress(match);
    }
  };

  // Render header with title and status
  const renderHeader = () => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: compact ? SPACING.xs : SPACING.sm,
      }}
    >
      <Text
        style={{
          fontSize: compact ? TYPOGRAPHY.sizes.sm : TYPOGRAPHY.sizes.md,
          fontFamily: TYPOGRAPHY.fontFamily.medium,
          color: colors.text,
          flex: 1,
          marginRight: SPACING.sm,
        }}
        numberOfLines={1}
        testID={`${testID}-title`}
      >
        {match.title}
      </Text>

      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs }}
      >
        {/* Game type badge */}
        {showGameType && (
          <Badge
            text={capitalize(match.gameType)}
            variant="label"
            size="small"
            color="info"
            testID={`${testID}-game-type`}
          />
        )}

        {/* Status badge */}
        <Badge
          text={capitalize(match.status)}
          variant="label"
          size="small"
          color={getStatusColor()}
          testID={`${testID}-status`}
        />
      </View>
    </View>
  );

  // Render score section
  const renderScore = () => {
    if (
      !showResult ||
      (!historyMatch.userScore && !historyMatch.opponentScore)
    ) {
      return null;
    }

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: compact ? SPACING.xs : SPACING.sm,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
          }}
        >
          <Text
            style={{
              fontSize: compact ? TYPOGRAPHY.sizes.lg : TYPOGRAPHY.sizes.xl,
              fontFamily: TYPOGRAPHY.fontFamily.bold,
              color: colors.text,
              marginRight: SPACING.sm,
            }}
          >
            {formatScore(
              historyMatch.userScore || 0,
              historyMatch.opponentScore || 0
            )}
          </Text>

          {/* Result badge */}
          {historyMatch.result && (
            <Badge
              text={historyMatch.result.toUpperCase()}
              variant="achievement"
              size={compact ? 'small' : 'medium'}
              color={getResultColor()}
              testID={`${testID}-result`}
            />
          )}
        </View>

        {/* Duration if available */}
        {showDuration && getFormattedDuration() && (
          <Text
            style={{
              fontSize: TYPOGRAPHY.sizes.sm,
              fontFamily: TYPOGRAPHY.fontFamily.regular,
              color: colors.textSecondary,
            }}
          >
            {getFormattedDuration()}
          </Text>
        )}
      </View>
    );
  };

  // Render opponents section
  const renderOpponents = () => {
    if (!showOpponents) return null;

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: compact ? SPACING.xs : SPACING.sm,
        }}
      >
        {/* Opponent avatars (max 3) */}
        <View
          style={{
            flexDirection: 'row',
            marginRight: SPACING.sm,
          }}
        >
          {historyMatch.opponents?.slice(0, 3).map((opponent, index) => (
            <Avatar
              key={opponent.id}
              source={opponent.avatarUrl}
              name={opponent.username}
              size={compact ? 'small' : 'medium'}
              style={{
                marginLeft: index > 0 ? -8 : 0, // Overlap avatars slightly
                zIndex: 3 - index, // Ensure proper stacking
              }}
              testID={`${testID}-opponent-${index}`}
            />
          ))}
        </View>

        {/* Opponent text */}
        <Text
          style={{
            fontSize: compact ? TYPOGRAPHY.sizes.sm : TYPOGRAPHY.sizes.md,
            fontFamily: TYPOGRAPHY.fontFamily.regular,
            color: colors.textSecondary,
            flex: 1,
          }}
        >
          vs {getOpponentText()}
        </Text>
      </View>
    );
  };

  // Render footer with date and MVP
  const renderFooter = () => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontSize: TYPOGRAPHY.sizes.sm,
          fontFamily: TYPOGRAPHY.fontFamily.regular,
          color: colors.textTertiary,
        }}
      >
        {getFormattedDate()}
      </Text>

      {/* MVP indicator */}
      {historyMatch.mvpPlayer && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Badge
            text="MVP"
            variant="achievement"
            size="small"
            color="gold"
            style={{ marginRight: SPACING.xs }}
          />
          <Avatar
            source={historyMatch.mvpPlayer.avatarUrl}
            name={historyMatch.mvpPlayer.username}
            size="small"
            testID={`${testID}-mvp`}
          />
        </View>
      )}
    </View>
  );

  return (
    <Card
      variant="default"
      shadow="sm"
      padding={compact ? 'sm' : 'md'}
      margin="xs"
      pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={[
        {
          borderLeftWidth: 4,
          borderLeftColor:
            historyMatch.result === 'win'
              ? colors.success
              : historyMatch.result === 'loss'
                ? colors.error
                : colors.border,
        },
        ...(Array.isArray(style) ? style : style ? [style] : []),
      ]}
      testID={testID}
    >
      {renderHeader()}
      {renderScore()}
      {renderOpponents()}
      {renderFooter()}
    </Card>
  );
};
