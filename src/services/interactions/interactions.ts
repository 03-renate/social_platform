import { get, post, put, del } from '../api/client';

export interface Comment {
  id: string;
  body: string;
  replyToId?: string | null;
  postId: string;
  owner: string;
  created: string;
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

/**
 * Get comments for a specific post
 * @param postId The ID of the post
 * @param page Page number (default: 1)
 * @param limit Number of comments per page (default: 12)
 * @returns Promise<CommentsResponse>
 */
export async function getPostComments(
  postId: string,
  page: number = 1,
  limit: number = 12
): Promise<CommentsResponse> {
  const response = await get<CommentsResponse>(
    `/social/posts/${postId}/comments?page=${page}&limit=${limit}&_author=true`
  );
  return response;
}

/**
 * Create a new comment on a post
 * @param postId The ID of the post
 * @param body The comment text
 * @param replyToId Optional ID of comment to reply to
 * @returns Promise<{data: Comment}>
 */
export async function createComment(
  postId: string,
  body: string,
  replyToId?: string
): Promise<{ data: Comment }> {
  const commentData: any = { body };
  if (replyToId) {
    commentData.replyToId = replyToId;
  }

  const response = await post<{ data: Comment }>(
    `/social/posts/${postId}/comment`,
    commentData
  );
  return response;
}

/**
 * React to a post with an emoji
 * @param postId The ID of the post
 * @param symbol The reaction emoji symbol
 * @returns Promise<void>
 */
export async function reactToPost(
  postId: string,
  symbol: string
): Promise<void> {
  await put(`/social/posts/${postId}/react/${encodeURIComponent(symbol)}`, {});
}

/**
 * Remove reaction from a post
 * @param postId The ID of the post
 * @param symbol The reaction emoji symbol
 * @returns Promise<void>
 */
export async function removeReaction(
  postId: string,
  symbol: string
): Promise<void> {
  await del(`/social/posts/${postId}/react/${encodeURIComponent(symbol)}`);
}

/**
 * Toggle reaction on a post (add if not exists, remove if exists)
 * @param postId The ID of the post
 * @param symbol The reaction emoji symbol
 * @returns Promise<boolean> True if added, false if removed
 */
export async function toggleReaction(
  postId: string,
  symbol: string
): Promise<boolean> {
  try {
    // Try to add reaction first
    await reactToPost(postId, symbol);
    return true;
  } catch (error: any) {
    // If reaction already exists, remove it
    if (error.response?.status === 400 || error.response?.status === 409) {
      await removeReaction(postId, symbol);
      return false;
    }
    throw error;
  }
}

/**
 * Delete a comment (only works for your own comments)
 * @param postId The ID of the post
 * @param commentId The ID of the comment
 * @returns Promise<void>
 */
export async function deleteComment(
  postId: string,
  commentId: string
): Promise<void> {
  await del(`/social/posts/${postId}/comment/${commentId}`);
}

/**
 * Get time ago text for a date
 * @param date The date to format
 * @returns String representation of time ago
 */
export function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return 'now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: diffInDays > 365 ? 'numeric' : undefined,
    });
  }
}
