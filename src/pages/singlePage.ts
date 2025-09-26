/**
 * @file singlePage.ts
 * @description This file contains the Single Post Page component.
 * It displays a single post with full details, comments, and interactions.
 * @author Your Name
 */

import {
  getAllPosts,
  getPostById,
  type NoroffPost,
} from '../services/posts/posts';
import {
  getPostComments,
  createComment,
  toggleReaction,
} from '../services/interactions/interactions';
import { isLoggedIn } from '../utils/auth';

export default async function SinglePage(): Promise<string> {
  try {
    // Get post ID from URL path
    const postId = getPostIdFromURL();

    if (!postId) {
      return renderNotFound();
    }

    const id = Number(postId);
    if (isNaN(id)) {
      return `<div class="single-post-page">
        <main class="single-post-container">
          <div class="error-state">
            <div class="error-icon">⚠️</div>
            <h2>Invalid post ID</h2>
            <p>The post ID in the URL is not valid.</p>
            <button class="back-btn" onclick="history.pushState({path: '/feed'}, '', '/feed'); renderRoute('/feed');">
              Back to Feed
            </button>
          </div>
        </main>
      </div>`;
    }

    const isUserLoggedIn = isLoggedIn();

    // Fetch posts using getAllPosts and find the specific one
    let post: NoroffPost | undefined;

    try {
      // First try to get the single post directly (more efficient)
      try {
        post = await getPostById(id);
      } catch (directError) {
        console.warn(
          'Direct post fetch failed, trying getAllPosts approach:',
          directError
        );

        // Fallback: Get all posts and find the one we need
        const data = await getAllPosts();

        let posts: NoroffPost[] = [];

        if (Array.isArray(data)) {
          posts = data;
        } else if (data?.data && Array.isArray(data.data)) {
          posts = data.data;
        } else {
          console.warn('Unexpected response format:', data);
          return renderErrorState();
        }

        post = posts.find((p) => p.id === id);
      }
    } catch (error) {
      console.error('Error loading post:', error);
      return renderErrorState();
    }

    if (!post) {
      return renderPostNotFound();
    }

    // Set up event listeners after DOM is rendered
    setTimeout(() => {
      initializeSinglePostInteractions();
    }, 100);

    return `
      <div class="single-post-page">
        <main class="single-post-container">
          <!-- Single Post Content -->
          <article class="single-post-card" data-post-id="${post.id}">
            <!-- Post Header -->
            <header class="single-post-header">
              <div class="author-info">
                <div class="author-avatar">
                  ${
                    post.author?.avatar?.url
                      ? `<img src="${post.author.avatar.url}" alt="${post.author.avatar.alt}" class="avatar-img">`
                      : post.media?.url
                        ? `<img src="${post.media.url}" alt="${post.author?.name || 'User'}'s avatar" class="avatar-img">`
                        : `<div class="avatar-placeholder">${(post.author?.name || 'U').charAt(0).toUpperCase()}</div>`
                  }
                </div>
                <div class="author-details">
                  <h3 class="author-name">${post.author?.name || 'Anonymous User'}</h3>
                  <p class="post-date">${formatDate(post.created)}</p>
                  ${post.author?.bio ? `<p class="author-bio">${post.author.bio}</p>` : ''}
                </div>
              </div>
            </header>

            <!-- Post Media -->
            ${
              post.media?.url
                ? `
              <div class="single-post-media">
                <img src="${post.media.url}" alt="${post.media.alt || 'Post image'}" class="post-image-full">
              </div>
            `
                : ''
            }

            <!-- Post Content -->
            <div class="single-post-content">
              ${post.title ? `<h1 class="post-title">${post.title}</h1>` : ''}
              <div class="post-body">
                <p>${post.body}</p>
              </div>
              
              <!-- Tags -->
              ${
                post.tags && post.tags.length > 0
                  ? `
                <div class="post-tags">
                  ${post.tags.map((tag) => `<span class="tag">#${tag}</span>`).join('')}
                </div>
              `
                  : ''
              }
            </div>

            <!-- Post Actions -->
            <div class="single-post-actions">
              <div class="action-buttons">
                <button class="action-btn like-btn" data-post-id="${post.id}">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  <span class="action-text">Like</span>
                  <span class="action-count">${post._count?.reactions || 0}</span>
                </button>

                <button class="action-btn comment-btn" data-post-id="${post.id}">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span class="action-text">Comment</span>
                  <span class="action-count">${post._count?.comments || 0}</span>
                </button>

                <button class="action-btn share-btn" data-post-id="${post.id}">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 8h-1V6a6 6 0 0 0-6-6 6 6 0 0 0-6 6v2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2z"></path>
                  </svg>
                  <span class="action-text">Share</span>
                </button>
              </div>

              <!-- Reactions Modal -->
              <div class="reactions-modal" id="reactions-${post.id}" style="display: none;">
                <div class="reactions-grid">
                  <button class="reaction-btn" data-post-id="${post.id}" data-reaction="👍">👍</button>
                  <button class="reaction-btn" data-post-id="${post.id}" data-reaction="❤️">❤️</button>
                  <button class="reaction-btn" data-post-id="${post.id}" data-reaction="😂">😂</button>
                  <button class="reaction-btn" data-post-id="${post.id}" data-reaction="😮">😮</button>
                  <button class="reaction-btn" data-post-id="${post.id}" data-reaction="😢">😢</button>
                  <button class="reaction-btn" data-post-id="${post.id}" data-reaction="😡">😡</button>
                </div>
              </div>
            </div>

            <!-- Comments Section -->
            ${
              isUserLoggedIn
                ? `
            <div class="comments-section" id="comments-${post.id}">
              <div class="comment-form">
                <div class="comment-input-container">
                  <input type="text" class="comment-input" id="comment-input-${post.id}" placeholder="Write a comment...">
                  <button class="comment-submit-btn" data-post-id="${post.id}">Post</button>
                </div>
              </div>
              
              <div class="comments-list" id="comments-list-${post.id}">
                <div class="loading-comments">Loading comments...</div>
              </div>
            </div>
            `
                : `
            <div class="login-prompt">
              <p>Please <a href="/" onclick="history.pushState({path: '/'}, '', '/'); renderRoute('/');">sign in</a> to view and post comments.</p>
            </div>
            `
            }
          </article>
        </main>
      </div>
    `;
  } catch (error) {
    console.error('Error loading single post page:', error);
    return renderErrorState();
  }
}

