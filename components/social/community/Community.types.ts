// components/social/Community/Community.types.ts
import { ViewStyle } from 'react-native';
import { Community, User } from '../../../types/models';
import { CommunityMembership } from '../../../utils/permissions';
import { UserRole } from '../../../types/enums';

// ============================================
// COMMUNITY CARD TYPES
// ============================================

export type CommunityCardVariant = 'default' | 'compact' | 'preview';

export interface CommunityCardProps {
  community: Community;
  variant?: CommunityCardVariant;
  showJoinButton?: boolean;
  onPress?: (community: Community) => void;
  onJoinPress?: (community: Community) => void;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
}

// ============================================
// COMMUNITY HEADER TYPES
// ============================================

export interface CommunityHeaderProps {
  community: Community;
  showActions?: boolean;
  onJoinPress?: (community: Community) => void;
  onLeavePress?: (community: Community) => void;
  onSettingsPress?: (community: Community) => void;
  onMembersPress?: (community: Community) => void;
  onBannerPress?: (community: Community) => void;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
}

// ============================================
// MEMBER LIST TYPES
// ============================================

export interface MemberItemProps {
  member: User;
  membership?: CommunityMembership;
  community: Community;
  onPress?: (member: User) => void;
  onRolePress?: (member: User, membership: CommunityMembership) => void;
  onBanPress?: (member: User) => void;
  onRemovePress?: (member: User) => void;
  showActions?: boolean;
  testID?: string;
}

export interface MemberListProps {
  members: User[];
  memberships?: CommunityMembership[];
  community: Community;
  loading?: boolean;
  onMemberPress?: (member: User) => void;
  onRolePress?: (member: User, membership: CommunityMembership) => void;
  onBanPress?: (member: User) => void;
  onRemovePress?: (member: User) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  showActions?: boolean;
  filterByRole?: UserRole;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
}

// ============================================
// COMMUNITY GRID TYPES
// ============================================

export interface CommunityGridProps {
  communities: Community[];
  loading?: boolean;
  numColumns?: number;
  onCommunityPress?: (community: Community) => void;
  onJoinPress?: (community: Community) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  emptyMessage?: string;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
}

// ============================================
// COMMUNITY SEARCH TYPES
// ============================================

export interface CommunitySearchProps {
  onSearch: (query: string) => void;
  onFilterChange?: (filters: CommunityFilters) => void;
  placeholder?: string;
  loading?: boolean;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
}

export interface CommunityFilters {
  school?: string;
  isPrivate?: boolean;
  minMembers?: number;
  maxMembers?: number;
  hasOpenJoining?: boolean;
  tags?: string[];
}

// ============================================
// COMMUNITY STATS TYPES
// ============================================

export interface CommunityStatsProps {
  community: Community;
  stats: CommunityStats;
  showDetailed?: boolean;
  onStatPress?: (statType: string, value: number) => void;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
}

export interface CommunityStats {
  totalMembers: number;
  activeMembers: number;
  totalPosts: number;
  postsThisWeek: number;
  totalMatches: number;
  matchesThisWeek: number;
  averageMatchDuration?: number;
  topContributors?: User[];
  memberGrowth?: number; // Percentage growth
  engagementScore?: number; // 0-100 score
}

// ============================================
// COMMUNITY INVITATION TYPES
// ============================================

export interface CommunityInviteProps {
  community: Community;
  onInvitePress: (community: Community, method: InviteMethod) => void;
  availableMethods?: InviteMethod[];
  style?: ViewStyle | ViewStyle[];
  testID?: string;
}

export type InviteMethod = 'link' | 'email' | 'message' | 'qr';

export interface CommunityInviteData {
  communityId: string;
  inviteCode: string;
  expiresAt?: Date;
  maxUses?: number;
  currentUses: number;
  createdBy: string;
  createdAt: Date;
}

// ============================================
// COMMUNITY MODERATION TYPES
// ============================================

export interface ModerationActionProps {
  member: User;
  community: Community;
  currentMembership: CommunityMembership;
  onRoleChange: (newRole: UserRole) => void;
  onBan: () => void;
  onRemove: () => void;
  onUnban?: () => void;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
}

export interface BannedMemberProps {
  member: User;
  banInfo: BanInfo;
  community: Community;
  onUnban: (member: User) => void;
  onViewDetails: (member: User, banInfo: BanInfo) => void;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
}

export interface BanInfo {
  bannedAt: Date;
  bannedBy: string;
  reason?: string;
  expiresAt?: Date;
  isTemporary: boolean;
}

// ============================================
// COMMUNITY SETTINGS TYPES
// ============================================

export interface CommunitySettingsFormProps {
  community: Community;
  onSave: (updatedCommunity: Partial<Community>) => void;
  loading?: boolean;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
}

export interface CommunityRulesProps {
  community: Community;
  rules: CommunityRule[];
  onRulePress?: (rule: CommunityRule) => void;
  editable?: boolean;
  onAddRule?: () => void;
  onEditRule?: (rule: CommunityRule) => void;
  onDeleteRule?: (ruleId: string) => void;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
}

export interface CommunityRule {
  id: string;
  title: string;
  description: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// UTILITY TYPES
// ============================================

export interface CommunityActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface CommunityMembershipRequest {
  id: string;
  userId: string;
  communityId: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

// Join request types for private communities
export interface JoinRequestProps {
  community: Community;
  onSendRequest: (message?: string) => void;
  loading?: boolean;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
}

export interface JoinRequestListProps {
  requests: CommunityMembershipRequest[];
  community: Community;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  onViewProfile: (userId: string) => void;
  loading?: boolean;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
}
