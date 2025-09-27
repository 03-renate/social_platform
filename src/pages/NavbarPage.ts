/**
 * @file NavbarPage.ts
 * @description Navigation bar component with brand name, search functionality, and navigation buttons
 * @author Your Name
 */

import { renderRoute } from '../router';
import { isLoggedIn, logout } from '../utils/auth';

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
export type NavigationRoute = '/' | '/profile' | '/login' | '/register';
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
      history.pushState({ path: '/' }, '', '/');
      renderRoute('/');
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
      history.pushState({ path: '/login' }, '', '/login');
      renderRoute('/login');
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

        // Navigate to feed page
        history.pushState({ path: '/' }, '', '/');
        renderRoute('/');

        // Show success message
        showLogoutMessage();
      }
    });
  }

  // Search functionality - Local filtering search as you type
  if (searchBtn && searchInput) {
    const searchButton = searchBtn as HTMLButtonElement;
    
    // Real-time local search as user types
    const performLocalSearch = (query: string) => {
      if (query.length === 0) {
        // Clear search and reload posts
        delete (window as any).searchResults;
        delete (window as any).filteredPosts;
        
        // Clear search input styling
        searchInput.style.background = '';
        searchInput.style.opacity = '';
        
        // Reload original posts if on feed page
        if (window.location.pathname === '/' || window.location.pathname === '/feed') {
          history.pushState({ path: '/feed' }, '', '/feed');
          renderRoute('/feed');
        }
        return;
      }

      // Get all posts from the current page
      const allPosts = (window as any).allPosts || [];
      
      if (allPosts.length === 0) {
        // No posts loaded yet
        return;
      }

      // Filter posts locally
      const filteredPosts = allPosts.filter((post: any) => 
        post.body?.toLowerCase().includes(query.toLowerCase()) ||
        post.title?.toLowerCase().includes(query.toLowerCase()) ||
        post.author?.name?.toLowerCase().includes(query.toLowerCase()) ||
        post.tags?.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase()))
      );

      // Store filtered results globally
      (window as any).searchResults = {
        query: query,
        results: filteredPosts,
        timestamp: Date.now()
      };
      (window as any).filteredPosts = filteredPosts;

      // Show search styling
      searchInput.style.background = 'var(--bg-glass)';
      searchInput.style.opacity = '0.9';

      // Update feed page with filtered results
      if (window.location.pathname === '/' || window.location.pathname === '/feed') {
        const searchUrl = `/feed?search=${encodeURIComponent(query)}`;
        history.pushState({ path: searchUrl }, '', searchUrl);
        renderRoute('/feed');
      } else {
        // Navigate to feed page with search results
        const searchUrl = `/feed?search=${encodeURIComponent(query)}`;
        history.pushState({ path: searchUrl }, '', searchUrl);
        renderRoute('/feed');
      }
    };

    // Handle input changes - immediate search (no debouncing for local search)
    searchInput.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value.toLowerCase().trim();
      performLocalSearch(query);
    });

    // Handle search button click
    searchButton.addEventListener('click', () => {
      const query = searchInput.value.trim();
      performLocalSearch(query);
    });

    // Handle Enter key
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        performLocalSearch(query);
      }
    });

    // Enhanced keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K for search focus
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
      
      // Escape to clear search
      if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.value = '';
        performLocalSearch('');
        searchInput.blur();
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

  // Update active navigation based on current path
  updateActiveNav();

  // Make updateActiveNav available globally for route changes
  (window as any).updateActiveNav = updateActiveNav;
  (window as any).updateNavbarAfterLogout = updateNavbarAfterLogout;
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
  if (currentPath === '/' || currentPath === '/feed') {
    document.getElementById('nav-feed')?.classList.add('active');
  } else if (currentPath === '/profile') {
    document.getElementById('nav-profile')?.classList.add('active');
  } else if (currentPath === '/login') {
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

/**
 * Show search message/notification
 */
function showSearchMessage(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
  const notification = document.createElement('div');
  notification.className = `search-notification ${type}`;
  
  // Icon based on type
  let icon = '';
  switch (type) {
    case 'success':
      icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 12l2 2 4-4"></path><circle cx="12" cy="12" r="9"></circle>
      </svg>`;
      break;
    case 'error':
      icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="9"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>`;
      break;
    case 'info':
      icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="9"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>`;
      break;
    default:
      icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path>
      </svg>`;
  }
  
  notification.innerHTML = `
    <div class="notification-content">
      ${icon}
      ${message}
    </div>
  `;

  // Add some basic styling
  notification.style.cssText = `
    position: fixed;
    top: 90px;
    right: 20px;
    background: var(--bg-glass);
    backdrop-filter: blur(20px);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: 1rem 1.5rem;
    color: var(--text-primary);
    box-shadow: var(--shadow-xl);
    z-index: 1001;
    animation: slideInFromRight 0.3s ease-out forwards;
    max-width: 300px;
  `;

  document.body.appendChild(notification);

  // Remove notification after 4 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideOutToRight 0.3s ease-out forwards';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }, 4000);
}
