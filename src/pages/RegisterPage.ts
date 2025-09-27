/**
 * @file RegisterPage.ts
 * @description This file is intended to be a template for creating a registration page in a web application.
 * It includes the necessary imports and a basic structure for the registration page component.
 * @author Your Name
 */

/**
 * @file RegisterPage.ts
 * @description This file contains the registration page with proper validation and error handling.
 * @author Your Name
 */

import { registerUser } from '../services/api/client';
import { renderRoute } from '../router';
import type {
  RegisterData,
  ApiResponse,
  RegisterResponse,
} from '../types/index.js';

export default async function RegisterPage() {
  // Set up event listeners after DOM is updated
  setTimeout(() => {
    const form = document.getElementById('registerForm') as HTMLFormElement;
    if (form) {
      const submitBtn = form.querySelector(
        "button[type='submit']"
      ) as HTMLButtonElement;

      form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const nameInput = document.getElementById(
          'registerName'
        ) as HTMLInputElement;
        const emailInput = document.getElementById(
          'registerEmail'
        ) as HTMLInputElement;
        const passwordInput = document.getElementById(
          'registerPassword'
        ) as HTMLInputElement;
        const bioInput = document.getElementById(
          'registerBio'
        ) as HTMLTextAreaElement;
        const formError = document.getElementById('registerMessage');

        if (!nameInput || !emailInput || !passwordInput) {
          console.error('Form inputs not found');
          return;
        }

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const bio = bioInput?.value?.trim() || undefined;

        // Reset previous messages
        if (formError) {
          formError.textContent = '';
          formError.style.color = 'red';
        }

        let hasError = false;

        // Validation
        if (!name) {
          if (formError) formError.textContent = 'Name is required.';
          hasError = true;
        } else if (name.length < 2) {
          if (formError)
            formError.textContent = 'Name must be at least 2 characters long.';
          hasError = true;
        }

        if (!email) {
          if (formError) formError.textContent = 'Email is required.';
          hasError = true;
        } else if (!email.endsWith('@stud.noroff.no')) {
          if (formError)
            formError.textContent =
              'Email must be a valid @stud.noroff.no address.';
          hasError = true;
        }

        if (!password) {
          if (formError) formError.textContent = 'Password is required.';
          hasError = true;
        } else if (password.length < 8) {
          if (formError)
            formError.textContent =
              'Password must be at least 8 characters long.';
          hasError = true;
        }

        if (hasError) return;

        // Disable form during submission
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = '🔄 Creating Account...';
        }

        // Show loading screen during registration
        const loadingScreen = (window as any).loadingScreen;
        if (loadingScreen) {
          loadingScreen.showWithMessage('Creating your account...');
        }

        try {
          console.log('Attempting registration with:', { name, email });

          // Prepare registration data
          const registrationData: RegisterData = {
            name,
            email,
            password,
            ...(bio && { bio }), // Only include bio if it's provided
          };

          const result: ApiResponse<RegisterResponse> =
            await registerUser(registrationData);

          if (result.errors && result.errors.length > 0) {
            // Handle API errors with specific messages
            const errorMessage =
              result.errors[0]?.message || 'Registration failed.';

            if (formError) {
              // Provide more specific error messages based on API response
              if (
                errorMessage.toLowerCase().includes('email') &&
                errorMessage.toLowerCase().includes('exist')
              ) {
                formError.textContent =
                  ' An account with this email already exists. Try logging in instead.';
              } else if (
                errorMessage.toLowerCase().includes('email') &&
                errorMessage.toLowerCase().includes('invalid')
              ) {
                formError.textContent =
                  ' Please enter a valid @stud.noroff.no email address.';
              } else if (errorMessage.toLowerCase().includes('password')) {
                formError.textContent =
                  " Password doesn't meet requirements. Use at least 8 characters.";
              } else if (errorMessage.toLowerCase().includes('name')) {
                formError.textContent =
                  ' Please enter a valid name (at least 2 characters).';
              } else if (errorMessage.toLowerCase().includes('already')) {
                formError.textContent =
                  ' This email is already registered. Please use the login page.';
              } else {
                // Show the original API error message if we can't categorize it
                formError.textContent = ` ${errorMessage}`;
              }
            }
          } else if (result.data) {
            // Successful registration
            if (formError) {
              formError.style.color = 'green';
              formError.textContent =
                '✅ Account created successfully! Redirecting to login page...';
            }

            // Clear form
            form.reset();

            // Redirect to login page after success
            setTimeout(() => {
              history.pushState({ path: '/' }, '', '/');
              renderRoute('/');
            }, 2000);
          } else {
            // Unexpected response format
            if (formError) {
              formError.textContent = 'Unexpected response from server.';
            }
          }
        } catch (error) {
          console.error('Registration error:', error);
          if (formError) {
            formError.textContent = 'Network error. Please try again.';
          }
        } finally {
          // Hide loading screen
          const loadingScreen = (window as any).loadingScreen;
          if (loadingScreen) {
            loadingScreen.hideLoadingScreen();
          }

          // Re-enable form
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '✨ Create Account';
          }
        }
      });
    }

    // Handle login link
    const loginLink = document.getElementById('login-link');
    if (loginLink) {
      loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        history.pushState({ path: '/' }, '', '/');
        renderRoute('/');
      });
    }
  }, 0);

  return `
    <div class="page active" id="registerPage">
        <div class="auth-container">
            <div class="auth-card">
                <h1>Join Social Platform</h1>
                <div id="registerMessage" class="auth-message"></div>
                <form id="registerForm">
                    <div class="form-group">
                        <label for="registerName">Full Name</label>
                        <input type="text" id="registerName" class="form-control" placeholder="Enter your full name" required>
                    </div>
                    <div class="form-group">
                        <label for="registerEmail">Email Address</label>
                        <input type="email" id="registerEmail" class="form-control" placeholder="Enter your @stud.noroff.no email" required>
                    </div>
                    <div class="form-group">
                        <label for="registerPassword">Password</label>
                        <input type="password" id="registerPassword" class="form-control" placeholder="Create a password (8+ characters)" required>
                    </div>
                    <div class="form-group">
                        <label for="registerBio">Bio (Optional)</label>
                        <textarea id="registerBio" class="form-control" rows="3" placeholder="Tell us about yourself..."></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary auth-submit-btn">
                        ✨ Create Account
                    </button>
                </form>
                <div class="auth-links">
                    <p>Already have an account? <a href="#" id="login-link">Sign in here</a></p>
                   
                </div>
            </div>
        </div>
    </div>
  `;
}
