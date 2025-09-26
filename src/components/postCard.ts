/**
 * Enhanced Instagram-like post card component with full CRUD functionality
 * @param post Post object
 * @param animationDelay Animation delay in seconds (for animate.css) - use the index
 */

import type { NoroffPost } from "../services/posts/posts";
import { getLocalItem } from "../utils/storage";

/**
 * Creates a comprehensive post card HTML with full interaction capabilities
 * @param post The post data from Noroff API
 * @param animationDelay Animation delay in seconds
 * @returns HTML string for the enhanced post card
 */
export default function postCard(
  post: NoroffPost,
  animationDelay: number = 0
): string {
  const {
    id,
    title = "",
    body = "",
    tags = [],
    media,
    created,
    author = { name: "Unknown", email: "unknown@mail.com" },
    _count = { comments: 0, reactions: 0 },
    reactions = [],
  } = post;

  // Check if current user owns this post
  const currentUser = getLocalItem("user");
  const isOwner = currentUser && author.name === currentUser;

  // Fallback avatar
  const avatarUrl =
    author?.avatar?.url || "https://via.placeholder.com/50?text=U";
  const avatarAlt = author?.avatar?.alt || author?.name || "User";

  // Format the date
  const createdDate = created ? new Date(created) : new Date();
  const timeAgo = getTimeAgo(createdDate);

  // Reaction count
  const reactionCount =
    reactions.reduce((total, reaction) => total + reaction.count, 0) || 0;

  // Truncate text
  const truncatedBody =
    body.length > 120 ? body.substring(0, 120) + "..." : body;
  const truncatedTitle =
    title.length > 50 ? title.substring(0, 50) + "..." : title;

  return `
    <article class="post-card" data-post-id="${id}" id="post-${id}" style="animation-delay: ${animationDelay}s">
      ${
        media?.url
          ? `
        <div class="post-media-preview">
          <img src="${media.url}" alt="${media.alt || "Post image"}" class="post-image-preview">
        </div>
      `
          : ""
      }

      <header class="post-header-compact">
        <div class="author-info-compact">
          <div class="author-avatar-small">
            <img src="${avatarUrl}" alt="${avatarAlt}" class="avatar-img-small">
          </div>
          <div class="author-details-compact">
            <h4 class="author-name-compact">${author?.name || "Unknown"}</h4>
            <p class="post-time-compact">${timeAgo}</p>
          </div>
        </div>
        
        ${
          isOwner
            ? `
        <div class="post-owner-controls">
          <div class="dropdown">
            <button class="post-menu-btn" onclick="togglePostMenu(${id})" aria-label="Post options">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="12" cy="5" r="1"></circle>
                <circle cx="12" cy="19" r="1"></circle>
              </svg>
            </button>
            <div class="dropdown-content post-menu" id="postMenu${id}">
              <a href="#" class="dropdown-item" onclick="editPost(${id}); return false;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit Post
              </a>
              <a href="#" class="dropdown-item danger" onclick="deletePost(${id}); return false;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3,6 5,6 21,6"></polyline>
                  <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                </svg>
                Delete Post
              </a>
            </div>
          </div>
        </div>
        `
            : ""
        }
      </header>

      <div class="post-content-compact">
        ${truncatedTitle ? `<h3 class="post-title-compact">${truncatedTitle}</h3>` : ""}
        <div class="post-text-compact post-body">
          <p>${truncatedBody}</p>
        </div>
        ${
          tags.length > 0
            ? `<div class="post-tags-compact">
                ${tags
                  .slice(0, 2)
                  .map((tag) => `<span class="tag-compact">#${tag}</span>`)
                  .join("")}
                ${
                  tags.length > 2
                    ? `<span class="tag-more">+${tags.length - 2}</span>`
                    : ""
                }
              </div>`
            : ""
        }
      </div>

      <footer class="post-actions-compact">
        <div class="action-buttons-compact">
          <!-- Like Button with Reactions -->
          <div style="position: relative;">
            <button 
              class="action-btn-compact like-btn" 
              data-post-id="${id}"
              onclick="toggleReaction(${id}, '❤️')"
              onmouseenter="showReactionsModal(${id})"
              onmouseleave="hideReactionsModal(${id})"
            >
              ❤️ <span class="action-count-compact">${reactionCount}</span>
            </button>
            
            <!-- Reactions Modal -->
            <div class="reactions-modal" id="reactions-${id}" style="display: none;">
              <div class="reactions-list">
                ${["👍", "❤️", "😂", "😮", "😢", "😡"]
                  .map(
                    (emoji) =>
                      `<button class="reaction-btn" onclick="selectReaction(${id}, '${emoji}')">${emoji}</button>`
                  )
                  .join("")}
              </div>
            </div>
          </div>

          <!-- Comment Button -->
          <button class="action-btn-compact comment-btn" data-post-id="${id}" onclick="toggleComments(${id})">
            💬 <span class="action-count-compact">${_count.comments}</span>
          </button>

          <!-- View Full Post Button -->
          <button class="action-btn-compact view-btn" data-post-id="${id}" onclick="viewFullPost(${id})">
            👁 <span class="action-label">View</span>
          </button>
        </div>
      </footer>

      <!-- Comments Section -->
      <div class="comments-section" id="comments-${id}" style="display: none;">
        <div class="comments-header">
          <h4>Comments</h4>
          <button class="close-comments-btn" onclick="toggleComments(${id})">×</button>
        </div>
        <div class="comments-list" id="comments-list-${id}">
          <!-- Comments will be loaded here -->
        </div>
        <div class="comment-form">
          <div class="comment-input-container">
            <input 
              type="text" 
              id="comment-input-${id}" 
              class="comment-input" 
              placeholder="Write a comment..." 
              maxlength="280"
              onkeypress="if(event.key === 'Enter') submitComment(${id})"
            >
            <button class="comment-submit-btn" onclick="submitComment(${id})">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}

/**
 * Calculate time ago from a date
 * @param date The date to calculate from
 * @returns Formatted time ago string
 */
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
}

/**
 * Show reactions modal on hover
 */
function showReactionsModal(postId: number): void {
  const modal = document.getElementById(`reactions-${postId}`);
  if (modal) {
    modal.style.display = "block";
  }
}

/**
 * Hide reactions modal when not hovering
 */
function hideReactionsModal(postId: number): void {
  // Add a small delay to allow clicking on reactions
  setTimeout(() => {
    const modal = document.getElementById(`reactions-${postId}`);
    if (modal && !modal.matches(":hover")) {
      modal.style.display = "none";
    }
  }, 200);
}

// Make functions globally available
(window as any).showReactionsModal = showReactionsModal;
(window as any).hideReactionsModal = hideReactionsModal;
