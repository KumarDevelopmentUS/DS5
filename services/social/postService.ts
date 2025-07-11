// services/social/postService.ts
import { ApiResponse, ErrorCodes, PaginationParams } from '../../types/api';
import { PaginatedResponse, Post, User } from '../../types/models';
import { createErrorHandler } from '../../utils/errors';
import { canDeletePost } from '../../utils/permissions';
import {
  sanitizeInput,
  validatePostContent,
  validateProfanity,
} from '../../utils/validation';
import { supabase } from '../database/databaseService';

const handleError = createErrorHandler('PostService', 'post_operations');

export interface CreatePostData {
  communityId: string;
  authorId: string;
  title?: string;
  content: string;
  matchId?: string;
  mediaUrls?: string[];
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  mediaUrls?: string[];
}

export class PostService {
  /**
   * Creates a new post in a community.
   * @param data - The data for the new post.
   * @returns The created post.
   */
  static async createPost(data: CreatePostData): Promise<ApiResponse<Post>> {
    try {
      const { communityId, authorId, title, content, matchId, mediaUrls } =
        data;

      // Validate content
      const contentValidation = validatePostContent(content);
      if (!contentValidation.isValid) {
        throw new Error(contentValidation.error);
      }

      // Sanitize and validate profanity
      const sanitizedContent = sanitizeInput(content);
      const profanityValidation = validateProfanity(sanitizedContent);
      if (!profanityValidation.isValid) {
        throw new Error(profanityValidation.error);
      }

      const postData = {
        community_id: communityId,
        author_id: authorId,
        title: title ? sanitizeInput(title) : undefined,
        content: sanitizedContent,
        match_id: matchId,
        media_urls: mediaUrls,
      };

      const { data: newPost, error } = await supabase
        .from('posts')
        .insert(postData)
        .select(
          `
          *,
          author:author_id(*),
          community:community_id(*)
        `
        )
        .single();

      if (error) throw error;
      if (!newPost) throw new Error('Post creation failed.');

      return {
        data: this.transformPost(newPost),
        success: true,
        error: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, { action: 'createPost' });
      return {
        data: null,
        error: parsedError,
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Retrieves a single post by its ID.
   * @param postId - The ID of the post to retrieve.
   * @returns The post data.
   */
  static async getPostById(postId: string): Promise<ApiResponse<Post>> {
    try {
      const { data: post, error } = await supabase
        .from('posts')
        .select(
          `
          *,
          author:author_id(*),
          community:community_id(*)
        `
        )
        .eq('id', postId)
        .single();

      if (error) throw error;
      if (!post)
        return {
          data: null,
          error: {
            code: ErrorCodes.NOT_FOUND,
            message: 'Post not found',
          },
          success: false,
          timestamp: new Date().toISOString(),
        };

      return {
        data: this.transformPost(post),
        success: true,
        error: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'getPostById',
        postId,
      });
      return {
        data: null,
        error: parsedError,
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Retrieves a paginated list of posts for a community.
   * @param communityId - The ID of the community.
   * @param pagination - Pagination parameters.
   * @returns A paginated response of posts.
   */
  static async getPostsByCommunity(
    communityId: string,
    pagination: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<Post>>> {
    try {
      const { page = 1, pageSize = 20 } = pagination; // Use pageSize here
      const from = (page - 1) * pageSize; // and here
      const to = from + pageSize - 1;

      const {
        data: posts,
        error,
        count,
      } = await supabase
        .from('posts')
        .select(
          `
          *,
          author:author_id(*),
          community:community_id(*)
        `,
          { count: 'exact' }
        )
        .eq('community_id', communityId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const totalPages = Math.ceil((count || 0) / pageSize);

      const response: PaginatedResponse<Post> = {
        items: posts.map(this.transformPost),
        pagination: {
          page,
          pageSize,
          totalPages,
        },
        hasMore: (count || 0) > to + 1,
        totalCount: count || 0,
      };

      return {
        data: response,
        success: true,
        error: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'getPostsByCommunity',
        communityId,
      });
      return {
        data: null,
        error: parsedError,
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Updates a post.
   * @param postId - The ID of the post to update.
   * @param userId - The ID of the user performing the update.
   * @param data - The data to update.
   * @returns The updated post.
   */
  static async updatePost(
    postId: string,
    userId: string,
    data: UpdatePostData
  ): Promise<ApiResponse<Post>> {
    try {
      const { data: existingPost, error: fetchError } = await supabase
        .from('posts')
        .select('author_id')
        .eq('id', postId)
        .single();

      if (fetchError || !existingPost) throw new Error('Post not found.');

      if (existingPost.author_id !== userId) {
        throw new Error('You do not have permission to edit this post.');
      }

      const { data: updatedPost, error } = await supabase
        .from('posts')
        .update(data)
        .eq('id', postId)
        .select(
          `
          *,
          author:author_id(*),
          community:community_id(*)
        `
        )
        .single();

      if (error) throw error;

      return {
        data: this.transformPost(updatedPost),
        success: true,
        error: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'updatePost',
        postId,
      });
      return {
        data: null,
        error: parsedError,
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Deletes a post.
   * @param postId - The ID of the post to delete.
   * @param user - The user performing the deletion.
   */
  static async deletePost(
    postId: string,
    user: User
  ): Promise<ApiResponse<null>> {
    try {
      const { data: post, error: fetchError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (fetchError || !post) throw new Error('Post not found.');

      if (!canDeletePost(user, this.transformPost(post))) {
        throw new Error('You do not have permission to delete this post.');
      }

      const { error } = await supabase.from('posts').delete().eq('id', postId);

      if (error) throw error;

      return {
        data: null,
        success: true,
        error: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const parsedError = handleError(error, {
        action: 'deletePost',
        postId,
      });
      return {
        data: null,
        error: parsedError,
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Transforms a post from the database into a Post object.
   * @param dbPost - The post from the database.
   * @returns The transformed Post object.
   */
  private static transformPost(dbPost: any): Post {
    return {
      id: dbPost.id,
      authorId: dbPost.author_id,
      communityId: dbPost.community_id,
      title: dbPost.title,
      content: dbPost.content,
      matchId: dbPost.match_id,
      mediaUrls: dbPost.media_urls,
      isPinned: dbPost.is_pinned,
      voteCount: dbPost.vote_count,
      commentCount: dbPost.comment_count,
      createdAt: new Date(dbPost.created_at),
      updatedAt: new Date(dbPost.updated_at),
      author: dbPost.author,
      community: dbPost.community,
    };
  }
}
