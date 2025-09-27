/**
 * @file posts.ts
 * @description Posts service for fetching and managing social media posts from Noroff API
 * @author [Your Name]
 */

import { get } from '../api/client';

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

/**
 * Fetch all posts from the Noroff Social API
 * @param limit Number of posts to fetch (default: 50)
 * @param page Page number (default: 1)
 * @returns Promise with posts data
 */
export async function getAllPosts(
  limit: number = 50,
  page: number = 1
): Promise<PostsApiResponse> {
  try {
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      page: page.toString(),
      _author: 'true',
      _reactions: 'true',
      _comments: 'true',
    });

    const response = await get<PostsApiResponse>(
      `/social/posts?${queryParams.toString()}`
    );

    return response;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

/**
 * Fetch a single post by ID
 * @param id Post ID
 * @returns Promise with single post data
 */
export async function getPostById(id: number): Promise<NoroffPost> {
  try {
    const response = await get<{ data: NoroffPost }>(
      `/social/posts/${id}?_author=true&_reactions=true&_comments=true`
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching post by ID:', error);
    throw error;
  }
}

/**
 * Search posts by query
 * @param query Search query
 * @param limit Number of posts to fetch (default: 20)
 * @returns Promise with matching posts
 */
export async function searchPosts(
  query: string,
  limit: number = 20
): Promise<PostsApiResponse> {
  try {
    const queryParams = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      _author: 'true',
      _reactions: 'true',
    });

    const response = await get<PostsApiResponse>(
      `/social/posts/search?${queryParams.toString()}`
    );

    return response;
  } catch (error) {
    console.error('Error searching posts:', error);
    throw error;
  }
}
