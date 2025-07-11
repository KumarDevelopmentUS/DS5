// hooks/auth/usePermissions.ts
import { useMemo } from 'react';
import { useAuth } from './useAuth';
import * as permissionUtils from '../../utils/permissions';
import type { Match, Post, Comment, Community, User } from '../../types/models';
import type { CommunityMembership } from '../../utils/permissions';

// Define the type for the resource that can be checked
type Resource = Match | Post | Comment | Community | null;

// Define the structure of the returned permissions object
interface Permissions {
  canEdit: boolean;
  canDelete: boolean;
  canJoin?: boolean;
  canBan?: boolean;
  // Add other specific permissions as needed
}

/**
 * Custom Hook: usePermissions
 *
 * This hook determines the actions a user can perform on a specific resource.
 * It uses the application's rich 'profile' object for permission checking,
 * not the basic Supabase auth user.
 *
 * @param resource - The resource (e.g., a Post object) to check permissions against.
 * @param membership - (Optional) The user's membership details for community-related checks.
 * @returns An object with boolean flags for various actions (`canEdit`, `canDelete`, etc.).
 */
export const usePermissions = (
  resource: Resource,
  membership?: CommunityMembership
): Permissions => {
  // FIX: Use the `profile` object for permission checks. The `profile` contains
  // the rich, application-specific user data that the permission utility
  // functions are designed to work with.
  const { profile } = useAuth();

  // Memoize the permissions calculation to avoid re-running on every render.
  const permissions = useMemo((): Permissions => {
    const defaultPermissions: Permissions = {
      canEdit: false,
      canDelete: false,
    };

    // The permission functions expect a `User` type from `types/models`.
    // The `profile` from `useAuth` is a `UserProfile` type. We cast it here,
    // assuming they are structurally compatible, which they should be in this architecture.
    const currentUser = profile as User | null;

    if (!currentUser || !resource) {
      return defaultPermissions;
    }

    // Determine the type of the resource and check permissions accordingly
    if ('creatorId' in resource && 'participants' in resource) {
      // It's a Match
      return {
        canEdit: permissionUtils.canEditMatch(currentUser, resource as Match),
        canDelete: permissionUtils.canEditMatch(currentUser, resource as Match),
        canJoin: permissionUtils.canJoinMatch(currentUser, resource as Match),
      };
    }

    if ('authorId' in resource && 'communityId' in resource) {
      // It's a Post
      return {
        canEdit: currentUser.id === resource.authorId,
        canDelete: permissionUtils.canDeletePost(
          currentUser,
          resource as Post,
          membership
        ),
      };
    }

    if ('authorId' in resource && !('communityId' in resource)) {
      // It's a Comment
      return {
        canEdit: currentUser.id === resource.authorId,
        canDelete: permissionUtils.canDeleteComment(
          currentUser,
          resource as Comment,
          undefined,
          membership
        ),
      };
    }

    if ('creatorId' in resource && 'school' in resource) {
      // It's a Community
      return {
        canEdit: permissionUtils.canEditCommunitySettings(
          currentUser,
          resource as Community,
          membership
        ),
        canDelete: permissionUtils.isCommunityAdmin(
          currentUser,
          resource.id,
          membership
        ),
      };
    }

    return defaultPermissions;
  }, [profile, resource, membership]);

  return permissions;
};
