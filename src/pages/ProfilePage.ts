/**
 * @file ProfilePage.ts
 * @description SPA Profile Page component template and logic.
 */

export function renderProfilePage(root: HTMLElement) {
  root.innerHTML = `
    <div class="container mx-auto px-2 sm:px-4 py-8">
      <div class="bg-white shadow-lg rounded-lg overflow-hidden">
        <div class="gradient-bg h-32 relative"></div>
        <div class="relative px-4 sm:px-8 pb-6">
          <div class="absolute -top-16 left-4 sm:left-8">
            <div class="w-32 aspect-square bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
              <img src="https://ui-avatars.com/api/?name=John+Doe&background=8b5fbf&color=fff&size=128" alt="Profile" class="w-full h-full object-cover rounded-full" />
            </div>
          </div>
          <div class="flex justify-end pt-4">
            <button id="followBtn" class="bg-blue-400 hover:bg-blue-500 focus:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300">
              Follow
            </button>
          </div>
          <div class="mt-14 sm:mt-12">
            <h1 class="text-2xl font-bold text-gray-900 mb-1">JOHN DOE</h1>
            <p class="text-gray-500 mb-4">@johndoe</p>
            <div class="mb-4">
              <p class="text-gray-700 mb-1">Full-stack developer passionate about creating amazing web experiences.</p>
              <p class="text-gray-700 mb-1">Love working with React, Node.js, and exploring new technologies.</p>
              <p class="text-gray-700">Always learning, always building! 🚀</p>
            </div>
            <div class="flex flex-wrap items-center gap-2 text-gray-500 text-sm mb-4">
              <span>San Francisco, CA</span>
              <span class="hidden sm:inline">·</span>
              <a href="#" class="text-blue-600 hover:underline">johndoe.dev</a>
              <span class="hidden sm:inline">·</span>
              <span>Joined March 2022</span>
            </div>
            <div class="flex gap-6 mb-6">
              <div class="flex items-center gap-1">
                <span class="font-bold text-gray-900">367</span>
                <span class="text-gray-500">Following</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="font-bold text-gray-900">1 248</span>
                <span class="text-gray-500">Followers</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="font-bold text-gray-900">142</span>
                <span class="text-gray-500">Posts</span>
              </div>
            </div>
            <div class="border-b border-gray-200">
              <nav class="flex gap-4 sm:gap-8">
                <button class="nav-tab active py-3 px-1 border-b-2 border-blue-500 font-medium text-blue-600 bg-blue-50 rounded-t-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300">Posts</button>
                <button class="nav-tab py-3 px-1 border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300">Replies</button>
                <button class="nav-tab py-3 px-1 border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300">Media</button>
                <button class="nav-tab py-3 px-1 border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300">Likes</button>
              </nav>
            </div>
          </div>
        </div>
        <div class="px-4 sm:px-8 py-8 text-center text-gray-500" id="contentArea">
          <p>Posts will appear here...</p>
        </div>
      </div>
    </div>
  `;

  // Add event listeners after rendering
  const followBtn = root.querySelector('#followBtn') as HTMLButtonElement;
  const navTabs = root.querySelectorAll('.nav-tab');
  let isFollowing = false;

  if (followBtn) {
    followBtn.addEventListener('click', () => {
      isFollowing = !isFollowing;
      if (isFollowing) {
        followBtn.textContent = 'Following';
        followBtn.classList.remove('bg-blue-400', 'hover:bg-blue-500', 'text-white');
        followBtn.classList.add('bg-gray-200', 'hover:bg-gray-300', 'text-gray-700');
      } else {
        followBtn.textContent = 'Follow';
        followBtn.classList.remove('bg-gray-200', 'hover:bg-gray-300', 'text-gray-700');
        followBtn.classList.add('bg-blue-400', 'hover:bg-blue-500', 'text-white');
      }
    });
  }

  if (navTabs.length > 0) {
    navTabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        navTabs.forEach(t => {
          t.classList.remove('border-blue-500', 'text-blue-600', 'bg-blue-50', 'active');
          t.classList.add('border-transparent', 'text-gray-500');
        });

        tab.classList.remove('border-transparent', 'text-gray-500');
        tab.classList.add('border-blue-500', 'text-blue-600', 'bg-blue-50', 'active');

        // Update content based on selected tab
        const contentArea = root.querySelector('#contentArea');
        const tabNames = ['Posts', 'Replies', 'Media', 'Likes'];
        if (contentArea) {
          contentArea.innerHTML = `<p class="text-center text-gray-500">${tabNames[index]} will appear here...</p>`;
        }
      });
    });
  }
}