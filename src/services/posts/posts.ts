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
 * Fetch posts for public viewing without authentication
 * @param limit Number of posts to fetch (default: 50)
 * @param page Page number (default: 1)
 * @returns Promise with sample posts data
 */
export async function getPublicPosts(
  limit: number = 50,
  page: number = 1
): Promise<PostsApiResponse> {
  // Since Noroff API requires authentication, return sample posts directly
  console.log('Loading sample posts for public viewing');
  return getSamplePosts(limit, page);
}

/**
 * Generate sample posts for demonstration when API is not available
 * @param limit Number of posts to generate
 * @param page Page number
 * @returns Sample posts response
 */
function getSamplePosts(limit: number, page: number): PostsApiResponse {
  const samplePosts: NoroffPost[] = [
    {
      id: 1,
      title: 'Welcome to Social Platform',
      body: 'Explore and connect with people around the world. Share your thoughts, experiences, and discover new content every day.',
      tags: ['welcome', 'social', 'community'],
      media: {
        url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        alt: 'People connecting',
      },
      created: new Date(Date.now() - 86400000).toISOString(),
      updated: new Date(Date.now() - 86400000).toISOString(),
      author: {
        name: 'social_admin',
        email: 'admin@social.com',
        bio: 'Official Social Platform Account',
        avatar: {
          url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          alt: 'Admin avatar',
        },
      },
      _count: {
        comments: 12,
        reactions: 45,
      },
      reactions: [
        { symbol: '👍', count: 28 },
        { symbol: '❤️', count: 17 },
      ],
    },
    {
      id: 2,
      title: 'Beautiful sunset today',
      body: 'Caught this amazing sunset while walking in the park. Nature never fails to amaze me! 🌅',
      tags: ['sunset', 'nature', 'photography'],
      media: {
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        alt: 'Beautiful sunset',
      },
      created: new Date(Date.now() - 172800000).toISOString(),
      updated: new Date(Date.now() - 172800000).toISOString(),
      author: {
        name: 'nature_lover',
        email: 'nature@example.com',
        bio: 'Nature photographer and outdoor enthusiast',
        avatar: {
          url: 'https://images.unsplash.com/photo-1494790108755-2616b612b830?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          alt: 'Nature lover avatar',
        },
      },
      _count: {
        comments: 8,
        reactions: 32,
      },
      reactions: [
        { symbol: '🌅', count: 15 },
        { symbol: '❤️', count: 17 },
      ],
    },
    {
      id: 3,
      title: 'Learning TypeScript',
      body: "Just started learning TypeScript and I'm loving the type safety it provides. Any tips for a beginner?",
      tags: ['typescript', 'programming', 'learning'],
      created: new Date(Date.now() - 259200000).toISOString(),
      updated: new Date(Date.now() - 259200000).toISOString(),
      author: {
        name: 'dev_beginner',
        email: 'developer@example.com',
        bio: 'Junior developer passionate about web technologies',
        avatar: {
          url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          alt: 'Developer avatar',
        },
      },
      _count: {
        comments: 15,
        reactions: 28,
      },
      reactions: [
        { symbol: '💻', count: 20 },
        { symbol: '👍', count: 8 },
      ],
    },
    {
      id: 4,
      title: 'Coffee and code',
      body: "Perfect morning routine: fresh coffee and coding. What's your favorite coding fuel? ☕",
      tags: ['coffee', 'coding', 'morning'],
      media: {
        url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        alt: 'Coffee and laptop',
      },
      created: new Date(Date.now() - 345600000).toISOString(),
      updated: new Date(Date.now() - 345600000).toISOString(),
      author: {
        name: 'coffee_coder',
        email: 'coffee@example.com',
        bio: 'Full-stack developer fueled by caffeine',
        avatar: {
          url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          alt: 'Coffee coder avatar',
        },
      },
      _count: {
        comments: 6,
        reactions: 22,
      },
      reactions: [
        { symbol: '☕', count: 18 },
        { symbol: '💻', count: 4 },
      ],
    },
    {
      id: 5,
      title: 'Weekend hiking adventure',
      body: 'Explored some new trails this weekend. The views were absolutely breathtaking! Already planning the next adventure. 🏔️',
      tags: ['hiking', 'adventure', 'weekend'],
      media: {
        url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        alt: 'Mountain hiking trail',
      },
      created: new Date(Date.now() - 432000000).toISOString(),
      updated: new Date(Date.now() - 432000000).toISOString(),
      author: {
        name: 'trail_explorer',
        email: 'hiker@example.com',
        bio: 'Weekend warrior and mountain enthusiast',
        avatar: {
          url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          alt: 'Hiker avatar',
        },
      },
      _count: {
        comments: 10,
        reactions: 35,
      },
      reactions: [
        { symbol: '🏔️', count: 20 },
        { symbol: '👍', count: 15 },
      ],
    },
  ];

  // Simulate pagination
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
