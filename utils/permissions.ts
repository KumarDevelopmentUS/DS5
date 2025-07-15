// utils/permissions.ts

import { User, Match, Post, Comment, Community } from '../types/models';
import { UserRole } from '../types/enums';

// ============================================
// MEMBERSHIP STATUS TYPES
// ============================================

export type MembershipStatus = 'pending' | 'active' | 'banned';

export interface CommunityMembership {
  communityId: string;
  userId: string;
  user: User;
  role: 'member' | 'moderator' | 'admin';
  status: MembershipStatus;
  joinedAt: Date;
  bannedAt?: Date;
  bannedBy?: string;
  banReason?: string;
}

// ============================================
// CORE PERMISSION FUNCTIONS
// ============================================

/**
 * Checks if a user can edit a match
 * @param user - The user requesting permission
 * @param match - The match to be edited
 * @returns true if user can edit the match
 */
export const canEditMatch = (user: User | null, match: Match): boolean => {
  if (!user || !match) return false;

  // Global admins can edit any match
  if (isGlobalAdmin(user)) return true;

  // Match creator can edit their own match
  if (match.creatorId === user.id) return true;

  // Match participants with admin role can edit
  if (match.participants) {
    const userParticipant = match.participants.find(
      (p) => p.userId === user.id
    );
    if (userParticipant && userParticipant.role === UserRole.ADMIN) return true;
  }

  return false;
};

/**
 * Checks if a user can delete a post
 * @param user - The user requesting permission
 * @param post - The post to be deleted
 * @param userCommunityMembership - User's membership info for the post's community (optional)
 * @returns true if user can delete the post
 */
export const canDeletePost = (
  user: User | null,
  post: Post,
  userCommunityMembership?: CommunityMembership
): boolean => {
  if (!user || !post) return false;

  // Global admins can delete any post
  if (isGlobalAdmin(user)) return true;

  // Post author can delete their own post
  if (post.authorId === user.id) return true;

  // Community moderators and admins can delete posts in their community
  if (
    userCommunityMembership &&
    post.communityId === userCommunityMembership.communityId
  ) {
    if (
      userCommunityMembership.status === 'active' &&
      (userCommunityMembership.role === 'moderator' ||
        userCommunityMembership.role === 'admin')
    ) {
      return true;
    }
  }

  return false;
};

/**
 * Checks if a user is a member of a community
 * @param user - The user to check
 * @param community - The community to check membership for
 * @param membership - The user's membership record (optional, for more detailed checks)
 * @returns true if user is an active member
 */
export const isCommunityMember = (
  user: User | null,
  community: Community,
  membership?: CommunityMembership
): boolean => {
  if (!user || !community) return false;

  // Global admins are considered members of all communities
  if (isGlobalAdmin(user)) return true;

  // Check if membership record exists and is active
  if (membership) {
    return (
      membership.userId === user.id &&
      membership.communityId === community.id &&
      membership.status === 'active'
    );
  }

  // Fallback to community's userRole if no membership record provided
  return community.userRole !== undefined;
};

// ============================================
// ROLE-BASED PERMISSION CHECKS
// ============================================

/**
 * Checks if a user is a global admin
 * @param user - The user to check
 * @returns true if user has global admin privileges
 */
export const isGlobalAdmin = (user: User | null): boolean => {
  return (
    user?.settings?.privacy?.allowFriendRequests === true &&
    user?.username?.includes('admin')
  ); // Temporary logic - replace with proper admin field
};

/**
 * Checks if a user is a community moderator
 * @param user - The user to check
 * @param communityId - The community ID to check
 * @param membership - The user's membership record
 * @returns true if user is a moderator in the specified community
 */
export const isCommunityModerator = (
  user: User | null,
  communityId: string,
  membership?: CommunityMembership
): boolean => {
  if (!user || !communityId) return false;

  // Global admins have moderator privileges everywhere
  if (isGlobalAdmin(user)) return true;

  // Check membership record
  if (membership) {
    return (
      membership.userId === user.id &&
      membership.communityId === communityId &&
      membership.status === 'active' &&
      (membership.role === 'moderator' || membership.role === 'admin')
    );
  }

  return false;
};

