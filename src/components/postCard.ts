/**
 * Instagram-like post card component
 * @param post Post object
 * @param animationDelay Animation delay in seconds (for animate.css) - use the index
 */

import type { NoroffPost } from '../services/posts/posts';

/**
 * Creates a compact post card HTML for grid layout
 * @param post The post data from Noroff API
 * @param animationDelay Animation delay in seconds
 * @returns HTML string for the compact post card
 */
export default function postCard(
  post: NoroffPost,
  animationDelay: number = 0
): string {
  const { id, title, body, tags, media, created, author, _count, reactions } =
    post;

  // Format the date
  const createdDate = new Date(created);
  const timeAgo = getTimeAgo(createdDate);

  // Get reaction count
  const reactionCount =
    reactions?.reduce((total, reaction) => total + reaction.count, 0) || 0;

  // Truncate body text for card preview (shorter for grid)
  const truncatedBody = body.length > 80 ? body.substring(0, 80) + '...' : body;
  const truncatedTitle =
    title && title.length > 40 ? title.substring(0, 40) + '...' : title;

  return `
    <article class="post-card" data-post-id="${id}" style="animation-delay: ${animationDelay}s">
      <!-- Post Media (if exists) -->
      ${
        media?.url
          ? `
        <div class="post-media-preview">
          <img src="${media.url}" alt="${media.alt || 'Post image'}" class="post-image-preview">
        </div>
      `
          : ''
      }

      <!-- Post Header -->
      <header class="post-header-compact">
        <div class="author-info-compact">
          <div class="author-avatar-small">
            ${
              author.avatar?.url
                ? `<img src="${author.avatar.url}" alt="${author.avatar.alt || author.name}" class="avatar-img-small">`
                : `<div class="avatar-placeholder-small">${author.name.charAt(0).toUpperCase()}</div>`
            }
          </div>
          <div class="author-details-compact">
            <h4 class="author-name-compact">${author.name}</h4>
            <p class="post-time-compact">${timeAgo}</p>
          </div>
        </div>
      </header>

      <!-- Post Content -->
      <div class="post-content-compact">
        ${truncatedTitle ? `<h3 class="post-title-compact">${truncatedTitle}</h3>` : ''}
        
        <div class="post-text-compact">
          <p>${truncatedBody}</p>
        </div>

        ${
          tags.length > 0
            ? `
          <div class="post-tags-compact">
            ${tags
              .slice(0, 2)
              .map((tag) => `<span class="tag-compact">#${tag}</span>`)
              .join('')}
            ${tags.length > 2 ? `<span class="tag-more">+${tags.length - 2}</span>` : ''}
          </div>
        `
            : ''
        }
      </div>

      <!-- Post Actions Compact -->
      <footer class="post-actions-compact">
        <div class="action-buttons-compact">
          <button class="action-btn-compact like-btn" data-post-id="${id}" aria-label="Like post">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span class="action-count-compact">${reactionCount}</span>
          </button>
          
          <button class="action-btn-compact comment-btn" data-post-id="${id}" aria-label="Comment on post">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span class="action-count-compact">${_count.comments}</span>
          </button>
          
          <button class="action-btn-compact view-btn" data-post-id="${id}" aria-label="View full post">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>
      </footer>

      <!-- Comments Section (Initially Hidden) -->
      <div class="comments-section" id="comments-${id}" style="display: none;">
        <div class="comments-list" id="comments-list-${id}">
          <!-- Comments will be loaded here -->
        </div>
        
        <div class="comment-form">
          <div class="comment-input-container">
            <input type="text" class="comment-input" placeholder="Write a comment..." 
                   id="comment-input-${id}" maxlength="280">
            <button class="comment-submit-btn" data-post-id="${id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Reactions Modal (Initially Hidden) -->
      <div class="reactions-modal" id="reactions-${id}" style="display: none;">
        <div class="reactions-list">
          <button class="reaction-btn" data-reaction="👍" data-post-id="${id}">👍</button>
          <button class="reaction-btn" data-reaction="❤️" data-post-id="${id}">❤️</button>
          <button class="reaction-btn" data-reaction="😂" data-post-id="${id}">😂</button>
          <button class="reaction-btn" data-reaction="😮" data-post-id="${id}">😮</button>
          <button class="reaction-btn" data-reaction="😢" data-post-id="${id}">😢</button>
          <button class="reaction-btn" data-reaction="😡" data-post-id="${id}">😡</button>
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

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}
