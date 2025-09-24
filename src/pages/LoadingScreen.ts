/**
 * @file LoadingScreen.ts
 * @description Loading screen component with animated elements
 * @author [Your Name]
 */

export default class LoadingScreen {
  constructor() {
    this.init();
  }

  // Initialize the loading screen
  init() {
    this.createLoadingScreen();
  }

  // Create and inject the loading screen HTML
  createLoadingScreen() {
    const app = document.getElementById('js-app');
    if (!app) return;

    // Create loading screen HTML
    const loadingHTML = `
      <!-- Loading Screen -->
      <div id="loadingScreen" class="loading-screen hidden">
        <div class="loading-content">
          <div class="loading-logo">
            <div class="logo-icon">SP</div>
          </div>
          <div class="loading-text">SocialPro</div>
          <div class="loading-spinner">
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
          </div>
        </div>
        <div class="floating-elements">
          <div class="floating-element"></div>
          <div class="floating-element"></div>
          <div class="floating-element"></div>
          <div class="floating-element"></div>
          <div class="floating-element"></div>
        </div>
      </div>
    `;

    // Insert at the beginning of the app container
    app.insertAdjacentHTML('afterbegin', loadingHTML);
  }

  // Loading Screen Management
  showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.classList.remove('hidden');

      // Add floating elements animation
      this.animateFloatingElements();
    }
  }

  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
    }
  }

  animateFloatingElements() {
    const elements = document.querySelectorAll('.floating-element');
    elements.forEach((element, index) => {
      const htmlElement = element as HTMLElement;
      htmlElement.style.animationDelay = `${index * 0.5}s`;
    });
  }

  // Show loading screen for a specific duration
  showForDuration(duration: number = 2000): Promise<void> {
    return new Promise((resolve) => {
      this.showLoadingScreen();

      setTimeout(() => {
        this.hideLoadingScreen();
        resolve();
      }, duration);
    });
  }

  // Show loading screen with custom message
  showWithMessage(message: string) {
    this.showLoadingScreen();

    const loadingText = document.querySelector('.loading-text');
    if (loadingText) {
      loadingText.textContent = message;
    }
  }

  // Reset loading screen to default state
  reset() {
    const loadingText = document.querySelector('.loading-text');
    if (loadingText) {
      loadingText.textContent = 'SocialPro';
    }
    this.hideLoadingScreen();
  }
}
