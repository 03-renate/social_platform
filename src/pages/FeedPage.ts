/**
 * @file FeedPage.ts
 * @description This file contains the Feed Page component.
 * It displays a feed of posts for the home page.
 * @author Your Name
 */

import { renderRoute } from '../router';

export default async function FeedPage() {
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
