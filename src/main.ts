import "./style.css";
import { renderRoute } from "./router";

// Make renderRoute globally available
(window as any).renderRoute = renderRoute;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Handle initial route
  renderRoute();
  
  // Handle browser navigation (back/forward buttons)
  window.addEventListener('popstate', () => {
    renderRoute();
  });
});