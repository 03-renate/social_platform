/**
 * @file LogInPage.ts
 * @description This file contains the Log In Page component with proper authentication.
 * @author [Your Name]
 */

import { renderRoute } from '../router';
import { loginUser, fetchApiKey } from '../services/api/client.js';
import { setLocalItem } from '../utils/storage.js';
import type {
  LoginCredentials,
  ApiResponse,
  LoginResponse,
} from '../types/index.js';

export default async function LoginPage() {
  // Set up event listeners after DOM is updated
  setTimeout(() => {
    const form = document.getElementById('loginForm') as HTMLFormElement;
    if (form) {
      const submitBtn = form.querySelector(
        "button[type='submit']"
      ) as HTMLButtonElement;

      form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const emailInput = document.getElementById(
          'loginEmail'
        ) as HTMLInputElement;
        const passwordInput = document.getElementById(
          'loginPassword'
        ) as HTMLInputElement;
        const formError = document.getElementById('loginMessage');

        if (!emailInput || !passwordInput) {
          console.error('Form inputs not found');
          return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Reset previous messages
        if (formError) {
          formError.textContent = '';
          formError.style.color = 'red';
        }

        // Enhanced validation with specific error messages
        if (!email && !password) {
          if (formError)
            formError.textContent = 'Please enter both email and password.';
          return;
        }

        if (!email) {
          if (formError)
            formError.textContent = 'Please enter your email address.';
          return;
        }

        if (!password) {
          if (formError) formError.textContent = 'Please enter your password.';
          return;
        }

        // Email format validation
        if (!email.includes('@')) {
          if (formError)
            formError.textContent = 'Please enter a valid email address.';
          return;
        }

        // Noroff email validation
        if (!email.endsWith('@stud.noroff.no')) {
          if (formError)
            formError.textContent =
              'Please use your @stud.noroff.no email address.';
          return;
        }

        // Password length validation
        if (password.length < 8) {
          if (formError)
            formError.textContent =
              'Password must be at least 8 characters long.';
          return;
        }

        // Disable form during submission
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = '🔄 Signing In...';
        }

        // Show loading screen during authentication
        const loadingScreen = (window as any).loadingScreen;
        if (loadingScreen) {
          loadingScreen.showWithMessage('Authenticating...');
        }

        const loginData: LoginCredentials = { email, password };

        try {
          console.log('Attempting login with:', { email });
          const result: ApiResponse<LoginResponse> = await loginUser(loginData);

          if (result.errors && result.errors.length > 0) {
            // Handle API errors with specific messages
            const errorMessage = result.errors[0]?.message || 'Login failed.';

            if (formError) {
              // Provide more specific error messages based on API response
              if (errorMessage.toLowerCase().includes('email')) {
                formError.textContent =
                  ' Email address not found. Please check your email or register for an account.';
              } else if (errorMessage.toLowerCase().includes('password')) {
                formError.textContent =
                  ' Incorrect password. Please check your password and try again.';
              } else if (
                errorMessage.toLowerCase().includes('user') &&
                errorMessage.toLowerCase().includes('not')
              ) {
                formError.textContent =
                  ' No account found with this email. Please register first.';
              } else if (errorMessage.toLowerCase().includes('invalid')) {
                formError.textContent =
                  ' Invalid login credentials. Please check your email and password.';
              } else if (errorMessage.toLowerCase().includes('credentials')) {
                formError.textContent =
                  ' Invalid email or password. Please double-check your credentials.';
              } else {
                // Show the original API error message if we can't categorize it
                formError.textContent = ` ${errorMessage}`;
              }
            }
          } else if (result.data) {
            // Successful login
            const { accessToken, name } = result.data;

            if (accessToken) {
              setLocalItem('accessToken', accessToken);
            }
            if (name) {
              setLocalItem('user', name);
            }

            // Try to get API key
            try {
              const apikey = await fetchApiKey(accessToken);
              if (apikey) {
                setLocalItem('apiKey', apikey);
              }
            } catch (apiError) {
              console.warn('Failed to get API key:', apiError);
              // Continue anyway - API key is optional for basic functionality
            }

            // Show success message
            if (formError) {
              formError.style.color = 'green';
              formError.textContent =
                '✅ Login successful! Redirecting to your dashboard...';
            }

            // Refresh navbar to show logout button
            if (typeof (window as any).refreshNavbar === 'function') {
              (window as any).refreshNavbar();
            }

            // Redirect to feed page
            setTimeout(() => {
              history.pushState({ path: '/feed' }, '', '/feed');
              renderRoute('/feed');
            }, 1500);
          } else {
            // Unexpected response format
            if (formError) {
              formError.textContent = 'Unexpected response from server.';
            }
          }
        } catch (error) {
          console.error('Login error:', error);
          if (formError) {
            if (error instanceof TypeError && error.message.includes('fetch')) {
              formError.textContent =
                '🌐 Network error. Please check your internet connection and try again.';
            } else {
              formError.textContent =
                '⚠️ Something went wrong. Please try again in a moment.';
            }
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
            submitBtn.textContent = '🚀 Sign In';
          }
        }
      });
    }

    // Handle register link
    const registerLink = document.getElementById('register-link');
    if (registerLink) {
      registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        history.pushState({ path: '/register' }, '', '/register');
        renderRoute('/register');
      });
    }
  }, 0);

  return `
    <div class="page active" id="loginPage">
        <div class="auth-container">
            <div class="auth-card">
                <h1>Welcome Back</h1>
                <div id="loginMessage" class="auth-message"></div>
                <form id="loginForm">
                    <div class="form-group">
                        <label for="loginEmail">Email Address</label>
                        <input type="email" id="loginEmail" class="form-control" placeholder="Enter your @stud.noroff.no email" required>
                    </div>
                    <div class="form-group">
                        <label for="loginPassword">Password</label>
                        <input type="password" id="loginPassword" class="form-control" placeholder="Enter your password" required>
                    </div>
                    <button type="submit" class="btn btn-primary auth-submit-btn">
                        🚀 Sign In
                    </button>
                </form>
                
                <div class="login-tips">
                    <div class="login-tips-title"><strong>💡 Login Tips:</strong></div>
                    <ul>
                        <li>Use your @stud.noroff.no email address</li>
                        <li>Password must be at least 8 characters</li>
                        <li>Make sure you've registered an account first</li>
                    </ul>
                </div>
                
                <div class="auth-links">
                    <p>Don't have an account? <a href="#" id="register-link">Create one here</a></p>
                    
                </div>
        </div>
    </div>
  `;
}
