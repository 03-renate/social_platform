/**
 * @file FeedPage.ts
 * @description This file contains the Feed Page component.
 * It displays a feed of posts for the home page.
 * @author Your Name
 */

import { renderRoute } from '../router';

export default async function FeedPage() {
  // Set up navigation event listeners after DOM is rendered
  setTimeout(() => {
    const loginBtn = document.getElementById('nav-login');
    const registerBtn = document.getElementById('nav-register');
    const profileBtn = document.getElementById('nav-profile');
    const ctaRegisterBtn = document.getElementById('cta-register');
    const ctaLoginBtn = document.getElementById('cta-login');

    if (loginBtn) {
      loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        history.pushState({ path: '/login' }, '', '/login');
        renderRoute('/login');
      });
    }

    if (registerBtn) {
      registerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        history.pushState({ path: '/register' }, '', '/register');
        renderRoute('/register');
      });
    }

    if (profileBtn) {
      profileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        history.pushState({ path: '/profile' }, '', '/profile');
        renderRoute('/profile');
      });
    }

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
      <!-- Navigation Bar -->
      <nav class="navbar">
        <div class="navbar-container">
          <div class="navbar-brand">
            <h2>🌐 Social Platform</h2>
          </div>
          <div class="navbar-menu">
            <a href="/login" id="nav-login" class="nav-item">
              <span class="nav-icon">🔑</span>
              <span class="nav-text">Login</span>
            </a>
            <a href="/register" id="nav-register" class="nav-item">
              <span class="nav-icon">✨</span>
              <span class="nav-text">Register</span>
            </a>
            <a href="/profile" id="nav-profile" class="nav-item">
              <span class="nav-icon">👤</span>
              <span class="nav-text">Profile</span>
            </a>
          </div>
        </div>
      </nav>

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
