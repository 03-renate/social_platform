/**
 * @file ProfilePage.ts
 * @description SPA Profile Page component template and logic.
 */

export function renderProfilePage(root: HTMLElement) {
  root.innerHTML = `
    <div class="profile-container">
      <div class="profile-header-bg"></div>

      <div class="profile-content">
        <div class="profile-info">
          <div class="profile-avatar-wrapper">
            <div class="profile-avatar">
              <img src="https://ui-avatars.com/api/?name=John+Doe&background=3b82f6&color=fff&size=128" 
                   alt="Profile" class="profile-avatar-img" />
            </div>
          </div>

          <div class="profile-header">
            <h1 class="profile-name">JOHN DOE</h1>
            <button class="back-btn" id="back-btn">go back <i class="fa-solid fa-arrow-right"></i></button>
          </div>

          <p class="profile-username">@johndoe</p>

          <div class="profile-bio">
            <p>Full-stack developer passionate about creating amazing web experiences.</p>
            <p>Love working with React, Node.js, and exploring new technologies.</p>
            <p>Always learning, always building! 🚀</p>
          </div>

          <div class="profile-meta">
            <span>San Francisco, CA</span>
            <span class="separator">·</span>
            <a href="#" class="profile-link">johndoe.dev</a>
            <span class="separator">·</span>
            <span>Joined March 2022</span>
          </div>

          <div class="profile-stats">
            <div class="stat">
              <span class="stat-number">367</span>
              <span class="stat-label">Following</span>
            </div>
            <div class="stat">
              <span class="stat-number">1 248</span>
              <span class="stat-label">Followers</span>
            </div>
            <div class="stat">
              <span class="stat-number">142</span>
              <span class="stat-label">Posts</span>
            </div>
          </div>

          <div class="profile-tabs-wrapper">
            <nav class="profile-tabs">
              <button class="tab active">Posts</button>
              <button class="tab">Replies</button>
              <button class="tab">Media</button>
              <button class="tab">Likes</button>
            </nav>
          </div>
        </div>
      </div>

      <div class="profile-content-area" id="contentArea">
        <p>Posts will appear here...</p>
      </div>
    </div>
  `;

  // Tabs switching
  const navTabs = root.querySelectorAll('.tab');
  if (navTabs.length > 0) {
    navTabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        navTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const contentArea = root.querySelector('#contentArea');
        const tabNames = ['Posts', 'Replies', 'Media', 'Likes'];
        if (contentArea) {
          contentArea.innerHTML = `<p>${tabNames[index]} will appear here...</p>`;
        }
      });
    });
  }
}
