/**
 * @file ProfilePage.ts
 * @description Enhanced Profile Page with follow/unfollow functionality integrated with existing app structure
 * @author Your Name
 */

import { type NoroffPost } from '../services/posts/posts'; // Removed getAllPosts since it's not used
import { getLocalItem } from '../utils/storage';
import { isLoggedIn } from '../utils/auth';
import { get, put } from '../services/api/client';

interface UserProfile {
  name: string;
  email: string;
  bio?: string;
  avatar?: {
    url: string;
    alt: string;
  };
  banner?: {
    url: string;
    alt: string;
  };
  _count: {
    posts: number;
    followers: number;
    following: number;
  };
}

interface ProfileResponse {
  data: UserProfile;
}

/**
 * Main ProfilePage component that renders user profile with posts and follow functionality
 * @returns Promise<string> HTML string for the profile page
 */
export default async function ProfilePage(): Promise<string> {
  try {
    // Get username from URL params or current user
    const urlParams = new URLSearchParams(window.location.search);
    const targetUsername = urlParams.get('user');
    const currentUser = getLocalItem('user');

    // Determine which profile to show
    const profileUsername = targetUsername || currentUser;
    const isOwnProfile = !targetUsername || targetUsername === currentUser;

    if (!profileUsername) {
      return renderErrorState('Please log in to view profiles');
    }

    // Fetch profile data and posts
    const [profileData, userPosts] = await Promise.all([
      fetchUserProfile(profileUsername),
      fetchUserPosts(profileUsername),
    ]);

    // Initialize interactions after DOM renders
    setTimeout(() => {
      initializeProfileInteractions(profileUsername, isOwnProfile);
    }, 100);

    return `
      <div class="profile-page">
        <div class="profile-container">
          <!-- Profile Header -->
          ${renderProfileHeader(profileData, isOwnProfile, currentUser)}
          
          <!-- Profile Content -->
          <div class="profile-content">
            ${renderProfileInfo(profileData)}
            
            <!-- Profile Tabs -->
            <div class="profile-tabs">
              <button class="tab-btn active" data-tab="posts">
                Posts (${profileData._count.posts})
              </button>
              <button class="tab-btn" data-tab="media">
                Media
              </button>
              <button class="tab-btn" data-tab="following">
                Following (${profileData._count.following})
              </button>
              <button class="tab-btn" data-tab="followers">
                Followers (${profileData._count.followers})
              </button>
            </div>
            
            <!-- Tab Content -->
            <div class="tab-content" id="profile-tab-content">
              ${renderPostsTab(userPosts)}
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading profile:', error);
    return renderErrorState('Failed to load profile');
  }
}

/**
 * Fetches user profile data from the API
 * @param username The username to fetch profile for
 * @returns Promise<UserProfile> User profile data
 */
async function fetchUserProfile(username: string): Promise<UserProfile> {
  try {
    const response = await get<ProfileResponse>(
      `/social/profiles/${username}?_followers=true&_following=true`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    // Return default profile structure
    return {
      name: username,
      email: `${username}@stud.noroff.no`,
      bio: 'No bio available',
      _count: {
        posts: 0,
        followers: 0,
        following: 0,
      },
    };
  }
}

/**
 * Fetches posts for a specific user
 * @param username The username to fetch posts for
 * @returns Promise<NoroffPost[]> Array of user posts
 */
async function fetchUserPosts(username: string): Promise<NoroffPost[]> {
  try {
    const response = await get<{ data: NoroffPost[] }>(
      `/social/profiles/${username}/posts?_author=true&_reactions=true`
    );
    return response.data || [];
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return [];
  }
}

function renderProfileHeader(
  profile: UserProfile,
  isOwnProfile: boolean,
  currentUser: string | null
): string {
  const bannerUrl = profile.banner?.url || '';

  return `
    <div class="profile-header" style="${bannerUrl ? `background-image: url('${bannerUrl}')` : ''}">
      <div class="profile-header-overlay">
        <div class="profile-header-content">
          <!-- Back Button -->
          <button class="back-btn" onclick="history.back()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m12 19-7-7 7-7"></path>
              <path d="m19 12H5"></path>
            </svg>
            Back
          </button>
          
          <!-- Follow Button (only show for other users) -->
          ${
            !isOwnProfile && isLoggedIn()
              ? `
            <button class="follow-btn" id="follow-btn" data-username="${profile.name}">
              <span class="follow-text">Follow</span>
              <span class="unfollow-text" style="display: none;">Unfollow</span>
            </button>
          `
              : ''
          }
        </div>
      </div>
    </div>
  `;
}

// Removed isOwnProfile parameter since it's not used in this function
function renderProfileInfo(profile: UserProfile): string {
  const avatarUrl =
    profile.avatar?.url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=6366f1&color=fff&size=128`;

  return `
    <div class="profile-info">
      <!-- Avatar -->
      <div class="profile-avatar">
        <img src="${avatarUrl}" alt="${profile.avatar?.alt || profile.name}" class="avatar-img">
      </div>
      
      <!-- Basic Info -->
      <div class="profile-details">
        <h1 class="profile-name">${profile.name}</h1>
        <p class="profile-email">@${profile.name.toLowerCase()}</p>
        
        ${profile.bio ? `<p class="profile-bio">${profile.bio}</p>` : ''}
        
        <!-- Stats -->
        <div class="profile-stats">
          <div class="stat">
            <span class="stat-number">${profile._count.posts}</span>
            <span class="stat-label">Posts</span>
          </div>
          <div class="stat">
            <span class="stat-number">${profile._count.following}</span>
            <span class="stat-label">Following</span>
          </div>
          <div class="stat">
            <span class="stat-number">${profile._count.followers}</span>
            <span class="stat-label">Followers</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderPostsTab(posts: NoroffPost[]): string {
  if (posts.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>No posts yet</h3>
        <p>When this user posts, their content will appear here.</p>
      </div>
    `;
  }

  return `
    <div class="profile-posts">
      ${posts.map((post, index) => renderProfilePost(post, index)).join('')}
    </div>
  `;
}