/**
 * Extract post ID from URL path (e.g., /post/123 -> 123)
 */
function getPostIdFromURL(): string | null {
  const path = window.location.pathname;
  const match = path.match(/\/post\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} hours ago`;
  } else if (diffInHours < 168) {
    // 7 days
    return `${Math.floor(diffInHours / 24)} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Render not found state when no post ID is provided
 */
function renderNotFound(): string {
  return `
    <div class="single-post-page">
      <main class="single-post-container">
        <div class="error-state">
          <div class="error-icon">🔍</div>
          <h2>Post Not Found</h2>
          <p>The post you're looking for doesn't exist or the URL is invalid.</p>
          <button class="back-btn" onclick="history.pushState({path: '/feed'}, '', '/feed'); renderRoute('/feed');">
            Back to Feed
          </button>
        </div>
      </main>
    </div>
  `;
}

/**
 * Render post not found state when post doesn't exist
 */
function renderPostNotFound(): string {
  return `
    <div class="single-post-page">
      <main class="single-post-container">
        <div class="error-state">
          <div class="error-icon">📭</div>
          <h2>Post Not Found</h2>
          <p>This post may have been deleted or you don't have permission to view it.</p>
          <button class="back-btn" onclick="history.pushState({path: '/feed'}, '', '/feed'); renderRoute('/feed');">
            Back to Feed
          </button>
        </div>
      </main>
    </div>
  `;
}

/**
 * Render error state when something goes wrong
 */
function renderErrorState(): string {
  return `
    <div class="single-post-page">
      <main class="single-post-container">
        <div class="error-state">
          <div class="error-icon">⚠️</div>
          <h2>Something went wrong</h2>
          <p>We couldn't load this post right now. Please try again.</p>
          <button class="retry-btn" onclick="window.location.reload()">
            Try Again
          </button>
          <button class="back-btn" onclick="history.pushState({path: '/feed'}, '', '/feed'); renderRoute('/feed');">
            Back to Feed
          </button>
        </div>
      </main>
    </div>
  `;
}

/**
 * Initialize interactions for the single post page
 */
function initializeSinglePostInteractions(): void {
  // Handle like/reaction buttons
  const likeButtons = document.querySelectorAll('.like-btn');
  likeButtons.forEach((button) => {
    button.addEventListener('click', handleLikeClick);

    // Show reactions modal on hover
    let hoverTimeout: number;
    button.addEventListener('mouseenter', () => {
      hoverTimeout = window.setTimeout(() => {
        showReactionsModal(button as HTMLElement);
      }, 800);
    });

    button.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimeout);
      hideReactionsModal(button as HTMLElement);
    });
  });

  // Handle comment buttons
  const commentButtons = document.querySelectorAll('.comment-btn');
  commentButtons.forEach((button) => {
    button.addEventListener('click', handleCommentToggle);
  });

  // Handle share buttons
  const shareButtons = document.querySelectorAll('.share-btn');
  shareButtons.forEach((button) => {
    button.addEventListener('click', handleShareClick);
  });

  // Handle comment form submissions
  const commentSubmitButtons = document.querySelectorAll('.comment-submit-btn');
  commentSubmitButtons.forEach((button) => {
    button.addEventListener('click', handleCommentSubmit);
  });

  // Handle comment input enter key
  const commentInputs = document.querySelectorAll('.comment-input');
  commentInputs.forEach((input) => {
    input.addEventListener('keypress', (event: Event) => {
      const keyEvent = event as KeyboardEvent;
      if (keyEvent.key === 'Enter') {
        const postId = (input as HTMLInputElement).id.replace(
          'comment-input-',
          ''
        );
        const submitBtn = document.querySelector(
          `[data-post-id="${postId}"].comment-submit-btn`
        ) as HTMLElement;
        if (submitBtn) {
          handleCommentSubmit({ currentTarget: submitBtn } as unknown as Event);
        }
      }
    });
  });

  // Handle reaction buttons
  const reactionButtons = document.querySelectorAll('.reaction-btn');
  reactionButtons.forEach((button) => {
    button.addEventListener('click', handleReactionClick);
  });

  // Comments will be loaded when user clicks the comment button
}

