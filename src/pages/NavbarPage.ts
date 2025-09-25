/**
 * @file NavbarPage.ts
 * @description Navigation bar component with brand name, search functionality, and navigation buttons
 * @author Your Name
 */

import { renderRoute } from '../router';
import { isLoggedIn, logout } from '../utils/auth';
import {
  getAllPosts,
  getPublicPosts,
  type NoroffPost,
} from '../services/posts/posts';

// TypeScript interfaces and types for NavbarPage
export interface NavbarElements {
  feedBtn: HTMLElement | null;
  profileBtn: HTMLElement | null;
  loginBtn: HTMLElement | null;
  logoutBtn: HTMLElement | null;
  searchBtn: HTMLElement | null;
  searchInput: HTMLInputElement | null;
  mobileToggle: HTMLElement | null;
}

export interface SearchHandler {
  onSearch: (query: string) => void;
}

export interface NavbarConfig {
  brandName: string;
  searchPlaceholder: string;
  showSearch: boolean;
  showMobileMenu: boolean;
}

export interface NavbarState {
  isLoggedIn: boolean;
  currentPath: string;
}

export interface NotificationConfig {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export type NavbarEventHandler = (event: Event) => void;
export type NavigationRoute = '/' | '/feed' | '/profile' | '/register';
export type NavbarTheme = 'light' | 'dark' | 'auto';

export default function NavbarPage() {
  const userLoggedIn = isLoggedIn();

  return `
    <nav class="navbar">
      <div class="navbar-container">
        <!-- Brand/Logo Section -->
        <div class="navbar-brand">
          <h1 class="brand-name">Social Media</h1>
        </div>

        <!-- Search Bar Section -->
        <div class="navbar-search">
          <div class="search-container">
            <input 
              type="text" 
              class="search-input" 
              placeholder="Search posts, users, or hashtags..." 
              id="navbar-search"
            />
            <button class="search-btn" id="search-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Navigation Links Section -->
        <div class="navbar-nav">
          <button class="nav-btn nav-feed" id="nav-feed">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9,22 9,12 15,12 15,22"></polyline>
            </svg>
            Feed
          </button>
          
          <button class="nav-btn nav-profile" id="nav-profile">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Profile
          </button>
          
          ${
            userLoggedIn
              ? `
            <button class="nav-btn nav-logout" id="nav-logout">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16,17 21,12 16,7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Logout
            </button>
          `
              : `
            <button class="nav-btn nav-login" id="nav-login">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10,17 15,12 10,7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              Login
            </button>
          `
          }
        </div>

        <!-- Mobile Menu Toggle -->
        <button class="mobile-menu-toggle" id="mobile-menu-toggle">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
      </div>
    </nav>
  `;
}

/**
 * Initialize navbar functionality
 * Sets up event listeners for navigation and search
 */
export function initNavbar() {
  // Navigation event listeners
  const feedBtn = document.getElementById('nav-feed');
  const profileBtn = document.getElementById('nav-profile');
  const loginBtn = document.getElementById('nav-login');
  const logoutBtn = document.getElementById('nav-logout');
  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById(
    'navbar-search'
  ) as HTMLInputElement;
  const mobileToggle = document.getElementById('mobile-menu-toggle');

  // Feed page navigation
  if (feedBtn) {
    feedBtn.addEventListener('click', (e) => {
      e.preventDefault();
      history.pushState({ path: '/feed' }, '', '/feed');
      renderRoute('/feed');
    });
  }

  // Profile page navigation
  if (profileBtn) {
    profileBtn.addEventListener('click', (e) => {
      e.preventDefault();
      history.pushState({ path: '/profile' }, '', '/profile');
      renderRoute('/profile');
    });
  }

  // Login page navigation
  if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      history.pushState({ path: '/' }, '', '/');
      renderRoute('/');
    });
  }

  // Logout functionality
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();

      // Show confirmation dialog
      if (confirm('Are you sure you want to logout?')) {
        // Clear authentication data
        logout();

        // Update navbar to show login button
        updateNavbarAfterLogout();

        // Navigate to login page
        history.pushState({ path: '/' }, '', '/');
        renderRoute('/');

        // Show success message
        showLogoutMessage();
      }
    });
  }

  // Enhanced Search functionality
  if (searchBtn && searchInput) {
    let allPosts: NoroffPost[] = [];

    // Load posts for search functionality
    const loadPostsForSearch = async () => {
      try {
        let postsResponse;
        if (isLoggedIn()) {
          // Authenticated users get personalized posts
          postsResponse = await getAllPosts(100, 1);
        } else {
          // Unauthenticated users get public posts
          postsResponse = await getPublicPosts(100, 1);
        }
        allPosts = postsResponse.data;
      } catch (error) {
        console.error('Error loading posts for search:', error);
        allPosts = [];
      }
    };

    // Load posts when page loads
    loadPostsForSearch();

    // Enhanced search input handler
    const handleSearchInput = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const searchTerm = target.value.toLowerCase().trim();

      if (searchTerm === '') {
        // Clear search - trigger reload of original feed
        (window as any).searchQuery = null;
        if (window.location.pathname === '/feed') {
          renderRoute('/feed');
        }
        return;
      }

      // Filter posts by content and author name
      const filteredPosts = allPosts.filter(
        (post) =>
          post.body.toLowerCase().includes(searchTerm) ||
          post.title.toLowerCase().includes(searchTerm) ||
          post.author.name.toLowerCase().includes(searchTerm)
      );

      // Store search results globally for FeedPage to use
      (window as any).searchQuery = searchTerm;
      (window as any).searchResults = filteredPosts;

      // Navigate to feed to show search results
      if (window.location.pathname !== '/feed') {
        history.pushState({ path: '/feed' }, '', '/feed');
      }
      renderRoute('/feed');
    };

    // Enhanced search button handler
    const handleSearchClick = () => {
      const query = searchInput.value.trim();
      if (query) {
        const syntheticEvent = { target: searchInput } as unknown as Event;
        handleSearchInput(syntheticEvent);
      }
    };

    // Add event listeners
    searchInput.addEventListener('input', handleSearchInput);
    searchBtn.addEventListener('click', handleSearchClick);

    // Enhanced keyboard shortcuts
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleSearchClick();
      }
    });
  }

  // Mobile menu toggle
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      const navbar = document.querySelector('.navbar');
      navbar?.classList.toggle('mobile-menu-open');
    });
  }

  // Enhanced Global Event Listeners
  setupGlobalEventListeners(searchInput);

  // Update active navigation based on current path
  updateActiveNav();

  // Make updateActiveNav available globally for route changes
  (window as any).updateActiveNav = updateActiveNav;
  (window as any).updateNavbarAfterLogout = updateNavbarAfterLogout;
}

