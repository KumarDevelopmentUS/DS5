// services/social/communityService.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../database/databaseService';
import {
  ApiResponse,
  ApiError,
  PaginationParams,
  PaginatedResponse,
  SearchFilters,
  ErrorCodes,
} from '../../types/api';
import { UserRole, PrivacyLevel, SortDirection } from '../../types/enums';
import { Community, CommunitySettings, User } from '../../types/models';
import {
  SOCIAL_CONFIG,
  PAGINATION_CONFIG,
  APP_CONFIG,
} from '../../constants/config';
import {
  validateCommunityName,
  sanitizeInput,
  validateProfanity,
} from '../../utils/validation';
import {
  isGlobalAdmin as isGlobalAdminUtil,
  isCommunityAdmin,
  isCommunityModerator as isCommunityModeratorUtil,
  canCreateCommunity,
  canEditCommunitySettings,
  canBanUser as canBanUserUtil,
  CommunityMembership,
} from '../../utils/permissions';
import type {
  TableRow,
  TableInsert,
  TableUpdate,
} from '../database/databaseService';
import { createErrorHandler } from '../../utils/errors';
import { getCachedDataWithTTL, cacheDataWithTTL } from '../../utils/storage';

const handleError = createErrorHandler(
  'CommunityService',
  'community_operations'
);

// Interface for creating a new community
export interface CreateCommunityData {
  name: string;
  description?: string;
  isPrivate?: boolean;
  avatarUrl?: string;
  bannerUrl?: string;
}

// Interface for updating a community
export interface UpdateCommunityData
  extends Partial<Omit<CreateCommunityData, 'name'>> {
  settings?: Partial<CommunitySettings>;
}

// Filters for searching communities
export interface CommunitySearchFilters extends SearchFilters {
  tags?: string[];
  minMembers?: number;
  isPrivate?: boolean;
}

/**
 * Community Service
 *
 * Manages all community-related operations.
 */
export class CommunityService {
  /**
   * Creates a new community.
   */
  static async createCommunity(
    creator: User,
    data: CreateCommunityData
  ): Promise<ApiResponse<Community>> {
    if (!canCreateCommunity(creator)) {
      return {
        success: false,
        error: {
          code: ErrorCodes.PERMISSION_DENIED,
          message: 'You do not have permission to create a community.',
        },
        data: null,
        timestamp: new Date().toISOString(),
      };
    }

    const nameValidation = validateCommunityName(data.name);
    if (!nameValidation.isValid) {
      return {
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_FAILED,
          message: nameValidation.error!,
        },
        data: null,
        timestamp: new Date().toISOString(),
      };
    }