/**
 * Handle like button clicks
 */
function handleLikeClick(event: Event): void {
  const button = event.currentTarget as HTMLElement;
  const postId = button.dataset.postId;

  // Toggle like state visually
  button.classList.toggle('liked');

  console.log('Liked post:', postId);
}

/**
 * Handle comment button clicks (scroll to comments and load them)
 */
async function handleCommentToggle(event: Event): Promise<void> {
  const button = event.currentTarget as HTMLElement;
  const postId = button.dataset.postId;

  const commentsSection = document.getElementById(`comments-${postId}`);
  if (commentsSection) {
    commentsSection.scrollIntoView({ behavior: 'smooth' });
    const commentInput = document.getElementById(
      `comment-input-${postId}`
    ) as HTMLInputElement;
    if (commentInput) {
      commentInput.focus();
    }

    // Load comments if not already loaded
    const commentsList = document.getElementById(`comments-list-${postId}`);
    if (
      commentsList &&
      commentsList.innerHTML.includes('Loading comments...')
    ) {
      await loadCommentsForPost(postId || '');
    }
  }
}

/**
 * Handle share button clicks
 */
function handleShareClick(event: Event): void {
  const button = event.currentTarget as HTMLElement;
  const postId = button.dataset.postId;

  const currentUrl = window.location.href;

  if (navigator.share) {
    navigator.share({
      title: 'Check out this post',
      url: currentUrl,
    });
  } else {
    navigator.clipboard.writeText(currentUrl).then(() => {
      alert('Link copied to clipboard!');
    });
  }

  console.log('Shared post:', postId);
}

/**
 * Handle comment submission
 */
