/**
 * Enhanced FeedPage with full CRUD, Comments, and Reactions functionality
 * @file Enhanced FeedPage.ts - COMPLETE VERSION
 */

import postCard from '../components/postCard';
import {
  getAllPosts,
  getPublicPosts,
  createPost,
  updatePost,
  deletePost,
  type NoroffPost,
} from '../services/posts/posts';
import {
  createComment,
  toggleReaction,
  deleteComment,
} from '../services/interactions/interactions';
import { isLoggedIn } from '../utils/auth';
import { getLocalItem } from '../utils/storage';

// Add missing import for navigation function
declare global {
  interface Window {
    searchQuery?: string;
    searchResults?: NoroffPost[];
    navigateToProfile?: (username: string) => void;
    navigateToPage?: (page: number) => void;
  }
}

export default async function FeedPage(): Promise<string> {
  try {
    const isUserLoggedIn = isLoggedIn();

    // Check for search results from navbar
    const searchQuery = window.searchQuery;
    const searchResults = window.searchResults as NoroffPost[];
    const isSearchMode = Boolean(searchQuery && searchResults);

    let posts: NoroffPost[] = [];
    let postsResponse: any;

    if (isSearchMode) {
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
      const urlParams = new URLSearchParams(window.location.search);
      const currentPage = parseInt(urlParams.get('page') || '1', 10);
      const postsPerPage = 15;

      try {
        if (isUserLoggedIn) {
          postsResponse = await getAllPosts(postsPerPage, currentPage);
        } else {
          postsResponse = await getPublicPosts(postsPerPage, currentPage);
        }
        posts = postsResponse.data;
      } catch (error) {
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

    // Initialize event listeners after DOM is rendered
    setTimeout(() => {
      initializeFeedInteractions();
    }, 100);

    return `
      <div class="feed-page">
        <main class="feed-container">
          <!-- Feed Header -->
          <header class="feed-header">
            <h1 class="feed-title">${isUserLoggedIn ? 'Your Feed' : 'Social Feed'}</h1>
            <p class="feed-subtitle">${
              isUserLoggedIn
                ? `Discover what's happening in your network${
                    !isSearchMode
                      ? ` (Page ${postsResponse.meta.currentPage} of ${postsResponse.meta.pageCount})`
                      : ''
                  }`
                : `Explore public posts and discover interesting content${
                    !isSearchMode
                      ? ` (Page ${postsResponse.meta.currentPage} of ${postsResponse.meta.pageCount})`
                      : ''
                  }`
            }</p>
          </header>

          <!-- Create Post Form (only logged-in users) -->
${
  isUserLoggedIn
    ? `
        <section class="create-post-box collapsed" id="create-post-box">
           <form id="create-post-form" class="create-post-form">
    
               <!-- Collapsed View -->
               <div class="collapsed-view">
                  <input 
                  type="text" 
                  id="collapsed-input" 
                  placeholder="What's on your mind?" 
                  readonly 
                   />
               </div>

                <!-- Expanded View (hidden until clicked) -->
               <div class="expanded-fields" style="display: none;">
                  <h2>Create a Post</h2>
                     <div class="form-group">
                        <label for="post-title">Title</label>
                        <input type="text" id="post-title" name="title" placeholder="Enter a title" required />
                     </div>
                     <div class="form-group">
                         <label for="post-body">Body</label>
                         <textarea id="post-body" name="body" rows="3" placeholder="What's on your mind?" required></textarea>
                     </div>
                     <div class="form-group">
                         <label for="post-tags">Tags (comma separated)</label>
                         <input type="text" id="post-tags" name="tags" placeholder="e.g. nature, coding, life" />
                     </div>
                     <div class="form-group">
                         <label for="post-image-url">Image URL</label>
                         <input type="url" id="post-image-url" name="imageUrl" placeholder="https://example.com/image.jpg" />
                     </div>
                     <div class="form-group">
                         <label for="post-image-alt">Image Alt Text</label>
                         <input type="text" id="post-image-alt" name="imageAlt" placeholder="Describe the image" />
                     </div>

                     <div class="form-actions">
                         <button type="submit" class="btn btn-primary">Post</button>
                         <button type="button" id="cancel-post-btn" class="btn btn-secondary">Cancel</button>
                     </div>
                  </div>
             </form>
         </section>
`
    : ''
}

          <!-- Posts Container -->
          <div class="posts-container" id="posts-container">
            ${
              posts.length > 0
                ? posts
                    .map((post, index) => postCard(post, index * 0.1))
                    .join('')
                : isSearchMode
                  ? renderEmptyState(
                      '🔍',
                      'No posts found',
                      'Try searching with different keywords'
                    )
                  : renderEmptyState(
                      '🔭',
                      'No posts available',
                      isUserLoggedIn
                        ? 'Start following people to see their posts!'
                        : 'No posts to display at the moment. Try refreshing the page.',
                      !isUserLoggedIn
                        ? `<button class="btn btn-primary" onclick="window.location.href='/'" style="margin-top: 1rem;">🔐 Sign In for More Content</button>`
                        : ''
                    )
            }
          </div>

          <!-- Pagination Controls (only show when not in search mode) -->
          ${!isSearchMode ? renderPaginationControls(postsResponse.meta) : ''}
        </main>
      </div>

      <!-- Edit Post Modal -->
      <div class="modal" id="editPostModal" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>✏️ Edit Your Post</h3>
            <button class="modal-close" onclick="closeEditModal()">×</button>
          </div>
          <form id="editPostForm">
            <div class="form-group">
              <label for="editPostTitle">Title</label>
              <input type="text" id="editPostTitle" class="form-control" required />
            </div>
            <div class="form-group">
              <label for="editPostBody">Body</label>
              <textarea id="editPostBody" class="form-control" rows="6" required></textarea>
            </div>
            <div class="form-group">
              <label for="editPostTags">Tags (comma separated)</label>
              <input type="text" id="editPostTags" class="form-control" />
            </div>
            <div class="form-group">
              <label for="editPostImageUrl">Image URL</label>
              <input type="url" id="editPostImageUrl" class="form-control" />
            </div>
            <div class="form-group">
              <label for="editPostImageAlt">Image Alt Text</label>
              <input type="text" id="editPostImageAlt" class="form-control" />
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
              <button type="button" class="btn btn-secondary" onclick="closeEditModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">💾 Update Post</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Full Post View Modal -->
      <div class="modal" id="fullPostModal" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>📄 Full Post</h3>
            <button class="modal-close" onclick="closeFullPostModal()">×</button>
          </div>
          <div id="fullPostContent">
            <!-- Full post content will be loaded here -->
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading feed:', error);
    return renderErrorState();
  }
}

/* -------------------------------------------------------------------------- */
/*                               Helper Functions                             */
/* -------------------------------------------------------------------------- */

function renderEmptyState(
  icon: string,
  title: string,
  message: string,
  extra: string = ''
): string {
  return `
    <div style="text-align: center; padding: 3rem; color: var(--text-muted); background: var(--bg-card); border-radius: var(--border-radius-lg); border: 1px solid var(--border-color);">
      <div style="font-size: 3rem; margin-bottom: 1rem;">${icon}</div>
      <h3>${title}</h3>
      <p>${message}</p>
      ${extra}
    </div>
  `;
}

function renderErrorState(): string {
  return `
    <div class="feed-page">
      <main class="feed-container">
        <div class="error-state">
          <div class="error-icon">⚠️</div>
          <h2>Something went wrong</h2>
          <p>We couldn't load the posts right now. Please try again.</p>
          <button class="retry-btn" onclick="window.location.reload()">Try Again</button>
        </div>
      </main>
    </div>
  `;
}

function renderPaginationControls(meta: any): string {
  if (!meta || meta.pageCount <= 1) return '';

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
        ${
          hasPrev
            ? `<button class="pagination-btn pagination-prev" onclick="navigateToPage(${currentPage - 1})">Previous</button>`
            : `<button class="pagination-btn pagination-prev disabled" disabled>Previous</button>`
        }
        ${currentPage !== 1 ? `<button class="pagination-btn pagination-number" onclick="navigateToPage(1)">1</button>` : ''}
        <button class="pagination-btn pagination-number active" disabled>${currentPage}</button>
        ${currentPage !== totalPages ? `<button class="pagination-btn pagination-number" onclick="navigateToPage(${totalPages})">${totalPages}</button>` : ''}
        ${
          hasNext
            ? `<button class="pagination-btn pagination-next" onclick="navigateToPage(${currentPage + 1})">Next</button>`
            : `<button class="pagination-btn pagination-next disabled" disabled>Next</button>`
        }
      </div>
    </div>
  `;
}

/* -------------------------------------------------------------------------- */
/*                            Interactions / Events                           */
/* -------------------------------------------------------------------------- */

function initializeFeedInteractions(): void {
  // Handle create post form
  const createForm = document.getElementById(
    'create-post-form'
  ) as HTMLFormElement | null;
  if (createForm) {
    createForm.addEventListener('submit', handleCreatePost);
  }

  // Collapsible create post box
  const postBox = document.getElementById('create-post-box');
  const collapsedInput = document.getElementById('collapsed-input');
  const expandedFields = postBox?.querySelector(
    '.expanded-fields'
  ) as HTMLElement;
  const cancelBtn = document.getElementById('cancel-post-btn');

  if (postBox && collapsedInput && expandedFields) {
    collapsedInput.addEventListener('click', () => {
      postBox.classList.remove('collapsed');
      postBox.classList.add('expanded');
      expandedFields.style.display = 'block';
      collapsedInput.style.display = 'none';
    });

    cancelBtn?.addEventListener('click', () => {
      postBox.classList.remove('expanded');
      postBox.classList.add('collapsed');
      expandedFields.style.display = 'none';
      collapsedInput.style.display = 'block';
      createForm?.reset();
    });
  }

  // Handle edit post form
  const editForm = document.getElementById(
    'editPostForm'
  ) as HTMLFormElement | null;
  if (editForm) {
    editForm.addEventListener('submit', handleEditPost);
  }

  // Enhanced: Close dropdowns when clicking outside
  document.addEventListener('click', function (e) {
    const target = e.target as Element;
    if (!target.closest('.dropdown')) {
      document.querySelectorAll('.post-menu.show').forEach((menu) => {
        menu.classList.remove('show');
      });
    }
  });

  // Make ALL functions globally available
  (window as any).togglePostMenu = togglePostMenu;
  (window as any).editPost = editPostFunction;
  (window as any).deletePost = deletePostFunction;
  (window as any).toggleComments = toggleComments;
  (window as any).submitComment = submitComment;
  (window as any).startReply = startReply;
  (window as any).cancelReply = cancelReply;
  (window as any).submitReply = submitReply;
  (window as any).deleteCommentFunction = deleteCommentFunction;
  (window as any).toggleReaction = handleToggleReaction;
  (window as any).selectReaction = selectReaction;
  (window as any).viewFullPost = viewFullPost;
  (window as any).closeEditModal = closeEditModal;
  (window as any).closeFullPostModal = closeFullPostModal;
  (window as any).showReactionsModal = showReactionsModal;
  (window as any).hideReactionsModal = hideReactionsModal;

  // Define missing navigation functions
  if (!window.navigateToProfile) {
    (window as any).navigateToProfile = function (username: string) {
      window.location.href = `/profile?user=${username}`;
    };
  }

  if (!window.navigateToPage) {
    (window as any).navigateToPage = function (page: number) {
      const url = new URL(window.location.href);
      url.searchParams.set('page', page.toString());
      window.location.href = url.toString();
    };
  }
}

/* -------------------------------------------------------------------------- */
/*                                Post Create                                 */
/* -------------------------------------------------------------------------- */

async function handleCreatePost(event: Event): Promise<void> {
  event.preventDefault();

  const form = event.target as HTMLFormElement;
  const title = (
    document.getElementById('post-title') as HTMLInputElement
  )?.value.trim();
  const body = (
    document.getElementById('post-body') as HTMLTextAreaElement
  )?.value.trim();
  const rawTags = (
    document.getElementById('post-tags') as HTMLInputElement
  )?.value.trim();
  const tags = rawTags
    ? rawTags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
    : [];
  const imageUrl = (
    document.getElementById('post-image-url') as HTMLInputElement
  )?.value.trim();
  const imageAlt = (
    document.getElementById('post-image-alt') as HTMLInputElement
  )?.value.trim();

  if (!title || !body) {
    alert('Title and Body are required.');
    return;
  }

  try {
    const submitBtn = form.querySelector(
      "button[type='submit']"
    ) as HTMLButtonElement;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Posting...';

    const payload: any = { title, body, tags };
    if (imageUrl) payload.media = { url: imageUrl, alt: imageAlt || 'image' };

    const created = await createPost(payload);
    const safePost: NoroffPost = {
      ...created,
      tags: created.tags || [],
      _count: created._count || { comments: 0, reactions: 0 },
      reactions: created.reactions || [],
    };

    // Insert new post at top
    const postsContainer = document.getElementById('posts-container');
    if (postsContainer) {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = postCard(safePost, 0);
      const el = wrapper.firstElementChild;
      if (el) postsContainer.insertBefore(el, postsContainer.firstChild);
    }

    // Reset and collapse form
    form.reset();
    const postBox = document.getElementById('create-post-box');
    const collapsedInput = document.getElementById('collapsed-input');
    const expandedFields = postBox?.querySelector(
      '.expanded-fields'
    ) as HTMLElement;

    if (postBox && collapsedInput && expandedFields) {
      postBox.classList.remove('expanded');
      postBox.classList.add('collapsed');
      expandedFields.style.display = 'none';
      collapsedInput.style.display = 'block';
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'Post';

    showNotification('✅ Post created successfully!', 'success');
  } catch (err: any) {
    console.error('Error creating post:', err);
    alert(err?.message || 'Failed to create post. Please try again.');
    const submitBtn = form.querySelector(
      "button[type='submit']"
    ) as HTMLButtonElement;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Post';
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                           Post Edit / Delete                               */
/* -------------------------------------------------------------------------- */

function togglePostMenu(postId: number): void {
  // Close all other menus first
  document.querySelectorAll('.post-menu').forEach((menu) => {
    if (menu.id !== `postMenu${postId}`) {
      menu.classList.remove('show');
    }
  });

  const menu = document.getElementById(`postMenu${postId}`);
  if (menu) {
    menu.classList.toggle('show');
  }
}

function editPostFunction(postId: number): void {
  const postElement = document.getElementById(`post-${postId}`);
  if (!postElement) return;

  const title =
    postElement.querySelector('.post-title-compact')?.textContent || '';
  const body = postElement.querySelector('.post-body')?.textContent || '';
  const tags = Array.from(postElement.querySelectorAll('.tag-compact'))
    .map((tag) => tag.textContent?.replace('#', '') || '')
    .filter((tag) => tag.length > 0);

  // Find media info if exists
  const mediaImg = postElement.querySelector(
    '.post-image-preview'
  ) as HTMLImageElement;
  const imageUrl = mediaImg?.src || '';
  const imageAlt = mediaImg?.alt || '';

  // Populate edit form
  (document.getElementById('editPostTitle') as HTMLInputElement).value = title;
  (document.getElementById('editPostBody') as HTMLTextAreaElement).value = body;
  (document.getElementById('editPostTags') as HTMLInputElement).value =
    tags.join(', ');
  (document.getElementById('editPostImageUrl') as HTMLInputElement).value =
    imageUrl;
  (document.getElementById('editPostImageAlt') as HTMLInputElement).value =
    imageAlt;

  // Store post ID for form submission
  const editModal = document.getElementById('editPostModal');
  if (editModal) {
    editModal.dataset.postId = postId.toString();
    editModal.style.display = 'flex';
  }

  // Close post menu
  togglePostMenu(postId);
}

async function handleEditPost(event: Event): Promise<void> {
  event.preventDefault();

  const modal = document.getElementById('editPostModal');
  const postId = Number(modal?.dataset.postId);
  if (!postId) return;

  const title = (
    document.getElementById('editPostTitle') as HTMLInputElement
  ).value.trim();
  const body = (
    document.getElementById('editPostBody') as HTMLTextAreaElement
  ).value.trim();
  const rawTags = (
    document.getElementById('editPostTags') as HTMLInputElement
  ).value.trim();
  const tags = rawTags
    ? rawTags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
    : [];
  const imageUrl = (
    document.getElementById('editPostImageUrl') as HTMLInputElement
  ).value.trim();
  const imageAlt = (
    document.getElementById('editPostImageAlt') as HTMLInputElement
  ).value.trim();

  if (!title || !body) {
    alert('Title and Body are required.');
    return;
  }

  try {
    const submitBtn = modal?.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating...';

    const payload: any = { title, body, tags };
    if (imageUrl) payload.media = { url: imageUrl, alt: imageAlt || 'image' };

    const updated = await updatePost(postId, payload);

    // Update the post in the UI
    const postElement = document.getElementById(`post-${postId}`);
    if (postElement) {
      // Update title and body
      const titleEl = postElement.querySelector('.post-title-compact');
      const bodyEl = postElement.querySelector('.post-body');
      if (titleEl) titleEl.textContent = updated.title;
      if (bodyEl) bodyEl.textContent = updated.body;

      // Update tags
      const tagsContainer = postElement.querySelector('.post-tags-compact');
      if (tagsContainer && updated.tags) {
        tagsContainer.innerHTML =
          updated.tags
            .slice(0, 2)
            .map((tag) => `<span class="tag-compact">#${tag}</span>`)
            .join('') +
          (updated.tags.length > 2
            ? `<span class="tag-more">+${updated.tags.length - 2}</span>`
            : '');
      }

      // Update media if changed
      if (updated.media?.url) {
        let mediaContainer = postElement.querySelector('.post-media-preview');
        if (!mediaContainer) {
          mediaContainer = document.createElement('div');
          mediaContainer.className = 'post-media-preview';
          postElement.insertBefore(mediaContainer, postElement.firstChild);
        }
        mediaContainer.innerHTML = `<img src="${updated.media.url}" alt="${updated.media.alt || 'Post image'}" class="post-image-preview">`;
      }
    }

    closeEditModal();
    showNotification('✅ Post updated successfully!', 'success');

    submitBtn.disabled = false;
    submitBtn.textContent = '💾 Update Post';
  } catch (error) {
    console.error('Error updating post:', error);
    alert('Failed to update post. Please try again.');

    const submitBtn = modal?.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = '💾 Update Post';
    }
  }
}

async function deletePostFunction(postId: number): Promise<void> {
  if (
    !confirm(
      'Are you sure you want to delete this post? This action cannot be undone.'
    )
  ) {
    togglePostMenu(postId);
    return;
  }

  try {
    await deletePost(postId);
    const postElement = document.getElementById(`post-${postId}`);
    if (postElement) {
      postElement.style.opacity = '0';
      postElement.style.transform = 'translateY(-20px)';
      setTimeout(() => postElement.remove(), 300);
    }

    showNotification('✅ Post deleted successfully!', 'success');
  } catch (error) {
    console.error('Error deleting post:', error);
    alert('Failed to delete post. Please try again.');
  }

  togglePostMenu(postId);
}

function closeEditModal(): void {
  const modal = document.getElementById('editPostModal');
  if (modal) {
    modal.style.display = 'none';
    delete modal.dataset.postId;
  }
}

/* -------------------------------------------------------------------------- */
/*                           Comments Functionality                           */
/* -------------------------------------------------------------------------- */

async function toggleComments(postId: number): Promise<void> {
  const commentsSection = document.getElementById(`comments-${postId}`);
  if (!commentsSection) return;

  const isVisible = commentsSection.style.display !== 'none';

  if (isVisible) {
    commentsSection.style.display = 'none';
  } else {
    commentsSection.style.display = 'block';
    // Always load comments when opening
    await loadComments(postId);
  }
}

async function loadComments(postId: number): Promise<void> {
  const commentsList = document.getElementById(`comments-list-${postId}`);
  if (!commentsList) return;

  commentsList.innerHTML =
    '<div class="no-comments">No comments yet. Be the first to comment!</div>';
}

async function submitComment(postId: number): Promise<void> {
  const input = document.getElementById(
    `comment-input-${postId}`
  ) as HTMLInputElement;
  const commentText = input?.value.trim();

  if (!commentText) {
    input?.focus();
    return;
  }

  if (commentText.length > 280) {
    alert('Comment is too long. Maximum 280 characters allowed.');
    return;
  }

  const submitBtn = document.querySelector(
    `[onclick="submitComment(${postId})"]`
  ) as HTMLButtonElement;

  try {
    // Disable button and show loading
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="loading-spinner-small"></div>';
    }

    // Create the comment using the correct API
    const response = await createComment(postId.toString(), commentText);

    console.log('Comment created successfully:', response);

    // Clear input
    input.value = '';

    // Since we can't fetch comments, we'll add the comment to the UI manually
    addCommentToUI(postId, {
      id: response.data.id,
      body: commentText,
      author: {
        name: getLocalItem('user') || 'You',
        email: '',
        avatar: null,
      },
      created: new Date().toISOString(),
      postId: postId.toString(),
      replyToId: null,
      owner: getLocalItem('user') || '',
      updated: new Date().toISOString(),
    });

    // Update comment count in post card
    const commentCountEl = document.querySelector(
      `[data-post-id="${postId}"].comment-btn .action-count-compact`
    );
    if (commentCountEl) {
      const currentCount = parseInt(commentCountEl.textContent || '0');
      commentCountEl.textContent = (currentCount + 1).toString();
    }

    showNotification('Comment added!', 'success');
  } catch (error: any) {
    console.error('Error creating comment:', error);

    // Show specific error messages
    if (error.message?.includes('unauthorized')) {
      alert('Please log in to comment on posts.');
    } else if (error.message?.includes('not found')) {
      alert('Post not found. Please refresh the page.');
    } else {
      alert('Failed to post comment. Please try again.');
    }
  } finally {
    // Re-enable button
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
        </svg>
      `;
    }
  }
}

function addCommentToUI(postId: number, comment: any): void {
  const commentsList = document.getElementById(`comments-list-${postId}`);
  if (!commentsList) return;

  // Remove "no comments" message if it exists
  const noCommentsMsg = commentsList.querySelector('.no-comments');
  if (noCommentsMsg) {
    noCommentsMsg.remove();
  }

  // Create comment HTML
  const timeAgo = 'now';
  const currentUserName = getLocalItem('user');
  const isOwner = currentUserName && comment.author.name === currentUserName;

  const commentHTML = `
    <div class="comment-item" data-comment-id="${comment.id}" style="animation-delay: 0s">
      <div class="comment-avatar">
        <div class="comment-avatar-placeholder">${comment.author.name.charAt(0).toUpperCase()}</div>
      </div>
      <div class="comment-content">
        <div class="comment-header">
          <span class="comment-author">${comment.author.name}</span>
          <span class="comment-time">${timeAgo}</span>
        </div>
        <div class="comment-text">${comment.body}</div>
        <div class="comment-actions">
          <button class="comment-action-btn reply-btn" onclick="startReply(${comment.id}, '${comment.author.name}')">
            Reply
          </button>
          ${
            isOwner
              ? `
            <button class="comment-action-btn delete-btn" onclick="deleteCommentFunction(${postId}, ${comment.id})">
              Delete
            </button>
          `
              : ''
          }
        </div>
        
        <!-- Reply form (hidden by default) -->
        <div class="reply-form" id="reply-form-${comment.id}" style="display: none;">
          <div class="reply-input-container">
            <input 
              type="text" 
              id="reply-input-${comment.id}" 
              class="reply-input" 
              placeholder="Write a reply..."
              maxlength="280"
              onkeypress="if(event.key === 'Enter') submitReply(${postId}, ${comment.id})"
            >
            <button class="reply-submit-btn" onclick="submitReply(${postId}, ${comment.id})">Send</button>
            <button class="reply-cancel-btn" onclick="cancelReply(${comment.id})">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add the comment to the list
  commentsList.insertAdjacentHTML('beforeend', commentHTML);
}

/* -------------------------------------------------------------------------- */
/*                            Reply Functionality                             */
/* -------------------------------------------------------------------------- */

function startReply(commentId: number, authorName: string): void {
  // Hide all other reply forms
  document.querySelectorAll('.reply-form').forEach((form) => {
    (form as HTMLElement).style.display = 'none';
  });

  // Show this reply form
  const replyForm = document.getElementById(`reply-form-${commentId}`);
  const replyInput = document.getElementById(
    `reply-input-${commentId}`
  ) as HTMLInputElement;

  if (replyForm && replyInput) {
    replyForm.style.display = 'block';
    replyInput.value = `@${authorName} `;
    replyInput.focus();
    // Set cursor at end
    replyInput.setSelectionRange(
      replyInput.value.length,
      replyInput.value.length
    );
  }
}

function cancelReply(commentId: number): void {
  const replyForm = document.getElementById(`reply-form-${commentId}`);
  const replyInput = document.getElementById(
    `reply-input-${commentId}`
  ) as HTMLInputElement;

  if (replyForm && replyInput) {
    replyForm.style.display = 'none';
    replyInput.value = '';
  }
}

async function submitReply(
  postId: number,
  parentCommentId: number
): Promise<void> {
  const replyInput = document.getElementById(
    `reply-input-${parentCommentId}`
  ) as HTMLInputElement;
  const replyText = replyInput?.value.trim();

  if (!replyText) {
    replyInput?.focus();
    return;
  }

  if (replyText.length > 280) {
    alert('Reply is too long. Maximum 280 characters allowed.');
    return;
  }

  try {
    // Create reply using the createComment function with replyToId
    const response = await createComment(
      postId.toString(),
      replyText,
      parentCommentId.toString()
    );

    // Clear and hide reply form
    replyInput.value = '';
    cancelReply(parentCommentId);

    // Add the reply to the UI
    addCommentToUI(postId, {
      id: response.data.id,
      body: replyText,
      author: {
        name: getLocalItem('user') || 'You',
        email: '',
        avatar: null,
      },
      created: new Date().toISOString(),
      postId: postId.toString(),
      replyToId: parentCommentId.toString(),
      owner: getLocalItem('user') || '',
      updated: new Date().toISOString(),
    });

    // Update comment count
    const commentCountEl = document.querySelector(
      `[data-post-id="${postId}"].comment-btn .action-count-compact`
    );
    if (commentCountEl) {
      const currentCount = parseInt(commentCountEl.textContent || '0');
      commentCountEl.textContent = (currentCount + 1).toString();
    }

    showNotification('Reply added!', 'success');
  } catch (error: any) {
    console.error('Error creating reply:', error);
    alert('Failed to post reply. Please try again.');
  }
}

/* -------------------------------------------------------------------------- */
/*                           Delete Comment                                   */
/* -------------------------------------------------------------------------- */

async function deleteCommentFunction(
  postId: number,
  commentId: number
): Promise<void> {
  if (!confirm('Are you sure you want to delete this comment?')) {
    return;
  }

  try {
    await deleteComment(postId.toString(), commentId.toString());

    // Remove comment from UI with proper typing
    const commentElement = document.querySelector(
      `[data-comment-id="${commentId}"]`
    ) as HTMLElement;
    if (commentElement) {
      commentElement.style.opacity = '0';
      commentElement.style.transform = 'translateX(-20px)';
      setTimeout(() => commentElement.remove(), 300);
    }

    // Update comment count
    const commentCountEl = document.querySelector(
      `[data-post-id="${postId}"].comment-btn .action-count-compact`
    );
    if (commentCountEl) {
      const currentCount = parseInt(commentCountEl.textContent || '0');
      commentCountEl.textContent = Math.max(0, currentCount - 1).toString();
    }

    showNotification('Comment deleted!', 'success');
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    alert('Failed to delete comment. Please try again.');
  }
}

/* -------------------------------------------------------------------------- */
/*                          Reactions Functionality                           */
/* -------------------------------------------------------------------------- */

async function handleToggleReaction(
  postId: number,
  emoji: string
): Promise<void> {
  if (!isLoggedIn()) {
    alert('Please log in to react to posts.');
    return;
  }

  try {
    const wasAdded = await toggleReaction(postId.toString(), emoji);

    const reactionCount = document.querySelector(
      `[data-post-id="${postId}"].like-btn .action-count-compact`
    );
    if (reactionCount) {
      const currentCount = parseInt(reactionCount.textContent || '0');
      reactionCount.textContent = wasAdded
        ? (currentCount + 1).toString()
        : Math.max(0, currentCount - 1).toString();
    }

    const likeBtn = document.querySelector(
      `[data-post-id="${postId}"].like-btn`
    );
    if (likeBtn) {
      if (wasAdded) {
        likeBtn.classList.add('reacted');
      } else {
        likeBtn.classList.remove('reacted');
      }
    }
  } catch (error) {
    console.error('Error toggling reaction:', error);
    alert('Failed to react to post. Please try again.');
  }
}

function selectReaction(postId: number, emoji: string): void {
  handleToggleReaction(postId, emoji);

  // Hide reactions modal
  const reactionsModal = document.getElementById(`reactions-${postId}`);
  if (reactionsModal) {
    reactionsModal.style.display = 'none';
  }
}

function showReactionsModal(postId: number): void {
  const modal = document.getElementById(`reactions-${postId}`);
  if (modal) {
    modal.style.display = 'block';
  }
}

function hideReactionsModal(postId: number): void {
  setTimeout(() => {
    const modal = document.getElementById(`reactions-${postId}`);
    if (modal && !modal.matches(':hover')) {
      modal.style.display = 'none';
    }
  }, 200);
}

/* -------------------------------------------------------------------------- */
/*                           Full Post View                                   */
/* -------------------------------------------------------------------------- */

function viewFullPost(postId: number): void {
  const postElement = document.getElementById(`post-${postId}`);
  if (!postElement) return;

  const title =
    postElement.querySelector('.post-title-compact')?.textContent || '';
  const body = postElement.querySelector('.post-body')?.textContent || '';
  const author =
    postElement.querySelector('.author-name-compact')?.textContent || '';
  const time =
    postElement.querySelector('.post-time-compact')?.textContent || '';
  const mediaImg = postElement.querySelector(
    '.post-image-preview'
  ) as HTMLImageElement;

  const fullPostContent = document.getElementById('fullPostContent');
  if (!fullPostContent) return;

  fullPostContent.innerHTML = `
    <div class="full-post-view">
      <div class="full-post-header">
        <div class="author-info">
          <div class="author-avatar">
            ${author.charAt(0).toUpperCase()}
          </div>
          <div class="author-details">
            <h4 class="author-name">${author}</h4>
            <p class="post-time">${time}</p>
          </div>
        </div>
      </div>
      
      ${
        mediaImg
          ? `
        <div class="full-post-media">
          <img src="${mediaImg.src}" alt="${mediaImg.alt}" style="width: 100%; border-radius: 8px; margin: 1rem 0;">
        </div>
      `
          : ''
      }
      
      <div class="full-post-content">
        ${title ? `<h2>${title}</h2>` : ''}
        <div class="post-text">${body}</div>
      </div>
      
      <div class="full-post-actions">
        <button class="btn btn-secondary" onclick="toggleComments(${postId}); closeFullPostModal();">
          View Comments
        </button>
      </div>
    </div>
  `;

  const modal = document.getElementById('fullPostModal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

function closeFullPostModal(): void {
  const modal = document.getElementById('fullPostModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

/* -------------------------------------------------------------------------- */
/*                          Utility Functions                                */
/* -------------------------------------------------------------------------- */

function showNotification(
  message: string,
  type: 'success' | 'error' | 'info' = 'info'
): void {
  const notification = document.createElement('div');
  notification.className = `notification ${type}-notification`;
  notification.innerHTML = `
    <div class="notification-content">
      ${message}
    </div>
  `;
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
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}
