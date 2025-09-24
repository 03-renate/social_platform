import './style.css';
import { renderRoute } from './router';
import LoadingScreen from './pages/LoadingScreen.js';

// Initialize loading screen
const loadingScreen = new LoadingScreen();

// Make renderRoute and loadingScreen globally available
(window as any).renderRoute = renderRoute;
(window as any).loadingScreen = loadingScreen;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Handle initial route
  renderRoute();

  // Handle browser navigation (back/forward buttons)
  window.addEventListener('popstate', () => {
    renderRoute();
  });
});