/**
 * Setup enhanced global event listeners for keyboard shortcuts and interactions
 */
function setupGlobalEventListeners(searchInput: HTMLInputElement | null) {
  // Enhanced Event Listeners
  document.addEventListener('click', function (e) {
    // Close dropdowns when clicking outside
    if (!e.target || !(e.target as Element).closest('.dropdown')) {
      document.querySelectorAll('.dropdown-content').forEach((dropdown) => {
        dropdown.classList.remove('show');
      });
    }

    // Close modals when clicking outside
    if ((e.target as Element).classList?.contains('modal')) {
      if (typeof (window as any).closeModal === 'function') {
        (window as any).closeModal();
      }
      if (typeof (window as any).closeEditModal === 'function') {
        (window as any).closeEditModal();
      }
    }
  });

  // Enhanced Keyboard shortcuts
  document.addEventListener('keydown', function (e) {
    // Ctrl/Cmd + K for search focus
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }

    // Escape to clear search and close modals
    if (e.key === 'Escape') {
      // Clear search
      if (searchInput && document.activeElement === searchInput) {
        searchInput.value = '';
        searchInput.blur();
        // Clear search results
        (window as any).searchQuery = null;
        if (window.location.pathname === '/feed') {
          renderRoute('/feed');
        }
      }

      // Close modals
      if (typeof (window as any).closeModal === 'function') {
        (window as any).closeModal();
      }
      if (typeof (window as any).closeEditModal === 'function') {
        (window as any).closeEditModal();
      }

      // Close dropdowns
      document.querySelectorAll('.dropdown-content').forEach((dropdown) => {
        dropdown.classList.remove('show');
      });
    }

    // Ctrl/Cmd + Enter to submit post
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement?.id === 'newPostContent') {
        if (typeof (window as any).createPost === 'function') {
          (window as any).createPost();
        }
      } else if (activeElement?.id === 'editPostContent') {
        const editForm = document.getElementById(
          'editPostForm'
        ) as HTMLFormElement;
        if (editForm) {
          editForm.dispatchEvent(new Event('submit'));
        }
      }
    }
  });
}

/**
 * Update active navigation button based on current path
 */
function updateActiveNav() {
  const currentPath = window.location.pathname;
  const navButtons = document.querySelectorAll('.nav-btn');

  // Remove active class from all buttons
  navButtons.forEach((btn) => btn.classList.remove('active'));

  // Add active class to current page button
  if (currentPath === '/feed') {
    document.getElementById('nav-feed')?.classList.add('active');
  } else if (currentPath === '/profile') {
    document.getElementById('nav-profile')?.classList.add('active');
  } else if (currentPath === '/') {
    document.getElementById('nav-login')?.classList.add('active');
  }
}

/**
 * Update navbar after user logs out
 * Replaces logout button with login button
 */
function updateNavbarAfterLogout() {
  const navContainer = document.querySelector('.navbar-nav');
  if (navContainer) {
    // Remove existing navbar and recreate it
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      navbar.remove();
    }

    // Re-add updated navbar
    const newNavbar = NavbarPage();
    document.body.insertAdjacentHTML('afterbegin', newNavbar);

    // Re-initialize navbar
    initNavbar();
  }
}

/**
 * Show logout success message
 */
function showLogoutMessage() {
  // Create temporary notification
  const notification = document.createElement('div');
  notification.className = 'logout-notification';
  notification.innerHTML = `
    <div class="notification-content">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 12l2 2 4-4"></path>
        <circle cx="12" cy="12" r="9"></circle>
      </svg>
      Successfully logged out!
    </div>
  `;

  document.body.appendChild(notification);

  // Remove notification after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}
