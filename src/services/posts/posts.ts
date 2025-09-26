/**
 * @file posts.ts
 * @description Service layer for fetching and managing social media posts (CRUD) from Noroff API v2
 */

import { get, post, put, del } from "../api/client";

// Define the Post interface according to Noroff API v2 structure
export interface NoroffPost {
  id: number;
  title: string;
  body: string;
  tags: string[];
  media?: {
    url: string;
    alt: string;
  };
  created: string;
  updated: string;
  author: {
    name: string;
    email: string;
    bio?: string;
    avatar?: {
      url: string;
      alt: string;
    };
  };
  _count: {
    comments: number;
    reactions: number;
  };
  reactions?: Array<{
    symbol: string;
    count: number;
  }>;
}

export interface PostsApiResponse {
  data: NoroffPost[];
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

const BASE_URL = "/social/posts";

/* -------------------------------------------------------------------------- */
/*                                READ METHODS                                */
/* -------------------------------------------------------------------------- */

/**
 * Fetch all posts from the Noroff Social API
 */
export async function getAllPosts(
  limit: number = 50,
  page: number = 1
): Promise<PostsApiResponse> {
  try {
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      page: page.toString(),
      _author: "true",
      _reactions: "true",
      _comments: "true",
    });

    return await get<PostsApiResponse>(`${BASE_URL}?${queryParams.toString()}`);
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
}

/**
 * Fetch posts for public viewing without authentication
 */
export async function getPublicPosts(
  limit: number = 50,
  page: number = 1
): Promise<PostsApiResponse> {
  console.log("Loading sample posts for public viewing");
  return getSamplePosts(limit, page);
}

/**
 * Fetch a single post by ID
 */
export async function getPostById(id: number): Promise<NoroffPost> {
  try {
    const response = await get<{ data: NoroffPost }>(
      `${BASE_URL}/${id}?_author=true&_reactions=true&_comments=true`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching post by ID:", error);
    throw error;
  }
}

/**
 * Search posts by query
 */
export async function searchPosts(
  query: string,
  limit: number = 20
): Promise<PostsApiResponse> {
  try {
    const queryParams = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      _author: "true",
      _reactions: "true",
    });

    return await get<PostsApiResponse>(
      `${BASE_URL}/search?${queryParams.toString()}`
    );
  } catch (error) {
    console.error("Error searching posts:", error);
    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/*                               WRITE METHODS                                */
/* -------------------------------------------------------------------------- */

/**
 * Create a new post
 */
export async function createPost(payload: {
  title: string;
  body: string;
  tags?: string[];
  media?: { url: string; alt?: string };
}): Promise<NoroffPost> {
  const response = await post(BASE_URL, {
    ...payload,
    tags: payload.tags && payload.tags.length > 0 ? payload.tags : [],
  });

  const newPost = (response as any).data || response;

  // ✅ Normalize missing fields so UI doesn’t crash
  return {
    ...newPost,
    tags: newPost.tags || [],
    _count: newPost._count || { comments: 0, reactions: 0 },
    reactions: newPost.reactions || [],
    author: {
      ...newPost.author,
      avatar: newPost.author?.avatar || { url: "", alt: "" },
    },
  };
}


/**
 * Update an existing post
 */
export async function updatePost(
  postId: number,
  payload: {
    title?: string;
    body?: string;
    tags?: string[];
    media?: { url: string; alt?: string };
  }
): Promise<NoroffPost> {
  const response = await put(`${BASE_URL}/${postId}`, payload);
  return (response as any).data || response;
}

/**
 * Delete a post
 */
export async function deletePost(postId: number): Promise<void> {
  return del(`${BASE_URL}/${postId}`);
}

/**
 * Add a comment to a post
 */
export async function addComment(postId: number, body: string) {
  return post(`${BASE_URL}/${postId}/comment`, { body });
}

/**
 * Reply to a comment
 */
export async function replyToComment(
  postId: number,
  parentCommentId: number,
  body: string
) {
  return post(`${BASE_URL}/${postId}/comment`, {
    body,
    replyToId: parentCommentId,
  });
}

/**
 * React to a post with an emoji
 */
export async function reactToPost(postId: number, symbol: string) {
  return put(`${BASE_URL}/${postId}/react/${symbol}`, {});
}

/**
 * Remove reaction from a post
 */
export async function removeReaction(postId: number, symbol: string) {
  return del(`${BASE_URL}/${postId}/react/${symbol}`);
}

/* -------------------------------------------------------------------------- */
/*                          SAMPLE POSTS (Public View)                        */
/* -------------------------------------------------------------------------- */

function getSamplePosts(limit: number, page: number): PostsApiResponse {
  const samplePosts: NoroffPost[] = [
    {
      id: 1,
      title: "Welcome to Social Platform",
      body: "Explore and connect with people around the world. Share your thoughts, experiences, and discover new content every day.",
      tags: ["welcome", "social", "community"],
      media: {
        url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
        alt: "People connecting",
      },
      created: new Date(Date.now() - 86400000).toISOString(),
      updated: new Date(Date.now() - 86400000).toISOString(),
      author: {
        name: "social_admin",
        email: "admin@social.com",
        bio: "Official Social Platform Account",
        avatar: {
          url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
          alt: "Admin avatar",
        },
      },
      _count: {
        comments: 12,
        reactions: 45,
      },
      reactions: [
        { symbol: "👍", count: 28 },
        { symbol: "❤️", count: 17 },
      ],
    },
  ];

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedPosts = samplePosts.slice(startIndex, endIndex);

  return {
    data: paginatedPosts,
    meta: {
      currentPage: page,
      pageCount: Math.ceil(samplePosts.length / limit),
      totalCount: samplePosts.length,
      isFirstPage: page === 1,
      isLastPage: page >= Math.ceil(samplePosts.length / limit),
      previousPage: page > 1 ? page - 1 : null,
      nextPage: page < Math.ceil(samplePosts.length / limit) ? page + 1 : null,
    },
  };
}
