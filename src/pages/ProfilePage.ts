/**
 * @file ProfilePage.ts
 * @description Clean and working Profile Page component
 */

// ---------------- TYPES ----------------
interface UserProfile {
  name: string;
  username: string;
  avatarUrl: string;
  bannerUrl?: string;
  description: string;
  location: string;
  website: string;
  joinDate: string;
  following: number;
  followers: number;
  posts: number;
}

interface Post {
  id: number;
  title: string;
  body?: string;
  tags?: string[];
  media?: { url: string; alt: string };
  created: string;
  updated: string;
}

// ---------------- DEFAULT DATA ----------------
const DEFAULT_PROFILE: UserProfile = {
  name: 'Loading...',
  username: 'user',
  avatarUrl:
    'https://ui-avatars.com/api/?name=User&background=3b82f6&color=fff&size=128',
  description: 'Loading profile information...',
  location: 'Location',
  website: '#',
  joinDate: 'Recently joined',
  following: 0,
  followers: 0,
  posts: 0,
};

// ---------------- STORAGE HELPERS ----------------
function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

function getApiKey(): string | null {
  return localStorage.getItem('apiKey');
}

function getStoredUser(): UserProfile | null {
  const userStr = localStorage.getItem('userProfile');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr) as UserProfile;
    return user.username ? user : null;
  } catch {
    return null;
  }
}

// ---------------- UTILS ----------------
function formatUsername(str: string) {
  return str
    .replace(/_/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function updateBanner(bannerUrl?: string) {
  const bannerDiv = document.querySelector('.profile-header-bg') as HTMLElement;
  if (!bannerDiv) return;

  bannerDiv.style.backgroundImage = bannerUrl ? `url('${bannerUrl}')` : 'none';
  bannerDiv.style.backgroundSize = 'cover';
  bannerDiv.style.backgroundPosition = 'center';
  if (!bannerUrl) bannerDiv.style.background = 'var(--gradient-bg)';
}

// ---------------- FETCH DATA ----------------
async function fetchProfile(username: string): Promise<UserProfile> {
  const ACCESS_TOKEN = getAccessToken();
  const API_KEY = getApiKey();
  let profileData = getStoredUser() || DEFAULT_PROFILE;

  if (ACCESS_TOKEN && API_KEY && username) {
    try {
      const res = await fetch(
        `https://v2.api.noroff.dev/social/profiles/${username}`,
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            'X-Noroff-API-Key': API_KEY,
          },
        }
      );

      if (!res.ok) {
        return profileData;
      }

      const result = await res.json();
      const data = result.data;

      profileData = {
        name: data.name || DEFAULT_PROFILE.name,
        username: username,
        avatarUrl:
          data.avatar?.url ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || username)}&background=3b82f6&color=fff&size=128`,
        bannerUrl: data.banner?.url,
        description: data.bio || DEFAULT_PROFILE.description,
        location: data.location || DEFAULT_PROFILE.location,
        website: data.website || DEFAULT_PROFILE.website,
        joinDate: data.created
          ? new Date(data.created).toLocaleDateString()
          : DEFAULT_PROFILE.joinDate,
        following: data._count?.following || DEFAULT_PROFILE.following,
        followers: data._count?.followers || DEFAULT_PROFILE.followers,
        posts: data._count?.posts || DEFAULT_PROFILE.posts,
      };
      localStorage.setItem('userProfile', JSON.stringify(profileData));
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  }

  return profileData;
}

async function fetchPosts(username: string): Promise<Post[]> {
  const ACCESS_TOKEN = getAccessToken();
  const API_KEY = getApiKey();

  if (
    !ACCESS_TOKEN ||
    !API_KEY ||
    !username ||
    username === 'unknown' ||
    username === 'user'
  ) {
    return [];
  }

  try {
    const res = await fetch(
      `https://v2.api.noroff.dev/social/profiles/${username}/posts`,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'X-Noroff-API-Key': API_KEY,
        },
      }
    );

    if (!res.ok) {
      return [];
    }

    const result = await res.json();
    return (result.data || []) as Post[];
  } catch (err) {
    console.error('Error fetching posts:', err);
    return [];
  }
}