    const descriptionValidation = data.description
      ? validateProfanity(data.description)
      : { isValid: true };
    if (!descriptionValidation.isValid) {
      return {
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_FAILED,
          message: descriptionValidation.error!,
        },
        data: null,
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const communityData: TableInsert<'communities'> = {
        name: sanitizeInput(data.name),
        description: data.description
          ? sanitizeInput(data.description)
          : undefined,
        creator_id: creator.id,
        is_private: data.isPrivate ?? false,
        avatar_url: data.avatarUrl,
        banner_url: data.bannerUrl,
      };

      const { data: newCommunity, error } = await supabase
        .from('communities')
        .insert(communityData)
        .select()
        .single();

      if (error) throw error;

      // Add creator as the first member and admin
      await this.addCommunityMember(
        newCommunity.id,
        creator.id,
        UserRole.ADMIN
      );

      return {
        success: true,
        data: this.transformCommunity(newCommunity),
        error: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'createCommunity',
        data,
      });
      return {
        success: false,
        error: parsedError,
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Retrieves a single community by its ID.
   */
  static async getCommunity(
    id: string,
    userId?: string
  ): Promise<ApiResponse<Community>> {
    const cacheKey = `community:${id}:${userId || 'guest'}`;
    const cached = await getCachedDataWithTTL<Community>(cacheKey);
    if (cached) {
      return {
        success: true,
        data: cached,
        error: null,
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const { data, error } = await supabase
        .from('communities')
        .select('*, member_count:community_members(count)')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) {
        return {
          success: false,
          error: { code: ErrorCodes.NOT_FOUND, message: 'Community not found' },
          data: null,
          timestamp: new Date().toISOString(),
        };
      }

      const community = this.transformCommunity(data);
      await cacheDataWithTTL(cacheKey, community, APP_CONFIG.CACHE.DEFAULT_TTL);

      return {
        success: true,
        data: community,
        error: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, { action: 'getCommunity', id });
      return {
        success: false,
        error: parsedError,
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Updates a community's details.
   */
  static async updateCommunity(
    user: User,
    communityId: string,
    updateData: UpdateCommunityData
  ): Promise<ApiResponse<Community>> {
    const { data: community, error: fetchError } =
      await this.getCommunity(communityId);

    if (fetchError || !community) {
      return {
        success: false,
        error: { code: ErrorCodes.NOT_FOUND, message: 'Community not found.' },
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
    const { data: membership } = await this.getCommunityMembership(
      user.id,
      communityId
    );
    if (
      !canEditCommunitySettings(
        user,
        community,
        membership as CommunityMembership
      )
    ) {
      return {
        success: false,
        error: {
          code: ErrorCodes.PERMISSION_DENIED,
          message: 'You do not have permission to edit this community.',
        },
        data: null,
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const updates: TableUpdate<'communities'> = {
        description: updateData.description
          ? sanitizeInput(updateData.description)
          : undefined,
        is_private: updateData.isPrivate,
        avatar_url: updateData.avatarUrl,
        banner_url: updateData.bannerUrl,
        settings: updateData.settings
          ? { ...community.settings, ...updateData.settings }
          : undefined,
        updated_at: new Date().toISOString(),
      };

      const { data: updatedCommunity, error } = await supabase
        .from('communities')
        .update(updates)
        .eq('id', communityId)
        .select()
        .single();

      if (error) throw error;

      const transformed = this.transformCommunity(updatedCommunity);
      await cacheDataWithTTL(
        `community:${communityId}:${user.id}`,
        transformed,
        APP_CONFIG.CACHE.DEFAULT_TTL
      );

      return {
        success: true,
        data: transformed,
        error: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'updateCommunity',
        communityId,
      });
      return {
        success: false,
        error: parsedError,
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Deletes a community.
   */
  static async deleteCommunity(
    user: User,
    communityId: string
  ): Promise<ApiResponse<null>> {
    const { data: community } = await this.getCommunity(communityId);
    if (!community) {
      return {
        success: false,
        error: { code: ErrorCodes.NOT_FOUND, message: 'Community not found.' },
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
    const { data: membership } = await this.getCommunityMembership(
      user.id,
      communityId
    );
    if (
      !isCommunityAdmin(user, communityId, membership as CommunityMembership)
    ) {
      return {
        success: false,
        error: {
          code: ErrorCodes.PERMISSION_DENIED,
          message: 'Only an admin can delete a community.',
        },
        data: null,
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const { error } = await supabase
        .from('communities')
        .delete()
        .eq('id', communityId);
      if (error) throw error;

      return {
        success: true,
        data: null,
        error: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'deleteCommunity',
        communityId,
      });
      return {
        success: false,
        error: parsedError,
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Adds a member to a community.
   */
  static async addCommunityMember(
    communityId: string,
    userId: string,
    role: UserRole = UserRole.PLAYER
  ): Promise<ApiResponse<CommunityMembership>> {
    try {
      const memberData: TableInsert<'community_members'> = {
        community_id: communityId,
        user_id: userId,
        role: role as string,
      };
      const { data, error } = await supabase
        .from('community_members')
        .insert(memberData)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          ...data,
          communityId: data.community_id,
          userId: data.user_id,
          role: data.role as 'member' | 'moderator' | 'admin',
          status: 'active',
          joinedAt: new Date(data.joined_at!),
          user: undefined, // TODO: Fetch user data if needed
        },
        error: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'addCommunityMember',
        communityId,
        userId,
      });
      return {
        success: false,
        error: parsedError,
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Retrieves a user's membership details for a specific community.
   */
  static async getCommunityMembership(
    userId: string,
    communityId: string
  ): Promise<ApiResponse<CommunityMembership | null>> {
    try {
      const { data, error } = await supabase
        .from('community_members')
        .select('*')
        .eq('user_id', userId)
        .eq('community_id', communityId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // PostgREST error for no rows found, meaning user is not a member
          return {
            success: true,
            data: null,
            error: null,
            timestamp: new Date().toISOString(),
          };
        }
        throw error;
      }

      return {
        success: true,
        data: {
          ...data,
          communityId: data.community_id,
          userId: data.user_id,
          role: data.role as 'member' | 'moderator' | 'admin',
          status: 'active', // Assuming 'active' if they exist
          joinedAt: new Date(data.joined_at!),
          user: null, // TODO: Fetch user data if needed
        },
        error: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'getCommunityMembership',
        userId,
        communityId,
      });
      return {
        success: false,
        error: parsedError,
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Checks if a user is a global administrator by fetching their profile
   * and using the permission utility function.
   */
  static async isGlobalAdmin(userId: string): Promise<ApiResponse<boolean>> {
    try {
      // Fetch the user's profile to get the data needed for the check
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*') // Select all columns to ensure we get username and settings
        .eq('id', userId)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // User not found, so they are not a global admin.
          return {
            success: true,
            data: false,
            error: null,
            timestamp: new Date().toISOString(),
          };
        }
        throw profileError; // Throw other errors
      }

      // Transform the database profile into a User object
      const user = this.transformProfileToUser(userProfile);

      // Now use the imported utility function with the correctly shaped User object
      const isSuperAdmin = isGlobalAdminUtil(user);

      return {
        success: true,
        data: isSuperAdmin,
        error: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'isGlobalAdmin',
        userId,
      });
      return {
        success: false,
        error: parsedError,
        data: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Checks if a user is a moderator or admin of a specific community.
   */
  static async isCommunityModerator(
    userId: string,
    communityId: string
  ): Promise<ApiResponse<boolean>> {
    try {
      const membershipResponse = await this.getCommunityMembership(
        userId,
        communityId
      );

      if (!membershipResponse.success || !membershipResponse.data) {
        return {
          success: true,
          data: false,
          error: membershipResponse.error,
          timestamp: new Date().toISOString(),
        };
      }

      const userRole = membershipResponse.data.role;
      const isMod =
        userRole === UserRole.MODERATOR || userRole === UserRole.ADMIN;

      return {
        success: true,
        data: isMod,
        error: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'isCommunityModerator',
        userId,
        communityId,
      });
      return {
        success: false,
        error: parsedError,
        data: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Determines if a user (actor) can ban another user (target) from a community.
   */
  static async canBanUser(
    actorId: string,
    targetId: string,
    communityId: string
  ): Promise<ApiResponse<boolean>> {
    if (actorId === targetId) {
      return {
        success: false,
        error: {
          code: ErrorCodes.PERMISSION_DENIED,
          message: 'Users cannot ban themselves.',
        },
        data: false,
        timestamp: new Date().toISOString(),
      };
    }

    try {
      // Check for global admin override first
      const { data: actorIsGlobal, error: actorGlobalError } =
        await this.isGlobalAdmin(actorId);
      if (actorGlobalError) throw actorGlobalError;

      if (actorIsGlobal) {
        const { data: targetIsGlobal, error: targetGlobalError } =
          await this.isGlobalAdmin(targetId);
        if (targetGlobalError) throw targetGlobalError;
        // A global admin can ban anyone except another global admin.
        return {
          success: true,
          data: !targetIsGlobal,
          error: null,
          timestamp: new Date().toISOString(),
        };
      }

      // If not a global admin, check community roles
      const [actorMembershipRes, targetMembershipRes] = await Promise.all([
        this.getCommunityMembership(actorId, communityId),
        this.getCommunityMembership(targetId, communityId),
      ]);

      if (!actorMembershipRes.success || !targetMembershipRes.success) {
        return {
          success: false,
          error: actorMembershipRes.error ||
            targetMembershipRes.error || {
              code: ErrorCodes.INTERNAL_ERROR,
              message: 'Failed to retrieve membership details.',
            },
          data: false,
          timestamp: new Date().toISOString(),
        };
      }

      const actorMembership = actorMembershipRes.data;
      const targetMembership = targetMembershipRes.data;

      // Actor must be a moderator or admin in the community
      if (
        !actorMembership ||
        (actorMembership.role !== UserRole.ADMIN &&
          actorMembership.role !== UserRole.MODERATOR)
      ) {
        return {
          success: true,
          data: false,
          error: null,
          timestamp: new Date().toISOString(),
        };
      }

      // If target is not in the community, they can't be banned
      if (!targetMembership) {
        return {
          success: true,
          data: false,
          error: null,
          timestamp: new Date().toISOString(),
        };
      }

      // Define role hierarchy for comparison
      const roleHierarchy = {
        [UserRole.ADMIN]: 3,
        [UserRole.MODERATOR]: 2,
        [UserRole.PLAYER]: 1,
      };

      const actorLevel =
        roleHierarchy[actorMembership.role as keyof typeof roleHierarchy] || 0;
      const targetLevel =
        roleHierarchy[targetMembership.role as keyof typeof roleHierarchy] || 0;

      // Actor's role level must be higher than the target's
      return {
        success: true,
        data: actorLevel > targetLevel,
        error: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'canBanUser',
        actorId,
        targetId,
        communityId,
      });
      return {
        success: false,
        error: parsedError,
        data: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Transforms a community row from the database into the Community model.
   */
  private static transformCommunity(
    dbCommunity: TableRow<'communities'> & {
      member_count?: { count: number }[];
    }
  ): Community {
    return {
      id: dbCommunity.id,
      name: dbCommunity.name,
      description: dbCommunity.description || undefined,
      creatorId: dbCommunity.creator_id,
      isPrivate: dbCommunity.is_private ?? false,
      avatarUrl: dbCommunity.avatar_url || undefined,
      bannerUrl: dbCommunity.banner_url || undefined,
      school: dbCommunity.school || undefined,
      canJoin: dbCommunity.can_join ?? true,
      memberCount:
        (dbCommunity.member_count?.[0] as { count: number })?.count ?? 0,
      settings: (dbCommunity.settings as unknown as CommunitySettings) || {},
      createdAt: new Date(dbCommunity.created_at!),
      updatedAt: new Date(dbCommunity.updated_at!),
    };
  }

  /**
   * Transforms a profile row from the database into the User model.
   */
  private static transformProfileToUser(dbProfile: TableRow<'profiles'>): User {
    return {
      id: dbProfile.id,
      username: dbProfile.username,
      avatarUrl: dbProfile.avatar_url ?? undefined,
      // 'isPublic' is not in the provided dbProfile type, so we'll handle it optionally
      isPublic: 'is_public' in dbProfile ? (dbProfile.is_public ?? true) : true,
      nickname:
        'nickname' in dbProfile ? (dbProfile.nickname ?? undefined) : undefined,
      school:
        'school' in dbProfile ? (dbProfile.school ?? undefined) : undefined,
      settings: (dbProfile.settings as unknown as User['settings']) || {},
      createdAt: new Date(dbProfile.created_at!),
      updatedAt: new Date(dbProfile.updated_at!),
    };
  }
}
