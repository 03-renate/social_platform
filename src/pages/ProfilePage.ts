/**
 * ProfilePage.ts
 * This module handles the user profile page, including fetching and displaying
 * user profile data and posts from the API.
 * It also manages tab navigation for different content sections.
 * Dependencies: None (Vanilla TypeScript)
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
  name: "User Name",
  username: "username",
  avatarUrl: "https://ui-avatars.com/api/?name=User+Name&background=3b82f6&color=fff&size=128",
  description: "Let others get to know you, write a description about yourself here.",
  location: "Location",
  website: "Link",
  joinDate: "Joined N/A",
  following: 0,
  followers: 0,
  posts: 0,
};

// ---------------- STORAGE HELPERS ----------------
function getAccessToken(): string | null {
  return localStorage.getItem("accessToken");
}

function getApiKey(): string | null {
  return localStorage.getItem("apiKey");
}

function getStoredUser(): UserProfile | null {
  const userStr = localStorage.getItem("userProfile");
  if (!userStr) return null;
  const user = JSON.parse(userStr) as UserProfile;
  return user.username ? user : null;
}

// ---------------- UTILS ----------------
function formatUsername(str: string) {
  return str
    .replace(/_/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function updateBanner(bannerUrl?: string) {
  const bannerDiv = document.querySelector(".profile-header-bg") as HTMLElement;
  if (!bannerDiv) return;

  bannerDiv.style.backgroundImage = bannerUrl ? `url('${bannerUrl}')` : "none";
  bannerDiv.style.backgroundSize = "cover";
  bannerDiv.style.backgroundPosition = "center";
  if (!bannerUrl) bannerDiv.style.background = "var(--gradient-bg)";
}

// ---------------- FETCH DATA ----------------
async function fetchProfile(username: string): Promise<UserProfile> {
  const safeUsername = username.replace(/\./g, "_");
  const ACCESS_TOKEN = getAccessToken();
  const API_KEY = getApiKey();
  let profileData = getStoredUser() || DEFAULT_PROFILE;

  if (ACCESS_TOKEN && API_KEY && safeUsername) {
    try {
      const res = await fetch(`https://v2.api.noroff.dev/social/profiles/${safeUsername}`, {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "X-Noroff-API-Key": API_KEY,
        },
      });
      if (!res.ok) return profileData;

      const result = await res.json();
      const data = result.data;
      profileData = {
        name: data.name || DEFAULT_PROFILE.name,
        username: safeUsername,
        avatarUrl: data.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=3b82f6&color=fff&size=128`,
        bannerUrl: data.banner?.url,
        description: data.bio || DEFAULT_PROFILE.description,
        location: data.location || DEFAULT_PROFILE.location,
        website: data.website || DEFAULT_PROFILE.website,
        joinDate: data.joined || DEFAULT_PROFILE.joinDate,
        following: data._count?.following || DEFAULT_PROFILE.following,
        followers: data._count?.followers || DEFAULT_PROFILE.followers,
        posts: data._count?.posts || DEFAULT_PROFILE.posts,
      };
      localStorage.setItem("userProfile", JSON.stringify(profileData));
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  }

  return profileData;
}

async function fetchPosts(username: string): Promise<Post[]> {
  const safeUsername = username.replace(/\./g, "_");
  const ACCESS_TOKEN = getAccessToken();
  const API_KEY = getApiKey();
  if (!ACCESS_TOKEN || !API_KEY) return [];

  try {
    const res = await fetch(`https://v2.api.noroff.dev/social/profiles/${safeUsername}/posts`, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "X-Noroff-API-Key": API_KEY },
    });
    if (!res.ok) throw new Error("Failed to fetch posts");
    const result = await res.json();
    return result.data as Post[];
  } catch (err) {
    console.error(err);
    return [];
  }
}

// ---------------- HTML GENERATORS ----------------
function generateProfileHTML(profile: UserProfile) {
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
        <p class="profile-username">@${profile.username}</p>
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
    <div class="profile-content-area" id="contentArea"><p>Posts will appear here...</p></div>
  </div>
  `;
}

function renderPosts(posts: Post[]): string {
  if (!posts.length) return "<p>No posts to show.</p>";
  return posts
    .map(
      (p) => `
    <div class="post-card">
      <h3>${p.title}</h3>
      ${p.media ? `<img src="${p.media.url}" alt="${p.media.alt}" class="post-media"/>` : ""}
      ${p.body ? `<p>${p.body}</p>` : ""}
      ${p.tags?.length ? `<p class="tags">${p.tags.map((t) => `#${t}`).join(" ")}</p>` : ""}
      <small>Created: ${new Date(p.created).toLocaleString()}</small>
    </div>`
    )
    .join("");
}

function renderMediaGallery(posts: Post[]): string {
  const mediaPosts = posts.filter((p) => p.media);
  if (!mediaPosts.length) return "<p>No media to show.</p>";
  return `
    <div class="media-gallery">
      ${mediaPosts
        .map(
          (p) => `<div class="media-item"><img src="${p.media!.url}" alt="${p.media!.alt}"/></div>`
        )
        .join("")}
    </div>
  `;
}

// ---------------- PROFILE PAGE LOGIC ----------------
export async function ProfilePage(root: HTMLElement, username?: string) {
  const profile = await fetchProfile(username ?? "");
  root.innerHTML = generateProfileHTML(profile);
  updateBanner(profile.bannerUrl);
  initProfilePage(root);
}

export function initProfilePage(root: HTMLElement) {
  const cachedUser = getStoredUser();
  if (!cachedUser) return;

  const username = cachedUser.username;
  const tabs = root.querySelectorAll(".tab");
  const contentArea = root.querySelector("#contentArea") as HTMLElement;
  if (!contentArea || !tabs.length) return;

  async function renderTab(index: number) {
    tabs.forEach((t) => t.classList.remove("active"));
    tabs[index].classList.add("active");

    if (index === 0) {
      const posts = await fetchPosts(username);
      contentArea.innerHTML = renderPosts(posts);
    } else if (index === 2) {
      const posts = await fetchPosts(username);
      contentArea.innerHTML = renderMediaGallery(posts);
    } else {
      const tabNames = ["Posts", "Replies", "Media", "Likes"];
      contentArea.innerHTML = `<p>${tabNames[index]} will appear here...</p>`;
    }
  }

  tabs.forEach((tab, i) => tab.addEventListener("click", () => renderTab(i)));
  renderTab(0);
}
