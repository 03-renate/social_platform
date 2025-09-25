/**
 * @file FeedPage.ts
 * @description This file contains the Feed Page component.
 * It displays a feed of posts for the home page.
 * @author Your Name
 */
import postCard from '../components/postCard';
import {
  getAllPosts,
  getPublicPosts,
  type NoroffPost,
} from '../services/posts/posts';
import {
  getPostComments,
  createComment,
  toggleReaction,
} from '../services/interactions/interactions';
import { renderRoute } from '../router';
import { isLoggedIn } from '../utils/auth';

export default async function FeedPage(): Promise<string> {
  try {
    // Show loading state initially
    const isUserLoggedIn = isLoggedIn();

    // Check for search results from navbar
    const searchQuery = (window as any).searchQuery;
    const searchResults = (window as any).searchResults as NoroffPost[];
    const isSearchMode = searchQuery && searchResults;

    let posts: NoroffPost[];
    let postsResponse: any;

    if (isSearchMode) {
      // Use search results
      posts = searchResults;
      postsResponse = {
        data: posts,
        meta: {
          currentPage: 1,
          pageCount: 1,
          totalCount: posts.length,
          isFirstPage: true,
          isLastPage: true,
        },
      };
    } else {
      // Get current page from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const currentPage = parseInt(urlParams.get('page') || '1');
      const postsPerPage = 15;

      try {
        // Try to fetch posts from API with pagination
        if (isUserLoggedIn) {
          // Authenticated users get personalized posts
          postsResponse = await getAllPosts(postsPerPage, currentPage);
        } else {
          // Unauthenticated users get public posts or sample posts
          postsResponse = await getPublicPosts(postsPerPage, currentPage);
        }
        posts = postsResponse.data;
      } catch (error) {
        // If API fails, show empty state (this should rarely happen now)
        console.log('Failed to load posts:', error);
        posts = [];
        postsResponse = {
          data: [],
          meta: {
            currentPage: 1,
            pageCount: 1,
            totalCount: 0,
            isFirstPage: true,
            isLastPage: true,
          },
        };
      }
    }

    // Set up event listeners after DOM is rendered
    setTimeout(() => {
      initializeFeedInteractions();
    }, 100);

    return `
      <div class="feed-page">
        <main class="feed-container">
          <!-- Feed Header -->
          <header class="feed-header">
            <h1 class="feed-title">${isUserLoggedIn ? 'Your Feed' : 'Social Feed'}</h1>
            <p class="feed-subtitle">${isUserLoggedIn ? `Discover what's happening in your network${!isSearchMode ? ` (Page ${postsResponse.meta.currentPage} of ${postsResponse.meta.pageCount})` : ''}` : `Explore public posts and discover interesting content${!isSearchMode ? ` (Page ${postsResponse.meta.currentPage} of ${postsResponse.meta.pageCount})` : ''}`}</p>
          </header>

          <!-- Posts Container -->
          <div class="posts-container" id="posts-container">
            ${
              posts.length > 0
                ? posts
                    .map((post, index) => postCard(post, index * 0.1))
                    .join('')
                : isSearchMode
                  ? `<div style="text-align: center; padding: 3rem; color: var(--text-muted); background: var(--bg-card); border-radius: var(--border-radius-lg); border: 1px solid var(--border-color);">
                      <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                      <h3>No posts found</h3>
                      <p>Try searching with different keywords</p>
                    </div>`
                  : `<div style="text-align: center; padding: 3rem; color: var(--text-muted); background: var(--bg-card); border-radius: var(--border-radius-lg); border: 1px solid var(--border-color);">
                      <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
                      <h3>No posts available</h3>
                      <p>${isUserLoggedIn ? 'Start following people to see their posts!' : 'No posts to display at the moment. Try refreshing the page.'}</p>
                      ${!isUserLoggedIn ? `<button class="btn btn-primary" onclick="window.location.href='/'" style="margin-top: 1rem;">🔑 Sign In for More Content</button>` : ''}
                    </div>`
            }
          </div>

          <!-- Pagination Controls (only show when not in search mode) -->
          ${!isSearchMode ? renderPaginationControls(postsResponse.meta) : ''}
        </main>
      </div>
    `;
  } catch (error) {
    console.error('Error loading feed:', error);
    return renderErrorState();
  }
}

/**
 * Render welcome page for non-logged in users
 */
/**
 * Render error state when posts fail to load
 */
function renderErrorState(): string {
  return `
    <div class="feed-page">
      <main class="feed-container">
        <div class="error-state">
          <div class="error-icon">⚠️</div>
          <h2>Something went wrong</h2>
          <p>We couldn't load the posts right now. Please try again.</p>
          <button class="retry-btn" onclick="window.location.reload()">
            Try Again
          </button>
        </div>
      </main>
    </div>
  `;
}

/**
 * Initialize feed interactions and event handlers
 */
function initializeFeedInteractions(): void {
  // Handle like/reaction buttons
  const likeButtons = document.querySelectorAll(
    '.like-btn, .action-btn-compact.like-btn'
  );
  likeButtons.forEach((button) => {
    button.addEventListener('click', handleLikeClick);
  });

  // Handle comment buttons - toggle visibility
  const commentButtons = document.querySelectorAll(
    '.comment-btn, .action-btn-compact.comment-btn'
  );
  commentButtons.forEach((button) => {
    button.addEventListener('click', handleCommentToggle);
  });

  // Handle view buttons - show full post
  const viewButtons = document.querySelectorAll(
    '.view-btn, .action-btn-compact.view-btn'
  );
  viewButtons.forEach((button) => {
    button.addEventListener('click', handleViewPost);
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
          handleCommentSubmit({ currentTarget: submitBtn } as Event);
        }
      }
    });
  });

  // Handle reaction buttons
  const reactionButtons = document.querySelectorAll('.reaction-btn');
  reactionButtons.forEach((button) => {
    button.addEventListener('click', handleReactionClick);
  });

  // Handle like button hover for reactions modal
  likeButtons.forEach((button) => {
    let hoverTimeout: number;

    button.addEventListener('mouseenter', () => {
      hoverTimeout = window.setTimeout(() => {
        showReactionsModal(button as HTMLElement);
      }, 800); // Show after 800ms hover
    });

    button.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimeout);
      hideReactionsModal(button as HTMLElement);
    });
  });

  // Handle load more button - removed for simplified feed
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (loadMoreBtn) {
    // Remove load more functionality
    loadMoreBtn.remove();
  }
}

/**
 * Handle like button clicks
 */
function handleLikeClick(event: Event): void {
  const button = event.currentTarget as HTMLElement;
  const postId = button.dataset.postId;

  // Toggle like state visually
  button.classList.toggle('liked');

  // TODO: Implement actual like API call
  console.log('Liked post:', postId);
}

/**
 * Handle like/reaction button clicks
 */

/**
 * Handle comment toggle (show/hide comments section)
 */
async function handleCommentToggle(event: Event): Promise<void> {
  const button = event.currentTarget as HTMLElement;
  const postId = button.dataset.postId;

  if (!postId) return;

  const commentsSection = document.getElementById(`comments-${postId}`);
  if (!commentsSection) return;

  if (
    commentsSection.style.display === 'none' ||
    !commentsSection.style.display
  ) {
    // Show comments - load them first
    try {
      const comments = await getPostComments(postId);
      const commentsList = document.getElementById(`comments-list-${postId}`);

      if (commentsList) {
        commentsList.innerHTML = comments.data
          .map(
            (comment) => `
          <div class="comment-item">
            <div class="comment-author">${comment.author.name}</div>
            <div class="comment-text">${comment.body}</div>
          </div>
        `
          )
          .join('');
      }

      commentsSection.style.display = 'block';
      button.classList.add('active');
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  } else {
    // Hide comments
    commentsSection.style.display = 'none';
    button.classList.remove('active');
  }
}

/**
 * Handle view full post
 */
function handleViewPost(event: Event): void {
  const button = event.currentTarget as HTMLElement;
  const postId = button.dataset.postId;

  // Navigate to full post page or show modal
  console.log('View full post:', postId);
  // TODO: Implement navigation to post detail page
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
      `;
      commentsList.appendChild(commentElement);
    }

    // Update comment count
    const commentButton = document.querySelector(
      `[data-post-id="${postId}"].comment-btn .action-count-compact`
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
 * Handle reaction click
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
    const likeCount = likeButton?.querySelector('.action-count-compact');

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
  const postCard = likeButton.closest('.post-card');
  if (!postCard) return;

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
  const postCard = likeButton.closest('.post-card');
  if (!postCard) return;

  const postId = likeButton.dataset.postId;
  const reactionsModal = document.getElementById(`reactions-${postId}`);

  if (reactionsModal) {
    reactionsModal.style.display = 'none';
  }
}

/**
 * Render pagination controls with Previous/Next buttons and First/Last page numbers
 */
function renderPaginationControls(meta: any): string {
  if (meta.pageCount <= 1) return '';

  const currentPage = meta.currentPage;
  const totalPages = meta.pageCount;
  const hasPrev = !meta.isFirstPage;
  const hasNext = !meta.isLastPage;

  return `
    <div class="pagination-container">
      <div class="pagination-info">
        <span class="pagination-text">
          Page ${currentPage} of ${totalPages} (${meta.totalCount} total posts)
        </span>
      </div>
      
      <div class="pagination-controls">
        <!-- Previous Button -->
        ${
          hasPrev
            ? `
          <button class="pagination-btn pagination-prev" onclick="navigateToPage(${currentPage - 1})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
            Previous
          </button>
        `
            : `
          <button class="pagination-btn pagination-prev disabled" disabled>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
            Previous
          </button>
        `
        }
        
        <!-- First Page -->
        ${
          currentPage !== 1
            ? `
          <button class="pagination-btn pagination-number" onclick="navigateToPage(1)">1</button>
          ${currentPage > 2 ? '<span class="pagination-ellipsis">...</span>' : ''}
        `
            : ''
        }
        
        <!-- Current Page -->
        <button class="pagination-btn pagination-number active" disabled>${currentPage}</button>
        
        <!-- Last Page -->
        ${
          currentPage !== totalPages
            ? `
          ${currentPage < totalPages - 1 ? '<span class="pagination-ellipsis">...</span>' : ''}
          <button class="pagination-btn pagination-number" onclick="navigateToPage(${totalPages})">${totalPages}</button>
        `
            : ''
        }
        
        <!-- Next Button -->
        ${
          hasNext
            ? `
          <button class="pagination-btn pagination-next" onclick="navigateToPage(${currentPage + 1})">
            Next
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9,6 15,12 9,18"></polyline>
            </svg>
          </button>
        `
            : `
          <button class="pagination-btn pagination-next disabled" disabled>
            Next
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9,6 15,12 9,18"></polyline>
            </svg>
          </button>
        `
        }
      </div>
    </div>
  `;
}

/**
 * Navigate to a specific page
 */
(window as any).navigateToPage = function (page: number) {
  const url = new URL(window.location.href);
  url.searchParams.set('page', page.toString());

  // Update URL and reload page
  history.pushState(
    { path: url.pathname + url.search },
    '',
    url.pathname + url.search
  );
  renderRoute(window.location.pathname);
};

/**
 * Clear search results and return to normal feed
 */
(window as any).clearSearch = function () {
  // Clear search data
  (window as any).searchQuery = null;
  (window as any).searchResults = null;

  // Clear search input in navbar
  const searchInput = document.getElementById(
    'navbar-search'
  ) as HTMLInputElement;
  if (searchInput) {
    searchInput.value = '';
  }

  // Reload feed page to show normal posts
  renderRoute('/');
};
