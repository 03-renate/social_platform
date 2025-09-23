/**
 * @file NotFoundPage.ts
 * @description This file contains the NotFoundPage component which is displayed when a user navigates to a route that does not exist.
 * @author Your Name
 */

export default async function NotFoundPage() {
  return `
    <div class="not-found-page">
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <nav class="nav-links">
        <a href="/" onclick="event.preventDefault(); history.pushState({path: '/'}, '', '/'); renderRoute('/');">← Back to Home</a>
      </nav>
    </div>
  `;
}
