/**
 * @file NotFoundPage.ts
 * @description This file contains the NotFoundPage component which is displayed when a user navigates to a route that does not exist.
 * @author Your Name
 */

export default async function NotFoundPage() {
  return `
    <div class="not-found-page">
      <div class="not-found-container">
        <!-- Animated 404 Illustration -->
        <div class="error-illustration">
          <div class="floating-astronaut">
            <div class="astronaut">
              <div class="helmet">
                <div class="helmet-glass"></div>
                <div class="helmet-reflection"></div>
              </div>
              <div class="body"></div>
              <div class="arm arm-left"></div>
              <div class="arm arm-right"></div>
              <div class="leg leg-left"></div>
              <div class="leg leg-right"></div>
            </div>
          </div>
          
          <!-- Floating planets and stars -->
          <div class="space-elements">
            <div class="planet planet-1"></div>
            <div class="planet planet-2"></div>
            <div class="planet planet-3"></div>
            <div class="star star-1">✦</div>
            <div class="star star-2">✧</div>
            <div class="star star-3">✦</div>
            <div class="star star-4">✧</div>
            <div class="star star-5">✦</div>
          </div>
          
          <!-- Large 404 Number -->
          <div class="error-code">
            <span class="digit digit-4">4</span>
            <span class="digit digit-0">0</span>
            <span class="digit digit-4-2">4</span>
          </div>
        </div>

        <!-- Error Content -->
        <div class="error-content">
          <h1 class="error-title">Oops! Page Not Found</h1>
          <p class="error-description">
            Looks like this page decided to take a trip to space! 🚀<br>
            Don't worry, our astronaut is looking for it.
          </p>
          
          <!-- Action Buttons -->
          <div class="error-actions">
            <button class="btn btn-primary" onclick="event.preventDefault();
             history.pushState({path: '/'}, '', '/'); 
             renderRoute('/');">
              🏠 Back to Home
            </button>
        
          </div>
          
          <!-- Fun Facts -->
          <div class="fun-fact">
            <p>🌌 Fun Fact: There are over 100 billion stars in our galaxy!</p>
          </div>
        </div>
      </div>
    </div>
  `;
}