function renderProfilePost(post: NoroffPost, index: number): string {
  const timeAgo = getTimeAgo(new Date(post.created));

  return `
    <article class="profile-post-card" style="animation-delay: ${index * 0.1}s">
      ${
        post.media?.url
          ? `
        <div class="post-media">
          <img src="${post.media.url}" alt="${post.media.alt || 'Post image'}" class="post-image">
        </div>
      `
          : ''
      }
      
      <div class="post-content">
        <h3 class="post-title">${post.title}</h3>
        <p class="post-body">${post.body}</p>
        
        ${
          post.tags && post.tags.length > 0
            ? `
          <div class="post-tags">
            ${post.tags.map((tag) => `<span class="tag">#${tag}</span>`).join('')}
          </div>
        `
            : ''
        }
        
        <div class="post-meta">
          <span class="post-time">${timeAgo}</span>
          <span class="post-stats">
            ${post._count.reactions} reactions · ${post._count.comments} comments
          </span>
        </div>
      </div>
    </article>
  `;
}

function renderErrorState(message: string): string {
  return `
    <div class="profile-page">
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <h2>Unable to load profile</h2>
        <p>${message}</p>
        <button class="btn btn-primary" onclick="history.back()">Go Back</button>
      </div>
    </div>
  `;
}

/* -------------------------------------------------------------------------- */
/*                            Profile Interactions                            */
/* -------------------------------------------------------------------------- */

function initializeProfileInteractions(
  username: string,
  isOwnProfile: boolean
): void {
  // Initialize tabs
  initializeTabs(username);

  // Initialize follow functionality if viewing another user's profile
  if (!isOwnProfile && isLoggedIn()) {
    initializeFollowButton(username);
  }
}

function initializeTabs(username: string): void {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContent = document.getElementById('profile-tab-content');

  if (!tabContent) return;

  tabButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      // Remove active class from all tabs
      tabButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');

      const tab = button.getAttribute('data-tab');
      await switchTab(tab, username, tabContent);
    });
  });
}

