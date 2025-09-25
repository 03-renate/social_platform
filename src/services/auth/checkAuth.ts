/**
 * @file checkAuth.ts
 * @description This file is intended to be a template or placeholder for the authentication checking service of the application. It is currently empty and serves as a reminder to implement the authentication checking functionality in the future.
 * @author []
 */

// import { post } from "./apiClient.js";

const ACCESS_TOKEN = 'accessToken';
// const LOGIN_ENDPOINT = "/auth/login";

/**
 * Checks if the user is currently logged in by verifying the presence of an access token.
 *
 * @returns {boolean} Returns true if an access token exists, indicating the user is logged in; otherwise, false.
 */
export function isUserLoggedIn() {
  const token = localStorage.getItem(ACCESS_TOKEN);
  return !!token; // The !! converts a value to a strict boolean
}

/**
 * Logs in a user.
 * @param {object} _credentials The user's email and password.
 * @returns {Promise<object>} The user profile data.
 */
export async function loginUser(_credentials) {
  // TODO: https://lms.noroff.no/mod/book/view.php?id=123585&chapterid=61404
}

export function getAccessToken() {
  return getLocalItem(ACCESS_TOKEN);
}
