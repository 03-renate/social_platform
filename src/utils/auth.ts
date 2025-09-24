/**
 * @file auth.ts
 * @description Authentication utilities for managing user login state
 * @author Your Name
 */

import { getLocalItem } from './storage';

/**
 * Check if user is currently logged in
 */
export function isLoggedIn(): boolean {
  const accessToken = getLocalItem('accessToken');
  return !!accessToken;
}

/**
 * Get current user data
 */
export function getCurrentUser() {
  return {
    accessToken: getLocalItem('accessToken'),
    user: getLocalItem('user'),
    apiKey: getLocalItem('apiKey'),
  };
}

/**
 * Clear all authentication data (logout)
 */
export function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  localStorage.removeItem('apiKey');
}

/**
 * Check if access token is expired (basic check)
 */
export function isTokenExpired(): boolean {
  const token = getLocalItem('accessToken');
  if (!token) return true;

  try {
    // Basic JWT expiration check
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch {
    return true; // If we can't parse the token, consider it expired
  }
}