async function switchTab(
  tab: string | null,
  username: string,
  container: HTMLElement
): Promise<void> {
  container.innerHTML = '<div class="loading">Loading...</div>';

  try {
    switch (tab) {
      case 'posts':
        const posts = await fetchUserPosts(username);
        container.innerHTML = renderPostsTab(posts);
        break;

      case 'media':
        const mediaPosts = await fetchUserPosts(username);
        const mediaOnly = mediaPosts.filter((post) => post.media?.url);
        container.innerHTML = renderMediaTab(mediaOnly);
        break;

      case 'following':
      case 'followers':
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">👥</div>
            <h3>${tab === 'following' ? 'Following' : 'Followers'}</h3>
            <p>This feature will be available soon.</p>
          </div>
        `;
        break;

      default:
        container.innerHTML = '<div class="error">Unknown tab</div>';
    }
  } catch (error) {
    console.error('Error switching tab:', error);
    container.innerHTML = '<div class="error">Failed to load content</div>';
  }
}

function renderMediaTab(posts: NoroffPost[]): string {
  if (posts.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-icon">🖼️</div>
        <h3>No media</h3>
        <p>Photos and videos will appear here.</p>
      </div>
    `;
  }

  return `
    <div class="media-grid">
      ${posts
        .map(
          (post) => `
        <div class="media-item">
          <img src="${post.media!.url}" alt="${post.media!.alt || 'Media'}" class="media-image">
        </div>
      `
        )
        .join('')}
    </div>
  `;
}

async function initializeFollowButton(username: string): Promise<void> {
  const followBtn = document.getElementById('follow-btn') as HTMLButtonElement;
  if (!followBtn) return;

  // Check if already following
  const isFollowing = await checkIfFollowing(username);
  updateFollowButton(followBtn, isFollowing);

  followBtn.addEventListener('click', async () => {
    const currentlyFollowing = followBtn.classList.contains('following');

    try {
      followBtn.disabled = true;
      followBtn.innerHTML = '<div class="loading-spinner-small"></div>';

      if (currentlyFollowing) {
        await unfollowUser(username);
        updateFollowButton(followBtn, false);
        showNotification(`Unfollowed ${username}`, 'success');
      } else {
        await followUser(username);
        updateFollowButton(followBtn, true);
        showNotification(`Following ${username}`, 'success');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      showNotification('Failed to update follow status', 'error');
    } finally {
      followBtn.disabled = false;
    }
  });
}

function updateFollowButton(
  button: HTMLButtonElement,
  isFollowing: boolean
): void {
  const followText = button.querySelector('.follow-text') as HTMLElement;
  const unfollowText = button.querySelector('.unfollow-text') as HTMLElement;

  if (isFollowing) {
    button.classList.add('following');
    followText.style.display = 'none';
    unfollowText.style.display = 'inline';
  } else {
    button.classList.remove('following');
    followText.style.display = 'inline';
    unfollowText.style.display = 'none';
  }
}

/* -------------------------------------------------------------------------- */
/*                            Follow/Unfollow API                             */
/* -------------------------------------------------------------------------- */

async function followUser(username: string): Promise<void> {
  try {
    await put(`/social/profiles/${username}/follow`, {});
  } catch (error) {
    console.error('Error following user:', error);
    throw new Error('Failed to follow user');
  }
}

async function unfollowUser(username: string): Promise<void> {
  try {
    await put(`/social/profiles/${username}/unfollow`, {});
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw new Error('Failed to unfollow user');
  }
}

async function checkIfFollowing(username: string): Promise<boolean> {
  try {
    // This would need to be implemented based on available API endpoints
    // For now, return false as default
    return false;
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/*                            Utility Functions                               */
/* -------------------------------------------------------------------------- */

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) return 'now';
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInHours < 24) return `${diffInHours}h`;
  if (diffInDays < 7) return `${diffInDays}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function showNotification(
  message: string,
  type: 'success' | 'error' | 'info' = 'info'
): void {
  // Use the same notification system as your FeedPage
  const notification = document.createElement('div');
  notification.className = `notification ${type}-notification`;
  notification.innerHTML = `<div class="notification-content">${message}</div>`;
  notification.style.cssText = `
    position: fixed;
    top: 90px;
    right: 20px;
    z-index: 10000;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    animation: slideInFromRight 0.3s ease-out;
    ${type === 'success' ? 'background: var(--success-color);' : ''}
    ${type === 'error' ? 'background: var(--danger-color);' : ''}
    ${type === 'info' ? 'background: var(--primary-color);' : ''}
  `;

  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.animation = 'slideOutToRight 0.3s ease-out forwards';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
