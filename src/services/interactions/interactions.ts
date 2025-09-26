/**
 * Enhanced Interactions Service for Comments and Reactions
 * @file Enhanced interactions.ts
 */

import { get, post, put, del } from "../api/client";

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
 * Get comments for a specific post
 * @param postId The ID of the post
 * @param page Page number (default: 1)
 * @param limit Comments per page (default: 12)
 * @returns Promise with comments response
 */
export async function getPostComments(
  postId: string,
  page: number = 1,
  limit: number = 12
): Promise<CommentsResponse> {
  try {
    const response = await get<CommentsResponse>(
      `/social/posts/${postId}/comments?page=${page}&limit=${limit}&_author=true`
    );

    // Ensure we always return proper structure
    if (!response || !response.data) {
      return {
        data: [],
        meta: {
          isFirstPage: true,
          isLastPage: true,
          currentPage: 1,
          previousPage: null,
          nextPage: null,
          pageCount: 1,
          totalCount: 0,
        },
      };
    }

    return response;
  } catch (error) {
    console.error("Error fetching comments:", error);
    // Return empty structure on error
    return {
      data: [],
      meta: {
        isFirstPage: true,
        isLastPage: true,
        currentPage: 1,
        previousPage: null,
        nextPage: null,
        pageCount: 1,
        totalCount: 0,
      },
    };
  }
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
    commentData.replyToId = replyToId;
  }

  try {
    const response = await post(`/social/posts/${postId}/comment`, commentData);

    // Handle both possible response formats
    if (response?.data) {
      return { data: response.data };
    } else if (response?.id) {
      return { data: response as Comment };
    } else {
      throw new Error("Invalid response format from comment creation");
    }
  } catch (error: any) {
    console.error("Error creating comment:", error);

    // Provide user-friendly error messages
    if (error?.message?.toLowerCase().includes("unauthorized")) {
      throw new Error("You must be logged in to comment on posts.");
    } else if (error?.message?.toLowerCase().includes("not found")) {
      throw new Error("The post you are trying to comment on was not found.");
    } else if (error?.message?.toLowerCase().includes("validation")) {
      throw new Error("Comment text is required and cannot be empty.");
    } else {
      throw new Error(
        error?.message || "Failed to create comment. Please try again."
      );
    }
  }
}

/**
 * Reply to an existing comment
 * @param postId The ID of the post
 * @param parentCommentId The ID of the comment to reply to
 * @param body The reply text
 * @returns Promise with created reply
 */
