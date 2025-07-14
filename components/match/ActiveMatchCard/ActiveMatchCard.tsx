// components/match/ActiveMatchCard/ActiveMatchCard.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';

// Types
import {
  ActiveMatchCardProps,
  MatchParticipantAvatarProps,
  MatchMetadataProps,
} from './ActiveMatchCard.types';
import { MatchStatus } from '../../../types/enums';

// Components
import { Card } from '../../core/Card/Card';
import { Avatar } from '../../core/Avatar/Avatar';
import { Badge } from '../../core/Badge/Badge';
import { Button } from '../../core/Button/Button';

// Utilities
import { formatRelativeTime } from '../../../utils/format';

// Hooks
import { useAuth } from '../../../hooks/auth/useAuth';
import { useTheme } from '../../../hooks/ui/useTheme';

// Styles
import { createStyles } from './ActiveMatchCard.styles';

// Helper component for participant avatars
const MatchParticipantAvatar: React.FC<MatchParticipantAvatarProps> = ({
  participant,
  size = 'small',
  showOnlineStatus = false,
}) => (
  <Avatar
    source={participant.avatarUrl}
    name={participant.nickname || participant.username}
    size={size === 'small' ? 'small' : 'medium'}
    showStatus={showOnlineStatus}
    status="online" // TODO: Get actual online status
  />
);