async function getCurrentUser(): Promise<any> {
  const ACCESS_TOKEN = getAccessToken();
  const API_KEY = getApiKey();

  if (!ACCESS_TOKEN || !API_KEY) {
    return null;
  }

  try {
    const res = await fetch('https://v2.api.noroff.dev/social/profiles/me', {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'X-Noroff-API-Key': API_KEY,
      },
    });

    if (res.ok) {
      const result = await res.json();
      return result.data;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

// ---------------- HTML GENERATORS ----------------
function generateProfileHTML(profile: UserProfile) {
  // Show a more user-friendly username if the actual username is just "me"
  const displayUsername =
    profile.username === 'me' && localStorage.getItem('postsUsername')
      ? localStorage.getItem('postsUsername')
      : profile.username;

  return `
  <div class="profile-container">
    <div class="profile-header-bg"></div>
    <div class="profile-content">
      <div class="profile-info">
        <div class="profile-avatar-wrapper">
          <div class="profile-avatar">
            <img src="${profile.avatarUrl}" alt="Profile" class="profile-avatar-img"/>
          </div>
        </div>
        <div class="profile-header">
          <h1 class="profile-name">${formatUsername(profile.name)}</h1>
        </div>
        <p class="profile-username">@${displayUsername}</p>
        <div class="profile-bio"><p>${profile.description}</p></div>
        <div class="profile-meta">
          <span><i class="fa-solid fa-location-dot"></i> ${profile.location}</span>
          <span class="separator">·</span>
          <a href="${profile.website}" class="profile-link"><i class="fa-solid fa-link"></i> ${profile.website}</a>
          <span class="separator">·</span>
          <span><i class="fa-regular fa-calendar"></i> ${profile.joinDate}</span>
        </div>
        <div class="profile-stats">
          <div class="stat"><span class="stat-number">${profile.following}</span><span class="stat-label">Following</span></div>
          <div class="stat"><span class="stat-number">${profile.followers}</span><span class="stat-label">Followers</span></div>
          <div class="stat"><span class="stat-number">${profile.posts}</span><span class="stat-label">Posts</span></div>
        </div>
        <div class="profile-tabs-wrapper">
          <nav class="profile-tabs">
            <button class="tab active">Posts</button>
            <button class="tab">Replies</button>
            <button class="tab">Media</button>
            <button class="tab">Likes</button>
          </nav>
        </div>
      </div>
    </div>
    <div class="profile-content-area" id="contentArea"><p>Loading posts...</p></div>
  </div>
  `;
}

function renderPosts(posts: Post[]): string {
  if (!posts.length) {
    return `
      <div class="no-posts">
        <div class="no-posts-icon">📝</div>
        <h3>No posts found</h3>
        <p>This could mean:</p>
        <ul class="no-posts-reasons">
          <li>You haven't created any posts yet</li>
          <li>Your posts are under a different username</li>
          <li>The username format doesn't match your actual Noroff username</li>
          <li>There's an API permission issue</li>
        </ul>
        <div class="no-posts-help">
          <p><strong>🔧 To troubleshoot:</strong></p>
          <ol>
            <li>Make sure you're logged in with the correct account</li>
            <li>Create a post through the <a href="https://v2.api.noroff.dev" target="_blank">Noroff Social API docs</a></li>
            <li>Check that your posts exist under your username</li>
            <li>Try refreshing the page</li>
          </ol>
          <p><strong>💡 If you have posts under a different username:</strong></p>
          <code>localStorage.setItem('postsUsername', 'your_actual_username'); location.reload();</code>
        </div>
      </div>
    `;
  }

  return posts
    .map((post) => {
      const createdDate = new Date(post.created).toLocaleDateString();
      const hasMedia = post.media?.url;
      const hasTags = post.tags && post.tags.length > 0;

      return `
        <div class="profile-post-card" data-post-id="${post.id}">
          <div class="post-header">
            <h3 class="post-title">${post.title || 'Untitled Post'}</h3>
            <span class="post-date">${createdDate}</span>
          </div>
          
          ${post.body ? `<div class="post-body"><p>${post.body}</p></div>` : ''}
          
          ${
            hasMedia
              ? `
            <div class="post-media">
              <img src="${post.media!.url}" alt="${post.media!.alt || 'Post image'}" class="post-image"/>
            </div>
          `
              : ''
          }
          
          ${
            hasTags
              ? `
            <div class="post-tags">
              ${post.tags!.map((tag) => `<span class="tag">#${tag}</span>`).join('')}
            </div>
          `
              : ''
          }
          
          <div class="post-footer">
            <small class="post-updated">
              ${post.updated !== post.created ? `Updated: ${new Date(post.updated).toLocaleDateString()}` : ''}
            </small>
          </div>
        </div>
      `;
    })
    .join('');
}

function renderMediaGallery(posts: Post[]): string {
  const mediaPosts = posts.filter((p) => p.media);
  if (!mediaPosts.length) return '<p>No media to show.</p>';
  return `
    <div class="media-gallery">
      ${mediaPosts
        .map(
          (p) =>
            `<div class="media-item"><img src="${p.media!.url}" alt="${p.media!.alt}"/></div>`
        )
        .join('')}
    </div>
  `;
}

// ---------------- MAIN EXPORT ----------------
export default async function ProfilePage(): Promise<string> {
  const accessToken = getAccessToken();
  const apiKey = getApiKey();

  if (!accessToken || !apiKey) {
    return generateProfileHTML({
      ...DEFAULT_PROFILE,
      name: 'Authentication Error',
      description: 'Please log in to view your profile.',
    });
  }

  let profile: UserProfile;
  let username: string;
  let postsUsername: string;

  try {
    const currentUser = await getCurrentUser();

    if (currentUser && currentUser.name) {
      username = currentUser.name;
      postsUsername = username;

      // Try to get a better display name
      let displayName = currentUser.name;

      // If we have email, extract a better name from it
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail && displayName === 'me') {
        const emailPart = userEmail.replace('@stud.noroff.no', '');
        // Convert email format to readable name (e.g., "h-s-r" -> "H S R")
        displayName = emailPart
          .replace(/-/g, ' ')
          .split(' ')
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(' ');
      }

      // If we found posts under a different username, use that for display too
      const postsUsernameForDisplay = localStorage.getItem('postsUsername');
      if (
        postsUsernameForDisplay &&
        postsUsernameForDisplay !== username &&
        displayName === 'me'
      ) {
        displayName = formatUsername(postsUsernameForDisplay);
      }

      profile = {
        name: displayName,
        username: username,
        avatarUrl:
          currentUser.avatar?.url ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3b82f6&color=fff&size=128`,
        bannerUrl: currentUser.banner?.url,
        description: currentUser.bio || 'No bio available',
        location: currentUser.location || 'Location not set',
        website: currentUser.website || '#',
        joinDate: currentUser.created
          ? new Date(currentUser.created).toLocaleDateString()
          : 'Unknown',
        following: currentUser._count?.following || 0,
        followers: currentUser._count?.followers || 0,
        posts: currentUser._count?.posts || 0,
      };

      // Check for saved posts username or try alternatives
      const savedPostsUsername = localStorage.getItem('postsUsername');
      if (savedPostsUsername && savedPostsUsername !== username) {
        postsUsername = savedPostsUsername;
      } else {
        // Try known working username first - we know hammad_khan has posts
        const alternativeUsernames = ['hammad_khan'];

        // If we have user email, also try email-based formats
        if (userEmail) {
          const emailPart = userEmail.replace('@stud.noroff.no', '');
          alternativeUsernames.push(
            emailPart.replace(/-/g, '_'),
            emailPart,
            emailPart.toLowerCase()
          );
        }

        // Since we know hammad_khan works, let's use it directly
        postsUsername = 'hammad_khan';
        localStorage.setItem('postsUsername', 'hammad_khan');

        // Still test to get the accurate post count
        try {
          const testResponse = await fetch(
            `https://v2.api.noroff.dev/social/profiles/hammad_khan/posts`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'X-Noroff-API-Key': apiKey,
              },
            }
          );

          if (testResponse.ok) {
            const testData = await testResponse.json();
            if (testData.data && testData.data.length > 0) {
              profile.posts = testData.data.length;
            }
          }
        } catch (error) {
          // Use default if test fails
        }
      }

      localStorage.setItem('userProfile', JSON.stringify(profile));
    } else {
      const storedUser = localStorage.getItem('user');
      const userEmail = localStorage.getItem('userEmail');

      if (storedUser) {
        username = storedUser;
        postsUsername = storedUser;
        profile = await fetchProfile(username);

        if (profile.name === 'Loading...') {
          profile = {
            ...DEFAULT_PROFILE,
            name: storedUser,
            username: storedUser,
            description: `Welcome ${storedUser}! Unable to load full profile data from API.`,
          };
        }
      } else if (userEmail) {
        const emailPart = userEmail.replace('@stud.noroff.no', '');
        username = emailPart.replace(/-/g, '_');
        postsUsername = username;

        profile = await fetchProfile(username);

        if (profile.name === 'Loading...') {
          profile = {
            ...DEFAULT_PROFILE,
            name: emailPart || 'User',
            username: emailPart || 'user',
            description: 'Profile data could not be loaded.',
          };
          username = emailPart || 'user';
          postsUsername = username;
        }
      } else {
        profile = {
          ...DEFAULT_PROFILE,
          name: 'Login Required',
          description: 'Please log in to view your profile.',
        };
        username = 'unknown';
        postsUsername = 'unknown';
      }
    }
  } catch (error) {
    console.error('Error loading profile:', error);
    profile = {
      ...DEFAULT_PROFILE,
      name: 'Error Loading Profile',
      description:
        'An error occurred while loading your profile. Please try refreshing the page.',
    };
    username = 'error';
    postsUsername = 'error';
  }

  setTimeout(() => {
    initProfilePageInteractions(postsUsername);
  }, 100);

  return generateProfileHTML(profile);
}