async function handleCommentSubmit(event: Event): Promise<void> {
  const button = event.currentTarget as HTMLElement;
  const postId = button.dataset.postId;

  if (!postId) return;

  const commentInput = document.getElementById(
    `comment-input-${postId}`
  ) as HTMLInputElement;
  const commentText = commentInput?.value.trim();

  if (!commentText) return;

  try {
    // Disable button while submitting
    button.style.opacity = '0.5';
    (button as HTMLButtonElement).disabled = true;

    // Create comment via API
    const response = await createComment(postId, commentText);
    const newComment = response.data;

    // Add comment to UI
    const commentsList = document.getElementById(`comments-list-${postId}`);
    if (commentsList) {
      const commentElement = document.createElement('div');
      commentElement.className = 'comment-item';
      commentElement.innerHTML = `
        <div class="comment-author">${newComment.author.name}</div>
        <div class="comment-text">${newComment.body}</div>
        <div class="comment-date">${formatDate(newComment.created)}</div>
      `;

      // Remove loading message if it exists
      const loadingMessage = commentsList.querySelector('.loading-comments');
      if (loadingMessage) {
        loadingMessage.remove();
      }

      commentsList.appendChild(commentElement);
    }

    // Update comment count
    const commentButton = document.querySelector(
      `[data-post-id="${postId}"].comment-btn .action-count`
    );
    if (commentButton) {
      const currentCount = parseInt(commentButton.textContent || '0');
      commentButton.textContent = (currentCount + 1).toString();
    }

    // Clear input
    commentInput.value = '';
  } catch (error) {
    console.error('Error creating comment:', error);
    alert('Failed to post comment. Please try again.');
  } finally {
    // Re-enable button
    button.style.opacity = '1';
    (button as HTMLButtonElement).disabled = false;
  }
}

/**
 * Handle reaction clicks
 */
async function handleReactionClick(event: Event): Promise<void> {
  const button = event.currentTarget as HTMLElement;
  const postId = button.dataset.postId;
  const reaction = button.dataset.reaction;

  if (!postId || !reaction) return;

  try {
    const wasAdded = await toggleReaction(postId, reaction);

    // Update UI based on reaction state
    const likeButton = document.querySelector(
      `[data-post-id="${postId}"].like-btn`
    );
    const likeCount = likeButton?.querySelector('.action-count');

    if (likeCount) {
      const currentCount = parseInt(likeCount.textContent || '0');
      likeCount.textContent = wasAdded
        ? (currentCount + 1).toString()
        : Math.max(0, currentCount - 1).toString();
    }

    // Hide reactions modal
    hideReactionsModal(likeButton as HTMLElement);
  } catch (error) {
    console.error('Error toggling reaction:', error);
  }
}

/**
 * Show reactions modal
 */
function showReactionsModal(likeButton: HTMLElement): void {
  const postId = likeButton.dataset.postId;
  const reactionsModal = document.getElementById(`reactions-${postId}`);

  if (reactionsModal) {
    reactionsModal.style.display = 'block';
  }
}

/**
 * Hide reactions modal
 */
function hideReactionsModal(likeButton: HTMLElement): void {
  const postId = likeButton.dataset.postId;
  const reactionsModal = document.getElementById(`reactions-${postId}`);

  if (reactionsModal) {
    reactionsModal.style.display = 'none';
  }
}

/**
 * Load comments for a specific post
 */
async function loadCommentsForPost(postId: string): Promise<void> {
  if (!postId) return;

  const numericPostId = Number(postId);
  if (isNaN(numericPostId)) return;

  try {
    const comments = await getPostComments(postId);
    const commentsList = document.getElementById(`comments-list-${postId}`);

    if (commentsList) {
      if (comments.data.length === 0) {
        commentsList.innerHTML =
          '<div class="no-comments">No comments yet. Be the first to comment!</div>';
      } else {
        commentsList.innerHTML = comments.data
          .map(
            (comment) => `
            <div class="comment-item">
              <div class="comment-author">${comment.author.name}</div>
              <div class="comment-text">${comment.body}</div>
              <div class="comment-date">${formatDate(comment.created)}</div>
            </div>
          `
          )
          .join('');
      }
    }
  } catch (error) {
    console.error('Error loading comments:', error);
    const commentsList = document.getElementById(`comments-list-${postId}`);
    if (commentsList) {
      // Instead of showing error, just show a message that comments couldn't be loaded
      commentsList.innerHTML =
        '<div class="no-comments">Comments are not available for this post.</div>';
    }
  }
}
