/**
 * @file ProfilePage.ts
 * @description SPA Profile Page component template and logic.
 */

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

const DEFAULT_PROFILE: UserProfile = {
  name: "User Name",
  username: "username",
  avatarUrl: "https://ui-avatars.com/api/?name=User+Name&background=3b82f6&color=fff&size=128",
  description: "Let others get to know you, write a description about yourself here.",
  location: "Location",
  website: "Link",
  joinDate: "Joined N/A",
  following: 0,
  followers: 0,
  posts: 0
};

// ---------------- ACCESS INFO FOR TESTING ----------------
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoibHlyYV9ub3ZhayIsImVtYWlsIjoibHlyYS5ub3Zha0BzdHVkLm5vcm9mZi5ubyIsImlhdCI6MTc1ODY1MzU0OH0.TO-KD1khvNRZTNjuzuWxh-ZwfREYv1xAglzwFoymjwg';
const API_KEY = 'f7c3eed8-9891-4270-9f46-0ddcb5e3a2b9';

// ---------------- RENDER PROFILE PAGE ----------------
export async function renderProfilePage(root: HTMLElement, username?: string) {
  // Render default profile first
  root.innerHTML = generateProfileHTML(DEFAULT_PROFILE);
  setupTabs(root);

  if (!username) return;

  try {
    const res = await fetch(`https://v2.api.noroff.dev/social/profiles/${username}`, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    });

    if (!res.ok) throw new Error("Failed to fetch profile");

    const result = await res.json();
    const data = result.data;

    const profileData: UserProfile = {
      name: data.name || DEFAULT_PROFILE.name,
      username: data.email?.split("@")[0] || DEFAULT_PROFILE.username,
      avatarUrl: data.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=3b82f6&color=fff&size=128`,
      bannerUrl: data.banner?.url,
      description: data.bio || DEFAULT_PROFILE.description,
      location: DEFAULT_PROFILE.location,
      website: DEFAULT_PROFILE.website,
      joinDate: DEFAULT_PROFILE.joinDate,
      following: data._count?.following || DEFAULT_PROFILE.following,
      followers: data._count?.followers || DEFAULT_PROFILE.followers,
      posts: data._count?.posts || DEFAULT_PROFILE.posts
    };

    updateProfile(root, profileData);

  } catch (err) {
    console.error("Failed to fetch profile:", err);
  }
}

// ---------------- HTML GENERATOR ----------------
function generateProfileHTML(profile: UserProfile) {
  return `
    <div class="profile-container">
      <div class="profile-header-bg"></div>

      <div class="profile-content">
        <div class="profile-info">
          <div class="profile-avatar-wrapper">
            <div class="profile-avatar">
              <img src="${profile.avatarUrl}" alt="Profile" class="profile-avatar-img" />
            </div>
          </div>

          <div class="profile-header">
            <h1 class="profile-name">${profile.name}</h1>
            <button class="back-btn" id="back-btn">go back <i class="fa-solid fa-arrow-right"></i></button>
          </div>

          <p class="profile-username">@${profile.username}</p>

          <div class="profile-bio">
            <p>${profile.description}</p>
          </div>

          <div class="profile-meta">
            <span><i class="fa-solid fa-location-dot"></i> ${profile.location}</span>
            <span class="separator">·</span>
            <a href="${profile.website}" class="profile-link"><i class="fa-solid fa-link"></i> ${profile.website}</a>
            <span class="separator">·</span>
            <span><i class="fa-regular fa-calendar"></i> ${profile.joinDate}</span>
          </div>

          <div class="profile-stats">
            <div class="stat">
              <span class="stat-number">${profile.following}</span>
              <span class="stat-label">Following</span>
            </div>
            <div class="stat">
              <span class="stat-number">${profile.followers}</span>
              <span class="stat-label">Followers</span>
            </div>
            <div class="stat">
              <span class="stat-number">${profile.posts}</span>
              <span class="stat-label">Posts</span>
            </div>
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

      <div class="profile-content-area" id="contentArea">
        <p>Posts will appear here...</p>
      </div>
    </div>
  `;
}

// ---------------- UTILS ----------------
function formatUsername(str: string) {
  return str.replace(/_/g, ' ')
            .split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
}

// ---------------- TABS LOGIC ----------------
function setupTabs(root: HTMLElement) {
  const navTabs = root.querySelectorAll('.tab');
  if (!navTabs.length) return;

  navTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      navTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const contentArea = root.querySelector('#contentArea');
      const tabNames = ['Posts', 'Replies', 'Media', 'Likes'];
      if (contentArea) {
        contentArea.innerHTML = `<p>${tabNames[index]} will appear here...</p>`;
      }
    });
  });
}

// ---------------- UPDATE DOM ----------------
function updateProfile(root: HTMLElement, profile: UserProfile) {
  const profileHeaderBg = root.querySelector('.profile-header-bg') as HTMLElement;
  const profileName = root.querySelector('.profile-name') as HTMLElement;
  const profileUsername = root.querySelector('.profile-username') as HTMLElement;
  const profileAvatar = root.querySelector('.profile-avatar-img') as HTMLImageElement;
  const profileBio = root.querySelector('.profile-bio p') as HTMLElement;
  const statFollowing = root.querySelector('.profile-stats .stat:nth-child(1) .stat-number') as HTMLElement;
  const statFollowers = root.querySelector('.profile-stats .stat:nth-child(2) .stat-number') as HTMLElement;
  const statPosts = root.querySelector('.profile-stats .stat:nth-child(3) .stat-number') as HTMLElement;

  if (!profileHeaderBg || !profileName || !profileUsername || !profileAvatar || !profileBio) return;

  // Banner
  if (profile.bannerUrl) {
    profileHeaderBg.style.backgroundImage = `url('${profile.bannerUrl}')`;
    profileHeaderBg.style.backgroundSize = 'cover';
    profileHeaderBg.style.backgroundPosition = 'center';
  } else {
    profileHeaderBg.style.backgroundImage = '';
    profileHeaderBg.style.background = 'var(--gradient-bg)';
  }

  // Update info
  profileName.textContent = `${formatUsername(profile.name)}`;
  profileUsername.textContent = `@${profile.username}`;
  profileAvatar.src = profile.avatarUrl;
  profileAvatar.alt = `Profile avatar of ${profile.name}`;
  profileBio.textContent = profile.description;

  // Stats
  statFollowing.textContent = profile.following.toString();
  statFollowers.textContent = profile.followers.toString();
  statPosts.textContent = profile.posts.toString();
}