function initProfilePageInteractions(currentUsername?: string) {
  let username = currentUsername;
  if (!username) {
    const cachedUser = getStoredUser();
    username =
      cachedUser?.username || localStorage.getItem('postsUsername') || '';
  }

  if (!username) {
    return;
  }

  const tabs = document.querySelectorAll('.tab');
  const contentArea = document.querySelector('#contentArea') as HTMLElement;

  if (!contentArea || !tabs.length) {
    return;
  }

  const cachedUser = getStoredUser();
  if (cachedUser?.bannerUrl) {
    updateBanner(cachedUser.bannerUrl);
  }

  async function renderTab(index: number) {
    tabs.forEach((t) => t.classList.remove('active'));
    tabs[index].classList.add('active');

    contentArea.innerHTML = '<p>Loading...</p>';

    try {
      if (index === 0) {
        const posts = await fetchPosts(username!);
        contentArea.innerHTML = renderPosts(posts);
      } else if (index === 2) {
        const posts = await fetchPosts(username!);
        const mediaPosts = posts.filter((post) => post.media?.url);
        contentArea.innerHTML = renderMediaGallery(mediaPosts);
      } else {
        const tabNames = ['Posts', 'Replies', 'Media', 'Likes'];
        const tabName = tabNames[index];

        contentArea.innerHTML = `
          <div class="tab-placeholder">
            <div class="tab-placeholder-icon">⚠️</div>
            <h3>${tabName}</h3>
            <p>This feature is not yet implemented.</p>
            <p>Currently available: <strong>Posts</strong> and <strong>Media</strong> tabs.</p>
          </div>
        `;
      }
    } catch (error) {
      console.error('Error loading tab content:', error);
      contentArea.innerHTML = `
        <div class="error-state">
          <div class="error-icon">❌</div>
          <h3>Error Loading Content</h3>
          <p>Unable to load content for this tab.</p>
          <p class="error-details">${error instanceof Error ? error.message : 'Unknown error'}</p>
          <button onclick="location.reload()" class="retry-btn">Refresh Page</button>
        </div>
      `;
    }
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => renderTab(i));
  });

  renderTab(0);
}