// Helper component for match metadata
const MatchMetadata: React.FC<MatchMetadataProps> = ({
  match,
  compact = false,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const getTimeDisplay = () => {
    if (match.status === MatchStatus.ACTIVE && match.startedAt) {
      return `Started ${formatRelativeTime(match.startedAt)}`;
    }
    if (match.createdAt) {
      return `Created ${formatRelativeTime(match.createdAt)}`;
    }
    return '';
  };

  const getLocationDisplay = () => {
    if (match.location) {
      return match.location;
    }
    return 'No location set';
  };

  if (compact) {
    return (
      <View style={styles.metadataContainer}>
        <Text style={styles.metadataText}>{getTimeDisplay()}</Text>
        <Text style={styles.roomCode}>{match.roomCode}</Text>
      </View>
    );
  }

  return (
    <View style={styles.metadataContainer}>
      <View style={styles.metadataItem}>
        <Text style={styles.metadataText}>
          <Text style={styles.metadataTextBold}>Location:</Text>{' '}
          {getLocationDisplay()}
        </Text>
      </View>
      <View style={styles.metadataItem}>
        <Text style={styles.roomCode}>{match.roomCode}</Text>
      </View>
    </View>
  );
};

export const ActiveMatchCard: React.FC<ActiveMatchCardProps> = ({
  match,
  onJoin,
  onView,
  onShare,
  showActions = true,
  showParticipants = true,
  maxVisibleParticipants = 4,
  style,
  testID,
}) => {
  const { user: authUser } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // Skip permission checking - just check if user exists and is authenticated
  const canUserJoin = !!authUser;

  // Check if user is already a participant (safe to use authUser.id)
  const isParticipant =
    match.participants?.some((p) => p.userId === authUser?.id) || false;

  // Get status display
  const getStatusBadge = () => {
    switch (match.status) {
      case MatchStatus.ACTIVE:
        return (
          <View style={styles.liveIndicator}>
            <View style={styles.liveIndicatorDot} />
            <Text style={styles.liveIndicatorText}>Live</Text>
          </View>
        );
      case MatchStatus.PENDING:
        return (
          <Badge text="Waiting" variant="label" size="small" color="warning" />
        );
      case MatchStatus.PAUSED:
        return (
          <Badge text="Paused" variant="label" size="small" color="info" />
        );
      default:
        return null;
    }
  };

  // Render participants section
  const renderParticipants = () => {
    if (!showParticipants) return null;

    const participants = match.participants || [];

    if (participants.length === 0) {
      return (
        <View style={styles.emptyParticipants}>
          <Text style={styles.emptyParticipantsText}>No players yet</Text>
        </View>
      );
    }

    const visibleParticipants = participants.slice(0, maxVisibleParticipants);
    const remainingCount = participants.length - maxVisibleParticipants;

    return (
      <View style={styles.participantsContainer}>
        <View style={styles.participantAvatars}>
          {visibleParticipants.map((participant, index) => (
            <View
              key={participant.userId}
              style={[
                styles.participantAvatar,
                index === 0 && styles.participantAvatarFirst,
              ]}
            >
              <MatchParticipantAvatar
                participant={participant}
                size="small"
                showOnlineStatus={match.status === MatchStatus.ACTIVE}
              />
            </View>
          ))}

          {remainingCount > 0 && (
            <View style={styles.moreParticipants}>
              <Text style={styles.moreParticipantsText}>+{remainingCount}</Text>
            </View>
          )}
        </View>

        <Text style={styles.participantCount}>
          {participants.length}{' '}
          {participants.length === 1 ? 'player' : 'players'}
        </Text>
      </View>
    );
  };

  // Render current score (if match is active)
  const renderScore = () => {
    if (match.status !== MatchStatus.ACTIVE || !match.currentScore) return null;

    const scores = Object.values(match.currentScore);
    if (scores.length !== 2) return null;

    return (
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>{scores[0]}</Text>
        <Text style={styles.scoreVs}>vs</Text>
        <Text style={styles.scoreText}>{scores[1]}</Text>
      </View>
    );
  };

  // Handle navigation to match
  const handleViewMatch = () => {
    if (onView) {
      onView(match.id);
    } else {
      // Use string template for routing
      router.push(`/match/${match.id}` as any);
    }
  };

  // Handle join match
  const handleJoinMatch = () => {
    if (onJoin) {
      onJoin(match.id);
    } else {
      // Default join behavior - navigate to match
      router.push(`/match/${match.id}` as any);
    }
  };

  // Handle share match
  const handleShareMatch = () => {
    if (onShare) {
      onShare(match.id);
    }
    // TODO: Implement default share behavior
  };

  // Render action buttons
  const renderActions = () => {
    if (!showActions) return null;

    const buttons = [];

    // Primary action button
    if (isParticipant || match.status === MatchStatus.ACTIVE) {
      buttons.push(
        <Button
          key="view"
          variant="primary"
          size="medium"
          onPress={handleViewMatch}
          style={styles.primaryAction}
          testID={`${testID}-view-button`}
        >
          {match.status === MatchStatus.ACTIVE ? 'Join Game' : 'View Match'}
        </Button>
      );
    } else if (canUserJoin && match.status === MatchStatus.PENDING) {
      buttons.push(
        <Button
          key="join"
          variant="primary"
          size="medium"
          onPress={handleJoinMatch}
          style={styles.primaryAction}
          testID={`${testID}-join-button`}
        >
          Join Match
        </Button>
      );
    } else {
      buttons.push(
        <Button
          key="view"
          variant="outline"
          size="medium"
          onPress={handleViewMatch}
          style={styles.primaryAction}
          testID={`${testID}-view-button`}
        >
          View Details
        </Button>
      );
    }

    // Secondary action - Share
    if (onShare) {
      buttons.push(
        <Button
          key="share"
          variant="ghost"
          size="medium"
          onPress={handleShareMatch}
          style={styles.actionButton}
          testID={`${testID}-share-button`}
        >
          Share
        </Button>
      );
    }

    return <View style={styles.actionsContainer}>{buttons}</View>;
  };

  return (
    <Card
      variant="elevated"
      shadow="md"
      padding="lg"
      pressable={false}
      style={
        style
          ? [styles.container, ...(Array.isArray(style) ? style : [style])]
          : styles.container
      }
      testID={testID}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title} numberOfLines={1}>
            {match.title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {match.gameType} • {match.description || 'No description'}
          </Text>
        </View>
        <View style={styles.statusContainer}>{getStatusBadge()}</View>
      </View>

      {/* Current Score (if active) */}
      {renderScore()}

      {/* Participants */}
      {renderParticipants()}

      {/* Metadata */}
      <MatchMetadata match={match} compact />

      {/* Time Display */}
      <View style={styles.metadataContainer}>
        <Text style={styles.metadataText}>
          {match.status === MatchStatus.ACTIVE && match.startedAt
            ? `Started ${formatRelativeTime(match.startedAt)}`
            : `Created ${formatRelativeTime(match.createdAt)}`}
        </Text>
      </View>

      {/* Actions */}
      {renderActions()}
    </Card>
  );
};
