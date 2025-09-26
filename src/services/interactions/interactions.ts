/**
 * Fixed Interactions Service for Comments and Reactions
 * @file interactions.ts - Fixed version
 */

import { get, post, put, del } from '../api/client';

export interface Comment {
  id: string;
  body: string;
  replyToId?: string | null;
  postId: string;
  owner: string;
  created: string;
  updated: string;
  author: {
    name: string;
    email: string;
    avatar?: {
      url: string;
      alt: string;
    } | null;
  };
}

export interface Reaction {
  symbol: string;
  count: number;
  reactors?: Array<{
    name: string;
    email: string;
  }>;
}

export interface CommentsResponse {
  data: Comment[];
  meta: {
    isFirstPage: boolean;
    isLastPage: boolean;
    currentPage: number;
    previousPage: number | null;
    nextPage: number | null;
    pageCount: number;
    totalCount: number;
  };
}

export interface CreateCommentResponse {
  data: Comment;
}


/**
 * Create a new comment on a post
 * @param postId The ID of the post to comment on
 * @param body The comment text
 * @param replyToId Optional ID of comment to reply to
 * @returns Promise with created comment
 */
export async function createComment(
  postId: string,
  body: string,
  replyToId?: string
): Promise<CreateCommentResponse> {
  const commentData: any = { body };

  if (replyToId) {
    commentData.replyToId = parseInt(replyToId);
  }

  try {
    console.log(`Creating comment on post ${postId}:`, commentData);

    const response = await post(`/social/posts/${postId}/comment`, commentData);

    console.log('Create comment response:', response);

    // Handle the response according to the API docs
    if (response?.data) {
      return { data: response.data };
    } else if (response?.id) {
      return { data: response };
    } else {
      throw new Error('Invalid response format from comment creation');
    }
  } catch (error: any) {
    console.error('Error creating comment:', error);
    throw new Error(
      error?.message || 'Failed to create comment. Please try again.'
    );
  }
}

/**
 * Reply to an existing comment
 * @param postId The ID of the post
 * @param parentCommentId The ID of the comment to reply to
 * @param body The reply text
 * @returns Promise with created reply
 */


/**
 * Delete a comment (only works for your own comments)
 * @param postId The ID of the post
 * @param commentId The ID of the comment to delete
 * @returns Promise that resolves when comment is deleted
 */
export async function deleteComment(
  postId: string,
  commentId: string
): Promise<void> {
  try {
    console.log(`Deleting comment ${commentId} from post ${postId}`);
    await del(`/social/posts/${postId}/comment/${commentId}`);
    console.log('Comment deleted successfully');
  } catch (error: any) {
    console.error('Error deleting comment:', error);

    if (error?.message?.toLowerCase().includes('unauthorized')) {
      throw new Error('You can only delete your own comments.');
    } else if (error?.message?.toLowerCase().includes('not found')) {
      throw new Error('The comment you are trying to delete was not found.');
    } else {
      throw new Error(
        error?.message || 'Failed to delete comment. Please try again.'
      );
    }
  }
}

/**
 * React to a post with an emoji
 * @param postId The ID of the post
 * @param symbol The emoji symbol to react with
 * @returns Promise that resolves when reaction is added
 */
export async function reactToPost(
  postId: string,
  symbol: string
): Promise<void> {
  try {
    console.log(`Adding reaction ${symbol} to post ${postId}`);
    await put(
      `/social/posts/${postId}/react/${encodeURIComponent(symbol)}`,
      {}
    );
    console.log('Reaction added successfully');
  } catch (error: any) {
    console.error('Error reacting to post:', error);

    if (error?.message?.toLowerCase().includes('unauthorized')) {
      throw new Error('You must be logged in to react to posts.');
    } else if (error?.message?.toLowerCase().includes('not found')) {
      throw new Error('The post you are trying to react to was not found.');
    } else {
      throw new Error(
        error?.message || 'Failed to react to post. Please try again.'
      );
    }
  }
}

/**
 * Remove reaction from a post
 * @param postId The ID of the post
 * @param symbol The emoji symbol to remove
 * @returns Promise that resolves when reaction is removed
 */
export async function removeReaction(
  postId: string,
  symbol: string
): Promise<void> {
  try {
    console.log(`Removing reaction ${symbol} from post ${postId}`);
    await del(`/social/posts/${postId}/react/${encodeURIComponent(symbol)}`);
    console.log('Reaction removed successfully');
  } catch (error: any) {
    console.error('Error removing reaction:', error);

    if (error?.message?.toLowerCase().includes('unauthorized')) {
      throw new Error('You must be logged in to remove reactions.');
    } else if (error?.message?.toLowerCase().includes('not found')) {
      throw new Error('The reaction you are trying to remove was not found.');
    } else {
      throw new Error(
        error?.message || 'Failed to remove reaction. Please try again.'
      );
    }
  }
}

/**
 * Toggle reaction on a post (add if not exists, remove if exists)
 * @param postId The ID of the post
 * @param symbol The emoji symbol to toggle
 * @returns Promise that resolves to true if reaction was added, false if removed
 */
export async function toggleReaction(
  postId: string,
  symbol: string
): Promise<boolean> {
  try {
    // Try to add the reaction first
    await reactToPost(postId, symbol);
    return true; // Successfully added
  } catch (error: any) {
    // If the reaction already exists, try to remove it
    if (
      error.message?.includes('already') ||
      error.message?.includes('exist') ||
      error.statusCode === 400 ||
      error.statusCode === 409
    ) {
      try {
        await removeReaction(postId, symbol);
        return false; // Successfully removed
      } catch (removeError: any) {
        console.error('Error removing existing reaction:', removeError);
        throw removeError;
      }
    }

    // If it's a different error, re-throw it
    throw error;
  }
}

/**
 * Get reactions for a specific post
 * @param postId The ID of the post
 * @returns Promise with reactions data
 */
export async function getPostReactions(postId: string): Promise<Reaction[]> {
  try {
    const response = await get<{ data: Reaction[] }>(
      `/social/posts/${postId}?_reactions=true`
    );
    return response?.data || [];
  } catch (error) {
    console.error('Error fetching post reactions:', error);
    return [];
  }
}