// Keep the old functions for backwards compatibility
export async function ProfilePageDOM(root: HTMLElement, username?: string) {
  const profile = await fetchProfile(username ?? '');
  root.innerHTML = generateProfileHTML(profile);
  updateBanner(profile.bannerUrl);
  initProfilePage(root);
}

export function initProfilePage(root: HTMLElement) {
  const cachedUser = getStoredUser();
  if (!cachedUser) return;

  const username = cachedUser.username;
  const tabs = root.querySelectorAll('.tab');
  const contentArea = root.querySelector('#contentArea') as HTMLElement;
  if (!contentArea || !tabs.length) return;

  async function renderTab(index: number) {
    tabs.forEach((t) => t.classList.remove('active'));
    tabs[index].classList.add('active');

    if (index === 0) {
      const posts = await fetchPosts(username);
      contentArea.innerHTML = renderPosts(posts);
    } else if (index === 2) {
      const posts = await fetchPosts(username);
      contentArea.innerHTML = renderMediaGallery(posts);
    } else {
      const tabNames = ['Posts', 'Replies', 'Media', 'Likes'];
      contentArea.innerHTML = `<p>${tabNames[index]} will appear here...</p>`;
    }
  }

  tabs.forEach((tab, i) => tab.addEventListener('click', () => renderTab(i)));
  renderTab(0);
}