export async function replyToComment(
  postId: string,
  parentCommentId: string,
  body: string
): Promise<CreateCommentResponse> {
  return createComment(postId, body, parentCommentId);
}

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
    await del(`/social/posts/${postId}/comment/${commentId}`);
  } catch (error: any) {
    console.error("Error deleting comment:", error);

    if (error?.message?.toLowerCase().includes("unauthorized")) {
      throw new Error("You can only delete your own comments.");
    } else if (error?.message?.toLowerCase().includes("not found")) {
      throw new Error("The comment you are trying to delete was not found.");
    } else {
      throw new Error(
        error?.message || "Failed to delete comment. Please try again."
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
    await put(
      `/social/posts/${postId}/react/${encodeURIComponent(symbol)}`,
      {}
    );
  } catch (error: any) {
    console.error("Error reacting to post:", error);

    if (error?.message?.toLowerCase().includes("unauthorized")) {
      throw new Error("You must be logged in to react to posts.");
    } else if (error?.message?.toLowerCase().includes("not found")) {
      throw new Error("The post you are trying to react to was not found.");
    } else {
      throw new Error(
        error?.message || "Failed to react to post. Please try again."
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
    await del(`/social/posts/${postId}/react/${encodeURIComponent(symbol)}`);
  } catch (error: any) {
    console.error("Error removing reaction:", error);

    if (error?.message?.toLowerCase().includes("unauthorized")) {
      throw new Error("You must be logged in to remove reactions.");
    } else if (error?.message?.toLowerCase().includes("not found")) {
      throw new Error("The reaction you are trying to remove was not found.");
    } else {
      throw new Error(
        error?.message || "Failed to remove reaction. Please try again."
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
    // Try to add the reaction
    await reactToPost(postId, symbol);
    return true; // Successfully added
  } catch (error: any) {
    // If the reaction already exists, the API might return a specific error
    // In that case, try to remove it
    if (
      error.message?.includes("already") ||
      error.message?.includes("exist") ||
      error.response?.status === 400 ||
      error.response?.status === 409
    ) {
      try {
        await removeReaction(postId, symbol);
        return false; // Successfully removed
      } catch (removeError: any) {
        console.error("Error removing existing reaction:", removeError);
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
    console.error("Error fetching post reactions:", error);
    return [];
  }
}

/**
 * Utility: Get time ago text for a date
 * @param date The date to format
 * @returns Human-readable time ago string
 */
export function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInSeconds < 60) return "now";
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInHours < 24) return `${diffInHours}h`;
  if (diffInDays < 7) return `${diffInDays}d`;
  if (diffInWeeks < 4) return `${diffInWeeks}w`;
  if (diffInMonths < 12) return `${diffInMonths}mo`;
  return `${diffInYears}y`;
}

/**
 * Utility: Format comment for display
 * @param comment The comment object
 * @returns Formatted comment HTML
 */
export function formatCommentForDisplay(comment: Comment): string {
  const timeAgo = getTimeAgo(new Date(comment.created));
  const avatarUrl = comment.author?.avatar?.url;
  const avatarAlt = comment.author?.avatar?.alt || comment.author.name;

  return `
    <div class="comment-item" data-comment-id="${comment.id}">
      <div class="comment-avatar">
        ${
          avatarUrl
            ? `<img src="${avatarUrl}" alt="${avatarAlt}">`
            : comment.author.name.charAt(0).toUpperCase()
        }
      </div>
      <div class="comment-content">
        <div class="comment-author">${comment.author.name}</div>
        <div class="comment-text">${comment.body}</div>
        <div class="comment-meta">
          <span class="comment-time">${timeAgo}</span>
          <button class="comment-reply-btn" onclick="replyToComment('${comment.postId}', '${comment.id}')">
            Reply
          </button>
          ${
            comment.author.email === localStorage.getItem("userEmail")
              ? `<button class="comment-delete-btn" onclick="deleteComment('${comment.postId}', '${comment.id}')">
              Delete
            </button>`
              : ""
          }
        </div>
      </div>
    </div>
  `;
}

/**
 * Utility: Validate comment text
 * @param text The comment text to validate
 * @returns Object with validation result and error message
 */
export function validateComment(text: string): {
  isValid: boolean;
  error?: string;
} {
  if (!text || text.trim().length === 0) {
    return { isValid: false, error: "Comment cannot be empty." };
  }

  if (text.trim().length > 280) {
    return {
      isValid: false,
      error: "Comment is too long. Maximum 280 characters allowed.",
    };
  }

  // Check for potentially harmful content (basic validation)
  const suspiciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /data:text\/html/gi,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(text)) {
      return { isValid: false, error: "Comment contains invalid content." };
    }
  }

  return { isValid: true };
}

/**
 * Utility: Format reaction count for display
 * @param reactions Array of reactions
 * @returns Formatted count string
 */
export function formatReactionCount(reactions: Reaction[]): string {
  const totalCount = reactions.reduce(
    (sum, reaction) => sum + reaction.count,
    0
  );

  if (totalCount === 0) return "0";
  if (totalCount < 1000) return totalCount.toString();
  if (totalCount < 1000000) return `${(totalCount / 1000).toFixed(1)}K`;
  return `${(totalCount / 1000000).toFixed(1)}M`;
}
