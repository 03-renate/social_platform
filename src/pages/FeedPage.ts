/**
 * @file FeedPage.ts
 * @description This file contains the Feed Page component.
 * It displays a feed of posts for the home page.
 * @author Your Name
 */
import postCard from '../components/postCard';
import { getAllPosts, type NoroffPost } from '../services/posts/posts';
import {
  getPostComments,
  createComment,
  toggleReaction,
  type Comment,
  getTimeAgo,
} from '../services/interactions/interactions';
import { renderRoute } from '../router';
import { isLoggedIn } from '../utils/auth';

export default async function FeedPage(): Promise<string> {
  try {
    // Show loading state initially
    const isUserLoggedIn = isLoggedIn();

    // If user is not logged in, show welcome page
    if (!isUserLoggedIn) {
      return renderWelcomePage();
    }

    // Check for search results first
    const searchData = (window as any).searchResults;
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');

    let posts: NoroffPost[];
    let isSearchResults = false;
    let searchResultsInfo = '';
    let paginationMeta = null;

    if (searchData && searchQuery && searchData.query === searchQuery) {
      // Use search results
      posts = searchData.results;
      isSearchResults = true;
      searchResultsInfo = `
        <div class="search-results-info">
          <div class="search-info-text">
            <span class="search-icon">🔍</span>
            <span>Showing <strong>${posts.length} results</strong> for "<strong>${searchQuery}</strong>"</span>
          </div>
          <button class="clear-search-btn" onclick="clearSearch()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Clear
          </button>
        </div>
      `;
    } else {
      // Get current page from URL parameters for regular feed
      const currentPage = parseInt(urlParams.get('page') || '1');
      const postsPerPage = 15;

      // Fetch posts from API with pagination
      const postsResponse = await getAllPosts(postsPerPage, currentPage);
      posts = postsResponse.data;
      paginationMeta = postsResponse.meta;
    }

    // Set up event listeners after DOM is rendered
    setTimeout(() => {
      initializeFeedInteractions();
      
      // Add clear search functionality
      (window as any).clearSearch = () => {
        delete (window as any).searchResults;
        history.pushState({ path: '/feed' }, '', '/feed');
        renderRoute('/feed');
      };
    }, 100);

    return `
      <div class="feed-page">
        <main class="feed-container">
          <!-- Feed Header -->
          <header class="feed-header">
            <h1 class="feed-title">${isSearchResults ? 'Search Results' : 'Your Feed'}</h1>
            <p class="feed-subtitle">${
              isSearchResults 
                ? `Results for your search query` 
                : `Discover what's happening in your network`
            }</p>
            ${searchResultsInfo}
          </header>

          <!-- Posts Container -->
          <div class="posts-container" id="posts-container">
            ${
              posts.length > 0
                ? posts
                    .map((post, index) => postCard(post, index * 0.1))
                    .join('')
                : '<div class="no-posts">No posts available. Start following people to see their posts!</div>'
            }
          </div>

          <!-- Pagination Controls -->
          ${paginationMeta ? renderPaginationControls(paginationMeta) : ''}
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
function renderWelcomePage(): string {
  // Set up CTA button event listeners after DOM is rendered
  setTimeout(() => {
    const ctaRegisterBtn = document.getElementById('cta-register');
    const ctaLoginBtn = document.getElementById('cta-login');

    if (ctaRegisterBtn) {
      ctaRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        history.pushState({ path: '/register' }, '', '/register');
        renderRoute('/register');
      });
    }

    if (ctaLoginBtn) {
      ctaLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        history.pushState({ path: '/login' }, '', '/login');
        renderRoute('/login');
      });
    }
  }, 0);

  return `
    <div class="feed-page page active">
      <!-- Main Content -->
      <main class="main-content">
        <div class="hero-section">
          <h1>Welcome to Social Platform</h1>
          <p class="hero-description">Connect, share, and discover with friends around the world.</p>
          
          <div class="cta-buttons">
            <button id="cta-register" class="btn btn-primary">
              ✨ Join Now
            </button>
            <button id="cta-login" class="btn btn-secondary">
              🔑 Sign In
            </button>
          </div>
        </div>

        <div class="features-section">
          <h2>Get Started</h2>
          <div class="feature-cards">
            <div class="feature-card">
              <div class="feature-icon">👥</div>
              <h3>Connect</h3>
              <p>Find and connect with friends, colleagues, and like-minded people.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📝</div>
              <h3>Share</h3>
              <p>Share your thoughts, experiences, and moments with your network.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🌟</div>
              <h3>Discover</h3>
              <p>Explore new content, trends, and opportunities in your feed.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;
}

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
    button.addEventListener('click', (event: Event) => {
      event.stopPropagation(); // Prevent post card click
      handleLikeClick(event);
    });
  });

  // Handle comment buttons - toggle visibility
  const commentButtons = document.querySelectorAll(
    '.comment-btn, .action-btn-compact.comment-btn'
  );
  commentButtons.forEach((button) => {
    button.addEventListener('click', (event: Event) => {
      event.stopPropagation(); // Prevent post card click
      handleCommentToggle(event);
    });
  });

  // Handle view buttons - show full post
  const viewButtons = document.querySelectorAll(
    '.view-btn, .action-btn-compact.view-btn'
  );
  viewButtons.forEach((button) => {
    button.addEventListener('click', (event: Event) => {
      event.stopPropagation(); // Prevent post card click
      handleViewPost(event);
    });
  });

  // Handle clickable post cards - navigate to single post page
  const postCards = document.querySelectorAll('.clickable-post');
  postCards.forEach((card) => {
    card.addEventListener('click', (event: Event) => {
      // Prevent navigation if clicking on action buttons
      const target = event.target as HTMLElement;
      if (
        target.closest(
          '.action-btn, .action-btn-compact, .like-btn, .comment-btn, .share-btn, .view-btn'
        )
      ) {
        return; // Let the button handle its own click
      }

      // Navigate to single post page
      const postId = (card as HTMLElement).dataset.postId;
      if (postId) {
        const singlePostUrl = `/post/${postId}`;
        history.pushState({ path: singlePostUrl }, '', singlePostUrl);
        renderRoute(singlePostUrl);
      }
    });
  });

  // Handle comment form submissions
  const commentSubmitButtons = document.querySelectorAll('.comment-submit-btn');
  commentSubmitButtons.forEach((button) => {
    button.addEventListener('click', (event: Event) => {
      event.stopPropagation(); // Prevent post card click
      handleCommentSubmit(event);
    });
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
    button.addEventListener('click', (event: Event) => {
      event.stopPropagation(); // Prevent post card click
      handleReactionClick(event);
    });
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
 * Handle comment button clicks
 */
function handleCommentClick(event: Event): void {
  const button = event.currentTarget as HTMLElement;
  const postId = button.dataset.postId;

  // TODO: Implement comment functionality
  console.log('Comment on post:', postId);
}

/**
 * Handle share button clicks
 */
function handleShareClick(event: Event): void {
  const button = event.currentTarget as HTMLElement;
  const postId = button.dataset.postId;

  // Simple share functionality
  if (navigator.share) {
    navigator.share({
      title: 'Check out this post',
      url: window.location.href,
    });
  } else {
    // Fallback - copy to clipboard
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  }

  console.log('Shared post:', postId);
}

/**
 * Handle read more button clicks
 */
function handleReadMoreClick(event: Event): void {
  const button = event.currentTarget as HTMLElement;
  const postId = button.dataset.postId;

  // TODO: Implement full post view
  console.log('Read more for post:', postId);
}

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

  if (postId) {
    // Navigate to single post page
    const singlePostUrl = `/post/${postId}`;
    history.pushState({ path: singlePostUrl }, '', singlePostUrl);
    renderRoute(singlePostUrl);
  }
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