/**
 * Checks if a user is a community admin
 * @param user - The user to check
 * @param communityId - The community ID to check
 * @param membership - The user's membership record
 * @returns true if user is an admin in the specified community
 */
export const isCommunityAdmin = (
  user: User | null,
  communityId: string,
  membership?: CommunityMembership
): boolean => {
  if (!user || !communityId) return false;

  // Global admins have admin privileges everywhere
  if (isGlobalAdmin(user)) return true;

  // Check membership record
  if (membership) {
    return (
      membership.userId === user.id &&
      membership.communityId === communityId &&
      membership.status === 'active' &&
      membership.role === 'admin'
    );
  }

  return false;
};

// ============================================
// EXTENDED PERMISSION FUNCTIONS
// ============================================

/**
 * Checks if a user can join a match
 * @param user - The user requesting to join
 * @param match - The match to join
 * @returns true if user can join the match
 */
export const canJoinMatch = (user: User | null, match: Match): boolean => {
  if (!user || !match) return false;

  // Can't join if match is not pending or active
  if (!['pending', 'active'].includes(match.status)) return false;

  // Can't join if already a participant
  if (match.participants?.some((p) => p.userId === user.id)) return false;

  // Can join public matches
  if (match.isPublic) return true;

  // Can join private matches if invited (this would require additional logic)
  // For now, assume private matches require invitation system
  return false;
};

/**
 * Checks if a user can create a community
 * @param user - The user requesting to create a community
 * @returns true if user can create communities
 */
export const canCreateCommunity = (user: User | null): boolean => {
  if (!user) return false;

  // Global admins can always create communities
  if (isGlobalAdmin(user)) return true;

  // Regular users can create communities (adjust based on your business rules)
  return true;
};

/**
 * Checks if a user can edit community settings
 * @param user - The user requesting permission
 * @param community - The community to edit
 * @param membership - The user's membership record
 * @returns true if user can edit community settings
 */
export const canEditCommunitySettings = (
  user: User | null,
  community: Community,
  membership?: CommunityMembership
): boolean => {
  if (!user || !community) return false;

  // Global admins can edit any community
  if (isGlobalAdmin(user)) return true;

  // Community creator can edit settings
  if (community.creatorId === user.id) return true;

  // School-based restriction: only designated school moderators can edit school communities
  if (community.school) {
    return isDesignatedSchoolModerator(user, community.school, membership);
  }

  // Community admins can edit settings
  if (membership) {
    return (
      membership.userId === user.id &&
      membership.communityId === community.id &&
      membership.status === 'active' &&
      membership.role === 'admin'
    );
  }

  return false;
};

/**
 * Checks if a user is a designated school moderator
 * @param user - The user to check
 * @param school - The school name
 * @param membership - The user's membership record
 * @returns true if user is designated as school moderator
 */
export const isDesignatedSchoolModerator = (
  user: User | null,
  school: string,
  membership?: CommunityMembership
): boolean => {
  if (!user || !school) return false;

  // Global admins are considered school moderators
  if (isGlobalAdmin(user)) return true;

  // Check if user's school matches and they have proper designation
  // This would typically require a separate school_moderators table or flag
  // For now, check if user belongs to the school and has moderator role
  if (user.school === school && membership) {
    return (
      membership.status === 'active' &&
      (membership.role === 'moderator' || membership.role === 'admin')
    );
  }

  return false;
};

/**
 * Checks if a user can delete a comment
 * @param user - The user requesting permission
 * @param comment - The comment to delete
 * @param postAuthorId - The ID of the post author (optional)
 * @param userCommunityMembership - User's membership in the comment's community
 * @returns true if user can delete the comment
 */
