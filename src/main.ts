import './style.css';
import { renderRoute } from './router';
import LoadingScreen from './pages/LoadingScreen.js';
import NavbarPage, { initNavbar } from './pages/NavbarPage.js';

// Initialize loading screen
const loadingScreen = new LoadingScreen();

// Function to refresh navbar after login/logout
function refreshNavbar() {
  const existingNavbar = document.querySelector('.navbar');
  if (existingNavbar) {
    existingNavbar.remove();
  }

  // Add updated navbar
  const navbar = NavbarPage();
  document.body.insertAdjacentHTML('afterbegin', navbar);

  // Re-initialize navbar functionality
  initNavbar();
}

// Make renderRoute, loadingScreen, and refreshNavbar globally available
(window as any).renderRoute = renderRoute;
(window as any).loadingScreen = loadingScreen;
(window as any).refreshNavbar = refreshNavbar;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Add navbar to the page
  const navbar = NavbarPage();
  document.body.insertAdjacentHTML('afterbegin', navbar);

  // Initialize navbar functionality with a small delay to ensure DOM is ready
  setTimeout(() => {
    initNavbar();
  }, 100);

  // Handle initial route
  renderRoute();

  // Handle browser navigation (back/forward buttons)
  window.addEventListener('popstate', () => {
    renderRoute();
    // Update active nav state when navigating
    setTimeout(() => {
      if (typeof (window as any).updateActiveNav === 'function') {
        (window as any).updateActiveNav();
      }
    }, 100);
  });
});


function navigateToProfile(username: string) {
  if (!username || username === 'Unknown') return;

  const url = `/profile?user=${username}`;
  history.pushState({ path: url }, '', url);
  (window as any).renderRoute('/profile');
}

// Make it globally available
(window as any).navigateToProfile = navigateToProfile;
