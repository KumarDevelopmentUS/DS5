// components/social/Community/CommunityCard.tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Card } from '../../core/Card';
import { Avatar } from '../../core/Avatar';
import { Badge } from '../../core/Badge';
import { useTheme } from '../../../hooks/ui/useTheme';
import { usePermissions } from '../../../hooks/auth/usePermissions';
import { formatPlayerName, formatNumber } from '../../../utils/format';
import { Community } from '../../../types/models';
import { CommunityCardProps } from './Community.types';
import { styles } from './CommunityCard.styles';

export const CommunityCard: React.FC<CommunityCardProps> = ({
  community,
  variant = 'default',
  showJoinButton = true,
  onPress,
  onJoinPress,
  style,
  testID,
}) => {
  const { colors } = useTheme();
  const { canEdit } = usePermissions(community);

  const handlePress = () => {
    if (onPress) {
      onPress(community);
    }
  };

  const handleJoinPress = (event: any) => {
    event.stopPropagation();
    if (onJoinPress) {
      onJoinPress(community);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Avatar
        source={community.avatarUrl}
        name={community.name}
        size={variant === 'compact' ? 'small' : 'medium'}
        testID={`${testID}-avatar`}
      />

      <View style={styles.headerContent}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={1}
            testID={`${testID}-title`}
          >
            {formatPlayerName(community.name, 20)}
          </Text>

          {community.isPrivate && (
            <Badge
              variant="label"
              size="small"
              color="info"
              text="Private"
              testID={`${testID}-private-badge`}
            />
          )}

          {canEdit && (
            <Badge
              variant="label"
              size="small"
              color="warning"
              text="Admin"
              testID={`${testID}-admin-badge`}
            />
          )}
        </View>

        <View style={styles.metaRow}>
          <Text
            style={[styles.memberCount, { color: colors.textSecondary }]}
            testID={`${testID}-member-count`}
          >
            {formatNumber(community.memberCount)} members
          </Text>

          {community.school && (
            <>
              <Text style={[styles.separator, { color: colors.textTertiary }]}>
                •
              </Text>
              <Text
                style={[styles.school, { color: colors.textSecondary }]}
                numberOfLines={1}
                testID={`${testID}-school`}
              >
                {community.school}
              </Text>
            </>
          )}
        </View>
      </View>
    </View>
  );

  const renderDescription = () => {
    if (!community.description || variant === 'compact') return null;

    return (
      <Text
        style={[styles.description, { color: colors.textSecondary }]}
        numberOfLines={variant === 'preview' ? 2 : undefined}
        testID={`${testID}-description`}
      >
        {community.description}
      </Text>
    );
  };

  const renderActions = () => {
    if (!showJoinButton || variant === 'compact') return null;

    const isAlreadyMember = community.userRole !== undefined;

    return (
      <View style={styles.actions}>
        {!isAlreadyMember && community.canJoin && (
          <Pressable
            style={[
              styles.joinButton,
              {
                backgroundColor: colors.primary,
                borderColor: colors.primary,
              },
            ]}
            onPress={handleJoinPress}
            testID={`${testID}-join-button`}
          >
            <Text style={[styles.joinButtonText, { color: '#FFFFFF' }]}>
              Join
            </Text>
          </Pressable>
        )}

        {isAlreadyMember && (
          <Badge
            variant="label"
            size="medium"
            color="success"
            text="Joined"
            testID={`${testID}-joined-badge`}
          />
        )}
      </View>
    );
  };

  return (
    <Card
      variant="default"
      shadow="sm"
      padding="md"
      pressable={!!onPress}
      onPress={handlePress}
      style={
        style
          ? [styles.card, ...(Array.isArray(style) ? style : [style])]
          : styles.card
      }
      testID={testID}
    >
      {renderHeader()}
      {renderDescription()}
      {renderActions()}
    </Card>
  );
};