export const canDeleteComment = (
  user: User | null,
  comment: Comment,
  postAuthorId?: string,
  userCommunityMembership?: CommunityMembership
): boolean => {
  if (!user || !comment) return false;

  // Global admins can delete any comment
  if (isGlobalAdmin(user)) return true;

  // Comment author can delete their own comment
  if (comment.authorId === user.id) return true;

  // Post author can delete comments on their post
  if (postAuthorId && postAuthorId === user.id) return true;

  // Community moderators can delete comments
  if (userCommunityMembership) {
    return (
      userCommunityMembership.status === 'active' &&
      (userCommunityMembership.role === 'moderator' ||
        userCommunityMembership.role === 'admin')
    );
  }

  return false;
};

/**
 * Checks if a user can view a private profile
 * @param viewer - The user trying to view the profile
 * @param profileOwner - The owner of the profile
 * @param areFriends - Whether the users are friends (optional)
 * @returns true if user can view the private profile
 */
export const canViewPrivateProfile = (
  viewer: User | null,
  profileOwner: User,
  areFriends?: boolean
): boolean => {
  if (!viewer) return false;

  // Can always view own profile
  if (viewer.id === profileOwner.id) return true;

  // Global admins can view any profile
  if (isGlobalAdmin(viewer)) return true;

  // Check privacy settings
  if (profileOwner.settings?.privacy?.profileVisibility === 'public')
    return true;
  if (
    profileOwner.settings?.privacy?.profileVisibility === 'friends' &&
    areFriends
  )
    return true;
  if (profileOwner.settings?.privacy?.profileVisibility === 'private')
    return false;

  // Default to profile's isPublic field
  return profileOwner.isPublic;
};

/**
 * Checks if a user can send friend requests
 * @param sender - The user sending the request
 * @param recipient - The user receiving the request
 * @returns true if sender can send friend request to recipient
 */
export const canSendFriendRequest = (
  sender: User | null,
  recipient: User
): boolean => {
  if (!sender || sender.id === recipient.id) return false;

  // Check if recipient allows friend requests
  return recipient.settings?.privacy?.allowFriendRequests !== false;
};

/**
 * Checks if a user can ban another user from a community
 * @param user - The user requesting to ban
 * @param targetUser - The user to be banned
 * @param communityId - The community ID
 * @param userMembership - The requesting user's membership
 * @param targetMembership - The target user's membership
 * @returns true if user can ban the target user
 */
export const canBanUser = (
  user: User | null,
  targetUser: User,
  communityId: string,
  userMembership?: CommunityMembership,
  targetMembership?: CommunityMembership
): boolean => {
  if (!user || !targetUser || user.id === targetUser.id) return false;

  // Global admins can ban anyone
  if (isGlobalAdmin(user)) return true;

  // Can't ban if not a moderator/admin
  if (!isCommunityModerator(user, communityId, userMembership)) return false;

  // Can't ban other moderators/admins unless you're an admin
  if (
    targetMembership &&
    (targetMembership.role === 'moderator' || targetMembership.role === 'admin')
  ) {
    return isCommunityAdmin(user, communityId, userMembership);
  }

  return true;
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Gets the highest permission level a user has in a community
 * @param user - The user to check
 * @param communityId - The community ID
 * @param membership - The user's membership record
 * @returns The highest permission level
 */
export const getUserCommunityPermissionLevel = (
  user: User | null,
  communityId: string,
  membership?: CommunityMembership
): 'none' | 'member' | 'moderator' | 'admin' | 'global_admin' => {
  if (!user) return 'none';

  if (isGlobalAdmin(user)) return 'global_admin';

  if (
    membership &&
    membership.communityId === communityId &&
    membership.status === 'active'
  ) {
    return membership.role;
  }

  return 'none';
};

/**
 * Checks if a user has any elevated permissions (moderator or admin) in any community
 * @param user - The user to check
 * @param memberships - Array of user's community memberships
 * @returns true if user has elevated permissions anywhere
 */
export const hasElevatedPermissions = (
  user: User | null,
  memberships: CommunityMembership[] = []
): boolean => {
  if (!user) return false;

  if (isGlobalAdmin(user)) return true;

  return memberships.some(
    (membership) =>
      membership.status === 'active' &&
      (membership.role === 'moderator' || membership.role === 'admin')
  );
};
