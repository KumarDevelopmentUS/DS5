// components/layout/LoadingStates/EmptyState.tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { EmptyStateProps, EmptyStateAction } from './LoadingStates.types';
import { styles } from './LoadingStates.styles';
import { useTheme } from '../../../contexts/ThemeContext';
import { Spinner } from './Spinner';

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No data found',
  message = 'There are no items to display at this time.',
  icon,
  primaryAction,
  secondaryAction,
  style,
  titleStyle,
  messageStyle,
  testID,
}) => {
  const { colors } = useTheme();

  const renderIcon = () => {
    if (!icon) {
      // Default empty state icon - you can replace with a custom icon
      return (
        <View
          style={[
            styles.emptyStateIcon,
            {
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: colors.fill,
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}
        >
          <Text style={{ fontSize: 24, color: colors.textSecondary }}>📭</Text>
        </View>
      );
    }

    return <View style={styles.emptyStateIcon}>{icon}</View>;
  };

  const renderAction = (action: EmptyStateAction, isPrimary: boolean) => {
    const buttonStyle = [
      styles.emptyStateButton,
      isPrimary
        ? styles.emptyStateButtonPrimary
        : styles.emptyStateButtonSecondary,
      isPrimary
        ? { backgroundColor: colors.primary }
        : {
            backgroundColor: 'transparent',
            borderColor: colors.border,
          },
    ];

    const textStyle = [
      styles.emptyStateButtonText,
      {
        color: isPrimary ? '#FFFFFF' : colors.primary,
      },
    ];

    return (
      <Pressable
        key={action.label}
        style={buttonStyle}
        onPress={action.onPress}
        disabled={action.disabled || action.loading}
        testID={action.testID}
      >
        {action.loading ? (
          <Spinner size="small" variant={isPrimary ? 'light' : 'primary'} />
        ) : (
          <Text style={textStyle}>{action.label}</Text>
        )}
      </Pressable>
    );
  };

  const renderActions = () => {
    if (!primaryAction && !secondaryAction) return null;

    return (
      <View style={styles.emptyStateActions}>
        {primaryAction && renderAction(primaryAction, true)}
        {secondaryAction && renderAction(secondaryAction, false)}
      </View>
    );
  };

  return (
    <View style={[styles.emptyStateContainer, style]} testID={testID}>
      {renderIcon()}

      <Text
        style={[styles.emptyStateTitle, { color: colors.text }, titleStyle]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.emptyStateMessage,
          { color: colors.textSecondary },
          messageStyle,
        ]}
      >
        {message}
      </Text>

      {renderActions()}
    </View>
  );
};

// Pre-built empty state variants for common scenarios
export const NoMatchesEmptyState: React.FC<{
  onCreateMatch?: () => void;
  testID?: string;
}> = ({ onCreateMatch, testID }) => (
  <EmptyState
    title="No matches found"
    message="You haven't played any matches yet. Start your first game to begin tracking your stats!"
    icon={<Text style={{ fontSize: 48 }}>🎲</Text>}
    primaryAction={
      onCreateMatch
        ? {
            label: 'Create Match',
            onPress: onCreateMatch,
            testID: `${testID}-create-match`,
          }
        : undefined
    }
    testID={testID}
  />
);

export const NoFriendsEmptyState: React.FC<{
  onInviteFriends?: () => void;
  testID?: string;
}> = ({ onInviteFriends, testID }) => (
  <EmptyState
    title="No friends yet"
    message="Connect with friends to share your gaming achievements and compete together!"
    icon={<Text style={{ fontSize: 48 }}>👥</Text>}
    primaryAction={
      onInviteFriends
        ? {
            label: 'Invite Friends',
            onPress: onInviteFriends,
            testID: `${testID}-invite-friends`,
          }
        : undefined
    }
    testID={testID}
  />
);

export const NoCommunitiesEmptyState: React.FC<{
  onJoinCommunity?: () => void;
  testID?: string;
}> = ({ onJoinCommunity, testID }) => (
  <EmptyState
    title="No communities"
    message="Join communities to connect with other players and participate in group discussions!"
    icon={<Text style={{ fontSize: 48 }}>🏘️</Text>}
    primaryAction={
      onJoinCommunity
        ? {
            label: 'Browse Communities',
            onPress: onJoinCommunity,
            testID: `${testID}-browse-communities`,
          }
        : undefined
    }
    testID={testID}
  />
);

export const NetworkErrorEmptyState: React.FC<{
  onRetry?: () => void;
  retrying?: boolean;
  testID?: string;
}> = ({ onRetry, retrying, testID }) => (
  <EmptyState
    title="Connection Error"
    message="Unable to load data. Please check your internet connection and try again."
    icon={<Text style={{ fontSize: 48 }}>📡</Text>}
    primaryAction={
      onRetry
        ? {
            label: 'Try Again',
            onPress: onRetry,
            loading: retrying,
            testID: `${testID}-retry`,
          }
        : undefined
    }
    testID={testID}
  />
);
