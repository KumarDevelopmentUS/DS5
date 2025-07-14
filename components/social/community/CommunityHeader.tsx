// components/social/Community/CommunityHeader.tsx
import React from 'react';
import { View, Text, ImageBackground, Pressable } from 'react-native';
import { Avatar } from '../../core/Avatar';
import { Badge } from '../../core/Badge';
import { Button } from '../../core/Button';
import { useTheme } from '../../../hooks/ui/useTheme';
import { usePermissions } from '../../../hooks/auth/usePermissions';
import { formatNumber } from '../../../utils/format';
import { Community } from '../../../types/models';
import { CommunityHeaderProps } from './Community.types';
import { styles } from './CommunityHeader.styles';

export const CommunityHeader: React.FC<CommunityHeaderProps> = ({
  community,
  showActions = true,
  onJoinPress,
  onSettingsPress,
  onMembersPress,
  style,
  testID,
}) => {
  const { colors } = useTheme();
  const { canEdit } = usePermissions(community);

  const isAlreadyMember = community.userRole !== undefined;
  const canJoin = !isAlreadyMember && community.canJoin && !community.isPrivate;

  const handleJoinPress = () => {
    if (onJoinPress) {
      onJoinPress(community);
    }
  };

  const handleSettingsPress = () => {
    if (onSettingsPress) {
      onSettingsPress(community);
    }
  };

  const handleMembersPress = () => {
    if (onMembersPress) {
      onMembersPress(community);
    }
  };

  const renderBanner = () => {
    if (community.bannerUrl) {
      return (
        <ImageBackground
          source={{ uri: community.bannerUrl }}
          style={styles.bannerImage}
          testID={`${testID}-banner`}
        >
          <View
            style={[
              styles.bannerOverlay,
              { backgroundColor: 'rgba(0,0,0,0.3)' },
            ]}
          />
        </ImageBackground>
      );
    }

    return (
      <View
        style={[styles.bannerPlaceholder, { backgroundColor: colors.primary }]}
        testID={`${testID}-banner-placeholder`}
      />
    );
  };

  const renderAvatar = () => (
    <View style={styles.avatarContainer}>
      <Avatar
        source={community.avatarUrl}
        name={community.name}
        size="xlarge"
        style={[styles.avatar, { borderColor: colors.background }]}
        testID={`${testID}-avatar`}
      />
    </View>
  );

  const renderInfo = () => (
    <View style={styles.infoContainer}>
      <View style={styles.titleRow}>
        <Text
          style={[styles.title, { color: colors.text }]}
          testID={`${testID}-title`}
        >
          {community.name}
        </Text>

        <View style={styles.badges}>
          {community.isPrivate && (
            <Badge
              variant="label"
              size="medium"
              color="info"
              text="Private"
              style={styles.badge}
              testID={`${testID}-private-badge`}
            />
          )}

          {canEdit && (
            <Badge
              variant="label"
              size="medium"
              color="warning"
              text="Admin"
              style={styles.badge}
              testID={`${testID}-admin-badge`}
            />
          )}
        </View>
      </View>

      {community.description && (
        <Text
          style={[styles.description, { color: colors.textSecondary }]}
          testID={`${testID}-description`}
        >
          {community.description}
        </Text>
      )}

      <View style={styles.metaRow}>
        <Pressable
          style={styles.memberButton}
          onPress={handleMembersPress}
          testID={`${testID}-members-button`}
        >
          <Text style={[styles.memberCount, { color: colors.text }]}>
            {formatNumber(community.memberCount)}
          </Text>
          <Text style={[styles.memberLabel, { color: colors.textSecondary }]}>
            {community.memberCount === 1 ? 'member' : 'members'}
          </Text>
        </Pressable>

        {community.school && (
          <>
            <Text style={[styles.separator, { color: colors.textTertiary }]}>
              •
            </Text>
            <Text
              style={[styles.school, { color: colors.textSecondary }]}
              testID={`${testID}-school`}
            >
              {community.school}
            </Text>
          </>
        )}
      </View>
    </View>
  );

  const renderActions = () => {
    if (!showActions) return null;

    return (
      <View style={styles.actionsContainer}>
        {canJoin && (
          <Button
            variant="primary"
            size="medium"
            onPress={handleJoinPress}
            style={styles.actionButton}
            testID={`${testID}-join-button`}
          >
            Join Community
          </Button>
        )}

        {isAlreadyMember && !canEdit && (
          <Button
            variant="outline"
            size="medium"
            onPress={() => {}} // TODO: Implement leave functionality
            style={styles.actionButton}
            testID={`${testID}-leave-button`}
          >
            Leave
          </Button>
        )}

        {canEdit && (
          <Button
            variant="outline"
            size="medium"
            onPress={handleSettingsPress}
            style={styles.actionButton}
            testID={`${testID}-settings-button`}
          >
            Settings
          </Button>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      {renderBanner()}
      {renderAvatar()}
      {renderInfo()}
      {renderActions()}
    </View>
  );
};
