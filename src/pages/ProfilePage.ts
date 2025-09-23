/**
 * @file ProfilePage.ts
 * @description This file contains the Profile Page component.
 * @author Your Name
 */

export default async function ProfilePage() {
  return `
    <div class="profile-page">
      <h1>Profile Page</h1>
      <p>This is your profile page.</p>
      <nav class="nav-links">
        <a href="/" onclick="event.preventDefault(); history.pushState({path: '/'}, '', '/'); renderRoute('/');">← Back to Home</a>
      </nav>
    </div>
  `;
}
