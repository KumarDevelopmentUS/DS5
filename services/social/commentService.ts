// services/social/commentService.ts
import { SOCIAL_CONFIG } from '../../constants/config';
import {
  ApiResponse,
  ErrorCodes,
  PaginatedResponse,
  PaginationParams,
} from '../../types/api';
import { Comment, User } from '../../types/models';
import { createErrorHandler } from '../../utils/errors';
import { canDeleteComment } from '../../utils/permissions';
import { sanitizeInput, validateProfanity } from '../../utils/validation';
import type { TableInsert } from '../database/databaseService';
import { supabase } from '../database/databaseService';

/**
 * Comment Service
 *
 * Manages all operations related to comments and replies on posts.
 * This includes creating, retrieving, updating, deleting, and voting on comments.
 * It's essential for the post detail screen where comment threads are displayed.
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface CreateCommentData {
  postId: string;
  authorId: string;
  content: string;
  parentId?: string | null;
}

export interface UpdateCommentData {
  commentId: string;
  content: string;
}

export interface CommentVoteData {
  commentId: string;
  userId: string;
  vote: 1 | -1; // Upvote or downvote
}

export interface CommentServiceResponse<T = any> extends ApiResponse<T> {}

const handleError = createErrorHandler('CommentService', 'comment_operations');

// ============================================
// SERVICE CLASS
// ============================================

export class CommentService {
  /**
   * Creates a new comment or reply.
   * @param data - The data for the new comment.
   * @returns The created comment.
   */
  static async createComment(
    data: CreateCommentData
  ): Promise<CommentServiceResponse<Comment>> {
    const { postId, authorId, content, parentId } = data;

    // Validate content length
    if (content.length > SOCIAL_CONFIG.MAX_COMMENT_LENGTH) {
      return {
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_FAILED,
          message: `Comment exceeds maximum length of ${SOCIAL_CONFIG.MAX_COMMENT_LENGTH} characters.`,
        },
        data: null,
        timestamp: new Date().toISOString(),
      };
    }

    // Sanitize and validate profanity
    const sanitizedContent = sanitizeInput(content);
    const profanityValidation = validateProfanity(sanitizedContent);
    if (!profanityValidation.isValid) {
      return {
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_FAILED,
          message:
            profanityValidation.error ||
            'Comment contains inappropriate language.',
        },
        data: null,
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const commentData: TableInsert<'comments'> = {
        post_id: postId,
        author_id: authorId,
        content: sanitizedContent,
        parent_id: parentId,
      };

      const { data: newComment, error } = await supabase
        .from('comments')
        .insert(commentData)
        .select(
          `
          *,
          author:profiles!comments_author_id_fkey (
            id,
            username,
            avatar_url
          )
        `
        )
        .single();

      if (error) throw error;

      // Manually increment the post's comment_count
      await supabase.rpc('increment', {
        table_name: 'posts',
        field_name: 'comment_count',
        row_id: postId,
        increment_value: 1,
      });

      return {
        success: true,
        data: this.transformComment(newComment),
        error: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'createComment',
        ...data,
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
   * Retrieves comments for a specific post with pagination.
   * @param postId - The ID of the post.
   * @param pagination - Pagination parameters.
   * @returns A paginated list of comments.
   */
  static async getCommentsForPost(
    postId: string,
    pagination: PaginationParams
  ): Promise<CommentServiceResponse<PaginatedResponse<Comment>>> {
    const { page = 1, pageSize = 10 } = pagination;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    try {
      const {
        data: comments,
        error,
        count,
      } = await supabase
        .from('comments')
        .select(
          `
          *,
          author:profiles!comments_author_id_fkey (
            id,
            username,
            avatar_url
          )
        `,
          { count: 'exact' }
        )
        .eq('post_id', postId)
        .is('parent_id', null) // Fetch only top-level comments
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        success: true,
        data: {
          items: comments.map(this.transformComment),
          totalCount: count ?? 0,
          pagination: {
            page,
            pageSize,
          },
          hasMore: (count ?? 0) > to + 1,
        },
        error: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'getCommentsForPost',
        postId,
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
   * Retrieves replies for a specific comment.
   * @param commentId - The ID of the parent comment.
   * @returns A list of replies.
   */
  static async getRepliesForComment(
    commentId: string
  ): Promise<CommentServiceResponse<Comment[]>> {
    try {
      const { data: replies, error } = await supabase
        .from('comments')
        .select(
          `
          *,
          author:profiles!comments_author_id_fkey (
            id,
            username,
            avatar_url
          )
        `
        )
        .eq('parent_id', commentId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return {
        success: true,
        data: replies.map(this.transformComment),
        error: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'getRepliesForComment',
        commentId,
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
   * Updates a user's own comment.
   * @param data - The data for the comment update.
   * @param userId - The ID of the user performing the update.
   * @returns The updated comment.
   */
  static async updateComment(
    data: UpdateCommentData,
    userId: string
  ): Promise<CommentServiceResponse<Comment>> {
    const { commentId, content } = data;

    try {
      const { data: updatedComment, error } = await supabase
        .from('comments')
        .update({ content: sanitizeInput(content) })
        .eq('id', commentId)
        .eq('author_id', userId) // Ensure user can only update their own comment
        .select(
          `
          *,
          author:profiles!comments_author_id_fkey (
            id,
            username,
            avatar_url
          )
        `
        )
        .single();

      if (error) throw error;

      return {
        success: true,
        data: this.transformComment(updatedComment),
        error: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'updateComment',
        ...data,
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
   * Deletes a comment.
   * @param commentId - The ID of the comment to delete.
   * @param user - The user attempting to delete the comment.
   * @returns Success status.
   */
  static async deleteComment(
    commentId: string,
    user: User
  ): Promise<CommentServiceResponse<null>> {
    try {
      const { data: comment, error: fetchError } = await supabase
        .from('comments')
        .select('author_id, post_id')
        .eq('id', commentId)
        .single();

      if (fetchError || !comment) {
        return {
          success: false,
          error: { code: ErrorCodes.NOT_FOUND, message: 'Comment not found.' },
          data: null,
          timestamp: new Date().toISOString(),
        };
      }

      // This would require fetching more data (post, community roles) in a real app
      // We simulate it here by calling canDeleteComment with placeholder data
      if (
        !canDeleteComment(user, comment as any, comment.post_id || undefined)
      ) {
        return {
          success: false,
          error: {
            code: ErrorCodes.PERMISSION_DENIED,
            message: 'You do not have permission to delete this comment.',
          },
          data: null,
          timestamp: new Date().toISOString(),
        };
      }

      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      // Manually decrement the post's comment_count
      await supabase.rpc('increment', {
        table_name: 'posts',
        field_name: 'comment_count',
        row_id: comment.post_id!,
        increment_value: -1,
      });

      return {
        success: true,
        data: null,
        error: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'deleteComment',
        commentId,
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
   * Handles voting on a comment.
   * @param data - The vote data.
   * @returns The new vote count.
   */
  static async voteOnComment(
    data: CommentVoteData
  ): Promise<CommentServiceResponse<{ newVoteCount: number }>> {
    const { commentId, userId, vote } = data;

    try {
      // This would typically be a remote procedure call (RPC) in Supabase
      // to handle the vote logic transactionally.
      const { data: result, error } = await supabase.rpc('vote_comment', {
        p_comment_id: commentId,
        p_user_id: userId,
        p_vote_value: vote,
      });

      if (error) throw error;

      return {
        success: true,
        data: { newVoteCount: result },
        error: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'voteOnComment',
        ...data,
      });
      return {
        success: false,
        error: parsedError,
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private static transformComment(dbComment: any): Comment {
    return {
      id: dbComment.id,
      postId: dbComment.post_id,
      authorId: dbComment.author_id,
      author: dbComment.author
        ? {
            id: dbComment.author.id,
            username: dbComment.author.username,
            avatarUrl: dbComment.author.avatar_url,
            // These would be fetched in a more complete model
            nickname: '',
            school: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            isPublic: true,
            settings: {},
          }
        : undefined,
      parentId: dbComment.parent_id,
      content: dbComment.content,
      voteCount: dbComment.vote_count || 0,
      createdAt: new Date(dbComment.created_at),
      updatedAt: new Date(dbComment.updated_at),
    };
  }
}

// For convenience, you can export instances or bound methods
export const commentService = {
  createComment: CommentService.createComment,
  getCommentsForPost: CommentService.getCommentsForPost,
  getRepliesForComment: CommentService.getRepliesForComment,
  updateComment: CommentService.updateComment,
  deleteComment: CommentService.deleteComment,
  voteOnComment: CommentService.voteOnComment,
};
