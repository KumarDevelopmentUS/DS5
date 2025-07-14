// components/social/Community/MemberList.tsx
import React from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { Avatar } from '../../core/Avatar';
import { Badge } from '../../core/Badge';
import { Card } from '../../core/Card';
import { useTheme } from '../../../hooks/ui/useTheme';
import { usePermissions } from '../../../hooks/auth/usePermissions';
import { formatPlayerName, formatRelativeTime } from '../../../utils/format';
import { User, Community } from '../../../types/models';
import { CommunityMembership } from '../../../utils/permissions';
import { UserRole } from '../../../types/enums';
import { MemberListProps, MemberItemProps } from './Community.types';
import { styles } from './MemberList.styles';

const MemberItem: React.FC<MemberItemProps> = ({
  member,
  membership,
  community,
  onPress,
  onRolePress,
  testID,
}) => {
  const { colors } = useTheme();
  const { canEdit } = usePermissions(community, membership);

  const handlePress = () => {
    if (onPress) {
      onPress(member);
    }
  };

  const handleRolePress = () => {
    if (onRolePress && canEdit && membership) {
      onRolePress(member, membership);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'error';
      case UserRole.MODERATOR:
        return 'warning';
      default:
        return 'default';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Admin';
      case UserRole.MODERATOR:
        return 'Mod';
      default:
        return 'Member';
    }
  };

  return (
    <Card
      variant="default"
      shadow="none"
      padding="md"
      pressable={!!onPress}
      onPress={handlePress}
      style={styles.memberCard}
      testID={testID}
    >
      <View style={styles.memberContent}>
        <Avatar
          source={member.avatarUrl}
          name={member.username}
          size="medium"
          showStatus={true}
          status="offline" // TODO: Implement online status
          testID={`${testID}-avatar`}
        />

        <View style={styles.memberInfo}>
          <View style={styles.memberHeader}>
            <Text
              style={[styles.memberName, { color: colors.text }]}
              numberOfLines={1}
              testID={`${testID}-name`}
            >
              {member.nickname || formatPlayerName(member.username, 16)}
            </Text>

            {membership && (
              <Pressable
                onPress={handleRolePress}
                disabled={!canEdit}
                style={styles.roleBadgeContainer}
                testID={`${testID}-role-button`}
              >
                <Badge
                  variant="label"
                  size="small"
                  color={getRoleBadgeColor(membership.role)}
                  text={getRoleText(membership.role)}
                  pressable={canEdit}
                />
              </Pressable>
            )}
          </View>

          <View style={styles.memberMeta}>
            {member.school && (
              <Text
                style={[styles.memberSchool, { color: colors.textSecondary }]}
                numberOfLines={1}
                testID={`${testID}-school`}
              >
                {member.school}
              </Text>
            )}

            {membership && (
              <>
                {member.school && (
                  <Text
                    style={[styles.separator, { color: colors.textTertiary }]}
                  >
                    •
                  </Text>
                )}
                <Text
                  style={[styles.joinedDate, { color: colors.textTertiary }]}
                  testID={`${testID}-joined`}
                >
                  Joined {formatRelativeTime(membership.joinedAt)}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>
    </Card>
  );
};

export const MemberList: React.FC<MemberListProps> = ({
  members,
  memberships = [],
  community,
  loading = false,
  onMemberPress,
  onRolePress,
  onLoadMore,
  hasMore = false,
  style,
  testID,
}) => {
  const { colors } = useTheme();

  const getMembershipForUser = (
    userId: string
  ): CommunityMembership | undefined => {
    return memberships.find((m) => m.userId === userId);
  };

  const renderMember = ({
    item: member,
    index,
  }: {
    item: User;
    index: number;
  }) => {
    const membership = getMembershipForUser(member.id);

    return (
      <MemberItem
        member={member}
        membership={membership}
        community={community}
        onPress={onMemberPress}
        onRolePress={onRolePress}
        testID={`${testID}-member-${index}`}
      />
    );
  };

  const renderSeparator = () => (
    <View style={[styles.separator, { backgroundColor: colors.border }]} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        No members found
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;

    return (
      <View style={styles.footerContainer}>
        <Pressable
          style={[styles.loadMoreButton, { borderColor: colors.border }]}
          onPress={onLoadMore}
          testID={`${testID}-load-more`}
        >
          <Text style={[styles.loadMoreText, { color: colors.primary }]}>
            Load More Members
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View
      style={style ? (Array.isArray(style) ? style : [style]) : undefined}
      testID={testID}
    >
      <FlatList
        data={members}
        renderItem={renderMember}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={renderSeparator}
        ListEmptyComponent={!loading ? renderEmpty : null}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};
